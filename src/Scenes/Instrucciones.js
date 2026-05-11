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

        this.nextZone = this.add.zone(1185, 680, 260, 100);
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
            this.reproducirClick();
            this.irAEscenaHistoria();
        });

        this.nextZone.on('pointerdown', () => {
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

    iniciarRKInstrucciones() {
        this.rkInstruccionesAnterior = {
            l1: false,
            r1: false
        };
    }

    actualizarRKInstrucciones() {
        if (this.yaTransicionando) return;

        const pad = this.obtenerPadRKInstrucciones();
        if (!pad) return;

        const l1Presionado = this.botonRKInstrucciones(pad, 6);
        const r1Presionado = this.botonRKInstrucciones(pad, 7);

        const l1JustDown = l1Presionado && !this.rkInstruccionesAnterior.l1;
        const r1JustDown = r1Presionado && !this.rkInstruccionesAnterior.r1;

        if (l1JustDown) {
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
        }

        if (r1JustDown) {
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
        }

        this.rkInstruccionesAnterior.l1 = l1Presionado;
        this.rkInstruccionesAnterior.r1 = r1Presionado;
    }

    obtenerPadRKInstrucciones() {
        if (!this.input.gamepad) return null;

        if (typeof this.input.gamepad.getPad === 'function') {
            return this.input.gamepad.getPad(0);
        }

        if (this.input.gamepad.gamepads) {
            return this.input.gamepad.gamepads[0] || null;
        }

        return null;
    }

    botonRKInstrucciones(pad, index) {
        if (!pad || !pad.buttons || !pad.buttons[index]) return false;

        const boton = pad.buttons[index];
        const valor = typeof boton.value === 'number' ? boton.value : 0;

        return boton.pressed === true || valor > 0.35;
    }

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
            this.arrastrandoVolumen = true;
            this.actualizarVolumenDesdePointer(pointer.x);
        });

        this.sliderZone.on('pointerover', () => {
            this.sliderKnob.setFillStyle(0xe8f4ff, 1);
        });

        this.sliderZone.on('pointerout', () => {
            if (!this.arrastrandoVolumen) {
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

        this.sliderFill.displayWidth = Math.max(4, this.sliderWidth * this.volumenActual);
        this.sliderGlow.displayWidth = Math.max(4, this.sliderWidth * this.volumenActual);
        this.sliderKnob.x = izquierda + this.sliderWidth * this.volumenActual;
    }

    limpiarEventosVolumen() {
        if (this.pointerMoveVolHandler) {
            this.input.off('pointermove', this.pointerMoveVolHandler);
        }

        if (this.pointerUpVolHandler) {
            this.input.off('pointerup', this.pointerUpVolHandler);
        }
    }

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