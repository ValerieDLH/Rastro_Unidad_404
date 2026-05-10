export class GameOver extends Phaser.Scene {
    constructor() {
        super('GameOver');
    }

    preload() {
        if (!this.textures.exists('back')) {
            this.load.image('back', 'assets/back.png');
        }

        if (!this.cache.audio.exists('click')) {
            this.load.audio('click', 'music/click.mp3');
        }
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');
        this.cameras.main.fadeIn(500, 0, 0, 0);

        this.add.rectangle(640, 360, 1280, 720, 0x000000, 1);

        this.textoGameOver = this.add.text(640, 250, 'GAME OVER', {
            fontFamily: '"VT323", monospace',
            fontSize: '92px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#222222',
                blur: 3,
                fill: true
            }
        });
        this.textoGameOver.setOrigin(0.5);
        this.textoGameOver.setAlpha(0);

        this.textoInfo = this.add.text(640, 350, 'Perdiste todas las vidas.\nDebes comenzar desde el Día 1.', {
            fontFamily: '"VT323", monospace',
            fontSize: '34px',
            color: '#d9d9d9',
            align: 'center',
            lineSpacing: 8
        });
        this.textoInfo.setOrigin(0.5);
        this.textoInfo.setAlpha(0);

        this.backBtn = this.add.image(640, 535, 'back');
        this.backBtn.setScale(0.22);
        this.backBtn.setDepth(10);
        this.backBtn.setAlpha(0);

        this.backZone = this.add.zone(640, 535, 190, 58);
        this.backZone.setDepth(11);
        this.backZone.setInteractive({ cursor: 'pointer' });

        this.backZone.on('pointerover', () => {
            this.tweens.killTweensOf(this.backBtn);
            this.tweens.add({
                targets: this.backBtn,
                scale: 0.235,
                duration: 120
            });
        });

        this.backZone.on('pointerout', () => {
            this.tweens.killTweensOf(this.backBtn);
            this.tweens.add({
                targets: this.backBtn,
                scale: 0.22,
                duration: 120
            });
        });

        this.backZone.on('pointerdown', () => {
            if (this.cache.audio.exists('click')) {
                this.sound.play('click', { volume: 0.45 });
            }

            this.backZone.disableInteractive();

            this.cameras.main.fadeOut(400, 0, 0, 0);

            this.time.delayedCall(400, () => {
                this.scene.start('Ventana1', {
                    diaActual: 1,
                    transicionEntrada: true,
                    volumenActual: 0.7,
                    modoSoloFondo: false,
                    delitosEncontrados: [],
                    estadoBuscadorPorDia: {},
                    sancionesAsignadas: {},
                    vidasDiaActual: 4,
                    penalizacionDia: 0
                });
            });
        });

        this.tweens.add({
            targets: [this.textoGameOver, this.textoInfo, this.backBtn],
            alpha: 1,
            duration: 500,
            ease: 'Sine.easeOut'
        });
    }
}