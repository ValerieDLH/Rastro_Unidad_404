export class PuntajeDia extends Phaser.Scene {
    constructor() {
        super('PuntajeDia');
    }

    preload() {
        if (!this.cache.audio.exists('rings')) {
            this.load.audio('rings', 'music/rings.mp3');
        }
    }

    init(data) {
        data = data || {};

        this.puntajeDia = data.puntajeDia || {
            dia: 1,
            clasificacionesCorrectas: 0,
            puntosClasificacion: 0,
            sancionesCorrectas: 0,
            puntosSanciones: 0,
            bonusMinijuego: 0,
            totalBruto: 0,
            penalizacion: 0,
            vidasRestantes: 4,
            total: 0
        };

        this.puntajeDia.bonusMinijuego = this.puntajeDia.bonusMinijuego || 0;
        this.puntajeDia.clasificacionesCorrectas = this.puntajeDia.clasificacionesCorrectas || 0;
        this.puntajeDia.sancionesCorrectas = this.puntajeDia.sancionesCorrectas || 0;
        this.puntajeDia.penalizacion = this.puntajeDia.penalizacion || 0;
        this.puntajeDia.vidasRestantes = this.puntajeDia.vidasRestantes || 0;
        this.puntajeDia.total = this.puntajeDia.total || 0;

        this.algoritmoGrafo = data.algoritmoGrafo;
        console.log("DATA COMPLETA:", data);
        console.log("ALGORITMO:", this.algoritmoGrafo);
        
        this.siguienteEstado = data.siguienteEstado || {};
        this.resultadoMinijuego = data.resultadoMinijuego || null;
        this.casosDia = Array.isArray(data.casosDia) ? data.casosDia : [];
        this.algoritmoGrafo = data.algoritmoGrafo || null;
        this.yaTransicionando = false;
        this.sonidoRings = null;
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');
        this.cameras.main.fadeIn(450, 0, 0, 0);

        this.add.rectangle(640, 360, 1280, 720, 0x000000, 1);

        this.titulo = this.add.text(640, 68, `Puntaje del Día ${this.puntajeDia.dia}`, {
            fontFamily: '"VT323", monospace',
            fontSize: '56px',
            color: '#ffffff',
            stroke: '#111111',
            strokeThickness: 5
        }).setOrigin(0.5).setAlpha(0);

        this.subtitulo = this.add.text(640, 116, 'Recopilando resultados...', {
            fontFamily: '"VT323", monospace',
            fontSize: '28px',
            color: '#d8d8d8'
        }).setOrigin(0.5).setAlpha(0);

        this.linea = this.add.rectangle(640, 156, 780, 2, 0xffffff, 0.75);
        this.linea.setAlpha(0);

        this.panel = this.add.rectangle(640, 362, 900, 360, 0x0b0b0b, 0.95);
        this.panel.setStrokeStyle(3, 0xffffff, 0.35);
        this.panel.setAlpha(0);

        this.crearFilasPuntaje();

        this.panelTotal = this.add.rectangle(640, 610, 520, 120, 0x111111, 0.98);
        this.panelTotal.setStrokeStyle(3, 0xffffff, 0.35);
        this.panelTotal.setAlpha(0);

        this.txtTotalLabel = this.add.text(640, 575, 'TOTAL DEL DÍA', {
            fontFamily: '"VT323", monospace',
            fontSize: '36px',
            color: '#ffffff'
        }).setOrigin(0.5).setAlpha(0);

        this.txtTotalValor = this.add.text(640, 630, '0 pts', {
            fontFamily: '"VT323", monospace',
            fontSize: '68px',
            color: '#ffffff',
            stroke: '#111111',
            strokeThickness: 6
        }).setOrigin(0.5).setAlpha(0).setScale(0.9);

        this.txtContinuar = this.add.text(640, 700, 'Presiona SPACE o haz click para continuar', {
            fontFamily: '"VT323", monospace',
            fontSize: '23px',
            color: '#bbbbbb'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: [
                this.titulo,
                this.subtitulo,
                this.linea,
                this.panel,
                this.txtClasifLabel,
                this.txtClasifValor,
                this.txtClasifPts,
                this.txtSancionLabel,
                this.txtSancionValor,
                this.txtSancionPts,
                this.txtBonusLabel,
                this.txtBonusValor,
                this.txtPenalizacionLabel,
                this.txtPenalizacionValor,
                this.txtVidasLabel,
                this.txtVidasValor,
                this.panelTotal,
                this.txtTotalLabel,
                this.txtTotalValor
            ],
            alpha: 1,
            duration: 350,
            ease: 'Sine.easeOut'
        });

        this.time.delayedCall(350, () => {
            this._iniciarSonidoConteo();
            this._animarPuntajes();
        });

        this.time.delayedCall(3600, () => {
            if (this.txtContinuar) {
                this.tweens.add({
                    targets: this.txtContinuar,
                    alpha: 1,
                    duration: 250
                });
            }
        });

        this.time.delayedCall(5200, () => {
            this.irASiguienteEscena();
        });

        this.input.keyboard.once('keydown-SPACE', () => {
            this.irASiguienteEscena();
        });

        this.input.once('pointerdown', () => {
            this.irASiguienteEscena();
        });

        this.events.on('shutdown', this._detenerSonidoConteo, this);
        this.events.on('destroy', this._detenerSonidoConteo, this);
    }

    crearFilasPuntaje() {
        const xLabel = 325;
        const xValor = 955;

        this.txtClasifLabel = this.add.text(xLabel, 235, 'Clasificaciones correctas:', {
            fontFamily: '"VT323", monospace',
            fontSize: '30px',
            color: '#ffffff'
        }).setOrigin(0, 0.5).setAlpha(0);

        this.txtClasifValor = this.add.text(xValor, 235, '0', {
            fontFamily: '"VT323", monospace',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(1, 0.5).setAlpha(0);

        this.txtClasifPts = this.add.text(xValor, 268, '+0 pts', {
            fontFamily: '"VT323", monospace',
            fontSize: '26px',
            color: '#d6ffd6'
        }).setOrigin(1, 0.5).setAlpha(0);

        this.txtSancionLabel = this.add.text(xLabel, 315, 'Sanciones correctas:', {
            fontFamily: '"VT323", monospace',
            fontSize: '30px',
            color: '#ffffff'
        }).setOrigin(0, 0.5).setAlpha(0);

        this.txtSancionValor = this.add.text(xValor, 315, '0', {
            fontFamily: '"VT323", monospace',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(1, 0.5).setAlpha(0);

        this.txtSancionPts = this.add.text(xValor, 348, '+0 pts', {
            fontFamily: '"VT323", monospace',
            fontSize: '26px',
            color: '#d6ffd6'
        }).setOrigin(1, 0.5).setAlpha(0);

        this.txtBonusLabel = this.add.text(xLabel, 395, 'Bonus minijuego:', {
            fontFamily: '"VT323", monospace',
            fontSize: '30px',
            color: '#ffffff'
        }).setOrigin(0, 0.5).setAlpha(0);

        this.txtBonusValor = this.add.text(xValor, 395, '+0 pts', {
            fontFamily: '"VT323", monospace',
            fontSize: '32px',
            color: '#fff2a8'
        }).setOrigin(1, 0.5).setAlpha(0);

        this.txtPenalizacionLabel = this.add.text(xLabel, 475, 'Penalización por errores:', {
            fontFamily: '"VT323", monospace',
            fontSize: '30px',
            color: '#ffffff'
        }).setOrigin(0, 0.5).setAlpha(0);

        this.txtPenalizacionValor = this.add.text(xValor, 475, '-0 pts', {
            fontFamily: '"VT323", monospace',
            fontSize: '32px',
            color: '#ffb2b2'
        }).setOrigin(1, 0.5).setAlpha(0);

        this.txtVidasLabel = this.add.text(640, 525, 'Vidas restantes:', {
            fontFamily: '"VT323", monospace',
            fontSize: '28px',
            color: '#d7e8ff'
        }).setOrigin(1, 0.5).setAlpha(0);

        this.txtVidasValor = this.add.text(660, 525, `${this.puntajeDia.vidasRestantes}`, {
            fontFamily: '"VT323", monospace',
            fontSize: '30px',
            color: '#d7e8ff'
        }).setOrigin(0, 0.5).setAlpha(0);
    }

    _iniciarSonidoConteo() {
        if (!this.cache.audio.exists('rings')) return;

        this.sonidoRings = this.sound.add('rings', {
            volume: 0.45,
            loop: true
        });

        if (!this.sonidoRings.isPlaying) {
            this.sonidoRings.play();
        }

        this.time.delayedCall(2500, () => {
            this._detenerSonidoConteo();
        });
    }

    _detenerSonidoConteo() {
        if (this.sonidoRings && this.sonidoRings.isPlaying) {
            this.sonidoRings.stop();
        }

        this.sonidoRings = null;
    }

    _animarPuntajes() {
        const datos = this.puntajeDia;

        this.tweens.addCounter({
            from: 0,
            to: datos.clasificacionesCorrectas,
            duration: 650,
            ease: 'Sine.easeOut',
            onUpdate: (tween) => {
                const value = Math.floor(tween.getValue());
                this.txtClasifValor.setText(`${value}`);
                this.txtClasifPts.setText(`+${value * 10} pts`);
            }
        });

        this.time.delayedCall(260, () => {
            this.tweens.addCounter({
                from: 0,
                to: datos.sancionesCorrectas,
                duration: 650,
                ease: 'Sine.easeOut',
                onUpdate: (tween) => {
                    const value = Math.floor(tween.getValue());
                    this.txtSancionValor.setText(`${value}`);
                    this.txtSancionPts.setText(`+${value * 10} pts`);
                }
            });
        });

        this.time.delayedCall(560, () => {
            this.tweens.addCounter({
                from: 0,
                to: datos.bonusMinijuego,
                duration: 700,
                ease: 'Sine.easeOut',
                onUpdate: (tween) => {
                    const value = Math.floor(tween.getValue());
                    this.txtBonusValor.setText(`+${value} pts`);
                }
            });
        });

        this.time.delayedCall(900, () => {
            this.tweens.addCounter({
                from: 0,
                to: datos.penalizacion,
                duration: 500,
                ease: 'Sine.easeOut',
                onUpdate: (tween) => {
                    const value = Math.floor(tween.getValue());
                    this.txtPenalizacionValor.setText(`-${value} pts`);
                }
            });
        });

        this.time.delayedCall(1280, () => {
            this.tweens.addCounter({
                from: 0,
                to: datos.total,
                duration: 950,
                ease: 'Quad.easeOut',
                onUpdate: (tween) => {
                    const value = Math.floor(tween.getValue());
                    this.txtTotalValor.setText(`${value} pts`);
                }
            });

            this.tweens.add({
                targets: this.txtTotalValor,
                scale: 1.06,
                duration: 220,
                yoyo: true,
                ease: 'Sine.easeInOut'
            });
        });
    }

    irASiguienteEscena() {
        if (this.yaTransicionando) return;
        this.yaTransicionando = true;

        this._detenerSonidoConteo();

        this.cameras.main.fadeOut(420, 0, 0, 0);

        this.time.delayedCall(420, () => {
                this.scene.start('GrafoDia', {
                    diaActual: this.puntajeDia.dia,
                    algoritmo: this.algoritmoGrafo,
                    casosDia: this.casosDia,
                    siguienteEstado: this.siguienteEstado,
                    volumenActual: 0.7
                });
        });
    }
}