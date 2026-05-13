export class EscenaHistoria extends Phaser.Scene {

    constructor() {
        super('EscenaHistoria');
    }

    init(data) {
        data = data || {};

        const volumenInicial = typeof data.volumenActual === 'number'
            ? data.volumenActual
            : 0.5;

        this.volumenActual = this._obtenerVolumenGlobal(volumenInicial);
    }

    preload() {
        this.load.image('esc1', 'assets/esc1.png');
        this.load.image('esc2', 'assets/esc2.png');
        this.load.image('esc3', 'assets/esc3.png');
        this.load.image('esc5', 'assets/esc5.png');
        this.load.image('esc6', 'assets/esc6.png');

        this.load.image('back', 'assets/back.png');
        this.load.image('skip', 'assets/skip.png');

        this.load.audio('escribir', 'music/escribir.mp3');
        this.load.audio('contexto', 'music/contexto.mp3');
        this.load.audio('click', 'music/click.mp3');
    }

    create() {
        this.imagenes = ['esc1', 'esc2', 'esc3', 'esc5', 'esc6'];
        this.indiceActual = 0;

        this.sonidoEscribir = null;
        this.sonidoContexto = this.sound.get('contexto') || null;

        if (this.sonidoContexto) {
            this.sonidoContexto.setVolume(this.volumenActual);
        }

        this.maquinaEscribir = null;
        this.timerIntro = null;
        this.timerSecuencia = null;

        this.yaTransicionando = false;
        this.arrastrandoVolumen = false;

        this.tiempoEntreEscenas = 3000;
        this.duracionFadeEscenas = 350;

        this.imagenHistoria = this.add.image(640, 360, this.imagenes[0]);
        this.imagenHistoria.setDisplaySize(1280, 720);
        this.imagenHistoria.setAlpha(0);
        this.imagenHistoria.setDepth(0);

        this.fondoNegro = this.add.rectangle(640, 360, 1280, 720, 0x000000, 1);
        this.fondoNegro.setDepth(2);

        this.textoAntes = this.add.text(640, 360, '', {
            fontFamily: '"VT323", monospace',
            fontSize: '60px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#222222',
                blur: 3,
                fill: true
            },
            wordWrap: { width: 1200 }
        });
        this.textoAntes.setOrigin(0.5);
        this.textoAntes.setDepth(3);
        this.textoAntes.setLineSpacing(10);

        this.cursor = this.add.text(652, 360, '_', {
            fontFamily: '"VT323", monospace',
            fontSize: '60px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });
        this.cursor.setOrigin(0, 0.5);
        this.cursor.setDepth(3);

        this.textoEsc3 = this.add.text(40, 640, 'Valeria: Estaba jugando y...', {
            fontFamily: '"VT323", monospace',
            fontSize: '35px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 5,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#222222',
                blur: 3,
                fill: true
            }
        });
        this.textoEsc3.setOrigin(0, 1);
        this.textoEsc3.setDepth(10);
        this.textoEsc3.setVisible(false);

        this.backBtn = this.add.image(95, 685, 'back');
        this.backBtn.setDepth(20);
        this.backBtn.setScale(0.20);

        this.skipBtn = this.add.image(1185, 685, 'skip');
        this.skipBtn.setDepth(20);
        this.skipBtn.setScale(0.18);

        this.backZone = this.add.zone(95, 680, 140, 40);
        this.backZone.setDepth(25);
        this.backZone.setInteractive({ cursor: 'pointer' });

        this.skipZone = this.add.zone(1185, 680, 140, 40);
        this.skipZone.setDepth(25);
        this.skipZone.setInteractive({ cursor: 'pointer' });

        this.backZone.on('pointerover', () => {
            if (this.yaTransicionando) return;
            this.backBtn.setScale(0.215);
        });

        this.backZone.on('pointerout', () => {
            if (this.yaTransicionando) return;
            this.backBtn.setScale(0.20);
        });

        this.skipZone.on('pointerover', () => {
            if (this.yaTransicionando) return;
            this.skipBtn.setScale(0.195);
        });

        this.skipZone.on('pointerout', () => {
            if (this.yaTransicionando) return;
            this.skipBtn.setScale(0.18);
        });

        this.backZone.on('pointerdown', () => {
            if (this.yaTransicionando) return;
            this.reproducirClick();
            this.irAStart();
        });

        this.skipZone.on('pointerdown', () => {
            if (this.yaTransicionando) return;
            this.reproducirClick();
            this.irAInstrucciones();
        });

        this.tweens.add({
            targets: this.cursor,
            alpha: 0,
            duration: 350,
            yoyo: true,
            repeat: -1
        });

        this.crearControlVolumen();
        this.iniciarRKHistoria();

        this.events.on('shutdown', this.limpiarEventosEscena, this);
        this.events.on('destroy', this.limpiarEventosEscena, this);

        this.mostrarTextoIntro();
    }

    update() {
        this.actualizarRKHistoria();
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

    reproducirClick() {
        this.sound.play('click', { volume: 0.45 });
    }

    mostrarTextoIntro() {
        const textoCompleto = 'Unos días antes...';
        let i = 0;

        this.sonidoEscribir = this.sound.add('escribir', {
            volume: this.volumenActual,
            loop: true
        });

        this.sonidoEscribir.setVolume(this.volumenActual);
        this.sonidoEscribir.play();

        this.maquinaEscribir = this.time.addEvent({
            delay: 90,
            repeat: textoCompleto.length - 1,
            callback: () => {
                if (this.yaTransicionando) return;

                this.textoAntes.setText(textoCompleto.substring(0, i + 1));

                const anchoTexto = this.textoAntes.width;
                this.cursor.setPosition(640 + (anchoTexto / 2) + 12, 360);

                i++;

                if (i >= textoCompleto.length) {
                    if (this.sonidoEscribir && this.sonidoEscribir.isPlaying) {
                        this.sonidoEscribir.stop();
                    }

                    if (this.maquinaEscribir) {
                        this.maquinaEscribir.remove(false);
                        this.maquinaEscribir = null;
                    }

                    this.iniciarSalidaIntro();
                }
            }
        });
    }

    iniciarSalidaIntro() {
        if (this.yaTransicionando) return;

        this.tweens.add({
            targets: [this.fondoNegro, this.textoAntes, this.cursor],
            alpha: 0,
            duration: 700,
            onComplete: () => {
                if (this.yaTransicionando) return;

                this.fondoNegro.destroy();
                this.textoAntes.destroy();
                this.cursor.destroy();

                this.tweens.add({
                    targets: this.imagenHistoria,
                    alpha: 1,
                    duration: 800,
                    onComplete: () => {
                        if (this.yaTransicionando) return;

                        this.iniciarMusicaContexto();
                        this.actualizarTextoEsc3();
                        this.mostrarSecuencia();
                    }
                });
            }
        });
    }

    iniciarMusicaContexto() {
        this.volumenActual = this._obtenerVolumenGlobal(this.volumenActual);

        if (!this.sonidoContexto) {
            this.sonidoContexto = this.sound.add('contexto', {
                volume: this.volumenActual,
                loop: true
            });
        }

        this.tweens.killTweensOf(this.sonidoContexto);
        this.sonidoContexto.setVolume(this.volumenActual);

        if (!this.sonidoContexto.isPlaying) {
            this.sonidoContexto.play();
        }

        if (this.sliderFill && this.sliderGlow && this.sliderKnob) {
            this.actualizarUIVolumen();
        }
    }

    actualizarTextoEsc3() {
        if (this.indiceActual === 2) {
            this.textoEsc3.setVisible(true);
        } else {
            this.textoEsc3.setVisible(false);
        }
    }

    iniciarRKHistoria() {
        this.rkHistoriaAnterior = {
            l1: false,
            r1: false
        };

        if (this.input.gamepad) {
            this.input.gamepad.on('connected', (pad) => {
                console.log('RK/Gamepad conectado en EscenaHistoria:', pad.index, pad.id);
            });
        }
    }

    actualizarRKHistoria() {
        if (this.yaTransicionando) return;

        const pad = this.obtenerPadRKHistoria();
        if (!pad) return;

        const l1Presionado = this.botonRKHistoria(pad, 6);
        const r1Presionado = this.botonRKHistoria(pad, 7);

        const l1JustDown = l1Presionado && !this.rkHistoriaAnterior.l1;
        const r1JustDown = r1Presionado && !this.rkHistoriaAnterior.r1;

        if (l1JustDown) {
            this.reproducirClick();

            if (this.backBtn) {
                this.backBtn.setScale(0.215);
            }

            this.irAStart();
        }

        if (r1JustDown) {
            this.reproducirClick();

            if (this.skipBtn) {
                this.skipBtn.setScale(0.195);
            }

            this.irAInstrucciones();
        }

        this.rkHistoriaAnterior.l1 = l1Presionado;
        this.rkHistoriaAnterior.r1 = r1Presionado;
    }

    obtenerPadRKHistoria() {
        if (!this.input.gamepad) return null;

        if (typeof this.input.gamepad.getPad === 'function') {
            return this.input.gamepad.getPad(0);
        }

        if (this.input.gamepad.gamepads) {
            return this.input.gamepad.gamepads[0] || null;
        }

        return null;
    }

    botonRKHistoria(pad, index) {
        if (!pad || !pad.buttons || !pad.buttons[index]) return false;

        const boton = pad.buttons[index];
        const valor = typeof boton.value === 'number' ? boton.value : 0;

        return boton.pressed === true || valor > 0.35;
    }

    mostrarSecuencia() {
        if (this.yaTransicionando) return;

        const siguienteIndice = this.indiceActual + 1;

        if (siguienteIndice >= this.imagenes.length) {
            this.timerSecuencia = this.time.delayedCall(this.tiempoEntreEscenas, () => {
                if (this.yaTransicionando) return;

                this.tweens.add({
                    targets: [this.imagenHistoria, this.textoEsc3],
                    alpha: 0,
                    duration: this.duracionFadeEscenas,
                    onComplete: () => {
                        if (this.yaTransicionando) return;
                        this.irAInstrucciones();
                    }
                });
            });

            return;
        }

        this.timerSecuencia = this.time.delayedCall(this.tiempoEntreEscenas, () => {
            if (this.yaTransicionando) return;

            this.tweens.add({
                targets: [this.imagenHistoria, this.textoEsc3],
                alpha: 0,
                duration: this.duracionFadeEscenas,
                onComplete: () => {
                    if (this.yaTransicionando) return;

                    this.indiceActual = siguienteIndice;

                    const nuevaImagen = this.imagenes[this.indiceActual];

                    this.imagenHistoria.setTexture(nuevaImagen);
                    this.actualizarTextoEsc3();

                    if (this.indiceActual === 2) {
                        this.textoEsc3.setVisible(true);
                        this.textoEsc3.setAlpha(1);
                    } else {
                        this.textoEsc3.setVisible(false);
                        this.textoEsc3.setAlpha(0);
                    }

                    const elementosFadeIn = [this.imagenHistoria];

                    if (this.indiceActual === 2) {
                        elementosFadeIn.push(this.textoEsc3);
                    }

                    this.tweens.add({
                        targets: elementosFadeIn,
                        alpha: 1,
                        duration: this.duracionFadeEscenas,
                        onComplete: () => {
                            if (this.yaTransicionando) return;
                            this.mostrarSecuencia();
                        }
                    });
                }
            });
        });
    }
    crearControlVolumen() {
        this.volumenActual = this._obtenerVolumenGlobal(this.volumenActual);

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
            this.tweens.killTweensOf(this.sonidoContexto);
            this.sonidoContexto.setVolume(this.volumenActual);
        }

        if (this.sonidoEscribir) {
            this.tweens.killTweensOf(this.sonidoEscribir);
            this.sonidoEscribir.setVolume(this.volumenActual);
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

    irAInstrucciones() {
        if (this.yaTransicionando) return;
        this.yaTransicionando = true;

        if (this.maquinaEscribir) {
            this.maquinaEscribir.remove(false);
            this.maquinaEscribir = null;
        }

        if (this.timerIntro) {
            this.timerIntro.remove(false);
            this.timerIntro = null;
        }

        if (this.timerSecuencia) {
            this.timerSecuencia.remove(false);
            this.timerSecuencia = null;
        }

        this.tweens.killAll();

        if (this.sonidoEscribir && this.sonidoEscribir.isPlaying) {
            this.sonidoEscribir.stop();
        }

        if (this.backZone) {
            this.backZone.disableInteractive();
        }

        if (this.skipZone) {
            this.skipZone.disableInteractive();
        }

        if (this.sliderZone) {
            this.sliderZone.disableInteractive();
        }

        this.cameras.main.fadeOut(500, 0, 0, 0);

        this.time.delayedCall(500, () => {
            this.scene.start('Instrucciones', {
                volumenActual: this.volumenActual
            });
        });
    }

    irAStart() {
        if (this.yaTransicionando) return;
        this.yaTransicionando = true;

        if (this.maquinaEscribir) {
            this.maquinaEscribir.remove(false);
            this.maquinaEscribir = null;
        }

        if (this.timerIntro) {
            this.timerIntro.remove(false);
            this.timerIntro = null;
        }

        if (this.timerSecuencia) {
            this.timerSecuencia.remove(false);
            this.timerSecuencia = null;
        }

        this.tweens.killAll();

        if (this.sonidoEscribir && this.sonidoEscribir.isPlaying) {
            this.sonidoEscribir.stop();
        }

        if (this.sonidoContexto && this.sonidoContexto.isPlaying) {
            this.sonidoContexto.stop();
        }

        if (this.backZone) {
            this.backZone.disableInteractive();
        }

        if (this.skipZone) {
            this.skipZone.disableInteractive();
        }

        if (this.sliderZone) {
            this.sliderZone.disableInteractive();
        }

        this.cameras.main.fadeOut(500, 0, 0, 0);

        this.time.delayedCall(500, () => {
            this.scene.start('Start', {
                volumenActual: this.volumenActual
            });
        });
    }

    limpiarEventosEscena() {
        if (this.pointerMoveVolHandler) {
            this.input.off('pointermove', this.pointerMoveVolHandler);
            this.pointerMoveVolHandler = null;
        }

        if (this.pointerUpVolHandler) {
            this.input.off('pointerup', this.pointerUpVolHandler);
            this.pointerUpVolHandler = null;
        }

        if (this.sonidoEscribir && this.sonidoEscribir.isPlaying) {
            this.sonidoEscribir.stop();
        }

        if (this.sonidoContexto && this.sonidoContexto.isPlaying) {
            this.sonidoContexto.stop();
        }
    }
}