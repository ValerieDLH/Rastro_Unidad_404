import { Dias, vectorDelDia } from '../structures/Personajes.js';
import { Sanciones } from '../structures/Sanciones.js';

export class Arbol extends Phaser.Scene {
    constructor() {
        super('Ventana1');
    }

    init(data) {
        data = data || {};

        this.diaActual = data.diaActual || 1;
        this.volumenActual = typeof data.volumenActual === 'number' ? data.volumenActual : 0.7;
        this.transicionEntrada = data.transicionEntrada || false;
        this.modoSoloFondo = data.modoSoloFondo || false;

        this.delitosEncontrados = Array.isArray(data.delitosEncontrados) ? data.delitosEncontrados : [];
        this.estadoBuscadorPorDia = data.estadoBuscadorPorDia || {};
        this.sancionesAsignadas = data.sancionesAsignadas || {};
        this.culpablesFinalesDia7 = Array.isArray(data.culpablesFinalesDia7)
            ? data.culpablesFinalesDia7
            : [];

        this.vidasDiaActual = typeof data.vidasDiaActual === 'number' ? data.vidasDiaActual : 4;
        this.penalizacionDia = typeof data.penalizacionDia === 'number' ? data.penalizacionDia : 0;

        if (this.diaActual > 8) {
            this.diaActual = 8;
            this.modoSoloFondo = true;
        }
    }

    preload() {
        this.load.image('fondoOficina', 'assets/oficina.png');
        this.load.image('b1', 'assets/b1.png');
        this.load.image('b2', 'assets/b2.png');
        this.load.image('b3', 'assets/b3.png');
        this.load.image('b4', 'assets/b4.png');
        this.load.image('b5', 'assets/b5.png');
        this.load.image('b6', 'assets/b6.png');

        this.load.image('Bd', 'assets/Bd.png');
        this.load.image('Denc', 'assets/Denc.png');
        this.load.image('Dias', 'assets/Dias.png');
        this.load.image('Mand', 'assets/Mand.png');
        this.load.image('Find', 'assets/Find.png');
        this.load.image('back', 'assets/back.png');

        this.load.image('dia1', 'assets/dia1.png');
        this.load.image('dia2', 'assets/dia2.png');
        this.load.image('dia3', 'assets/dia3.png');
        this.load.image('dia4', 'assets/dia4.png');
        this.load.image('dia5', 'assets/dia5.png');
        this.load.image('dia6', 'assets/dia6.png');
        this.load.image('dia7', 'assets/dia7.png');

        this.load.audio('musicajugar', 'music/musicajugar.mp3');
        this.load.audio('musicaDia2', 'music/b1.mp3');
        this.load.audio('musicaDia3', 'music/b2.mp3');
        this.load.audio('musicaDia4', 'music/b3.mp3');
        this.load.audio('musicaDia5', 'music/b4.mp3');
        this.load.audio('musicaDia6', 'music/b5.mp3');
        this.load.audio('musicaDia7', 'music/b6.mp3');
        this.load.audio('click', 'music/click.mp3');

        const todos = Object.values(Dias).flat();
        const yaCargados = new Set();

        todos.forEach(pj => {
            if (!pj || !pj.nombre) return;

            const key = `pj_${this._normalizarNombre(pj.nombre)}`;
            if (yaCargados.has(key)) return;

            yaCargados.add(key);
            this.load.image(key, `Personajes/${this._normalizarNombre(pj.nombre)}.png`);
        });
    }

    create() {
        if (!this.estadoBuscadorPorDia[this.diaActual]) {
            this.estadoBuscadorPorDia[this.diaActual] = {};
        }

        this.yaTransicionando = false;
        this.modalAbierto = false;
        this.arrastrandoVolumen = false;
        this.elementosContenidoModal = [];
        this._sancionesModalElements = [];
        this._manualIndice = 0;
        this.paginaBuscador = 0;
        this.scrollState = null;

        this.crearTexturaTransicion();

        this.sonidoVentana = this.sound.add(this.obtenerMusicaDelDia(), {
            volume: 0,
            loop: true
        });

        if (!this.sonidoVentana.isPlaying) {
            this.sonidoVentana.play();
        }

        this.events.off('shutdown', this.detenerSonidos, this);
        this.events.off('destroy', this.detenerSonidos, this);
        this.events.on('shutdown', this.detenerSonidos, this);
        this.events.on('destroy', this.detenerSonidos, this);

        this.fondo = this.add.image(640, 360, this.obtenerBackgroundDelDia());
        this.fondo.setDisplaySize(1280, 720);
        this.fondo.setDepth(0);

        if (this.diaActual === 6) {
            this.crearBotonBack();
            this.crearControlVolumen();
            this.crearVistaDia6ABB();
            this.iniciarFadeInMusica();

            if (this.transicionEntrada) {
                this.reproducirTransicionEntrada();
            }
            return;
        }

        if (this.diaActual === 7 && !this.modoSoloFondo) {
            this.crearBotonBackFinal();
            this.crearControlVolumen();
            this.crearVistaDia7Seleccion();
            this.iniciarFadeInMusica();

            if (this.transicionEntrada) {
                this.reproducirTransicionEntrada();
            }
            return;
        }

        if (this.diaActual === 8) {
            this.crearPantallaFinalCaso();
            this.iniciarFadeInMusica();

            if (this.transicionEntrada) {
                this.reproducirTransicionEntrada();
            }
            return;
        }

        if (this.modoSoloFondo) {
            this.crearBotonBackFinal();
            this.crearTituloFinal();
            this.crearControlVolumen();
            this.iniciarFadeInMusica();

            if (this.transicionEntrada) {
                this.reproducirTransicionEntrada();
            }
            return;
        }

        this.bd = this.add.image(320, 225, 'Bd');
        this.bd.setDepth(5);
        this.bd.setScale(0.4);

        this.denc = this.add.image(930, 225, 'Denc');
        this.denc.setDepth(5);
        this.denc.setScale(0.4);

        this.dias = this.add.image(320, 550, 'Dias');
        this.dias.setDepth(5);
        this.dias.setScale(0.4);

        this.mand = this.add.image(840, 550, 'Mand');
        this.mand.setDepth(5);
        this.mand.setScale(0.4);

        this.find = this.add.image(1090, 610, 'Find');
        this.find.setDepth(5);
        this.find.setScale(0.28);

        this.dia1 = this.add.image(170, 532, 'dia1');
        this.dia1.setDepth(6);
        this.dia1.setScale(0.10);

        this.dia2 = this.add.image(270, 532, 'dia2');
        this.dia2.setDepth(6);
        this.dia2.setScale(0.10);

        this.dia3 = this.add.image(370, 532, 'dia3');
        this.dia3.setDepth(6);
        this.dia3.setScale(0.10);

        this.dia4 = this.add.image(470, 532, 'dia4');
        this.dia4.setDepth(6);
        this.dia4.setScale(0.10);

        this.dia5 = this.add.image(170, 632, 'dia5');
        this.dia5.setDepth(6);
        this.dia5.setScale(0.10);

        this.dia6 = this.add.image(270, 632, 'dia6');
        this.dia6.setDepth(6);
        this.dia6.setScale(0.10);

        this.dia7 = this.add.image(370, 632, 'dia7');
        this.dia7.setDepth(6);
        this.dia7.setScale(0.10);

        this.crearBotonBack();
        this.crearHitboxBuscadorFija();
        this.crearHitboxDencFija();
        this.crearHitboxMandFija();
        this.crearHitboxFindFija();
        this.crearHitboxDias();
        this.crearModalPersonalizado();
        this.crearControlVolumen();
        this.actualizarEstadoDias();
        this.crearIndicadorVidas();

        this.personajesDia = vectorDelDia(this.diaActual) || [];

        this._generarAvataresFaltantes();
        this.delitosEncontrados = this._deduplicarPersonajes(this.delitosEncontrados);

        this.iniciarFadeInMusica();

        if (this.transicionEntrada) {
            this.reproducirTransicionEntrada();
        }
    }

    // ─────────────────────────────────────────────────────────
    // Helpers base
    // ─────────────────────────────────────────────────────────
    _normalizarNombre(nombre = '') {
        return nombre
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '_');
    }

    _obtenerIdPersonaje(pj) {
        return `${pj.dia}_${pj.rango}_${this._normalizarNombre(pj.nombre || '')}`;
    }

    _obtenerClaveAvatar(pj) {
        return `pj_${this._normalizarNombre(pj.nombre || '')}`;
    }

    _deduplicarPersonajes(lista) {
        const mapa = new Map();

        (lista || []).forEach(pj => {
            if (!pj) return;
            mapa.set(this._obtenerIdPersonaje(pj), pj);
        });

        return Array.from(mapa.values());
    }

    reproducirClick() {
        this.sound.play('click', { volume: 0.35 });
    }

    obtenerBackgroundDelDia() {
        const fondos = {
            1: 'fondoOficina',
            2: 'b1',
            3: 'b2',
            4: 'b3',
            5: 'b4',
            6: 'b5',
            7: 'b6'
        };

        return fondos[this.diaActual] || 'fondoOficina';
    }

    obtenerMusicaDelDia() {
        const musica = {
            1: 'musicajugar',
            2: 'musicaDia2',
            3: 'musicaDia3',
            4: 'musicaDia4',
            5: 'musicaDia5',
            6: 'musicaDia6',
            7: 'musicaDia7'
        };

        return musica[this.diaActual] || 'musicajugar';
    }

    iniciarFadeInMusica() {
        if (!this.sonidoVentana) return;

        this.tweens.killTweensOf(this.sonidoVentana);
        this.sonidoVentana.setVolume(0);

        this.tweens.add({
            targets: this.sonidoVentana,
            volume: this.volumenActual,
            duration: 850,
            ease: 'Sine.easeOut'
        });
    }

    fadeOutMusica(callback) {
        if (!this.sonidoVentana || !this.sonidoVentana.isPlaying) {
            if (callback) callback();
            return;
        }

        this.tweens.killTweensOf(this.sonidoVentana);

        this.tweens.add({
            targets: this.sonidoVentana,
            volume: 0,
            duration: 500,
            ease: 'Sine.easeIn',
            onComplete: () => {
                if (callback) callback();
            }
        });
    }

    // ─────────────────────────────────────────────────────────
    // Transiciones
    // ─────────────────────────────────────────────────────────
    crearTexturaTransicion() {
        if (this.textures.exists('circuloNegroTransicion')) return;

        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x000000, 1);
        g.fillCircle(512, 512, 512);
        g.generateTexture('circuloNegroTransicion', 1024, 1024);
        g.destroy();
    }

    reproducirTransicionEntrada() {
        this.cameras.main.setZoom(1.04);

        this.overlayEntrada = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.22);
        this.overlayEntrada.setDepth(290);

        this.circuloTransicion = this.add.image(640, 360, 'circuloNegroTransicion');
        this.circuloTransicion.setDepth(300);
        this.circuloTransicion.setScale(2.5);

        this.tweens.add({
            targets: this.circuloTransicion,
            scale: 0.001,
            duration: 700,
            ease: 'Cubic.easeOut',
            onComplete: () => {
                if (this.circuloTransicion) {
                    this.circuloTransicion.destroy();
                    this.circuloTransicion = null;
                }
            }
        });

        this.tweens.add({
            targets: this.overlayEntrada,
            alpha: 0,
            duration: 520,
            onComplete: () => {
                if (this.overlayEntrada) {
                    this.overlayEntrada.destroy();
                    this.overlayEntrada = null;
                }
            }
        });

        this.tweens.add({
            targets: this.cameras.main,
            zoom: 1,
            duration: 700,
            ease: 'Quad.easeOut'
        });
    }

    reproducirTransicionSalida(callback) {
        this.cameras.main.setZoom(1);

        this.overlaySalida = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0);
        this.overlaySalida.setDepth(295);

        this.circuloTransicion = this.add.image(640, 360, 'circuloNegroTransicion');
        this.circuloTransicion.setDepth(300);
        this.circuloTransicion.setScale(0.001);

        this.tweens.add({
            targets: this.circuloTransicion,
            scale: 2.5,
            duration: 700,
            ease: 'Cubic.easeIn'
        });

        this.tweens.add({
            targets: this.overlaySalida,
            alpha: 0.32,
            duration: 520
        });

        this.tweens.add({
            targets: this.cameras.main,
            zoom: 1.06,
            duration: 700,
            ease: 'Quad.easeIn',
            onComplete: () => {
                if (callback) callback();
            }
        });
    }

    // ─────────────────────────────────────────────────────────
    // Botones principales
    // ─────────────────────────────────────────────────────────
    crearBotonBack() {
        this.backBtn = this.add.image(85, 40, 'back');
        this.backBtn.setDepth(50);
        this.backBtn.setScale(0.20);

        this.backZone = this.add.zone(85, 55, 140, 50);
        this.backZone.setDepth(51);
        this.backZone.setInteractive({ cursor: 'pointer' });

        this.backZone.on('pointerover', () => {
            if (this.modalAbierto) return;
            this.tweens.killTweensOf(this.backBtn);
            this.tweens.add({
                targets: this.backBtn,
                scale: 0.215,
                duration: 120
            });
        });

        this.backZone.on('pointerout', () => {
            if (this.modalAbierto) return;
            this.tweens.killTweensOf(this.backBtn);
            this.tweens.add({
                targets: this.backBtn,
                scale: 0.20,
                duration: 120
            });
        });

        this.backZone.on('pointerdown', () => {
            if (this.modalAbierto || this.yaTransicionando) return;
            this.reproducirClick();
            this.irAStart();
        });
    }

    crearBotonBackFinal() {
        this.backBtn = this.add.image(85, 40, 'back');
        this.backBtn.setDepth(80);
        this.backBtn.setScale(0.20);

        this.backZone = this.add.zone(85, 55, 140, 50);
        this.backZone.setDepth(81);
        this.backZone.setInteractive({ cursor: 'pointer' });

        this.backZone.on('pointerover', () => {
            this.tweens.killTweensOf(this.backBtn);
            this.tweens.add({
                targets: this.backBtn,
                scale: 0.215,
                duration: 120
            });
        });

        this.backZone.on('pointerout', () => {
            this.tweens.killTweensOf(this.backBtn);
            this.tweens.add({
                targets: this.backBtn,
                scale: 0.20,
                duration: 120
            });
        });

        this.backZone.on('pointerdown', () => {
            if (this.yaTransicionando) return;
            this.reproducirClick();
            this.irAStart();
        });
    }

    crearTituloFinal() {
        this.tituloFinalBg = this.add.rectangle(640, 52, 240, 52, 0x091427, 0.88);
        this.tituloFinalBg.setDepth(79);
        this.tituloFinalBg.setStrokeStyle(2, 0x78a7ff, 1);

        this.tituloFinal = this.add.text(640, 52, 'Día 7', {
            fontFamily: '"VT323", monospace',
            fontSize: '34px',
            color: '#ffffff',
            stroke: '#09111f',
            strokeThickness: 4
        });
        this.tituloFinal.setOrigin(0.5);
        this.tituloFinal.setDepth(80);
    }

    crearHitboxBuscadorFija() {
        this.hitboxBd = this.add.zone(310, 225, 460, 310);
        this.hitboxBd.setDepth(30);
        this.hitboxBd.setInteractive({ cursor: 'pointer' });

        this.hitboxBd.on('pointerover', () => {
            if (this.modalAbierto) return;
            this.tweens.killTweensOf(this.bd);
            this.tweens.add({
                targets: this.bd,
                scale: 0.43,
                duration: 120
            });
        });

        this.hitboxBd.on('pointerout', () => {
            if (this.modalAbierto) return;
            this.tweens.killTweensOf(this.bd);
            this.tweens.add({
                targets: this.bd,
                scale: 0.4,
                duration: 120
            });
        });

        this.hitboxBd.on('pointerdown', () => {
            if (this.modalAbierto) return;
            this.reproducirClick();
            this.abrirModalPrincipal('buscar');
        });
    }

    crearHitboxDencFija() {
        this.hitboxDenc = this.add.zone(930, 210, 440, 240);
        this.hitboxDenc.setDepth(30);
        this.hitboxDenc.setInteractive({ cursor: 'pointer' });

        this.hitboxDenc.on('pointerover', () => {
            if (this.modalAbierto) return;
            this.tweens.killTweensOf(this.denc);
            this.tweens.add({
                targets: this.denc,
                scale: 0.43,
                duration: 120
            });
        });

        this.hitboxDenc.on('pointerout', () => {
            if (this.modalAbierto) return;
            this.tweens.killTweensOf(this.denc);
            this.tweens.add({
                targets: this.denc,
                scale: 0.4,
                duration: 120
            });
        });

        this.hitboxDenc.on('pointerdown', () => {
            if (this.modalAbierto) return;
            this.reproducirClick();
            this.abrirModalPrincipal('encontrados');
        });
    }

    crearHitboxMandFija() {
        this.hitboxMand = this.add.zone(840, 550, 260, 120);
        this.hitboxMand.setDepth(30);
        this.hitboxMand.setInteractive({ cursor: 'pointer' });

        this.hitboxMand.on('pointerover', () => {
            if (this.modalAbierto) return;
            this.tweens.killTweensOf(this.mand);
            this.tweens.add({
                targets: this.mand,
                scale: 0.43,
                duration: 120
            });
        });

        this.hitboxMand.on('pointerout', () => {
            if (this.modalAbierto) return;
            this.tweens.killTweensOf(this.mand);
            this.tweens.add({
                targets: this.mand,
                scale: 0.4,
                duration: 120
            });
        });

        this.hitboxMand.on('pointerdown', () => {
            if (this.modalAbierto) return;
            this.reproducirClick();
            this.abrirModalPrincipal('manual');
        });
    }

    crearHitboxFindFija() {
        this.hitboxFind = this.add.zone(1090, 610, 220, 100);
        this.hitboxFind.setDepth(30);
        this.hitboxFind.setInteractive({ cursor: 'pointer' });

        this.hitboxFind.on('pointerover', () => {
            if (this.modalAbierto) return;
            this.tweens.killTweensOf(this.find);
            this.tweens.add({
                targets: this.find,
                scale: 0.31,
                duration: 120
            });
        });

        this.hitboxFind.on('pointerout', () => {
            if (this.modalAbierto) return;
            this.tweens.killTweensOf(this.find);
            this.tweens.add({
                targets: this.find,
                scale: 0.28,
                duration: 120
            });
        });

        this.hitboxFind.on('pointerdown', () => {
            if (this.modalAbierto || this.yaTransicionando) return;

            const resultado = this._validarDiaActualCompleto();

            if (!resultado.todoCorrecto) {
                this.reproducirClick();
                this.registrarErrorDia();

                if (this.vidasDiaActual > 0) {
                    this._mostrarResumenValidacionDia(resultado);
                }

                return;
            }

            this.reproducirClick();
            this.finalizarDia();
        });
    }

    crearHitboxDias() {
        this.hitboxDia1 = this.add.zone(170, 532, 90, 90);
        this.hitboxDia1.setDepth(30);
        this.hitboxDia1.setInteractive({ cursor: 'pointer' });

        this.hitboxDia2 = this.add.zone(270, 532, 90, 90);
        this.hitboxDia2.setDepth(30);
        this.hitboxDia2.setInteractive({ cursor: 'pointer' });

        this.hitboxDia3 = this.add.zone(370, 532, 90, 90);
        this.hitboxDia3.setDepth(30);
        this.hitboxDia3.setInteractive({ cursor: 'pointer' });

        this.hitboxDia4 = this.add.zone(470, 532, 90, 90);
        this.hitboxDia4.setDepth(30);
        this.hitboxDia4.setInteractive({ cursor: 'pointer' });

        this.hitboxDia5 = this.add.zone(170, 632, 90, 90);
        this.hitboxDia5.setDepth(30);
        this.hitboxDia5.setInteractive({ cursor: 'pointer' });

        this.hitboxDia6 = this.add.zone(270, 632, 90, 90);
        this.hitboxDia6.setDepth(30);
        this.hitboxDia6.setInteractive({ cursor: 'pointer' });

        this.hitboxDia7 = this.add.zone(370, 632, 90, 90);
        this.hitboxDia7.setDepth(30);
        this.hitboxDia7.setInteractive({ cursor: 'pointer' });

        this.configurarBotonDia(this.hitboxDia1, this.dia1, 1);
        this.configurarBotonDia(this.hitboxDia2, this.dia2, 2);
        this.configurarBotonDia(this.hitboxDia3, this.dia3, 3);
        this.configurarBotonDia(this.hitboxDia4, this.dia4, 4);
        this.configurarBotonDia(this.hitboxDia5, this.dia5, 5);
        this.configurarBotonDia(this.hitboxDia6, this.dia6, 6);
        this.configurarBotonDia(this.hitboxDia7, this.dia7, 7);
    }

    configurarBotonDia(hitbox, spriteDia, numeroDia) {
        hitbox.on('pointerover', () => {
            if (this.modalAbierto) return;
            if (numeroDia !== this.diaActual) return;
            this.tweens.killTweensOf(spriteDia);
            this.tweens.add({
                targets: spriteDia,
                scale: 0.115,
                duration: 120
            });
        });

        hitbox.on('pointerout', () => {
            if (numeroDia !== this.diaActual) return;
            this.tweens.killTweensOf(spriteDia);
            this.tweens.add({
                targets: spriteDia,
                scale: 0.10,
                duration: 120
            });
        });

        hitbox.on('pointerdown', () => {
            if (this.modalAbierto) return;
            if (numeroDia !== this.diaActual) return;
            this.reproducirClick();
            this.abrirModalDia(numeroDia);
        });
    }

    actualizarEstadoDias() {
        const dias = [
            { numero: 1, sprite: this.dia1, zone: this.hitboxDia1 },
            { numero: 2, sprite: this.dia2, zone: this.hitboxDia2 },
            { numero: 3, sprite: this.dia3, zone: this.hitboxDia3 },
            { numero: 4, sprite: this.dia4, zone: this.hitboxDia4 },
            { numero: 5, sprite: this.dia5, zone: this.hitboxDia5 },
            { numero: 6, sprite: this.dia6, zone: this.hitboxDia6 },
            { numero: 7, sprite: this.dia7, zone: this.hitboxDia7 }
        ];

        dias.forEach(dia => {
            dia.sprite.setScale(0.10);

            if (dia.numero === this.diaActual) {
                dia.sprite.clearTint();
                dia.sprite.setAlpha(1);

                if (!this.modalAbierto) {
                    dia.zone.setInteractive({ cursor: 'pointer' });
                }
            } else {
                dia.sprite.setTint(0x666666);
                dia.sprite.setAlpha(0.35);
                dia.zone.disableInteractive();
            }
        });
    }
    crearIndicadorVidas() {
        this.panelVidas = this.add.rectangle(860, 42, 270, 54, 0x091427, 0.92);
        this.panelVidas.setDepth(60);
        this.panelVidas.setStrokeStyle(2, 0x78a7ff, 1);

        this.vidasLabel = this.add.text(785, 42, 'VIDAS', {
            fontFamily: '"VT323", monospace',
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#09111f',
            strokeThickness: 3
        });
        this.vidasLabel.setOrigin(0.5);
        this.vidasLabel.setDepth(61);

        this.barrasVidas = [];

        const startX = 850;
        const startY = 42;
        const anchoSegmento = 28;
        const altoSegmento = 22;
        const separacion = 34;

        for (let i = 0; i < 4; i++) {
            const fondo = this.add.rectangle(
                startX + i * separacion,
                startY,
                anchoSegmento,
                altoSegmento,
                0x1a2945,
                1
            );
            fondo.setDepth(61);
            fondo.setStrokeStyle(1, 0xa9c8ff, 0.9);

            const barra = this.add.rectangle(
                startX + i * separacion,
                startY,
                anchoSegmento - 4,
                altoSegmento - 4,
                0x8bff9a,
                1
            );
            barra.setDepth(62);

            this.barrasVidas.push({ fondo, barra });
        }

        this.actualizarIndicadorVidas(false);
    }

    actualizarIndicadorVidas(animarPerdida = false) {
        if (!this.barrasVidas) return;

        this.barrasVidas.forEach((item, index) => {
            const activa = index < this.vidasDiaActual;

            if (activa) {
                item.barra.setVisible(true);
                item.barra.setAlpha(1);
                item.barra.setScale(1);
                item.barra.setFillStyle(0x8bff9a, 1);
            } else {
                item.barra.setVisible(false);
            }
        });

        if (animarPerdida) {
            const indicePerdido = this.vidasDiaActual;
            const item = this.barrasVidas[indicePerdido];

            if (item) {
                item.barra.setVisible(true);
                item.barra.setFillStyle(0xff6363, 1);
                item.barra.setAlpha(1);
                item.barra.setScale(1);

                this.tweens.add({
                    targets: item.barra,
                    scaleX: 1.35,
                    scaleY: 1.35,
                    alpha: 0,
                    angle: 8,
                    duration: 260,
                    ease: 'Back.easeIn',
                    onComplete: () => {
                        item.barra.setVisible(false);
                        item.barra.setAlpha(1);
                        item.barra.setScale(1);
                        item.barra.angle = 0;
                    }
                });
            }

            if (this.panelVidas) {
                this.tweens.add({
                    targets: this.panelVidas,
                    alpha: 0.65,
                    duration: 90,
                    yoyo: true,
                    repeat: 1
                });
            }
        }
    }
    registrarErrorDia() {
        if (this.vidasDiaActual > 0) {
            this.vidasDiaActual -= 1;
        }

        this.penalizacionDia += 10;
        this.actualizarIndicadorVidas(true);

        if (this.vidasDiaActual <= 0) {
            this.time.delayedCall(420, () => {
                this.irAGameOver();
            });
        }
    }
    irAGameOver() {
        if (this.yaTransicionando) return;
        this.yaTransicionando = true;

        this.desactivarInteractivosPrincipales();

        this.fadeOutMusica(() => {
            this.cameras.main.fadeOut(450, 0, 0, 0);

            this.time.delayedCall(450, () => {
                this.scene.start('GameOver');
            });
        });
    }

    // ─────────────────────────────────────────────────────────
    // Volumen
    // ─────────────────────────────────────────────────────────
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

        if (this.pointerMoveVolHandler) {
            this.input.off('pointermove', this.pointerMoveVolHandler);
        }

        if (this.pointerUpVolHandler) {
            this.input.off('pointerup', this.pointerUpVolHandler);
        }

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

        if (this.sonidoVentana) {
            this.sonidoVentana.setVolume(this.volumenActual);
        }

        this.sliderFill.displayWidth = Math.max(4, this.sliderWidth * this.volumenActual);
        this.sliderGlow.displayWidth = Math.max(4, this.sliderWidth * this.volumenActual);
        this.sliderKnob.x = izquierda + this.sliderWidth * this.volumenActual;
    }


    crearVistaDia6ABB() {
        this.elementosDia6 = [];
        this.framesDia6 = [];
        this.indiceFrameDia6 = 0;

        this.scrollResumenOffsetDia6 = 0;
        this.scrollResumenMaxDia6 = 0;
        this.scrollResumenDraggingDia6 = false;
        this.scrollResumenDragOffsetDia6 = 0;

        this.areaArbolDia6 = {
            x: 430,
            y: 210,
            width: 830,
            height: 410
        };

        const panelIzq = this.add.rectangle(185, 438, 270, 540, 0x08111f, 0.90);
        panelIzq.setStrokeStyle(2, 0x78a7ff, 1);
        panelIzq.setDepth(10);

        const panelDer = this.add.rectangle(835, 438, 940, 540, 0x08111f, 0.76);
        panelDer.setStrokeStyle(2, 0x78a7ff, 1);
        panelDer.setDepth(10);

        const titulo = this.add.text(640, 52, 'Día 6 - Árbol AVL por gravedad', {
            fontFamily: '"VT323", monospace',
            fontSize: '38px',
            color: '#ffffff',
            stroke: '#09111f',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(20);

        const subtitulo = this.add.text(
            640,
            95,
            'Se agregan uno por uno los delitos marcados en los días 1 al 5.\nEl árbol se reorganiza visualmente para mantenerse balanceado.',
            {
                fontFamily: '"VT323", monospace',
                fontSize: '22px',
                color: '#dce8ff',
                align: 'center',
                lineSpacing: 4
            }
        ).setOrigin(0.5).setDepth(20);

        const tituloResumen = this.add.text(185, 148, 'Delitos insertados', {
            fontFamily: '"VT323", monospace',
            fontSize: '30px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(20);

        this.textoPasoDia6 = this.add.text(185, 190, 'Preparando animación...', {
            fontFamily: '"VT323", monospace',
            fontSize: '24px',
            color: '#9fd0ff',
            align: 'center',
            wordWrap: { width: 220 }
        }).setOrigin(0.5, 0).setDepth(20);

        this.crearScrollResumenDia6();

        this.graficoDia6Container = this.add.container(0, 0);
        this.graficoDia6Container.setDepth(25);

        this.btnContinuarDia6Bg = this.add.rectangle(1095, 650, 190, 52, 0x345b2c, 1);
        this.btnContinuarDia6Bg.setStrokeStyle(2, 0xa6e18f, 1);
        this.btnContinuarDia6Bg.setDepth(30);
        this.btnContinuarDia6Bg.setVisible(false);

        this.btnContinuarDia6Txt = this.add.text(1095, 650, 'Continuar', {
            fontFamily: '"VT323", monospace',
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(31).setVisible(false);

        this.btnContinuarDia6Zone = this.add.zone(1095, 650, 190, 52)
            .setDepth(32)
            .setVisible(false);

        this.btnContinuarDia6Zone.on('pointerover', () => {
            if (!this.btnContinuarDia6Bg.visible) return;
            this.btnContinuarDia6Bg.setFillStyle(0x44753a, 1);
        });

        this.btnContinuarDia6Zone.on('pointerout', () => {
            if (!this.btnContinuarDia6Bg.visible) return;
            this.btnContinuarDia6Bg.setFillStyle(0x345b2c, 1);
        });

        this.btnContinuarDia6Zone.on('pointerdown', () => {
            if (this.yaTransicionando) return;
            this.reproducirClick();
            this.continuarADia7DesdeDia6();
        });

        this.elementosDia6.push(
            panelIzq,
            panelDer,
            titulo,
            subtitulo,
            tituloResumen,
            this.textoPasoDia6,
            this.graficoDia6Container,
            this.btnContinuarDia6Bg,
            this.btnContinuarDia6Txt,
            this.btnContinuarDia6Zone
        );

        this.iniciarAnimacionDia6ABB();
    }

    crearScrollResumenDia6() {
        this.resumenViewportDia6 = {
            x: 62,
            y: 255,
            width: 198,
            height: 405
        };

        this.resumenContainerDia6 = this.add.container(
            this.resumenViewportDia6.x,
            this.resumenViewportDia6.y
        );
        this.resumenContainerDia6.setDepth(22);

        this.resumenTextoDia6 = this.add.text(0, 0, '', {
            fontFamily: '"VT323", monospace',
            fontSize: '20px',
            color: '#edf5ff',
            lineSpacing: 8,
            wordWrap: { width: 188 }
        });

        this.resumenContainerDia6.add(this.resumenTextoDia6);

        this.resumenMaskGraphicsDia6 = this.make.graphics({ x: 0, y: 0, add: false });
        this.resumenMaskGraphicsDia6.fillStyle(0xffffff, 1);
        this.resumenMaskGraphicsDia6.fillRect(
            this.resumenViewportDia6.x,
            this.resumenViewportDia6.y,
            this.resumenViewportDia6.width,
            this.resumenViewportDia6.height
        );

        this.resumenMaskDia6 = this.resumenMaskGraphicsDia6.createGeometryMask();
        this.resumenContainerDia6.setMask(this.resumenMaskDia6);

        this.scrollTrackDia6 = this.add.rectangle(
            this.resumenViewportDia6.x + this.resumenViewportDia6.width + 18,
            this.resumenViewportDia6.y + this.resumenViewportDia6.height / 2,
            8,
            this.resumenViewportDia6.height,
            0x1d345f,
            1
        );
        this.scrollTrackDia6.setDepth(22);
        this.scrollTrackDia6.setStrokeStyle(1, 0x7ea8ff, 1);

        this.scrollKnobDia6 = this.add.rectangle(
            this.resumenViewportDia6.x + this.resumenViewportDia6.width + 18,
            this.resumenViewportDia6.y + 30,
            14,
            88,
            0xdce8ff,
            1
        );
        this.scrollKnobDia6.setDepth(23);
        this.scrollKnobDia6.setStrokeStyle(2, 0xffffff, 1);
        this.scrollKnobDia6.setInteractive({ cursor: 'pointer' });

        this.scrollZoneDia6 = this.add.zone(
            this.resumenViewportDia6.x + this.resumenViewportDia6.width + 18,
            this.resumenViewportDia6.y + this.resumenViewportDia6.height / 2,
            24,
            this.resumenViewportDia6.height
        );
        this.scrollZoneDia6.setDepth(24);
        this.scrollZoneDia6.setInteractive({ cursor: 'pointer' });

        this.scrollKnobDia6.on('pointerdown', (pointer) => {
            this.scrollResumenDraggingDia6 = true;
            this.scrollResumenDragOffsetDia6 = pointer.y - this.scrollKnobDia6.y;
        });

        this.scrollZoneDia6.on('pointerdown', (pointer) => {
            if (this.scrollResumenMaxDia6 <= 0) return;

            const minY = this.resumenViewportDia6.y + this.scrollKnobDia6.height / 2;
            const maxY = this.resumenViewportDia6.y + this.resumenViewportDia6.height - this.scrollKnobDia6.height / 2;

            const yClamped = Phaser.Math.Clamp(pointer.y, minY, maxY);
            const ratio = (yClamped - minY) / Math.max(1, (maxY - minY));

            this.moverScrollResumenDia6(ratio * this.scrollResumenMaxDia6);
        });

        this.scrollResumenPointerMoveHandlerDia6 = (pointer) => {
            if (!this.scrollResumenDraggingDia6) return;
            if (this.scrollResumenMaxDia6 <= 0) return;

            const minY = this.resumenViewportDia6.y + this.scrollKnobDia6.height / 2;
            const maxY = this.resumenViewportDia6.y + this.resumenViewportDia6.height - this.scrollKnobDia6.height / 2;

            const yClamped = Phaser.Math.Clamp(
                pointer.y - this.scrollResumenDragOffsetDia6,
                minY,
                maxY
            );

            const ratio = (yClamped - minY) / Math.max(1, (maxY - minY));
            this.moverScrollResumenDia6(ratio * this.scrollResumenMaxDia6);
        };

        this.scrollResumenPointerUpHandlerDia6 = () => {
            this.scrollResumenDraggingDia6 = false;
        };

        this.scrollResumenWheelHandlerDia6 = (pointer, gameObjects, deltaX, deltaY) => {
            const dentroX =
                pointer.x >= this.resumenViewportDia6.x &&
                pointer.x <= this.resumenViewportDia6.x + this.resumenViewportDia6.width + 30;

            const dentroY =
                pointer.y >= this.resumenViewportDia6.y &&
                pointer.y <= this.resumenViewportDia6.y + this.resumenViewportDia6.height;

            if (!dentroX || !dentroY) return;
            if (this.scrollResumenMaxDia6 <= 0) return;

            this.moverScrollResumenDia6(this.scrollResumenOffsetDia6 + deltaY * 0.95);
        };

        this.input.on('pointermove', this.scrollResumenPointerMoveHandlerDia6);
        this.input.on('pointerup', this.scrollResumenPointerUpHandlerDia6);
        this.input.on('wheel', this.scrollResumenWheelHandlerDia6);

        this.elementosDia6.push(
            this.resumenContainerDia6,
            this.scrollTrackDia6,
            this.scrollKnobDia6,
            this.scrollZoneDia6
        );
    }

    actualizarTextoScrollResumenDia6(texto) {
        if (!this.resumenTextoDia6) return;

        this.resumenTextoDia6.setText(texto);

        const contentHeight = this.resumenTextoDia6.height + 12;
        this.scrollResumenMaxDia6 = Math.max(
            0,
            contentHeight - this.resumenViewportDia6.height
        );

        if (this.scrollResumenMaxDia6 <= 0) {
            this.scrollResumenOffsetDia6 = 0;
            this.resumenContainerDia6.y = this.resumenViewportDia6.y;

            this.scrollKnobDia6.height = 88;
            this.scrollKnobDia6.y = this.resumenViewportDia6.y + this.scrollKnobDia6.height / 2;
            this.scrollKnobDia6.setAlpha(0.35);
            this.scrollTrackDia6.setAlpha(0.35);
            return;
        }

        this.scrollKnobDia6.setAlpha(1);
        this.scrollTrackDia6.setAlpha(1);

        const ratioVisible = this.resumenViewportDia6.height / contentHeight;
        this.scrollKnobDia6.height = Phaser.Math.Clamp(
            this.resumenViewportDia6.height * ratioVisible,
            55,
            this.resumenViewportDia6.height
        );

        this.moverScrollResumenDia6(this.scrollResumenOffsetDia6);
    }

    moverScrollResumenDia6(nuevoOffset) {
        this.scrollResumenOffsetDia6 = Phaser.Math.Clamp(
            nuevoOffset,
            0,
            this.scrollResumenMaxDia6
        );

        this.resumenContainerDia6.y = this.resumenViewportDia6.y - this.scrollResumenOffsetDia6;

        if (this.scrollResumenMaxDia6 <= 0) {
            this.scrollKnobDia6.y = this.resumenViewportDia6.y + this.scrollKnobDia6.height / 2;
            return;
        }

        const minY = this.resumenViewportDia6.y + this.scrollKnobDia6.height / 2;
        const maxY = this.resumenViewportDia6.y + this.resumenViewportDia6.height - this.scrollKnobDia6.height / 2;
        const ratio = this.scrollResumenOffsetDia6 / this.scrollResumenMaxDia6;

        this.scrollKnobDia6.y = Phaser.Math.Linear(minY, maxY, ratio);
    }

    iniciarAnimacionDia6ABB() {
        const porDia = this.obtenerDelitosMarcadosPorDiaParaDia6();

        this.framesDia6 = [];
        this.indiceFrameDia6 = 0;

        let arbolTrabajo = null;
        let insertadosTrabajo = [];

        for (let dia = 1; dia <= 5; dia++) {
            const lista = porDia[dia] || [];
            if (!lista.length) continue;

            this.framesDia6.push({
                tipo: 'titulo',
                mensaje: `Día ${dia}`,
                arbol: this.clonarArbolDia6(arbolTrabajo),
                insertados: [...insertadosTrabajo],
                highlightIds: []
            });

            lista.forEach((pj) => {
                this.framesDia6.push({
                    tipo: 'previo',
                    mensaje: `Día ${dia}\nEntrando: ${pj.nombre}`,
                    arbol: this.clonarArbolDia6(arbolTrabajo),
                    insertados: [...insertadosTrabajo],
                    highlightIds: []
                });

                arbolTrabajo = this.insertarAVLDia6(arbolTrabajo, pj);
                insertadosTrabajo = [...insertadosTrabajo, pj];

                this.framesDia6.push({
                    tipo: 'insertado',
                    mensaje: `Día ${dia}\n${pj.nombre} agregado`,
                    arbol: this.clonarArbolDia6(arbolTrabajo),
                    insertados: [...insertadosTrabajo],
                    highlightIds: [this._obtenerIdPersonaje(pj)]
                });
            });
        }

        if (!this.framesDia6.length) {
            this.textoPasoDia6.setText('No hay delitos marcados para construir el árbol.');
            this.actualizarTextoScrollResumenDia6('No se encontraron delitos marcados del día 1 al 5.');
            this.mostrarBotonContinuarDia6();
            return;
        }

        this.time.delayedCall(700, () => {
            this.ejecutarPasoAnimacionDia6();
        });
    }

    ejecutarPasoAnimacionDia6() {
        if (this.indiceFrameDia6 >= this.framesDia6.length) {
            this.textoPasoDia6.setText('Árbol AVL completado.');
            this.mostrarBotonContinuarDia6();
            return;
        }

        const frame = this.framesDia6[this.indiceFrameDia6];
        this.indiceFrameDia6++;

        this.textoPasoDia6.setText(frame.mensaje || '');
        this.actualizarTextoScrollResumenDia6(
            this.generarTextoResumenDia6(frame.insertados || [])
        );

        this.redibujarArbolDia6(frame.arbol, frame.highlightIds || []);

        let delay = 900;
        if (frame.tipo === 'titulo') delay = 900;
        if (frame.tipo === 'previo') delay = 650;
        if (frame.tipo === 'insertado') delay = 1100;

        this.time.delayedCall(delay, () => {
            this.ejecutarPasoAnimacionDia6();
        });
    }

    obtenerDelitosMarcadosPorDiaParaDia6() {
        const resultado = { 1: [], 2: [], 3: [], 4: [], 5: [] };

        for (let dia = 1; dia <= 5; dia++) {
            const lista = Dias[dia] || [];
            lista.forEach((pj) => {
                const id = this._obtenerIdPersonaje(pj);
                const decision = this.estadoBuscadorPorDia[dia]?.[id] || null;
                if (decision === 'delito') {
                    resultado[dia].push(pj);
                }
            });
        }

        return resultado;
    }

    obtenerNombreSancionSeguro(pj) {
        if (!pj || !pj.sancion || pj.sancion === 'NO TIENE') {
            return 'Sin sanción';
        }
        if (typeof pj.sancion === 'string') {
            return pj.sancion;
        }
        return pj.sancion.nombre || 'Sin sanción';
    }

    obtenerPesoGravedadDia6(pj) {
        const pesosUnicos = {
            Sara: 100, Sofia: 99, Ronald: 98,
            Zoe: 95, Violeta: 94, Valen: 93, Tyler: 92, Tomas: 91,
            Rosa: 90, Ruben: 89,
            Mia: 80, Nora: 79, Nico: 78, Luisa: 77, Leo: 76,
            Oscar: 75, Lina: 74,
            Paula: 70, Luis: 69, Lucas: 68,
            Eva: 60,
            Fabio: 55, Irene: 54,
            Isabel: 50, Isacc: 49,
            Camilo: 40,
            Cora: 35, Clara: 34,
            Diego: 30, Dani: 29,
            Abril: 20,
            Allison: 15, Adam: 14,
            Alma: 10, Ana: 9
        };
        return pesosUnicos[pj.nombre] ?? 1;
    }

    compararPersonajesAVLDia6(a, b) {
        const ga = this.obtenerPesoGravedadDia6(a);
        const gb = this.obtenerPesoGravedadDia6(b);
        if (ga !== gb) return ga - gb;
        return (a.nombre || '').localeCompare(b.nombre || '', 'es');
    }

    crearNodoAVLDia6(pj) {
        return {
            personaje: pj,
            izq: null,
            der: null,
            h: 1,
            x: 0,
            y: 0,
            relX: 0,
            depth: 0
        };
    }

    alturaNodoAVLDia6(nodo) {
        return nodo ? nodo.h : 0;
    }

    actualizarAlturaNodoAVLDia6(nodo) {
        if (!nodo) return;
        nodo.h = 1 + Math.max(
            this.alturaNodoAVLDia6(nodo.izq),
            this.alturaNodoAVLDia6(nodo.der)
        );
    }

    balanceNodoAVLDia6(nodo) {
        if (!nodo) return 0;
        return this.alturaNodoAVLDia6(nodo.izq) - this.alturaNodoAVLDia6(nodo.der);
    }

    rotacionDerechaDia6(y) {
        const x = y.izq;
        const t2 = x.der;
        x.der = y;
        y.izq = t2;
        this.actualizarAlturaNodoAVLDia6(y);
        this.actualizarAlturaNodoAVLDia6(x);
        return x;
    }

    rotacionIzquierdaDia6(x) {
        const y = x.der;
        const t2 = y.izq;
        y.izq = x;
        x.der = t2;
        this.actualizarAlturaNodoAVLDia6(x);
        this.actualizarAlturaNodoAVLDia6(y);
        return y;
    }

    insertarAVLDia6(raiz, pj) {
        return this._insertarAVLRecDia6(raiz, pj);
    }

    _insertarAVLRecDia6(nodo, pj) {
        if (!nodo) {
            return this.crearNodoAVLDia6(pj);
        }

        const cmp = this.compararPersonajesAVLDia6(pj, nodo.personaje);

        if (cmp < 0) {
            nodo.izq = this._insertarAVLRecDia6(nodo.izq, pj);
        } else {
            nodo.der = this._insertarAVLRecDia6(nodo.der, pj);
        }

        this.actualizarAlturaNodoAVLDia6(nodo);

        const balance = this.balanceNodoAVLDia6(nodo);

        if (balance > 1 && this.compararPersonajesAVLDia6(pj, nodo.izq.personaje) < 0)
            return this.rotacionDerechaDia6(nodo);

        if (balance < -1 && this.compararPersonajesAVLDia6(pj, nodo.der.personaje) > 0)
            return this.rotacionIzquierdaDia6(nodo);

        if (balance > 1 && this.compararPersonajesAVLDia6(pj, nodo.izq.personaje) > 0) {
            nodo.izq = this.rotacionIzquierdaDia6(nodo.izq);
            return this.rotacionDerechaDia6(nodo);
        }

        if (balance < -1 && this.compararPersonajesAVLDia6(pj, nodo.der.personaje) < 0) {
            nodo.der = this.rotacionDerechaDia6(nodo.der);
            return this.rotacionIzquierdaDia6(nodo);
        }

        return nodo;
    }

    clonarArbolDia6(nodo) {
        if (!nodo) return null;
        return {
            personaje: nodo.personaje,
            h: nodo.h,
            izq: this.clonarArbolDia6(nodo.izq),
            der: this.clonarArbolDia6(nodo.der),
            x: nodo.x || 0,
            y: nodo.y || 0,
            relX: nodo.relX || 0,
            depth: nodo.depth || 0
        };
    }

    redibujarArbolDia6(arbol, highlightIds = []) {
        if (!this.graficoDia6Container) return;

        // Destruir graphics anterior antes de limpiar el contenedor
        if (this._graphicsDia6) {
            this._graphicsDia6.destroy();
            this._graphicsDia6 = null;
        }

        this.graficoDia6Container.removeAll(true);
        if (!arbol) return;

        this._inorderCountDia6 = 0;

        const total = this.contarNodosDia6(arbol);
        const maxDepth = this.obtenerProfundidadMaximaDia6(arbol);
        const radioBase = this.obtenerRadioNodoDia6(0, total);

        // Paso 1: asignar índice inorden y profundidad a cada nodo
        this._asignarLayoutRelativoDia6(arbol, 0);

        // Paso 2: calcular rango real para escalar
        const { minX, maxX } = this._obtenerRangoXDia6(arbol);
        const spanX = Math.max(1, maxX - minX);
        const spanY = Math.max(1, maxDepth - 1);

        const padH = radioBase * 2.2;
        const padV = radioBase * 2.8;
        const anchoDisponible = this.areaArbolDia6.width - padH * 2;
        const altoDisponible = this.areaArbolDia6.height - padV * 2;

        const escalaX = anchoDisponible / spanX;
        const escalaY = spanY > 0
            ? Math.min(altoDisponible / spanY, radioBase * 3.8)
            : radioBase * 3;

        // Paso 3: convertir índices relativos a coordenadas absolutas
        this._escalarPosicionesDia6(
            arbol,
            this.areaArbolDia6.x + padH - minX * escalaX,
            this.areaArbolDia6.y + padV,
            escalaX,
            escalaY
        );

        // Paso 4: dibujar
        this.dibujarConexionesArbolDia6(arbol, total);
        this.dibujarNodosArbolDia6(arbol, highlightIds, total);
    }

    // Reemplaza estos 3 métodos en tu código:

    _asignarLayoutRelativoDia6(nodo, depth) {
        if (!nodo) return;
        this._asignarLayoutRelativoDia6(nodo.izq, depth + 1);
        nodo.depth = depth;
        nodo.relX = this._inorderCountDia6++;
        this._asignarLayoutRelativoDia6(nodo.der, depth + 1);

        const minLeaf = this._leftmostDia6(nodo);
        const maxLeaf = this._rightmostDia6(nodo);
        nodo.relX = (minLeaf + maxLeaf) / 2;
    }

    _leftmostDia6(nodo) {
        if (!nodo) return Infinity;
        if (!nodo.izq && !nodo.der) return nodo.relX;
        return Math.min(
            this._leftmostDia6(nodo.izq),
            this._leftmostDia6(nodo.der),
            nodo.relX
        );
    }

    _rightmostDia6(nodo) {
        if (!nodo) return -Infinity;
        if (!nodo.izq && !nodo.der) return nodo.relX;
        return Math.max(
            this._rightmostDia6(nodo.izq),
            this._rightmostDia6(nodo.der),
            nodo.relX
        );
    }

    _obtenerRangoXDia6(nodo, rango = { minX: Infinity, maxX: -Infinity }) {
        if (!nodo) return rango;
        rango.minX = Math.min(rango.minX, nodo.relX);
        rango.maxX = Math.max(rango.maxX, nodo.relX);
        this._obtenerRangoXDia6(nodo.izq, rango);
        this._obtenerRangoXDia6(nodo.der, rango);
        return rango;
    }

    _escalarPosicionesDia6(nodo, baseX, baseY, escX, escY) {
        if (!nodo) return;
        nodo.x = Math.floor(baseX + nodo.relX * escX);
        nodo.y = Math.floor(baseY + nodo.depth * escY);
        this._escalarPosicionesDia6(nodo.izq, baseX, baseY, escX, escY);
        this._escalarPosicionesDia6(nodo.der, baseX, baseY, escX, escY);
    }
    // ── FIN LAYOUT CORREGIDO ──────────────────────────────────

    obtenerProfundidadMaximaDia6(nodo) {
        if (!nodo) return 0;
        return 1 + Math.max(
            this.obtenerProfundidadMaximaDia6(nodo.izq),
            this.obtenerProfundidadMaximaDia6(nodo.der)
        );
    }

    contarNodosDia6(nodo) {
        if (!nodo) return 0;
        return 1 + this.contarNodosDia6(nodo.izq) + this.contarNodosDia6(nodo.der);
    }

    obtenerRadioNodoDia6(depth, total) {
        let radio = 18;
        if (total >= 18) radio = 14;
        else if (total >= 14) radio = 15;
        else if (total >= 10) radio = 16;
        if (depth === 0) radio += 3;
        return Math.max(12, radio);
    }

    dibujarConexionesArbolDia6(nodo, total) {
        if (!nodo) return;

        // Crear un único objeto Graphics para TODAS las conexiones
        // Solo se crea en la raíz (cuando el contenedor está vacío al inicio)
        if (!this._graphicsDia6) {
            this._graphicsDia6 = this.add.graphics();
            this._graphicsDia6.setDepth(24);
            this.graficoDia6Container.add(this._graphicsDia6);
        }

        const g = this._graphicsDia6;

        const dibujarConexion = (padre, hijo) => {
            if (!hijo) return;

            const radioPadre = this.obtenerRadioNodoDia6(padre.depth, total);
            const radioHijo = this.obtenerRadioNodoDia6(hijo.depth, total);

            const dx = hijo.x - padre.x;
            const dy = hijo.y - padre.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 1) return;

            const ux = dx / dist;
            const uy = dy / dist;

            const startX = padre.x + ux * radioPadre;
            const startY = padre.y + uy * radioPadre;
            const endX = hijo.x - ux * radioHijo;
            const endY = hijo.y - uy * radioHijo;

            g.lineStyle(4, 0xeef4ff, 1);
            g.beginPath();
            g.moveTo(startX, startY);
            g.lineTo(endX, endY);
            g.strokePath();

            // Caps en los extremos
            g.fillStyle(0xeef4ff, 1);
            g.fillCircle(startX, startY, 2.5);
            g.fillCircle(endX, endY, 2.5);
        };

        dibujarConexion(nodo, nodo.izq);
        dibujarConexion(nodo, nodo.der);

        this.dibujarConexionesArbolDia6(nodo.izq, total);
        this.dibujarConexionesArbolDia6(nodo.der, total);
    }

    dibujarNodosArbolDia6(nodo, highlightIds = [], total = 0) {
        if (!nodo) return;

        this.dibujarNodosArbolDia6(nodo.izq, highlightIds, total);
        this.dibujarNodosArbolDia6(nodo.der, highlightIds, total);

        const pj = nodo.personaje;
        const id = this._obtenerIdPersonaje(pj);
        const esRoot = nodo.depth === 0;
        const resaltado = highlightIds.includes(id);

        const radio = this.obtenerRadioNodoDia6(nodo.depth, total);
        const colorBorde = this.obtenerColorNodoDia6(pj.dia);
        const gravedad = this.obtenerPesoGravedadDia6(pj);

        const fondo = this.add.circle(nodo.x, nodo.y, radio, 0x10203f, 0.98);
        fondo.setStrokeStyle(
            esRoot ? 4 : (resaltado ? 4 : 2),
            esRoot ? 0xffd46f : colorBorde,
            1
        );

        const nombre = this.add.text(nodo.x, nodo.y - 7, pj.nombre, {
            fontFamily: '"VT323", monospace',
            fontSize: `${Math.max(13, Math.floor(radio * 0.70))}px`,
            color: '#ffffff',
            stroke: '#09111f',
            strokeThickness: 3
        }).setOrigin(0.5);

        const meta = this.add.text(nodo.x, nodo.y + 8, `${gravedad}`, {
            fontFamily: '"VT323", monospace',
            fontSize: `${Math.max(12, Math.floor(radio * 0.55))}px`,
            color: '#dce8ff'
        }).setOrigin(0.5);

        const tagRaiz = esRoot
            ? this.add.text(nodo.x, nodo.y - radio - 16, 'RAÍZ', {
                fontFamily: '"VT323", monospace',
                fontSize: '18px',
                color: '#ffe08a',
                stroke: '#09111f',
                strokeThickness: 3
            }).setOrigin(0.5)
            : null;

        const marca = resaltado
            ? this.add.circle(nodo.x + radio - 5, nodo.y - radio + 5, 6, 0xffef95, 1)
            : null;

        const elementos = [fondo, nombre, meta];
        if (tagRaiz) elementos.push(tagRaiz);
        if (marca) elementos.push(marca);

        this.graficoDia6Container.add(elementos);

        if (resaltado) {
            this.tweens.add({
                targets: fondo,
                scaleX: 1.08,
                scaleY: 1.08,
                duration: 180,
                yoyo: true
            });
        }
    }

    obtenerColorNodoDia6(dia) {
        if (dia === 1) return 0x5d80ff;
        if (dia === 2) return 0x6cbc54;
        if (dia === 3) return 0xd2a047;
        if (dia === 4) return 0xa56bff;
        if (dia === 5) return 0xff7b6e;
        return 0x7ea8ff;
    }

    generarTextoResumenDia6(insertados) {
        const grupos = { 1: [], 2: [], 3: [], 4: [], 5: [] };

        (insertados || []).forEach((pj) => {
            grupos[pj.dia].push(`• ${pj.nombre} (${this.obtenerPesoGravedadDia6(pj)})`);
        });

        return [
            'Insertados por día', '',
            'Día 1:', grupos[1].length ? grupos[1].join('\n') : '—', '',
            'Día 2:', grupos[2].length ? grupos[2].join('\n') : '—', '',
            'Día 3:', grupos[3].length ? grupos[3].join('\n') : '—', '',
            'Día 4:', grupos[4].length ? grupos[4].join('\n') : '—', '',
            'Día 5:', grupos[5].length ? grupos[5].join('\n') : '—'
        ].join('\n');
    }

    mostrarBotonContinuarDia6() {
        this.btnContinuarDia6Bg.setVisible(true);
        this.btnContinuarDia6Txt.setVisible(true);
        this.btnContinuarDia6Zone.setVisible(true);
        this.btnContinuarDia6Zone.setInteractive({ cursor: 'pointer' });
    }

    // ─────────────────────────────────────────────────────────
    // DÍA 7 — SELECCIÓN FINAL DESDE LAS HOJAS HASTA QUEDAR 5
    // ─────────────────────────────────────────────────────────
    crearVistaDia7Seleccion() {
        this.elementosDia7 = [];
        this.candidatosDia7Elems = [];
        this.historialDia7 = [];
        this.culpablesFinalesDia7 = [];
        this.seleccionActualDia7 = null;
        this.candidatosNivelDia7 = [];
        this.nivelObjetivoDia7 = null;
        this.autoConservadosDia7 = [];

        this.areaArbolDia6 = {
            x: 380,
            y: 175,
            width: 880,
            height: 310
        };

        const panelIzq = this.add.rectangle(185, 420, 270, 500, 0x08111f, 0.90);
        panelIzq.setStrokeStyle(2, 0x78a7ff, 1);
        panelIzq.setDepth(10);

        const panelArbol = this.add.rectangle(820, 330, 930, 320, 0x08111f, 0.76);
        panelArbol.setStrokeStyle(2, 0x78a7ff, 1);
        panelArbol.setDepth(10);

        const panelSeleccion = this.add.rectangle(820, 590, 930, 195, 0x08111f, 0.78);
        panelSeleccion.setStrokeStyle(2, 0x78a7ff, 1);
        panelSeleccion.setDepth(10);

        const titulo = this.add.text(640, 50, 'Día 7 - Selección final de culpables', {
            fontFamily: '"VT323", monospace',
            fontSize: '36px',
            color: '#ffffff',
            stroke: '#09111f',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(20);

        const subtitulo = this.add.text(
            640,
            92,
            'Se revisan primero los niveles más profundos del árbol.\nEliges quién permanece y el árbol se reorganiza hasta quedar con 5 culpables.',
            {
                fontFamily: '"VT323", monospace',
                fontSize: '21px',
                color: '#dce8ff',
                align: 'center',
                lineSpacing: 4
            }
        ).setOrigin(0.5).setDepth(20);

        const tituloResumen = this.add.text(185, 150, 'Reporte del caso', {
            fontFamily: '"VT323", monospace',
            fontSize: '30px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(20);

        this.textoPasoDia7 = this.add.text(820, 500, 'Preparando selección...', {
            fontFamily: '"VT323", monospace',
            fontSize: '24px',
            color: '#9fd0ff',
            align: 'center',
            wordWrap: { width: 860 }
        }).setOrigin(0.5).setDepth(20);

        this.crearScrollResumenDia7();

        this.graficoDia6Container = this.add.container(0, 0);
        this.graficoDia6Container.setDepth(25);

        this.candidatosDia7Container = this.add.container(0, 0);
        this.candidatosDia7Container.setDepth(26);

        this.btnConfirmarDia7Bg = this.add.rectangle(1115, 665, 170, 44, 0x345b2c, 1);
        this.btnConfirmarDia7Bg.setStrokeStyle(2, 0xa6e18f, 1);
        this.btnConfirmarDia7Bg.setDepth(30);
        this.btnConfirmarDia7Bg.setVisible(false);

        this.btnConfirmarDia7Txt = this.add.text(1115, 665, 'Confirmar', {
            fontFamily: '"VT323", monospace',
            fontSize: '26px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(31).setVisible(false);

        this.btnConfirmarDia7Zone = this.add.zone(1115, 665, 170, 44)
            .setDepth(32)
            .setVisible(false);

        this.btnConfirmarDia7Zone.on('pointerover', () => {
            if (!this.btnConfirmarDia7Bg.visible) return;
            this.btnConfirmarDia7Bg.setFillStyle(0x44753a, 1);
        });

        this.btnConfirmarDia7Zone.on('pointerout', () => {
            if (!this.btnConfirmarDia7Bg.visible) return;
            this.btnConfirmarDia7Bg.setFillStyle(0x345b2c, 1);
        });

        this.btnConfirmarDia7Zone.on('pointerdown', () => {
            if (!this.btnConfirmarDia7Bg.visible) return;
            this.reproducirClick();
            this.aplicarSeleccionNivelDia7();
        });

        this.btnFinalDia7Bg = this.add.rectangle(1115, 665, 190, 48, 0x345b2c, 1);
        this.btnFinalDia7Bg.setStrokeStyle(2, 0xa6e18f, 1);
        this.btnFinalDia7Bg.setDepth(30);
        this.btnFinalDia7Bg.setVisible(false);

        this.btnFinalDia7Txt = this.add.text(1115, 665, 'Cerrar caso', {
            fontFamily: '"VT323", monospace',
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(31).setVisible(false);

        this.btnFinalDia7Zone = this.add.zone(1115, 665, 190, 48)
            .setDepth(32)
            .setVisible(false);

        this.btnFinalDia7Zone.on('pointerover', () => {
            if (!this.btnFinalDia7Bg.visible) return;
            this.btnFinalDia7Bg.setFillStyle(0x44753a, 1);
        });

        this.btnFinalDia7Zone.on('pointerout', () => {
            if (!this.btnFinalDia7Bg.visible) return;
            this.btnFinalDia7Bg.setFillStyle(0x345b2c, 1);
        });
        this.btnFinalDia7Zone.on('pointerdown', () => {
            if (!this.btnFinalDia7Bg.visible) return;
            this.reproducirClick();
            this.irAPantallaFinalCaso();
        });

        this.elementosDia7.push(
            panelIzq,
            panelArbol,
            panelSeleccion,
            titulo,
            subtitulo,
            tituloResumen,
            this.textoPasoDia7,
            this.graficoDia6Container,
            this.candidatosDia7Container,
            this.btnConfirmarDia7Bg,
            this.btnConfirmarDia7Txt,
            this.btnConfirmarDia7Zone,
            this.btnFinalDia7Bg,
            this.btnFinalDia7Txt,
            this.btnFinalDia7Zone
        );

        this.candidatosActivosDia7 = this.obtenerDelitosMarcadosTotalesDia7();
        this.actualizarEstadoDia7();
    }

    crearScrollResumenDia7() {
        this.resumenViewportDia7 = {
            x: 62,
            y: 190,
            width: 198,
            height: 420
        };

        this.resumenContainerDia7 = this.add.container(
            this.resumenViewportDia7.x,
            this.resumenViewportDia7.y
        );
        this.resumenContainerDia7.setDepth(22);

        this.resumenTextoDia7 = this.add.text(0, 0, '', {
            fontFamily: '"VT323", monospace',
            fontSize: '20px',
            color: '#edf5ff',
            lineSpacing: 8,
            wordWrap: { width: 188 }
        });

        this.resumenContainerDia7.add(this.resumenTextoDia7);

        this.resumenMaskGraphicsDia7 = this.make.graphics({ x: 0, y: 0, add: false });
        this.resumenMaskGraphicsDia7.fillStyle(0xffffff, 1);
        this.resumenMaskGraphicsDia7.fillRect(
            this.resumenViewportDia7.x,
            this.resumenViewportDia7.y,
            this.resumenViewportDia7.width,
            this.resumenViewportDia7.height
        );

        this.resumenMaskDia7 = this.resumenMaskGraphicsDia7.createGeometryMask();
        this.resumenContainerDia7.setMask(this.resumenMaskDia7);

        this.scrollTrackDia7 = this.add.rectangle(
            this.resumenViewportDia7.x + this.resumenViewportDia7.width + 18,
            this.resumenViewportDia7.y + this.resumenViewportDia7.height / 2,
            8,
            this.resumenViewportDia7.height,
            0x1d345f,
            1
        );
        this.scrollTrackDia7.setDepth(22);
        this.scrollTrackDia7.setStrokeStyle(1, 0x7ea8ff, 1);

        this.scrollKnobDia7 = this.add.rectangle(
            this.resumenViewportDia7.x + this.resumenViewportDia7.width + 18,
            this.resumenViewportDia7.y + 30,
            14,
            88,
            0xdce8ff,
            1
        );
        this.scrollKnobDia7.setDepth(23);
        this.scrollKnobDia7.setStrokeStyle(2, 0xffffff, 1);
        this.scrollKnobDia7.setInteractive({ cursor: 'pointer' });

        this.scrollZoneDia7 = this.add.zone(
            this.resumenViewportDia7.x + this.resumenViewportDia7.width + 18,
            this.resumenViewportDia7.y + this.resumenViewportDia7.height / 2,
            24,
            this.resumenViewportDia7.height
        );
        this.scrollZoneDia7.setDepth(24);
        this.scrollZoneDia7.setInteractive({ cursor: 'pointer' });

        this.scrollKnobDia7.on('pointerdown', (pointer) => {
            this.scrollResumenDraggingDia7 = true;
            this.scrollResumenDragOffsetDia7 = pointer.y - this.scrollKnobDia7.y;
        });

        this.scrollResumenPointerMoveHandlerDia7 = (pointer) => {
            if (!this.scrollResumenDraggingDia7) return;
            if (this.scrollResumenMaxDia7 <= 0) return;

            const minY = this.resumenViewportDia7.y + this.scrollKnobDia7.height / 2;
            const maxY = this.resumenViewportDia7.y + this.resumenViewportDia7.height - this.scrollKnobDia7.height / 2;

            const yClamped = Phaser.Math.Clamp(
                pointer.y - this.scrollResumenDragOffsetDia7,
                minY,
                maxY
            );

            const ratio = (yClamped - minY) / Math.max(1, (maxY - minY));
            this.moverScrollResumenDia7(ratio * this.scrollResumenMaxDia7);
        };

        this.scrollResumenPointerUpHandlerDia7 = () => {
            this.scrollResumenDraggingDia7 = false;
        };

        this.scrollResumenWheelHandlerDia7 = (pointer, gameObjects, deltaX, deltaY) => {
            const dentroX =
                pointer.x >= this.resumenViewportDia7.x &&
                pointer.x <= this.resumenViewportDia7.x + this.resumenViewportDia7.width + 30;

            const dentroY =
                pointer.y >= this.resumenViewportDia7.y &&
                pointer.y <= this.resumenViewportDia7.y + this.resumenViewportDia7.height;

            if (!dentroX || !dentroY) return;
            if (this.scrollResumenMaxDia7 <= 0) return;

            this.moverScrollResumenDia7(this.scrollResumenOffsetDia7 + deltaY * 0.95);
        };

        this.scrollZoneDia7.on('pointerdown', (pointer) => {
            if (this.scrollResumenMaxDia7 <= 0) return;

            const minY = this.resumenViewportDia7.y + this.scrollKnobDia7.height / 2;
            const maxY = this.resumenViewportDia7.y + this.resumenViewportDia7.height - this.scrollKnobDia7.height / 2;

            const yClamped = Phaser.Math.Clamp(pointer.y, minY, maxY);
            const ratio = (yClamped - minY) / Math.max(1, (maxY - minY));

            this.moverScrollResumenDia7(ratio * this.scrollResumenMaxDia7);
        });

        this.input.on('pointermove', this.scrollResumenPointerMoveHandlerDia7);
        this.input.on('pointerup', this.scrollResumenPointerUpHandlerDia7);
        this.input.on('wheel', this.scrollResumenWheelHandlerDia7);

        this.elementosDia7.push(
            this.resumenContainerDia7,
            this.scrollTrackDia7,
            this.scrollKnobDia7,
            this.scrollZoneDia7
        );
    }

    actualizarTextoScrollResumenDia7(texto) {
        if (!this.resumenTextoDia7) return;

        this.resumenTextoDia7.setText(texto);

        const contentHeight = this.resumenTextoDia7.height + 12;
        this.scrollResumenMaxDia7 = Math.max(
            0,
            contentHeight - this.resumenViewportDia7.height
        );

        if (this.scrollResumenMaxDia7 <= 0) {
            this.scrollResumenOffsetDia7 = 0;
            this.resumenContainerDia7.y = this.resumenViewportDia7.y;

            this.scrollKnobDia7.height = 88;
            this.scrollKnobDia7.y = this.resumenViewportDia7.y + this.scrollKnobDia7.height / 2;
            this.scrollKnobDia7.setAlpha(0.35);
            this.scrollTrackDia7.setAlpha(0.35);
            return;
        }

        this.scrollKnobDia7.setAlpha(1);
        this.scrollTrackDia7.setAlpha(1);

        const ratioVisible = this.resumenViewportDia7.height / contentHeight;
        this.scrollKnobDia7.height = Phaser.Math.Clamp(
            this.resumenViewportDia7.height * ratioVisible,
            55,
            this.resumenViewportDia7.height
        );

        this.moverScrollResumenDia7(this.scrollResumenOffsetDia7);
    }

    moverScrollResumenDia7(nuevoOffset) {
        this.scrollResumenOffsetDia7 = Phaser.Math.Clamp(
            nuevoOffset,
            0,
            this.scrollResumenMaxDia7
        );

        this.resumenContainerDia7.y = this.resumenViewportDia7.y - this.scrollResumenOffsetDia7;

        if (this.scrollResumenMaxDia7 <= 0) {
            this.scrollKnobDia7.y = this.resumenViewportDia7.y + this.scrollKnobDia7.height / 2;
            return;
        }

        const minY = this.resumenViewportDia7.y + this.scrollKnobDia7.height / 2;
        const maxY = this.resumenViewportDia7.y + this.resumenViewportDia7.height - this.scrollKnobDia7.height / 2;
        const ratio = this.scrollResumenOffsetDia7 / this.scrollResumenMaxDia7;

        this.scrollKnobDia7.y = Phaser.Math.Linear(minY, maxY, ratio);
    }

    obtenerDelitosMarcadosTotalesDia7() {
        const porDia = this.obtenerDelitosMarcadosPorDiaParaDia6();
        return [
            ...(porDia[1] || []),
            ...(porDia[2] || []),
            ...(porDia[3] || []),
            ...(porDia[4] || []),
            ...(porDia[5] || [])
        ];
    }

    construirArbolAVLDesdeListaDia7(lista) {
        let raiz = null;
        (lista || []).forEach((pj) => {
            raiz = this.insertarAVLDia6(raiz, pj);
        });
        return raiz;
    }

    obtenerNodosPorNivelDia7(arbol) {
        const niveles = {};

        const recorrer = (nodo, depth) => {
            if (!nodo) return;

            if (!niveles[depth]) niveles[depth] = [];
            niveles[depth].push(nodo.personaje);

            recorrer(nodo.izq, depth + 1);
            recorrer(nodo.der, depth + 1);
        };

        recorrer(arbol, 0);
        return niveles;
    }

    obtenerNivelSeleccionableDia7(niveles) {
        const profundidades = Object.keys(niveles)
            .map(Number)
            .sort((a, b) => b - a);

        const autoConservados = [];

        for (const depth of profundidades) {
            const lista = niveles[depth] || [];

            if (lista.length > 1) {
                return {
                    depth,
                    candidatos: [...lista].sort((a, b) => this.obtenerPesoGravedadDia6(a) - this.obtenerPesoGravedadDia6(b)),
                    autoConservados
                };
            }

            if (lista.length === 1) {
                autoConservados.push(lista[0]);
            }
        }

        return {
            depth: profundidades.length ? profundidades[0] : 0,
            candidatos: profundidades.length ? (niveles[profundidades[0]] || []) : [],
            autoConservados
        };
    }

    actualizarEstadoDia7() {
        this.limpiarPanelCandidatosDia7();

        this.btnConfirmarDia7Bg.setVisible(false);
        this.btnConfirmarDia7Txt.setVisible(false);
        this.btnConfirmarDia7Zone.setVisible(false);
        this.btnConfirmarDia7Zone.disableInteractive();

        this.btnFinalDia7Bg.setVisible(false);
        this.btnFinalDia7Txt.setVisible(false);
        this.btnFinalDia7Zone.setVisible(false);
        this.btnFinalDia7Zone.disableInteractive();

        this.seleccionActualDia7 = null;

        if (!this.candidatosActivosDia7.length) {
            this.textoPasoDia7.setText('No hay delitos marcados.');
            this.actualizarTextoScrollResumenDia7('No hay información para resolver el caso.');
            if (this.graficoDia6Container) this.graficoDia6Container.removeAll(true);
            return;
        }

        this.arbolDia7Actual = this.construirArbolAVLDesdeListaDia7(this.candidatosActivosDia7);

        if (this.candidatosActivosDia7.length <= 5) {
            this.culpablesFinalesDia7 = [...this.candidatosActivosDia7].sort(
                (a, b) => this.obtenerPesoGravedadDia6(b) - this.obtenerPesoGravedadDia6(a)
            );

            this.redibujarArbolDia6(
                this.arbolDia7Actual,
                this.culpablesFinalesDia7.map(p => this._obtenerIdPersonaje(p))
            );

            this.mostrarReporteFinalDia7();
            return;
        }

        const niveles = this.obtenerNodosPorNivelDia7(this.arbolDia7Actual);
        const seleccion = this.obtenerNivelSeleccionableDia7(niveles);

        this.nivelObjetivoDia7 = seleccion.depth;
        this.candidatosNivelDia7 = seleccion.candidatos;
        this.autoConservadosDia7 = seleccion.autoConservados;

        const highlightIds = [
            ...this.candidatosNivelDia7.map(p => this._obtenerIdPersonaje(p)),
            ...this.autoConservadosDia7.map(p => this._obtenerIdPersonaje(p))
        ];

        this.redibujarArbolDia6(this.arbolDia7Actual, highlightIds);

        this.textoPasoDia7.setText(
            `Selecciona 1 sospechoso del nivel ${this.nivelObjetivoDia7 + 1}.\nLos demás de ese nivel serán eliminados.`
        );

        this.actualizarTextoScrollResumenDia7(this.generarResumenSeleccionDia7());
        this.renderizarCandidatosNivelDia7();
    }

    limpiarPanelCandidatosDia7() {
        if (!this.candidatosDia7Elems) {
            this.candidatosDia7Elems = [];
            return;
        }

        this.candidatosDia7Elems.forEach(el => {
            if (el && el.destroy) el.destroy();
        });
        this.candidatosDia7Elems = [];

        if (this.candidatosDia7Container) {
            this.candidatosDia7Container.removeAll(true);
        }
    }

    renderizarCandidatosNivelDia7() {
        this.limpiarPanelCandidatosDia7();

        const lista = this.candidatosNivelDia7 || [];
        const total = lista.length;
        if (!total) return;

        let cols = 3;
        if (total >= 5) cols = 4;
        if (total <= 2) cols = total;

        const rows = Math.ceil(total / cols);
        const cellW = cols === 4 ? 208 : 265;
        const cellH = 88;

        const totalW = cols * cellW;
        const startX = 820 - totalW / 2 + cellW / 2;
        const startY = rows === 1 ? 590 : 548;

        lista.forEach((pj, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);

            const x = startX + col * cellW;
            const y = startY + row * cellH;

            this.crearTarjetaCandidatoDia7(pj, x, y, cols === 4 ? 190 : 240);
        });

        this.btnConfirmarDia7Bg.setVisible(true);
        this.btnConfirmarDia7Txt.setVisible(true);
        this.btnConfirmarDia7Zone.setVisible(true);
        this.btnConfirmarDia7Zone.setInteractive({ cursor: 'pointer' });
    }

    crearTarjetaCandidatoDia7(pj, x, y, ancho = 220) {
        const id = this._obtenerIdPersonaje(pj);
        const yaSeleccionado = this.seleccionActualDia7 && this._obtenerIdPersonaje(this.seleccionActualDia7) === id;
        const clave = this._obtenerClaveAvatar(pj);

        const bg = this.add.rectangle(
            x,
            y,
            ancho,
            76,
            yaSeleccionado ? 0x27472b : 0x11203d,
            0.98
        );
        bg.setStrokeStyle(yaSeleccionado ? 3 : 2, yaSeleccionado ? 0xa6e18f : this.obtenerColorNodoDia6(pj.dia), 1);

        let avatar;
        if (this.textures.exists(clave)) {
            avatar = this.add.image(x - ancho / 2 + 34, y, clave);
            avatar.setDisplaySize(44, 44);
        } else {
            avatar = this.add.circle(x - ancho / 2 + 34, y, 22, this.obtenerColorNodoDia6(pj.dia), 1);
        }

        const nombre = this.add.text(x - ancho / 2 + 66, y - 17, pj.nombre, {
            fontFamily: '"VT323", monospace',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0, 0.5);

        const gravedad = this.add.text(x - ancho / 2 + 66, y + 1, `Gravedad ${this.obtenerPesoGravedadDia6(pj)}`, {
            fontFamily: '"VT323", monospace',
            fontSize: '18px',
            color: '#cfe2ff'
        }).setOrigin(0, 0.5);

        const acusacion = this.add.text(x, y + 21, this.extraerAcusacionMuyCortaDia7(pj), {
            fontFamily: '"VT323", monospace',
            fontSize: '14px',
            color: '#dfeaff',
            align: 'center',
            wordWrap: { width: ancho - 20 }
        }).setOrigin(0.5, 0.5);

        const zone = this.add.zone(x, y, ancho, 76).setInteractive({ cursor: 'pointer' });
        zone.on('pointerdown', () => {
            this.reproducirClick();
            this.seleccionActualDia7 = pj;
            this.renderizarCandidatosNivelDia7();
            this.textoPasoDia7.setText(
                `${pj.nombre} fue marcado para permanecer.\nPulsa Confirmar para eliminar a los demás del nivel ${this.nivelObjetivoDia7 + 1}.`
            );
        });

        const elementos = [bg, avatar, nombre, gravedad, acusacion, zone];
        this.candidatosDia7Elems.push(...elementos);
        this.candidatosDia7Container.add(elementos);
    }

    aplicarSeleccionNivelDia7() {
        if (!this.seleccionActualDia7) return;

        const seleccionadaId = this._obtenerIdPersonaje(this.seleccionActualDia7);
        const idsNivel = new Set(this.candidatosNivelDia7.map(p => this._obtenerIdPersonaje(p)));

        this.historialDia7.push(
            `Nivel ${this.nivelObjetivoDia7 + 1}: permanece ${this.seleccionActualDia7.nombre}`
        );

        this.candidatosActivosDia7 = this.candidatosActivosDia7.filter((pj) => {
            const id = this._obtenerIdPersonaje(pj);
            return !idsNivel.has(id) || id === seleccionadaId;
        });

        this.seleccionActualDia7 = null;
        this.actualizarEstadoDia7();
    }

    extraerAcusacionMuyCortaDia7(pj) {
        const txt = this.extraerAcusacionCompletaDia7(pj);
        if (!txt) return 'Sin acusación';
        return txt.length > 34 ? `${txt.slice(0, 31)}...` : txt;
    }

    extraerAcusacionCortaDia7(pj) {
        const txt = this.extraerAcusacionCompletaDia7(pj);
        if (!txt) return 'Sin acusación';
        return txt.length > 55 ? `${txt.slice(0, 52)}...` : txt;
    }

    extraerAcusacionCompletaDia7(pj) {
        return ((pj.textoCaso || '').split('///')[0] || '')
            .replace(/^"+|"+$/g, '')
            .trim();
    }

    generarResumenSeleccionDia7() {
        const textoBase = [];
        textoBase.push(`Nodos activos: ${this.candidatosActivosDia7.length}`);
        textoBase.push('');

        if (this.autoConservadosDia7.length) {
            textoBase.push('Se conservan automáticamente:');
            this.autoConservadosDia7.forEach(p => {
                textoBase.push(`• ${p.nombre} (${this.obtenerPesoGravedadDia6(p)})`);
            });
            textoBase.push('');
        }

        textoBase.push(`Nivel en revisión: ${this.nivelObjetivoDia7 + 1}`);
        textoBase.push('');
        textoBase.push('Candidatos actuales:');
        this.candidatosNivelDia7.forEach(p => {
            textoBase.push(`• ${p.nombre} (${this.obtenerPesoGravedadDia6(p)})`);
        });

        if (this.historialDia7.length) {
            textoBase.push('');
            textoBase.push('Historial:');
            this.historialDia7.slice(-10).forEach(t => textoBase.push(`• ${t}`));
        }

        return textoBase.join('\n');
    }

    mostrarReporteFinalDia7() {
        this.limpiarPanelCandidatosDia7();

        this.textoPasoDia7.setText(
            'Resolución final del caso.\nEstos son los 5 culpables que quedaron en el árbol.'
        );

        this.actualizarTextoScrollResumenDia7(this.generarReporteFinalDia7());

        const lista = this.culpablesFinalesDia7;
        const total = lista.length;
        const cols = 5;
        const cellW = 176;
        const totalW = cols * cellW;
        const startX = 820 - totalW / 2 + cellW / 2;
        const y = 590;

        lista.forEach((pj, i) => {
            const x = startX + i * cellW;
            this.crearTarjetaFinalDia7(pj, x, y);
        });

        this.btnFinalDia7Bg.setVisible(true);
        this.btnFinalDia7Txt.setVisible(true);
        this.btnFinalDia7Zone.setVisible(true);
        this.btnFinalDia7Zone.setInteractive({ cursor: 'pointer' });
    }

    crearTarjetaFinalDia7(pj, x, y) {
        const clave = this._obtenerClaveAvatar(pj);

        const bg = this.add.rectangle(x, y, 160, 120, 0x11203d, 0.98);
        bg.setStrokeStyle(3, this.obtenerColorNodoDia6(pj.dia), 1);

        let avatar;
        if (this.textures.exists(clave)) {
            avatar = this.add.image(x, y - 26, clave);
            avatar.setDisplaySize(46, 46);
        } else {
            avatar = this.add.circle(x, y - 26, 23, this.obtenerColorNodoDia6(pj.dia), 1);
        }

        const nombre = this.add.text(x, y + 6, pj.nombre, {
            fontFamily: '"VT323", monospace',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const gravedad = this.add.text(x, y + 28, `G ${this.obtenerPesoGravedadDia6(pj)}`, {
            fontFamily: '"VT323", monospace',
            fontSize: '18px',
            color: '#dce8ff'
        }).setOrigin(0.5);

        const acusacion = this.add.text(x, y + 50, this.extraerAcusacionCortaDia7(pj), {
            fontFamily: '"VT323", monospace',
            fontSize: '15px',
            color: '#dfeaff',
            align: 'center',
            wordWrap: { width: 145 }
        }).setOrigin(0.5);

        const elementos = [bg, avatar, nombre, gravedad, acusacion];
        this.candidatosDia7Elems.push(...elementos);
        this.candidatosDia7Container.add(elementos);
    }

    generarReporteFinalDia7() {
        const lineas = [];
        lineas.push('Culpables finales');
        lineas.push('');

        this.culpablesFinalesDia7.forEach((pj, i) => {
            lineas.push(`${i + 1}. ${pj.nombre}`);
            lineas.push(`Acusación: ${this.extraerAcusacionCompletaDia7(pj)}`);
            lineas.push('');
        });

        lineas.push('Relato de los hechos');
        lineas.push('');
        lineas.push(
            'Tras recorrer el árbol final y eliminar progresivamente a los perfiles descartados en los niveles más profundos, '
            + 'permanecieron cinco sospechosos principales. Las acusaciones conservadas muestran las conductas más relevantes del caso: '
            + 'mensajes ofensivos, coordinación digital, difusión de contenido dañino, amenazas, hostigamiento o manipulación de identidad. '
            + 'Por ello, estos cinco nombres fueron identificados como los culpables finales del caso.'
        );

        return lineas.join('\n');
    }
    continuarADia7DesdeDia6() {
        if (this.yaTransicionando) return;
        this.yaTransicionando = true;

        if (this.backZone) this.backZone.disableInteractive();
        if (this.sliderZone) this.sliderZone.disableInteractive();
        if (this.btnContinuarDia6Zone) this.btnContinuarDia6Zone.disableInteractive();

        this.fadeOutMusica(() => {
            this.cameras.main.fadeOut(500, 0, 0, 0);

            this.time.delayedCall(500, () => {
                this.scene.start('Ventana1', {
                    diaActual: 7,
                    modoSoloFondo: false,
                    transicionEntrada: true,
                    volumenActual: this.volumenActual,
                    delitosEncontrados: this.delitosEncontrados,
                    estadoBuscadorPorDia: this.estadoBuscadorPorDia,
                    sancionesAsignadas: this.sancionesAsignadas,
                    vidasDiaActual: 4,
                    penalizacionDia: 0
                });
            });
        });
    }
    // ─────────────────────────────────────────────────────────
    // PANTALLA FINAL DEL CASO
    // ─────────────────────────────────────────────────────────
    irAPantallaFinalCaso() {
        if (this.yaTransicionando) return;
        this.yaTransicionando = true;

        if (this.backZone) this.backZone.disableInteractive();
        if (this.sliderZone) this.sliderZone.disableInteractive();
        if (this.btnFinalDia7Zone) this.btnFinalDia7Zone.disableInteractive();

        this.fadeOutMusica(() => {
            this.cameras.main.fadeOut(500, 0, 0, 0);

            this.time.delayedCall(500, () => {
                this.scene.start('Ventana1', {
                    diaActual: 8,
                    modoSoloFondo: false,
                    transicionEntrada: true,
                    volumenActual: this.volumenActual,
                    delitosEncontrados: this.delitosEncontrados,
                    estadoBuscadorPorDia: this.estadoBuscadorPorDia,
                    sancionesAsignadas: this.sancionesAsignadas,
                    vidasDiaActual: 4,
                    penalizacionDia: 0,
                    culpablesFinalesDia7: this.culpablesFinalesDia7 || []
                });
            });
        });
    }

    crearPantallaFinalCaso() {
        this.children.removeAll();

        this.fondoFinalCaso = this.add.rectangle(640, 360, 1280, 720, 0x000000, 1);
        this.fondoFinalCaso.setDepth(0);

        this.tituloFinalCaso = this.add.text(
            640,
            95,
            '¡Felicidades!\nHas hallado a los culpables y han sido sancionados.',
            {
                fontFamily: '"VT323", monospace',
                fontSize: '40px',
                color: '#ffffff',
                align: 'center',
                stroke: '#09111f',
                strokeThickness: 4,
                lineSpacing: 8,
                wordWrap: { width: 980 }
            }
        );
        this.tituloFinalCaso.setOrigin(0.5);
        this.tituloFinalCaso.setDepth(10);

        const culpables = Array.isArray(this.culpablesFinalesDia7)
            ? [...this.culpablesFinalesDia7]
            : [];

        this.panelCulpablesFinal = this.add.rectangle(640, 375, 1120, 360, 0x07101f, 0.92);
        this.panelCulpablesFinal.setStrokeStyle(2, 0x78a7ff, 1);
        this.panelCulpablesFinal.setDepth(5);

        this.subtituloFinalCaso = this.add.text(
            640,
            175,
            'Culpables identificados',
            {
                fontFamily: '"VT323", monospace',
                fontSize: '30px',
                color: '#dce8ff',
                align: 'center'
            }
        );
        this.subtituloFinalCaso.setOrigin(0.5);
        this.subtituloFinalCaso.setDepth(10);

        if (!culpables.length) {
            this.sinCulpablesTxt = this.add.text(
                640,
                355,
                'No se encontraron culpables finales.',
                {
                    fontFamily: '"VT323", monospace',
                    fontSize: '28px',
                    color: '#ffffff',
                    align: 'center'
                }
            );
            this.sinCulpablesTxt.setOrigin(0.5);
            this.sinCulpablesTxt.setDepth(10);
        } else {
            this.renderizarCulpablesPantallaFinal(culpables);
        }

        this.btnFinJuegoBg = this.add.rectangle(640, 650, 230, 58, 0x345b2c, 1);
        this.btnFinJuegoBg.setStrokeStyle(2, 0xa6e18f, 1);
        this.btnFinJuegoBg.setDepth(15);

        this.btnFinJuegoTxt = this.add.text(640, 650, 'Fin del juego', {
            fontFamily: '"VT323", monospace',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(16);

        this.btnFinJuegoZone = this.add.zone(640, 650, 230, 58)
            .setDepth(17)
            .setInteractive({ cursor: 'pointer' });

        this.btnFinJuegoZone.on('pointerover', () => {
            this.btnFinJuegoBg.setFillStyle(0x44753a, 1);
        });

        this.btnFinJuegoZone.on('pointerout', () => {
            this.btnFinJuegoBg.setFillStyle(0x345b2c, 1);
        });

        this.btnFinJuegoZone.on('pointerdown', () => {
            if (this.yaTransicionando) return;
            this.reproducirClick();
            this.irAStart();
        });
    }

    renderizarCulpablesPantallaFinal(culpables) {
        const total = culpables.length;
        const cols = Math.min(5, total);
        const cellW = 200;
        const totalW = cols * cellW;
        const startX = 640 - totalW / 2 + cellW / 2;
        const y = 380;

        culpables.forEach((pj, i) => {
            const x = startX + i * cellW;
            this.crearTarjetaCulpableFinal(pj, x, y);
        });
    }

    crearTarjetaCulpableFinal(pj, x, y) {
        const clave = this._obtenerClaveAvatar(pj);

        const bg = this.add.rectangle(x, y, 170, 210, 0x11203d, 0.98);
        bg.setStrokeStyle(3, this.obtenerColorNodoDia6(pj.dia), 1);
        bg.setDepth(10);

        let avatar;
        if (this.textures.exists(clave)) {
            avatar = this.add.image(x, y - 48, clave);
            avatar.setDisplaySize(70, 70);
        } else {
            avatar = this.add.circle(x, y - 48, 35, this.obtenerColorNodoDia6(pj.dia), 1);
        }
        avatar.setDepth(11);

        const nombre = this.add.text(x, y + 10, pj.nombre, {
            fontFamily: '"VT323", monospace',
            fontSize: '28px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setDepth(11);

        const gravedad = this.add.text(x, y + 36, `Gravedad ${this.obtenerPesoGravedadDia6(pj)}`, {
            fontFamily: '"VT323", monospace',
            fontSize: '20px',
            color: '#dce8ff',
            align: 'center'
        }).setOrigin(0.5).setDepth(11);

        const acusacion = this.add.text(x, y + 82, this.extraerAcusacionCortaDia7(pj), {
            fontFamily: '"VT323", monospace',
            fontSize: '16px',
            color: '#dfeaff',
            align: 'center',
            wordWrap: { width: 145 }
        }).setOrigin(0.5).setDepth(11);
    }

    _calcularPuntajeDia() {
        const personajes = this.personajesDia || [];

        let clasificacionesCorrectas = 0;
        let sancionesCorrectas = 0;

        personajes.forEach((pj) => {
            const decision = this._obtenerDecisionDiaActual(pj);

            const clasificacionBien =
                (pj.delito === true && decision === 'delito') ||
                (pj.delito === false && decision === 'libre');

            if (clasificacionBien) {
                clasificacionesCorrectas += 1;
            }

            if (pj.delito === true && pj.sancion && pj.sancion !== 'NO TIENE') {
                const sancionAsignada = this._obtenerSancionAsignada(pj);

                if (
                    sancionAsignada &&
                    sancionAsignada.nombre === pj.sancion.nombre
                ) {
                    sancionesCorrectas += 1;
                }
            }
        });

        const puntosClasificacion = clasificacionesCorrectas * 10;
        const puntosSanciones = sancionesCorrectas * 10;
        const totalBruto = puntosClasificacion + puntosSanciones;
        const penalizacion = this.penalizacionDia || 0;
        const totalFinal = Math.max(0, totalBruto - penalizacion);

        return {
            dia: this.diaActual,
            clasificacionesCorrectas,
            puntosClasificacion,
            sancionesCorrectas,
            puntosSanciones,
            totalBruto,
            penalizacion,
            vidasRestantes: this.vidasDiaActual,
            total: totalFinal
        };
    }

    _obtenerEstadoSiguienteDespuesDelPuntaje() {
        if (this.diaActual < 6) {
            return {
                diaActual: this.diaActual + 1,
                transicionEntrada: true,
                volumenActual: this.volumenActual,
                delitosEncontrados: this.delitosEncontrados,
                estadoBuscadorPorDia: this.estadoBuscadorPorDia,
                sancionesAsignadas: this.sancionesAsignadas,
                vidasDiaActual: 4,
                penalizacionDia: 0
            };
        }

        return {
            diaActual: 7,
            modoSoloFondo: true,
            transicionEntrada: true,
            volumenActual: this.volumenActual,
            delitosEncontrados: this.delitosEncontrados,
            estadoBuscadorPorDia: this.estadoBuscadorPorDia,
            sancionesAsignadas: this.sancionesAsignadas,
            vidasDiaActual: 4,
            penalizacionDia: 0
        };
    }

    // ─────────────────────────────────────────────────────────
    // Modal base
    // ─────────────────────────────────────────────────────────
    crearModalPersonalizado() {
        this.overlayModal = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.58);
        this.overlayModal.setDepth(100);
        this.overlayModal.setVisible(false);
        this.overlayModal.setAlpha(0);
        this.overlayModal.setInteractive();

        this.marcoExterior = this.add.rectangle(640, 360, 1140, 650, 0x06122a, 0.98);
        this.marcoExterior.setDepth(101);
        this.marcoExterior.setStrokeStyle(4, 0x89b4ff, 1);
        this.marcoExterior.setVisible(false);
        this.marcoExterior.setAlpha(0);

        this.barraTitulo = this.add.rectangle(640, 150, 1060, 118, 0x324a88, 1);
        this.barraTitulo.setDepth(102);
        this.barraTitulo.setStrokeStyle(3, 0xd8e7ff, 1);
        this.barraTitulo.setVisible(false);
        this.barraTitulo.setAlpha(0);

        this.lineaDecorativa1 = this.add.rectangle(640, 248, 1030, 3, 0x4f7fd1, 1);
        this.lineaDecorativa1.setDepth(102);
        this.lineaDecorativa1.setVisible(false);
        this.lineaDecorativa1.setAlpha(0);

        this.tituloModal = this.add.text(640, 150, '', {
            fontFamily: '"VT323", monospace',
            fontSize: '54px',
            color: '#ffffff',
            stroke: '#09111f',
            strokeThickness: 6,
            align: 'center'
        });
        this.tituloModal.setOrigin(0.5);
        this.tituloModal.setDepth(103);
        this.tituloModal.setVisible(false);
        this.tituloModal.setAlpha(0);

        this.cerrarModalBtn = this.add.image(640, 676, 'back');
        this.cerrarModalBtn.setDepth(103);
        this.cerrarModalBtn.setScale(0.20);
        this.cerrarModalBtn.setVisible(false);
        this.cerrarModalBtn.setAlpha(0);

        this.cerrarModalZone = this.add.zone(640, 676, 180, 52);
        this.cerrarModalZone.setDepth(104);
        this.cerrarModalZone.setVisible(false);

        this.cerrarModalZone.on('pointerover', () => {
            if (!this.modalAbierto) return;
            this.tweens.killTweensOf(this.cerrarModalBtn);
            this.tweens.add({
                targets: this.cerrarModalBtn,
                scale: 0.215,
                duration: 120
            });
        });

        this.cerrarModalZone.on('pointerout', () => {
            if (!this.modalAbierto) return;
            this.tweens.killTweensOf(this.cerrarModalBtn);
            this.tweens.add({
                targets: this.cerrarModalBtn,
                scale: 0.20,
                duration: 120
            });
        });

        this.cerrarModalZone.on('pointerdown', () => {
            if (!this.modalAbierto) return;
            this.reproducirClick();
            this.cerrarModal();
        });

        if (this.escHandler) {
            this.input.keyboard.off('keydown-ESC', this.escHandler);
        }

        this.escHandler = () => {
            if (this._sancionesModalElements && this._sancionesModalElements.length) {
                this._cerrarSelectorSancionesModal();
                return;
            }

            if (this.modalAbierto) {
                this.cerrarModal();
            }
        };

        this.input.keyboard.on('keydown-ESC', this.escHandler);
    }

    abrirModalPrincipal(tipo) {
        if (this.modalAbierto) return;

        this.modalAbierto = true;
        this.desactivarInteractivosPrincipales();

        if (tipo === 'buscar') {
            this.tituloModal.setText('Buscador de delitos');
        }

        if (tipo === 'encontrados') {
            this.tituloModal.setText(`Delitos encontrados - Día ${this.diaActual}`);
        }

        if (tipo === 'manual') {
            this.tituloModal.setText('Manual de delitos');
        }

        this.mostrarModal();

        this.time.delayedCall(180, () => {
            if (tipo === 'buscar') {
                this.mostrarContenidoBuscador();
            }

            if (tipo === 'encontrados') {
                // SOLO día actual, pero editable
                this.mostrarContenidoEncontrados(this.diaActual, false);
            }

            if (tipo === 'manual') {
                this.mostrarContenidoManual();
            }
        });
    }
    _crearTarjetaBuscador(pj, topY) {
        const container = this.scrollState.container;
        const decision = this._obtenerDecisionDiaActual(pj);

        // Separar texto principal y observación del detective
        const partes = (pj.textoCaso || '').split('///');
        const textoPrincipal = (partes[0] || '').trim();
        const textoDetAlex = partes.length > 1 ? ('Det. Alex: ' + partes.slice(1).join('///').replace(/^Det\.\s*Alex:\s*/i, '').trim()) : '';

        const estiloNombre = {
            fontFamily: '"VT323", monospace',
            fontSize: '32px',
            color: '#ffffff'
        };

        const estiloPrincipal = {
            fontFamily: '"VT323", monospace',
            fontSize: '20px',
            color: '#e4eeff',
            wordWrap: { width: 520, useAdvancedWrap: true },
            lineSpacing: 5
        };

        const estiloDetAlex = {
            fontFamily: '"VT323", monospace',
            fontSize: '17px',
            color: '#9fb9e8',
            wordWrap: { width: 520, useAdvancedWrap: true },
            lineSpacing: 4,
            fontStyle: 'italic'
        };

        // Medición real
        const medidorNombre = this.add.text(-3000, -3000, pj.nombre.trim(), estiloNombre);
        const medidorPrincipal = this.add.text(-3000, -3000, textoPrincipal, estiloPrincipal);
        const medidorDetAlex = this.add.text(-3000, -3000, textoDetAlex, estiloDetAlex);

        const nombreHeight = medidorNombre.height;
        const principalHeight = medidorPrincipal.height;
        const detAlexHeight = textoDetAlex ? medidorDetAlex.height : 0;

        medidorNombre.destroy();
        medidorPrincipal.destroy();
        medidorDetAlex.destroy();

        // Layout vertical
        const yNombre = topY + 16;
        const yPrincipal = yNombre + nombreHeight + 10;
        const yDetAlex = yPrincipal + principalHeight + 10;

        const textoBottom = yDetAlex + detAlexHeight;
        const avatarBottom = topY + 24 + 82;

        const contenidoBottom = Math.max(
            textoBottom + 18,
            avatarBottom + 18,
            topY + 132
        );

        const cardHeight = contenidoBottom - topY;
        const centerY = topY + cardHeight / 2;

        // Fondo tarjeta
        const filaBg = this.add.rectangle(600, centerY, 960, cardHeight, 0x0f1633, 0.72);
        filaBg.setStrokeStyle(2, 0x264c8a, 1);

        const marco = this.add.rectangle(158, centerY, 82, 82, 0x1b2d5a, 1);
        marco.setStrokeStyle(2, 0x7aa4ff, 1);

        container.add([filaBg, marco]);

        // Avatar
        const key = this._obtenerClaveAvatar(pj);
        if (this.textures.exists(key)) {
            const foto = this.add.image(158, centerY, key).setDisplaySize(74, 74);
            container.add(foto);
        } else {
            const placeholderBg = this.add.rectangle(158, centerY, 74, 74, 0x2d4b7e, 1);
            const inicialTxt = this.add.text(158, centerY, pj.nombre.charAt(0).toUpperCase(), {
                fontFamily: '"VT323", monospace',
                fontSize: '34px',
                color: '#ffffff'
            }).setOrigin(0.5);
            container.add([placeholderBg, inicialTxt]);
        }

        // Textos
        const nomTxt = this.add.text(225, yNombre, pj.nombre.trim(), estiloNombre);
        const principalTxt = this.add.text(225, yPrincipal, textoPrincipal, estiloPrincipal);

        container.add([nomTxt, principalTxt]);

        if (textoDetAlex) {
            const detAlexTxt = this.add.text(225, yDetAlex, textoDetAlex, estiloDetAlex);
            container.add(detAlexTxt);
        }

        // Botones
        const btnY = centerY - 12;

        const btnDelBg = this.add.rectangle(
            855,
            btnY,
            130,
            46,
            decision === 'delito' ? 0x5b9947 : 0x3f6e34,
            1
        );
        btnDelBg.setStrokeStyle(2, 0xa4dd8f, 1);

        const btnDelTxt = this.add.text(855, btnY, 'DELITO', {
            fontFamily: '"VT323", monospace',
            fontSize: '24px',
            color: '#f4fff0'
        }).setOrigin(0.5);

        const btnLibBg = this.add.rectangle(
            1010,
            btnY,
            130,
            46,
            decision === 'libre' ? 0x6b67bc : 0x474276,
            1
        );
        btnLibBg.setStrokeStyle(2, 0xbab8ff, 1);

        const btnLibTxt = this.add.text(1010, btnY, 'LIBRE', {
            fontFamily: '"VT323", monospace',
            fontSize: '24px',
            color: '#f5f5ff'
        }).setOrigin(0.5);

        const statusTxt = this.add.text(
            932,
            btnY + 50,
            decision === 'delito'
                ? 'Marcado como delito'
                : decision === 'libre'
                    ? 'Marcado como libre'
                    : 'Sin clasificar',
            {
                fontFamily: '"VT323", monospace',
                fontSize: '18px',
                color: decision ? '#dfeaff' : '#a9badc',
                align: 'center',
                wordWrap: { width: 230, useAdvancedWrap: true }
            }
        ).setOrigin(0.5, 0.5);

        const zDel = this.add.zone(855, btnY, 130, 46).setInteractive({ cursor: 'pointer' });
        zDel.on('pointerover', () => btnDelBg.setFillStyle(0x6caf55, 1));
        zDel.on('pointerout', () => btnDelBg.setFillStyle(decision === 'delito' ? 0x5b9947 : 0x3f6e34, 1));
        zDel.on('pointerdown', () => {
            this.reproducirClick();
            this._marcarComoDelito(pj);
            this.mostrarContenidoBuscador();
        });

        const zLib = this.add.zone(1010, btnY, 130, 46).setInteractive({ cursor: 'pointer' });
        zLib.on('pointerover', () => btnLibBg.setFillStyle(0x7a76d1, 1));
        zLib.on('pointerout', () => btnLibBg.setFillStyle(decision === 'libre' ? 0x6b67bc : 0x474276, 1));
        zLib.on('pointerdown', () => {
            this.reproducirClick();
            this._marcarComoLibre(pj);
            this.mostrarContenidoBuscador();
        });

        container.add([
            btnDelBg, btnDelTxt,
            btnLibBg, btnLibTxt,
            statusTxt,
            zDel, zLib
        ]);

        return topY + cardHeight + 18;
    }
    abrirModalDia(numeroDia) {
        if (this.modalAbierto) return;

        this.modalAbierto = true;
        this.desactivarInteractivosPrincipales();

        this.tituloModal.setText(`Delitos encontrados - Día ${numeroDia}`);
        this.mostrarModal();

        this.time.delayedCall(180, () => {
            // SOLO lectura cuando entras desde la carpeta de días
            this.mostrarContenidoEncontrados(numeroDia, true);
        });
    }
    _esSancionCorrecta(pj, sancionAsignada) {
        if (!pj || !pj.sancion || pj.sancion === 'NO TIENE') {
            return false;
        }

        if (!sancionAsignada) {
            return false;
        }

        return pj.sancion.nombre === sancionAsignada.nombre;
    }

    _validarDiaActualCompleto() {
        const personajes = this.personajesDia || [];

        const resultado = {
            sinClasificar: 0,
            delitosMarcadosComoLibre: 0,
            libresMarcadosComoDelito: 0,
            sancionesPendientes: 0,
            sancionesIncorrectas: 0,
            todoCorrecto: false
        };

        personajes.forEach(pj => {
            const decision = this._obtenerDecisionDiaActual(pj);
            const sancionAsignada = this._obtenerSancionAsignada(pj);

            // 1) Si ni siquiera se clasificó
            if (!decision) {
                resultado.sinClasificar++;
                return;
            }

            // 2) Si era delito real
            if (pj.delito === true) {
                if (decision !== 'delito') {
                    resultado.delitosMarcadosComoLibre++;
                    return;
                }

                // Solo si está bien marcado como delito revisamos sanción
                if (!sancionAsignada) {
                    resultado.sancionesPendientes++;
                    return;
                }

                if (!this._esSancionCorrecta(pj, sancionAsignada)) {
                    resultado.sancionesIncorrectas++;
                }

                return;
            }

            // 3) Si era libre/inocente
            if (pj.delito === false) {
                if (decision !== 'libre') {
                    resultado.libresMarcadosComoDelito++;
                }
            }
        });

        resultado.todoCorrecto =
            resultado.sinClasificar === 0 &&
            resultado.delitosMarcadosComoLibre === 0 &&
            resultado.libresMarcadosComoDelito === 0 &&
            resultado.sancionesPendientes === 0 &&
            resultado.sancionesIncorrectas === 0;

        return resultado;
    }

    _mostrarResumenValidacionDia(resultado) {
        if (this.avisoValidacionBg) {
            this.avisoValidacionBg.destroy();
            this.avisoValidacionBg = null;
        }

        if (this.avisoValidacionTxt) {
            this.avisoValidacionTxt.destroy();
            this.avisoValidacionTxt = null;
        }

        const lineas = ['No puedes finalizar el día todavía.'];

        if (resultado.sinClasificar > 0) {
            lineas.push(`• Te faltan ${resultado.sinClasificar} personaje(s) por clasificar.`);
        }

        if (resultado.delitosMarcadosComoLibre > 0) {
            lineas.push(`• Tienes ${resultado.delitosMarcadosComoLibre} delito(s) real(es) marcados como LIBRE.`);
        }

        if (resultado.libresMarcadosComoDelito > 0) {
            lineas.push(`• Tienes ${resultado.libresMarcadosComoDelito} inocente(s) marcados como DELITO.`);
        }

        if (resultado.sancionesPendientes > 0) {
            lineas.push(`• Te faltan ${resultado.sancionesPendientes} sanción(es) por asignar.`);
        }

        if (resultado.sancionesIncorrectas > 0) {
            lineas.push(`• Tienes ${resultado.sancionesIncorrectas} sanción(es) incorrecta(s).`);
        }

        const texto = lineas.join('\n');
        const altura = 80 + (lineas.length * 28);

        this.avisoValidacionBg = this.add.rectangle(640, 575, 760, altura, 0x4a2a2a, 0.96);
        this.avisoValidacionBg.setDepth(180);
        this.avisoValidacionBg.setStrokeStyle(3, 0xd38b8b, 1);

        this.avisoValidacionTxt = this.add.text(640, 575, texto, {
            fontFamily: '"VT323", monospace',
            fontSize: '24px',
            color: '#fff1f1',
            align: 'center',
            wordWrap: { width: 700 }
        });
        this.avisoValidacionTxt.setOrigin(0.5);
        this.avisoValidacionTxt.setDepth(181);

        this.time.delayedCall(2600, () => {
            if (this.avisoValidacionBg) {
                this.avisoValidacionBg.destroy();
                this.avisoValidacionBg = null;
            }

            if (this.avisoValidacionTxt) {
                this.avisoValidacionTxt.destroy();
                this.avisoValidacionTxt = null;
            }
        });
    }

    mostrarModal() {
        this.cerrarModalZone.setInteractive({ cursor: 'pointer' });

        this.overlayModal.setVisible(true);
        this.marcoExterior.setVisible(true);
        this.barraTitulo.setVisible(true);
        this.lineaDecorativa1.setVisible(true);
        this.tituloModal.setVisible(true);
        this.cerrarModalBtn.setVisible(true);
        this.cerrarModalZone.setVisible(true);

        const elementos = [
            this.overlayModal,
            this.marcoExterior,
            this.barraTitulo,
            this.lineaDecorativa1,
            this.tituloModal,
            this.cerrarModalBtn
        ];

        elementos.forEach(el => el.setAlpha(0));

        this.tweens.add({
            targets: elementos,
            alpha: 1,
            duration: 180
        });
    }

    cerrarModal() {
        this._cerrarSelectorSancionesModal();
        this.limpiarContenidoModal();
        this.cerrarModalZone.disableInteractive();
        this._manualIndice = 0;

        const elementos = [
            this.overlayModal,
            this.marcoExterior,
            this.barraTitulo,
            this.lineaDecorativa1,
            this.tituloModal,
            this.cerrarModalBtn
        ];

        this.tweens.add({
            targets: elementos,
            alpha: 0,
            duration: 160,
            onComplete: () => {
                this.overlayModal.setVisible(false);
                this.marcoExterior.setVisible(false);
                this.barraTitulo.setVisible(false);
                this.lineaDecorativa1.setVisible(false);
                this.tituloModal.setVisible(false);
                this.cerrarModalBtn.setVisible(false);
                this.cerrarModalZone.setVisible(false);

                this.modalAbierto = false;
                this.activarInteractivosPrincipales();
            }
        });
    }

    finalizarDia() {
        this.yaTransicionando = true;
        this.desactivarInteractivosPrincipales();

        if (this.cerrarModalZone) {
            this.cerrarModalZone.disableInteractive();
        }

        const puntajeDia = this._calcularPuntajeDia();
        const siguienteEstado = this._obtenerEstadoSiguienteDespuesDelPuntaje();

        this.fadeOutMusica(() => {
            this.cameras.main.fadeOut(420, 0, 0, 0);

            this.time.delayedCall(420, () => {
                this.scene.start('PuntajeDia', {
                    puntajeDia,
                    siguienteEstado
                });
            });
        });
    }

    desactivarInteractivosPrincipales() {
        if (this.backZone) this.backZone.disableInteractive();
        if (this.hitboxBd) this.hitboxBd.disableInteractive();
        if (this.hitboxDenc) this.hitboxDenc.disableInteractive();
        if (this.hitboxMand) this.hitboxMand.disableInteractive();
        if (this.hitboxFind) this.hitboxFind.disableInteractive();

        if (this.hitboxDia1) this.hitboxDia1.disableInteractive();
        if (this.hitboxDia2) this.hitboxDia2.disableInteractive();
        if (this.hitboxDia3) this.hitboxDia3.disableInteractive();
        if (this.hitboxDia4) this.hitboxDia4.disableInteractive();
        if (this.hitboxDia5) this.hitboxDia5.disableInteractive();
        if (this.hitboxDia6) this.hitboxDia6.disableInteractive();
        if (this.hitboxDia7) this.hitboxDia7.disableInteractive();

        if (this.sliderZone) this.sliderZone.disableInteractive();
    }

    activarInteractivosPrincipales() {
        if (this.yaTransicionando) return;

        if (this.backZone) this.backZone.setInteractive({ cursor: 'pointer' });
        if (this.hitboxBd) this.hitboxBd.setInteractive({ cursor: 'pointer' });
        if (this.hitboxDenc) this.hitboxDenc.setInteractive({ cursor: 'pointer' });
        if (this.hitboxMand) this.hitboxMand.setInteractive({ cursor: 'pointer' });
        if (this.hitboxFind) this.hitboxFind.setInteractive({ cursor: 'pointer' });
        if (this.sliderZone) this.sliderZone.setInteractive({ cursor: 'pointer' });

        this.actualizarEstadoDias();
    }

    irAStart() {
        if (this.yaTransicionando) return;
        this.yaTransicionando = true;

        if (this.backZone) this.backZone.disableInteractive();
        if (this.sliderZone) this.sliderZone.disableInteractive();

        this.fadeOutMusica(() => {
            this.cameras.main.fadeOut(500, 0, 0, 0);

            this.time.delayedCall(500, () => {
                this.scene.start('Start');
            });
        });
    }

    detenerSonidos() {


        if (this.scrollResumenWheelHandlerDia6) {
            this.input.off('wheel', this.scrollResumenWheelHandlerDia6);
        }

        if (this.scrollResumenPointerMoveHandlerDia6) {
            this.input.off('pointermove', this.scrollResumenPointerMoveHandlerDia6);
        }

        if (this.scrollResumenPointerUpHandlerDia6) {
            this.input.off('pointerup', this.scrollResumenPointerUpHandlerDia6);
        }

        if (this.scrollResumenWheelHandlerDia7) {
            this.input.off('wheel', this.scrollResumenWheelHandlerDia7);
        }

        if (this.scrollResumenPointerMoveHandlerDia7) {
            this.input.off('pointermove', this.scrollResumenPointerMoveHandlerDia7);
        }

        if (this.scrollResumenPointerUpHandlerDia7) {
            this.input.off('pointerup', this.scrollResumenPointerUpHandlerDia7);
        }
        if (this.pointerMoveVolHandler) {
            this.input.off('pointermove', this.pointerMoveVolHandler);
        }

        if (this.pointerUpVolHandler) {
            this.input.off('pointerup', this.pointerUpVolHandler);
        }

        if (this.escHandler) {
            this.input.keyboard.off('keydown-ESC', this.escHandler);
        }

        if (this.wheelHandlerGlobal) {
            this.input.off('wheel', this.wheelHandlerGlobal);
        }

        this._destruirScrollState();

        if (this.sonidoVentana && this.sonidoVentana.isPlaying) {
            this.sonidoVentana.stop();
        }
    }

    // ─────────────────────────────────────────────────────────
    // Limpieza modal
    // ─────────────────────────────────────────────────────────
    limpiarContenidoModal() {
        this._destruirScrollState();
        this._cerrarSelectorSancionesModal();

        if (!this.elementosContenidoModal) return;
        this.elementosContenidoModal.forEach(el => {
            if (el && el.destroy) el.destroy();
        });
        this.elementosContenidoModal = [];
    }

    contarSancionesPendientes() {
        const delitos = this._deduplicarPersonajes(this.delitosEncontrados || []);

        let pendientes = 0;

        delitos.forEach(pj => {
            const sancion = this._obtenerSancionAsignada(pj);
            if (!sancion) {
                pendientes++;
            }
        });

        return pendientes;
    }

    tieneSancionesPendientes() {
        return this.contarSancionesPendientes() > 0;
    }

    // ─────────────────────────────────────────────────────────
    // Scroll
    // ─────────────────────────────────────────────────────────
    _crearAreaScrollable(x, y, width, height) {
        this._destruirScrollState();

        const container = this.add.container(0, 0);
        container.setDepth(109);

        const maskGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        maskGraphics.fillStyle(0xffffff, 1);
        maskGraphics.fillRect(x, y, width, height);

        const mask = maskGraphics.createGeometryMask();
        container.setMask(mask);

        const trackBg = this.add.rectangle(x + width + 20, y + height / 2, 10, height, 0x24407c, 1);
        trackBg.setDepth(114).setStrokeStyle(2, 0x7ea8ff, 1);

        const knob = this.add.rectangle(x + width + 20, y + 40, 18, 88, 0xdce8ff, 1);
        knob.setDepth(115).setStrokeStyle(2, 0xffffff, 1);
        knob.setInteractive({ cursor: 'pointer' });

        const trackZone = this.add.zone(x + width + 20, y + height / 2, 28, height).setDepth(116).setInteractive({ cursor: 'pointer' });

        const state = {
            x,
            y,
            width,
            height,
            container,
            maskGraphics,
            mask,
            trackBg,
            knob,
            trackZone,
            contentBottomY: y,
            offset: 0,
            maxScroll: 0,
            knobHeight: 88,
            dragging: false,
            dragOffsetY: 0,
            pointerMoveHandler: null,
            pointerUpHandler: null
        };

        knob.on('pointerdown', (pointer) => {
            if (state.maxScroll <= 0) return;
            state.dragging = true;
            state.dragOffsetY = pointer.y - state.knob.y;
        });

        trackZone.on('pointerdown', (pointer) => {
            if (state.maxScroll <= 0) return;
            const minY = state.y + state.knobHeight / 2;
            const maxY = state.y + state.height - state.knobHeight / 2;
            const yClamped = Phaser.Math.Clamp(pointer.y, minY, maxY);
            const ratio = (yClamped - minY) / Math.max(1, (maxY - minY));
            this._setScrollFromRatio(state, ratio);
        });

        state.pointerMoveHandler = (pointer) => {
            if (!state.dragging || state.maxScroll <= 0) return;

            const minY = state.y + state.knobHeight / 2;
            const maxY = state.y + state.height - state.knobHeight / 2;
            const targetY = Phaser.Math.Clamp(pointer.y - state.dragOffsetY, minY, maxY);
            const ratio = (targetY - minY) / Math.max(1, (maxY - minY));
            this._setScrollFromRatio(state, ratio);
        };

        state.pointerUpHandler = () => {
            state.dragging = false;
        };

        this.input.on('pointermove', state.pointerMoveHandler);
        this.input.on('pointerup', state.pointerUpHandler);

        if (this.wheelHandlerGlobal) {
            this.input.off('wheel', this.wheelHandlerGlobal);
        }

        this.wheelHandlerGlobal = (pointer, gameObjects, deltaX, deltaY) => {
            if (!this.modalAbierto || !this.scrollState) return;
            if (this._sancionesModalElements && this._sancionesModalElements.length) return;

            const s = this.scrollState;
            const dentroX = pointer.x >= s.x && pointer.x <= s.x + s.width + 40;
            const dentroY = pointer.y >= s.y && pointer.y <= s.y + s.height;

            if (!dentroX || !dentroY) return;
            this._desplazarScroll(s, deltaY * 0.9);
        };

        this.input.on('wheel', this.wheelHandlerGlobal);

        this.scrollState = state;
        this.elementosContenidoModal.push(container, trackBg, knob, trackZone);
        return state;
    }

    _finalizarAreaScrollable(contentBottomY, offsetAnterior = 0) {
        if (!this.scrollState) return;

        const state = this.scrollState;
        state.contentBottomY = contentBottomY;

        const contentHeight = Math.max(0, contentBottomY - state.y);
        state.maxScroll = Math.max(0, contentHeight - state.height);

        if (state.maxScroll <= 0) {
            state.offset = 0;
            state.container.y = 0;
            state.knob.y = state.y + state.knobHeight / 2;
            state.trackBg.setAlpha(0.25);
            state.knob.setAlpha(0.35);
            return;
        }

        state.trackBg.setAlpha(1);
        state.knob.setAlpha(1);

        state.offset = Phaser.Math.Clamp(offsetAnterior, 0, state.maxScroll);
        state.container.y = -state.offset;
        this._actualizarScrollVisual(state);
    }

    _actualizarScrollVisual(state) {
        if (!state) return;

        if (state.maxScroll <= 0) {
            state.knob.y = state.y + state.knobHeight / 2;
            return;
        }

        const minY = state.y + state.knobHeight / 2;
        const maxY = state.y + state.height - state.knobHeight / 2;
        const ratio = state.offset / state.maxScroll;
        state.knob.y = Phaser.Math.Linear(minY, maxY, ratio);
    }

    _setScrollFromRatio(state, ratio) {
        if (!state) return;

        ratio = Phaser.Math.Clamp(ratio, 0, 1);
        state.offset = ratio * state.maxScroll;
        state.container.y = -state.offset;
        this._actualizarScrollVisual(state);
    }

    _desplazarScroll(state, delta) {
        if (!state || state.maxScroll <= 0) return;

        state.offset = Phaser.Math.Clamp(state.offset + delta, 0, state.maxScroll);
        state.container.y = -state.offset;
        this._actualizarScrollVisual(state);
    }

    _destruirScrollState() {
        if (!this.scrollState) return;

        const state = this.scrollState;

        if (state.pointerMoveHandler) this.input.off('pointermove', state.pointerMoveHandler);
        if (state.pointerUpHandler) this.input.off('pointerup', state.pointerUpHandler);

        if (state.trackZone && state.trackZone.destroy) state.trackZone.destroy();
        if (state.knob && state.knob.destroy) state.knob.destroy();
        if (state.trackBg && state.trackBg.destroy) state.trackBg.destroy();
        if (state.container && state.container.destroy) state.container.destroy();
        if (state.maskGraphics && state.maskGraphics.destroy) state.maskGraphics.destroy();

        this.scrollState = null;
    }

    // ─────────────────────────────────────────────────────────
    // Estado buscador / sanciones
    // ─────────────────────────────────────────────────────────
    _obtenerDecisionDiaActual(pj) {
        return this.estadoBuscadorPorDia[this.diaActual]?.[this._obtenerIdPersonaje(pj)] || null;
    }

    _guardarDecisionDiaActual(pj, decision) {
        const id = this._obtenerIdPersonaje(pj);
        if (!this.estadoBuscadorPorDia[this.diaActual]) {
            this.estadoBuscadorPorDia[this.diaActual] = {};
        }
        this.estadoBuscadorPorDia[this.diaActual][id] = decision;
    }

    _marcarComoDelito(pj) {
        const id = this._obtenerIdPersonaje(pj);
        this._guardarDecisionDiaActual(pj, 'delito');

        const yaExiste = this.delitosEncontrados.some(x => this._obtenerIdPersonaje(x) === id);
        if (!yaExiste) {
            this.delitosEncontrados.push(pj);
        }

        this.delitosEncontrados = this._deduplicarPersonajes(this.delitosEncontrados);
    }

    _marcarComoLibre(pj) {
        const id = this._obtenerIdPersonaje(pj);
        this._guardarDecisionDiaActual(pj, 'libre');

        this.delitosEncontrados = this.delitosEncontrados.filter(x => this._obtenerIdPersonaje(x) !== id);
        delete this.sancionesAsignadas[id];
    }

    _getPersonajeStorageKey(pj) {
        return this._obtenerIdPersonaje(pj);
    }

    _obtenerSancionAsignada(pj) {
        const key = this._getPersonajeStorageKey(pj);
        return this.sancionesAsignadas[key] || null;
    }

    _asignarSancionTemporal(pj, sancion) {
        const key = this._getPersonajeStorageKey(pj);

        if (!sancion) {
            delete this.sancionesAsignadas[key];
            return;
        }

        this.sancionesAsignadas[key] = {
            nombre: sancion.nombre,
            descripcion: sancion.descripcion,
            consecuencia: sancion.consecuencia,
            ejemplo: sancion.ejemplo,
            queSignifica: sancion.queSignifica
        };
    }

    _esVistaDiaSoloLectura(filtrarDia) {
        return filtrarDia !== null && filtrarDia !== undefined;
    }

    _cerrarSelectorSancionesModal() {
        if (this._sancionesModalElements && this._sancionesModalElements.length) {
            this._sancionesModalElements.forEach(el => {
                if (el && el.destroy) el.destroy();
            });
        }
        this._sancionesModalElements = [];
    }

    _mostrarAvisoTemporal(texto, colorFondo = 0x173250, colorBorde = 0x4a7bd0) {
        const bg = this.add.rectangle(640, 590, 560, 56, colorFondo, 1).setDepth(160);
        bg.setStrokeStyle(2, colorBorde, 1);

        const txt = this.add.text(640, 590, texto, {
            fontFamily: '"VT323", monospace',
            fontSize: '24px',
            color: '#eef5ff',
            align: 'center',
            wordWrap: { width: 500 }
        }).setOrigin(0.5).setDepth(161);

        this.elementosContenidoModal.push(bg, txt);

        this.time.delayedCall(1000, () => {
            if (bg && bg.destroy) bg.destroy();
            if (txt && txt.destroy) txt.destroy();
        });
    }

    // ─────────────────────────────────────────────────────────
    // Buscador
    // ─────────────────────────────────────────────────────────
    mostrarContenidoBuscador() {
        const offsetAnterior = this.scrollState ? this.scrollState.offset : 0;
        this.limpiarContenidoModal();

        const personajes = this.personajesDia || [];
        if (!personajes.length) {
            const txt = this.add.text(640, 380, 'Sin datos para este día.', {
                fontFamily: '"VT323", monospace',
                fontSize: '28px',
                color: '#6a8aaa'
            });
            txt.setOrigin(0.5).setDepth(110);
            this.elementosContenidoModal.push(txt);
            return;
        }

        const infoTxt = this.add.text(640, 286, 'Clasifica cada caso como DELITO o LIBRE', {
            fontFamily: '"VT323", monospace',
            fontSize: '26px',
            color: '#dce8ff',
            stroke: '#09111f',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(110);

        const sep = this.add.rectangle(640, 322, 1020, 2, 0x4d7ad0, 0.95);
        sep.setDepth(108);

        this.elementosContenidoModal.push(infoTxt, sep);

        this._crearAreaScrollable(110, 342, 980, 258);

        let currentY = 356;
        personajes.forEach(pj => {
            currentY = this._crearTarjetaBuscador(pj, currentY);
        });

        this._finalizarAreaScrollable(currentY + 12, offsetAnterior);
    }



    // ─────────────────────────────────────────────────────────
    // Delitos encontrados
    // ─────────────────────────────────────────────────────────
    mostrarContenidoEncontrados(filtrarDia, soloLectura = false) {
        const offsetAnterior = this.scrollState ? this.scrollState.offset : 0;
        this.limpiarContenidoModal();

        let lista = this.delitosEncontrados || [];

        if (filtrarDia !== null && filtrarDia !== undefined) {
            lista = lista.filter(pj => pj.dia === filtrarDia);
        }

        lista = this._deduplicarPersonajes(lista);

        if (lista.length === 0) {
            const txt = this.add.text(640, 380, 'No hay delitos registrados para este día.', {
                fontFamily: '"VT323", monospace',
                fontSize: '28px',
                color: '#6a8aaa'
            });
            txt.setOrigin(0.5).setDepth(110);
            this.elementosContenidoModal.push(txt);
            return;
        }

        if (filtrarDia !== null && filtrarDia !== undefined) {
            this.tituloModal.setText(`Delitos encontrados - Día ${filtrarDia}`);
        } else {
            this.tituloModal.setText('Delitos encontrados');
        }

        const n = lista.length;
        const contTxt = this.add.text(
            640,
            276,
            `${n} delito${n !== 1 ? 's' : ''} registrado${n !== 1 ? 's' : ''}`, {
            fontFamily: '"VT323", monospace',
            fontSize: '28px',
            color: '#f0a9a9',
            stroke: '#09111f',
            strokeThickness: 3
        }
        );
        contTxt.setOrigin(0.5).setDepth(110);
        this.elementosContenidoModal.push(contTxt);

        const subtitulo = this.add.text(
            640,
            308,
            soloLectura
                ? `Mostrando únicamente los delitos del Día ${filtrarDia}`
                : `Mostrando únicamente los delitos del Día ${this.diaActual}`,
            {
                fontFamily: '"VT323", monospace',
                fontSize: '22px',
                color: '#dce8ff',
                stroke: '#09111f',
                strokeThickness: 2
            }
        );
        subtitulo.setOrigin(0.5).setDepth(110);
        this.elementosContenidoModal.push(subtitulo);

        const sep = this.add.rectangle(640, 336, 1020, 2, 0x7d3943, 0.9);
        sep.setDepth(108);
        this.elementosContenidoModal.push(sep);

        const scrollHeight = soloLectura ? 250 : 220;
        this._crearAreaScrollable(110, 356, 980, scrollHeight);

        let currentY = 370;
        lista.forEach(pj => {
            currentY = this._crearTarjetaEncontrado(pj, currentY, soloLectura);
        });

        this._finalizarAreaScrollable(currentY + 12, offsetAnterior);

        // SOLO mostrar botón confirmar cuando sea la vista editable del día actual
        if (!soloLectura) {
            const btnBg = this.add.rectangle(640, 612, 340, 56, 0x345593, 1);
            btnBg.setDepth(110).setStrokeStyle(2, 0xb5d0ff, 1);
            this.elementosContenidoModal.push(btnBg);

            const btnTxt = this.add.text(640, 612, 'Confirmar sanciones', {
                fontFamily: '"VT323", monospace',
                fontSize: '26px',
                color: '#eef5ff'
            }).setOrigin(0.5).setDepth(111);
            this.elementosContenidoModal.push(btnTxt);

            const btnZone = this.add.zone(640, 612, 340, 56)
                .setDepth(112)
                .setInteractive({ cursor: 'pointer' });

            btnZone.on('pointerover', () => btnBg.setFillStyle(0x4168b0, 1));
            btnZone.on('pointerout', () => btnBg.setFillStyle(0x345593, 1));
            btnZone.on('pointerdown', () => {
                this.reproducirClick();
                this._confirmarSanciones(lista, filtrarDia);
            });

            this.elementosContenidoModal.push(btnZone);
        }
    }
    _crearTarjetaEncontrado(pj, topY, soloLectura = false) {
        const container = this.scrollState.container;
        const sancionAsignada = this._obtenerSancionAsignada(pj);

        const textStyle = {
            fontFamily: '"VT323", monospace',
            fontSize: '21px',
            color: '#dbe6ff',
            wordWrap: { width: 390 },
            lineSpacing: 5
        };

        const medidor = this.add.text(-3000, -3000, pj.textoCaso, textStyle);
        const caseHeight = medidor.height;
        medidor.destroy();

        const cardHeight = Math.max(132, caseHeight + 54);
        const centerY = topY + cardHeight / 2;

        const filaBg = this.add.rectangle(600, centerY, 960, cardHeight, 0x160c18, 0.72);
        filaBg.setStrokeStyle(2, 0x6a2d3a, 1);

        const marco = this.add.rectangle(150, centerY, 82, 82, 0x351015, 1);
        marco.setStrokeStyle(2, 0xd85b68, 1);

        container.add([filaBg, marco]);

        const key = this._obtenerClaveAvatar(pj);
        if (this.textures.exists(key)) {
            const foto = this.add.image(150, centerY, key).setDisplaySize(74, 74);
            container.add(foto);
        } else {
            const placeholderBg = this.add.rectangle(150, centerY, 74, 74, 0x54202a, 1);
            const inicialTxt = this.add.text(150, centerY, pj.nombre.charAt(0).toUpperCase(), {
                fontFamily: '"VT323", monospace',
                fontSize: '34px',
                color: '#ffffff'
            }).setOrigin(0.5);
            container.add([placeholderBg, inicialTxt]);
        }

        const badge = this.add.rectangle(150, centerY + 38, 70, 18, 0xb12738, 1);
        const badgeTxt = this.add.text(150, centerY + 38, 'DELITO', {
            fontFamily: '"VT323", monospace',
            fontSize: '12px',
            color: '#ffffff'
        }).setOrigin(0.5);

        container.add([badge, badgeTxt]);

        const nomTxt = this.add.text(210, topY + 14, `${pj.nombre.trim()}  (Día ${pj.dia})`, {
            fontFamily: '"VT323", monospace',
            fontSize: '30px',
            color: '#ffb4bc'
        });

        const casoTxt = this.add.text(210, topY + 54, pj.textoCaso, textStyle);
        container.add([nomTxt, casoTxt]);

        const panelX = 850;
        const panelW = 250;
        const panelH = 66;

        const labelTxt = this.add.text(panelX, topY + 18, soloLectura ? 'Cargo asignado' : 'Asignar cargo', {
            fontFamily: '"VT323", monospace',
            fontSize: '20px',
            color: '#b8d0ff'
        }).setOrigin(0.5, 0);

        container.add(labelTxt);

        const cargoNombre = sancionAsignada ? sancionAsignada.nombre : 'Pendiente';

        const selectBg = this.add.rectangle(panelX, centerY + 12, panelW, panelH, 0x203559, 1);
        selectBg.setStrokeStyle(2, soloLectura ? 0x6e8ec5 : 0x7fa6eb, 1);

        const selectTxt = this.add.text(panelX, centerY + 12, cargoNombre, {
            fontFamily: '"VT323", monospace',
            fontSize: cargoNombre.length > 24 ? '18px' : '22px',
            color: cargoNombre === 'Pendiente' ? '#ffb2ba' : '#fff0f0',
            align: 'center',
            wordWrap: { width: 182 }
        }).setOrigin(0.5);

        container.add([selectBg, selectTxt]);

        if (!soloLectura) {
            const arrow = this.add.text(panelX + 104, centerY + 12, '▾', {
                fontFamily: '"VT323", monospace',
                fontSize: '20px',
                color: '#eef5ff'
            }).setOrigin(0.5);

            const zSelect = this.add.zone(panelX, centerY + 12, panelW, panelH)
                .setInteractive({ cursor: 'pointer' });

            zSelect.on('pointerover', () => {
                selectBg.setFillStyle(0x29456f, 1);
            });

            zSelect.on('pointerout', () => {
                selectBg.setFillStyle(0x203559, 1);
            });

            zSelect.on('pointerdown', () => {
                this.reproducirClick();
                this._abrirSelectorSancionesModal(pj, this.diaActual);
            });

            container.add([arrow, zSelect]);
        }

        return topY + cardHeight + 18;
    }

    _abrirSelectorSancionesModal(pj, filtrarDia) {
        this._cerrarSelectorSancionesModal();

        const opciones = Sanciones[pj.dia] || [];
        const seleccionActual = this._obtenerSancionAsignada(pj);

        const filasTotales = opciones.length + 2;
        const panelHeight = Math.max(360, 170 + filasTotales * 62);

        const cx = 640;
        const cy = 360;

        const closeZone = this.add.zone(640, 360, 1280, 720).setDepth(218).setInteractive();
        closeZone.on('pointerdown', () => {
            this._cerrarSelectorSancionesModal();
        });

        const shadow = this.add.rectangle(cx, cy, 1280, 720, 0x000000, 0.45).setDepth(219);

        const bg = this.add.rectangle(cx, cy, 860, panelHeight, 0x07142d, 0.985).setDepth(220);
        bg.setStrokeStyle(3, 0x6ea1ef, 1);

        const titleBar = this.add.rectangle(cx, cy - panelHeight / 2 + 46, 790, 58, 0x3b5794, 1).setDepth(221);
        titleBar.setStrokeStyle(2, 0xc4dbff, 1);

        const title = this.add.text(cx, cy - panelHeight / 2 + 46, `Seleccionar sanción - ${pj.nombre}`, {
            fontFamily: '"VT323", monospace',
            fontSize: '30px',
            color: '#eef6ff'
        }).setOrigin(0.5).setDepth(222);

        const subt = this.add.text(cx, cy - panelHeight / 2 + 86, 'Elige el cargo que quieres asignar a este personaje', {
            fontFamily: '"VT323", monospace',
            fontSize: '18px',
            color: '#b9d3ff'
        }).setOrigin(0.5).setDepth(222);

        this._sancionesModalElements = [closeZone, shadow, bg, titleBar, title, subt];

        const startY = cy - panelHeight / 2 + 150;
        const btnW = 680;
        const btnH = 50;
        const gap = 60;

        opciones.forEach((sancion, index) => {
            const y = startY + index * gap;
            const activa = seleccionActual && seleccionActual.nombre === sancion.nombre;

            const optBg = this.add.rectangle(cx, y, btnW, btnH, activa ? 0x4b6ea8 : 0x233e67, 1).setDepth(221);
            optBg.setStrokeStyle(2, activa ? 0xe3efff : 0x597fb9, 1);

            const optTxt = this.add.text(cx, y, sancion.nombre, {
                fontFamily: '"VT323", monospace',
                fontSize: '24px',
                color: '#eef5ff'
            }).setOrigin(0.5).setDepth(222);

            const optZone = this.add.zone(cx, y, btnW, btnH).setDepth(223).setInteractive({ cursor: 'pointer' });

            optZone.on('pointerover', () => {
                optBg.setFillStyle(0x335786, 1);
            });

            optZone.on('pointerout', () => {
                optBg.setFillStyle(activa ? 0x4b6ea8 : 0x233e67, 1);
            });

            optZone.on('pointerdown', () => {
                this.reproducirClick();
                this._asignarSancionTemporal(pj, sancion);
                this._cerrarSelectorSancionesModal();
                this.mostrarContenidoEncontrados(filtrarDia);
            });

            this._sancionesModalElements.push(optBg, optTxt, optZone);
        });

        const clearY = startY + opciones.length * gap;

        const clearBg = this.add.rectangle(cx, clearY, btnW, 46, 0x5d3d31, 1).setDepth(221);
        clearBg.setStrokeStyle(2, 0xa97e68, 1);

        const clearTxt = this.add.text(cx, clearY, 'Quitar sanción (Pendiente)', {
            fontFamily: '"VT323", monospace',
            fontSize: '22px',
            color: '#ffe8dc'
        }).setOrigin(0.5).setDepth(222);

        const clearZone = this.add.zone(cx, clearY, btnW, 46).setDepth(223).setInteractive({ cursor: 'pointer' });

        clearZone.on('pointerover', () => {
            clearBg.setFillStyle(0x724b3c, 1);
        });

        clearZone.on('pointerout', () => {
            clearBg.setFillStyle(0x5d3d31, 1);
        });

        clearZone.on('pointerdown', () => {
            this.reproducirClick();
            this._asignarSancionTemporal(pj, null);
            this._cerrarSelectorSancionesModal();
            this.mostrarContenidoEncontrados(filtrarDia);
        });

        const cancelY = clearY + 58;

        const cancelBg = this.add.rectangle(cx, cancelY, 260, 42, 0x2d3a5c, 1).setDepth(221);
        cancelBg.setStrokeStyle(2, 0x7f9ccc, 1);

        const cancelTxt = this.add.text(cx, cancelY, 'Cancelar', {
            fontFamily: '"VT323", monospace',
            fontSize: '22px',
            color: '#eef5ff'
        }).setOrigin(0.5).setDepth(222);

        const cancelZone = this.add.zone(cx, cancelY, 260, 42).setDepth(223).setInteractive({ cursor: 'pointer' });
        cancelZone.on('pointerover', () => {
            cancelBg.setFillStyle(0x394c77, 1);
        });
        cancelZone.on('pointerout', () => {
            cancelBg.setFillStyle(0x2d3a5c, 1);
        });
        cancelZone.on('pointerdown', () => {
            this.reproducirClick();
            this._cerrarSelectorSancionesModal();
        });

        this._sancionesModalElements.push(
            clearBg, clearTxt, clearZone,
            cancelBg, cancelTxt, cancelZone
        );
    }

    _confirmarSanciones(lista, filtrarDia) {
        if (!Array.isArray(lista) || !lista.length) return;

        let pendientes = 0;
        lista.forEach(pj => {
            if (!this._obtenerSancionAsignada(pj)) {
                pendientes++;
            }
        });

        if (pendientes > 0) {
            this._mostrarAvisoTemporal(
                `Faltan ${pendientes} cargo${pendientes !== 1 ? 's' : ''} por asignar`,
                0x4a2a2a,
                0xc97a7a
            );
            return;
        }

        this._mostrarAvisoTemporal(
            'Sanciones guardadas correctamente',
            0x173250,
            0x4a7bd0
        );

        this.time.delayedCall(450, () => {
            this.mostrarContenidoEncontrados(filtrarDia);
        });
    }

    // ─────────────────────────────────────────────────────────
    // Manual
    // ─────────────────────────────────────────────────────────
    mostrarContenidoManual() {
        this.limpiarContenidoModal();

        const sancionesDia = Sanciones[this.diaActual];
        if (!sancionesDia || !sancionesDia.length) {
            const txt = this.add.text(640, 380, 'Sin manual para este día.', {
                fontFamily: '"VT323", monospace',
                fontSize: '28px',
                color: '#6a8aaa'
            });
            txt.setOrigin(0.5).setDepth(110);
            this.elementosContenidoModal.push(txt);
            return;
        }

        const subtitulo = this.add.text(640, 292, 'Consulta las sanciones legales correspondientes a este día', {
            fontFamily: '"VT323", monospace',
            fontSize: '24px',
            color: '#dce8ff',
            stroke: '#09111f',
            strokeThickness: 3
        });
        subtitulo.setOrigin(0.5).setDepth(110);

        const linea1 = this.add.rectangle(640, 326, 1020, 2, 0x4d7ad0, 0.95);
        linea1.setDepth(108);

        this.elementosContenidoModal.push(subtitulo, linea1);

        // Área scroll más abajo para que no se monte con el subtítulo
        this._crearAreaScrollable(110, 348, 980, 252);

        let currentY = 366;
        sancionesDia.forEach((s, idx) => {
            currentY = this._crearTarjetaManual(s, idx, currentY);
        });

        // Siempre iniciar arriba
        this._finalizarAreaScrollable(currentY + 20, 0);
    }
    _crearTarjetaManual(s, idx, topY) {
        const container = this.scrollState.container;

        const labelTag = idx === 0 ? '[Principal]' : '[Secundaria]';

        const estiloTexto = {
            fontFamily: '"VT323", monospace',
            fontSize: '20px',
            color: '#d7e6ff',
            wordWrap: { width: 850 },
            lineSpacing: 6
        };

        const estiloEjemplo = {
            fontFamily: '"VT323", monospace',
            fontSize: '20px',
            color: '#d8f3d2',
            wordWrap: { width: 850 },
            lineSpacing: 6,
            fontStyle: 'italic'
        };

        const estiloLegal = {
            fontFamily: '"VT323", monospace',
            fontSize: '19px',
            color: '#d7e6ff',
            wordWrap: { width: 850 },
            lineSpacing: 6
        };

        // Medidas reales de texto para calcular una altura correcta
        const m1 = this.add.text(-3000, -3000, s.descripcion, estiloTexto);
        const m2 = this.add.text(-3000, -3000, s.consecuencia, estiloTexto);
        const m3 = this.add.text(-3000, -3000, s.ejemplo, estiloEjemplo);
        const m4 = this.add.text(-3000, -3000, s.queSignifica, estiloLegal);

        const h1 = m1.height;
        const h2 = m2.height;
        const h3 = m3.height;
        const h4 = m4.height;

        m1.destroy();
        m2.destroy();
        m3.destroy();
        m4.destroy();

        // Layout vertical exacto
        const yTag = topY + 20;
        const yTitulo = topY + 58;
        const yLinea = topY + 112;

        const yLabel1 = topY + 132;
        const yTxt1 = yLabel1 + 32;

        const yLabel2 = yTxt1 + h1 + 22;
        const yTxt2 = yLabel2 + 32;

        const yLabel3 = yTxt2 + h2 + 22;
        const yTxt3 = yLabel3 + 32;

        const yLabel4 = yTxt3 + h3 + 22;
        const yTxt4 = yLabel4 + 32;

        const bottomPadding = 30;
        const cardHeight = (yTxt4 + h4 + bottomPadding) - topY;
        const centerY = topY + cardHeight / 2;

        const bg = this.add.rectangle(600, centerY, 960, cardHeight, 0x0b1736, 0.82);
        bg.setStrokeStyle(2, 0x5078ca, 1);
        container.add(bg);

        const tagTxt = this.add.text(130, yTag, labelTag, {
            fontFamily: '"VT323", monospace',
            fontSize: '22px',
            color: idx === 0 ? '#ffd98a' : '#9fc4ff'
        });

        const nomTxt = this.add.text(130, yTitulo, s.nombre, {
            fontFamily: '"VT323", monospace',
            fontSize: '36px',
            color: '#ffffff',
            stroke: '#09111f',
            strokeThickness: 4
        });

        const lineaNom = this.add.rectangle(350, yLinea, 440, 2, 0x5e88de, 1);

        const label1 = this.add.text(130, yLabel1, 'Descripción:', {
            fontFamily: '"VT323", monospace',
            fontSize: '24px',
            color: '#8fc0ff'
        });

        const txt1 = this.add.text(130, yTxt1, s.descripcion, estiloTexto);

        const label2 = this.add.text(130, yLabel2, 'Consecuencia:', {
            fontFamily: '"VT323", monospace',
            fontSize: '24px',
            color: '#ffb184'
        });

        const txt2 = this.add.text(130, yTxt2, s.consecuencia, estiloTexto);

        const label3 = this.add.text(130, yLabel3, 'Ejemplo:', {
            fontFamily: '"VT323", monospace',
            fontSize: '24px',
            color: '#9fe39f'
        });

        const txt3 = this.add.text(130, yTxt3, s.ejemplo, estiloEjemplo);

        const label4 = this.add.text(130, yLabel4, '¿Qué dice la ley?', {
            fontFamily: '"VT323", monospace',
            fontSize: '24px',
            color: '#d4b8ff'
        });

        const txt4 = this.add.text(130, yTxt4, s.queSignifica, estiloLegal);

        container.add([
            tagTxt,
            nomTxt,
            lineaNom,
            label1,
            txt1,
            label2,
            txt2,
            label3,
            txt3,
            label4,
            txt4
        ]);

        return topY + cardHeight + 28;
    }
    // ─────────────────────────────────────────────────────────
    // Utilidades visuales
    // ─────────────────────────────────────────────────────────
    _generarAvataresFaltantes() {
        const COLORES = [
            0x4a90d9, 0xe05c5c, 0x5cb85c, 0xf0ad4e, 0x9b59b6,
            0x1abc9c, 0xe67e22, 0x2980b9, 0xc0392b, 0x27ae60
        ];

        Object.values(Dias).flat().forEach((pj, idx) => {
            if (!pj || !pj.nombre) return;

            const key = this._obtenerClaveAvatar(pj);
            if (this.textures.exists(key)) return;

            const SIZE = 64;
            const rt = this.add.renderTexture(0, 0, SIZE, SIZE);
            const g = this.add.graphics();
            const color = COLORES[idx % COLORES.length];

            g.fillStyle(color, 1);
            g.fillCircle(SIZE / 2, SIZE / 2, SIZE / 2);
            rt.draw(g, 0, 0);
            g.destroy();

            const inicial = pj.nombre.charAt(0).toUpperCase();
            const txt = this.add.text(SIZE / 2, SIZE / 2, inicial, {
                fontFamily: 'Arial, sans-serif',
                fontSize: '28px',
                fontStyle: 'bold',
                color: '#ffffff'
            }).setOrigin(0.5, 0.5);

            rt.draw(txt, 0, 0);
            txt.destroy();

            rt.saveTexture(key);
            rt.destroy();
        });
    }
}