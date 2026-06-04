export class Instrucciones extends Phaser.Scene {

    constructor() {
        super('Instrucciones');
    }

    init(data) {
        data = data || {};

        const volumenInicial = typeof data.volumenActual === 'number'
            ? data.volumenActual
            : 0.6;

        this.volumenActual = this._obtenerVolumenGlobal(volumenInicial);

        // RK Game: eje donde reporta las flechitas.
        this.RK_AXIS_FLECHAS = 9;

        // Rangos ajustados según las pruebas del RK Game.
        this.RK_HAT_IZQUIERDA_MIN = 0.65;
        this.RK_HAT_IZQUIERDA_MAX = 0.85;

        this.RK_HAT_DERECHA_MIN = -0.50;
        this.RK_HAT_DERECHA_MAX = -0.35;
    }

    preload() {
        this.load.image('bgInstrucciones', 'assets/Instrucciones.png');
        this.load.image('back', 'assets/back.png');
        this.load.image('next', 'assets/next.png');

        this.load.audio('contexto', 'music/contexto.mp3');
        this.load.audio('click', 'music/click.mp3');
    }

    create() {
        this.yaTransicionando = false;
        this.arrastrandoVolumen = false;

        this.fondo = this.add.image(640, 360, 'bgInstrucciones');
        this.fondo.setDisplaySize(1280, 720);
        this.fondo.setDepth(0);

        this.sonidoContexto = this.sound.get('contexto');

        if (!this.sonidoContexto) {
            this.sonidoContexto = this.sound.add('contexto', {
                volume: this.volumenActual,
                loop: true
            });
        }

        this.sonidoContexto.setVolume(this.volumenActual);

        if (!this.sonidoContexto.isPlaying) {
            this.sonidoContexto.play();
        }

        this.backBtn = this.add.image(95, 685, 'back');
        this.backBtn.setDepth(20);
        this.backBtn.setScale(0.20);

        this.nextBtn = this.add.image(1185, 685, 'next');
        this.nextBtn.setDepth(20);
        this.nextBtn.setScale(0.55);

        this.backZone = this.add.zone(95, 680, 140, 40);
        this.backZone.setDepth(25);
        this.backZone.setInteractive({ cursor: 'pointer' });

        this.nextZone = this.add.zone(1200, 680, 260, 100);
        this.nextZone.setDepth(25);
        this.nextZone.setInteractive({ cursor: 'pointer' });

        this.backZone.on('pointerover', () => {
            if (this.yaTransicionando) return;

            this.tweens.killTweensOf(this.backBtn);
            this.tweens.add({
                targets: this.backBtn,
                scale: 0.215,
                duration: 120
            });
        });

        this.backZone.on('pointerout', () => {
            if (this.yaTransicionando) return;

            this.tweens.killTweensOf(this.backBtn);
            this.tweens.add({
                targets: this.backBtn,
                scale: 0.20,
                duration: 120
            });
        });

        this.nextZone.on('pointerover', () => {
            if (this.yaTransicionando) return;

            this.tweens.killTweensOf(this.nextBtn);
            this.tweens.add({
                targets: this.nextBtn,
                scale: 0.58,
                duration: 120
            });
        });

        this.nextZone.on('pointerout', () => {
            if (this.yaTransicionando) return;

            this.tweens.killTweensOf(this.nextBtn);
            this.tweens.add({
                targets: this.nextBtn,
                scale: 0.55,
                duration: 120
            });
        });

        this.backZone.on('pointerdown', () => {
            if (this.yaTransicionando) return;
            this.reproducirClick();
            this.irAEscenaHistoria();
        });

        this.nextZone.on('pointerdown', () => {
            if (this.yaTransicionando) return;
            this.reproducirClick();
            this.irAModoJuego();
        });

        this.crearControlVolumen();
        this.iniciarRKInstrucciones();

        this.events.on('shutdown', this.limpiarEventosVolumen, this);
        this.events.on('destroy', this.limpiarEventosVolumen, this);

        this.cameras.main.fadeIn(400, 0, 0, 0);
    }

    update() {
        this.actualizarRKInstrucciones();
    }

    // ─────────────────────────────────────────────────────────
    // CONTROLES RK GAME / PLAYSTATION
    // ─────────────────────────────────────────────────────────

    iniciarRKInstrucciones() {
        this.rkInstruccionesAnteriorPorPad = {};
        this.rkInstruccionesCooldownVolumen = 0;

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
            console.warn('No se pudo iniciar gamepads en Instrucciones:', error);
        }
    }

    actualizarRKInstrucciones() {
        if (this.yaTransicionando) return;

        const entrada = this.leerInputTodosLosMandosInstrucciones();
        const estado = entrada.estado;
        const justDown = entrada.justDown;

        if (justDown.l1) {
            this.reproducirClick();

            if (this.backBtn) {
                this.tweens.killTweensOf(this.backBtn);
                this.tweens.add({
                    targets: this.backBtn,
                    scale: 0.215,
                    duration: 90,
                    yoyo: true
                });
            }

            this.irAEscenaHistoria();
            return;
        }

        if (justDown.r1) {
            this.reproducirClick();

            if (this.nextBtn) {
                this.tweens.killTweensOf(this.nextBtn);
                this.tweens.add({
                    targets: this.nextBtn,
                    scale: 0.58,
                    duration: 90,
                    yoyo: true
                });
            }

            this.irAModoJuego();
            return;
        }

        const ahora = performance.now();

        if (ahora > this.rkInstruccionesCooldownVolumen) {
            if (estado.izquierda) {
                this.cambiarVolumenInstrucciones(-0.05);
                this.rkInstruccionesCooldownVolumen = ahora + 180;
            } else if (estado.derecha) {
                this.cambiarVolumenInstrucciones(0.05);
                this.rkInstruccionesCooldownVolumen = ahora + 180;
            }
        }
    }

    obtenerMandosInstrucciones() {
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

    _crearEstadoVacioInstrucciones() {
        return {
            l1: false,
            r1: false,
            izquierda: false,
            derecha: false
        };
    }

    _obtenerIdPadInstrucciones(pad, fallbackIndex) {
        if (!pad) return `pad_${fallbackIndex}`;

        if (typeof pad.index === 'number') {
            return `slot_${pad.index}`;
        }

        if (pad.id) {
            return `pad_${pad.id}`;
        }

        return `pad_${fallbackIndex}`;
    }

    leerInputTodosLosMandosInstrucciones() {
        const pads = this.obtenerMandosInstrucciones();

        const estadoFinal = this._crearEstadoVacioInstrucciones();
        const justDownFinal = this._crearEstadoVacioInstrucciones();

        if (!this.rkInstruccionesAnteriorPorPad) {
            this.rkInstruccionesAnteriorPorPad = {};
        }

        pads.forEach((pad, fallbackIndex) => {
            const idPad = this._obtenerIdPadInstrucciones(pad, fallbackIndex);
            const estadoActual = this.leerEstadoInstrucciones(pad);
            const estadoAnterior =
                this.rkInstruccionesAnteriorPorPad[idPad] ||
                this._crearEstadoVacioInstrucciones();

            Object.keys(estadoFinal).forEach(key => {
                estadoFinal[key] =
                    estadoFinal[key] ||
                    estadoActual[key];

                justDownFinal[key] =
                    justDownFinal[key] ||
                    (estadoActual[key] && !estadoAnterior[key]);
            });

            this.rkInstruccionesAnteriorPorPad[idPad] = { ...estadoActual };
        });

        return {
            estado: estadoFinal,
            justDown: justDownFinal,
            cantidadMandos: pads.length,
            mandos: pads
        };
    }

    _esMandoPlayInstrucciones(pad) {
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

    leerEstadoInstrucciones(pad) {
        const esPlay = this._esMandoPlayInstrucciones(pad);
        const ejeFlechasRK = this.leerEjeInstrucciones(pad, this.RK_AXIS_FLECHAS);

        // PlayStation:
        // L1 = 4
        // R1 = 5
        // Cruceta izquierda = 14
        // Cruceta derecha = 15
        const playL1 = this.botonInstrucciones(pad, 4);
        const playR1 = this.botonInstrucciones(pad, 5);
        const playIzquierda = this.botonInstrucciones(pad, 14);
        const playDerecha = this.botonInstrucciones(pad, 15);

        // RK Game:
        // L1 = Back
        // R1 = Next
        // Flechitas por axis 9.
        const rkL1 = this.botonInstrucciones(pad, 6);
        const rkR1 =
            this.botonInstrucciones(pad, 5) ||
            this.botonInstrucciones(pad, 7);

        const rkIzquierdaHat =
            ejeFlechasRK >= this.RK_HAT_IZQUIERDA_MIN &&
            ejeFlechasRK <= this.RK_HAT_IZQUIERDA_MAX;

        const rkDerechaHat =
            ejeFlechasRK >= this.RK_HAT_DERECHA_MIN &&
            ejeFlechasRK <= this.RK_HAT_DERECHA_MAX;

        const rkIzquierda =
            rkIzquierdaHat ||
            this.botonInstrucciones(pad, 14) ||
            this.botonInstrucciones(pad, 16) ||
            this.botonInstrucciones(pad, 18);

        const rkDerecha =
            rkDerechaHat ||
            this.botonInstrucciones(pad, 15) ||
            this.botonInstrucciones(pad, 17) ||
            this.botonInstrucciones(pad, 19);

        return {
            l1: esPlay ? playL1 : rkL1,
            r1: esPlay ? playR1 : rkR1,
            izquierda: esPlay ? playIzquierda : rkIzquierda,
            derecha: esPlay ? playDerecha : rkDerecha
        };
    }

    leerEjeInstrucciones(pad, index) {
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

    botonInstrucciones(pad, index) {
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

    cambiarVolumenInstrucciones(cambio) {
        const nuevoVolumen = Phaser.Math.Clamp(this.volumenActual + cambio, 0, 1);

        this._guardarVolumenGlobal(nuevoVolumen);

        if (this.sonidoContexto) {
            this.sonidoContexto.setVolume(this.volumenActual);
        }

        this.actualizarUIVolumen();
    }

    // ─────────────────────────────────────────────────────────
    // VOLUMEN / AUDIO
    // ─────────────────────────────────────────────────────────

    _obtenerVolumenGlobal(volumenPorDefecto = 0.6) {
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

    reproducirClick() {
        this.sound.play('click', { volume: 0.45 });
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

        this.sliderTrack = this.add.rectangle(this.sliderX, this.sliderY, this.sliderWidth, 10, 0x172642, 1);
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

        this.sliderZone = this.add.zone(this.sliderX, this.sliderY, this.sliderWidth + 40, 34);
        this.sliderZone.setDepth(65);
        this.sliderZone.setInteractive({ cursor: 'pointer' });

        this.sliderZone.on('pointerdown', (pointer) => {
            if (this.yaTransicionando) return;
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

    actualizarVolumenDesdePointer(pointerX) {
        const izquierda = this.sliderX - this.sliderWidth / 2;
        const derecha = this.sliderX + this.sliderWidth / 2;

        const xClamped = Phaser.Math.Clamp(pointerX, izquierda, derecha);
        const ratio = (xClamped - izquierda) / this.sliderWidth;

        this._guardarVolumenGlobal(ratio);

        if (this.sonidoContexto) {
            this.sonidoContexto.setVolume(this.volumenActual);
        }

        this.actualizarUIVolumen();
    }

    actualizarUIVolumen() {
        if (!this.sliderFill || !this.sliderGlow || !this.sliderKnob) return;

        const izquierda = this.sliderX - this.sliderWidth / 2;

        this.sliderFill.displayWidth = Math.max(4, this.sliderWidth * this.volumenActual);
        this.sliderGlow.displayWidth = Math.max(4, this.sliderWidth * this.volumenActual);
        this.sliderKnob.x = izquierda + this.sliderWidth * this.volumenActual;
    }

    limpiarEventosVolumen() {
        if (this.pointerMoveVolHandler) {
            this.input.off('pointermove', this.pointerMoveVolHandler);
            this.pointerMoveVolHandler = null;
        }

        if (this.pointerUpVolHandler) {
            this.input.off('pointerup', this.pointerUpVolHandler);
            this.pointerUpVolHandler = null;
        }
    }

    // ─────────────────────────────────────────────────────────
    // CAMBIO DE ESCENAS
    // ─────────────────────────────────────────────────────────

    irAEscenaHistoria() {
        if (this.yaTransicionando) return;
        this.yaTransicionando = true;

        if (this.backZone) {
            this.backZone.disableInteractive();
        }

        if (this.nextZone) {
            this.nextZone.disableInteractive();
        }

        if (this.sliderZone) {
            this.sliderZone.disableInteractive();
        }

        this.cameras.main.fadeOut(400, 0, 0, 0);

        this.time.delayedCall(400, () => {
            this.scene.start('EscenaHistoria', {
                volumenActual: this.volumenActual
            });
        });
    }

    irAModoJuego() {
        if (this.yaTransicionando) return;
        this.yaTransicionando = true;

        if (this.backZone) {
            this.backZone.disableInteractive();
        }

        if (this.nextZone) {
            this.nextZone.disableInteractive();
        }

        if (this.sliderZone) {
            this.sliderZone.disableInteractive();
        }

        this.cameras.main.fadeOut(400, 0, 0, 0);

        this.time.delayedCall(400, () => {
            this.scene.start('ModoJuego', {
                volumenActual: this.volumenActual
            });
        });
    }
}