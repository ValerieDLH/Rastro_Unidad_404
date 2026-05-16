import { Dias, vectorDelDia, arbolDias } from '../structures/Personajes.js';
import { Sanciones } from '../structures/Sanciones.js';
import { ArbolB } from '../structures/ArbolB.js';

export class Ventana1 extends Phaser.Scene {
    constructor() {
        super('Ventana1');
    }

    init(data) {
        data = data || {};

        this.diaActual = data.diaActual || 1;
        const volumenInicial = typeof data.volumenActual === 'number'
            ? data.volumenActual
            : 0.6;

        this.volumenActual = this._obtenerVolumenGlobal(volumenInicial);
        this.transicionEntrada = data.transicionEntrada || false;
        this.modoSoloFondo = data.modoSoloFondo || false;
        this.modoJuego = data.modoJuego || '1P';
        this.jugadores = typeof data.jugadores === 'number'
            ? data.jugadores
            : (this.modoJuego === '2P' ? 2 : 1);
        this.algoritmoGrafo = data.algoritmoGrafo;
        console.log("ALGORITMO RECIBIDO:", this.algoritmoGrafo);
        this.delitosEncontrados = Array.isArray(data.delitosEncontrados) ? data.delitosEncontrados : [];
        this.estadoBuscadorPorDia = data.estadoBuscadorPorDia || {};
        this.sancionesAsignadas = data.sancionesAsignadas || {};

        this.vidasDiaActual = typeof data.vidasDiaActual === 'number' ? data.vidasDiaActual : 4;
        this.penalizacionDia = typeof data.penalizacionDia === 'number' ? data.penalizacionDia : 0;

        if (this.diaActual >= 7) {
            this.diaActual = 7;
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
        this.modalContenidoTimer = null;
        this.modalRequestId = 0;
        this.confirmacionSancionesTimer = null;
        this.confirmacionSancionesCargando = false;
        this.modalCerrando = false;
        this.buscadorRecargaTimer = null;
        this.buscadorRecargando = false;


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

        this.iniciarRKVentanaDirecto();





        this.personajesDia = vectorDelDia(this.diaActual) || [];
        if (this.personajesDia.length > 0) {
            const arbol = new ArbolB(5);
            this.personajesDia.forEach(pj => arbol.insertar(pj));
            arbolDias[this.diaActual] = arbol;
        }

        this._generarAvataresFaltantes();
        this.delitosEncontrados = this._deduplicarPersonajes(this.delitosEncontrados);

        this.iniciarFadeInMusica();

        if (this.transicionEntrada) {
            this.reproducirTransicionEntrada();
        }
    }

    update() {
        this.actualizarRKVentanaDirecto();
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

        const volumenGuardado = this._obtenerVolumenGlobal(this.volumenActual);
        this.volumenActual = volumenGuardado;

        this.sonidoVentana.setVolume(0);

        this.tweens.add({
            targets: this.sonidoVentana,
            volume: this.volumenActual,
            duration: 850,
            ease: 'Sine.easeOut',
            onComplete: () => {
                if (this.sonidoVentana) {
                    this.sonidoVentana.setVolume(this.volumenActual);
                }
            }
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

        this._guardarVolumenGlobal(ratio);

        if (this.sonidoVentana) {
            this.tweens.killTweensOf(this.sonidoVentana);
            this.sonidoVentana.setVolume(this.volumenActual);
        }

        this.sliderFill.displayWidth = Math.max(4, this.sliderWidth * this.volumenActual);
        this.sliderGlow.displayWidth = Math.max(4, this.sliderWidth * this.volumenActual);
        this.sliderKnob.x = izquierda + this.sliderWidth * this.volumenActual;
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

    obtenerAlgoritmoGrafoPorDia() {

        if (this.diaActual === 1) {
            return 'BFS_DFS';
        }

        if (this.diaActual === 2) {
            return 'DIJKSTRA';
        }

        if (this.diaActual === 3) {
            return 'FORD';
        }

        if (this.diaActual === 4) {
            return 'PRIM';
        }

        if (this.diaActual === 5){
            return 'MASTER'
        };

    }

    _obtenerEstadoSiguienteDespuesDelPuntaje() {
        if (this.diaActual < 6) {
            return {
                diaActual: this.diaActual + 1,
                transicionEntrada: true,
                volumenActual: this.volumenActual,
                modoJuego: this.modoJuego,
                jugadores: this.jugadores,
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
            modoJuego: this.modoJuego,
            jugadores: this.jugadores,
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

    _cancelarCargaModalPendiente() {
        this.modalRequestId += 1;

        if (this.modalContenidoTimer) {
            this.modalContenidoTimer.remove(false);
            this.modalContenidoTimer = null;
        }

        if (this.buscadorRecargaTimer) {
            this.buscadorRecargaTimer.remove(false);
            this.buscadorRecargaTimer = null;
        }

        if (this.confirmacionSancionesTimer) {
            this.confirmacionSancionesTimer.remove(false);
            this.confirmacionSancionesTimer = null;
        }

        this.buscadorRecargando = false;
        this.confirmacionSancionesCargando = false;
    }

    abrirModalPrincipal(tipo) {
        if (this.modalAbierto || this.modalCerrando) return;

        this._cancelarCargaModalPendiente();

        this.modalTipoActual = tipo;
        this.rkConfirmarSanciones = null;
        this.rkItemsModal = [];
        this.rkIndiceModal = 0;
        this.rkOcultarFocoModal = false;

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

        const requestId = this.modalRequestId;

        this.modalContenidoTimer = this.time.delayedCall(180, () => {
            if (!this.modalAbierto) return;
            if (requestId !== this.modalRequestId) return;

            if (tipo === 'buscar') {
                this.mostrarContenidoBuscador();
            }

            if (tipo === 'encontrados') {
                this.mostrarContenidoEncontrados(this.diaActual, false);
            }

            if (tipo === 'manual') {
                this.mostrarContenidoManual();
            }

            this.modalContenidoTimer = null;
        });
    }

    _recargarBuscadorSeguro() {
        if (this.buscadorRecargando) return;

        this.buscadorRecargando = true;

        const requestId = this.modalRequestId;

        if (this.buscadorRecargaTimer) {
            this.buscadorRecargaTimer.remove(false);
            this.buscadorRecargaTimer = null;
        }

        this.buscadorRecargaTimer = this.time.delayedCall(60, () => {
            this.buscadorRecargaTimer = null;
            this.buscadorRecargando = false;

            if (!this.modalAbierto || this.modalCerrando) return;
            if (requestId !== this.modalRequestId) return;

            this.mostrarContenidoBuscador();
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

        const actualizarVisualDecision = () => {
            const nuevaDecision = this._obtenerDecisionDiaActual(pj);

            btnDelBg.setFillStyle(nuevaDecision === 'delito' ? 0x5b9947 : 0x3f6e34, 1);
            btnLibBg.setFillStyle(nuevaDecision === 'libre' ? 0x6b67bc : 0x474276, 1);

            statusTxt.setText(
                nuevaDecision === 'delito'
                    ? 'Marcado como delito'
                    : nuevaDecision === 'libre'
                        ? 'Marcado como libre'
                        : 'Sin clasificar'
            );

            statusTxt.setColor(nuevaDecision ? '#dfeaff' : '#a9badc');
        };

        const zDel = this.add.zone(855, btnY, 130, 46).setInteractive({ cursor: 'pointer' });
        zDel.on('pointerover', () => btnDelBg.setFillStyle(0x6caf55, 1));
        zDel.on('pointerout', () => {
            const decisionActual = this._obtenerDecisionDiaActual(pj);
            btnDelBg.setFillStyle(decisionActual === 'delito' ? 0x5b9947 : 0x3f6e34, 1);
        });
        zDel.on('pointerdown', () => {
            if (!this.modalAbierto || this.modalCerrando) return;

            this.reproducirClick();
            this._marcarComoDelito(pj);
            actualizarVisualDecision();
        });
        const zLib = this.add.zone(1010, btnY, 130, 46).setInteractive({ cursor: 'pointer' });
        zLib.on('pointerover', () => btnLibBg.setFillStyle(0x7a76d1, 1));
        zLib.on('pointerout', () => {
            const decisionActual = this._obtenerDecisionDiaActual(pj);
            btnLibBg.setFillStyle(decisionActual === 'libre' ? 0x6b67bc : 0x474276, 1);
        });
        zLib.on('pointerdown', () => {
            if (!this.modalAbierto || this.modalCerrando) return;

            this.reproducirClick();
            this._marcarComoLibre(pj);
            actualizarVisualDecision();
        });

        container.add([
            btnDelBg, btnDelTxt,
            btnLibBg, btnLibTxt,
            statusTxt,
            zDel, zLib
        ]);
        const filaRK = this._rkFilaBuscador || 0;

        this._registrarItemRKModal({
            nombre: `DELITO ${pj.nombre}`,
            x: 855,
            y: btnY,
            w: 130,
            h: 46,
            row: filaRK,
            col: 0,
            enScroll: true,
            cardTop: topY,
            cardBottom: topY + cardHeight,
            accion: () => {
                if (!this.modalAbierto || this.modalCerrando) return;

                this.reproducirClick();
                this._marcarComoDelito(pj);
                actualizarVisualDecision();
                this.actualizarFocoRKModal();
            }
        });

        this._registrarItemRKModal({
            nombre: `LIBRE ${pj.nombre}`,
            x: 1010,
            y: btnY,
            w: 130,
            h: 46,
            row: filaRK,
            col: 1,
            enScroll: true,
            cardTop: topY,
            cardBottom: topY + cardHeight,
            accion: () => {
                if (!this.modalAbierto || this.modalCerrando) return;

                this.reproducirClick();
                this._marcarComoLibre(pj);
                actualizarVisualDecision();
                this.actualizarFocoRKModal();
            }
        });

        return topY + cardHeight + 18;
    }


    abrirModalDia(numeroDia) {
        if (this.modalAbierto || this.modalCerrando) return;

        this._cancelarCargaModalPendiente();

        this.modalTipoActual = 'dia';
        this.rkConfirmarSanciones = null;
        this.rkItemsModal = [];
        this.rkIndiceModal = 0;
        this.rkOcultarFocoModal = false;

        this.modalAbierto = true;
        this.desactivarInteractivosPrincipales();

        this.tituloModal.setText(`Delitos encontrados - Día ${numeroDia}`);
        this.mostrarModal();

        const requestId = this.modalRequestId;

        this.modalContenidoTimer = this.time.delayedCall(180, () => {
            if (!this.modalAbierto) return;
            if (requestId !== this.modalRequestId) return;

            this.mostrarContenidoEncontrados(numeroDia, true);

            this.modalContenidoTimer = null;
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
        if (!this.modalAbierto || this.modalCerrando) return;

        this.modalCerrando = true;
        this.modalAbierto = false;
        this.modalTipoActual = null;
        this.rkConfirmarSanciones = null;
        this.rkItemsModal = [];
        this.rkIndiceModal = 0;

        if (this.rkFocoModal) {
            this.rkFocoModal.setVisible(false);
        }
        this.modalTipoActual = null;
        this.rkConfirmarSanciones = null;

        this._cancelarCargaModalPendiente();
        this._cerrarSelectorSancionesModal();
        this.limpiarContenidoModal();

        if (this.cerrarModalZone) {
            this.cerrarModalZone.disableInteractive();
        }

        this._manualIndice = 0;

        const elementos = [
            this.overlayModal,
            this.marcoExterior,
            this.barraTitulo,
            this.lineaDecorativa1,
            this.tituloModal,
            this.cerrarModalBtn
        ];

        this.tweens.killTweensOf(elementos);

        this.tweens.add({
            targets: elementos,
            alpha: 0,
            duration: 120,
            onComplete: () => {
                this.overlayModal.setVisible(false);
                this.marcoExterior.setVisible(false);
                this.barraTitulo.setVisible(false);
                this.lineaDecorativa1.setVisible(false);
                this.tituloModal.setVisible(false);
                this.cerrarModalBtn.setVisible(false);
                this.cerrarModalZone.setVisible(false);

                this.modalCerrando = false;
                this.activarInteractivosPrincipales();
            }
        });
    }

    

    _prepararCasosAtrapaEvidencia() {
        const personajes = this.personajesDia || [];

        console.log(
            "PERSONAJES DIA:",
            personajes
        );

        console.log(
            "CULPABLES:",
            personajes.filter(
                pj =>
                    pj.delito === true
            ).length
        );

        return personajes
            .filter(pj => pj && pj.delito === true && pj.sancion && pj.sancion !== 'NO TIENE')
            .slice(
                0,
                this.diaActual === 4
                || this.diaActual === 5

                    ? 5
                    : 3
            )
            .map(pj => {
                const sancionFinal = pj.sancion;
                const sancionCorta = this._obtenerSancionCorta(sancionFinal);

                return {
                    nombre: pj.nombre,

                    // Delito real
                    delito: sancionFinal.nombre,

                    // Sanción corta para el minijuego de letras
                    sancionCorta: sancionCorta,

                    // Sanción completa para la nota final
                    sancionTexto: sancionFinal.consecuencia || 'Sanción correspondiente.',

                    // Explicación clara para la nota final
                    significadoSancion: this._explicarSancionDelDia(sancionFinal)
                };
            });
    }

    _explicarSancionDelDia(sancion) {
        if (!sancion || !sancion.nombre) {
            return 'Es la consecuencia que corresponde al delito cometido.';
        }

        const nombre = sancion.nombre.toLowerCase();

        if (nombre.includes('injuria agravada')) {
            return 'Significa que hubo insultos o ataques a la honra de Valeria, pero con mayor daño porque se difundieron por redes, grupos o medios digitales.';
        }

        if (nombre.includes('injuria')) {
            return 'Significa que la persona atacó la dignidad o reputación de Valeria con insultos o frases humillantes, sin acusarla de un delito específico.';
        }

        if (nombre.includes('acoso reiterado')) {
            return 'Significa que la conducta se repitió varias veces. No fue un solo comentario, sino una insistencia que busca incomodar, perseguir o afectar a Valeria.';
        }

        if (nombre.includes('perturbación') || nombre.includes('perturbacion')) {
            return 'Significa que la persona alteró la tranquilidad de Valeria con burlas, reacciones o molestias repetidas, aunque no haya una amenaza grave.';
        }

        if (nombre.includes('hostigamiento')) {
            return 'Significa que varias acciones digitales buscan presionar, humillar, intimidar o aislar a Valeria dentro de internet.';
        }

        if (nombre.includes('calumnia')) {
            return 'Significa que alguien acusó falsamente a Valeria de cometer un hecho grave o un delito, como si fuera verdad.';
        }

        if (nombre.includes('difamación') || nombre.includes('difamacion')) {
            return 'Significa que se compartió información falsa, manipulada o sacada de contexto para dañar la imagen de Valeria.';
        }

        if (nombre.includes('reputación') || nombre.includes('reputacion')) {
            return 'Significa que se difundieron rumores o datos falsos que afectan el buen nombre de Valeria.';
        }

        if (nombre.includes('suplantación') || nombre.includes('suplantacion')) {
            return 'Significa que alguien usó la identidad, foto o nombre de Valeria para hacerse pasar por ella.';
        }

        if (nombre.includes('acceso no autorizado')) {
            return 'Significa que alguien entró sin permiso a una cuenta, celular, correo o plataforma de Valeria.';
        }

        if (nombre.includes('datos personales')) {
            return 'Significa que alguien usó, compartió o difundió información privada de Valeria sin autorización.';
        }

        if (nombre.includes('amenazas')) {
            return 'Significa que el mensaje buscaba causar miedo anunciando un daño contra Valeria o alguien cercano.';
        }

        if (nombre.includes('asociación') || nombre.includes('asociacion')) {
            return 'Significa que varias personas se organizaron con roles, horarios o tareas para cometer ciberacoso.';
        }

        return sancion.descripcion || 'Es la consecuencia que corresponde al delito cometido.';
    }


    _obtenerSignificadoSancionCorta(sancionCorta) {
        const texto = (sancionCorta || '').toLowerCase();

        if (texto.includes('multa y retractacion')) {
            return 'La persona debe pagar una multa y corregir publicamente lo que hizo.';
        }

        if (texto.includes('medida de proteccion')) {
            return 'Se protege a la victima y se limita el contacto o el daño.';
        }

        if (texto.includes('orden de cese')) {
            return 'La persona debe detener esa conducta de inmediato.';
        }

        if (texto.includes('restriccion digital')) {
            return 'Se limita su conducta o actividad en medios digitales.';
        }

        if (texto.includes('retractacion publica')) {
            return 'Debe desmentir publicamente la informacion falsa.';
        }

        if (texto.includes('eliminar contenido')) {
            return 'Debe borrar publicaciones, capturas o mensajes dañinos.';
        }

        if (texto.includes('reparacion del daño')) {
            return 'Debe corregir el daño causado a la victima.';
        }

        if (texto.includes('eliminar perfil falso')) {
            return 'Debe borrarse la cuenta falsa y parar la suplantacion.';
        }

        if (texto.includes('sancion informatica')) {
            return 'Recibe castigo por entrar a sistemas o cuentas sin permiso.';
        }

        if (texto.includes('proteccion de datos')) {
            return 'Se sanciona el uso o difusion de datos privados.';
        }

        if (texto.includes('sancion por organizacion')) {
            return 'Se sanciona la coordinacion de ataques o acoso en grupo.';
        }

        return 'Es la consecuencia que corresponde al delito cometido.';
    }

    _obtenerSancionCorta(sancion) {
        if (!sancion || !sancion.nombre) {
            return 'Sanción pendiente';
        }

        const nombre = sancion.nombre.toLowerCase();

        if (nombre.includes('injuria')) {
            return 'Multa y retractación';
        }

        if (nombre.includes('acoso reiterado')) {
            return 'Medida de protección';
        }

        if (nombre.includes('perturbación') || nombre.includes('perturbacion')) {
            return 'Orden de cese';
        }

        if (nombre.includes('hostigamiento')) {
            return 'Restricción digital';
        }

        if (nombre.includes('calumnia')) {
            return 'Retractación pública';
        }

        if (nombre.includes('difamación') || nombre.includes('difamacion')) {
            return 'Eliminar contenido';
        }

        if (nombre.includes('reputación') || nombre.includes('reputacion')) {
            return 'Reparación del daño';
        }

        if (nombre.includes('suplantación') || nombre.includes('suplantacion')) {
            return 'Eliminar perfil falso';
        }

        if (nombre.includes('acceso no autorizado')) {
            return 'Sanción informática';
        }

        if (nombre.includes('datos personales')) {
            return 'Protección de datos';
        }

        if (nombre.includes('amenazas')) {
            return 'Medida de protección';
        }

        if (nombre.includes('asociación') || nombre.includes('asociacion')) {
            return 'Sanción por organización';
        }

        return sancion.consecuencia
            ? sancion.consecuencia.split('.')[0]
            : 'Sanción correspondiente';
    }
    iniciarRKVentanaDirecto() {
        this.rkVentanaAnterior = {
            l1: false,
            r1: false,
            x: false,
            y: false,
            b: false,
            a: false,
            arriba: false,
            abajo: false,
            izquierda: false,
            derecha: false
        };

        this.rkItemsModal = [];
        this.rkIndiceModal = 0;
        this.rkSelectorItems = [];
        this.rkSelectorIndice = 0;
        this.rkOcultarFocoModal = false;

        this.rkFocoModal = this.add.rectangle(0, 0, 120, 60, 0x78a7ff, 0.10);
        this.rkFocoModal.setStrokeStyle(3, 0xffffff, 0.9);
        this.rkFocoModal.setDepth(260);
        this.rkFocoModal.setVisible(false);
    }

    actualizarRKVentanaDirecto(time) {
        if (this.yaTransicionando) return;

        const pad = this.obtenerPadRKVentana();
        if (!pad) {
            if (this.rkFocoModal) this.rkFocoModal.setVisible(false);
            return;
        }

        const estado = this.leerEstadoRKVentana(pad);

        const l1JustDown = estado.l1 && !this.rkVentanaAnterior.l1;
        const r1JustDown = estado.r1 && !this.rkVentanaAnterior.r1;
        const xJustDown = estado.x && !this.rkVentanaAnterior.x;
        const yJustDown = estado.y && !this.rkVentanaAnterior.y;
        const bJustDown = estado.b && !this.rkVentanaAnterior.b;
        const aJustDown = estado.a && !this.rkVentanaAnterior.a;

        const arribaJustDown = estado.arriba && !this.rkVentanaAnterior.arriba;
        const abajoJustDown = estado.abajo && !this.rkVentanaAnterior.abajo;
        const izquierdaJustDown = estado.izquierda && !this.rkVentanaAnterior.izquierda;
        const derechaJustDown = estado.derecha && !this.rkVentanaAnterior.derecha;

        if (l1JustDown) {
            this.accionRKBackVentana();
        }

        if (r1JustDown) {
            this.accionRKConfirmarVentana();

            this.rkVentanaAnterior = estado;
            return;
        }

        if (this.modalAbierto) {
            this.actualizarRKDentroDeModal({
                aJustDown,
                arribaJustDown,
                abajoJustDown,
                izquierdaJustDown,
                derechaJustDown,

                arriba: estado.arriba,
                abajo: estado.abajo,
                izquierda: estado.izquierda,
                derecha: estado.derecha
            });

            this.rkVentanaAnterior = estado;
            return;
        }

        if (xJustDown) {
            this.accionRKBuscadorVentana();
        }

        if (bJustDown) {
            this.accionRKDelitosEncontradosVentana();
        }

        if (yJustDown) {
            this.accionRKManualVentana();
        }

        this.rkVentanaAnterior = estado;
    }

    actualizarRKDentroDeModal(input) {
        if (this._sancionesModalElements && this._sancionesModalElements.length) {
            this.actualizarRKSelectorSanciones(input);
            return;
        }

        if (this.modalTipoActual === 'manual') {
            this.actualizarRKScrollManual(input);
            return;
        }

        if (!this.rkItemsModal || this.rkItemsModal.length === 0) {
            this.actualizarRKScrollManual(input);
            return;
        }

        const huboMovimientoRK =
            input.arribaJustDown ||
            input.abajoJustDown ||
            input.izquierdaJustDown ||
            input.derechaJustDown ||
            input.aJustDown;

        if (huboMovimientoRK) {
            this.rkOcultarFocoModal = false;
        }

        if (input.arribaJustDown) {
            this.moverRKModalVertical(-1);
        }

        if (input.abajoJustDown) {
            this.moverRKModalVertical(1);
        }

        if (input.izquierdaJustDown) {
            this.moverRKModalHorizontal(-1);
        }

        if (input.derechaJustDown) {
            this.moverRKModalHorizontal(1);
        }

        if (input.aJustDown) {
            const item = this.rkItemsModal[this.rkIndiceModal];

            if (item && typeof item.accion === 'function') {
                item.accion();
            }
        }

        this.actualizarFocoRKModal();
    }

    actualizarRKScrollManual(input) {
        if (!this.scrollState) return;

        const ahora = performance.now();

        if (!this.rkScrollManualCooldown) {
            this.rkScrollManualCooldown = 0;
        }

        const puedeMover = ahora >= this.rkScrollManualCooldown;

        if (!puedeMover) return;

        if (input.arriba) {
            this._desplazarScroll(this.scrollState, -28);
            this.rkScrollManualCooldown = ahora + 35;
        }

        if (input.abajo) {
            this._desplazarScroll(this.scrollState, 28);
            this.rkScrollManualCooldown = ahora + 35;
        }

        if (input.izquierda) {
            this._desplazarScroll(this.scrollState, -90);
            this.rkScrollManualCooldown = ahora + 55;
        }

        if (input.derecha) {
            this._desplazarScroll(this.scrollState, 90);
            this.rkScrollManualCooldown = ahora + 55;
        }

        if (this.rkFocoModal) {
            this.rkFocoModal.setVisible(false);
        }
    }

    actualizarRKSelectorSanciones(input) {
        if (!this.rkSelectorItems || this.rkSelectorItems.length === 0) return;

        if (input.arribaJustDown || input.izquierdaJustDown) {
            this.rkSelectorIndice = Phaser.Math.Wrap(
                this.rkSelectorIndice - 1,
                0,
                this.rkSelectorItems.length
            );
            this.reproducirClick();
        }

        if (input.abajoJustDown || input.derechaJustDown) {
            this.rkSelectorIndice = Phaser.Math.Wrap(
                this.rkSelectorIndice + 1,
                0,
                this.rkSelectorItems.length
            );
            this.reproducirClick();
        }

        if (input.aJustDown) {
            const item = this.rkSelectorItems[this.rkSelectorIndice];

            if (item && typeof item.accion === 'function') {
                item.accion();
            }

            return;
        }

        this.actualizarFocoRKSelector();
    }

    moverRKModalVertical(direccion) {
        if (!this.rkItemsModal || this.rkItemsModal.length === 0) return;

        const actual = this.rkItemsModal[this.rkIndiceModal];
        if (!actual) return;

        let candidatos = this.rkItemsModal.filter(item => {
            if (direccion < 0) return item.row < actual.row;
            return item.row > actual.row;
        });

        if (!candidatos.length) {
            this.rkIndiceModal = direccion < 0 ? this.rkItemsModal.length - 1 : 0;
            this.asegurarItemRKVisible(this.rkItemsModal[this.rkIndiceModal]);
            this.reproducirClick();
            this.actualizarFocoRKModal();
            return;
        }

        candidatos.sort((a, b) => {
            const distA = Math.abs(a.row - actual.row) * 1000 + Math.abs(a.col - actual.col);
            const distB = Math.abs(b.row - actual.row) * 1000 + Math.abs(b.col - actual.col);
            return distA - distB;
        });

        const elegido = candidatos[0];
        this.rkIndiceModal = this.rkItemsModal.indexOf(elegido);

        this.asegurarItemRKVisible(elegido);
        this.reproducirClick();
        this.actualizarFocoRKModal();
    }

    moverRKModalHorizontal(direccion) {
        if (!this.rkItemsModal || this.rkItemsModal.length === 0) return;

        const actual = this.rkItemsModal[this.rkIndiceModal];
        if (!actual) return;

        let candidatos = this.rkItemsModal.filter(item => {
            if (item.row !== actual.row) return false;
            if (direccion < 0) return item.col < actual.col;
            return item.col > actual.col;
        });

        if (!candidatos.length) return;

        candidatos.sort((a, b) => {
            return Math.abs(a.col - actual.col) - Math.abs(b.col - actual.col);
        });

        const elegido = candidatos[0];
        this.rkIndiceModal = this.rkItemsModal.indexOf(elegido);

        this.asegurarItemRKVisible(elegido);
        this.reproducirClick();
        this.actualizarFocoRKModal();
    }

    actualizarFocoRKModal() {
        if (!this.rkFocoModal) return;

        if (this.rkOcultarFocoModal) {
            this.rkFocoModal.setVisible(false);
            return;
        }

        if (!this.rkItemsModal || this.rkItemsModal.length === 0) {
            this.rkFocoModal.setVisible(false);
            return;
        }

        const item = this.rkItemsModal[this.rkIndiceModal];
        if (!item) {
            this.rkFocoModal.setVisible(false);
            return;
        }

        let yPantalla = item.y;

        if (item.enScroll && this.scrollState) {
            yPantalla = item.y - this.scrollState.offset;
        }

        this.rkFocoModal.setVisible(true);
        this.rkFocoModal.setDepth(260);
        this.rkFocoModal.setPosition(item.x, yPantalla);
        this.rkFocoModal.setDisplaySize(item.w + 18, item.h + 18);
    }

    actualizarFocoRKSelector() {
        if (!this.rkFocoModal) return;
        if (!this.rkSelectorItems || this.rkSelectorItems.length === 0) {
            this.rkFocoModal.setVisible(false);
            return;
        }

        const item = this.rkSelectorItems[this.rkSelectorIndice];
        if (!item) {
            this.rkFocoModal.setVisible(false);
            return;
        }

        this.rkFocoModal.setVisible(true);
        this.rkFocoModal.setDepth(260);
        this.rkFocoModal.setPosition(item.x, item.y);
        this.rkFocoModal.setDisplaySize(item.w + 18, item.h + 18);
    }


    accionRKBackVentana() {
        if (this._sancionesModalElements && this._sancionesModalElements.length) {
            this.reproducirClick();
            this._cerrarSelectorSancionesModal();
            return;
        }

        if (this.modalAbierto) {
            this.reproducirClick();
            this.cerrarModal();
            return;
        }

        this.reproducirClick();
        this.irAStart();
    }

    accionRKConfirmarVentana() {
        if (this._sancionesModalElements && this._sancionesModalElements.length) {
            return;
        }

        if (this.modalAbierto) {
            if (
                this.modalTipoActual === 'encontrados' &&
                this.rkConfirmarSanciones &&
                Array.isArray(this.rkConfirmarSanciones.lista)
            ) {
                this.reproducirClick();

                this.rkOcultarFocoModal = true;

                if (this.rkFocoModal) {
                    this.rkFocoModal.setVisible(false);
                }

                this._confirmarSanciones(
                    this.rkConfirmarSanciones.lista,
                    this.rkConfirmarSanciones.filtrarDia
                );

                this.rkOcultarFocoModal = true;

                if (this.rkFocoModal) {
                    this.rkFocoModal.setVisible(false);
                }
            }

            return;
        }

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
    }

    accionRKBuscadorVentana() {
        if (this.modalAbierto || this.modalCerrando) return;

        this.reproducirClick();
        this.abrirModalPrincipal('buscar');
    }

    accionRKDelitosEncontradosVentana() {
        if (this.modalAbierto || this.modalCerrando) return;

        this.reproducirClick();
        this.abrirModalPrincipal('encontrados');
    }

    accionRKManualVentana() {
        if (this.modalAbierto || this.modalCerrando) return;

        this.reproducirClick();
        this.abrirModalPrincipal('manual');
    }

    _registrarItemRKModal(config) {
        if (!Array.isArray(this.rkItemsModal)) {
            this.rkItemsModal = [];
        }

        const h = typeof config.h === 'number' ? config.h : 50;

        this.rkItemsModal.push({
            nombre: config.nombre || '',
            x: config.x,
            y: config.y,
            w: config.w,
            h: h,
            row: typeof config.row === 'number' ? config.row : this.rkItemsModal.length,
            col: typeof config.col === 'number' ? config.col : 0,
            enScroll: config.enScroll === true,

            // sirve para que el RK haga scroll pensando en toda la tarjeta,
            // no solamente en el botón DELITO/LIBRE o selector.
            cardTop: typeof config.cardTop === 'number'
                ? config.cardTop
                : config.y - h / 2,

            cardBottom: typeof config.cardBottom === 'number'
                ? config.cardBottom
                : config.y + h / 2,

            accion: config.accion
        });

        this.rkIndiceModal = Phaser.Math.Clamp(
            this.rkIndiceModal || 0,
            0,
            Math.max(0, this.rkItemsModal.length - 1)
        );

        this.actualizarFocoRKModal();
    }
    asegurarItemRKVisible(item) {
        if (!item || !item.enScroll || !this.scrollState) return;

        const s = this.scrollState;
        const margen = 18;

        const cardTop = typeof item.cardTop === 'number'
            ? item.cardTop - margen
            : item.y - item.h / 2 - margen;

        const cardBottom = typeof item.cardBottom === 'number'
            ? item.cardBottom + margen
            : item.y + item.h / 2 + margen;

        const cardHeight = cardBottom - cardTop;

        const visibleTop = s.y + s.offset;
        const visibleBottom = s.y + s.height + s.offset;

        let nuevoOffset = s.offset;

        if (this.modalTipoActual === 'encontrados' || this.modalTipoActual === 'dia') {
            nuevoOffset = cardTop - s.y;
        } else if (cardHeight <= s.height) {
            if (cardTop < visibleTop) {
                nuevoOffset = cardTop - s.y;
            }

            if (cardBottom > visibleBottom) {
                nuevoOffset = cardBottom - s.y - s.height;
            }
        } else {
            nuevoOffset = cardTop - s.y;
        }

        nuevoOffset = Phaser.Math.Clamp(nuevoOffset, 0, s.maxScroll);

        s.offset = nuevoOffset;
        s.container.y = -s.offset;
        this._actualizarScrollVisual(s);
    }

    _registrarItemRKSelector(config) {
        if (!Array.isArray(this.rkSelectorItems)) {
            this.rkSelectorItems = [];
        }

        this.rkSelectorItems.push({
            nombre: config.nombre || '',
            x: config.x,
            y: config.y,
            w: config.w,
            h: config.h,
            accion: config.accion
        });

        this.rkSelectorIndice = Phaser.Math.Clamp(
            this.rkSelectorIndice || 0,
            0,
            Math.max(0, this.rkSelectorItems.length - 1)
        );

        this.actualizarFocoRKSelector();
    }

    obtenerPadRKVentana() {
        if (!this.input.gamepad) return null;

        if (typeof this.input.gamepad.getPad === 'function') {
            return this.input.gamepad.getPad(0);
        }

        if (this.input.gamepad.gamepads) {
            return this.input.gamepad.gamepads[0] || null;
        }

        return null;
    }

    leerEstadoRKVentana(pad) {
        const ejeX = this.leerEjeRKVentana(pad, 0);
        const ejeY = this.leerEjeRKVentana(pad, 1);

        return {
            l1: this.botonRKVentana(pad, 6),
            r1: this.botonRKVentana(pad, 7),
            a: this.botonARKVentana(pad),

            x: this.botonXRKVentana(pad),
            y: this.botonRKVentana(pad, 4),
            b: this.botonRKVentana(pad, 1),

            izquierda: ejeX < -0.45 || this.botonRKVentana(pad, 14),
            derecha: ejeX > 0.45 || this.botonRKVentana(pad, 15),
            arriba: ejeY < -0.45 || this.botonRKVentana(pad, 12),
            abajo: ejeY > 0.45 || this.botonRKVentana(pad, 13)
        };
    }

    leerEjeRKVentana(pad, index) {
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

    botonRKVentana(pad, index) {
        if (!pad || !pad.buttons || !pad.buttons[index]) return false;

        const boton = pad.buttons[index];
        const valor = typeof boton.value === 'number' ? boton.value : 0;

        return boton.pressed === true || valor > 0.35;
    }

    botonXRKVentana(pad) {
        return (
            this.botonRKVentana(pad, 2) ||
            this.botonRKVentana(pad, 3)
        );
    }

    botonARKVentana(pad) {
        return (
            this.botonRKVentana(pad, 0) ||
            this.botonRKVentana(pad, 5) ||
            this.botonRKVentana(pad, 8)
        );
    }

    restaurarFocoDespuesSelector() {
        if (!Array.isArray(this.rkItemsModal) || this.rkItemsModal.length === 0) return;

        const filaObjetivo = typeof this.rkFilaAntesSelector === 'number'
            ? this.rkFilaAntesSelector
            : 0;

        let indice = this.rkItemsModal.findIndex(item => item.row === filaObjetivo);

        if (indice < 0) {
            indice = Phaser.Math.Clamp(
                this.rkIndiceAntesSelector || 0,
                0,
                this.rkItemsModal.length - 1
            );
        }

        this.rkIndiceModal = indice;

        const item = this.rkItemsModal[this.rkIndiceModal];

        if (item) {
            this.asegurarItemRKVisible(item);
            this.actualizarFocoRKModal();
        }
    }

    finalizarDia() {
        this.yaTransicionando = true;
        this.desactivarInteractivosPrincipales();

        if (this.cerrarModalZone) {
            this.cerrarModalZone.disableInteractive();
        }

        const puntajeDia = this._calcularPuntajeDia();
        const siguienteEstado = this._obtenerEstadoSiguienteDespuesDelPuntaje();

        let algoritmoActual = 'BFS';

        if (this.diaActual === 2) {
            algoritmoActual = 'DIJKSTRA';
        }

        if (this.diaActual === 3) {
            algoritmoActual = 'FORD'
        }

        if (this.diaActual === 4){
            algoritmoActual = 'PRIM'
        }

        const casosDelDia = 
            (this.delitosEncontrados || []).filter(pj => {
                return pj && pj.dia === this.diaActual;
            });

        this.fadeOutMusica(() => {
            this.cameras.main.fadeOut(420, 0, 0, 0);

            this.time.delayedCall(420, () => {
                if (this.diaActual === 1) {
                    console.log("ENTRANDO A ATRAPA EVIDENCIA"),
                    this.scene.start('AtrapaEvidencia', {
                        puntajeDia,
                        siguienteEstado,
                        casos: this._prepararCasosAtrapaEvidencia(),
                        volumenActual: this.volumenActual,
                        modoJuego: this.modoJuego,
                        jugadores: this.jugadores
                    });
                    return;
                }
                if (this.diaActual === 2) {
                    this.scene.start('DetenCadena', {
                        puntajeDia,
                        siguienteEstado,
                        casos: this._prepararCasosAtrapaEvidencia(),
                        volumenActual: this.volumenActual,
                        modoJuego: this.modoJuego,
                        jugadores: this.jugadores
                    });
                    return;
                }
                if (this.diaActual === 3) {
                    this.scene.start('CazaRumores', {
                        puntajeDia,
                        siguienteEstado,
                        casos: this._prepararCasosAtrapaEvidencia(),
                        volumenActual: this.volumenActual,
                        modoJuego: this.modoJuego,
                        jugadores: this.jugadores
                    });
                    return;
                }
                if (this.diaActual === 4) {
                    this.scene.start('MemoriaPistas', {
                        puntajeDia,
                        siguienteEstado,
                        casos: this._prepararCasosAtrapaEvidencia(),
                        volumenActual: this.volumenActual,
                        modoJuego: this.modoJuego,
                        jugadores: this.jugadores
                    });
                    return;
                }
                if (this.diaActual === 5) {
                    this.scene.start('LaberintoDigital', {
                        puntajeDia,
                        siguienteEstado,
                        casos: this._prepararCasosAtrapaEvidencia(),
                        volumenActual: this.volumenActual,
                        modoJuego: this.modoJuego,
                        jugadores: this.jugadores
                    });
                    return;
                }
                this.scene.start('PuntajeDia', {
                    puntajeDia,
                    siguienteEstado,
                    modoJuego: this.modoJuego,
                    jugadores: this.jugadores,
                    casosDia: casosDelDia,
                    algoritmoGrafo: this.obtenerAlgoritmoGrafoPorDia()
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
                this.scene.start('Start', {
                    volumenActual: this.volumenActual
                });
            });
        });
    }

    detenerSonidos() {
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
        this.rkItemsModal = [];
        this.rkIndiceModal = 0;


        if (this.rkFocoModal) {
            this.rkFocoModal.setVisible(false);
        }

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
        this.rkSelectorItems = [];
        this.rkSelectorIndice = 0;

        if (this.rkFocoModal) {
            this.rkFocoModal.setVisible(false);
        }
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
        if (!this.modalAbierto || this.modalCerrando) return;

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
        personajes.forEach((pj, index) => {
            this._rkFilaBuscador = index;
            currentY = this._crearTarjetaBuscador(pj, currentY);
        });

        this._finalizarAreaScrollable(currentY + 12, offsetAnterior);
    }



    // ─────────────────────────────────────────────────────────
    // Delitos encontrados
    // ─────────────────────────────────────────────────────────
    mostrarContenidoEncontrados(filtrarDia, soloLectura = false) {
        if (!this.modalAbierto || this.modalCerrando) return;

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

        const scrollHeight = soloLectura ? 270 : 250;
        this._crearAreaScrollable(110, 356, 980, scrollHeight);

        let currentY = 370;
        lista.forEach((pj, index) => {
            this._rkFilaEncontrado = index;
            currentY = this._crearTarjetaEncontrado(pj, currentY, soloLectura);
        });

        this._finalizarAreaScrollable(currentY + 12, offsetAnterior);

    }


    _crearTarjetaEncontrado(pj, topY, soloLectura = false) {
        const container = this.scrollState.container;
        const sancionAsignada = this._obtenerSancionAsignada(pj);

        const textStyle = {
            fontFamily: '"VT323", monospace',
            fontSize: '19px',
            color: '#dbe6ff',
            wordWrap: { width: 520, useAdvancedWrap: true },
            lineSpacing: 3
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

        const panelX = 920;
        const panelW = 220;
        const panelH = 62;

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
            wordWrap: { width: 165, useAdvancedWrap: true }
        }).setOrigin(0.5);

        container.add([selectBg, selectTxt]);

        if (!soloLectura) {
            const arrow = this.add.text(panelX + 92, centerY + 12, '▾', {
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

                this.rkFilaAntesSelector = this._rkFilaEncontrado || 0;
                this.rkIndiceAntesSelector = this.rkIndiceModal || 0;

                this._abrirSelectorSancionesModal(pj, this.diaActual);
            });

            const filaRK = this._rkFilaEncontrado || 0;

            this._registrarItemRKModal({
                nombre: `Asignar cargo ${pj.nombre}`,
                x: panelX,
                y: centerY + 12,
                w: panelW,
                h: panelH,
                row: filaRK,
                col: 0,
                enScroll: true,
                cardTop: topY,
                cardBottom: topY + cardHeight,
                accion: () => {
                    if (!this.modalAbierto || this.modalCerrando) return;

                    this.reproducirClick();

                    this.rkFilaAntesSelector = filaRK;
                    this.rkIndiceAntesSelector = this.rkIndiceModal || 0;

                    this._abrirSelectorSancionesModal(pj, this.diaActual);
                }
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

        this.rkSelectorItems = [];
        this.rkSelectorIndice = 0;

        if (this.rkFocoModal) {
            this.rkFocoModal.setVisible(false);
        }

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

            const seleccionarSancion = () => {
                this.reproducirClick();
                this._asignarSancionTemporal(pj, sancion);
                this._cerrarSelectorSancionesModal();
                this.mostrarContenidoEncontrados(filtrarDia);
                this.restaurarFocoDespuesSelector();
            };

            optZone.on('pointerdown', seleccionarSancion);

            this._registrarItemRKSelector({
                nombre: sancion.nombre,
                x: cx,
                y,
                w: btnW,
                h: btnH,
                accion: seleccionarSancion
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

        const quitarSancion = () => {
            this.reproducirClick();
            this._asignarSancionTemporal(pj, null);
            this._cerrarSelectorSancionesModal();
            this.mostrarContenidoEncontrados(filtrarDia);
            this.restaurarFocoDespuesSelector();
        };

        clearZone.on('pointerdown', quitarSancion);

        this._registrarItemRKSelector({
            nombre: 'Quitar sanción',
            x: cx,
            y: clearY,
            w: btnW,
            h: 46,
            accion: quitarSancion
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

        const cancelarSelector = () => {
            this.reproducirClick();
            this._cerrarSelectorSancionesModal();
            this.restaurarFocoDespuesSelector();
        };

        cancelZone.on('pointerdown', cancelarSelector);

        this._registrarItemRKSelector({
            nombre: 'Cancelar',
            x: cx,
            y: cancelY,
            w: 260,
            h: 42,
            accion: cancelarSelector
        });

        this._sancionesModalElements.push(
            clearBg, clearTxt, clearZone,
            cancelBg, cancelTxt, cancelZone
        );

        this.actualizarFocoRKSelector();
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

        this.confirmacionSancionesCargando = false;

        if (this.confirmacionSancionesTimer) {
            this.confirmacionSancionesTimer.remove(false);
            this.confirmacionSancionesTimer = null;
        }

        this._cerrarSelectorSancionesModal();

        if (!this.modalAbierto) return;

        this.mostrarContenidoEncontrados(filtrarDia, false);

        this._mostrarAvisoTemporal(
            'Sanciones guardadas correctamente',
            0x173250,
            0x4a7bd0
        );

        if (this.rkFocoModal) {
            this.rkFocoModal.setVisible(false);
        }

        if (this.cerrarModalZone && this.modalAbierto) {
            this.cerrarModalZone.setInteractive({ cursor: 'pointer' });
        }
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