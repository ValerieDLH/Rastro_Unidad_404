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

        if (!this.cache.audio.exists('musicaGrafo')){
            this.load.audio('musicaGrafo', 'music/b5.mp3' )
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
            left: 45,
            right: 1160,
            top: 108,
            bottom: 505
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
                ESC: Phaser.Input.Keyboard.KeyCodes.ESC
            });

        this.estadoBotonesGamepad = {};

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
            console.warn('RK Game no disponible:', error);
        }

    }

    actualizarControlesRK() {

        if (!this.teclas) return;

        const izquierda =
            Phaser.Input.Keyboard.JustDown(this.teclas.LEFT)
            ||
            Phaser.Input.Keyboard.JustDown(this.teclas.A)
            ||
            this._botonGamepadJustPressed('LEFT');

        const derecha =
            Phaser.Input.Keyboard.JustDown(this.teclas.RIGHT)
            ||
            Phaser.Input.Keyboard.JustDown(this.teclas.D)
            ||
            this._botonGamepadJustPressed('RIGHT');

        const aceptar =
            Phaser.Input.Keyboard.JustDown(this.teclas.ENTER)
            ||
            Phaser.Input.Keyboard.JustDown(this.teclas.SPACE)
            ||
            this._botonGamepadJustPressed('A');

        const cerrar =
            Phaser.Input.Keyboard.JustDown(this.teclas.ESC);

        const presionarX =
            Phaser.Input.Keyboard.JustDown(this.teclas.X)
            ||
            this._botonGamepadJustPressed('X');

        const presionarB =
            Phaser.Input.Keyboard.JustDown(this.teclas.B)
            ||
            this._botonGamepadJustPressed('B');

        const continuarR1 =
            Phaser.Input.Keyboard.JustDown(this.teclas.R)
            ||
            this._botonGamepadJustPressed('R1');

        if (this.modalAbierto) {

            if (cerrar || aceptar || presionarB) {
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

    _botonGamepadJustPressed(nombre) {

        const mapa = {
            A: [0],
            B: [1],
            X: [2, 3],
            Y: [3],
            L1: [4, 6],
            R1: [5, 7],
            SELECT: [8],
            START: [9],
            UP: [12],
            DOWN: [13],
            LEFT: [14],
            RIGHT: [15]
        };

        const indices =
            mapa[nombre];

        if (!indices) return false;

        const gamepadPlugin =
            this.input && this.input.gamepad
                ? this.input.gamepad
                : null;

        if (!gamepadPlugin) {
            this.estadoBotonesGamepad[nombre] = false;
            return false;
        }

        let pad = null;

        if (typeof gamepadPlugin.getPad === 'function') {
            pad = gamepadPlugin.getPad(0);
        }

        else if (
            gamepadPlugin.gamepads
            &&
            gamepadPlugin.gamepads.length > 0
        ) {
            pad = gamepadPlugin.gamepads[0];
        }

        else if (typeof gamepadPlugin.getAll === 'function') {
            const pads = gamepadPlugin.getAll();
            pad = pads && pads.length > 0 ? pads[0] : null;
        }

        if (!pad || !pad.buttons) {
            this.estadoBotonesGamepad[nombre] = false;
            return false;
        }

        const presionado =
            indices.some(index => {

                const boton =
                    pad.buttons[index];

                if (!boton) return false;

                return (
                    boton.pressed === true
                    ||
                    boton.value > 0.35
                );

            });

        const antes =
            this.estadoBotonesGamepad[nombre] || false;

        this.estadoBotonesGamepad[nombre] = presionado;

        return presionado && !antes;

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

        const origen =
            this.obtenerNodoOrigen();

        const destino =
            this.obtenerNodoDestino();

        if (origen) {
            origen.x = 115;
            origen.y = 300;
        }

        if (destino) {
            destino.x = 1115;
            destino.y = 300;
        }

        const posicionesPorNombre = {

            Adam: { x: 285, y: 165 },
            Alma: { x: 455, y: 238 },
            Allison: { x: 625, y: 385 },

            Camilo: { x: 440, y: 130 },
            Clara: { x: 440, y: 360 },
            Cora: { x: 600, y: 145 },

            Eva: { x: 625, y: 270 },
            Fabio: { x: 625, y: 425 },
            Irene: { x: 760, y: 130 },

            Leo: { x: 790, y: 225 },
            Lina: { x: 805, y: 320 },
            Lucas: { x: 795, y: 410 },
            Luis: { x: 900, y: 235 },
            Luisa: { x: 900, y: 410 },

            Ronald: { x: 900, y: 135 },
            Sofia: { x: 995, y: 190 },
            Rosa: { x: 955, y: 295 },
            Ruben: { x: 995, y: 365 },
            Sara: { x: 930, y: 430 }

        };

        this.nodos.forEach(nodo => {

            if (nodo.esOrigen || nodo.esVictima) return;

            const pos =
                posicionesPorNombre[nodo.nombre];

            if (pos) {
                nodo.x = pos.x;
                nodo.y = pos.y;
            }

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

        this.aristasVisuales = [];
        this.nodosVisuales = [];

        this.aristas.forEach(arista => {

            const g =
                this.add.graphics();

            g.setDepth(5);
            arista.graphics = g;

            this._dibujarArista(
                arista,
                0x9fc7ff,
                this.nodos.length >= 14 ? 2 : 3,
                0.46
            );

            const textoPeso =
                this.add.text(
                    0,
                    0,
                    `${arista.peso}`,
                    {
                        fontFamily: '"VT323", monospace',
                        fontSize:
                            this.nodos.length >= 14
                                ? '14px'
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
                        fontSize:
                            radio <= 14
                                ? '10px'
                                : '12px',
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

            const nombre =
                this.add.text(
                    0,
                    radio + 8,
                    nodo.nombre,
                    {
                        fontFamily: '"VT323", monospace',
                        fontSize:
                            this.nodos.length >= 14
                                ? '10px'
                                : '12px',
                        color: '#ffffff',
                        stroke: '#071022',
                        strokeThickness: 3,
                        align: 'center',
                        wordWrap: { width: 76 }
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

        this.aristas.forEach(a => {

            if (a.graphics) {
                this._dibujarArista(
                    a,
                    0x9fc7ff,
                    this.nodos.length >= 14 ? 2 : 3,
                    0.46
                );
            }

            if (a.textoPeso) {
                a.textoPeso.setColor('#fff2a8');
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

            if (coincide) {

                this._dibujarArista(
                    a,
                    color,
                    grosor,
                    1
                );

                if (a.textoPeso) {
                    a.textoPeso.setColor('#ffffff');
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
            185,
            112,
            'VER BFS',
            0x2f8f46,
            () => {
                this.animarSoloBFS();
            }
        );

        this._crearBotonRecorrido(
            350,
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
                this._ordenarVecinosPorPosicion(vecinos);

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
                        `Recorrido BFS:\n`
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
                    `Recorrido BFS:\n`
                    + `${this._partirRutaPorCantidad(ruta, 3)}\n\n`
                    + `Ayuda al caso:\n`
                    + `Permite ver quiénes están más cerca del inicio del ataque.`
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
                'Dijkstra encuentra la ruta más corta\n' +
                ' hacia Valeria. Cada peso representa\n' +
                ' qué tan difícil es acceder a esa\n' +
                ' persona del caso, priorizando\n' +
                ' siempre el menor costo acumulado.'
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
                'Dijkstra halla la ruta de menor costo\n' +
                'en grafos con pesos positivos. Visita\n' +
                'siempre el nodo más cercano aún no' +
                'procesado, garantizando el camino' +
                'óptimo al llegar a cada nodo.'
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
                        + this._listaLimitada(conexiones, 4)
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
                    + this._listaLimitada(lista, 4)
                );

                this.txtAyuda.setText(
                    'Prim reconstruye la red mínima del\n' +
                    ' caso, conectando a todos los\n' +
                    ' implicados con las relaciones más\n' +
                    ' directas, revelando la estructura\n' +
                    ' central de la investigación.'               
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
                        + this._rutaCorta(nombres, 4)
                    );

                    this.txtRecorrido.setText(
                        `Caminos de impacto:\n`
                        + this._listaLimitada(lineas, 4)
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
                    'Ford-Fulkerson mide cuánta influencia\n' +
                    ' puede llegar a Valeria. Cada camino\n' +
                    ' encontrado representa una vía por\n' +
                    ' donde el caso pudo propagarse\n' +
                    ' hasta afectarla directamente.'
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
            'BFS y DFS mapean la red de contactos.\n' +
            ' Dijkstra traza la ruta de acceso,\n' +
            ' Prim revela las conexiones clave y\n' +
            ' Ford mide el impacto total sobre\n' +
            ' Valeria. Todos apuntan al culpable.'
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

                    this.scene.start(
                        'Ventana1',
                        {
                            ...this.siguienteEstado,
                            diaActual: this.diaActual + 1
                        }
                    );

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