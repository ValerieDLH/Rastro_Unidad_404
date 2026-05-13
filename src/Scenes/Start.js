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

        this.mensaje = this.add.text(640, 680, 'Presiona SPACE o haz click para continuar', {
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

        this.iniciarRKStart();

        this.events.on('shutdown', this.limpiarEventos, this);
        this.events.on('destroy', this.limpiarEventos, this);
    }

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

        if (this.introMusic) {
            this.tweens.killTweensOf(this.introMusic);
            this.introMusic.setVolume(this.volumenActual);
        }

        this.sliderFill.displayWidth = Math.max(4, this.sliderWidth * this.volumenActual);
        this.sliderGlow.displayWidth = Math.max(4, this.sliderWidth * this.volumenActual);
        this.sliderKnob.x = izquierda + this.sliderWidth * this.volumenActual;
    }

    reproducirSpaceSound() {
        if (!this.spaceSound) return;

        if (this.spaceSound.isPlaying) {
            this.spaceSound.stop();
        }

        this.spaceSound.play();
    }

    iniciarRKStart() {
        this.rkStartAnterior = {
            seleccionar: false,
            izquierda: false,
            derecha: false
        };

        this.rkStartCooldownVolumen = 0;

        this.rkFocoStart = this.add.rectangle(640, 680, 650, 52, 0x000000, 0);
        this.rkFocoStart.setStrokeStyle(4, 0xffffff, 1);
        this.rkFocoStart.setDepth(80);
        this.rkFocoStart.setVisible(false);

        if (this.input.gamepad) {
            this.input.gamepad.on('connected', (pad) => {
                console.log('RK/Gamepad conectado en Start:', pad.index, pad.id);
            });
        }
    }

    actualizarRKStart() {
        if (this.yaInicioHistoria) return;

        const pad = this.obtenerPadRKStart();

        if (!pad) {
            if (this.rkFocoStart) {
                this.rkFocoStart.setVisible(false);
            }
            return;
        }

        if (this.rkFocoStart) {
            this.rkFocoStart.setVisible(true);
        }

        const estado = this.leerEstadoRKStart(pad);

        const seleccionarJustDown =
            estado.seleccionar && !this.rkStartAnterior.seleccionar;

        if (seleccionarJustDown) {
            this.iniciarHistoria();
        }

        const ahora = performance.now();

        if (ahora > this.rkStartCooldownVolumen) {
            if (estado.izquierda) {
                this.cambiarVolumenRKStart(-0.05);
                this.rkStartCooldownVolumen = ahora + 140;
            }

            if (estado.derecha) {
                this.cambiarVolumenRKStart(0.05);
                this.rkStartCooldownVolumen = ahora + 140;
            }
        }

        this.rkStartAnterior = {
            seleccionar: estado.seleccionar,
            izquierda: estado.izquierda,
            derecha: estado.derecha
        };
    }

    cambiarVolumenRKStart(cambio) {
        const nuevoVolumen = Phaser.Math.Clamp(this.volumenActual + cambio, 0, 1);

        this._guardarVolumenGlobal(nuevoVolumen);

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

    obtenerPadRKStart() {
        if (!this.input.gamepad) return null;

        if (typeof this.input.gamepad.getPad === 'function') {
            return this.input.gamepad.getPad(0);
        }

        if (this.input.gamepad.gamepads) {
            return this.input.gamepad.gamepads[0] || null;
        }

        return null;
    }

    leerEstadoRKStart(pad) {
        const ejeX = this.leerEjeRKStart(pad, 0);

        return {
            izquierda: ejeX < -0.45 || this.botonRKStart(pad, 14),
            derecha: ejeX > 0.45 || this.botonRKStart(pad, 15),

            // A normalmente es botón 0.
            // R2 en tu RK Game quedó como botón 9.
            seleccionar: this.botonRKStart(pad, 0) || this.botonRKStart(pad, 9)
        };
    }

    leerEjeRKStart(pad, index) {
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

    botonRKStart(pad, index) {
        if (!pad || !pad.buttons || !pad.buttons[index]) return false;

        const boton = pad.buttons[index];
        const valor = typeof boton.value === 'number' ? boton.value : 0;

        return boton.pressed === true || valor > 0.35;
    }

    iniciarHistoria() {
        if (this.yaInicioHistoria) return;

        this.yaInicioHistoria = true;

        if (this.sliderZone) {
            this.sliderZone.disableInteractive();
        }

        this.reproducirSpaceSound();

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
                    volumenActual: this.volumenActual
                });
            }
        });
    }

    update() {
        if (this.background) {
            this.background.tilePositionX += 2;
        }

        if (Phaser.Input.Keyboard.JustDown(this.teclaSpace)) {
            this.iniciarHistoria();
        }

        this.actualizarRKStart();
    }

    limpiarEventos() {
        if (this.pointerDownHandler) {
            this.input.off('pointerdown', this.pointerDownHandler);
        }

        if (this.pointerMoveVolHandler) {
            this.input.off('pointermove', this.pointerMoveVolHandler);
        }

        if (this.pointerUpVolHandler) {
            this.input.off('pointerup', this.pointerUpVolHandler);
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