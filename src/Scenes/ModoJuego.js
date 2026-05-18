export class ModoJuego extends Phaser.Scene {
    constructor() {
        super('ModoJuego');
    }

    init(data) {
        data = data || {};

        this.volumenActual = typeof data.volumenActual === 'number' ? data.volumenActual : 0.25;
        this.modoSeleccionado = null;
        this.yaTransicionando = false;
        this.arrastrandoVolumen = false;

        this.area1Player = {
            x: 541,
            y: 433,
            width: 330,
            height: 490
        };

        this.area2Player = {
            x: 885,
            y: 433,
            width: 340,
            height: 490
        };

        this.mostrarZonasDebug = false;

        this.estadoBotonesRK = {};
        this.teclasRK = null;
    }

    preload() {
        if (!this.textures.exists('modoJuego')) {
            this.load.image('modoJuego', 'assets/Modo.png');
        }

        if (!this.textures.exists('back')) {
            this.load.image('back', 'assets/back.png');
        }

        if (!this.textures.exists('next')) {
            this.load.image('next', 'assets/next.png');
        }

        if (!this.cache.audio.exists('click')) {
            this.load.audio('click', 'music/click.mp3');
        }

        if (!this.cache.audio.exists('contexto')) {
            this.load.audio('contexto', 'music/contexto.mp3');
        }
    }

    create() {
        this.cameras.main.fadeIn(350, 0, 0, 0);

        this.fondo = this.add.image(640, 360, 'modoJuego');
        this.fondo.setDisplaySize(1280, 720);
        this.fondo.setDepth(0);

        this.sonidoContexto = this.sound.get('contexto');

        if (!this.sonidoContexto) {
            this.sonidoContexto = this.sound.add('contexto', {
                volume: 0.25,
                loop: true
            });
        }

        this.volumenActual = 0.25;
        this.sonidoContexto.setVolume(this.volumenActual);

        if (!this.sonidoContexto.isPlaying) {
            this.sonidoContexto.play();
        }

        this.crearBotonBack();
        this.crearBotonNext();
        this.crearAreasModo();
        this.crearIndicadorSeleccion();
        this.crearControlVolumen();
        this.configurarRKGame();

        this.events.on('shutdown', this.limpiarEventosVolumen, this);
        this.events.on('destroy', this.limpiarEventosVolumen, this);
    }

    update() {
        this.actualizarRKGame();
    }

    reproducirClick() {
        if (this.cache.audio.exists('click')) {
            this.sound.play('click', {
                volume: 0.35
            });
        }
    }

    // =========================================================
    // RK GAME
    // X  = 1 Player
    // B  = 2 Players
    // R1 = Next
    // L1 = Back
    // =========================================================

    configurarRKGame() {
        this.estadoBotonesRK = {};

        this.teclasRK = this.input.keyboard.addKeys({
            X: Phaser.Input.Keyboard.KeyCodes.X,
            B: Phaser.Input.Keyboard.KeyCodes.B,
            R: Phaser.Input.Keyboard.KeyCodes.R,
            ENTER: Phaser.Input.Keyboard.KeyCodes.ENTER,
            ESC: Phaser.Input.Keyboard.KeyCodes.ESC,
            UNO: Phaser.Input.Keyboard.KeyCodes.ONE,
            DOS: Phaser.Input.Keyboard.KeyCodes.TWO
        });

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
            console.warn('RK Game no disponible en esta escena:', error);
        }
    }

    actualizarRKGame() {
        if (this.yaTransicionando) return;
        if (!this.teclasRK) return;

        const seleccionar1P =
            Phaser.Input.Keyboard.JustDown(this.teclasRK.X)
            ||
            Phaser.Input.Keyboard.JustDown(this.teclasRK.UNO)
            ||
            this._botonRKJustDown('X');

        const seleccionar2P =
            Phaser.Input.Keyboard.JustDown(this.teclasRK.B)
            ||
            Phaser.Input.Keyboard.JustDown(this.teclasRK.DOS)
            ||
            this._botonRKJustDown('B');

        const presionarNext =
            Phaser.Input.Keyboard.JustDown(this.teclasRK.R)
            ||
            Phaser.Input.Keyboard.JustDown(this.teclasRK.ENTER)
            ||
            this._botonRKJustDown('R1');

        const presionarBack =
            Phaser.Input.Keyboard.JustDown(this.teclasRK.ESC)
            ||
            this._botonRKJustDown('L1');

        if (seleccionar1P) {
            this.reproducirClick();
            this.seleccionarModo('1P');
            return;
        }

        if (seleccionar2P) {
            this.reproducirClick();
            this.seleccionarModo('2P');
            return;
        }

        if (presionarNext) {
            this.intentarAvanzar();
            return;
        }

        if (presionarBack) {
            this.intentarVolver();
            return;
        }
    }

    _obtenerPadRK() {
        if (!this.input || !this.input.gamepad) return null;

        const gamepadPlugin = this.input.gamepad;

        if (typeof gamepadPlugin.getPad === 'function') {
            return gamepadPlugin.getPad(0);
        }

        if (
            gamepadPlugin.gamepads &&
            gamepadPlugin.gamepads.length > 0
        ) {
            return gamepadPlugin.gamepads[0];
        }

        if (typeof gamepadPlugin.getAll === 'function') {
            const pads = gamepadPlugin.getAll();
            return pads && pads.length > 0 ? pads[0] : null;
        }

        return null;
    }

    _botonRKJustDown(nombre) {
        const mapa = {
            X: [2, 3],
            B: [1],
            R1: [5, 7],
            L1: [4, 6]
        };

        const indices = mapa[nombre];

        if (!indices) return false;

        const pad = this._obtenerPadRK();

        if (!pad || !pad.buttons) {
            this.estadoBotonesRK[nombre] = false;
            return false;
        }

        const presionado = indices.some(index => {
            const boton = pad.buttons[index];

            if (!boton) return false;

            return boton.pressed === true || boton.value > 0.35;
        });

        const antes = this.estadoBotonesRK[nombre] || false;

        this.estadoBotonesRK[nombre] = presionado;

        return presionado && !antes;
    }

    intentarAvanzar() {
        if (this.yaTransicionando) return;

        if (!this.modoSeleccionado) {
            this.mostrarAvisoSeleccion();
            return;
        }

        this.reproducirClick();
        this.irAlJuego();
    }

    intentarVolver() {
        if (this.yaTransicionando) return;

        this.reproducirClick();
        this.yaTransicionando = true;

        if (this.backZone) this.backZone.disableInteractive();
        if (this.nextZone) this.nextZone.disableInteractive();
        if (this.zona1Player) this.zona1Player.disableInteractive();
        if (this.zona2Player) this.zona2Player.disableInteractive();
        if (this.sliderZone) this.sliderZone.disableInteractive();

        this.cameras.main.fadeOut(350, 0, 0, 0);

        this.time.delayedCall(350, () => {
            this.scene.start('Instrucciones', {
                volumenActual: this.volumenActual
            });
        });
    }

    crearBotonBack() {
        this.backBtn = this.add.image(95, 685, 'back');
        this.backBtn.setDepth(20);
        this.backBtn.setScale(0.20);

        this.backZone = this.add.zone(95, 680, 140, 40);
        this.backZone.setDepth(21);
        this.backZone.setInteractive({ cursor: 'pointer' });

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

        this.backZone.on('pointerdown', () => {
            this.intentarVolver();
        });
    }

    crearBotonNext() {
        this.nextBtn = this.add.image(1185, 685, 'next');
        this.nextBtn.setDepth(20);
        this.nextBtn.setScale(0.55);

        this.nextZone = this.add.zone(1185, 680, 260, 100);
        this.nextZone.setDepth(21);
        this.nextZone.setInteractive({ cursor: 'pointer' });

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

        this.nextZone.on('pointerdown', () => {
            this.intentarAvanzar();
        });
    }

    crearAreasModo() {
        this.zona1Player = this.add.zone(
            this.area1Player.x,
            this.area1Player.y,
            this.area1Player.width,
            this.area1Player.height
        );

        this.zona1Player.setDepth(25);
        this.zona1Player.setInteractive({ cursor: 'pointer' });

        this.zona2Player = this.add.zone(
            this.area2Player.x,
            this.area2Player.y,
            this.area2Player.width,
            this.area2Player.height
        );

        this.zona2Player.setDepth(25);
        this.zona2Player.setInteractive({ cursor: 'pointer' });

        this.zona1Player.on('pointerover', () => {
            if (this.yaTransicionando) return;
            this.encenderCuadroSeleccion('1P', false);
        });

        this.zona1Player.on('pointerout', () => {
            if (this.yaTransicionando) return;
            this.apagarCuadroSeleccion('1P');
        });

        this.zona1Player.on('pointerdown', () => {
            if (this.yaTransicionando) return;

            this.reproducirClick();
            this.seleccionarModo('1P');
        });

        this.zona2Player.on('pointerover', () => {
            if (this.yaTransicionando) return;
            this.encenderCuadroSeleccion('2P', false);
        });

        this.zona2Player.on('pointerout', () => {
            if (this.yaTransicionando) return;
            this.apagarCuadroSeleccion('2P');
        });

        this.zona2Player.on('pointerdown', () => {
            if (this.yaTransicionando) return;

            this.reproducirClick();
            this.seleccionarModo('2P');
        });

        if (this.mostrarZonasDebug) {
            this.debug1 = this.add.rectangle(
                this.area1Player.x,
                this.area1Player.y,
                this.area1Player.width,
                this.area1Player.height,
                0x00ff00,
                0.18
            );
            this.debug1.setDepth(24);
            this.debug1.setStrokeStyle(3, 0x00ff00, 1);

            this.debug2 = this.add.rectangle(
                this.area2Player.x,
                this.area2Player.y,
                this.area2Player.width,
                this.area2Player.height,
                0xff0000,
                0.18
            );
            this.debug2.setDepth(24);
            this.debug2.setStrokeStyle(3, 0xff0000, 1);
        }
    }

    crearIndicadorSeleccion() {
        this.brillo1 = this.add.rectangle(
            this.area1Player.x,
            this.area1Player.y,
            this.area1Player.width,
            this.area1Player.height,
            0x6fb6ff,
            0.16
        );
        this.brillo1.setDepth(14);
        this.brillo1.setVisible(false);

        this.marco1 = this.add.rectangle(
            this.area1Player.x,
            this.area1Player.y,
            this.area1Player.width,
            this.area1Player.height,
            0x000000,
            0
        );
        this.marco1.setDepth(16);
        this.marco1.setStrokeStyle(6, 0xffd27a, 1);
        this.marco1.setVisible(false);

        this.brillo2 = this.add.rectangle(
            this.area2Player.x,
            this.area2Player.y,
            this.area2Player.width,
            this.area2Player.height,
            0x6fb6ff,
            0.16
        );
        this.brillo2.setDepth(14);
        this.brillo2.setVisible(false);

        this.marco2 = this.add.rectangle(
            this.area2Player.x,
            this.area2Player.y,
            this.area2Player.width,
            this.area2Player.height,
            0x000000,
            0
        );
        this.marco2.setDepth(16);
        this.marco2.setStrokeStyle(6, 0xffd27a, 1);
        this.marco2.setVisible(false);

        this.txtSeleccion = this.add.text(670, 695, '', {
            fontFamily: '"VT323", monospace',
            fontSize: '32px',
            color: '#ffffff',
            stroke: '#061225',
            strokeThickness: 5
        });
        this.txtSeleccion.setOrigin(0.5);
        this.txtSeleccion.setDepth(22);
    }

    encenderCuadroSeleccion(modo, seleccionado) {
        const marco = modo === '1P' ? this.marco1 : this.marco2;
        const brillo = modo === '1P' ? this.brillo1 : this.brillo2;

        if (!marco || !brillo) return;

        brillo.setVisible(true);
        brillo.setAlpha(seleccionado ? 0.24 : 0.16);

        marco.setVisible(true);
        marco.setAlpha(seleccionado ? 1 : 0.72);

        marco.setStrokeStyle(
            seleccionado ? 7 : 5,
            seleccionado ? 0xffd27a : 0x8fd5ff,
            1
        );

        this.tweens.killTweensOf([marco, brillo]);

        this.tweens.add({
            targets: [marco, brillo],
            scaleX: seleccionado ? 1.025 : 1.015,
            scaleY: seleccionado ? 1.025 : 1.015,
            duration: 120,
            ease: 'Sine.easeOut'
        });
    }

    apagarCuadroSeleccion(modo) {
        if (this.modoSeleccionado === modo) return;

        const marco = modo === '1P' ? this.marco1 : this.marco2;
        const brillo = modo === '1P' ? this.brillo1 : this.brillo2;

        if (!marco || !brillo) return;

        this.tweens.killTweensOf([marco, brillo]);

        marco.setScale(1);
        brillo.setScale(1);

        marco.setVisible(false);
        brillo.setVisible(false);
    }

    seleccionarModo(modo) {
        this.modoSeleccionado = modo;

        if (modo === '1P') {
            this.encenderCuadroSeleccion('1P', true);

            if (this.marco2) {
                this.marco2.setVisible(false);
                this.marco2.setScale(1);
            }

            if (this.brillo2) {
                this.brillo2.setVisible(false);
                this.brillo2.setScale(1);
            }

            this.txtSeleccion.setText('Modo seleccionado: 1 Player');
        }

        if (modo === '2P') {
            this.encenderCuadroSeleccion('2P', true);

            if (this.marco1) {
                this.marco1.setVisible(false);
                this.marco1.setScale(1);
            }

            if (this.brillo1) {
                this.brillo1.setVisible(false);
                this.brillo1.setScale(1);
            }

            this.txtSeleccion.setText('Modo seleccionado: 2 Players');
        }

        const marcoSeleccionado = modo === '1P' ? this.marco1 : this.marco2;

        this.tweens.add({
            targets: marcoSeleccionado,
            scaleX: 1.04,
            scaleY: 1.04,
            duration: 120,
            yoyo: true,
            ease: 'Sine.easeInOut'
        });
    }

    mostrarAvisoSeleccion() {
        if (this.avisoSeleccion) {
            this.avisoSeleccion.destroy();
        }

        this.reproducirClick();

        this.avisoSeleccion = this.add.text(640, 620, 'Selecciona primero 1 Player o 2 Players', {
            fontFamily: '"VT323", monospace',
            fontSize: '32px',
            color: '#fff2a8',
            stroke: '#061225',
            strokeThickness: 5
        });
        this.avisoSeleccion.setOrigin(0.5);
        this.avisoSeleccion.setDepth(30);

        this.tweens.add({
            targets: this.avisoSeleccion,
            y: 600,
            alpha: 0,
            duration: 1300,
            ease: 'Sine.easeOut',
            onComplete: () => {
                if (this.avisoSeleccion) {
                    this.avisoSeleccion.destroy();
                    this.avisoSeleccion = null;
                }
            }
        });
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

        this.volumenActual = Phaser.Math.Clamp(ratio, 0, 1);
        this.game.registry.set('volumenGlobal', this.volumenActual);

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
            this.pointerMoveVolHandler = null;
        }

        if (this.pointerUpVolHandler) {
            this.input.off('pointerup', this.pointerUpVolHandler);
            this.pointerUpVolHandler = null;
        }
    }

    irAlJuego() {
        this.yaTransicionando = true;

        if (this.backZone) this.backZone.disableInteractive();
        if (this.nextZone) this.nextZone.disableInteractive();
        if (this.zona1Player) this.zona1Player.disableInteractive();
        if (this.zona2Player) this.zona2Player.disableInteractive();
        if (this.sliderZone) this.sliderZone.disableInteractive();

        if (this.sonidoContexto && this.sonidoContexto.isPlaying) {
            this.sonidoContexto.stop();
        }

        this.cameras.main.fadeOut(420, 0, 0, 0);

        this.time.delayedCall(420, () => {
            this.scene.start('Ventana1', {
                diaActual: 1,
                transicionEntrada: true,
                volumenActual: this.volumenActual,
                modoJuego: this.modoSeleccionado,
                jugadores: this.modoSeleccionado === '2P' ? 2 : 1
            });
        });
    }
}