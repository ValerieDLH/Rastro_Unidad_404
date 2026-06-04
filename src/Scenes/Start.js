export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    init(data) {
        data = data || {};

        const volumenInicial = typeof data.volumenActual === 'number'
            ? data.volumenActual
            : 0.5;

        this.volumenActual = this._obtenerVolumenGlobal(volumenInicial);

        /*
            Cuando vienes desde RankingFinal, Ventana1 o Día 7 con
            reiniciarPartida: true, limpiamos SOLO los datos de la partida.

            IMPORTANTE:
            Esto NO borra el localStorage del ranking.
            El ranking anterior se conserva.
        */
        if (data.reiniciarPartida) {
            this._limpiarDatosPartida();
        } else if (!this.game.registry.get('partidaActual')) {
            this._limpiarDatosPartida();
        }

        // ─────────────────────────────────────────────
        // CONFIGURACIÓN RK GAME
        // Eje donde el RK Game reporta las flechitas.
        // En tu prueba salió que era axis 9.
        // ─────────────────────────────────────────────
        this.RK_AXIS_FLECHAS = 9;

        /*
            Rangos para axis 9 del RK Game.

            Según tu prueba:
            - Flecha derecha RK Game dio VALOR: -0.429
            Por eso el rango de derecha debe incluir ese valor.
        */
        this.RK_HAT_IZQUIERDA_MIN = 0.65;
        this.RK_HAT_IZQUIERDA_MAX = 0.85;

        this.RK_HAT_DERECHA_MIN = -0.50;
        this.RK_HAT_DERECHA_MAX = -0.35;
    }

    preload() {
        this.load.image('background', 'assets/rastro.b.png');
        this.load.image('logo', 'assets/rastro.png');
        this.load.audio('introMusic', 'music/intro.mp3');
        this.load.audio('spaceSound', 'music/space.mp3');
    }

    create() {
        this.yaInicioHistoria = false;
        this.arrastrandoVolumen = false;

        this.background = this.add.tileSprite(640, 360, 1280, 720, 'background');
        this.background.setDepth(0);

        this.logo = this.add.image(640, 200, 'logo');
        this.logo.setScale(0.9);
        this.logo.setDepth(2);

        this.subtitulo = this.add.text(640, 575, 'Encuentra al sospechoso', {
            fontFamily: 'Bahnschrift, Segoe UI, Tahoma, Arial, sans-serif',
            fontSize: '32px',
            fontStyle: 'bold',
            color: '#c9f8ff',
            stroke: '#03131a',
            strokeThickness: 4,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#00d8ff',
                blur: 10,
                fill: true
            }
        }).setOrigin(0.5);

        this.subtitulo.setDepth(2);

        this.mensaje = this.add.text(640, 680, 'Presiona SPACE, click o R1 para continuar', {
            fontFamily: 'Consolas, Courier New, monospace',
            fontSize: '23px',
            fontStyle: 'bold',
            color: '#dffcff',
            stroke: '#062430',
            strokeThickness: 3,
            shadow: {
                offsetX: 0,
                offsetY: 0,
                color: '#00a8cc',
                blur: 4,
                fill: true
            }
        }).setOrigin(0.5);

        this.mensaje.setDepth(3);

        this.tweens.add({
            targets: this.logo,
            y: 400,
            duration: 1500,
            ease: 'Sine.inOut',
            yoyo: true,
            loop: -1
        });

        this.tweens.add({
            targets: this.mensaje,
            alpha: 0.3,
            duration: 800,
            ease: 'Sine.inOut',
            yoyo: true,
            loop: -1
        });

        this.introMusic = this.sound.add('introMusic', {
            volume: this.volumenActual,
            loop: true
        });

        this.spaceSound = this.sound.add('spaceSound', {
            volume: 0.3,
            loop: false
        });

        this.introMusic.setVolume(this.volumenActual);

        if (this.sound.locked) {
            this.sound.once('unlocked', () => {
                if (!this.yaInicioHistoria && !this.introMusic.isPlaying) {
                    this.introMusic.setVolume(this.volumenActual);
                    this.introMusic.play();
                }
            });
        } else {
            this.introMusic.play();
        }

        this.fondoTransicion = this.add.rectangle(640, 360, 1280, 720, 0x000000, 1);
        this.fondoTransicion.setAlpha(0);
        this.fondoTransicion.setDepth(999);

        this.crearControlVolumen();

        this.pointerDownHandler = (pointer) => {
            if (this.yaInicioHistoria) return;
            if (this.estaEnZonaSlider(pointer)) return;
            this.iniciarHistoria();
        };

        this.input.on('pointerdown', this.pointerDownHandler);

        this.teclaSpace = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );

        this.teclasVolumen = this.input.keyboard.addKeys({
            LEFT: Phaser.Input.Keyboard.KeyCodes.LEFT,
            RIGHT: Phaser.Input.Keyboard.KeyCodes.RIGHT
        });

        this.iniciarRKStart();

        this.events.off('shutdown', this.limpiarEventos, this);
        this.events.off('destroy', this.limpiarEventos, this);
        this.events.on('shutdown', this.limpiarEventos, this);
        this.events.on('destroy', this.limpiarEventos, this);
    }

    update() {
        if (this.background) {
            this.background.tilePositionX += 2;
        }

        if (this.teclaSpace && Phaser.Input.Keyboard.JustDown(this.teclaSpace)) {
            this.iniciarHistoria();
        }

        if (this.teclasVolumen && !this.yaInicioHistoria) {
            const ahora = performance.now();

            if (ahora > this.rkStartCooldownVolumen) {
                if (this.teclasVolumen.LEFT.isDown) {
                    this.cambiarVolumenRKStart(-0.05);
                    this.rkStartCooldownVolumen = ahora + 180;
                } else if (this.teclasVolumen.RIGHT.isDown) {
                    this.cambiarVolumenRKStart(0.05);
                    this.rkStartCooldownVolumen = ahora + 180;
                }
            }
        }

        this.actualizarRKStart();
    }

    // ─────────────────────────────────────────────────────────
    // ESTADO LIMPIO DE PARTIDA
    // ─────────────────────────────────────────────────────────

    _crearEstadoPartidaLimpio() {
        return {
            diaActual: 1,
            modoSoloFondo: false,
            transicionEntrada: true,

            delitosEncontrados: [],
            estadoBuscadorPorDia: {},
            sancionesAsignadas: {},

            vidasDiaActual: 4,
            penalizacionDia: 0,

            puntajeDia: {
                total: 0,
                totalBruto: 0,
                bonusMinijuego: 0,
                detalleDias: []
            },

            cabecillaElegida: null,
            cabecillaCorrecto: null,
            penalizacionesCabecillaDia6: 0
        };
    }

    _limpiarDatosPartida() {
        this.game.registry.set('partidaActual', this._crearEstadoPartidaLimpio());
    }

    _obtenerPartidaActualLimpia() {
        let partidaActual = this.game.registry.get('partidaActual');

        if (!partidaActual) {
            partidaActual = this._crearEstadoPartidaLimpio();
            this.game.registry.set('partidaActual', partidaActual);
        }

        return {
            ...partidaActual,
            delitosEncontrados: Array.isArray(partidaActual.delitosEncontrados)
                ? [...partidaActual.delitosEncontrados]
                : [],
            estadoBuscadorPorDia: partidaActual.estadoBuscadorPorDia || {},
            sancionesAsignadas: partidaActual.sancionesAsignadas || {},
            puntajeDia: partidaActual.puntajeDia || {
                total: 0,
                totalBruto: 0,
                bonusMinijuego: 0,
                detalleDias: []
            }
        };
    }

    // ─────────────────────────────────────────────────────────
    // VOLUMEN GLOBAL
    // ─────────────────────────────────────────────────────────

    _obtenerVolumenGlobal(volumenPorDefecto = 0.5) {
        let volumen = this.game.registry.get('volumenGlobal');

        if (typeof volumen !== 'number') {
            volumen = volumenPorDefecto;
            this.game.registry.set('volumenGlobal', volumen);
        }

        return Phaser.Math.Clamp(volumen, 0, 1);
    }

    _guardarVolumenGlobal(volumen) {
        volumen = Phaser.Math.Clamp(volumen, 0, 1);
        this.volumenActual = volumen;
        this.game.registry.set('volumenGlobal', volumen);
    }

    crearControlVolumen() {
        this.panelVol = this.add.rectangle(1115, 42, 260, 54, 0x091427, 0.9);
        this.panelVol.setDepth(60);
        this.panelVol.setStrokeStyle(2, 0x78a7ff, 1);

        this.volLabel = this.add.text(1038, 42, 'VOL', {
            fontFamily: '"VT323", monospace',
            fontSize: '26px',
            color: '#ffffff',
            stroke: '#09111f',
            strokeThickness: 3
        });

        this.volLabel.setOrigin(0.5);
        this.volLabel.setDepth(61);

        this.sliderX = 1152;
        this.sliderY = 42;
        this.sliderWidth = 135;

        this.sliderTrack = this.add.rectangle(
            this.sliderX,
            this.sliderY,
            this.sliderWidth,
            10,
            0x172642,
            1
        );

        this.sliderTrack.setDepth(61);
        this.sliderTrack.setStrokeStyle(1, 0x8eb8ff, 1);

        this.sliderFill = this.add.rectangle(
            this.sliderX - this.sliderWidth / 2,
            this.sliderY,
            Math.max(4, this.sliderWidth * this.volumenActual),
            10,
            0x66b3ff,
            1
        );

        this.sliderFill.setOrigin(0, 0.5);
        this.sliderFill.setDepth(62);

        this.sliderGlow = this.add.rectangle(
            this.sliderX - this.sliderWidth / 2,
            this.sliderY,
            Math.max(4, this.sliderWidth * this.volumenActual),
            4,
            0xbfe1ff,
            0.9
        );

        this.sliderGlow.setOrigin(0, 0.5);
        this.sliderGlow.setDepth(63);

        this.sliderKnob = this.add.circle(
            this.sliderX - this.sliderWidth / 2 + this.sliderWidth * this.volumenActual,
            this.sliderY,
            11,
            0xffffff,
            1
        );

        this.sliderKnob.setDepth(64);
        this.sliderKnob.setStrokeStyle(3, 0x2558a8, 1);

        this.sliderZone = this.add.zone(
            this.sliderX,
            this.sliderY,
            this.sliderWidth + 40,
            34
        );

        this.sliderZone.setDepth(65);
        this.sliderZone.setInteractive({ cursor: 'pointer' });

        this.sliderZone.on('pointerdown', (pointer) => {
            if (this.yaInicioHistoria) return;
            this.arrastrandoVolumen = true;
            this.actualizarVolumenDesdePointer(pointer.x);
        });

        this.sliderZone.on('pointerover', () => {
            if (this.sliderKnob) {
                this.sliderKnob.setFillStyle(0xe8f4ff, 1);
            }
        });

        this.sliderZone.on('pointerout', () => {
            if (!this.arrastrandoVolumen && this.sliderKnob) {
                this.sliderKnob.setFillStyle(0xffffff, 1);
            }
        });

        this.pointerMoveVolHandler = (pointer) => {
            if (!this.arrastrandoVolumen) return;
            this.actualizarVolumenDesdePointer(pointer.x);
        };

        this.pointerUpVolHandler = () => {
            this.arrastrandoVolumen = false;

            if (this.sliderKnob) {
                this.sliderKnob.setFillStyle(0xffffff, 1);
            }
        };

        this.input.on('pointermove', this.pointerMoveVolHandler);
        this.input.on('pointerup', this.pointerUpVolHandler);
    }

    estaEnZonaSlider(pointer) {
        if (!this.sliderZone) return false;

        const bounds = this.sliderZone.getBounds();
        return Phaser.Geom.Rectangle.Contains(bounds, pointer.x, pointer.y);
    }

    actualizarVolumenDesdePointer(pointerX) {
        const izquierda = this.sliderX - this.sliderWidth / 2;
        const derecha = this.sliderX + this.sliderWidth / 2;

        const xClamped = Phaser.Math.Clamp(pointerX, izquierda, derecha);
        const ratio = (xClamped - izquierda) / this.sliderWidth;

        this._guardarVolumenGlobal(ratio);
        this.actualizarVisualVolumen();
    }

    actualizarVisualVolumen() {
        if (this.introMusic) {
            this.tweens.killTweensOf(this.introMusic);
            this.introMusic.setVolume(this.volumenActual);
        }

        if (this.sliderFill && this.sliderGlow && this.sliderKnob) {
            const izquierda = this.sliderX - this.sliderWidth / 2;

            this.sliderFill.displayWidth = Math.max(4, this.sliderWidth * this.volumenActual);
            this.sliderGlow.displayWidth = Math.max(4, this.sliderWidth * this.volumenActual);
            this.sliderKnob.x = izquierda + this.sliderWidth * this.volumenActual;
        }
    }

    reproducirSpaceSound() {
        if (!this.spaceSound) return;

        if (this.spaceSound.isPlaying) {
            this.spaceSound.stop();
        }

        this.spaceSound.play();
    }

    // ─────────────────────────────────────────────────────────
    // GAMEPADS / RK GAME / PS4
    // ─────────────────────────────────────────────────────────

    iniciarRKStart() {
        this.rkStartAnteriorPorPad = {};
        this.rkStartCooldownVolumen = 0;

        this.rkFocoStart = this.add.rectangle(640, 680, 650, 52, 0x000000, 0);
        this.rkFocoStart.setStrokeStyle(4, 0xffffff, 1);
        this.rkFocoStart.setDepth(80);
        this.rkFocoStart.setVisible(false);

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
            console.warn('No se pudo iniciar gamepads en Start:', error);
        }
    }

    actualizarRKStart() {
        if (this.yaInicioHistoria) return;

        const entrada = this.leerInputTodosLosMandosStart();
        const estado = entrada.estado;
        const justDown = entrada.justDown;

        const hayMandoActivo =
            estado.seleccionar ||
            estado.izquierda ||
            estado.derecha;

        if (!hayMandoActivo && entrada.cantidadMandos === 0) {
            if (this.rkFocoStart) {
                this.rkFocoStart.setVisible(false);
            }
            return;
        }

        if (entrada.cantidadMandos > 0 && this.rkFocoStart) {
            this.rkFocoStart.setVisible(true);
        }

        if (justDown.seleccionar) {
            this.iniciarHistoria();
            return;
        }

        const ahora = performance.now();

        if (ahora > this.rkStartCooldownVolumen) {
            if (estado.izquierda) {
                this.cambiarVolumenRKStart(-0.05);
                this.rkStartCooldownVolumen = ahora + 180;
            } else if (estado.derecha) {
                this.cambiarVolumenRKStart(0.05);
                this.rkStartCooldownVolumen = ahora + 180;
            }
        }
    }

    obtenerMandosStart() {
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

    _crearEstadoVacioStart() {
        return {
            seleccionar: false,
            izquierda: false,
            derecha: false
        };
    }

    _obtenerIdPadStart(pad, fallbackIndex) {
        if (!pad) return `pad_${fallbackIndex}`;

        if (typeof pad.index === 'number') {
            return `slot_${pad.index}`;
        }

        if (pad.id) {
            return `pad_${pad.id}`;
        }

        return `pad_${fallbackIndex}`;
    }

    leerInputTodosLosMandosStart() {
        const pads = this.obtenerMandosStart();

        const estadoFinal = this._crearEstadoVacioStart();
        const justDownFinal = this._crearEstadoVacioStart();

        if (!this.rkStartAnteriorPorPad) {
            this.rkStartAnteriorPorPad = {};
        }

        pads.forEach((pad, fallbackIndex) => {
            const idPad = this._obtenerIdPadStart(pad, fallbackIndex);
            const estadoActual = this.leerEstadoRKStart(pad);
            const estadoAnterior =
                this.rkStartAnteriorPorPad[idPad] ||
                this._crearEstadoVacioStart();

            Object.keys(estadoFinal).forEach(key => {
                estadoFinal[key] =
                    estadoFinal[key] ||
                    estadoActual[key];

                justDownFinal[key] =
                    justDownFinal[key] ||
                    (estadoActual[key] && !estadoAnterior[key]);
            });

            this.rkStartAnteriorPorPad[idPad] = { ...estadoActual };
        });

        return {
            estado: estadoFinal,
            justDown: justDownFinal,
            cantidadMandos: pads.length,
            mandos: pads
        };
    }

    _esMandoPlayStart(pad) {
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

    leerEstadoRKStart(pad) {
        const esPlay = this._esMandoPlayStart(pad);

        const ejeFlechasRK = this.leerEjeRKStart(pad, this.RK_AXIS_FLECHAS);

        // PlayStation:
        // Solo cruceta izquierda/derecha.
        // Ya NO se usa ejeX0 para evitar que el joystick mueva el volumen.
        const playIzquierda =
            this.botonRKStart(pad, 14);

        const playDerecha =
            this.botonRKStart(pad, 15);

        /*
            RK Game:
            Solo usamos el modo HAT para el axis 9.

            Ya NO usamos:
            eje < -0.45
            eje > 0.45

            porque eso podía detectar el neutro como derecha o izquierda.
        */
        const rkIzquierdaHat =
            ejeFlechasRK >= this.RK_HAT_IZQUIERDA_MIN &&
            ejeFlechasRK <= this.RK_HAT_IZQUIERDA_MAX;

        const rkDerechaHat =
            ejeFlechasRK >= this.RK_HAT_DERECHA_MIN &&
            ejeFlechasRK <= this.RK_HAT_DERECHA_MAX;

        const rkIzquierda =
            rkIzquierdaHat ||
            this.botonRKStart(pad, 14) ||
            this.botonRKStart(pad, 16) ||
            this.botonRKStart(pad, 18);

        const rkDerecha =
            rkDerechaHat ||
            this.botonRKStart(pad, 15) ||
            this.botonRKStart(pad, 17) ||
            this.botonRKStart(pad, 19);

        return {
            izquierda: esPlay ? playIzquierda : rkIzquierda,
            derecha: esPlay ? playDerecha : rkDerecha,

            seleccionar:
                esPlay
                    ? this.botonRKStart(pad, 5)
                    : (
                        this.botonRKStart(pad, 5) ||
                        this.botonRKStart(pad, 7)
                    )
        };
    }

    leerEjeRKStart(pad, index) {
        if (!pad) return 0;

        let valor = 0;

        if (pad.axes && index >= 0 && index < pad.axes.length && pad.axes[index] != null) {
            const eje = pad.axes[index];

            if (typeof eje.getValue === 'function') {
                valor = eje.getValue();
            } else if (typeof eje === 'number') {
                valor = eje;
            } else if (typeof eje.value === 'number') {
                valor = eje.value;
            }
        } else if (index === 0 && pad.leftStick) {
            valor = pad.leftStick.x || 0;
        } else if (index === 1 && pad.leftStick) {
            valor = pad.leftStick.y || 0;
        }

        return valor;
    }

    botonRKStart(pad, index) {
        if (!pad) return false;

        if (pad.buttons && pad.buttons[index] != null) {
            const boton = pad.buttons[index];

            if (typeof boton.pressed === 'boolean') {
                return boton.pressed;
            }

            if (typeof boton.value === 'number') {
                return boton.value > 0.35;
            }

            if (typeof boton.getValue === 'function') {
                return boton.getValue() > 0.35;
            }
        }

        if (index === 4 && pad.L1) return pad.L1.pressed || false;
        if (index === 5 && pad.R1) return pad.R1.pressed || false;
        if (index === 6 && pad.L2) return pad.L2.pressed || false;
        if (index === 7 && pad.R2) return pad.R2.pressed || false;

        return false;
    }

    cambiarVolumenRKStart(cambio) {
        const nuevoVolumen = Phaser.Math.Clamp(this.volumenActual + cambio, 0, 1);
        this._guardarVolumenGlobal(nuevoVolumen);
        this.actualizarVisualVolumen();
    }

    iniciarHistoria() {
        if (this.yaInicioHistoria) return;

        this.yaInicioHistoria = true;

        if (this.sliderZone) {
            this.sliderZone.disableInteractive();
        }

        this.reproducirSpaceSound();

        const partidaNueva = {
            ...this._obtenerPartidaActualLimpia(),
            diaActual: 1,
            modoSoloFondo: false,
            transicionEntrada: true,
            volumenActual: this.volumenActual
        };

        this.game.registry.set('partidaActual', partidaNueva);

        if (this.introMusic && this.introMusic.isPlaying) {
            this.tweens.killTweensOf(this.introMusic);

            this.tweens.add({
                targets: this.introMusic,
                volume: 0,
                duration: 350,
                ease: 'Sine.easeIn',
                onComplete: () => {
                    if (this.introMusic && this.introMusic.isPlaying) {
                        this.introMusic.stop();
                    }
                }
            });
        }

        this.tweens.add({
            targets: this.fondoTransicion,
            alpha: 1,
            duration: 900,
            onComplete: () => {
                this.scene.start('EscenaHistoria', {
                    ...partidaNueva,
                    volumenActual: this.volumenActual
                });
            }
        });
    }

    limpiarEventos() {
        if (this.pointerDownHandler) {
            this.input.off('pointerdown', this.pointerDownHandler);
            this.pointerDownHandler = null;
        }

        if (this.pointerMoveVolHandler) {
            this.input.off('pointermove', this.pointerMoveVolHandler);
            this.pointerMoveVolHandler = null;
        }

        if (this.pointerUpVolHandler) {
            this.input.off('pointerup', this.pointerUpVolHandler);
            this.pointerUpVolHandler = null;
        }

        if (this.introMusic) {
            this.tweens.killTweensOf(this.introMusic);
        }

        if (this.introMusic && this.introMusic.isPlaying) {
            this.introMusic.stop();
        }

        if (this.spaceSound && this.spaceSound.isPlaying) {
            this.spaceSound.stop();
        }

        if (this.rkFocoStart) {
            this.rkFocoStart.destroy();
            this.rkFocoStart = null;
        }
    }
}