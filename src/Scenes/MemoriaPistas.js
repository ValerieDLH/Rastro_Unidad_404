export class MemoriaPistas extends Phaser.Scene {
    constructor() {
        super('MemoriaPistas');
    }

    init(data) {
        data = data || {};

        this.puntajeDia = data.puntajeDia || null;
        this.siguienteEstado = data.siguienteEstado || null;
        this.volumenActual = typeof data.volumenActual === 'number' ? data.volumenActual : 0.7;

        this.modoJuego = data.modoJuego || '1P';
        this.jugadores = typeof data.jugadores === 'number'
            ? data.jugadores
            : (this.modoJuego === '2P' ? 2 : 1);

        this.casos = Array.isArray(data.casos) ? data.casos.slice(0, 3) : [];

        this.yaTermino = false;
        this.bloqueado = false;

        this.informeFinalActivo = false;
        this.aInformeAnterior = false;
        this.continuarInformeFinal = null;

        this.cartas = [];
        this.cartasVolteadas = [];
        this.parejasEncontradas = 0;
        this.totalParejas = 10;

        this.puntosMini = 0;
        this.intentos = 0;
        this.aciertos = 0;
        this.errores = 0;

        this.jugadorActual = 1;

        this.selector1 = {
            jugador: 1,
            fila: 0,
            col: 0,
            color: 0x7bb8ff,
            marco: null
        };

        this.selector2 = {
            jugador: 2,
            fila: 3,
            col: 4,
            color: 0xff9a8c,
            marco: null
        };

        this.mandoCooldownJ1 = 0;
        this.mandoCooldownJ2 = 0;
        this.mandoAccionAntesJ1 = false;
        this.mandoAccionAntesJ2 = false;
        this.gamepadConnectedHandler = null;

        this.musicaMinijuegos = null;
        this.volumenMinijuegos = 0.10;
        this.arrastrandoVolMini = false;
        this.pointerMoveVolMiniHandler = null;
        this.pointerUpVolMiniHandler = null;
    }

    preload() {
        this.cargarAudioMinijuego();
    }

    create() {
        this.cameras.main.setBackgroundColor('#041127');

        this.crearFondo();
        this.crearTitulo();
        this.crearControles();
        this.iniciarMandos();
        this.crearHUD();
        this.crearTablero();

        this.actualizarHUD();
        this.actualizarTurnoVisual();

        this.iniciarMusicaMinijuego();
        this.crearBarraVolumenMinijuego();
    }

    update() {
        if (this.yaTermino) {
            this.actualizarAceptarInformeFinalRK();
            return;
        }

        if (this.bloqueado) return;

        if (this.jugadores === 2) {
            if (this.jugadorActual === 1) {
                this.actualizarControlesJugador1();
            } else {
                this.actualizarControlesJugador2();
            }
        } else {
            this.actualizarControlesUnJugador();
        }
    }

    crearFondo() {
        this.add.rectangle(640, 360, 1280, 720, 0x041127, 1);

        for (let i = 0; i < 80; i++) {
            const x = Phaser.Math.Between(0, 1280);
            const y = Phaser.Math.Between(0, 720);

            const punto = this.add.circle(
                x,
                y,
                Phaser.Math.Between(1, 3),
                0x7bb8ff,
                Phaser.Math.FloatBetween(0.08, 0.30)
            );

            this.tweens.add({
                targets: punto,
                alpha: Phaser.Math.FloatBetween(0.04, 0.16),
                duration: Phaser.Math.Between(900, 1700),
                yoyo: true,
                repeat: -1
            });
        }

        const panel = this.add.rectangle(640, 390, 1130, 475, 0x071a3d, 0.72);
        panel.setStrokeStyle(3, 0x77aaff, 0.55);
        panel.setDepth(1);
    }

    crearTitulo() {
        const panel = this.add.rectangle(640, 62, 930, 92, 0x0a1f4d, 0.98);
        panel.setStrokeStyle(3, 0xa9c8ff, 1);

        this.add.text(640, 42, 'MEMORIA DE PISTAS', {
            fontFamily: '"VT323", monospace',
            fontSize: '54px',
            color: '#ffffff',
            stroke: '#071022',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(640, 86, 'Encuentra parejas relacionadas con identidad, cuentas y datos personales.', {
            fontFamily: '"VT323", monospace',
            fontSize: '23px',
            color: '#d7e6ff'
        }).setOrigin(0.5);
    }

    crearControles() {
        this.cursors = this.input.keyboard.createCursorKeys();

        this.keys = this.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D,
            F: Phaser.Input.Keyboard.KeyCodes.F,
            ENTER: Phaser.Input.Keyboard.KeyCodes.ENTER,
            SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE
        });
    }

    iniciarMandos() {
        if (!this.input.gamepad) return;

        if (this.gamepadConnectedHandler) {
            this.input.gamepad.off('connected', this.gamepadConnectedHandler);
        }

        this.gamepadConnectedHandler = (pad) => {
            console.log('Mando conectado:', pad.index, pad.id);
        };

        this.input.gamepad.on('connected', this.gamepadConnectedHandler);
    }

    obtenerMando(jugador = 1) {
        if (!this.input.gamepad) return null;

        const index = jugador === 2 ? 1 : 0;

        if (typeof this.input.gamepad.getPad === 'function') {
            return this.input.gamepad.getPad(index);
        }

        if (this.input.gamepad.gamepads) {
            return this.input.gamepad.gamepads[index] || null;
        }

        return null;
    }

    leerMando(jugador = 1) {
        const pad = this.obtenerMando(jugador);

        if (!pad) {
            return {
                conectado: false,
                izquierda: false,
                derecha: false,
                arriba: false,
                abajo: false,
                accion: false,
                ejeX: 0,
                ejeY: 0
            };
        }

        const ejeX = this.leerEjeMando(pad, 0);
        const ejeY = this.leerEjeMando(pad, 1);

        return {
            conectado: true,

            izquierda: ejeX < -0.35 || this.botonMandoPresionado(pad, 14),
            derecha: ejeX > 0.35 || this.botonMandoPresionado(pad, 15),
            arriba: ejeY < -0.35 || this.botonMandoPresionado(pad, 12),
            abajo: ejeY > 0.35 || this.botonMandoPresionado(pad, 13),

            accion: this.botonMandoPresionado(pad, 0),

            ejeX,
            ejeY
        };
    }

    leerEjeMando(pad, index) {
        if (!pad || !pad.axes || !pad.axes[index]) return 0;

        const eje = pad.axes[index];
        let valor = 0;

        if (typeof eje.getValue === 'function') {
            valor = eje.getValue();
        } else if (typeof eje.value === 'number') {
            valor = eje.value;
        } else if (typeof eje === 'number') {
            valor = eje;
        }

        if (Math.abs(valor) < 0.25) return 0;

        return valor;
    }

    botonMandoPresionado(pad, index) {
        if (!pad || !pad.buttons || !pad.buttons[index]) return false;

        const boton = pad.buttons[index];

        const presionado = boton.pressed === true;
        const valor = typeof boton.value === 'number' ? boton.value : 0;

        return presionado || valor > 0.35;
    }

    botonAMandoPresionado(pad) {
        return (
            this.botonMandoPresionado(pad, 0) ||
            this.botonMandoPresionado(pad, 5) ||
            this.botonMandoPresionado(pad, 8)
        );
    }

    actualizarAceptarInformeFinalRK() {
        if (!this.informeFinalActivo || typeof this.continuarInformeFinal !== 'function') {
            return;
        }

        const pad1 = this.obtenerMando(1);
        const pad2 = this.obtenerMando(2);

        const aPresionado =
            this.botonAMandoPresionado(pad1) ||
            this.botonAMandoPresionado(pad2);

        const aJustDown = aPresionado && !this.aInformeAnterior;

        if (aJustDown) {
            this.continuarInformeFinal();
        }

        this.aInformeAnterior = aPresionado;
    }

    procesarMandoMemoria(selector, numeroMando) {
        if (!selector || this.bloqueado || this.yaTermino) return;

        if (this.jugadores === 2 && selector.jugador !== this.jugadorActual) {
            return;
        }

        const mando = this.leerMando(numeroMando);
        const cooldownKey = numeroMando === 2 ? 'mandoCooldownJ2' : 'mandoCooldownJ1';
        const accionAntesKey = numeroMando === 2 ? 'mandoAccionAntesJ2' : 'mandoAccionAntesJ1';

        if (!mando.conectado) {
            this[accionAntesKey] = false;
            return;
        }

        const ahora = this.time.now;
        const accionJustDown = mando.accion && !this[accionAntesKey];

        this[accionAntesKey] = mando.accion;

        if (ahora < this[cooldownKey]) return;

        if (mando.izquierda) {
            this.moverSelector(selector, -1, 0);
            this[cooldownKey] = ahora + 210;
            return;
        }

        if (mando.derecha) {
            this.moverSelector(selector, 1, 0);
            this[cooldownKey] = ahora + 210;
            return;
        }

        if (mando.arriba) {
            this.moverSelector(selector, 0, -1);
            this[cooldownKey] = ahora + 210;
            return;
        }

        if (mando.abajo) {
            this.moverSelector(selector, 0, 1);
            this[cooldownKey] = ahora + 210;
            return;
        }

        if (accionJustDown) {
            this.voltearCartaSeleccionada(selector);
            this[cooldownKey] = ahora + 280;
        }
    }

    crearHUD() {
        this.panelHUD = this.add.rectangle(640, 145, 1060, 58, 0x0b2356, 0.96);
        this.panelHUD.setStrokeStyle(3, 0xa9c8ff, 1);
        this.panelHUD.setDepth(10);

        this.txtPuntos = this.add.text(145, 145, 'Puntos: 0', {
            fontFamily: '"VT323", monospace',
            fontSize: '28px',
            color: '#8dff9c',
            stroke: '#071022',
            strokeThickness: 4
        }).setOrigin(0, 0.5).setDepth(11);

        this.txtParejas = this.add.text(640, 145, 'Parejas: 0/10', {
            fontFamily: '"VT323", monospace',
            fontSize: '28px',
            color: '#fff2a8',
            stroke: '#071022',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(11);

        this.txtIntentos = this.add.text(1135, 145, 'Intentos: 0', {
            fontFamily: '"VT323", monospace',
            fontSize: '28px',
            color: '#ffffff',
            stroke: '#071022',
            strokeThickness: 4
        }).setOrigin(1, 0.5).setDepth(11);

        this.txtTurno = this.add.text(640, 188, '', {
            fontFamily: '"VT323", monospace',
            fontSize: '26px',
            color: '#fff2a8',
            stroke: '#071022',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(12);

        this.txtFeedback = this.add.text(640, 554, '', {
            fontFamily: '"VT323", monospace',
            fontSize: '25px',
            color: '#ffffff',
            stroke: '#071022',
            strokeThickness: 4,
            align: 'center',
            wordWrap: { width: 1080, useAdvancedWrap: true }
        }).setOrigin(0.5).setDepth(40);

        const textoAyuda = this.jugadores === 2
            ? 'J1: WASD o mando 1 mueve / F o botón A voltea   •   J2: flechas o mando 2 mueve / ENTER o botón A voltea'
            : 'Flechas, WASD o mando mueven el selector   •   ENTER, SPACE, F o botón A voltean la carta';

        this.txtAyuda = this.add.text(640, 610, textoAyuda, {
            fontFamily: '"VT323", monospace',
            fontSize: '23px',
            color: '#dcecff',
            stroke: '#071022',
            strokeThickness: 4,
            align: 'center',
            wordWrap: { width: 1120, useAdvancedWrap: true }
        }).setOrigin(0.5).setDepth(12);

        this.panelValidaciones = this.add.rectangle(640, 668, 1160, 74, 0x091427, 0.88);
        this.panelValidaciones.setStrokeStyle(2, 0x78a7ff, 1);
        this.panelValidaciones.setDepth(11);

        this.txtValidacionesTitulo = this.add.text(640, 637, 'PAREJAS VÁLIDAS', {
            fontFamily: '"VT323", monospace',
            fontSize: '19px',
            color: '#fff2a8',
            stroke: '#071022',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(12);

        this.txtValidaciones = this.add.text(640, 673, this.obtenerTextoValidaciones(), {
            fontFamily: '"VT323", monospace',
            fontSize: '16px',
            color: '#e6f2ff',
            stroke: '#071022',
            strokeThickness: 3,
            align: 'center',
            wordWrap: { width: 1120, useAdvancedWrap: true },
            lineSpacing: 1
        }).setOrigin(0.5).setDepth(12);
    }

    obtenerTextoValidaciones() {
        return [
            'Perfil falso ↔ Suplantación  |  Cuenta ajena ↔ Acceso no autorizado  |  Número privado ↔ Datos personales  |  Fotos privadas ↔ Uso indebido  |  Contraseña ↔ Delito informático',
            'Ubicación ↔ Dato sensible  |  Nombre parecido ↔ Confusión identidad  |  Biografía ↔ Manipular cuenta  |  Capturas ↔ Info privada  |  Contactos ↔ Info personal'
        ].join('\n');
    }

    crearDatosCartas() {
        const parejas = [
            {
                id: 'suplantacion',
                a: 'Perfil falso',
                b: 'Suplantación',
                explicacion: 'Usar nombre o foto de otra persona para hacerse pasar por ella.'
            },
            {
                id: 'cuenta_real',
                a: 'Cuenta ajena',
                b: 'Acceso no autorizado',
                explicacion: 'Ingresar a una cuenta real sin permiso.'
            },
            {
                id: 'datos',
                a: 'Número privado',
                b: 'Datos personales',
                explicacion: 'Compartir información privada sin autorización.'
            },
            {
                id: 'foto',
                a: 'Fotos privadas',
                b: 'Uso indebido',
                explicacion: 'Enviar imágenes personales sin permiso.'
            },
            {
                id: 'clave',
                a: 'Contraseña',
                b: 'Delito informático',
                explicacion: 'Usar claves de otra persona para entrar a sus cuentas.'
            },
            {
                id: 'ubicacion',
                a: 'Ubicación',
                b: 'Dato sensible',
                explicacion: 'Publicar dónde está alguien puede ponerlo en riesgo.'
            },
            {
                id: 'nombre_falso',
                a: 'Nombre parecido',
                b: 'Confusión identidad',
                explicacion: 'Usar un nombre similar para engañar a otros.'
            },
            {
                id: 'biografia',
                a: 'Biografía',
                b: 'Manipular cuenta',
                explicacion: 'Modificar un perfil ajeno sin permiso.'
            },
            {
                id: 'capturas',
                a: 'Capturas',
                b: 'Info privada',
                explicacion: 'Mover capturas personales también puede causar daño.'
            },
            {
                id: 'contactos',
                a: 'Contactos',
                b: 'Info personal',
                explicacion: 'Los contactos también hacen parte de la privacidad.'
            }
        ];

        const cartas = [];

        parejas.forEach((par, index) => {
            cartas.push({
                idPareja: par.id,
                texto: par.a,
                explicacion: par.explicacion,
                encontrada: false,
                volteada: false,
                tipo: 'pista',
                orden: index
            });

            cartas.push({
                idPareja: par.id,
                texto: par.b,
                explicacion: par.explicacion,
                encontrada: false,
                volteada: false,
                tipo: 'delito',
                orden: index
            });
        });

        return Phaser.Utils.Array.Shuffle(cartas);
    }

    crearTablero() {
        const datos = this.crearDatosCartas();

        const filas = 4;
        const cols = 5;

        const startX = 240;
        const startY = 245;
        const gapX = 200;
        const gapY = 82;

        let index = 0;

        for (let fila = 0; fila < filas; fila++) {
            for (let col = 0; col < cols; col++) {
                const x = startX + col * gapX;
                const y = startY + fila * gapY;

                const data = datos[index];

                const carta = {
                    ...data,
                    fila,
                    col,
                    x,
                    y,
                    index,
                    ancho: 158,
                    alto: 62,
                    fondo: null,
                    textoObj: null,
                    tapa: null,
                    textoTapa: null
                };

                this.crearCartaVisual(carta);
                this.cartas.push(carta);

                index++;
            }
        }

        this.crearSelector(this.selector1);

        if (this.jugadores === 2) {
            this.crearSelector(this.selector2);
        }
    }

    crearCartaVisual(carta) {
        carta.fondo = this.add.rectangle(carta.x, carta.y, carta.ancho, carta.alto, 0xf4e5bd, 1);
        carta.fondo.setStrokeStyle(3, 0x8a5a2b, 1);
        carta.fondo.setDepth(20);

        carta.textoObj = this.add.text(carta.x, carta.y, carta.texto, {
            fontFamily: '"VT323", monospace',
            fontSize: '21px',
            color: '#2b1a10',
            align: 'center',
            wordWrap: { width: carta.ancho - 18, useAdvancedWrap: true }
        }).setOrigin(0.5).setDepth(21);

        carta.tapa = this.add.rectangle(carta.x, carta.y, carta.ancho, carta.alto, 0x1d376e, 1);
        carta.tapa.setStrokeStyle(3, 0x9ecbff, 1);
        carta.tapa.setDepth(22);

        carta.textoTapa = this.add.text(carta.x, carta.y, '?', {
            fontFamily: '"VT323", monospace',
            fontSize: '38px',
            color: '#ffffff',
            stroke: '#071022',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(23);
    }

    crearSelector(selector) {
        const carta = this.obtenerCartaPorPos(selector.fila, selector.col);

        selector.marco = this.add.rectangle(
            carta.x,
            carta.y,
            carta.ancho + 16,
            carta.alto + 16,
            0x000000,
            0
        );

        selector.marco.setStrokeStyle(5, selector.color, 1);
        selector.marco.setDepth(35);

        this.tweens.add({
            targets: selector.marco,
            scaleX: 1.04,
            scaleY: 1.08,
            duration: 420,
            yoyo: true,
            repeat: -1
        });
    }

    actualizarTurnoVisual() {
        if (this.jugadores === 1) {
            if (this.txtTurno) {
                this.txtTurno.setText('Modo 1 Player');
            }

            if (this.selector1.marco) {
                this.selector1.marco.setAlpha(1);
            }

            return;
        }

        if (this.txtTurno) {
            this.txtTurno.setText(`Turno del Jugador ${this.jugadorActual}`);
            this.txtTurno.setColor(this.jugadorActual === 1 ? '#9ecbff' : '#ffb2a8');
        }

        if (this.selector1.marco) {
            this.selector1.marco.setAlpha(this.jugadorActual === 1 ? 1 : 0.22);
        }

        if (this.selector2.marco) {
            this.selector2.marco.setAlpha(this.jugadorActual === 2 ? 1 : 0.22);
        }
    }

    cambiarTurno() {
        if (this.jugadores !== 2) return;

        this.jugadorActual = this.jugadorActual === 1 ? 2 : 1;
        this.actualizarTurnoVisual();
    }

    moverSelector(selector, dx, dy) {
        if (!selector || this.bloqueado) return;

        if (this.jugadores === 2 && selector.jugador !== this.jugadorActual) {
            return;
        }

        selector.col = Phaser.Math.Clamp(selector.col + dx, 0, 4);
        selector.fila = Phaser.Math.Clamp(selector.fila + dy, 0, 3);

        const carta = this.obtenerCartaPorPos(selector.fila, selector.col);

        if (carta && selector.marco) {
            selector.marco.x = carta.x;
            selector.marco.y = carta.y;
        }

        this.reproducirClick(0.16);
    }

    obtenerCartaPorPos(fila, col) {
        return this.cartas.find(carta => carta.fila === fila && carta.col === col);
    }

    actualizarControlesUnJugador() {
        if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.keys.A)) {
            this.moverSelector(this.selector1, -1, 0);
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || Phaser.Input.Keyboard.JustDown(this.keys.D)) {
            this.moverSelector(this.selector1, 1, 0);
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.keys.W)) {
            this.moverSelector(this.selector1, 0, -1);
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursors.down) || Phaser.Input.Keyboard.JustDown(this.keys.S)) {
            this.moverSelector(this.selector1, 0, 1);
        }

        if (
            Phaser.Input.Keyboard.JustDown(this.keys.ENTER) ||
            Phaser.Input.Keyboard.JustDown(this.keys.SPACE) ||
            Phaser.Input.Keyboard.JustDown(this.keys.F)
        ) {
            this.voltearCartaSeleccionada(this.selector1);
        }

        this.procesarMandoMemoria(this.selector1, 1);
    }

    actualizarControlesJugador1() {
        if (Phaser.Input.Keyboard.JustDown(this.keys.A)) {
            this.moverSelector(this.selector1, -1, 0);
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.D)) {
            this.moverSelector(this.selector1, 1, 0);
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.W)) {
            this.moverSelector(this.selector1, 0, -1);
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.S)) {
            this.moverSelector(this.selector1, 0, 1);
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.F)) {
            this.voltearCartaSeleccionada(this.selector1);
        }

        this.procesarMandoMemoria(this.selector1, 1);
    }

    actualizarControlesJugador2() {
        if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
            this.moverSelector(this.selector2, -1, 0);
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
            this.moverSelector(this.selector2, 1, 0);
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            this.moverSelector(this.selector2, 0, -1);
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
            this.moverSelector(this.selector2, 0, 1);
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.ENTER)) {
            this.voltearCartaSeleccionada(this.selector2);
        }

        this.procesarMandoMemoria(this.selector2, 2);
    }

    voltearCartaSeleccionada(selector) {
        if (this.bloqueado) return;

        if (this.jugadores === 2 && selector.jugador !== this.jugadorActual) {
            return;
        }

        const carta = this.obtenerCartaPorPos(selector.fila, selector.col);

        if (!carta || carta.volteada || carta.encontrada) return;
        if (this.cartasVolteadas.length >= 2) return;

        carta.volteada = true;
        carta.jugadorQueVolteo = selector.jugador;

        this.reproducirSFX('click', 0.45);

        this.tweens.add({
            targets: [carta.tapa, carta.textoTapa],
            alpha: 0,
            duration: 160
        });

        this.cartasVolteadas.push(carta);

        if (this.cartasVolteadas.length === 2) {
            this.bloqueado = true;
            this.intentos += 1;

            this.time.delayedCall(700, () => {
                this.revisarPareja();
            });
        }

        this.actualizarHUD();
    }

    revisarPareja() {
        const [c1, c2] = this.cartasVolteadas;

        if (!c1 || !c2) {
            this.cartasVolteadas = [];
            this.bloqueado = false;
            return;
        }

        if (c1.idPareja === c2.idPareja && c1.index !== c2.index) {
            this.reproducirSFX('collect', 0.7);

            c1.encontrada = true;
            c2.encontrada = true;

            this.parejasEncontradas += 1;
            this.aciertos += 1;
            this.puntosMini += 10;

            this.txtFeedback.setColor('#8dff9c');

            const textoJugador = this.jugadores === 2
                ? `Jugador ${this.jugadorActual} encontró pareja +10`
                : '¡Pareja encontrada! +10';

            this.txtFeedback.setText(`${textoJugador}\n${c1.explicacion}`);

            this.tweens.add({
                targets: [c1.fondo, c2.fondo],
                scaleX: 1.06,
                scaleY: 1.10,
                duration: 160,
                yoyo: true
            });

            this.cartasVolteadas = [];
            this.bloqueado = false;

            if (this.parejasEncontradas >= this.totalParejas) {
                this.time.delayedCall(700, () => {
                    this.mostrarInformeFinal();
                });
                this.actualizarHUD();
                return;
            }

            this.cambiarTurno();
        } else {
            this.reproducirSFX('wrong', 0.75);

            this.errores += 1;
            this.puntosMini = Math.max(0, this.puntosMini - 3);

            this.txtFeedback.setColor('#ffb2b2');

            const textoJugador = this.jugadores === 2
                ? `Jugador ${this.jugadorActual}: no era pareja -3`
                : 'No era pareja -3';

            this.txtFeedback.setText(textoJugador);

            this.time.delayedCall(750, () => {
                this.ocultarCarta(c1);
                this.ocultarCarta(c2);

                this.cartasVolteadas = [];
                this.bloqueado = false;

                this.cambiarTurno();
            });
        }

        this.actualizarHUD();

        this.time.delayedCall(1900, () => {
            if (this.txtFeedback && this.txtFeedback.active) {
                this.txtFeedback.setText('');
            }
        });
    }

    ocultarCarta(carta) {
        if (!carta || carta.encontrada) return;

        carta.volteada = false;
        carta.jugadorQueVolteo = null;

        this.tweens.add({
            targets: [carta.tapa, carta.textoTapa],
            alpha: 1,
            duration: 160
        });
    }

    actualizarHUD() {
        if (this.txtPuntos) {
            this.txtPuntos.setText(`Puntos: ${this.puntosMini}`);
        }

        if (this.txtParejas) {
            this.txtParejas.setText(`Parejas: ${this.parejasEncontradas}/${this.totalParejas}`);
        }

        if (this.txtIntentos) {
            this.txtIntentos.setText(`Intentos: ${this.intentos}`);
        }
    }

    calcularBonusTotal() {
        return this.puntosMini;
    }

    reproducirClick(volumen = 0.35) {
        if (this.cache.audio.exists('click')) {
            this.sound.play('click', { volume: volumen });
        }
    }

    mostrarInformeFinal() {
        if (this.yaTermino) return;

        this.yaTermino = true;
        this.bloqueado = true;

        this.informeFinalActivo = true;
        this.aInformeAnterior = false;
        this.continuarInformeFinal = null;

        const bonus = this.calcularBonusTotal();
        const puntajeBase = this.puntajeDia || {};

        const puntajeActualizado = {
            ...puntajeBase,
            bonusMinijuego: bonus,
            totalBruto: (puntajeBase.totalBruto || 0) + bonus,
            total: (puntajeBase.total || 0) + bonus
        };

        const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.72);
        overlay.setDepth(100);

        const papel = this.add.rectangle(640, 360, 1080, 660, 0xf4e5bd, 1);
        papel.setStrokeStyle(5, 0x8a5a2b, 1);
        papel.setDepth(101);

        this.add.text(640, 66, 'INFORME DE MEMORIA DE PISTAS', {
            fontFamily: '"VT323", monospace',
            fontSize: '41px',
            color: '#40291a',
            stroke: '#fff0c8',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(102);

        this.add.text(640, 103, 'Personas responsables y sanciones correspondientes del Día 4', {
            fontFamily: '"VT323", monospace',
            fontSize: '24px',
            color: '#5a3921'
        }).setOrigin(0.5).setDepth(102);

        this.add.text(640, 133, `Bonus total: ${bonus} pts  •  Parejas: ${this.parejasEncontradas}/10  •  Intentos: ${this.intentos}`, {
            fontFamily: '"VT323", monospace',
            fontSize: '22px',
            color: '#7a4a28'
        }).setOrigin(0.5).setDepth(102);

        let y = 168;

        if (this.casos.length > 0) {
            this.casos.forEach((caso, index) => {
                const bloque = this.add.rectangle(640, y + 70, 930, 145, 0xfff5d9, 1);
                bloque.setStrokeStyle(3, 0xc08a45, 1);
                bloque.setDepth(102);

                this.add.text(205, y + 8, `${index + 1}. Persona identificada: ${caso.nombre}`, {
                    fontFamily: '"VT323", monospace',
                    fontSize: '25px',
                    color: '#2b1a10'
                }).setDepth(103);

                this.add.text(205, y + 36, `Delito cometido: ${caso.delito}`, {
                    fontFamily: '"VT323", monospace',
                    fontSize: '22px',
                    color: '#2b1a10'
                }).setDepth(103);

                this.add.text(205, y + 64, `Sanción correspondiente: ${caso.sancionTexto || caso.sancionCorta}`, {
                    fontFamily: '"VT323", monospace',
                    fontSize: '19px',
                    color: '#5a3921',
                    wordWrap: { width: 850, useAdvancedWrap: true }
                }).setDepth(103);

                this.add.text(205, y + 98, `Significado: ${caso.significadoSancion || 'Esta sanción corresponde al daño causado por la conducta detectada.'}`, {
                    fontFamily: '"VT323", monospace',
                    fontSize: '18px',
                    color: '#5a3921',
                    wordWrap: { width: 850, useAdvancedWrap: true }
                }).setDepth(103);

                y += 153;
            });
        }

        const btn = this.add.rectangle(640, 675, 320, 52, 0x2d82ff, 1);
        btn.setStrokeStyle(3, 0xffffff, 1);
        btn.setDepth(104);

        this.add.text(640, 675, 'CONTINUAR', {
            fontFamily: '"VT323", monospace',
            fontSize: '32px',
            color: '#ffffff',
            stroke: '#071021',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(105);

        this.add.text(640, 710, 'Presiona A en RK Game o haz clic para continuar', {
            fontFamily: '"VT323", monospace',
            fontSize: '21px',
            color: '#40291a'
        }).setOrigin(0.5).setDepth(105);

        const zone = this.add.zone(640, 675, 320, 52);
        zone.setInteractive({ cursor: 'pointer' });
        zone.setDepth(106);

        zone.on('pointerover', () => {
            btn.setFillStyle(0x4b9bff, 1);
        });

        zone.on('pointerout', () => {
            btn.setFillStyle(0x2d82ff, 1);
        });

        const continuar = () => {
            if (!this.informeFinalActivo) return;

            this.informeFinalActivo = false;
            this.reproducirClick();

            this.cameras.main.fadeOut(350, 0, 0, 0);

            this.time.delayedCall(350, () => {
                this.scene.start('PuntajeDia', {
                    puntajeDia: puntajeActualizado,
                    siguienteEstado: this.siguienteEstado,
                    modoJuego: this.modoJuego,
                    jugadores: this.jugadores,
                    resultadoMinijuego: {
                        bonus,
                        parejas: this.parejasEncontradas,
                        intentos: this.intentos,
                        aciertos: this.aciertos,
                        errores: this.errores
                    }
                });
            });
        };

        this.continuarInformeFinal = continuar;

        zone.on('pointerdown', continuar);
    }

    cargarAudioMinijuego() {
        if (!this.cache.audio.exists('musicaMinijuegos')) {
            this.load.audio('musicaMinijuegos', 'music/Minijuegos.mp3');
        }

        if (!this.cache.audio.exists('collect')) {
            this.load.audio('collect', 'music/Collect.mp3');
        }

        if (!this.cache.audio.exists('wrong')) {
            this.load.audio('wrong', 'music/wrong.mp3');
        }

        if (!this.cache.audio.exists('disparo')) {
            this.load.audio('disparo', 'music/disparo.mp3');
        }

        if (!this.cache.audio.exists('enter')) {
            this.load.audio('enter', 'music/enter.mp3');
        }

        if (!this.cache.audio.exists('click')) {
            this.load.audio('click', 'music/click.mp3');
        }
    }

    _obtenerVolumenMinijuego() {
        let volumen = this.game.registry.get('volumenMinijuegos');

        if (typeof volumen !== 'number') {
            volumen = 0.10;
            this.game.registry.set('volumenMinijuegos', volumen);
        }

        return Phaser.Math.Clamp(volumen, 0, 1);
    }

    _setVolumenMinijuego(volumen) {
        volumen = Phaser.Math.Clamp(volumen, 0, 1);

        this.volumenMinijuegos = volumen;
        this.game.registry.set('volumenMinijuegos', volumen);
        this.game.registry.set('volumenGlobal', volumen);

        if (this.musicaMinijuegos) {
            this.musicaMinijuegos.setVolume(volumen);
        }

        if (this.volFillMini) {
            this.volFillMini.width = 120 * volumen;
        }

        if (this.volKnobMini) {
            this.volKnobMini.x = this.volBarXMini - 60 + 120 * volumen;
        }

        if (this.volTxtMini) {
            this.volTxtMini.setText(`VOL ${Math.round(volumen * 100)}%`);
        }
    }

    iniciarMusicaMinijuego() {
        this.volumenMinijuegos = this._obtenerVolumenMinijuego();

        if (this.cache.audio.exists('musicaMinijuegos')) {
            this.musicaMinijuegos = this.sound.add('musicaMinijuegos', {
                volume: this.volumenMinijuegos,
                loop: true
            });

            this.musicaMinijuegos.play();
        }

        this.events.off('shutdown', this.detenerAudioMinijuego, this);
        this.events.off('destroy', this.detenerAudioMinijuego, this);

        this.events.on('shutdown', this.detenerAudioMinijuego, this);
        this.events.on('destroy', this.detenerAudioMinijuego, this);
    }

    crearBarraVolumenMinijuego() {
        this.volBarXMini = 1130;
        this.volBarYMini = 42;
        this.arrastrandoVolMini = false;

        const bg = this.add.rectangle(this.volBarXMini, this.volBarYMini, 150, 34, 0x071022, 0.82);
        bg.setStrokeStyle(2, 0x9ecbff, 1);
        bg.setDepth(300);

        this.volTxtMini = this.add.text(this.volBarXMini, this.volBarYMini - 25, '', {
            fontFamily: '"VT323", monospace',
            fontSize: '18px',
            color: '#ffffff',
            stroke: '#071022',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(301);

        const track = this.add.rectangle(this.volBarXMini, this.volBarYMini, 120, 7, 0x23385f, 1);
        track.setDepth(301);

        this.volFillMini = this.add.rectangle(this.volBarXMini - 60, this.volBarYMini, 1, 7, 0x8dff9c, 1);
        this.volFillMini.setOrigin(0, 0.5);
        this.volFillMini.setDepth(302);

        this.volKnobMini = this.add.circle(this.volBarXMini - 60, this.volBarYMini, 9, 0xffffff, 1);
        this.volKnobMini.setStrokeStyle(2, 0x071022, 1);
        this.volKnobMini.setDepth(303);

        const zona = this.add.zone(this.volBarXMini, this.volBarYMini, 140, 34);
        zona.setInteractive({ cursor: 'pointer' });
        zona.setDepth(304);

        const moverVolumen = (pointer) => {
            const minX = this.volBarXMini - 60;
            const maxX = this.volBarXMini + 60;
            const nuevoVol = Phaser.Math.Clamp((pointer.x - minX) / (maxX - minX), 0, 1);

            this._setVolumenMinijuego(nuevoVol);
        };

        zona.on('pointerdown', (pointer) => {
            this.arrastrandoVolMini = true;
            moverVolumen(pointer);
        });

        this.pointerMoveVolMiniHandler = (pointer) => {
            if (this.arrastrandoVolMini) {
                moverVolumen(pointer);
            }
        };

        this.pointerUpVolMiniHandler = () => {
            this.arrastrandoVolMini = false;
        };

        this.input.on('pointermove', this.pointerMoveVolMiniHandler);
        this.input.on('pointerup', this.pointerUpVolMiniHandler);

        this._setVolumenMinijuego(this.volumenMinijuegos);
    }

    reproducirSFX(clave, volumenBase = 0.6) {
        if (!this.cache.audio.exists(clave)) return;

        const volumenEscena = typeof this.volumenMinijuegos === 'number'
            ? this.volumenMinijuegos
            : this._obtenerVolumenMinijuego();

        let ajuste = 1;

        if (clave === 'collect') {
            ajuste = 0.55;
        }

        if (clave === 'wrong') {
            ajuste = 0.50;
        }

        const volumenFinal = Phaser.Math.Clamp(
            volumenBase * ajuste * (0.35 + volumenEscena),
            0,
            1
        );

        this.sound.play(clave, {
            volume: volumenFinal
        });
    }

    detenerAudioMinijuego() {
        if (this.gamepadConnectedHandler && this.input.gamepad) {
            this.input.gamepad.off('connected', this.gamepadConnectedHandler);
            this.gamepadConnectedHandler = null;
        }

        if (this.pointerMoveVolMiniHandler) {
            this.input.off('pointermove', this.pointerMoveVolMiniHandler);
            this.pointerMoveVolMiniHandler = null;
        }

        if (this.pointerUpVolMiniHandler) {
            this.input.off('pointerup', this.pointerUpVolMiniHandler);
            this.pointerUpVolMiniHandler = null;
        }

        if (this.musicaMinijuegos) {
            if (this.musicaMinijuegos.isPlaying) {
                this.musicaMinijuegos.stop();
            }

            this.musicaMinijuegos.destroy();
            this.musicaMinijuegos = null;
        }
    }
}