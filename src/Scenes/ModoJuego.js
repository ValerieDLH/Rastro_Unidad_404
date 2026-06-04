import { resetPersonajesPartida } from '../structures/Personajes.js';

export class ModoJuego extends Phaser.Scene {
    constructor() {
        super('ModoJuego');
    }

    init(data) {
        data = data || {};

        const volumenInicial = typeof data.volumenActual === 'number'
            ? data.volumenActual
            : 0.25;

        this.volumenActual = this._obtenerVolumenGlobal(volumenInicial);
        this.nuevaPartida = data.nuevaPartida === true;

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

        // RK Game: eje donde reporta las flechitas.
        this.RK_AXIS_FLECHAS = 9;

        // Rangos ya ajustados según tus pruebas del RK Game.
        this.RK_HAT_IZQUIERDA_MIN = 0.65;
        this.RK_HAT_IZQUIERDA_MAX = 0.85;

        this.RK_HAT_DERECHA_MIN = -0.50;
        this.RK_HAT_DERECHA_MAX = -0.35;
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
                volume: this.volumenActual,
                loop: true
            });
        }

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

    _obtenerVolumenGlobal(volumenPorDefecto = 0.25) {
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
        if (this.cache.audio.exists('click')) {
            this.sound.play('click', {
                volume: 0.35
            });
        }
    }

    // =========================================================
    // CONTROLES RK GAME / PLAYSTATION
    // PlayStation:
    // Cuadrado = 1 Player
    // Círculo  = 2 Players
    // L1       = Back
    // R1       = Next
    // Cruceta izquierda/derecha = volumen
    //
    // RK Game:
    // X        = 1 Player
    // B        = 2 Players
    // L1       = Back
    // R1       = Next
    // Flechitas izquierda/derecha = volumen
    // =========================================================

    configurarRKGame() {
        this.estadoBotonesRK = {};
        this.estadoBotonesPorPad = {};
        this.cooldownVolumenRK = 0;

        this.teclasRK = this.input.keyboard.addKeys({
            X: Phaser.Input.Keyboard.KeyCodes.X,
            B: Phaser.Input.Keyboard.KeyCodes.B,
            R: Phaser.Input.Keyboard.KeyCodes.R,
            ENTER: Phaser.Input.Keyboard.KeyCodes.ENTER,
            ESC: Phaser.Input.Keyboard.KeyCodes.ESC,
            UNO: Phaser.Input.Keyboard.KeyCodes.ONE,
            DOS: Phaser.Input.Keyboard.KeyCodes.TWO,
            LEFT: Phaser.Input.Keyboard.KeyCodes.LEFT,
            RIGHT: Phaser.Input.Keyboard.KeyCodes.RIGHT
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
            console.warn('Gamepad no disponible en ModoJuego:', error);
        }
    }

    actualizarRKGame() {
        if (this.yaTransicionando) return;
        if (!this.teclasRK) return;

        const entrada = this.leerInputTodosLosMandosModo();
        const estado = entrada.estado;
        const justDown = entrada.justDown;

        const seleccionar1P =
            Phaser.Input.Keyboard.JustDown(this.teclasRK.X) ||
            Phaser.Input.Keyboard.JustDown(this.teclasRK.UNO) ||
            justDown.x;

        const seleccionar2P =
            Phaser.Input.Keyboard.JustDown(this.teclasRK.B) ||
            Phaser.Input.Keyboard.JustDown(this.teclasRK.DOS) ||
            justDown.b;

        const presionarNext =
            Phaser.Input.Keyboard.JustDown(this.teclasRK.R) ||
            Phaser.Input.Keyboard.JustDown(this.teclasRK.ENTER) ||
            justDown.r1;

        const presionarBack =
            Phaser.Input.Keyboard.JustDown(this.teclasRK.ESC) ||
            justDown.l1;

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

        const ahora = performance.now();

        if (ahora > this.cooldownVolumenRK) {
            if (estado.izquierda || this.teclasRK.LEFT.isDown) {
                this.cambiarVolumenModo(-0.05);
                this.cooldownVolumenRK = ahora + 180;
            } else if (estado.derecha || this.teclasRK.RIGHT.isDown) {
                this.cambiarVolumenModo(0.05);
                this.cooldownVolumenRK = ahora + 180;
            }
        }
    }

    obtenerMandosModo() {
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

    _crearEstadoVacioModo() {
        return {
            x: false,
            b: false,
            l1: false,
            r1: false,
            izquierda: false,
            derecha: false
        };
    }

    _obtenerIdPadModo(pad, fallbackIndex) {
        if (!pad) return `pad_${fallbackIndex}`;

        if (typeof pad.index === 'number') {
            return `slot_${pad.index}`;
        }

        if (pad.id) {
            return `pad_${pad.id}`;
        }

        return `pad_${fallbackIndex}`;
    }

    leerInputTodosLosMandosModo() {
        const pads = this.obtenerMandosModo();

        const estadoFinal = this._crearEstadoVacioModo();
        const justDownFinal = this._crearEstadoVacioModo();

        if (!this.estadoBotonesPorPad) {
            this.estadoBotonesPorPad = {};
        }

        pads.forEach((pad, fallbackIndex) => {
            const idPad = this._obtenerIdPadModo(pad, fallbackIndex);
            const estadoActual = this.leerEstadoModo(pad);
            const estadoAnterior =
                this.estadoBotonesPorPad[idPad] ||
                this._crearEstadoVacioModo();

            Object.keys(estadoFinal).forEach(key => {
                estadoFinal[key] =
                    estadoFinal[key] ||
                    estadoActual[key];

                justDownFinal[key] =
                    justDownFinal[key] ||
                    (estadoActual[key] && !estadoAnterior[key]);
            });

            this.estadoBotonesPorPad[idPad] = { ...estadoActual };
        });

        return {
            estado: estadoFinal,
            justDown: justDownFinal,
            cantidadMandos: pads.length,
            mandos: pads
        };
    }

    _esMandoPlayModo(pad) {
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

    leerEstadoModo(pad) {
        const esPlay = this._esMandoPlayModo(pad);
        const ejeFlechasRK = this.leerEjeModo(pad, this.RK_AXIS_FLECHAS);

        // PlayStation:
        // Cuadrado = 2
        // Círculo = 1
        // L1 = 4
        // R1 = 5
        // Cruceta izquierda = 14
        // Cruceta derecha = 15
        const playX = this.botonModo(pad, 2);
        const playB = this.botonModo(pad, 1);
        const playL1 = this.botonModo(pad, 4);
        const playR1 = this.botonModo(pad, 5);
        const playIzquierda = this.botonModo(pad, 14);
        const playDerecha = this.botonModo(pad, 15);

        // RK Game:
        // X = 2 o 3 según mapeo
        // B = 1
        // L1 = 6
        // R1 = 5 o 7
        // Flechitas por axis 9.
        const rkX =
            this.botonModo(pad, 2) ||
            this.botonModo(pad, 3);

        const rkB = this.botonModo(pad, 1);

        const rkL1 = this.botonModo(pad, 6);

        const rkR1 =
            this.botonModo(pad, 5) ||
            this.botonModo(pad, 7);

        const rkIzquierdaHat =
            ejeFlechasRK >= this.RK_HAT_IZQUIERDA_MIN &&
            ejeFlechasRK <= this.RK_HAT_IZQUIERDA_MAX;

        const rkDerechaHat =
            ejeFlechasRK >= this.RK_HAT_DERECHA_MIN &&
            ejeFlechasRK <= this.RK_HAT_DERECHA_MAX;

        const rkIzquierda =
            rkIzquierdaHat ||
            this.botonModo(pad, 14) ||
            this.botonModo(pad, 16) ||
            this.botonModo(pad, 18);

        const rkDerecha =
            rkDerechaHat ||
            this.botonModo(pad, 15) ||
            this.botonModo(pad, 17) ||
            this.botonModo(pad, 19);

        return {
            x: esPlay ? playX : rkX,
            b: esPlay ? playB : rkB,
            l1: esPlay ? playL1 : rkL1,
            r1: esPlay ? playR1 : rkR1,
            izquierda: esPlay ? playIzquierda : rkIzquierda,
            derecha: esPlay ? playDerecha : rkDerecha
        };
    }

    leerEjeModo(pad, index) {
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

    botonModo(pad, index) {
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

    cambiarVolumenModo(cambio) {
        const nuevoVolumen = Phaser.Math.Clamp(this.volumenActual + cambio, 0, 1);

        this._guardarVolumenGlobal(nuevoVolumen);

        if (this.sonidoContexto) {
            this.sonidoContexto.setVolume(this.volumenActual);
        }

        this.actualizarUIVolumen();
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
            if (this.yaTransicionando) return;
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
            resetPersonajesPartida();

            const estadoLimpio = this._crearEstadoPartidaLimpio();

            const datosNuevaPartida = {
                ...estadoLimpio,

                diaActual: 1,
                modoSoloFondo: false,
                transicionEntrada: true,
                volumenActual: this.volumenActual,

                modoJuego: this.modoSeleccionado,
                jugadores: this.modoSeleccionado === '2P' ? 2 : 1
            };

            this.game.registry.set('partidaActual', datosNuevaPartida);

            this.scene.start('Ventana1', datosNuevaPartida);
        });
    }

}