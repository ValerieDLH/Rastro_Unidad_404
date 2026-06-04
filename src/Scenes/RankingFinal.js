export class RankingFinal extends Phaser.Scene {

    constructor() {
        super('RankingFinal');
    }

    init(data = {}) {
        this.puntajeFinal =
            typeof data.puntajeFinal === 'number'
                ? data.puntajeFinal
                : (data.puntajeDia?.total || 0);

        this.puntajeDia = data.puntajeDia || {};
        this.siguienteEstado = data.siguienteEstado || {};

        this.modoJuego = data.modoJuego || '1P';

        this.jugadores =
            typeof data.jugadores === 'number'
                ? data.jugadores
                : (this.modoJuego === '2P' ? 2 : 1);

        this.volumenActual =
            typeof data.volumenActual === 'number'
                ? data.volumenActual
                : 0.6;

        this.maxCaracteres = 12;

        this.nombreJ1 = '';
        this.nombreJ2 = '';

        this.campoActivoTeclado = 1;

        this.localStorageKey = 'ranking_final_overlord_rising';

        this.layoutTeclado = [
            ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
            ['H', 'I', 'J', 'K', 'L', 'M', 'N'],
            ['O', 'P', 'Q', 'R', 'S', 'T', 'U'],
            ['V', 'W', 'X', 'Y', 'Z', 'Ñ', '⌫'],
            ['ESP', 'BORRAR', 'OK']
        ];

        this.cursorJ1 = { row: 0, col: 0 };
        this.cursorJ2 = { row: 0, col: 0 };

        this.prevPadStates = {};
        this.records = [];

        this.messageTimer = null;

        this.rankingScroll = null;
        this.recordsContainer = null;
        this.rankingMask = null;

        this.rankingPointerMoveHandler = null;
        this.rankingPointerUpHandler = null;
        this.rankingWheelHandler = null;

        this.keydownHandler = null;

        this.puntajeYaGuardado = false;
    }

    create() {
        this._cargarRanking();

        this._crearFondo();
        this._crearHeader();
        this._crearPanelJugadores();
        this._crearPanelRanking();
        this._crearTecladoVirtual();
        this._crearControlesInferiores();

        this._configurarTecladoFisico();
        this._iniciarGamepads();

        this._actualizarCamposTexto();
        this._renderizarRanking();
        this._actualizarFocosTeclado();

        this.events.once('shutdown', this._limpiarEventos, this);
        this.events.once('destroy', this._limpiarEventos, this);
    }

    update() {
        this._actualizarMandos();
    }

    // ─────────────────────────────────────────────────────────
    // FONDO
    // ─────────────────────────────────────────────────────────

    _crearFondo() {
        const W = 1280;
        const H = 720;

        this.add.rectangle(W / 2, H / 2, W, H, 0x020c1e, 1).setDepth(0);

        for (let i = 0; i < 8; i++) {
            const alpha = 0.03 + i * 0.01;
            this.add.rectangle(W / 2, H / 2, W, H - i * 30, 0x0a2150, alpha).setDepth(0);
        }

        const graphics = this.add.graphics().setDepth(0).setAlpha(0.06);
        graphics.lineStyle(1, 0x4488ff, 1);

        for (let x = 0; x < W; x += 80) {
            graphics.moveTo(x, 0);
            graphics.lineTo(x, H);
        }

        for (let y = 0; y < H; y += 80) {
            graphics.moveTo(0, y);
            graphics.lineTo(W, y);
        }

        graphics.strokePath();

        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, W);
            const y = Phaser.Math.Between(0, H);
            const r = Phaser.Math.FloatBetween(0.5, 1.8);
            const a = Phaser.Math.FloatBetween(0.1, 0.5);

            const star = this.add.circle(x, y, r, 0xffffff, a).setDepth(0);

            this.tweens.add({
                targets: star,
                alpha: Phaser.Math.FloatBetween(0.02, 0.15),
                duration: Phaser.Math.Between(1200, 3500),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                delay: Phaser.Math.Between(0, 2000)
            });
        }

        const lineaTop = this.add.graphics().setDepth(1);
        lineaTop.lineStyle(2, 0x3366cc, 0.6);
        lineaTop.moveTo(40, 118);
        lineaTop.lineTo(W - 40, 118);
        lineaTop.strokePath();

        const lineaBot = this.add.graphics().setDepth(1);
        lineaBot.lineStyle(2, 0x3366cc, 0.4);
        lineaBot.moveTo(40, H - 46);
        lineaBot.lineTo(W - 46, H - 46);
        lineaBot.strokePath();

        this._dibujarEsquina(40, 40, 24, 0x4488ff, 0.7);
        this._dibujarEsquina(W - 40, 40, 24, 0x4488ff, 0.7, true, false);
        this._dibujarEsquina(40, H - 40, 24, 0x4488ff, 0.5, false, true);
        this._dibujarEsquina(W - 40, H - 40, 24, 0x4488ff, 0.5, true, true);
    }

    _dibujarEsquina(x, y, size, color, alpha, flipX = false, flipY = false) {
        const g = this.add.graphics().setDepth(1).setAlpha(alpha);
        g.lineStyle(2, color, 1);

        const dx = flipX ? -size : size;
        const dy = flipY ? -size : size;

        g.moveTo(x, y + dy);
        g.lineTo(x, y);
        g.lineTo(x + dx, y);
        g.strokePath();
    }

    // ─────────────────────────────────────────────────────────
    // HEADER
    // ─────────────────────────────────────────────────────────

    _crearHeader() {
        const W = 1280;

        const headerBg = this.add.rectangle(W / 2, 60, W - 80, 96, 0x071530, 0.95).setDepth(2);
        headerBg.setStrokeStyle(2, 0x2255aa, 0.8);

        this.add.rectangle(52, 60, 6, 70, 0x4488ff, 1).setDepth(2);

        this.add.text(W / 2, 42, 'RANKING FINAL', {
            fontFamily: '"VT323", monospace',
            fontSize: '46px',
            color: '#ffe58a',
            stroke: '#0a1a2e',
            strokeThickness: 5
        }).setOrigin(0.5).setDepth(3);

        this.add.text(W / 2, 82, 'Ingresa tu nombre y conquista el récord', {
            fontFamily: '"VT323", monospace',
            fontSize: '22px',
            color: '#8ab4f8'
        }).setOrigin(0.5).setDepth(3);

        const puntajeBg = this.add.rectangle(W - 130, 60, 200, 52, 0x0d2a5e, 1).setDepth(2);
        puntajeBg.setStrokeStyle(2, 0xffe58a, 0.9);

        this.add.text(W - 130, 50, 'PUNTAJE', {
            fontFamily: '"VT323", monospace',
            fontSize: '18px',
            color: '#8ab4f8'
        }).setOrigin(0.5).setDepth(3);

        this.add.text(W - 130, 72, `${this.puntajeFinal}`, {
            fontFamily: '"VT323", monospace',
            fontSize: '28px',
            color: '#ffe58a',
            stroke: '#0a1a2e',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(3);
    }

    // ─────────────────────────────────────────────────────────
    // PANEL JUGADORES
    // ─────────────────────────────────────────────────────────

    _crearPanelJugadores() {
        const panelX = 340;
        const panelY = 420;
        const panelW = 640;
        const panelH = 540;

        this.add.rectangle(panelX + 4, panelY + 4, panelW, panelH, 0x000000, 0.3).setDepth(2);

        const panel = this.add.rectangle(panelX, panelY, panelW, panelH, 0x071530, 0.96).setDepth(3);
        panel.setStrokeStyle(2, 0x2255aa, 1);

        const barraTitulo = this.add.rectangle(panelX, 155, panelW - 4, 44, 0x0d2a5e, 1).setDepth(3);
        barraTitulo.setStrokeStyle(1, 0x3366cc, 0.8);

        this.add.rectangle(panelX - panelW / 2 + 3, panelY, 4, panelH, 0x4488ff, 1).setDepth(4);

        this.add.text(
            panelX,
            155,
            this.jugadores === 2 ? 'NOMBRES DE LOS JUGADORES' : 'NOMBRE DEL JUGADOR',
            {
                fontFamily: '"VT323", monospace',
                fontSize: '26px',
                color: '#d8ecff'
            }
        ).setOrigin(0.5).setDepth(4);

        const yJ1 = this.jugadores === 2 ? 218 : 228;
        this._crearCampoNombre(panelX, yJ1, 1);

        if (this.jugadores === 2) {
            this._crearCampoNombre(panelX, 306, 2);
        }

        const yInfo = this.jugadores === 2 ? 380 : 308;
        this._crearInfoControles(panelX, yInfo);
    }

    _crearCampoNombre(cx, cy, player) {
        const isJ1 = player === 1;

        const colorAcento = isJ1 ? 0x81ff81 : 0xff9e9e;
        const colorTexto = isJ1 ? '#bfffbf' : '#ffc7c7';
        const label = isJ1 ? 'J1' : 'J2';

        this.add.text(cx - 295, cy, `${label}:`, {
            fontFamily: '"VT323", monospace',
            fontSize: '28px',
            color: colorTexto
        }).setOrigin(0, 0.5).setDepth(4);

        const boxW = 380;
        const boxH = 62;

        const box = this.add.rectangle(cx + 60, cy, boxW, boxH, 0x040e1f, 1).setDepth(4);
        box.setStrokeStyle(2, colorAcento, 0.8);

        const cursor = this.add.text(cx + 60 + 8, cy, '|', {
            fontFamily: '"VT323", monospace',
            fontSize: '32px',
            color: colorTexto
        }).setOrigin(0, 0.5).setDepth(5).setAlpha(0);

        this.tweens.add({
            targets: cursor,
            alpha: 1,
            duration: 500,
            yoyo: true,
            repeat: -1
        });

        const textObj = this.add.text(cx + 60, cy, '---', {
            fontFamily: '"VT323", monospace',
            fontSize: '30px',
            color: colorTexto
        }).setOrigin(0.5).setDepth(5);

        if (isJ1) {
            this.boxJ1 = box;
            this.textJ1 = textObj;
            this.cursorJ1visual = cursor;
        } else {
            this.boxJ2 = box;
            this.textJ2 = textObj;
            this.cursorJ2visual = cursor;
        }
    }

    _crearInfoControles(cx, cy) {
        const infoBg = this.add.rectangle(cx, cy + 20, 580, 86, 0x040e1f, 0.7).setDepth(3);
        infoBg.setStrokeStyle(1, 0x1a3a6e, 0.8);

        this.infoMandos = this.add.text(
            cx,
            cy,
            this.jugadores === 2
                ? 'Mando 1 → escribe J1   ·   Mando 2 → escribe J2'
                : 'Escribe tu nombre con teclado o mando',
            {
                fontFamily: '"VT323", monospace',
                fontSize: '21px',
                color: '#8ab4f8',
                align: 'center'
            }
        ).setOrigin(0.5).setDepth(4);

        this.add.text(cx, cy + 26, 'Flechas/stick: mover   ·   A: seleccionar   ·   R1: guardar   ·   L1: volver', {
            fontFamily: '"VT323", monospace',
            fontSize: '19px',
            color: '#6688bb',
            align: 'center'
        }).setOrigin(0.5).setDepth(4);

        const yMsg = cy + 54;

        this.messageBg = this.add.rectangle(cx, yMsg, 520, 34, 0x173250, 0.95).setDepth(5);
        this.messageBg.setStrokeStyle(2, 0x6ea1ef, 1);
        this.messageBg.setVisible(false);

        this.messageText = this.add.text(cx, yMsg, '', {
            fontFamily: '"VT323", monospace',
            fontSize: '20px',
            color: '#ffffff',
            align: 'center'
        }).setOrigin(0.5).setVisible(false).setDepth(6);
    }

    // ─────────────────────────────────────────────────────────
    // PANEL RANKING
    // ─────────────────────────────────────────────────────────

    _crearPanelRanking() {
        const panelX = 1020;
        const panelY = 420;
        const panelW = 460;
        const panelH = 540;

        this.add.rectangle(panelX + 4, panelY + 4, panelW, panelH, 0x000000, 0.3).setDepth(2);

        const panel = this.add.rectangle(panelX, panelY, panelW, panelH, 0x071530, 0.96).setDepth(3);
        panel.setStrokeStyle(2, 0xb8a030, 0.9);

        this.add.rectangle(panelX + panelW / 2 - 3, panelY, 4, panelH, 0xffe58a, 1).setDepth(4);

        const barraTituloR = this.add.rectangle(panelX, 155, panelW - 4, 44, 0x1a1600, 1).setDepth(3);
        barraTituloR.setStrokeStyle(1, 0xb8a030, 0.8);

        this.add.text(panelX, 155, 'TABLA DE RÉCORDS', {
            fontFamily: '"VT323", monospace',
            fontSize: '26px',
            color: '#ffe58a'
        }).setOrigin(0.5).setDepth(4);

        const yHeader = 200;

        this.add.rectangle(panelX, yHeader + 12, panelW - 20, 28, 0x0d2a5e, 1).setDepth(4);

        this.add.text(800, yHeader + 12, '#', {
            fontFamily: '"VT323", monospace',
            fontSize: '20px',
            color: '#8ab4f8'
        }).setOrigin(0, 0.5).setDepth(5);

        this.add.text(840, yHeader + 12, 'NOMBRE', {
            fontFamily: '"VT323", monospace',
            fontSize: '20px',
            color: '#8ab4f8'
        }).setOrigin(0, 0.5).setDepth(5);

        this.add.text(1155, yHeader + 12, 'PTS', {
            fontFamily: '"VT323", monospace',
            fontSize: '20px',
            color: '#8ab4f8'
        }).setOrigin(1, 0.5).setDepth(5);

        this.add.text(1220, yHeader + 12, 'MODO', {
            fontFamily: '"VT323", monospace',
            fontSize: '20px',
            color: '#8ab4f8'
        }).setOrigin(1, 0.5).setDepth(5);

        const lineaG = this.add.graphics().setDepth(4);
        lineaG.lineStyle(1, 0xb8a030, 0.5);
        lineaG.moveTo(790, 228);
        lineaG.lineTo(1235, 228);
        lineaG.strokePath();

        this.rankingScroll = {
            x: 790,
            y: 234,
            width: 420,
            height: 380,
            offset: 0,
            maxScroll: 0,
            rowHeight: 40,
            dragging: false,
            dragOffsetY: 0
        };

        const maskG = this.make.graphics({ x: 0, y: 0, add: false });
        maskG.fillStyle(0xffffff, 1);
        maskG.fillRect(
            this.rankingScroll.x,
            this.rankingScroll.y,
            this.rankingScroll.width,
            this.rankingScroll.height
        );

        this.rankingMask = maskG.createGeometryMask();
        this.rankingScroll.maskGraphics = maskG;

        this.recordsContainer = this.add.container(0, 0).setDepth(4);
        this.recordsContainer.setMask(this.rankingMask);

        this.rankingTrack = this.add.rectangle(
            1240,
            this.rankingScroll.y + this.rankingScroll.height / 2,
            8,
            this.rankingScroll.height,
            0x0d2a5e,
            1
        ).setDepth(4);

        this.rankingTrack.setStrokeStyle(1, 0x2255aa, 1);

        this.rankingKnob = this.add.rectangle(
            1240,
            this.rankingScroll.y + 30,
            14,
            60,
            0x4488ff,
            1
        ).setDepth(5);

        this.rankingKnob.setStrokeStyle(2, 0xaaccff, 1);
        this.rankingKnob.setInteractive({ cursor: 'pointer' });

        this.rankingTrackZone = this.add.zone(
            1240,
            this.rankingScroll.y + this.rankingScroll.height / 2,
            24,
            this.rankingScroll.height
        ).setInteractive({ cursor: 'pointer' });

        this.rankingTrackZone.on('pointerdown', (pointer) => {
            if (!this.rankingScroll || this.rankingScroll.maxScroll <= 0) return;

            const minY = this.rankingScroll.y + this.rankingKnob.height / 2;
            const maxY = this.rankingScroll.y + this.rankingScroll.height - this.rankingKnob.height / 2;
            const ratio = Phaser.Math.Clamp((pointer.y - minY) / Math.max(1, maxY - minY), 0, 1);

            this._setScrollRanking(ratio * this.rankingScroll.maxScroll);
        });

        this.rankingKnob.on('pointerdown', (pointer) => {
            if (!this.rankingScroll || this.rankingScroll.maxScroll <= 0) return;

            this.rankingScroll.dragging = true;
            this.rankingScroll.dragOffsetY = pointer.y - this.rankingKnob.y;
        });

        this.rankingPointerMoveHandler = (pointer) => {
            if (!this.rankingScroll || !this.rankingScroll.dragging || this.rankingScroll.maxScroll <= 0) return;

            const minY = this.rankingScroll.y + this.rankingKnob.height / 2;
            const maxY = this.rankingScroll.y + this.rankingScroll.height - this.rankingKnob.height / 2;

            const ratio =
                (Phaser.Math.Clamp(pointer.y - this.rankingScroll.dragOffsetY, minY, maxY) - minY)
                / Math.max(1, maxY - minY);

            this._setScrollRanking(ratio * this.rankingScroll.maxScroll);
        };

        this.rankingPointerUpHandler = () => {
            if (this.rankingScroll) this.rankingScroll.dragging = false;
        };

        this.input.on('pointermove', this.rankingPointerMoveHandler);
        this.input.on('pointerup', this.rankingPointerUpHandler);

        this.rankingWheelHandler = (pointer, gameObjects, deltaX, deltaY) => {
            if (!this.rankingScroll) return;

            const dentro =
                pointer.x >= this.rankingScroll.x &&
                pointer.x <= this.rankingScroll.x + this.rankingScroll.width + 50 &&
                pointer.y >= this.rankingScroll.y &&
                pointer.y <= this.rankingScroll.y + this.rankingScroll.height;

            if (dentro) {
                this._scrollRankingDelta(deltaY * 0.7);
            }
        };

        this.input.on('wheel', this.rankingWheelHandler);
    }

    _renderizarRanking() {
        if (!this.recordsContainer || !this.rankingScroll) return;

        this.recordsContainer.removeAll(true);
        this.rankingScroll.offset = 0;
        this.recordsContainer.y = 0;

        if (!Array.isArray(this.records) || this.records.length === 0) {
            const t1 = this.add.text(1020, 340, 'Sin récords todavía.', {
                fontFamily: '"VT323", monospace',
                fontSize: '26px',
                color: '#6688bb',
                align: 'center'
            }).setOrigin(0.5);

            const t2 = this.add.text(1020, 372, '¡Sé el primero en guardar!', {
                fontFamily: '"VT323", monospace',
                fontSize: '22px',
                color: '#4466aa',
                align: 'center'
            }).setOrigin(0.5);

            this.recordsContainer.add([t1, t2]);

            this.rankingScroll.maxScroll = 0;
            this._actualizarScrollRanking();

            return;
        }

        let y = this.rankingScroll.y + 8;

        this.records.forEach((r, index) => {
            const esTop1 = index === 0;
            const esTop2 = index === 1;
            const esTop3 = index === 2;

            let colorFila;
            let colorBorde;
            let colorPos;
            let colorPts;

            if (esTop1) {
                colorFila = 0x2a1f00;
                colorBorde = 0xffe58a;
                colorPos = '#ffe58a';
                colorPts = '#ffe58a';
            } else if (esTop2) {
                colorFila = 0x0d1a30;
                colorBorde = 0xaabbff;
                colorPos = '#aabbff';
                colorPts = '#aabbff';
            } else if (esTop3) {
                colorFila = 0x1a0d00;
                colorBorde = 0xffb36b;
                colorPos = '#ffb36b';
                colorPts = '#ffb36b';
            } else {
                colorFila = 0x071530;
                colorBorde = 0x1a3a6e;
                colorPos = '#6688bb';
                colorPts = '#bfffbf';
            }

            const rowH = this.rankingScroll.rowHeight;
            const cx = this.rankingScroll.x + this.rankingScroll.width / 2 - 15;

            const filaBg = this.add.rectangle(
                cx,
                y + rowH / 2 - 2,
                this.rankingScroll.width - 10,
                rowH - 4,
                colorFila,
                0.92
            );

            filaBg.setStrokeStyle(1, colorBorde, 0.7);

            const medalLabel =
                esTop1 ? '1' :
                    esTop2 ? '2' :
                        esTop3 ? '3' :
                            `${index + 1}`;

            const posX = this.rankingScroll.x + 10;

            const posText = this.add.text(posX, y + rowH / 2 - 2, medalLabel, {
                fontFamily: '"VT323", monospace',
                fontSize: '20px',
                color: colorPos
            }).setOrigin(0, 0.5);

            const nombreText = this.add.text(
                posX + 44,
                y + rowH / 2 - 2,
                this._recortarTexto(r.nombre || '---', 16),
                {
                    fontFamily: '"VT323", monospace',
                    fontSize: '20px',
                    color: '#ddeeff'
                }
            ).setOrigin(0, 0.5);

            const ptsText = this.add.text(
                this.rankingScroll.x + this.rankingScroll.width - 80,
                y + rowH / 2 - 2,
                `${r.puntaje ?? 0}`,
                {
                    fontFamily: '"VT323", monospace',
                    fontSize: '20px',
                    color: colorPts
                }
            ).setOrigin(1, 0.5);

            const modoText = this.add.text(
                this.rankingScroll.x + this.rankingScroll.width - 16,
                y + rowH / 2 - 2,
                `${r.modo || '1P'}`,
                {
                    fontFamily: '"VT323", monospace',
                    fontSize: '18px',
                    color: '#6688bb'
                }
            ).setOrigin(1, 0.5);

            this.recordsContainer.add([filaBg, posText, nombreText, ptsText, modoText]);

            y += rowH;
        });

        const contenidoAlto = y - this.rankingScroll.y;

        this.rankingScroll.maxScroll = Math.max(
            0,
            contenidoAlto - this.rankingScroll.height - 10
        );

        this._actualizarScrollRanking();
    }

    _scrollRankingDelta(delta) {
        if (!this.rankingScroll) return;
        this._setScrollRanking(this.rankingScroll.offset + delta);
    }

    _setScrollRanking(nuevoOffset) {
        if (!this.rankingScroll || !this.recordsContainer) return;

        this.rankingScroll.offset = Phaser.Math.Clamp(
            nuevoOffset,
            0,
            this.rankingScroll.maxScroll
        );

        this.recordsContainer.y = -this.rankingScroll.offset;

        this._actualizarScrollRanking();
    }

    _actualizarScrollRanking() {
        if (!this.rankingScroll || !this.rankingKnob || !this.rankingTrack) return;

        if (this.rankingScroll.maxScroll <= 0) {
            this.rankingTrack.setAlpha(0.2);
            this.rankingKnob.setAlpha(0.2);
            this.rankingKnob.y = this.rankingScroll.y + 30;
            return;
        }

        this.rankingTrack.setAlpha(1);
        this.rankingKnob.setAlpha(1);

        const minY = this.rankingScroll.y + this.rankingKnob.height / 2;
        const maxY = this.rankingScroll.y + this.rankingScroll.height - this.rankingKnob.height / 2;

        this.rankingKnob.y = Phaser.Math.Linear(
            minY,
            maxY,
            this.rankingScroll.offset / this.rankingScroll.maxScroll
        );
    }

    // ─────────────────────────────────────────────────────────
    // TECLADO VIRTUAL
    // ─────────────────────────────────────────────────────────

    _crearTecladoVirtual() {
        this.keyboardButtons = [];
        this.keyboardButtonMap = {};

        const startY = this.jugadores === 2 ? 474 : 454;
        const rowGap = 50;
        const colGap = 10;

        for (let row = 0; row < this.layoutTeclado.length; row++) {
            const rowData = this.layoutTeclado[row];
            const rowButtons = [];

            let totalWidth = 0;

            rowData.forEach((key) => {
                totalWidth += this._anchoTecla(key);
            });

            totalWidth += (rowData.length - 1) * colGap;

            let x = 340 - totalWidth / 2;

            for (let col = 0; col < rowData.length; col++) {
                const key = rowData[col];
                const w = this._anchoTecla(key);
                const h = 40;

                const centerX = x + w / 2;
                const centerY = startY + row * rowGap;

                let colorFondo = 0x0d2240;
                let colorBorde = 0x2a4a80;

                if (key === 'OK') {
                    colorFondo = 0x0d3d1a;
                    colorBorde = 0x2aaa4a;
                }

                if (key === 'BORRAR' || key === '⌫') {
                    colorFondo = 0x3d0d0d;
                    colorBorde = 0xaa2a2a;
                }

                if (key === 'ESP') {
                    colorFondo = 0x1a1a3d;
                    colorBorde = 0x4a4aaa;
                }

                const bg = this.add.rectangle(centerX, centerY, w, h, colorFondo, 1).setDepth(4);
                bg.setStrokeStyle(1, colorBorde, 1);

                const txt = this.add.text(centerX, centerY, key, {
                    fontFamily: '"VT323", monospace',
                    fontSize: key.length >= 5 ? '18px' : '22px',
                    color:
                        key === 'OK'
                            ? '#aaffaa'
                            : key === 'BORRAR' || key === '⌫'
                                ? '#ffaaaa'
                                : '#cce0ff'
                }).setOrigin(0.5).setDepth(5);

                const zone = this.add.zone(centerX, centerY, w, h)
                    .setInteractive({ cursor: 'pointer' })
                    .setDepth(6);

                zone.on('pointerdown', () => {
                    this._seleccionarTeclaActual(this.campoActivoTeclado, key);
                });

                zone.on('pointerover', () => {
                    bg.setFillStyle(colorBorde, 0.6);
                });

                zone.on('pointerout', () => {
                    bg.setFillStyle(colorFondo, 1);
                });

                const obj = {
                    key,
                    row,
                    col,
                    x: centerX,
                    y: centerY,
                    w,
                    h,
                    bg,
                    txt,
                    zone,
                    colorFondo,
                    colorBorde
                };

                rowButtons.push(obj);
                this.keyboardButtonMap[`${row}_${col}`] = obj;

                x += w + colGap;
            }

            this.keyboardButtons.push(rowButtons);
        }

        this.focusJ1 = this.add.rectangle(0, 0, 0, 0).setDepth(7);
        this.focusJ1.setStrokeStyle(3, 0x81ff81, 1);
        this.focusJ1.setFillStyle(0x81ff81, 0.08);

        this.focusJ2 = this.add.rectangle(0, 0, 0, 0).setDepth(7);
        this.focusJ2.setStrokeStyle(3, 0xff9e9e, 1);
        this.focusJ2.setFillStyle(0xff9e9e, 0.08);

        if (this.jugadores === 1) {
            this.focusJ2.setVisible(false);
        }
    }

    _anchoTecla(key) {
        if (key === 'ESP') return 108;
        if (key === 'BORRAR') return 130;
        if (key === 'OK') return 96;

        return 74;
    }

    _actualizarFocosTeclado() {
        const b1 = this.keyboardButtonMap[`${this.cursorJ1.row}_${this.cursorJ1.col}`];

        if (b1) {
            this.focusJ1.setPosition(b1.x, b1.y);
            this.focusJ1.setSize(b1.w + 6, b1.h + 6);
        }

        if (this.jugadores === 2) {
            const b2 = this.keyboardButtonMap[`${this.cursorJ2.row}_${this.cursorJ2.col}`];

            if (b2) {
                this.focusJ2.setVisible(true);
                this.focusJ2.setPosition(b2.x, b2.y);
                this.focusJ2.setSize(b2.w + 6, b2.h + 6);
            }
        } else {
            this.focusJ2.setVisible(false);
        }
    }

    _moverCursor(player, dx, dy) {
        const cursor = player === 1 ? this.cursorJ1 : this.cursorJ2;

        cursor.row = Phaser.Math.Clamp(
            cursor.row + dy,
            0,
            this.layoutTeclado.length - 1
        );

        const maxCol = this.layoutTeclado[cursor.row].length - 1;

        cursor.col = Phaser.Math.Clamp(
            cursor.col + dx,
            0,
            maxCol
        );

        this._actualizarFocosTeclado();
        this._reproducirClick();
    }

    _seleccionarTeclaDesdeCursor(player) {
        const cursor = player === 1 ? this.cursorJ1 : this.cursorJ2;
        const key = this.layoutTeclado[cursor.row][cursor.col];

        this._seleccionarTeclaActual(player, key);
    }

    _seleccionarTeclaActual(player, key) {
        if (key === 'OK') {
            this._guardarPuntaje();
            return;
        }

        if (key === 'BORRAR' || key === '⌫') {
            this._borrarCaracter(player);
            return;
        }

        if (key === 'ESP') {
            this._agregarCaracter(player, ' ');
            return;
        }

        this._agregarCaracter(player, key);
    }

    // ─────────────────────────────────────────────────────────
    // CAMPOS DE TEXTO
    // ─────────────────────────────────────────────────────────

    _agregarCaracter(player, char) {
        if (player === 1) {
            if (this.nombreJ1.length >= this.maxCaracteres) return;
            this.nombreJ1 += char;
        } else {
            if (this.nombreJ2.length >= this.maxCaracteres) return;
            this.nombreJ2 += char;
        }

        this._actualizarCamposTexto();
        this._reproducirClick();
    }

    _borrarCaracter(player) {
        if (player === 1) {
            this.nombreJ1 = this.nombreJ1.slice(0, -1);
        } else {
            this.nombreJ2 = this.nombreJ2.slice(0, -1);
        }

        this._actualizarCamposTexto();
        this._reproducirClick();
    }

    _actualizarCamposTexto() {
        const v1 = this.nombreJ1.trim().length > 0 ? this.nombreJ1 : '---';

        if (this.textJ1) {
            this.textJ1.setText(v1);
        }

        if (this.jugadores === 2 && this.textJ2) {
            const v2 = this.nombreJ2.trim().length > 0 ? this.nombreJ2 : '---';
            this.textJ2.setText(v2);
        }

        if (this.boxJ1) {
            this.boxJ1.setStrokeStyle(
                this.campoActivoTeclado === 1 ? 3 : 2,
                this.campoActivoTeclado === 1 ? 0xc6ffc6 : 0x81d781,
                1
            );
        }

        if (this.boxJ2) {
            this.boxJ2.setStrokeStyle(
                this.campoActivoTeclado === 2 ? 3 : 2,
                this.campoActivoTeclado === 2 ? 0xffd1d1 : 0xffa3a3,
                1
            );
        }
    }

    // ─────────────────────────────────────────────────────────
    // GUARDAR RANKING
    // ─────────────────────────────────────────────────────────

    _guardarPuntaje() {
        if (this.puntajeYaGuardado) {
            this._mostrarMensaje('Este puntaje ya fue guardado.', 0x173250, 0x6ea1ef);
            return;
        }

        const nombre1 = this._limpiarNombre(this.nombreJ1);
        const nombre2 = this._limpiarNombre(this.nombreJ2);

        if (this.jugadores === 1) {
            if (!nombre1) {
                this._mostrarMensaje('Escribe un nombre para guardar.', 0x4a2a2a, 0xd38b8b);
                return;
            }
        } else {
            if (!nombre1 || !nombre2) {
                this._mostrarMensaje('Debes escribir el nombre de J1 y J2.', 0x4a2a2a, 0xd38b8b);
                return;
            }
        }

        const nombreFinal = this.jugadores === 2
            ? `${nombre1} y ${nombre2}`
            : nombre1;

        const modoFinal = this.jugadores === 2 ? '2P' : '1P';

        const nuevo = {
            nombre: nombreFinal,
            puntaje: this.puntajeFinal,
            modo: modoFinal,
            fecha: new Date().toISOString()
        };

        this.records.push(nuevo);

        this.records.sort((a, b) => {
            const diferenciaPuntaje = (b.puntaje ?? 0) - (a.puntaje ?? 0);

            if (diferenciaPuntaje !== 0) {
                return diferenciaPuntaje;
            }

            return new Date(b.fecha || 0) - new Date(a.fecha || 0);
        });

        this.records = this.records.slice(0, 50);

        try {
            localStorage.setItem(this.localStorageKey, JSON.stringify(this.records));
        } catch (e) {
            console.warn('No se pudo guardar:', e);
        }

        this.puntajeYaGuardado = true;

        this._renderizarRanking();
        this._mostrarMensaje('¡Puntaje guardado correctamente!', 0x0d3d1a, 0x2aaa4a);
    }

    _cargarRanking() {
        try {
            const raw = localStorage.getItem(this.localStorageKey);

            this.records = raw ? JSON.parse(raw) : [];

            if (!Array.isArray(this.records)) {
                this.records = [];
            }

            this.records.sort((a, b) => {
                const diferenciaPuntaje = (b.puntaje ?? 0) - (a.puntaje ?? 0);

                if (diferenciaPuntaje !== 0) {
                    return diferenciaPuntaje;
                }

                return new Date(b.fecha || 0) - new Date(a.fecha || 0);
            });
        } catch (e) {
            console.warn('No se pudo cargar el ranking:', e);
            this.records = [];
        }
    }

    _limpiarNombre(texto = '') {
        return texto.replace(/\s+/g, ' ').trim().slice(0, this.maxCaracteres);
    }

    _recortarTexto(texto = '', max = 16) {
        return texto.length <= max ? texto : texto.slice(0, max - 2) + '..';
    }

    // ─────────────────────────────────────────────────────────
    // CONTROLES INFERIORES
    // ─────────────────────────────────────────────────────────

    _crearControlesInferiores() {
        const W = 1280;
        const H = 720;

        this.add.text(
            50,
            H - 26,
            this.jugadores === 2
                ? 'TAB: cambia J1/J2  ·  ENTER: guardar  ·  BACKSPACE: borrar  ·  ESC: volver'
                : 'Escribe directo  ·  ENTER: guardar  ·  BACKSPACE: borrar  ·  ESC: volver',
            {
                fontFamily: '"VT323", monospace',
                fontSize: '19px',
                color: '#3a5580'
            }
        ).setDepth(4);

        const btnX = W - 88;
        const btnY = H - 26;

        const btnBg = this.add.rectangle(btnX, btnY, 150, 34, 0x0d2240, 1).setDepth(4);
        btnBg.setStrokeStyle(2, 0x4488ff, 1);

        this.add.text(btnX, btnY, 'VOLVER', {
            fontFamily: '"VT323", monospace',
            fontSize: '22px',
            color: '#8ab4f8'
        }).setOrigin(0.5).setDepth(5);

        const badgeBg = this.add.rectangle(btnX - 58, btnY - 16, 40, 20, 0x4488ff, 1).setDepth(5);
        badgeBg.setStrokeStyle(1, 0xaaccff, 1);

        this.add.text(btnX - 58, btnY - 16, 'L1', {
            fontFamily: '"VT323", monospace',
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(6);

        const zone = this.add.zone(btnX, btnY, 150, 34)
            .setInteractive({ cursor: 'pointer' })
            .setDepth(6);

        zone.on('pointerdown', () => {
            this._irAStart();
        });

        zone.on('pointerover', () => {
            btnBg.setFillStyle(0x1a3a6e, 1);
        });

        zone.on('pointerout', () => {
            btnBg.setFillStyle(0x0d2240, 1);
        });
    }

    _mostrarMensaje(texto, colorBg = 0x173250, colorBorder = 0x6ea1ef) {
        if (!this.messageBg || !this.messageText) return;

        this.messageBg.setFillStyle(colorBg, 0.95);
        this.messageBg.setStrokeStyle(2, colorBorder, 1);

        this.messageText.setText(texto);

        this.messageBg.setVisible(true);
        this.messageText.setVisible(true);

        if (this.messageTimer) {
            this.messageTimer.remove(false);
        }

        this.messageTimer = this.time.delayedCall(2000, () => {
            if (this.messageBg) this.messageBg.setVisible(false);
            if (this.messageText) this.messageText.setVisible(false);
            this.messageTimer = null;
        });
    }

    // ─────────────────────────────────────────────────────────
    // TECLADO FÍSICO
    // ─────────────────────────────────────────────────────────

    _configurarTecladoFisico() {

        this.keydownHandler = (event) => {

            const key = event.key;

            // ─────────────────────────────
            // CAMBIAR ENTRE J1 Y J2
            // ─────────────────────────────

            if (key === 'Tab') {

                event.preventDefault();

                if (this.jugadores === 2) {

                    this.campoActivoTeclado =
                        this.campoActivoTeclado === 1
                            ? 2
                            : 1;

                    this._actualizarCamposTexto();
                }

                return;
            }

            // ─────────────────────────────
            // FLECHAS DEL TECLADO
            // ─────────────────────────────

            if (key === 'ArrowUp') {

                this._moverCursor(
                    this.campoActivoTeclado,
                    0,
                    -1
                );

                return;
            }

            if (key === 'ArrowDown') {

                this._moverCursor(
                    this.campoActivoTeclado,
                    0,
                    1
                );

                return;
            }

            if (key === 'ArrowLeft') {

                this._moverCursor(
                    this.campoActivoTeclado,
                    -1,
                    0
                );

                return;
            }

            if (key === 'ArrowRight') {

                this._moverCursor(
                    this.campoActivoTeclado,
                    1,
                    0
                );

                return;
            }

            // ─────────────────────────────
            // ENTER = PRESIONAR TECLA
            // ─────────────────────────────

            if (key === 'Enter') {

                this._seleccionarTeclaDesdeCursor(
                    this.campoActivoTeclado
                );

                return;
            }

            // ─────────────────────────────
            // BORRAR
            // ─────────────────────────────

            if (key === 'Backspace') {

                this._borrarCaracter(
                    this.campoActivoTeclado
                );

                return;
            }

            // ─────────────────────────────
            // VOLVER
            // ─────────────────────────────

            if (key === 'Escape') {

                this._irAStart();

                return;
            }

            // ─────────────────────────────
            // ESCRITURA DIRECTA OPCIONAL
            // ─────────────────────────────

            if (key === ' ') {

                this._agregarCaracter(
                    this.campoActivoTeclado,
                    ' '
                );

                return;
            }

            const mayus = key.toUpperCase();

            if (/^[A-ZÑ]$/.test(mayus)) {

                this._agregarCaracter(
                    this.campoActivoTeclado,
                    mayus
                );
            }
        };

        this.input.keyboard.on(
            'keydown',
            this.keydownHandler
        );
    }
    // ─────────────────────────────────────────────────────────
    // MANDOS
    // ─────────────────────────────────────────────────────────

    _iniciarGamepads() {
        try {
            if (this.input && this.input.gamepad) {
                if (typeof this.input.gamepad.start === 'function') {
                    this.input.gamepad.start();
                }

                if (typeof this.input.gamepad.startListeners === 'function') {
                    this.input.gamepad.startListeners();
                }
            }
        } catch (e) {
            console.warn('No se pudieron iniciar los mandos:', e);
        }
    }

    _actualizarMandos() {
        const pads = this._obtenerMandos();

        pads.forEach((pad, index) => {
            const player = this.jugadores === 1
                ? 1
                : (index === 0 ? 1 : index === 1 ? 2 : 1);

            const current = this._leerEstadoPad(pad);
            const id = this._obtenerIdPad(pad, index);
            const prev = this.prevPadStates[id] || this._estadoPadVacio();

            const justDown = {};

            Object.keys(current).forEach((k) => {
                justDown[k] = current[k] && !prev[k];
            });

            if (justDown.up) {
                this._moverCursor(player, 0, -1);
            }

            if (justDown.down) {
                this._moverCursor(player, 0, 1);
            }

            if (justDown.left) {
                this._moverCursor(player, -1, 0);
            }

            if (justDown.right) {
                this._moverCursor(player, 1, 0);
            }

            if (justDown.a) {
                this._seleccionarTeclaDesdeCursor(player);
            }

            if (justDown.l1) {
                this._irAStart();
            }

            if (justDown.r1) {
                this._guardarPuntaje();
            }

            if (justDown.y && this.jugadores === 2 && pads.length < 2) {
                this.campoActivoTeclado = this.campoActivoTeclado === 1 ? 2 : 1;
                this._actualizarCamposTexto();
            }

            this.prevPadStates[id] = { ...current };
        });
    }

    _obtenerMandos() {
        let pads = [];

        if (navigator.getGamepads) {
            pads = Array.from(navigator.getGamepads()).filter((p) => p && p.connected);
        }

        if (pads.length === 0 && this.input && this.input.gamepad) {
            if (typeof this.input.gamepad.getAll === 'function') {
                pads = this.input.gamepad.getAll().filter((p) => p);
            } else if (Array.isArray(this.input.gamepad.gamepads)) {
                pads = this.input.gamepad.gamepads.filter((p) => p);
            }
        }

        return pads;
    }

    _obtenerIdPad(pad, index) {
        if (!pad) return `pad_${index}`;

        const idx = typeof pad.index === 'number' ? pad.index : index;

        return `pad_${idx}`;
    }

    _estadoPadVacio() {
        return {
            a: false,
            b: false,
            x: false,
            y: false,
            l1: false,
            r1: false,
            up: false,
            down: false,
            left: false,
            right: false
        };
    }

    _leerEstadoPad(pad) {
        const xAxis = this._leerEjePad(pad, 0);
        const yAxis = this._leerEjePad(pad, 1);
        const esPlay = this._esMandoPlay(pad);

        if (esPlay) {
            return {
                a: this._padButton(pad, 0),
                b: this._padButton(pad, 1),
                x: this._padButton(pad, 2),
                y: this._padButton(pad, 3),
                l1: this._padButton(pad, 4),
                r1: this._padButton(pad, 5),
                up: this._padButton(pad, 12) || yAxis < -0.5,
                down: this._padButton(pad, 13) || yAxis > 0.5,
                left: this._padButton(pad, 14) || xAxis < -0.5,
                right: this._padButton(pad, 15) || xAxis > 0.5
            };
        }

        return {
            a: this._padButton(pad, 0),
            b: this._padButton(pad, 1),
            x: this._padButton(pad, 2) || this._padButton(pad, 3),
            y: this._padButton(pad, 4),
            l1: this._padButton(pad, 6),
            r1: this._padButton(pad, 5) || this._padButton(pad, 7),
            up: this._padButton(pad, 12) || yAxis < -0.5,
            down: this._padButton(pad, 13) || yAxis > 0.5,
            left: this._padButton(pad, 14) || xAxis < -0.5,
            right: this._padButton(pad, 15) || xAxis > 0.5
        };
    }

    _esMandoPlay(pad) {
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

    _padButton(pad, index) {
        if (!pad || !pad.buttons || index < 0 || index >= pad.buttons.length) {
            return false;
        }

        const b = pad.buttons[index];

        if (!b) return false;

        if (typeof b.pressed === 'boolean') {
            return b.pressed;
        }

        if (typeof b.value === 'number') {
            return b.value > 0.35;
        }

        if (typeof b.getValue === 'function') {
            return b.getValue() > 0.35;
        }

        return false;
    }

    _leerEjePad(pad, index) {
        if (!pad || !pad.axes || index < 0 || index >= pad.axes.length) {
            return 0;
        }

        const axis = pad.axes[index];

        let value = 0;

        if (typeof axis === 'number') {
            value = axis;
        } else if (axis && typeof axis.value === 'number') {
            value = axis.value;
        } else if (axis && typeof axis.getValue === 'function') {
            value = axis.getValue();
        }

        return Math.abs(value) < 0.25 ? 0 : value;
    }

    // ─────────────────────────────────────────────────────────
    // LIMPIEZA
    // ─────────────────────────────────────────────────────────

    _limpiarEventos() {
        if (this.rankingPointerMoveHandler) {
            this.input.off('pointermove', this.rankingPointerMoveHandler);
            this.rankingPointerMoveHandler = null;
        }

        if (this.rankingPointerUpHandler) {
            this.input.off('pointerup', this.rankingPointerUpHandler);
            this.rankingPointerUpHandler = null;
        }

        if (this.rankingWheelHandler) {
            this.input.off('wheel', this.rankingWheelHandler);
            this.rankingWheelHandler = null;
        }

        if (this.keydownHandler && this.input && this.input.keyboard) {
            this.input.keyboard.off('keydown', this.keydownHandler);
            this.keydownHandler = null;
        }

        if (this.messageTimer) {
            this.messageTimer.remove(false);
            this.messageTimer = null;
        }

        if (this.rankingScroll) {
            this.rankingScroll.dragging = false;
        }
    }

    // ─────────────────────────────────────────────────────────
    // UTILIDADES
    // ─────────────────────────────────────────────────────────

    _reproducirClick() {
        try {
            if (this.cache.audio.exists('click')) {
                this.sound.play('click', { volume: 0.35 });
            }
        } catch (e) { }
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

    _limpiarDatosPartida() {
        this.game.registry.set('partidaActual', this._crearEstadoPartidaLimpio());

        this.game.registry.remove('delitosEncontrados');
        this.game.registry.remove('estadoBuscadorPorDia');
        this.game.registry.remove('sancionesAsignadas');
        this.game.registry.remove('puntajeDia');
        this.game.registry.remove('cabecillaElegida');
        this.game.registry.remove('cabecillaCorrecto');
        this.game.registry.remove('penalizacionesCabecillaDia6');
        this.game.registry.remove('vidasDiaActual');
        this.game.registry.remove('penalizacionDia');
        this.game.registry.remove('diaActual');
        this.game.registry.remove('modoSoloFondo');
    }

    _irAStart() {
        this._limpiarDatosPartida();

        this.scene.start('Start', {
            volumenActual: this.volumenActual,
            reiniciarPartida: true,
            nuevaPartida: true
        });
    }
}