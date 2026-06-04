import {
    implicadosTotales,
    conexionesMaestras,
    desbloqueoPorDia,
    VALERIA
} from '../structures/Personajes.js';

export class GrafoDia extends Phaser.Scene {

    constructor() {
        super('GrafoDia');
    }

    init(data = {}) {

        this.diaActual = data.diaActual || 1;

        this.algoritmo =
            this._normalizarAlgoritmo(
                this._algoritmoPorDia(this.diaActual)
            );

        this.casosDia =
            Array.isArray(data.casosDia)
                ? data.casosDia
                : [];

        this.siguienteEstado =
            data.siguienteEstado || {};

        this.volumenActual =
            typeof data.volumenActual === 'number'
                ? data.volumenActual
                : 0.7;

        this.nodos = [];
        this.aristas = [];
        this.adyacencia = {};

        this.nodosVisuales = [];
        this.aristasVisuales = [];

        this.radioNodo = 18;
        this.yaPuedeContinuar = false;
        this.ultimateCulpable = null;

        this.recorridoVistoBFS = false;
        this.recorridoVistoDFS = false;
        this.recorridoEnCurso = false;
        this.botonesRecorrido = [];

        this.opcionesUI = [];
        this.indiceUI = 0;
        this.estadoBotonesGamepad = {};
        this.modalAbierto = false;
        this.opcionesAntesModal = [];
        this.estadosGamepadPorPad = {};

    }

    preload() {

        const personajes =
            this._obtenerPersonajesVisibles();

        personajes.forEach(pj => {

            if (!pj || !pj.nombre) return;

            const key =
                this._obtenerClaveAvatar(pj);

            if (!this.textures.exists(key)) {
                this.load.image(
                    key,
                    `Personajes/${this._normalizarNombre(pj.nombre)}.png`
                );
            }

        });

        if (!this.cache.audio.exists('click')) {
            this.load.audio('click', 'music/click.mp3');
        }

        if (!this.cache.audio.exists('musicaGrafo')) {
            this.load.audio('musicaGrafo', 'music/b5.mp3')
        }

    }

    create() {

        this.cameras.main.setBackgroundColor('#031027');
        this.cameras.main.fadeIn(350, 0, 0, 0);

        this.musicaGrafo = this.sound.add('musicaGrafo', {
            volume: 0,
            loop: true
        });
        this.musicaGrafo.play();
        this.tweens.add({
            targets: this.musicaGrafo,
            volume: this.volumenActual,
            duration: 850,
            ease: 'Sine.easeOut'
        });

        this.crearFondo();
        this.crearTitulo();
        this.crearPanelAnalisis();
        this.crearTextoEstado();
        this.configurarControles();

        const culpables =
            this._obtenerPersonajesVisibles();

        if (culpables.length === 0) {
            this.mostrarSinDatos();
            return;
        }

        this.crearGrafo(culpables);
        this.dibujarGrafo();
        this.ejecutarAlgoritmoDelDia();

    }
    update() {
        this.actualizarControlesRK();
    }

    // =========================================================
    // CONFIGURACIÓN GENERAL
    // =========================================================

    _algoritmoPorDia(dia) {

        if (dia === 1) return 'BFS_DFS';
        if (dia === 2) return 'DIJKSTRA';
        if (dia === 3) return 'PRIM';
        if (dia === 4) return 'FORD';
        if (dia === 5) return 'MASTER';

        return 'MASTER';

    }

    _normalizarAlgoritmo(nombre = '') {

        const valor =
            String(nombre).toUpperCase().trim();

        if (
            valor === 'BFS'
            ||
            valor === 'DFS'
            ||
            valor === 'BFS_DFS'
        ) {
            return 'BFS_DFS';
        }

        if (valor === 'DIJKSTRA') return 'DIJKSTRA';
        if (valor === 'PRIM') return 'PRIM';

        if (
            valor === 'FORD'
            ||
            valor === 'FORD_FULKERSON'
        ) {
            return 'FORD';
        }

        if (
            valor === 'MASTER'
            ||
            valor === 'FINAL'
        ) {
            return 'MASTER';
        }

        return valor || 'MASTER';

    }

    _normalizarNombre(nombre = '') {

        return nombre
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '_');

    }

    _obtenerClaveAvatar(pj) {
        return `pj_${this._normalizarNombre(pj?.nombre || '')}`;
    }

    _idNodo(nombre = '') {
        return this._normalizarNombre(nombre);
    }

    _nombrePorId(id) {
        const nodo = this.nodos.find(n => n.id === id);
        return nodo ? nodo.nombre : id;
    }

    _nombresAcumulados() {

        const acumulados = [];

        const diaLimite =
            this.algoritmo === 'MASTER'
                ? 5
                : this.diaActual;

        if (
            typeof desbloqueoPorDia === 'undefined'
            ||
            !desbloqueoPorDia
        ) {
            return this.casosDia
                .filter(pj => pj && pj.nombre)
                .map(pj => pj.nombre);
        }

        for (let dia = 1; dia <= diaLimite; dia++) {

            const listaDia =
                desbloqueoPorDia[dia] || [];

            listaDia.forEach(nombre => {
                if (nombre && !acumulados.includes(nombre)) {
                    acumulados.push(nombre);
                }
            });

        }

        return acumulados;

    }

    _obtenerPersonajesVisibles() {

        const nombresVisibles =
            this._nombresAcumulados();

        const base =
            Array.isArray(implicadosTotales)
                ? implicadosTotales
                : this.casosDia;

        return base.filter(pj => {
            return (
                pj
                &&
                pj.nombre
                &&
                nombresVisibles.includes(pj.nombre)
            );
        });

    }

    _calcularRadioNodo(total) {

        if (total >= 21) return 13;
        if (total >= 17) return 14;
        if (total >= 14) return 15;
        if (total >= 10) return 17;
        if (total >= 7) return 19;
        if (total >= 5) return 21;

        return 25;

    }

    _partirRutaPorCantidad(lista, cantidad = 3) {

        const partes = [];

        for (let i = 0; i < lista.length; i += cantidad) {
            partes.push(
                lista
                    .slice(i, i + cantidad)
                    .join(' → ')
            );
        }

        return partes.join('\n');

    }

    _rutaCorta(lista, maximo = 4) {

        if (!Array.isArray(lista)) return '';

        if (lista.length <= maximo) {
            return lista.join(' → ');
        }

        return lista
            .slice(0, maximo)
            .join(' → ') + ' → ...';

    }

    _listaLimitada(lista, maximo = 4) {

        if (!Array.isArray(lista)) return '';

        if (lista.length <= maximo) {
            return lista.join('\n');
        }

        const visibles =
            lista.slice(0, maximo);

        visibles.push(`... y ${lista.length - maximo} más`);

        return visibles.join('\n');

    }

    _listaEnColumnas(lista, porColumna = 2) {

        if (!Array.isArray(lista))
            return '';

        const columnas = [];

        for (
            let i = 0;
            i < lista.length;
            i += porColumna
        ) {

            columnas.push(
                lista.slice(
                    i,
                    i + porColumna
                )
            );

        }

        const filas = Math.max(
            ...columnas.map(
                col => col.length
            )
        );

        const lineas = [];

        for (
            let fila = 0;
            fila < filas;
            fila++
        ) {

            const partes =
                columnas.map(col => {

                    const item =
                        col[fila] || '';

                    return item.padEnd(
                        18,
                        ' '
                    );

                });

            lineas.push(
                partes.join('   ')
            );

        }

        return lineas.join('\n');

    }


    // =========================================================
    // FONDO Y UI
    // =========================================================

    crearFondo() {

        this.add.rectangle(
            640,
            360,
            1280,
            720,
            0x031027,
            1
        );

        for (let i = 0; i < 70; i++) {

            const punto =
                this.add.circle(
                    Phaser.Math.Between(0, 1280),
                    Phaser.Math.Between(0, 720),
                    Phaser.Math.Between(1, 3),
                    0x7bb8ff,
                    Phaser.Math.FloatBetween(0.04, 0.16)
                );

            this.tweens.add({
                targets: punto,
                alpha: Phaser.Math.FloatBetween(0.03, 0.11),
                duration: Phaser.Math.Between(900, 1700),
                yoyo: true,
                repeat: -1
            });

        }

        this.areaGrafo = {
            left: 50,
            right: 1170,
            top: 125,
            bottom: 485
        };

        this.panelGrafo =
            this.add.rectangle(
                640,
                318,
                1220,
                420,
                0x041127,
                0.92
            );

        this.panelGrafo.setStrokeStyle(
            3,
            0x8dff9c,
            0.9
        );

        this.panelAnalisis =
            this.add.rectangle(
                640,
                628,
                1220,
                164,
                0x06122a,
                0.97
            );

        this.panelAnalisis.setStrokeStyle(
            2,
            0x5ea2ff,
            0.95
        );

    }

    crearTitulo() {

        const nombreAlgoritmo =
            this.algoritmo === 'BFS_DFS'
                ? 'RECORRIDOS BFS Y DFS'
                : this.algoritmo === 'DIJKSTRA'
                    ? 'RUTA SEGURA - DIJKSTRA'
                    : this.algoritmo === 'PRIM'
                        ? 'RECONSTRUCCIÓN DE RED - PRIM'
                        : this.algoritmo === 'FORD'
                            ? 'CONTROL DEL IMPACTO - FORD'
                            : 'MISIÓN FINAL - ANÁLISIS COMPLETO';

        this.add.text(
            640,
            38,
            `DÍA ${this.diaActual} - ${nombreAlgoritmo}`,
            {
                fontFamily: '"VT323", monospace',
                fontSize: '37px',
                color: '#ffffff',
                stroke: '#071022',
                strokeThickness: 6
            }
        ).setOrigin(0.5);

        this.add.text(
            640,
            70,
            'Mapa del caso: personas, relaciones y recorridos de investigación',
            {
                fontFamily: '"VT323", monospace',
                fontSize: '19px',
                color: '#d7e6ff'
            }
        ).setOrigin(0.5);

    }

    crearPanelAnalisis() {

        const esBFSDFS =
            this.algoritmo === 'BFS_DFS';

        if (esBFSDFS) {

            this.add.rectangle(285, 628, 2, 126, 0x2d6dcc, 0.8).setDepth(21);
            this.add.rectangle(710, 628, 2, 126, 0x2d6dcc, 0.8).setDepth(21);

            this.add.text(
                145,
                564,
                'ESTADÍSTICAS',
                {
                    fontFamily: '"VT323", monospace',
                    fontSize: '26px',
                    color: '#8dff9c'
                }
            ).setOrigin(0.5).setDepth(21);

            this.txtEstadisticas =
                this.add.text(
                    60,
                    580,
                    '',
                    {
                        fontFamily: '"VT323", monospace',
                        fontSize: '16px',
                        color: '#dcecff',
                        lineSpacing: 1,
                        wordWrap: { width: 195 }
                    }
                ).setDepth(21);

            this.lblBFS =
                this.add.text(
                    500,
                    564,
                    'BFS',
                    {
                        fontFamily: '"VT323", monospace',
                        fontSize: '26px',
                        color: '#8dff9c'
                    }
                ).setOrigin(0.5).setDepth(21);

            this.txtBFS =
                this.add.text(
                    315,
                    580,
                    '',
                    {
                        fontFamily: '"VT323", monospace',
                        fontSize: '15px',
                        color: '#d7ffd7',
                        lineSpacing: 1,
                        wordWrap: { width: 360 }
                    }
                ).setDepth(21);

            this.lblDFS =
                this.add.text(
                    960,
                    564,
                    'DFS',
                    {
                        fontFamily: '"VT323", monospace',
                        fontSize: '26px',
                        color: '#ffcfaa'
                    }
                ).setOrigin(0.5).setDepth(21);

            this.txtDFS =
                this.add.text(
                    740,
                    580,
                    '',
                    {
                        fontFamily: '"VT323", monospace',
                        fontSize: '15px',
                        color: '#ffe1ca',
                        lineSpacing: 1,
                        wordWrap: { width: 430 }
                    }
                ).setDepth(21);

            this.lblDetalle = null;
            this.lblAyuda = null;
            this.txtRecorrido = null;
            this.txtAyuda = null;

        }

        else {

            this.add.rectangle(275, 628, 2, 126, 0x2d6dcc, 0.8).setDepth(21);
            this.add.rectangle(760, 628, 2, 126, 0x2d6dcc, 0.8).setDepth(21);

            this.add.text(
                138,
                564,
                'ESTADÍSTICAS',
                {
                    fontFamily: '"VT323", monospace',
                    fontSize: '26px',
                    color: '#8dff9c'
                }
            ).setOrigin(0.5).setDepth(21);

            this.txtEstadisticas =
                this.add.text(
                    55,
                    580,
                    '',
                    {
                        fontFamily: '"VT323", monospace',
                        fontSize: '16px',
                        color: '#dcecff',
                        lineSpacing: 1,
                        wordWrap: { width: 195 }
                    }
                ).setDepth(21);

            this.lblDetalle =
                this.add.text(
                    515,
                    564,
                    'DETALLE DEL ALGORITMO',
                    {
                        fontFamily: '"VT323", monospace',
                        fontSize: '26px',
                        color: '#8dff9c'
                    }
                ).setOrigin(0.5).setDepth(21);

            this.txtRecorrido =
                this.add.text(
                    300,
                    580,
                    '',
                    {
                        fontFamily: '"VT323", monospace',
                        fontSize: '15px',
                        color: '#ffffff',
                        lineSpacing: 1,
                        wordWrap: { width: 430 }
                    }
                ).setDepth(21);

            this.lblAyuda =
                this.add.text(
                    1000,
                    564,
                    'AYUDA AL CASO',
                    {
                        fontFamily: '"VT323", monospace',
                        fontSize: '26px',
                        color: '#8dff9c'
                    }
                ).setOrigin(0.5).setDepth(21);

            this.txtAyuda =
                this.add.text(
                    790,
                    580,
                    '',
                    {
                        fontFamily: '"VT323", monospace',
                        fontSize: '16px',
                        color: '#dcecff',
                        lineSpacing: 2,
                        wordWrap: { width: 370 }
                    }
                ).setDepth(21);

            this.lblBFS = null;
            this.lblDFS = null;
            this.txtBFS = null;
            this.txtDFS = null;

        }

    }

    crearTextoEstado() {

        this.txtEstadoDinamico =
            this.add.text(
                640,
                508,
                '',
                {
                    fontFamily: '"VT323", monospace',
                    fontSize: '21px',
                    color: '#8dff9c',
                    align: 'center',
                    stroke: '#071022',
                    strokeThickness: 3
                }
            );

        this.txtEstadoDinamico.setOrigin(0.5);
        this.txtEstadoDinamico.setDepth(60);

    }

    // =========================================================
    // RK GAME / TECLADO
    // X = primer botón de recorrido
    // B = segundo botón de recorrido
    // R1 = continuar
    // =========================================================

    configurarControles() {
        this.teclas =
            this.input.keyboard.addKeys({
                ENTER: Phaser.Input.Keyboard.KeyCodes.ENTER,
                SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE,
                LEFT: Phaser.Input.Keyboard.KeyCodes.LEFT,
                RIGHT: Phaser.Input.Keyboard.KeyCodes.RIGHT,
                A: Phaser.Input.Keyboard.KeyCodes.A,
                D: Phaser.Input.Keyboard.KeyCodes.D,
                R: Phaser.Input.Keyboard.KeyCodes.R,
                X: Phaser.Input.Keyboard.KeyCodes.X,
                B: Phaser.Input.Keyboard.KeyCodes.B,
                Y: Phaser.Input.Keyboard.KeyCodes.Y,
                ESC: Phaser.Input.Keyboard.KeyCodes.ESC
            });

        this.estadoBotonesGamepad = {};
        this.estadosGamepadPorPad = {};

        try {
            if (this.input && this.input.gamepad) {
                if (typeof this.input.gamepad.start === 'function') {
                    this.input.gamepad.start();
                }

                if (typeof this.input.gamepad.startListeners === 'function') {
                    this.input.gamepad.startListeners();
                }
            }
        } catch (error) {
            console.warn('Gamepad no disponible en GrafoDia:', error);
        }
    }

    actualizarControlesRK() {
        if (!this.teclas) return;

        const inputMandos = this.leerInputTodosLosMandosGrafo();
        const estado = inputMandos.estado;
        const justDown = inputMandos.justDown;

        const izquierda =
            Phaser.Input.Keyboard.JustDown(this.teclas.LEFT)
            ||
            Phaser.Input.Keyboard.JustDown(this.teclas.A)
            ||
            justDown.izquierda;

        const derecha =
            Phaser.Input.Keyboard.JustDown(this.teclas.RIGHT)
            ||
            Phaser.Input.Keyboard.JustDown(this.teclas.D)
            ||
            justDown.derecha;

        const aceptar =
            Phaser.Input.Keyboard.JustDown(this.teclas.ENTER)
            ||
            Phaser.Input.Keyboard.JustDown(this.teclas.SPACE)
            ||
            justDown.a;

        const cerrar =
            Phaser.Input.Keyboard.JustDown(this.teclas.ESC)
            ||
            justDown.b;

        const presionarX =
            Phaser.Input.Keyboard.JustDown(this.teclas.X)
            ||
            justDown.x;

        const presionarB =
            Phaser.Input.Keyboard.JustDown(this.teclas.B)
            ||
            justDown.b;

        const presionarY =
            Phaser.Input.Keyboard.JustDown(this.teclas.Y)
            ||
            justDown.y;

        const continuarR1 =
            Phaser.Input.Keyboard.JustDown(this.teclas.R)
            ||
            justDown.r1;

        const volverL1 =
            justDown.l1;

        if (this.modalAbierto) {
            if (cerrar || aceptar || presionarB || volverL1) {
                this._activarSeleccionUI();
            }

            return;
        }

        if (continuarR1 && this.yaPuedeContinuar) {
            this.irASiguienteDia();
            return;
        }

        if (
            this.algoritmo === 'BFS_DFS'
            &&
            !this.recorridoEnCurso
        ) {
            if (
                presionarX
                &&
                this.botonesRecorrido
                &&
                this.botonesRecorrido[0]
                &&
                typeof this.botonesRecorrido[0].accion === 'function'
                &&
                this.botonesRecorrido[0].habilitado()
            ) {
                this.reproducirClickSeguro();
                this.botonesRecorrido[0].accion();
                return;
            }

            if (
                presionarB
                &&
                this.botonesRecorrido
                &&
                this.botonesRecorrido[1]
                &&
                typeof this.botonesRecorrido[1].accion === 'function'
                &&
                this.botonesRecorrido[1].habilitado()
            ) {
                this.reproducirClickSeguro();
                this.botonesRecorrido[1].accion();
                return;
            }
        }

        /*
            En día 5:
            Y también puede abrir conclusiones si el botón existe.
        */
        if (
            presionarY &&
            this.algoritmo === 'MASTER' &&
            this.opcionesUI &&
            this.opcionesUI.length > 1
        ) {
            const botonConclusiones = this.opcionesUI.find(op => {
                return op && op.label && op.label.text === 'CONCLUSIONES';
            });

            if (
                botonConclusiones &&
                typeof botonConclusiones.accion === 'function' &&
                botonConclusiones.habilitado()
            ) {
                this.reproducirClickSeguro();
                botonConclusiones.accion();
                return;
            }
        }

        if (izquierda) {
            this._moverSeleccionUI(-1);
        }

        if (derecha) {
            this._moverSeleccionUI(1);
        }

        if (aceptar) {
            this._activarSeleccionUI();
        }
    }

    reproducirClickSeguro() {

        if (this.cache.audio.exists('click')) {
            this.sound.play('click', {
                volume: 0.35
            });
        }

    }

    obtenerMandosGrafo() {
        let pads = [];

        if (navigator.getGamepads) {
            pads = Array.from(navigator.getGamepads())
                .filter(pad => pad !== null && pad !== undefined);
        }

        if (pads.length === 0 && this.input && this.input.gamepad) {
            const manager = this.input.gamepad;

            if (typeof manager.getAll === 'function') {
                pads = manager.getAll();
            } else if (Array.isArray(manager.gamepads)) {
                pads = manager.gamepads;
            } else {
                if (manager.pad1) pads.push(manager.pad1);
                if (manager.pad2) pads.push(manager.pad2);
                if (manager.pad3) pads.push(manager.pad3);
                if (manager.pad4) pads.push(manager.pad4);
            }
        }

        return pads.filter(pad => pad !== null && pad !== undefined);
    }

    _obtenerIdPadGrafo(pad, index) {
        if (!pad) return `pad_${index}`;

        const slot =
            typeof pad.index === 'number'
                ? pad.index
                : index;

        return `slot_${slot}`;
    }

    _crearEstadoVacioGrafo() {
        return {
            l1: false,
            r1: false,
            a: false,
            b: false,
            x: false,
            y: false,
            arriba: false,
            abajo: false,
            izquierda: false,
            derecha: false
        };
    }

    leerInputTodosLosMandosGrafo() {
        const pads = this.obtenerMandosGrafo();

        const estadoFinal = this._crearEstadoVacioGrafo();
        const justDownFinal = this._crearEstadoVacioGrafo();

        if (!this.estadosGamepadPorPad) {
            this.estadosGamepadPorPad = {};
        }

        pads.forEach((pad, index) => {
            const idPad = this._obtenerIdPadGrafo(pad, index);
            const estadoActual = this.leerEstadoMandoGrafo(pad);

            const estadoAnterior =
                this.estadosGamepadPorPad[idPad] ||
                this._crearEstadoVacioGrafo();

            Object.keys(estadoFinal).forEach(key => {
                estadoFinal[key] =
                    estadoFinal[key] ||
                    estadoActual[key];

                justDownFinal[key] =
                    justDownFinal[key] ||
                    (estadoActual[key] && !estadoAnterior[key]);
            });

            this.estadosGamepadPorPad[idPad] = { ...estadoActual };
        });

        return {
            estado: estadoFinal,
            justDown: justDownFinal,
            cantidadMandos: pads.length,
            mandos: pads
        };
    }

    leerEstadoMandoGrafo(pad) {
        const ejeX = this.leerEjeGrafo(pad, 0);
        const ejeY = this.leerEjeGrafo(pad, 1);

        const esPlay = this._esMandoPlayGrafo(pad);

        if (esPlay) {
            return {
                /*
                    PlayStation:
                    X/Cruz = A = 0
                    Círculo = B = 1
                    Cuadrado = X = 2
                    Triángulo = Y = 3
                    L1 = 4
                    R1 = 5
                */

                l1: this.botonGrafo(pad, 4),
                r1: this.botonGrafo(pad, 5),

                a: this.botonGrafo(pad, 0),
                b: this.botonGrafo(pad, 1),
                x: this.botonGrafo(pad, 2),
                y: this.botonGrafo(pad, 3),

                izquierda:
                    ejeX < -0.45 ||
                    this.botonGrafo(pad, 14),

                derecha:
                    ejeX > 0.45 ||
                    this.botonGrafo(pad, 15),

                arriba:
                    ejeY < -0.45 ||
                    this.botonGrafo(pad, 12),

                abajo:
                    ejeY > 0.45 ||
                    this.botonGrafo(pad, 13)
            };
        }

        return {
            /*
                RK Game:
                A = seleccionar
                B = segundo botón / cerrar modal
                X = primer botón
                Y = conclusiones
                L1 = volver/cerrar
                R1 = continuar
            */

            l1:
                this.botonGrafo(pad, 6),

            r1:
                this.botonGrafo(pad, 5) ||
                this.botonGrafo(pad, 7),

            a: this.botonGrafo(pad, 0),

            b: this.botonGrafo(pad, 1),

            x:
                this.botonGrafo(pad, 2) ||
                this.botonGrafo(pad, 3),

            y: this.botonGrafo(pad, 4),

            izquierda:
                ejeX < -0.45 ||
                this.botonGrafo(pad, 14),

            derecha:
                ejeX > 0.45 ||
                this.botonGrafo(pad, 15),

            arriba:
                ejeY < -0.45 ||
                this.botonGrafo(pad, 12),

            abajo:
                ejeY > 0.45 ||
                this.botonGrafo(pad, 13)
        };
    }

    _esMandoPlayGrafo(pad) {
        if (!pad) return false;

        const id = (pad.id || pad.idName || '').toLowerCase();

        return (
            id.includes('wireless controller') ||
            id.includes('dualshock') ||
            id.includes('dualsense') ||
            id.includes('playstation') ||
            id.includes('ps4') ||
            id.includes('ps5')
        );
    }

    leerEjeGrafo(pad, index) {
        if (!pad) return 0;

        let valor = 0;

        if (pad.axes && index >= 0 && index < pad.axes.length && pad.axes[index] != null) {
            const eje = pad.axes[index];

            if (typeof eje.getValue === 'function') {
                valor = eje.getValue();
            } else if (typeof eje.value === 'number') {
                valor = eje.value;
            } else if (typeof eje === 'number') {
                valor = eje;
            }
        } else if (index === 0 && pad.leftStick) {
            valor = pad.leftStick.x || 0;
        } else if (index === 1 && pad.leftStick) {
            valor = pad.leftStick.y || 0;
        }

        return Math.abs(valor) < 0.25 ? 0 : valor;
    }

    botonGrafo(pad, index) {
        if (!pad || !pad.buttons || index < 0 || index >= pad.buttons.length) {
            return false;
        }

        const boton = pad.buttons[index];

        if (!boton) return false;

        if (typeof boton.pressed === 'boolean') {
            return boton.pressed;
        }

        if (typeof boton.value === 'number') {
            return boton.value > 0.35;
        }

        if (typeof boton.getValue === 'function') {
            return boton.getValue() > 0.35;
        }

        return false;
    }

    _registrarOpcionUI(btn, label, zone, accion, habilitado = null) {

        const opcion = {
            btn,
            label,
            zone,
            accion,
            habilitado:
                typeof habilitado === 'function'
                    ? habilitado
                    : () => true
        };

        this.opcionesUI.push(opcion);

        if (this.opcionesUI.length === 1) {
            this.indiceUI = 0;
        }

        this._actualizarSeleccionVisual();

        return opcion;

    }

    _moverSeleccionUI(direccion) {

        if (!this.opcionesUI || this.opcionesUI.length === 0) return;

        this.indiceUI += direccion;

        if (this.indiceUI < 0) {
            this.indiceUI = this.opcionesUI.length - 1;
        }

        if (this.indiceUI >= this.opcionesUI.length) {
            this.indiceUI = 0;
        }

        this._actualizarSeleccionVisual();

    }

    _activarSeleccionUI() {

        if (!this.opcionesUI || this.opcionesUI.length === 0) return;

        const opcion =
            this.opcionesUI[this.indiceUI];

        if (!opcion || !opcion.habilitado()) return;

        if (typeof opcion.accion === 'function') {
            opcion.accion();
        }

    }

    _actualizarSeleccionVisual() {

        if (!this.opcionesUI) return;

        this.opcionesUI.forEach((opcion, index) => {

            if (!opcion || !opcion.btn || !opcion.label) return;

            const seleccionado =
                index === this.indiceUI;

            const activo =
                opcion.habilitado();

            opcion.btn.setAlpha(activo ? 1 : 0.5);
            opcion.label.setAlpha(activo ? 1 : 0.5);

            if (seleccionado && activo) {

                opcion.btn.setStrokeStyle(
                    4,
                    0xffff99,
                    1
                );

                opcion.label.setScale(1.05);

            }

            else {

                opcion.btn.setStrokeStyle(
                    3,
                    0xffffff,
                    1
                );

                opcion.label.setScale(1);

            }

        });

    }

    // =========================================================
    // CONSTRUCCIÓN DEL GRAFO
    // =========================================================

    crearGrafo(culpables) {

        this.nodos = [];
        this.aristas = [];
        this.adyacencia = {};

        const nodosVisuales = [
            ...culpables,
            {
                ...VALERIA,
                nombre: 'Valeria',
                esVictima: true
            }
        ];

        this.radioNodo =
            this._calcularRadioNodo(nodosVisuales.length);

        nodosVisuales.forEach(pj => {

            const esVictima =
                pj.esVictima === true
                ||
                pj.nombre === 'Valeria'
                ||
                pj.id === 'VALERIA';

            const id =
                esVictima
                    ? 'valeria'
                    : this._idNodo(pj.nombre);

            const nodo = {
                id,
                nombre: esVictima ? 'Valeria' : pj.nombre,
                caso: pj,
                esVictima,
                esOrigen: false,
                x: 640,
                y: 310,
                grado: 0
            };

            this.nodos.push(nodo);
            this.adyacencia[nodo.id] = [];

        });

        const origen =
            this.nodos.find(n => n.nombre === 'Abril')
            ||
            this.nodos.find(n => !n.esVictima);

        if (origen) {
            origen.esOrigen = true;
        }

        this._posicionarNodos();
        this._cargarConexionesMaestras();
        this._actualizarGrados();

    }
    _posicionarNodos() {
        const origen = this.obtenerNodoOrigen();
        const destino = this.obtenerNodoDestino();

        if (this.diaActual === 1) {
            const culpables = this.nodos.filter(nodo => !nodo.esVictima);

            const n0 = culpables[0];
            const n1 = culpables[1];
            const n2 = culpables[2];
            const n3 = culpables[3];

            if (n0) {
                n0.x = 170;
                n0.y = 310;
            }

            if (n1) {
                n1.x = 420;
                n1.y = 210;
            }

            if (n2) {
                n2.x = 420;
                n2.y = 410;
            }

            if (n3) {
                n3.x = 710;
                n3.y = 310;
            }

            if (destino) {
                destino.x = 1040;
                destino.y = 310;
            }

            return;
        }

        /*
            DÍA 4 Y DÍA 5:
            Se usa distribución por capas.
            No depende de nombres fijos, por eso funciona aunque cambien los personajes.
        */
        if (
            this.diaActual === 4 ||
            this.diaActual === 5 ||
            this.algoritmo === 'FORD' ||
            this.algoritmo === 'MASTER'
        ) {
            const area = this.areaGrafo || {
                left: 55,
                right: 1165,
                top: 125,
                bottom: 485
            };

            if (origen) {
                origen.x = area.left + 70;
                origen.y = (area.top + area.bottom) / 2;
            }

            if (destino) {
                destino.x = area.right - 70;
                destino.y = (area.top + area.bottom) / 2;
            }

            const intermedios = this.nodos.filter(nodo => {
                return nodo !== origen && nodo !== destino && !nodo.esVictima;
            });

            /*
                En Día 4 usamos menos columnas para que se vea como flujo.
                En Día 5 usamos más columnas para repartir mejor los 20+ nodos.
            */
            const columnas =
                this.diaActual === 4 || this.algoritmo === 'FORD'
                    ? 4
                    : 5;

            const filas = Math.ceil(intermedios.length / columnas);

            const xInicial = area.left + 250;
            const xFinal = area.right - 250;

            const yInicial = area.top + 60;
            const yFinal = area.bottom - 65;

            intermedios.forEach((nodo, index) => {
                const col = index % columnas;
                const fila = Math.floor(index / columnas);

                const x =
                    columnas === 1
                        ? (area.left + area.right) / 2
                        : Phaser.Math.Linear(xInicial, xFinal, col / (columnas - 1));

                const y =
                    filas === 1
                        ? (area.top + area.bottom) / 2
                        : Phaser.Math.Linear(yInicial, yFinal, fila / (filas - 1));

                /*
                    Pequeño desplazamiento alternado para que no queden
                    todas las líneas exactamente encima.
                */
                const offsetY =
                    col % 2 === 0
                        ? -10
                        : 10;

                nodo.x = Phaser.Math.Clamp(x, area.left + 80, area.right - 80);
                nodo.y = Phaser.Math.Clamp(y + offsetY, area.top + 45, area.bottom - 55);
            });

            return;
        }

        if (origen) {
            origen.x = 115;
            origen.y = 300;
        }

        if (destino) {
            destino.x = 1115;
            destino.y = 300;
        }

        const nodosIntermedios = this.nodos.filter(nodo => {
            return !nodo.esOrigen && !nodo.esVictima;
        });

        const total = nodosIntermedios.length;

        if (total === 0) return;

        if (total <= 3) {
            const posiciones = [
                { x: 390, y: 190 },
                { x: 640, y: 310 },
                { x: 890, y: 430 }
            ];

            nodosIntermedios.forEach((nodo, index) => {
                const pos = posiciones[index] || posiciones[posiciones.length - 1];
                nodo.x = pos.x;
                nodo.y = pos.y;
            });

            return;
        }

        if (total <= 6) {
            const posiciones = [
                { x: 310, y: 170 },
                { x: 510, y: 250 },
                { x: 710, y: 170 },
                { x: 430, y: 410 },
                { x: 650, y: 390 },
                { x: 850, y: 300 }
            ];

            nodosIntermedios.forEach((nodo, index) => {
                const pos = posiciones[index] || posiciones[index % posiciones.length];
                nodo.x = pos.x;
                nodo.y = pos.y;
            });

            return;
        }

        const area = this.areaGrafo || {
            left: 45,
            right: 1160,
            top: 108,
            bottom: 505
        };

        const columnas = Math.ceil(Math.sqrt(total));
        const filas = Math.ceil(total / columnas);

        const margenX = 180;
        const margenY = 70;

        const anchoDisponible = (area.right - area.left) - margenX * 2;
        const altoDisponible = (area.bottom - area.top) - margenY * 2;

        nodosIntermedios.forEach((nodo, index) => {
            const col = index % columnas;
            const fila = Math.floor(index / columnas);

            const x = area.left + margenX + (
                columnas === 1
                    ? anchoDisponible / 2
                    : (anchoDisponible / (columnas - 1)) * col
            );

            const y = area.top + margenY + (
                filas === 1
                    ? altoDisponible / 2
                    : (altoDisponible / (filas - 1)) * fila
            );

            nodo.x = x;
            nodo.y = y;
        });
    }

    _acomodarNodosNoMapeados(usados, posicionesExtra) {
        if (!Array.isArray(posicionesExtra)) return;

        const pendientes = this.nodos.filter(nodo => {
            return !nodo.esVictima && !usados.has(nodo.id);
        });

        pendientes.forEach((nodo, index) => {
            const pos = posicionesExtra[index % posicionesExtra.length];

            nodo.x = pos.x;
            nodo.y = pos.y;
        });
    }

    _cargarConexionesMaestras() {

        if (
            typeof conexionesMaestras === 'undefined'
            ||
            !Array.isArray(conexionesMaestras)
        ) {
            return;
        }

        conexionesMaestras.forEach(conexion => {

            const nodoA =
                this._buscarNodoPorNombre(conexion.from);

            const nodoB =
                this._buscarNodoPorNombre(conexion.to);

            if (!nodoA || !nodoB) return;

            this._agregarArista(
                nodoA,
                nodoB,
                conexion
            );

        });

    }

    _buscarNodoPorNombre(nombre) {

        const normal =
            this._normalizarNombre(nombre);

        if (normal === 'valeria') {
            return this.obtenerNodoDestino();
        }

        return this.nodos.find(n => {
            return this._normalizarNombre(n.nombre) === normal;
        });

    }

    _existeArista(idA, idB) {

        return this.aristas.some(a => {

            return (
                a.from === idA
                &&
                a.to === idB
            )
                ||
                (
                    a.from === idB
                    &&
                    a.to === idA
                );

        });

    }

    _agregarArista(nodoA, nodoB, data = {}) {

        if (!nodoA || !nodoB) return;
        if (nodoA.id === nodoB.id) return;

        if (
            this._existeArista(
                nodoA.id,
                nodoB.id
            )
        ) {
            return;
        }

        const peso =
            typeof data.peso === 'number'
                ? data.peso
                : Phaser.Math.Between(1, 10);

        const capacidad =
            typeof data.capacidad === 'number'
                ? data.capacidad
                : Phaser.Math.Between(2, 9);

        const arista = {
            from: nodoA.id,
            to: nodoB.id,
            nodoA,
            nodoB,
            peso,
            capacidad,
            relacion: data.relacion || 'interacción',
            graphics: null,
            textoPeso: null
        };

        this.aristas.push(arista);

        if (!this.adyacencia[nodoA.id]) {
            this.adyacencia[nodoA.id] = [];
        }

        if (!this.adyacencia[nodoB.id]) {
            this.adyacencia[nodoB.id] = [];
        }

        this.adyacencia[nodoA.id].push(nodoB.id);
        this.adyacencia[nodoB.id].push(nodoA.id);

    }

    _actualizarGrados() {

        this.nodos.forEach(n => {
            n.grado = 0;
        });

        this.aristas.forEach(a => {
            a.nodoA.grado += 1;
            a.nodoB.grado += 1;
        });

    }

    obtenerNodoOrigen() {

        return this.nodos.find(n => n.esOrigen)
            ||
            this.nodos.find(n => !n.esVictima)
            ||
            null;

    }

    obtenerNodoDestino() {
        return this.nodos.find(n => n.esVictima) || null;
    }

    // =========================================================
    // DIBUJO DEL GRAFO
    // =========================================================

    dibujarGrafo() {
        if (this.aristas) {
            this.aristas.forEach(arista => {
                if (arista.textoPeso) {
                    arista.textoPeso.destroy();
                    arista.textoPeso = null;
                }

                if (arista.graphics) {
                    arista.graphics.destroy();
                    arista.graphics = null;
                }
            });
        }

        if (this.nodosVisuales) {
            this.nodosVisuales.forEach(nodoVisual => {
                if (nodoVisual && nodoVisual.destroy) {
                    nodoVisual.destroy();
                }
            });
        }

        this.aristasVisuales = [];
        this.nodosVisuales = [];

        /*
            Día 5 tiene muchas relaciones.
            Ocultamos los pesos base para no saturar la vista.
            Los pesos aparecen cuando una arista se resalta.
        */
        this.mostrarPesosBase =
            this.diaActual !== 5 &&
            this.algoritmo !== 'MASTER';

        /*
            Guardamos posiciones de textos para evitar que los pesos
            se monten encima entre sí.
        */
        this._posicionesPesoUsadas = [];

        const grosorBase =
            this.diaActual === 5 || this.algoritmo === 'MASTER'
                ? 1.4
                : this.diaActual === 4
                    ? 1.8
                    : this.nodos.length >= 14
                        ? 2
                        : 3;

        const alphaBase =
            this.diaActual === 5 || this.algoritmo === 'MASTER'
                ? 0.18
                : this.diaActual === 4
                    ? 0.28
                    : 0.46;

        this.aristas.forEach(arista => {
            const g = this.add.graphics();

            g.setDepth(5);
            arista.graphics = g;

            this._dibujarArista(
                arista,
                0x9fc7ff,
                grosorBase,
                alphaBase
            );

            const textoPeso = this.add.text(
                0,
                0,
                `${arista.peso}`,
                {
                    fontFamily: '"VT323", monospace',
                    fontSize:
                        this.diaActual === 5 || this.algoritmo === 'MASTER'
                            ? '12px'
                            : this.nodos.length >= 14
                                ? '13px'
                                : '16px',
                    color: '#fff2a8',
                    stroke: '#071022',
                    strokeThickness: 4,
                    backgroundColor: '#041127'
                }
            );

            textoPeso.setOrigin(0.5);
            textoPeso.setDepth(30);

            arista.textoPeso = textoPeso;
            this._posicionarTextoPeso(arista);

            textoPeso.setVisible(this.mostrarPesosBase);

            this.aristasVisuales.push(g);
        });

        this.nodos.forEach(nodo => {
            this._dibujarNodo(nodo);
        });
    }

    _dibujarArista(
        arista,
        color = 0x9fc7ff,
        grosor = 3,
        alpha = 0.55
    ) {

        if (!arista || !arista.graphics) return;

        const g =
            arista.graphics;

        const radio =
            (this.radioNodo || 18) + 5;

        const x1 = arista.nodoA.x;
        const y1 = arista.nodoA.y;
        const x2 = arista.nodoB.x;
        const y2 = arista.nodoB.y;

        const dx = x2 - x1;
        const dy = y2 - y1;

        const largo =
            Math.sqrt(dx * dx + dy * dy) || 1;

        const nx = dx / largo;
        const ny = dy / largo;

        const startX =
            x1 + nx * radio;

        const startY =
            y1 + ny * radio;

        const endX =
            x2 - nx * radio;

        const endY =
            y2 - ny * radio;

        g.clear();

        g.lineStyle(
            grosor,
            color,
            alpha
        );

        g.beginPath();
        g.moveTo(startX, startY);
        g.lineTo(endX, endY);
        g.strokePath();

        if (arista.textoPeso) {
            this._posicionarTextoPeso(arista);
        }

    }

    _posicionarTextoPeso(arista) {

        if (!arista || !arista.textoPeso) return;

        const area =
            this.areaGrafo || {
                left: 45,
                right: 1160,
                top: 108,
                bottom: 505
            };

        const x1 = arista.nodoA.x;
        const y1 = arista.nodoA.y;
        const x2 = arista.nodoB.x;
        const y2 = arista.nodoB.y;

        const dx = x2 - x1;
        const dy = y2 - y1;

        const largo =
            Math.sqrt(dx * dx + dy * dy) || 1;

        const px = -dy / largo;
        const py = dx / largo;

        const puntos = [0.32, 0.40, 0.50, 0.60, 0.68];
        const offsets = [18, -18, 30, -30, 42, -42, 54, -54];

        let mejorX = (x1 + x2) / 2;
        let mejorY = (y1 + y2) / 2;
        let encontrado = false;

        for (let p = 0; p < puntos.length && !encontrado; p++) {

            const baseX =
                x1 + dx * puntos[p];

            const baseY =
                y1 + dy * puntos[p];

            for (let i = 0; i < offsets.length; i++) {

                const x =
                    Phaser.Math.Clamp(
                        baseX + px * offsets[i],
                        area.left,
                        area.right
                    );

                const y =
                    Phaser.Math.Clamp(
                        baseY + py * offsets[i],
                        area.top,
                        area.bottom
                    );

                const choca =
                    this.nodos.some(nodo => {

                        const dist =
                            Phaser.Math.Distance.Between(
                                x,
                                y,
                                nodo.x,
                                nodo.y
                            );

                        return dist < (this.radioNodo + 30);

                    });

                if (!choca) {
                    mejorX = x;
                    mejorY = y;
                    encontrado = true;
                    break;
                }

            }

        }

        arista.textoPeso.setPosition(
            mejorX,
            mejorY
        );

    }

    _dibujarNodo(nodo) {
        const radio =
            this.radioNodo || 18;

        const cont =
            this.add.container(
                nodo.x,
                nodo.y
            );

        cont.setDepth(20);

        const colorBase =
            nodo.esVictima
                ? 0xff4f7a
                : nodo.esOrigen
                    ? 0xffb347
                    : 0x2563eb;

        const colorBorde =
            nodo.esVictima
                ? 0xffd0dc
                : nodo.esOrigen
                    ? 0xffe082
                    : 0x7bb8ff;

        const halo =
            this.add.circle(
                0,
                0,
                radio,
                colorBase,
                1
            );

        halo.setStrokeStyle(
            3,
            colorBorde,
            1
        );

        cont.add(halo);

        if (nodo.esVictima) {
            const nombreInterno =
                this.add.text(
                    0,
                    0,
                    'Valeria',
                    {
                        fontFamily: '"VT323", monospace',
                        fontSize: radio <= 14 ? '9px' : '11px',
                        color: '#ffffff',
                        stroke: '#7b1430',
                        strokeThickness: 3,
                        align: 'center'
                    }
                ).setOrigin(0.5);

            cont.add(nombreInterno);
        }

        else {
            const key =
                this._obtenerClaveAvatar(nodo.caso);

            if (this.textures.exists(key)) {
                const avatar =
                    this.add.image(
                        0,
                        -2,
                        key
                    );

                avatar.setDisplaySize(
                    radio * 1.42,
                    radio * 1.42
                );

                cont.add(avatar);
                nodo.avatar = avatar;
            }

            else {
                const avatar =
                    this.add.circle(
                        0,
                        -2,
                        radio * 0.6,
                        0xffffff,
                        1
                    );

                cont.add(avatar);
                nodo.avatar = avatar;
            }

            const fontNombre =
                this.diaActual === 4 || this.diaActual === 5 || this.algoritmo === 'MASTER'
                    ? '9px'
                    : this.nodos.length >= 14
                        ? '10px'
                        : '12px';

            const nombre =
                this.add.text(
                    0,
                    radio + 6,
                    nodo.nombre,
                    {
                        fontFamily: '"VT323", monospace',
                        fontSize: fontNombre,
                        color: '#ffffff',
                        stroke: '#071022',
                        strokeThickness: 3,
                        align: 'center',
                        wordWrap: { width: 70 }
                    }
                ).setOrigin(0.5, 0);

            cont.add(nombre);
        }

        cont.setSize(
            radio * 2,
            radio * 2
        );

        cont.setInteractive(
            new Phaser.Geom.Circle(
                0,
                0,
                radio + 8
            ),
            Phaser.Geom.Circle.Contains
        );

        cont.on('pointerover', () => {
            this.tweens.add({
                targets: cont,
                scaleX: 1.08,
                scaleY: 1.08,
                duration: 120
            });
        });

        cont.on('pointerout', () => {
            this.tweens.add({
                targets: cont,
                scaleX: 1,
                scaleY: 1,
                duration: 120
            });
        });

        nodo.container = cont;
        nodo.halo = halo;

        this.nodosVisuales.push(cont);
    }

    _restaurarGrafo() {
        const grosorBase =
            this.diaActual === 5 || this.algoritmo === 'MASTER'
                ? 1.4
                : this.diaActual === 4
                    ? 1.8
                    : this.nodos.length >= 14
                        ? 2
                        : 3;

        const alphaBase =
            this.diaActual === 5 || this.algoritmo === 'MASTER'
                ? 0.18
                : this.diaActual === 4
                    ? 0.28
                    : 0.46;

        this._posicionesPesoUsadas = [];

        this.aristas.forEach(a => {
            if (a.graphics) {
                this._dibujarArista(
                    a,
                    0x9fc7ff,
                    grosorBase,
                    alphaBase
                );
            }

            if (a.textoPeso) {
                a.textoPeso.setColor('#fff2a8');
                a.textoPeso.setDepth(30);
                a.textoPeso.setVisible(this.mostrarPesosBase);
                this._posicionarTextoPeso(a);
            }
        });

        this.nodos.forEach(nodo => {
            if (!nodo.halo) return;

            const colorBase =
                nodo.esVictima
                    ? 0xff4f7a
                    : nodo.esOrigen
                        ? 0xffb347
                        : 0x2563eb;

            const colorBorde =
                nodo.esVictima
                    ? 0xffd0dc
                    : nodo.esOrigen
                        ? 0xffe082
                        : 0x7bb8ff;

            nodo.halo.setFillStyle(colorBase, 1);
            nodo.halo.setStrokeStyle(3, colorBorde, 1);

            if (nodo.container) {
                nodo.container.setScale(1);
            }
        });
    }
    _resaltarNodo(idNodo, colorRelleno, colorBorde) {

        const nodo =
            this.nodos.find(n => n.id === idNodo);

        if (!nodo || !nodo.halo) return;

        nodo.halo.setFillStyle(colorRelleno, 1);
        nodo.halo.setStrokeStyle(4, colorBorde, 1);

        this.tweens.add({
            targets: nodo.container,
            scaleX: 1.12,
            scaleY: 1.12,
            duration: 230,
            yoyo: true
        });

    }

    _resaltarArista(idA, idB, color, grosor = 5) {
        this.aristas.forEach(a => {
            const coincide =
                (
                    a.from === idA &&
                    a.to === idB
                )
                ||
                (
                    a.from === idB &&
                    a.to === idA
                );

            if (coincide) {
                this._dibujarArista(
                    a,
                    color,
                    grosor,
                    1
                );

                if (a.textoPeso) {
                    const valorTexto =
                        this.algoritmo === 'FORD'
                            ? `${a.capacidad}`
                            : `${a.peso}`;

                    a.textoPeso.setText(valorTexto);
                    a.textoPeso.setVisible(true);
                    a.textoPeso.setAlpha(1);
                    a.textoPeso.setColor('#ffffff');
                    a.textoPeso.setBackgroundColor('#071022');
                    a.textoPeso.setDepth(95);

                    this._posicionarTextoPeso(a);
                }
            }
        });
    }

    // =========================================================
    // ALGORITMOS
    // =========================================================

    ejecutarAlgoritmoDelDia() {

        if (this.algoritmo === 'BFS_DFS') {
            this.crearBotonesRecorridoDia1();
            return;
        }

        if (this.algoritmo === 'DIJKSTRA') {
            this.animarDijkstra();
            return;
        }

        if (this.algoritmo === 'PRIM') {
            this.animarPrim();
            return;
        }

        if (this.algoritmo === 'FORD') {
            this.animarFord();
            return;
        }

        if (this.algoritmo === 'MASTER') {
            this.animarAnalisisFinal();
            return;
        }

        this.txtEstadoDinamico.setText(
            'No hay algoritmo asignado.'
        );

        this.mostrarBotonContinuar();

    }

    // =========================================================
    // DÍA 1 - BFS / DFS
    // =========================================================

    crearBotonesRecorridoDia1() {

        this.recorridoVistoBFS = false;
        this.recorridoVistoDFS = false;
        this.recorridoEnCurso = false;
        this.botonesRecorrido = [];

        this.txtEstadisticas.setText(
            `Personas: ${this.nodos.length}\n`
            + `Relaciones: ${this.aristas.length}\n`
            + `Inicio: ${this.obtenerNodoOrigen()?.nombre || '?'}\n`
            + `Meta: Valeria\n`
            + `Elige recorrido`
        );

        this.txtBFS.setText(
            'Observa cómo se expande\nla investigación por niveles.'
        );

        this.txtDFS.setText(
            'Observa cómo se sigue\nuna cadena profunda.'
        );

        this.txtEstadoDinamico.setText(
            'Selecciona un recorrido para iniciar el análisis.'
        );

        this._crearBotonRecorrido(
            155,
            112,
            'VER BFS',
            0x2f8f46,
            () => {
                this.animarSoloBFS();
            }
        );

        this._crearBotonRecorrido(
            320,
            112,
            'VER DFS',
            0xff7b39,
            () => {
                this.animarSoloDFS();
            }
        );

    }

    _crearBotonRecorrido(x, y, texto, color, accion) {

        const btn =
            this.add.rectangle(
                x,
                y,
                145,
                32,
                color,
                1
            );

        btn.setStrokeStyle(
            3,
            0xffffff,
            1
        );

        btn.setDepth(110);

        const label =
            this.add.text(
                x,
                y,
                texto,
                {
                    fontFamily: '"VT323", monospace',
                    fontSize: '23px',
                    color: '#ffffff',
                    stroke: '#071021',
                    strokeThickness: 4
                }
            );

        label.setOrigin(0.5);
        label.setDepth(111);

        const zone =
            this.add.zone(
                x,
                y,
                145,
                32
            );

        zone.setInteractive({
            cursor: 'pointer'
        });

        zone.setDepth(112);

        zone.on('pointerover', () => {
            if (!this.recorridoEnCurso) {
                btn.setAlpha(0.85);
            }
        });

        zone.on('pointerout', () => {
            btn.setAlpha(1);
        });

        zone.on('pointerdown', () => {
            if (this.recorridoEnCurso) return;
            this.reproducirClickSeguro();
            accion();
        });

        const opcion =
            this._registrarOpcionUI(
                btn,
                label,
                zone,
                accion,
                () => !this.recorridoEnCurso
            );

        this.botonesRecorrido.push(opcion);

    }

    _bloquearBotonesRecorrido(bloquear) {

        this.botonesRecorrido.forEach(item => {

            if (!item || !item.zone) return;

            if (bloquear) {
                item.zone.disableInteractive();
            }

            else {
                item.zone.setInteractive({
                    cursor: 'pointer'
                });
            }

        });

        this._actualizarSeleccionVisual();

    }

    _actualizarEstadoRecorridosDia1() {

        if (
            this.recorridoVistoBFS
            &&
            this.recorridoVistoDFS
        ) {

            this.txtEstadoDinamico.setText(
                'BFS y DFS completados. Puedes continuar.'
            );

            this.mostrarBotonContinuar();
            return;

        }

        if (this.recorridoVistoBFS) {
            this.txtEstadoDinamico.setText(
                'BFS listo. Ahora observa el recorrido DFS.'
            );
            return;
        }

        if (this.recorridoVistoDFS) {
            this.txtEstadoDinamico.setText(
                'DFS listo. Ahora observa el recorrido BFS.'
            );
        }

    }

    _ordenarVecinosPorPosicion(vecinos) {

        return [...vecinos].sort((a, b) => {

            const nodoA =
                this.nodos.find(n => n.id === a);

            const nodoB =
                this.nodos.find(n => n.id === b);

            if (!nodoA || !nodoB) return 0;

            if (nodoA.x !== nodoB.x) {
                return nodoA.x - nodoB.x;
            }

            return nodoA.y - nodoB.y;

        });

    }

    _ordenarVecinosDFS(vecinos) {
        return [...vecinos].sort((a, b) => {
            const nodoA = this.nodos.find(n => n.id === a);
            const nodoB = this.nodos.find(n => n.id === b);

            if (!nodoA || !nodoB) return 0;

            if (nodoA.x !== nodoB.x) {
                return nodoB.x - nodoA.x;
            }

            return nodoB.y - nodoA.y;
        });
    }

    obtenerOrdenBFS() {

        const origen =
            this.obtenerNodoOrigen();

        const destino =
            this.obtenerNodoDestino();

        if (!origen) return [];

        const visitados = new Set();
        const cola = [];
        const orden = [];

        cola.push({
            id: origen.id,
            nivel: 0,
            padre: null
        });

        visitados.add(origen.id);

        while (cola.length > 0) {

            const actual =
                cola.shift();

            if (
                destino
                &&
                actual.id === destino.id
            ) {
                continue;
            }

            orden.push(actual);

            let vecinos =
                this.adyacencia[actual.id] || [];

            vecinos = vecinos.filter(id => {
                return !destino || id !== destino.id;
            });

            vecinos =
                this._ordenarVecinosDFS(vecinos);

            vecinos.forEach(vecino => {

                if (!visitados.has(vecino)) {

                    visitados.add(vecino);

                    cola.push({
                        id: vecino,
                        nivel: actual.nivel + 1,
                        padre: actual.id
                    });

                }

            });

        }

        if (destino) {

            const candidatos =
                (this.adyacencia[destino.id] || [])
                    .filter(id => visitados.has(id));

            if (candidatos.length > 0) {

                candidatos.sort((a, b) => {

                    const pasoA =
                        orden.find(p => p.id === a);

                    const pasoB =
                        orden.find(p => p.id === b);

                    const nivelA =
                        pasoA ? pasoA.nivel : 999;

                    const nivelB =
                        pasoB ? pasoB.nivel : 999;

                    if (nivelA !== nivelB) {
                        return nivelA - nivelB;
                    }

                    return this._nombrePorId(a)
                        .localeCompare(this._nombrePorId(b));

                });

                const padreDestino =
                    candidatos[0];

                const nivelPadre =
                    orden.find(p => p.id === padreDestino)?.nivel || 0;

                orden.push({
                    id: destino.id,
                    nivel: nivelPadre + 1,
                    padre: padreDestino
                });

            }

        }

        return orden;

    }

    obtenerOrdenDFS() {

        const origen =
            this.obtenerNodoOrigen();

        const destino =
            this.obtenerNodoDestino();

        if (!origen) return [];

        const visitados = new Set();
        const orden = [];

        const dfs = (idNodo, nivel, padre) => {

            if (
                destino
                &&
                idNodo === destino.id
            ) {
                return;
            }

            visitados.add(idNodo);

            orden.push({
                id: idNodo,
                nivel,
                padre
            });

            let vecinos =
                this.adyacencia[idNodo] || [];

            vecinos = vecinos.filter(id => {
                return !destino || id !== destino.id;
            });

            vecinos =
                this._ordenarVecinosPorPosicion(vecinos);

            vecinos.forEach(vecino => {

                if (!visitados.has(vecino)) {

                    dfs(
                        vecino,
                        nivel + 1,
                        idNodo
                    );

                }

            });

        };

        dfs(
            origen.id,
            0,
            null
        );

        if (destino) {

            const candidatos =
                (this.adyacencia[destino.id] || [])
                    .filter(id => visitados.has(id));

            if (candidatos.length > 0) {

                let padreDestino =
                    candidatos[0];

                for (let i = orden.length - 1; i >= 0; i--) {

                    if (candidatos.includes(orden[i].id)) {
                        padreDestino = orden[i].id;
                        break;
                    }

                }

                const nivelPadre =
                    orden.find(p => p.id === padreDestino)?.nivel || 0;

                orden.push({
                    id: destino.id,
                    nivel: nivelPadre + 1,
                    padre: padreDestino
                });

            }

        }

        return orden;

    }

    animarSoloBFS() {

        if (this.recorridoEnCurso) return;

        this.recorridoEnCurso = true;
        this._bloquearBotonesRecorrido(true);
        this._restaurarGrafo();

        const ordenBFS =
            this.obtenerOrdenBFS();

        const nombres = [];

        this.txtEstadisticas.setText(
            `BFS activo\n`
            + `Inicio: ${this.obtenerNodoOrigen()?.nombre || '?'}\n`
            + `Meta: Valeria\n`
            + `Por niveles\n`
            + `Sin pesos`
        );

        this.txtBFS.setText(
            'Recorrido BFS:\n'
        );

        this.txtEstadoDinamico.setText(
            'BFS inicia desde el primer implicado.'
        );

        ordenBFS.forEach((paso, index) => {

            this.time.delayedCall(
                650 + index * 600,
                () => {

                    const nodo =
                        this.nodos.find(n => n.id === paso.id);

                    if (!nodo) return;

                    nombres.push(nodo.nombre);

                    this._resaltarNodo(
                        paso.id,
                        0x2f8f46,
                        0x8dff9c
                    );

                    if (paso.padre) {

                        this._resaltarArista(
                            paso.padre,
                            paso.id,
                            0x8dff9c,
                            5
                        );

                    }

                    this.txtBFS.setText(
                        `BFS por niveles:\n`
                        + this._partirRutaPorCantidad(nombres, 3)
                    );

                    this.txtEstadoDinamico.setText(
                        `BFS revisa nivel ${paso.nivel}: ${nodo.nombre}`
                    );

                }
            );

        });

        this.time.delayedCall(
            900 + ordenBFS.length * 600,
            () => {

                const ruta =
                    ordenBFS.map(paso => this._nombrePorId(paso.id));

                this.txtBFS.setText(
                    `BFS por niveles:\n`
                    + `${this._partirRutaPorCantidad(ruta, 3)}\n\n`
                    + `Ayuda al caso:\n`
                    + `Primero revisa los sospechosos más cercanos al inicio.`
                );
                this.txtEstadisticas.setText(
                    `BFS listo\n`
                    + `Personas: ${this.nodos.length}\n`
                    + `Relaciones: ${this.aristas.length}\n`
                    + `Inicio: ${this.obtenerNodoOrigen()?.nombre || '?'}\n`
                    + `Meta: Valeria`
                );

                this.recorridoVistoBFS = true;
                this.recorridoEnCurso = false;
                this._bloquearBotonesRecorrido(false);
                this._actualizarEstadoRecorridosDia1();

            }
        );

    }

    animarSoloDFS() {

        if (this.recorridoEnCurso) return;

        this.recorridoEnCurso = true;
        this._bloquearBotonesRecorrido(true);
        this._restaurarGrafo();

        const ordenDFS =
            this.obtenerOrdenDFS();

        const nombres = [];

        this.txtEstadisticas.setText(
            `DFS activo\n`
            + `Inicio: ${this.obtenerNodoOrigen()?.nombre || '?'}\n`
            + `Meta: Valeria\n`
            + `Por profundidad\n`
            + `Sin pesos`
        );

        this.txtDFS.setText(
            'Recorrido DFS:\n'
        );

        this.txtEstadoDinamico.setText(
            'DFS sigue una cadena profunda.'
        );

        ordenDFS.forEach((paso, index) => {

            this.time.delayedCall(
                650 + index * 600,
                () => {

                    const nodo =
                        this.nodos.find(n => n.id === paso.id);

                    if (!nodo) return;

                    nombres.push(nodo.nombre);

                    this._resaltarNodo(
                        paso.id,
                        0xff7b39,
                        0xffc266
                    );

                    if (paso.padre) {

                        this._resaltarArista(
                            paso.padre,
                            paso.id,
                            0xffc266,
                            5
                        );

                    }

                    this.txtDFS.setText(
                        `Recorrido DFS:\n`
                        + this._partirRutaPorCantidad(nombres, 3)
                    );

                    this.txtEstadoDinamico.setText(
                        `DFS profundiza: ${nodo.nombre}`
                    );

                }
            );

        });

        this.time.delayedCall(
            900 + ordenDFS.length * 600,
            () => {

                const profMax =
                    ordenDFS.length > 0
                        ? Math.max(...ordenDFS.map(p => p.nivel))
                        : 0;

                const ruta =
                    this._partirRutaPorCantidad(
                        ordenDFS.map(p => this._nombrePorId(p.id)),
                        3
                    );

                this.txtDFS.setText(
                    `Recorrido DFS:\n${ruta}\n\n`
                    + `Ayuda al caso:\n`
                    + `Sigue una cadena profunda para encontrar relaciones ocultas.`
                );

                this.txtEstadisticas.setText(
                    `DFS listo\n`
                    + `Personas: ${this.nodos.length}\n`
                    + `Relaciones: ${this.aristas.length}\n`
                    + `Profundidad: ${profMax}\n`
                    + `Inicio: ${this.obtenerNodoOrigen()?.nombre || '?'}`
                );

                this.recorridoVistoDFS = true;
                this.recorridoEnCurso = false;
                this._bloquearBotonesRecorrido(false);
                this._actualizarEstadoRecorridosDia1();

            }
        );

    }

    // =========================================================
    // DIJKSTRA
    // =========================================================

    obtenerRutaDijkstra() {

        const origen =
            this.obtenerNodoOrigen();

        const destino =
            this.obtenerNodoDestino();

        if (!origen || !destino) {
            return {
                ruta: [],
                costoTotal: 0,
                encontrado: false
            };
        }

        const distancias = {};
        const previos = {};
        const visitados = new Set();

        this.nodos.forEach(n => {
            distancias[n.id] = Infinity;
            previos[n.id] = null;
        });

        distancias[origen.id] = 0;

        while (visitados.size < this.nodos.length) {

            let actual = null;
            let menor = Infinity;

            this.nodos.forEach(n => {

                if (
                    !visitados.has(n.id)
                    &&
                    distancias[n.id] < menor
                ) {
                    menor = distancias[n.id];
                    actual = n.id;
                }

            });

            if (actual === null) break;
            if (actual === destino.id) break;

            visitados.add(actual);

            this.aristas.forEach(a => {

                let vecino = null;

                if (a.from === actual) vecino = a.to;
                else if (a.to === actual) vecino = a.from;

                if (!vecino || visitados.has(vecino)) return;

                const nueva =
                    distancias[actual] + a.peso;

                if (nueva < distancias[vecino]) {
                    distancias[vecino] = nueva;
                    previos[vecino] = actual;
                }

            });

        }

        if (distancias[destino.id] === Infinity) {
            return {
                ruta: [],
                costoTotal: 0,
                encontrado: false
            };
        }

        const ruta = [];
        let actual = destino.id;

        while (actual) {
            ruta.unshift(actual);
            actual = previos[actual];
        }

        return {
            ruta,
            costoTotal: distancias[destino.id],
            encontrado: true
        };

    }

    animarDijkstra() {

        const resultado =
            this.obtenerRutaDijkstra();

        if (!resultado.encontrado) {

            this.txtEstadisticas.setText(
                `Inicio: ${this.obtenerNodoOrigen()?.nombre || '?'}\n`
                + `Meta: Valeria\n`
                + `No hay ruta.`
            );

            this.txtRecorrido.setText(
                'Dijkstra no encontró una ruta segura.'
            );

            this.txtAyuda.setText(
                'Dijkstra ayudó al detective a\n' +
                'encontrar la ruta más rápida para\n' +
                'analizar los hechos y llegar\n' +
                'directamente hasta Valeria.'
            );

            this.mostrarBotonContinuar();
            return;

        }

        const nombres = [];

        resultado.ruta.forEach((id, index) => {

            this.time.delayedCall(
                800 + index * 760,
                () => {

                    const nodo =
                        this.nodos.find(n => n.id === id);

                    if (!nodo) return;

                    nombres.push(nodo.nombre);

                    this._resaltarNodo(
                        id,
                        0x2563eb,
                        0x7dd3fc
                    );

                    if (index > 0) {

                        this._resaltarArista(
                            resultado.ruta[index - 1],
                            id,
                            0x7dd3fc,
                            5
                        );

                    }

                    this.txtRecorrido.setText(
                        `Ruta más corta:\n`
                        + this._partirRutaPorCantidad(nombres, 3)
                    );

                    this.txtEstadoDinamico.setText(
                        `Dijkstra evalúa menor costo: ${nodo.nombre}`
                    );

                }
            );

        });

        this.time.delayedCall(
            1250 + resultado.ruta.length * 760,
            () => {

                const ruta =
                    resultado.ruta.map(id => this._nombrePorId(id));

                this.txtEstadisticas.setText(
                    `Inicio: ${this.obtenerNodoOrigen()?.nombre || '?'}\n`
                    + `Meta: Valeria\n`
                    + `Personas: ${this.nodos.length}\n`
                    + `Relaciones: ${this.aristas.length}\n`
                    + `Costo: ${resultado.costoTotal}`
                );

                this.txtRecorrido.setText(
                    `Ruta más corta:\n`
                    + this._partirRutaPorCantidad(ruta, 3)
                );

                this.txtAyuda.setText(
                    'Dijkstra ayudó al detective a\n' +
                    'encontrar la ruta más rápida para\n' +
                    'analizar los hechos y llegar\n' +
                    'directamente hasta Valeria.'
                );

                this.txtEstadoDinamico.setText(
                    'Dijkstra completado.'
                );

                this.mostrarBotonContinuar();

            }
        );

    }

    // =========================================================
    // PRIM
    // =========================================================

    obtenerPrim() {

        const origen =
            this.obtenerNodoOrigen();

        if (!origen) {
            return {
                aristas: [],
                costoTotal: 0
            };
        }

        const visitados =
            new Set([origen.id]);

        const resultado = [];
        let costoTotal = 0;

        while (visitados.size < this.nodos.length) {

            let mejor = null;

            this.aristas.forEach(a => {

                const aVisitado =
                    visitados.has(a.from);

                const bVisitado =
                    visitados.has(a.to);

                const conecta =
                    (
                        aVisitado
                        &&
                        !bVisitado
                    )
                    ||
                    (
                        !aVisitado
                        &&
                        bVisitado
                    );

                if (!conecta) return;

                if (
                    !mejor
                    ||
                    a.peso < mejor.peso
                ) {
                    mejor = a;
                }

            });

            if (!mejor) break;

            resultado.push(mejor);
            costoTotal += mejor.peso;

            visitados.add(mejor.from);
            visitados.add(mejor.to);

        }

        return {
            aristas: resultado,
            costoTotal
        };

    }

    animarPrim() {

        const resultado =
            this.obtenerPrim();

        const conexiones = [];

        resultado.aristas.forEach((a, index) => {

            this.time.delayedCall(
                800 + index * 620,
                () => {

                    this._resaltarArista(
                        a.from,
                        a.to,
                        0xfacc15,
                        5
                    );

                    this._resaltarNodo(
                        a.from,
                        0xeab308,
                        0xfef08a
                    );

                    this._resaltarNodo(
                        a.to,
                        0xeab308,
                        0xfef08a
                    );

                    conexiones.push(
                        `${a.nodoA.nombre} ↔ ${a.nodoB.nombre}`
                    );

                    this.txtRecorrido.setText(
                        `Conexiones clave:\n`
                        + this._listaEnColumnas(conexiones, 2)
                    );

                    this.txtEstadoDinamico.setText(
                        `Prim agrega menor costo: ${a.nodoA.nombre} - ${a.nodoB.nombre}`
                    );

                }
            );

        });

        this.time.delayedCall(
            1250 + resultado.aristas.length * 620,
            () => {

                const lista =
                    resultado.aristas.map(
                        a => `${a.nodoA.nombre} ↔ ${a.nodoB.nombre}`
                    );

                this.txtEstadisticas.setText(
                    `Personas: ${this.nodos.length}\n`
                    + `Relaciones usadas: ${resultado.aristas.length}\n`
                    + `Costo total: ${resultado.costoTotal}\n`
                    + `Red mínima`
                );

                this.txtRecorrido.setText(
                    `Conexiones clave:\n`
                    + this._listaEnColumnas(lista, 2)
                );

                this.txtAyuda.setText(
                    'Prim permitió al detective ver\n' +
                    'la red mínima del caso, revelando\n' +
                    'las conexiones clave que unen\n' +
                    'a todos los implicados con Valeria.'
                );

                this.txtEstadoDinamico.setText(
                    'Prim completado.'
                );

                this.mostrarBotonContinuar();

            }
        );

    }

    // =========================================================
    // FORD-FULKERSON
    // =========================================================

    obtenerFordFulkerson() {

        const origen =
            this.obtenerNodoOrigen();

        const destino =
            this.obtenerNodoDestino();

        if (!origen || !destino) {
            return {
                flujoMaximo: 0,
                caminos: []
            };
        }

        const residual = {};

        this.nodos.forEach(n => {
            residual[n.id] = {};
        });

        this.aristas.forEach(a => {
            residual[a.from][a.to] = a.capacidad;
            residual[a.to][a.from] = a.capacidad;
        });

        const caminos = [];
        let flujoMaximo = 0;

        while (true) {

            const parent = {};
            const visitados = new Set();
            const cola = [];

            cola.push(origen.id);
            visitados.add(origen.id);

            while (cola.length > 0) {

                const actual =
                    cola.shift();

                Object.keys(residual[actual]).forEach(vecino => {

                    if (
                        !visitados.has(vecino)
                        &&
                        residual[actual][vecino] > 0
                    ) {
                        visitados.add(vecino);
                        parent[vecino] = actual;
                        cola.push(vecino);
                    }

                });

            }

            if (!visitados.has(destino.id)) break;

            let flujoCamino = Infinity;
            let actual = destino.id;

            while (actual !== origen.id) {

                const previo =
                    parent[actual];

                flujoCamino =
                    Math.min(
                        flujoCamino,
                        residual[previo][actual]
                    );

                actual = previo;

            }

            const camino = [];
            actual = destino.id;

            while (actual !== origen.id) {

                const previo =
                    parent[actual];

                residual[previo][actual] -= flujoCamino;
                residual[actual][previo] += flujoCamino;

                camino.unshift({
                    from: previo,
                    to: actual
                });

                actual = previo;

            }

            flujoMaximo += flujoCamino;

            caminos.push({
                flujo: flujoCamino,
                aristas: camino
            });

        }

        return {
            flujoMaximo,
            caminos
        };

    }

    animarFord() {

        const resultado =
            this.obtenerFordFulkerson();

        const lineas = [];

        resultado.caminos.forEach((camino, index) => {

            this.time.delayedCall(
                850 + index * 760,
                () => {

                    const nombres = [];

                    camino.aristas.forEach((a, idx) => {

                        this._resaltarArista(
                            a.from,
                            a.to,
                            0xef4444,
                            5
                        );

                        this._resaltarNodo(
                            a.from,
                            0xdc2626,
                            0xffb4b4
                        );

                        this._resaltarNodo(
                            a.to,
                            0xdc2626,
                            0xffb4b4
                        );

                        if (idx === 0) {
                            nombres.push(this._nombrePorId(a.from));
                        }

                        nombres.push(this._nombrePorId(a.to));

                    });

                    lineas.push(
                        `F${index + 1}: ${camino.flujo} | `
                        + nombres.join(' → ')
                    );

                    this.txtRecorrido.setText(
                        `Caminos de impacto:\n`
                        + lineas.join('\n')
                    );

                    this.txtEstadoDinamico.setText(
                        `Ford-Fulkerson analiza flujo: ${camino.flujo}`
                    );

                }
            );

        });

        this.time.delayedCall(
            1250 + resultado.caminos.length * 760,
            () => {

                this.txtEstadisticas.setText(
                    `Inicio: ${this.obtenerNodoOrigen()?.nombre || '?'}\n`
                    + `Meta: Valeria\n`
                    + `Caminos: ${resultado.caminos.length}\n`
                    + `Flujo máximo: ${resultado.flujoMaximo}\n`
                    + `Impacto medido`
                );

                this.txtRecorrido.setText(
                    `Caminos de impacto:\n`
                    + this._listaLimitada(lineas, 4)
                );

                this.txtAyuda.setText(
                    'Ford-Fulkerson mostró al detective\n' +
                    'cuánta influencia puede llegar\n' +
                    'a Valeria y por cuáles caminos\n' +
                    'se propagó el daño hacia ella.'
                );

                this.txtEstadoDinamico.setText(
                    'Ford-Fulkerson completado.'
                );

                this.mostrarBotonContinuar();

            }
        );

    }

    // =========================================================
    // MASTER
    // =========================================================

    animarAnalisisFinal() {

        const bfs =
            this.obtenerOrdenBFS();

        const dfs =
            this.obtenerOrdenDFS();

        const dijkstra =
            this.obtenerRutaDijkstra();

        const prim =
            this.obtenerPrim();

        const ford =
            this.obtenerFordFulkerson();

        const contador = {};

        this.nodos.forEach(n => {
            contador[n.id] = 0;
        });

        bfs.forEach(p => {
            contador[p.id] += 1;
        });

        dfs.forEach(p => {
            contador[p.id] += 1;
        });

        if (dijkstra.encontrado) {
            dijkstra.ruta.forEach(id => {
                contador[id] += 2;
            });
        }

        prim.aristas.forEach(a => {
            contador[a.from] += 1;
            contador[a.to] += 1;
        });

        ford.caminos.forEach(c => {
            c.aristas.forEach(a => {
                contador[a.from] += 1;
                contador[a.to] += 1;
            });
        });

        let principal = null;
        let maximo = -1;

        Object.keys(contador).forEach(id => {

            const nodo =
                this.nodos.find(n => n.id === id);

            if (!nodo || nodo.esVictima) return;

            if (contador[id] > maximo) {
                maximo = contador[id];
                principal = nodo;
            }

        });

        this.ultimateCulpable =
            principal || this.obtenerNodoOrigen();
        this.cabecillaCorrecto = this.ultimateCulpable
            ? {
                nombre: this.ultimateCulpable.nombre,
                id: this.ultimateCulpable.id
            }
            : null;

        this.siguienteEstado = {
            ...(this.siguienteEstado || {}),
            cabecillaCorrecto: this.cabecillaCorrecto
        };

        if (this.ultimateCulpable) {

            this._resaltarNodo(
                this.ultimateCulpable.id,
                0xff0000,
                0xffe082
            );

            this.tweens.add({
                targets: this.ultimateCulpable.container,
                scaleX: 1.16,
                scaleY: 1.16,
                duration: 650,
                yoyo: true,
                repeat: -1
            });

        }

        const rutaTexto =
            dijkstra.encontrado
                ? this._partirRutaPorCantidad(
                    dijkstra.ruta.map(id => this._nombrePorId(id)),
                    3
                )
                : 'No se encontró ruta.';

        this.txtEstadisticas.setText(
            `Personas: ${this.nodos.length}\n`
            + `Relaciones: ${this.aristas.length}\n`
            + `BFS revisó: ${bfs.length}\n`
            + `DFS revisó: ${dfs.length}\n`
            + `Flujo: ${ford.flujoMaximo}`
        );

        this.txtRecorrido.setText(
            `Resumen final:\n`
            + `Inicio: ${this.obtenerNodoOrigen()?.nombre || '?'}\n`
            + `Ruta:\n${rutaTexto}\n`
            + `Costo red: ${prim.costoTotal}\n`
            + `Persona clave: ${this.ultimateCulpable?.nombre || '?'}`
        );

        this.txtAyuda.setText(
            'Todos los algoritmos guiaron al\n' +
            'detective hacia la verdad. BFS,\n' +
            'DFS, Dijkstra, Prim y Ford juntos\n' +
            'señalan al culpable detrás del caso.'
        );

        this.txtEstadoDinamico.setText(
            'Misión final completada.'
        );

        this.crearBotonConclusiones();
        this.mostrarBotonContinuar();

    }

    // =========================================================
    // BOTONES Y MODALES
    // =========================================================

    mostrarSinDatos() {

        this.add.text(
            640,
            360,
            'No hay datos para construir el grafo.',
            {
                fontFamily: '"VT323", monospace',
                fontSize: '38px',
                color: '#ffffff',
                stroke: '#071022',
                strokeThickness: 5
            }
        ).setOrigin(0.5);

        this.mostrarBotonContinuar();

    }

    mostrarBotonContinuar() {

        if (this.yaPuedeContinuar) return;

        this.yaPuedeContinuar = true;

        const btn =
            this.add.rectangle(
                1145,
                45,
                195,
                36,
                0x2d82ff,
                1
            );

        btn.setStrokeStyle(
            3,
            0xffffff,
            1
        );

        btn.setDepth(100);

        const label =
            this.add.text(
                1145,
                45,
                'CONTINUAR',
                {
                    fontFamily: '"VT323", monospace',
                    fontSize: '25px',
                    color: '#ffffff',
                    stroke: '#071021',
                    strokeThickness: 4
                }
            );

        label.setOrigin(0.5);
        label.setDepth(101);

        const zone =
            this.add.zone(
                1145,
                45,
                195,
                36
            );

        zone.setInteractive({
            cursor: 'pointer'
        });

        zone.setDepth(102);

        zone.on('pointerover', () => {
            btn.setFillStyle(0x4b9bff, 1);
        });

        zone.on('pointerout', () => {
            btn.setFillStyle(0x2d82ff, 1);
        });

        zone.on('pointerdown', () => {
            this.irASiguienteDia();
        });

        this._registrarOpcionUI(
            btn,
            label,
            zone,
            () => {
                this.irASiguienteDia();
            },
            () => this.yaPuedeContinuar
        );

    }

    crearBotonConclusiones() {

        const btn =
            this.add.rectangle(
                1145,
                86,
                195,
                32,
                0xffc107,
                1
            );

        btn.setStrokeStyle(
            3,
            0xffffff,
            1
        );

        btn.setDepth(100);

        const label =
            this.add.text(
                1145,
                86,
                'CONCLUSIONES',
                {
                    fontFamily: '"VT323", monospace',
                    fontSize: '22px',
                    color: '#000000'
                }
            );

        label.setOrigin(0.5);
        label.setDepth(101);

        const zone =
            this.add.zone(
                1145,
                86,
                195,
                32
            );

        zone.setInteractive({
            cursor: 'pointer'
        });

        zone.setDepth(102);

        zone.on('pointerdown', () => {
            this.abrirModalConclusiones();
        });

        this._registrarOpcionUI(
            btn,
            label,
            zone,
            () => {
                this.abrirModalConclusiones();
            },
            () => true
        );

    }

    abrirModalConclusiones() {

        this.modalAbierto = true;
        this.opcionesAntesModal = [...this.opcionesUI];
        this.opcionesUI = [];
        this.indiceUI = 0;

        const fondo =
            this.add.rectangle(
                640,
                360,
                1280,
                720,
                0x000000,
                0.68
            );

        fondo.setDepth(200);

        const panel =
            this.add.rectangle(
                640,
                360,
                800,
                455,
                0x071a3d,
                0.98
            );

        panel.setStrokeStyle(
            4,
            0x7bb8ff,
            1
        );

        panel.setDepth(201);

        const titulo =
            this.add.text(
                640,
                150,
                'CONCLUSIONES FINALES',
                {
                    fontFamily: '"VT323", monospace',
                    fontSize: '42px',
                    color: '#ffffff'
                }
            );

        titulo.setOrigin(0.5);
        titulo.setDepth(202);

        const culpable =
            this.ultimateCulpable
                ? this.ultimateCulpable.nombre
                : 'No definido';

        const texto =
            this.add.text(
                640,
                330,
                `Persona más influyente: ${culpable}\n\n`
                + `BFS mostró cómo se extendió el caso por niveles.\n`
                + `DFS siguió una cadena profunda de interacción.\n`
                + `Dijkstra encontró la ruta más corta.\n`
                + `Prim reconstruyó la red mínima del caso.\n`
                + `Ford-Fulkerson midió el flujo máximo de impacto.\n\n`
                + `Con estos resultados, el detective puede ubicar mejor\n`
                + `quién tuvo mayor participación en el caso.`,
                {
                    fontFamily: '"VT323", monospace',
                    fontSize: '25px',
                    color: '#dcecff',
                    align: 'center',
                    lineSpacing: 4,
                    wordWrap: { width: 720 }
                }
            );

        texto.setOrigin(0.5);
        texto.setDepth(202);

        const btnCerrar =
            this.add.rectangle(
                640,
                560,
                150,
                40,
                0xffc107,
                1
            );

        btnCerrar.setStrokeStyle(
            3,
            0xffffff,
            1
        );

        btnCerrar.setDepth(202);

        const cerrar =
            this.add.text(
                640,
                560,
                'CERRAR',
                {
                    fontFamily: '"VT323", monospace',
                    fontSize: '31px',
                    color: '#000000'
                }
            );

        cerrar.setOrigin(0.5);
        cerrar.setDepth(203);

        const zone =
            this.add.zone(
                640,
                560,
                150,
                40
            );

        zone.setInteractive({
            cursor: 'pointer'
        });

        zone.setDepth(204);

        const cerrarModal = () => {

            fondo.destroy();
            panel.destroy();
            titulo.destroy();
            texto.destroy();
            btnCerrar.destroy();
            cerrar.destroy();
            zone.destroy();

            this.modalAbierto = false;
            this.opcionesUI = [...this.opcionesAntesModal];
            this.indiceUI = 0;
            this._actualizarSeleccionVisual();

        };

        zone.on('pointerdown', cerrarModal);

        this._registrarOpcionUI(
            btnCerrar,
            cerrar,
            zone,
            cerrarModal,
            () => true
        );

    }

    irASiguienteDia() {

        if (!this.yaPuedeContinuar) return;

        this.reproducirClickSeguro();
        this.yaPuedeContinuar = false;

        const hacerTransicion = () => {

            this.cameras.main.fadeOut(
                420,
                0,
                0,
                0
            );

            this.time.delayedCall(
                420,
                () => {

                    const estadoSiguiente = {
                        ...(this.siguienteEstado || {}),
                        diaActual: this.diaActual + 1
                    };

                    if (this.algoritmo === 'MASTER' && this.ultimateCulpable) {
                        estadoSiguiente.cabecillaCorrecto = {
                            nombre: this.ultimateCulpable.nombre,
                            id: this.ultimateCulpable.id
                        };
                    }

                    this.scene.start('Ventana1', estadoSiguiente);

                }
            );

        };

        if (this.musicaGrafo && this.musicaGrafo.isPlaying) {

            this.tweens.add({
                targets: this.musicaGrafo,
                volume: 0,
                duration: 500,
                ease: 'Sine.easeIn',
                onComplete: () => {
                    this.musicaGrafo.stop();
                    hacerTransicion();
                }
            });

        } else {

            hacerTransicion();

        }

    }

}