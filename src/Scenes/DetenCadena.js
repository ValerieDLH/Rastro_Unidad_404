export class DetenCadena extends Phaser.Scene {
    constructor() {
        super('DetenCadena');
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
        this.finalizando = false;

        this.informeFinalActivo = false;
        this.aInformeAnterior = false;
        this.continuarInformeFinal = null;

        this.acciones = [
            { id: 'bloquear', texto: 'BLOQUEAR' },
            { id: 'reportar', texto: 'REPORTAR' },
            { id: 'pasar', texto: 'DEJAR PASAR' }
        ];

        this.jugador1 = null;
        this.jugador2 = null;

        this.musicaMinijuegos = null;
        this.volumenMinijuegos = 0.10;
        this.arrastrandoVolMini = false;
        this.pointerMoveVolMiniHandler = null;
        this.pointerUpVolMiniHandler = null;
        this.mandoCooldownJ1 = 0;
        this.mandoCooldownJ2 = 0;
    }

    preload() {
        this.cargarAudioMinijuego();
    }

    create() {
        this.cameras.main.setBackgroundColor('#031027');

        this.crearFondoNuevo();
        this.crearTitulo();
        this.crearControles();
        this.iniciarMandos();

        if (this.jugadores === 2) {
            this.crearModoDosJugadores();
        } else {
            this.crearModoUnJugador();
        }

        this.iniciarMusicaMinijuego();
        this.crearBarraVolumenMinijuego();
    }
    update() {
        if (this.yaTermino) {
            this.actualizarAceptarInformeFinalRK();
            return;
        }

        if (this.jugadores === 2) {
            this.actualizarControlesJugador1();
            this.actualizarControlesJugador2();
        } else {
            this.actualizarControlesUnJugador();
        }
    }

    crearFondoNuevo() {
        this.add.rectangle(640, 360, 1280, 720, 0x06122f, 1);

        for (let i = 0; i < 70; i++) {
            const x = Phaser.Math.Between(0, 1280);
            const y = Phaser.Math.Between(0, 720);
            const punto = this.add.circle(
                x,
                y,
                Phaser.Math.Between(1, 3),
                0x7bb8ff,
                Phaser.Math.FloatBetween(0.07, 0.28)
            );

            this.tweens.add({
                targets: punto,
                alpha: Phaser.Math.FloatBetween(0.04, 0.16),
                duration: Phaser.Math.Between(900, 1700),
                yoyo: true,
                repeat: -1
            });
        }

        const pantalla = this.add.rectangle(640, 390, 1110, 500, 0x071a3d, 0.72);
        pantalla.setStrokeStyle(3, 0x77aaff, 0.55);
        pantalla.setDepth(1);

        this.add.text(640, 635, 'SIMULACIÓN DE RED SOCIAL', {
            fontFamily: '"VT323", monospace',
            fontSize: '26px',
            color: '#9ecbff',
            stroke: '#071022',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(2);
    }

    crearTitulo() {
        const panel = this.add.rectangle(640, 62, 930, 92, 0x0a1f4d, 0.98);
        panel.setStrokeStyle(3, 0xa9c8ff, 1);

        this.add.text(640, 42, 'EL FILTRO DE LA RED', {
            fontFamily: '"VT323", monospace',
            fontSize: '52px',
            color: '#ffffff',
            stroke: '#071022',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(640, 86, 'Te llegó un mensaje. Decide si debes bloquear, reportar o dejarlo pasar.', {
            fontFamily: '"VT323", monospace',
            fontSize: '24px',
            color: '#d7e6ff'
        }).setOrigin(0.5);
    }

    crearControles() {
        this.cursors = this.input.keyboard.createCursorKeys();

        this.keys = this.input.keyboard.addKeys({
            A: Phaser.Input.Keyboard.KeyCodes.A,
            D: Phaser.Input.Keyboard.KeyCodes.D,
            W: Phaser.Input.Keyboard.KeyCodes.W,
            LEFT: Phaser.Input.Keyboard.KeyCodes.LEFT,
            RIGHT: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            UP: Phaser.Input.Keyboard.KeyCodes.UP,
            SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE,
            ENTER: Phaser.Input.Keyboard.KeyCodes.ENTER
        });
    }

    iniciarMandos() {
        if (!this.input.gamepad) return;

        this.input.gamepad.on('connected', (pad) => {
            console.log('Mando conectado:', pad.index, pad.id);
        });
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
                accion: false,
                ejeX: 0
            };
        }

        const ejeX = this.leerEjeMando(pad, 0);

        return {
            conectado: true,
            izquierda: ejeX < -0.35 || this.botonMandoPresionado(pad, 14),
            derecha: ejeX > 0.35 || this.botonMandoPresionado(pad, 15),

            // Botón A del RKGAME normalmente es botón 0
            accion: this.botonMandoPresionado(pad, 0),

            ejeX
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

        if (typeof boton.pressed === 'boolean') {
            return boton.pressed;
        }

        if (typeof boton.value === 'number') {
            return boton.value > 0.5;
        }

        return false;
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

    procesarMandoJugador(jugador, numeroMando) {
        if (!jugador || jugador.bloqueado || jugador.terminado) return;

        const ahora = this.time.now;
        const mando = this.leerMando(numeroMando);

        if (!mando.conectado) return;

        const cooldownKey = numeroMando === 2 ? 'mandoCooldownJ2' : 'mandoCooldownJ1';

        if (ahora < this[cooldownKey]) return;

        if (mando.izquierda) {
            this.moverSelector(jugador, -1);
            this[cooldownKey] = ahora + 220;
            return;
        }

        if (mando.derecha) {
            this.moverSelector(jugador, 1);
            this[cooldownKey] = ahora + 220;
            return;
        }

        if (mando.accion) {
            this.confirmarSeleccion(jugador);
            this[cooldownKey] = ahora + 350;
        }
    }

    crearModoUnJugador() {
        this.jugador1 = this.crearEstadoJugador(1, this.obtenerMensajesJugador1());

        this.crearPanelJugador(this.jugador1, {
            x: 640,
            y: 388,
            ancho: 990,
            alto: 485,
            titulo: 'JUGADOR 1',
            colorPanel: 0x071d49,
            colorBorde: 0x8fc0ff
        });

        this.actualizarPanelJugador(this.jugador1);
    }

    crearModoDosJugadores() {
        this.add.rectangle(640, 390, 4, 500, 0x8fc0ff, 0.55).setDepth(2);

        this.jugador1 = this.crearEstadoJugador(1, this.obtenerMensajesJugador1());
        this.jugador2 = this.crearEstadoJugador(2, this.obtenerMensajesJugador2());

        this.crearPanelJugador(this.jugador1, {
            x: 320,
            y: 390,
            ancho: 585,
            alto: 470,
            titulo: 'JUGADOR 1',
            colorPanel: 0x071d49,
            colorBorde: 0x8fc0ff
        });

        this.crearPanelJugador(this.jugador2, {
            x: 960,
            y: 390,
            ancho: 585,
            alto: 470,
            titulo: 'JUGADOR 2',
            colorPanel: 0x401923,
            colorBorde: 0xffa08f
        });

        this.actualizarPanelJugador(this.jugador1);
        this.actualizarPanelJugador(this.jugador2);
    }

    crearEstadoJugador(numero, mensajes) {
        return {
            numero,
            mensajes,
            indice: 0,
            selector: 1,
            puntos: 0,
            aciertos: 0,
            errores: 0,
            terminado: false,
            bloqueado: false,
            feedbackTimer: null,
            elementos: {},
            botones: []
        };
    }

    obtenerMensajesJugador1() {
        return [
            {
                texto: 'Te llega: "Vamos todos a escribirle hasta que cierre su cuenta".',
                correcto: 'bloquear',
                explicacion: 'Bloquear: invita a molestar en grupo.'
            },
            {
                texto: 'Te llega una foto editada de alguien con burlas para reenviarla.',
                correcto: 'reportar',
                explicacion: 'Reportar: difunde una humillación.'
            },
            {
                texto: 'Te escriben: "No compartas eso, puede hacerle daño".',
                correcto: 'pasar',
                explicacion: 'Pasar: ayuda a frenar el daño.'
            },
            {
                texto: 'Te llega: "Métete a su perfil y comenta cosas feas".',
                correcto: 'bloquear',
                explicacion: 'Bloquear: invita a atacar directamente.'
            },
            {
                texto: 'Te mandan un enlace a una publicación ofensiva para que la denuncies.',
                correcto: 'pasar',
                explicacion: 'Pasar: busca reportar algo malo.'
            }
        ];
    }

    obtenerMensajesJugador2() {
        return [
            {
                texto: 'Te llega: "Reenvía este chisme para que todos se enteren".',
                correcto: 'reportar',
                explicacion: 'Reportar: busca difundir daño.'
            },
            {
                texto: 'Te dicen: "No le hablen más, dejémosla sola".',
                correcto: 'bloquear',
                explicacion: 'Bloquear: busca aislar a alguien.'
            },
            {
                texto: 'Te llega: "Guardemos capturas y avisemos a un adulto".',
                correcto: 'pasar',
                explicacion: 'Pasar: propone pedir ayuda.'
            },
            {
                texto: 'Te escriben: "Etiquétenla todos para que le dé vergüenza".',
                correcto: 'reportar',
                explicacion: 'Reportar: busca humillar públicamente.'
            },
            {
                texto: 'Te llega: "No respondas con insultos, mejor bloquea y reporta".',
                correcto: 'pasar',
                explicacion: 'Pasar: da una recomendación segura.'
            }
        ];
    }

    crearPanelJugador(jugador, config) {
        const x = config.x;
        const y = config.y;
        const ancho = config.ancho;
        const alto = config.alto;
        const esDos = this.jugadores === 2;

        const panel = this.add.rectangle(x, y, ancho, alto, config.colorPanel, 0.96);
        panel.setStrokeStyle(4, config.colorBorde, 1);
        panel.setDepth(5);

        const titulo = this.add.text(x, y - alto / 2 + 35, config.titulo, {
            fontFamily: '"VT323", monospace',
            fontSize: esDos ? '34px' : '40px',
            color: '#ffffff',
            stroke: '#071022',
            strokeThickness: 5
        }).setOrigin(0.5).setDepth(6);

        const progreso = this.add.text(x - ancho / 2 + 30, y - alto / 2 + 72, 'Mensaje 1/5', {
            fontFamily: '"VT323", monospace',
            fontSize: esDos ? '24px' : '28px',
            color: '#fff2a8',
            stroke: '#071022',
            strokeThickness: 4
        }).setOrigin(0, 0.5).setDepth(6);

        const puntos = this.add.text(x + ancho / 2 - 30, y - alto / 2 + 72, 'Puntos: 0', {
            fontFamily: '"VT323", monospace',
            fontSize: esDos ? '24px' : '28px',
            color: '#8dff9c',
            stroke: '#071022',
            strokeThickness: 4
        }).setOrigin(1, 0.5).setDepth(6);

        const tarjetaY = esDos ? y - 50 : y - 65;
        const tarjetaAlto = esDos ? 145 : 160;

        const tarjeta = this.add.rectangle(x, tarjetaY, ancho - 70, tarjetaAlto, 0xf4e5bd, 1);
        tarjeta.setStrokeStyle(4, 0x8a5a2b, 1);
        tarjeta.setDepth(6);

        const mensaje = this.add.text(x, tarjetaY, '', {
            fontFamily: '"VT323", monospace',
            fontSize: esDos ? '25px' : '32px',
            color: '#2b1a10',
            align: 'center',
            wordWrap: { width: ancho - 135, useAdvancedWrap: true },
            lineSpacing: esDos ? 2 : 4
        }).setOrigin(0.5).setDepth(7);

        const feedbackBg = this.add.rectangle(
            x,
            esDos ? y + 78 : y + 82,
            ancho - 100,
            esDos ? 62 : 70,
            0x091427,
            0.75
        );
        feedbackBg.setStrokeStyle(2, 0x6faeff, 0.7);
        feedbackBg.setDepth(6);

        const feedback = this.add.text(x, esDos ? y + 78 : y + 82, '', {
            fontFamily: '"VT323", monospace',
            fontSize: esDos ? '19px' : '25px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: ancho - 155, useAdvancedWrap: true },
            stroke: '#071022',
            strokeThickness: 3,
            lineSpacing: 0
        }).setOrigin(0.5).setDepth(7);

        const baseY = y + alto / 2 - 83;
        const separacion = esDos ? 168 : 220;
        const botonAncho = esDos ? 145 : 185;
        const botonAlto = 58;

        jugador.botones = [];

        this.acciones.forEach((accion, index) => {
            const bx = x + (index - 1) * separacion;

            const fondo = this.add.rectangle(bx, baseY, botonAncho, botonAlto, 0x1d376e, 1);
            fondo.setStrokeStyle(3, 0x9ecbff, 1);
            fondo.setDepth(7);

            const texto = this.add.text(bx, baseY, accion.texto, {
                fontFamily: '"VT323", monospace',
                fontSize: esDos ? '21px' : '25px',
                color: '#ffffff',
                stroke: '#071022',
                strokeThickness: 4
            }).setOrigin(0.5).setDepth(8);

            jugador.botones.push({
                accion: accion.id,
                fondo,
                texto
            });
        });

        const selector = this.add.rectangle(
            jugador.botones[jugador.selector].fondo.x,
            baseY,
            botonAncho + 16,
            botonAlto + 16,
            0x000000,
            0
        );
        selector.setStrokeStyle(5, 0xfff19c, 1);
        selector.setDepth(9);

        const ayuda = this.add.text(x, y + alto / 2 - 25, this.obtenerTextoAyudaJugador(jugador.numero), {
            fontFamily: '"VT323", monospace',
            fontSize: esDos ? '22px' : '25px',
            color: '#dcecff',
            stroke: '#071022',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(8);

        jugador.elementos = {
            panel,
            titulo,
            progreso,
            puntos,
            tarjeta,
            mensaje,
            feedbackBg,
            feedback,
            selector,
            ayuda
        };
    }

    obtenerTextoAyudaJugador(numero) {
        if (this.jugadores === 1) {
            return 'A/D, ←/→ o mando para moverte  •  W, ↑, SPACE, ENTER o botón A para elegir';
        }

        if (numero === 1) {
            return 'A/D o mando 1 para moverte  •  W o botón A para elegir';
        }

        return '←/→ o mando 2 para moverte  •  ↑ o botón A para elegir';
    }

    actualizarPanelJugador(jugador) {
        const el = jugador.elementos;

        if (jugador.terminado) {
            el.progreso.setText('Completado');
            el.mensaje.setText('Terminaste tus 5 mensajes.\nEspera el informe final.');
            el.feedback.setText(`Aciertos: ${jugador.aciertos}  •  Errores: ${jugador.errores}`);
            el.puntos.setText(`Puntos: ${jugador.puntos}`);

            jugador.botones.forEach(btn => {
                btn.fondo.setAlpha(0.35);
                btn.texto.setAlpha(0.45);
            });

            el.selector.setVisible(false);
            return;
        }

        const msg = jugador.mensajes[jugador.indice];

        el.progreso.setText(`Mensaje ${jugador.indice + 1}/5`);
        el.puntos.setText(`Puntos: ${jugador.puntos}`);
        el.mensaje.setText(msg.texto);
        el.feedback.setText('');

        this.actualizarSelector(jugador);
    }

    actualizarSelector(jugador) {
        const el = jugador.elementos;

        jugador.botones.forEach((btn, index) => {
            if (index === jugador.selector) {
                btn.fondo.setFillStyle(0x2d82ff, 1);
                btn.texto.setColor('#ffffff');
            } else {
                btn.fondo.setFillStyle(0x1d376e, 1);
                btn.texto.setColor('#dcecff');
            }
        });

        const botonActual = jugador.botones[jugador.selector];

        el.selector.x = botonActual.fondo.x;
        el.selector.y = botonActual.fondo.y;
        el.selector.setVisible(true);
    }

    moverSelector(jugador, direccion) {
        if (!jugador || jugador.bloqueado || jugador.terminado) return;

        jugador.selector += direccion;

        if (jugador.selector < 0) {
            jugador.selector = this.acciones.length - 1;
        }

        if (jugador.selector >= this.acciones.length) {
            jugador.selector = 0;
        }

        this.reproducirClick(0.18);
        this.actualizarSelector(jugador);
    }

    confirmarSeleccion(jugador) {
        if (!jugador || jugador.bloqueado || jugador.terminado) return;

        const msg = jugador.mensajes[jugador.indice];
        const accionElegida = this.acciones[jugador.selector].id;
        const correcto = accionElegida === msg.correcto;

        jugador.bloqueado = true;

        if (jugador.feedbackTimer) {
            jugador.feedbackTimer.remove(false);
            jugador.feedbackTimer = null;
        }

        if (correcto) {
            this.reproducirSFX('collect', 0.7);

            jugador.aciertos += 1;
            jugador.puntos += 10;
            jugador.elementos.feedback.setColor('#8dff9c');
            jugador.elementos.feedback.setText(`BIEN +10\n${msg.explicacion}`);
            this.animarTarjeta(jugador, 0x2f9f6a);
        } else {
            this.reproducirSFX('wrong', 0.75);

            jugador.errores += 1;
            jugador.puntos = Math.max(0, jugador.puntos - 5);
            jugador.elementos.feedback.setColor('#ffb2b2');
            jugador.elementos.feedback.setText(`MAL -5\n${this.obtenerExplicacionIncorrecta(msg)}`);
            this.animarTarjeta(jugador, 0x9f2f3a);
            this.cameras.main.shake(80, 0.0025);
        }

        jugador.elementos.puntos.setText(`Puntos: ${jugador.puntos}`);

        jugador.feedbackTimer = this.time.delayedCall(2600, () => {
            if (!jugador || jugador.terminado) return;

            jugador.indice += 1;
            jugador.bloqueado = false;
            jugador.elementos.feedback.setText('');

            if (jugador.indice >= jugador.mensajes.length) {
                jugador.terminado = true;
                this.actualizarPanelJugador(jugador);
                this.verificarFinMinijuego();
                return;
            }

            this.actualizarPanelJugador(jugador);
        });
    }

    obtenerExplicacionIncorrecta(msg) {
        if (msg.correcto === 'reportar') {
            return 'Era REPORTAR: difundía burla o daño público.';
        }

        if (msg.correcto === 'bloquear') {
            return 'Era BLOQUEAR: invitaba a molestar o atacar.';
        }

        return 'Era DEJAR PASAR: ayudaba a frenar el daño.';
    }

    animarTarjeta(jugador, color) {
        const tarjeta = jugador.elementos.tarjeta;
        const colorOriginal = 0xf4e5bd;

        tarjeta.setFillStyle(color, 1);

        this.tweens.add({
            targets: tarjeta,
            scaleX: 1.03,
            scaleY: 1.05,
            duration: 120,
            yoyo: true,
            onComplete: () => {
                tarjeta.setFillStyle(colorOriginal, 1);
            }
        });
    }

    actualizarControlesUnJugador() {
        if (Phaser.Input.Keyboard.JustDown(this.keys.A) || Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
            this.moverSelector(this.jugador1, -1);
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.D) || Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
            this.moverSelector(this.jugador1, 1);
        }

        if (
            Phaser.Input.Keyboard.JustDown(this.keys.W) ||
            Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
            Phaser.Input.Keyboard.JustDown(this.keys.SPACE) ||
            Phaser.Input.Keyboard.JustDown(this.keys.ENTER)
        ) {
            this.confirmarSeleccion(this.jugador1);
        }

        // RKGAME jugador 1:
        // izquierda/derecha mueve opciones
        // botón A confirma
        this.procesarMandoJugador(this.jugador1, 1);
    }
    actualizarControlesJugador1() {
        if (Phaser.Input.Keyboard.JustDown(this.keys.A)) {
            this.moverSelector(this.jugador1, -1);
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.D)) {
            this.moverSelector(this.jugador1, 1);
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.W)) {
            this.confirmarSeleccion(this.jugador1);
        }

        // RKGAME mando 1:
        // izquierda/derecha mueve opciones
        // botón A confirma
        this.procesarMandoJugador(this.jugador1, 1);
    }

    actualizarControlesJugador2() {
        if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.keys.LEFT)) {
            this.moverSelector(this.jugador2, -1);
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || Phaser.Input.Keyboard.JustDown(this.keys.RIGHT)) {
            this.moverSelector(this.jugador2, 1);
        }

        if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.keys.UP)) {
            this.confirmarSeleccion(this.jugador2);
        }

        // RKGAME mando 2:
        // izquierda/derecha mueve opciones
        // botón A confirma
        this.procesarMandoJugador(this.jugador2, 2);
    }

    verificarFinMinijuego() {
        if (this.yaTermino || this.finalizando) return;

        if (this.jugadores === 2) {
            if (this.jugador1.terminado && this.jugador2.terminado) {
                this.finalizando = true;
                this.time.delayedCall(600, () => {
                    this.mostrarInformeFinal();
                });
            }

            return;
        }

        if (this.jugador1.terminado) {
            this.finalizando = true;
            this.time.delayedCall(600, () => {
                this.mostrarInformeFinal();
            });
        }
    }

    reproducirClick(volumen = 0.35) {
        if (this.cache.audio.exists('click')) {
            this.sound.play('click', { volume: volumen });
        }
    }

    calcularBonusTotal() {
        if (this.jugadores === 2) {
            return (this.jugador1?.puntos || 0) + (this.jugador2?.puntos || 0);
        }

        return this.jugador1?.puntos || 0;
    }

    mostrarInformeFinal() {
        if (this.yaTermino) return;

        this.yaTermino = true;
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

        this.add.text(640, 66, 'INFORME DEL FILTRO DE LA RED', {
            fontFamily: '"VT323", monospace',
            fontSize: '43px',
            color: '#40291a',
            stroke: '#fff0c8',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(102);

        this.add.text(640, 103, 'Personas responsables y sanciones correspondientes del Día 2', {
            fontFamily: '"VT323", monospace',
            fontSize: '24px',
            color: '#5a3921'
        }).setOrigin(0.5).setDepth(102);

        const resumen = this.jugadores === 2
            ? `Bonus total: ${bonus} pts  •  J1: ${this.jugador1.aciertos}/5 aciertos  •  J2: ${this.jugador2.aciertos}/5 aciertos`
            : `Bonus total: ${bonus} pts  •  Aciertos: ${this.jugador1.aciertos}/5  •  Errores: ${this.jugador1.errores}`;

        this.add.text(640, 133, resumen, {
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
                        bonus: bonus,
                        jugador1: {
                            aciertos: this.jugador1?.aciertos || 0,
                            errores: this.jugador1?.errores || 0,
                            puntos: this.jugador1?.puntos || 0
                        },
                        jugador2: this.jugadores === 2 ? {
                            aciertos: this.jugador2?.aciertos || 0,
                            errores: this.jugador2?.errores || 0,
                            puntos: this.jugador2?.puntos || 0
                        } : null
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