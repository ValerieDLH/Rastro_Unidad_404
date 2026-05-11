export class CazaRumores extends Phaser.Scene {
    constructor() {
        super('CazaRumores');
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

        this.jugador1 = null;
        this.jugador2 = null;

        this.totalObjetivosPorJugador = 4;

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

        if (this.jugadores === 2) {
            this.crearModoDosJugadores();
        } else {
            this.crearModoUnJugador();
        }

        this.iniciarMusicaMinijuego();
        this.crearBarraVolumenMinijuego();
    }

    update(time, delta) {
        if (this.yaTermino) return;

        if (this.jugadores === 2) {
            this.actualizarJugador(this.jugador1, delta);
            this.actualizarJugador(this.jugador2, delta);
        } else {
            this.actualizarJugador(this.jugador1, delta);
        }
    }

    crearFondo() {
        this.add.rectangle(640, 360, 1280, 720, 0x041127, 1);

        for (let i = 0; i < 85; i++) {
            const x = Phaser.Math.Between(0, 1280);
            const y = Phaser.Math.Between(0, 720);

            const punto = this.add.circle(
                x,
                y,
                Phaser.Math.Between(1, 3),
                0x7bb8ff,
                Phaser.Math.FloatBetween(0.08, 0.32)
            );

            this.tweens.add({
                targets: punto,
                alpha: Phaser.Math.FloatBetween(0.04, 0.16),
                duration: Phaser.Math.Between(900, 1700),
                yoyo: true,
                repeat: -1
            });
        }

        this.add.rectangle(640, 392, 1130, 480, 0x071a3d, 0.72)
            .setStrokeStyle(3, 0x77aaff, 0.55)
            .setDepth(1);

        this.add.text(640, 642, 'SIMULADOR DE DETECCIÓN DE RUMORES', {
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

        this.add.text(640, 42, 'CAZA RUMORES', {
            fontFamily: '"VT323", monospace',
            fontSize: '54px',
            color: '#ffffff',
            stroke: '#071022',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(640, 86, 'Lee las tarjetas rojas y dispara solo al rumor dañino.', {
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
            LEFT: Phaser.Input.Keyboard.KeyCodes.LEFT,
            RIGHT: Phaser.Input.Keyboard.KeyCodes.RIGHT,
            UP: Phaser.Input.Keyboard.KeyCodes.UP,
            DOWN: Phaser.Input.Keyboard.KeyCodes.DOWN,
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
                arriba: false,
                abajo: false,
                r2: false,
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

            r2: this.r2Presionado(pad),

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

    leerEjeMandoSinDeadzone(pad, index) {
        if (!pad || !pad.axes || !pad.axes[index]) return 0;

        const eje = pad.axes[index];

        if (typeof eje.getValue === 'function') {
            return eje.getValue();
        }

        if (typeof eje.value === 'number') {
            return eje.value;
        }

        if (typeof eje === 'number') {
            return eje;
        }

        return 0;
    }

    botonMandoPresionado(pad, index) {
        if (!pad || !pad.buttons || !pad.buttons[index]) return false;

        const boton = pad.buttons[index];

        const presionado = boton.pressed === true;
        const valor = typeof boton.value === 'number' ? boton.value : 0;

        return presionado || valor > 0.35;
    }
    r2Presionado(pad) {
        if (!pad) return false;

        // Prueba nueva:
        // Algunos mandos RK reportan R2 como botón 9.
        // L2 no se incluye.
        return this.botonMandoPresionado(pad, 9);
    }

    crearModoUnJugador() {
        this.jugador1 = this.crearEstadoJugador(1, {
            minX: 95,
            maxX: 1185,
            minY: 285,
            maxY: 585,
            miraX: 640,
            miraY: 370,
            color: 0x7bb8ff,
            titulo: 'JUGADOR 1',
            ayuda: 'Lee las dos tarjetas rojas. Dispara solo al rumor dañino.  •  F, ENTER o R2 dispara',
            mensajes: this.obtenerMensajesJugador1()
        });

        this.crearZonaJugador(this.jugador1, 640, 390, 1110, 475, 0x071d49, 0x8fc0ff);
        this.crearHUDJugador(this.jugador1, 640, 235, 900);
        this.crearMira(this.jugador1);
        this.crearSiguienteObjetivo(this.jugador1);
    }

    crearModoDosJugadores() {
        this.add.rectangle(640, 390, 4, 500, 0x8fc0ff, 0.55).setDepth(3);

        this.jugador1 = this.crearEstadoJugador(1, {
            minX: 70,
            maxX: 610,
            minY: 285,
            maxY: 585,
            miraX: 320,
            miraY: 370,
            color: 0x7bb8ff,
            titulo: 'JUGADOR 1',
            ayuda: 'Lee las dos tarjetas. Dispara solo al rumor dañino.  •  F o R2 dispara',
            mensajes: this.obtenerMensajesJugador1()
        });

        this.jugador2 = this.crearEstadoJugador(2, {
            minX: 670,
            maxX: 1210,
            minY: 285,
            maxY: 585,
            miraX: 960,
            miraY: 370,
            color: 0xff9a8c,
            titulo: 'JUGADOR 2',
            ayuda: 'Lee las dos tarjetas. Dispara solo al rumor dañino.  •  ENTER o R2 dispara',
            mensajes: this.obtenerMensajesJugador2()
        });

        this.crearZonaJugador(this.jugador1, 320, 390, 575, 475, 0x071d49, 0x8fc0ff);
        this.crearZonaJugador(this.jugador2, 960, 390, 575, 475, 0x401923, 0xffa08f);

        this.crearHUDJugador(this.jugador1, 320, 235, 520);
        this.crearHUDJugador(this.jugador2, 960, 235, 520);

        this.crearMira(this.jugador1);
        this.crearMira(this.jugador2);

        this.crearSiguienteObjetivo(this.jugador1);
        this.crearSiguienteObjetivo(this.jugador2);
    }

    crearEstadoJugador(numero, config) {
        return {
            numero,
            minX: config.minX,
            maxX: config.maxX,
            minY: config.minY,
            maxY: config.maxY,
            miraX: config.miraX,
            miraY: config.miraY,
            color: config.color,
            titulo: config.titulo,
            ayuda: config.ayuda,
            mensajes: config.mensajes,

            velocidadMira: 520,
            puntos: 0,
            aciertos: 0,
            errores: 0,
            fallos: 0,

            indiceObjetivo: 0,
            terminado: false,
            disparoBloqueado: false,
            cargandoSiguiente: false,
            r2PresionadoAntes: false,

            objetivoActual: null,
            objetivosActuales: [],

            feedbackTimer: null,

            elementos: {}
        };
    }

    obtenerMensajesJugador1() {
        return [
            {
                malo: {
                    tipo: 'malo',
                    texto: '“Dicen que robó los exámenes. Reenvíalo.”',
                    etiqueta: 'MENSAJE NUEVO',
                    explicacion: 'Era dañino: acusa a alguien sin pruebas.'
                },
                bueno: {
                    tipo: 'bueno',
                    texto: '“No lo reenvíes si no sabes si es verdad.”',
                    etiqueta: 'MENSAJE NUEVO',
                    explicacion: 'Era seguro: evita difundir información dudosa.'
                }
            },
            {
                malo: {
                    tipo: 'malo',
                    texto: '“Pásalo rápido antes de que lo borren.”',
                    etiqueta: 'MENSAJE NUEVO',
                    explicacion: 'Era dañino: presiona para compartir sin verificar.'
                },
                bueno: {
                    tipo: 'bueno',
                    texto: '“Mejor revisa la fuente antes de compartir.”',
                    etiqueta: 'MENSAJE NUEVO',
                    explicacion: 'Era seguro: invita a verificar primero.'
                }
            },
            {
                malo: {
                    tipo: 'malo',
                    texto: '“Yo sé que fue esa persona, aunque no tenga pruebas.”',
                    etiqueta: 'MENSAJE NUEVO',
                    explicacion: 'Era dañino: acusa sin tener pruebas.'
                },
                bueno: {
                    tipo: 'bueno',
                    texto: '“Si no hay pruebas, no acusemos a nadie.”',
                    etiqueta: 'MENSAJE NUEVO',
                    explicacion: 'Era seguro: evita culpar injustamente.'
                }
            },
            {
                malo: {
                    tipo: 'malo',
                    texto: '“Miren esta captura editada. Igual pásenla.”',
                    etiqueta: 'MENSAJE NUEVO',
                    explicacion: 'Era dañino: una captura dudosa no se debe difundir.'
                },
                bueno: {
                    tipo: 'bueno',
                    texto: '“Guardemos evidencia real y pidamos ayuda.”',
                    etiqueta: 'MENSAJE NUEVO',
                    explicacion: 'Era seguro: propone actuar correctamente.'
                }
            }
        ];
    }

    obtenerMensajesJugador2() {
        return [
            {
                malo: {
                    tipo: 'malo',
                    texto: '“Compartan el chisme para que todos se enteren.”',
                    etiqueta: 'MENSAJE NUEVO',
                    explicacion: 'Era dañino: busca afectar la reputación.'
                },
                bueno: {
                    tipo: 'bueno',
                    texto: '“No difundas chismes, puede hacer daño.”',
                    etiqueta: 'MENSAJE NUEVO',
                    explicacion: 'Era seguro: frena la difusión del rumor.'
                }
            },
            {
                malo: {
                    tipo: 'malo',
                    texto: '“No sé si es real, pero pásenlo igual.”',
                    etiqueta: 'MENSAJE NUEVO',
                    explicacion: 'Era dañino: comparte algo no verificado.'
                },
                bueno: {
                    tipo: 'bueno',
                    texto: '“Si no es confiable, mejor no lo compartas.”',
                    etiqueta: 'MENSAJE NUEVO',
                    explicacion: 'Era seguro: evita propagar información falsa.'
                }
            },
            {
                malo: {
                    tipo: 'malo',
                    texto: '“Me contaron que hizo algo grave. Reenvíalo.”',
                    etiqueta: 'MENSAJE NUEVO',
                    explicacion: 'Era dañino: acusa sin comprobar.'
                },
                bueno: {
                    tipo: 'bueno',
                    texto: '“Antes de creerlo, pregunta y verifica.”',
                    etiqueta: 'MENSAJE NUEVO',
                    explicacion: 'Era seguro: invita a confirmar la información.'
                }
            },
            {
                malo: {
                    tipo: 'malo',
                    texto: '“Todos deberían saber lo mala persona que es.”',
                    etiqueta: 'MENSAJE NUEVO',
                    explicacion: 'Era dañino: intenta dañar públicamente a alguien.'
                },
                bueno: {
                    tipo: 'bueno',
                    texto: '“Reportemos la publicación si está haciendo daño.”',
                    etiqueta: 'MENSAJE NUEVO',
                    explicacion: 'Era seguro: propone reportar contenido dañino.'
                }
            }
        ];
    }

    crearZonaJugador(jugador, x, y, ancho, alto, colorPanel, colorBorde) {
        const panel = this.add.rectangle(x, y, ancho, alto, colorPanel, 0.70);
        panel.setStrokeStyle(3, colorBorde, 0.95);
        panel.setDepth(4);

        const titulo = this.add.text(x, y - alto / 2 + 38, jugador.titulo, {
            fontFamily: '"VT323", monospace',
            fontSize: this.jugadores === 2 ? '32px' : '38px',
            color: '#ffffff',
            stroke: '#071022',
            strokeThickness: 5
        }).setOrigin(0.5).setDepth(5);

        const ayuda = this.add.text(x, y + alto / 2 - 28, jugador.ayuda, {
            fontFamily: '"VT323", monospace',
            fontSize: this.jugadores === 2 ? '21px' : '25px',
            color: '#dcecff',
            stroke: '#071022',
            strokeThickness: 4,
            align: 'center',
            wordWrap: { width: ancho - 50, useAdvancedWrap: true }
        }).setOrigin(0.5).setDepth(5);

        jugador.elementos.panel = panel;
        jugador.elementos.titulo = titulo;
        jugador.elementos.ayuda = ayuda;
    }

    crearHUDJugador(jugador, x, y, ancho) {
        const hud = this.add.rectangle(x, y, ancho, 58, 0x0b2356, 0.96);
        hud.setStrokeStyle(3, 0xa9c8ff, 1);
        hud.setDepth(10);

        const txtPuntos = this.add.text(x - ancho / 2 + 25, y, 'Puntos: 0', {
            fontFamily: '"VT323", monospace',
            fontSize: this.jugadores === 2 ? '24px' : '29px',
            color: '#8dff9c',
            stroke: '#071022',
            strokeThickness: 4
        }).setOrigin(0, 0.5).setDepth(11);

        const txtEstado = this.add.text(x, y, 'Lee antes de disparar', {
            fontFamily: '"VT323", monospace',
            fontSize: this.jugadores === 2 ? '22px' : '27px',
            color: '#fff2a8',
            stroke: '#071022',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(11);

        const txtProgreso = this.add.text(x + ancho / 2 - 25, y, 'Ronda 1', {
            fontFamily: '"VT323", monospace',
            fontSize: this.jugadores === 2 ? '22px' : '27px',
            color: '#ffffff',
            stroke: '#071022',
            strokeThickness: 4
        }).setOrigin(1, 0.5).setDepth(11);

        const feedback = this.add.text(x, y + 48, '', {
            fontFamily: '"VT323", monospace',
            fontSize: this.jugadores === 2 ? '20px' : '25px',
            color: '#ffffff',
            stroke: '#071022',
            strokeThickness: 4,
            align: 'center',
            wordWrap: { width: ancho - 80, useAdvancedWrap: true }
        }).setOrigin(0.5).setDepth(40);

        jugador.elementos.hud = hud;
        jugador.elementos.txtPuntos = txtPuntos;
        jugador.elementos.txtEstado = txtEstado;
        jugador.elementos.txtProgreso = txtProgreso;
        jugador.elementos.feedback = feedback;
    }

    crearMira(jugador) {
        const cont = this.add.container(jugador.miraX, jugador.miraY);
        cont.setDepth(80);

        const g = this.add.graphics();

        g.lineStyle(4, jugador.color, 1);
        g.strokeCircle(0, 0, 28);

        g.lineStyle(3, 0xffffff, 0.95);
        g.strokeCircle(0, 0, 17);

        g.lineStyle(4, jugador.color, 1);
        g.beginPath();
        g.moveTo(-42, 0);
        g.lineTo(-15, 0);
        g.moveTo(15, 0);
        g.lineTo(42, 0);
        g.moveTo(0, -42);
        g.lineTo(0, -15);
        g.moveTo(0, 15);
        g.lineTo(0, 42);
        g.strokePath();

        g.fillStyle(0xffffff, 1);
        g.fillCircle(0, 0, 4);

        cont.add(g);

        jugador.elementos.mira = cont;
        jugador.elementos.miraGrafico = g;

        this.tweens.add({
            targets: cont,
            scaleX: 1.08,
            scaleY: 1.08,
            duration: 400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    crearSiguienteObjetivo(jugador) {
        if (!jugador || jugador.terminado) return;

        this.eliminarObjetivoActual(jugador);

        if (jugador.indiceObjetivo >= this.totalObjetivosPorJugador) {
            jugador.terminado = true;
            this.mostrarFeedback(jugador, 'Completado', '#fff2a8');
            this.actualizarHUDJugador(jugador);
            this.verificarFinMinijuego();
            return;
        }

        const par = jugador.mensajes[jugador.indiceObjetivo];
        const tarjetas = Phaser.Utils.Array.Shuffle([par.malo, par.bueno]);

        jugador.objetivosActuales = [];
        jugador.cargandoSiguiente = false;

        const esDos = this.jugadores === 2;

        const ancho = esDos ? 405 : 440;
        const alto = esDos ? 114 : 132;

        const posiciones = this.obtenerPosicionesPar(jugador, ancho, alto);

        tarjetas.forEach((base, index) => {
            const pos = posiciones[index];
            this.crearTarjetaRumor(jugador, base, pos.x, pos.y, ancho, alto);
        });

        this.actualizarHUDJugador(jugador);
    }

    obtenerPosicionesPar(jugador, ancho, alto) {
        const centroX = (jugador.minX + jugador.maxX) / 2;
        const centroY = (jugador.minY + jugador.maxY) / 2;

        if (this.jugadores === 2) {
            return [
                {
                    x: centroX,
                    y: Phaser.Math.Clamp(jugador.minY + 105, jugador.minY + alto / 2, jugador.maxY - alto / 2)
                },
                {
                    x: centroX,
                    y: Phaser.Math.Clamp(jugador.maxY - 105, jugador.minY + alto / 2, jugador.maxY - alto / 2)
                }
            ];
        }

        return [
            {
                x: Phaser.Math.Clamp(jugador.minX + 300, jugador.minX + ancho / 2, jugador.maxX - ancho / 2),
                y: centroY
            },
            {
                x: Phaser.Math.Clamp(jugador.maxX - 300, jugador.minX + ancho / 2, jugador.maxX - ancho / 2),
                y: centroY
            }
        ];
    }

    crearTarjetaRumor(jugador, base, x, y, ancho, alto) {
        const esDos = this.jugadores === 2;

        const tarjeta = this.add.rectangle(x, y, ancho, alto, 0x8d2835, 0.96);
        tarjeta.setStrokeStyle(4, 0xffa0a0, 1);
        tarjeta.setDepth(25);

        const etiqueta = this.add.text(x, y - alto / 2 + 20, base.etiqueta, {
            fontFamily: '"VT323", monospace',
            fontSize: esDos ? '16px' : '18px',
            color: '#ffffff',
            stroke: '#061225',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5).setDepth(26);

        const texto = this.add.text(x, y + 13, base.texto, {
            fontFamily: '"VT323", monospace',
            fontSize: esDos ? '20px' : '24px',
            color: '#ffffff',
            stroke: '#061225',
            strokeThickness: 3,
            align: 'center',
            wordWrap: { width: ancho - 34, useAdvancedWrap: true },
            lineSpacing: 1
        }).setOrigin(0.5).setDepth(26);

        const signoX = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;
        const signoY = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;

        const objetivo = {
            tipo: base.tipo,
            explicacion: base.explicacion,
            x,
            y,
            ancho,
            alto,
            vx: signoX * Phaser.Math.Between(esDos ? 65 : 80, esDos ? 95 : 120),
            vy: signoY * Phaser.Math.Between(esDos ? 42 : 55, esDos ? 70 : 88),
            tarjeta,
            etiqueta,
            texto,
            eliminado: false
        };

        jugador.objetivosActuales.push(objetivo);

        this.tweens.add({
            targets: tarjeta,
            scaleX: 1.02,
            scaleY: 1.02,
            duration: 480,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    actualizarJugador(jugador, delta) {
        if (!jugador || jugador.terminado) return;

        this.actualizarMovimientoMira(jugador, delta);
        this.actualizarObjetivoActual(jugador, delta);

        const mando = this.leerMando(jugador.numero);
        const r2JustDown = mando.r2 && !jugador.r2PresionadoAntes;

        if (jugador.numero === 1) {
            if (Phaser.Input.Keyboard.JustDown(this.keys.F) || r2JustDown) {
                this.disparar(jugador);
            }

            if (this.jugadores === 1 && Phaser.Input.Keyboard.JustDown(this.keys.ENTER)) {
                this.disparar(jugador);
            }
        }

        if (jugador.numero === 2) {
            if (Phaser.Input.Keyboard.JustDown(this.keys.ENTER) || r2JustDown) {
                this.disparar(jugador);
            }
        }

        jugador.r2PresionadoAntes = mando.r2;
    }

    actualizarMovimientoMira(jugador, delta) {
        const dt = delta / 1000;
        const mando = this.leerMando(jugador.numero);

        let dx = 0;
        let dy = 0;

        if (this.jugadores === 1) {
            if (this.keys.A.isDown || this.cursors.left.isDown || mando.izquierda) dx -= 1;
            if (this.keys.D.isDown || this.cursors.right.isDown || mando.derecha) dx += 1;
            if (this.keys.W.isDown || this.cursors.up.isDown || mando.arriba) dy -= 1;
            if (this.keys.S.isDown || this.cursors.down.isDown || mando.abajo) dy += 1;
        } else if (jugador.numero === 1) {
            if (this.keys.A.isDown || mando.izquierda) dx -= 1;
            if (this.keys.D.isDown || mando.derecha) dx += 1;
            if (this.keys.W.isDown || mando.arriba) dy -= 1;
            if (this.keys.S.isDown || mando.abajo) dy += 1;
        } else {
            if (this.cursors.left.isDown || mando.izquierda) dx -= 1;
            if (this.cursors.right.isDown || mando.derecha) dx += 1;
            if (this.cursors.up.isDown || mando.arriba) dy -= 1;
            if (this.cursors.down.isDown || mando.abajo) dy += 1;
        }

        if (dx !== 0 && dy !== 0) {
            dx *= 0.7071;
            dy *= 0.7071;
        }

        jugador.miraX = Phaser.Math.Clamp(
            jugador.miraX + dx * jugador.velocidadMira * dt,
            jugador.minX,
            jugador.maxX
        );

        jugador.miraY = Phaser.Math.Clamp(
            jugador.miraY + dy * jugador.velocidadMira * dt,
            jugador.minY,
            jugador.maxY
        );

        if (jugador.elementos.mira) {
            jugador.elementos.mira.x = jugador.miraX;
            jugador.elementos.mira.y = jugador.miraY;
        }
    }

    actualizarObjetivoActual(jugador, delta) {
        if (!jugador || !Array.isArray(jugador.objetivosActuales)) return;

        const dt = delta / 1000;

        jugador.objetivosActuales.forEach(obj => {
            if (!obj || obj.eliminado) return;

            obj.x += obj.vx * dt;
            obj.y += obj.vy * dt;

            if (obj.x < jugador.minX + obj.ancho / 2 || obj.x > jugador.maxX - obj.ancho / 2) {
                obj.vx *= -1;
            }

            if (obj.y < jugador.minY + obj.alto / 2 || obj.y > jugador.maxY - obj.alto / 2) {
                obj.vy *= -1;
            }

            obj.x = Phaser.Math.Clamp(obj.x, jugador.minX + obj.ancho / 2, jugador.maxX - obj.ancho / 2);
            obj.y = Phaser.Math.Clamp(obj.y, jugador.minY + obj.alto / 2, jugador.maxY - obj.alto / 2);

            obj.tarjeta.x = obj.x;
            obj.tarjeta.y = obj.y;

            obj.etiqueta.x = obj.x;
            obj.etiqueta.y = obj.y - obj.alto / 2 + 20;

            obj.texto.x = obj.x;
            obj.texto.y = obj.y + 13;
        });
    }

    disparar(jugador) {
        if (!jugador || jugador.terminado || jugador.disparoBloqueado || jugador.cargandoSiguiente) return;

        jugador.disparoBloqueado = true;

        this.time.delayedCall(180, () => {
            if (jugador) jugador.disparoBloqueado = false;
        });

        this.reproducirSFX('disparo', 0.75);
        this.animarDisparo(jugador);

        const objetivos = Array.isArray(jugador.objetivosActuales)
            ? jugador.objetivosActuales
            : [];

        const obj = objetivos.find(item => {
            return item && !item.eliminado && this.objetivoEstaEnMira(jugador, item);
        });

        if (!obj) {
            jugador.puntos = Math.max(0, jugador.puntos - 2);
            jugador.fallos += 1;

            this.mostrarFeedback(jugador, 'Fallaste -2. Apunta mejor y lee antes de disparar.', '#ffdf8a');
            this.actualizarHUDJugador(jugador);
            return;
        }

        if (obj.tipo === 'malo') {
            jugador.puntos += 10;
            jugador.aciertos += 1;
            jugador.cargandoSiguiente = true;

            this.mostrarFeedback(jugador, `Bien +10: ${obj.explicacion}`, '#8dff9c');
            this.crearExplosion(obj.x, obj.y, 0x8dff9c);

            this.eliminarObjetivoActual(jugador);

            jugador.indiceObjetivo += 1;
            this.actualizarHUDJugador(jugador);

            this.time.delayedCall(750, () => {
                if (!jugador || this.yaTermino) return;
                this.crearSiguienteObjetivo(jugador);
            });

            return;
        }

        if (obj.tipo === 'bueno') {
            jugador.puntos = Math.max(0, jugador.puntos - 8);
            jugador.errores += 1;

            this.reproducirSFX('wrong', 0.75);
            this.mostrarFeedback(jugador, `No era rumor -8: ${obj.explicacion}`, '#ffb2b2');
            this.animarTarjetaError(obj);
            this.cameras.main.shake(90, 0.003);

            this.actualizarHUDJugador(jugador);
        }
    }

    objetivoEstaEnMira(jugador, obj) {
        const dentroX =
            jugador.miraX >= obj.x - obj.ancho / 2 &&
            jugador.miraX <= obj.x + obj.ancho / 2;

        const dentroY =
            jugador.miraY >= obj.y - obj.alto / 2 &&
            jugador.miraY <= obj.y + obj.alto / 2;

        return dentroX && dentroY;
    }

    eliminarObjetivoActual(jugador) {
        if (!jugador) return;

        if (jugador.objetivoActual) {
            const obj = jugador.objetivoActual;

            this.tweens.killTweensOf(obj.tarjeta);

            if (obj.tarjeta) obj.tarjeta.destroy();
            if (obj.etiqueta) obj.etiqueta.destroy();
            if (obj.texto) obj.texto.destroy();

            jugador.objetivoActual = null;
        }

        if (Array.isArray(jugador.objetivosActuales)) {
            jugador.objetivosActuales.forEach(obj => {
                if (!obj) return;

                this.tweens.killTweensOf(obj.tarjeta);

                if (obj.tarjeta) obj.tarjeta.destroy();
                if (obj.etiqueta) obj.etiqueta.destroy();
                if (obj.texto) obj.texto.destroy();
            });

            jugador.objetivosActuales = [];
        }
    }

    animarDisparo(jugador) {
        const mira = jugador.elementos.mira;
        if (!mira) return;

        this.tweens.add({
            targets: mira,
            scaleX: 1.35,
            scaleY: 1.35,
            duration: 70,
            yoyo: true
        });
    }

    animarTarjetaError(obj) {
        if (!obj || !obj.tarjeta) return;

        const originalX = obj.x;

        this.tweens.add({
            targets: [obj.tarjeta, obj.etiqueta, obj.texto],
            x: originalX + 12,
            duration: 50,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                if (obj.tarjeta) obj.tarjeta.x = obj.x;
                if (obj.etiqueta) obj.etiqueta.x = obj.x;
                if (obj.texto) obj.texto.x = obj.x;
            }
        });
    }

    crearExplosion(x, y, color) {
        const circulo = this.add.circle(x, y, 8, color, 0.85);
        circulo.setDepth(70);

        this.tweens.add({
            targets: circulo,
            radius: 52,
            alpha: 0,
            duration: 360,
            ease: 'Sine.easeOut',
            onComplete: () => {
                circulo.destroy();
            }
        });
    }

    mostrarFeedback(jugador, texto, color) {
        const feedback = jugador.elementos.feedback;
        if (!feedback) return;

        feedback.setColor(color);
        feedback.setText(texto);

        if (jugador.feedbackTimer) {
            jugador.feedbackTimer.remove(false);
        }

        jugador.feedbackTimer = this.time.delayedCall(1700, () => {
            if (feedback && feedback.active) {
                feedback.setText('');
            }
        });
    }

    actualizarHUDJugador(jugador) {
        if (!jugador || !jugador.elementos) return;

        const rondaActual = Math.min(jugador.indiceObjetivo + 1, this.totalObjetivosPorJugador);

        jugador.elementos.txtPuntos.setText(`Puntos: ${jugador.puntos}`);

        if (jugador.terminado || jugador.indiceObjetivo >= this.totalObjetivosPorJugador) {
            jugador.elementos.txtProgreso.setText('Completado');
            jugador.elementos.txtEstado.setText('Rumores eliminados');
        } else {
            jugador.elementos.txtProgreso.setText(`Ronda ${rondaActual}`);
            jugador.elementos.txtEstado.setText('Lee y dispara al rumor dañino');
        }
    }

    verificarFinMinijuego() {
        if (this.yaTermino || this.finalizando) return;

        if (this.jugadores === 2) {
            if (this.jugador1?.terminado && this.jugador2?.terminado) {
                this.finalizando = true;
                this.time.delayedCall(700, () => {
                    this.mostrarInformeFinal();
                });
            }

            return;
        }

        if (this.jugador1?.terminado) {
            this.finalizando = true;
            this.time.delayedCall(700, () => {
                this.mostrarInformeFinal();
            });
        }
    }

    limpiarJugador(jugador) {
        if (!jugador) return;

        if (jugador.feedbackTimer) {
            jugador.feedbackTimer.remove(false);
            jugador.feedbackTimer = null;
        }

        this.eliminarObjetivoActual(jugador);
    }

    calcularBonusTotal() {
        if (this.jugadores === 2) {
            return (this.jugador1?.puntos || 0) + (this.jugador2?.puntos || 0);
        }

        return this.jugador1?.puntos || 0;
    }

    reproducirClick(volumen = 0.35) {
        if (this.cache.audio.exists('click')) {
            this.sound.play('click', { volume: volumen });
        }
    }

    mostrarInformeFinal() {
        if (this.yaTermino) return;

        this.yaTermino = true;

        this.limpiarJugador(this.jugador1);
        this.limpiarJugador(this.jugador2);

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

        this.add.text(640, 66, 'INFORME DE CAZA RUMORES', {
            fontFamily: '"VT323", monospace',
            fontSize: '43px',
            color: '#40291a',
            stroke: '#fff0c8',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(102);

        this.add.text(640, 103, 'Personas responsables y sanciones correspondientes del Día 3', {
            fontFamily: '"VT323", monospace',
            fontSize: '24px',
            color: '#5a3921'
        }).setOrigin(0.5).setDepth(102);

        const resumen = this.jugadores === 2
            ? `Bonus total: ${bonus} pts  •  J1 detectó ${this.jugador1.aciertos} rumores  •  J2 detectó ${this.jugador2.aciertos} rumores`
            : `Bonus total: ${bonus} pts  •  Rumores detectados: ${this.jugador1.aciertos}  •  Fallos: ${this.jugador1.fallos}`;

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

        zone.on('pointerdown', () => {
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
                            fallos: this.jugador1?.fallos || 0,
                            puntos: this.jugador1?.puntos || 0
                        },
                        jugador2: this.jugadores === 2 ? {
                            aciertos: this.jugador2?.aciertos || 0,
                            errores: this.jugador2?.errores || 0,
                            fallos: this.jugador2?.fallos || 0,
                            puntos: this.jugador2?.puntos || 0
                        } : null
                    }
                });
            });
        });
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