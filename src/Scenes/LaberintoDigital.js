export class LaberintoDigital extends Phaser.Scene {
    constructor() {
        super('LaberintoDigital');
    }

    init(data) {
        data = data || {};

        this.puntajeDia = data.puntajeDia || null;
        this.siguienteEstado = data.siguienteEstado || null;
        this.volumenActual = typeof data.volumenActual === 'number' ? data.volumenActual : 0.7;

        this.modoJuego = data.modoJuego || '1P';
        this.jugadores = typeof data.jugadores === 'number'
            ? data.jugadores
            : (this.modoJuego === '2P' ? 2 : 1);

        this.casos = Array.isArray(data.casos) ? data.casos.slice(0, 3) : [];

        this.yaTermino = false;
        this.encontrados = false;

        this.tiempoTotal = 300;
        this.tiempoRestante = 300;
        this.timerEvento = null;

        this.maze = [];
        this.cols = 39;
        this.rows = 17;
        this.tile = 31;

        this.originX = 0;
        this.originY = 155;

        this.alex = null;
        this.valeria = null;

        this.velocidad = this.jugadores === 2 ? 150 : 165;
        this.radioJugador = 6;

        this.preguntasMapa = [];
        this.puertasPregunta = [];
        this.preguntaActiva = null;
        this.jugadorPregunta = null;
        this.opcionPreguntaIndex = 0;
        this.elementosPregunta = [];

        this.preguntaInputLiberado = false;
        this.preguntaCooldownHasta = 0;
        this.preguntaAyudaTexto = null;
        this.preguntaTextoControlesBase = '';

        this.puntosPreguntas = 0;
        this.preguntasCorrectas = 0;
        this.preguntasIncorrectas = 0;

        this.musicaMinijuegos = null;
        this.volumenMinijuegos = null;
        this.arrastrandoVolMini = false;
        this.pointerMoveVolMiniHandler = null;
        this.pointerUpVolMiniHandler = null;
    }

    preload() {
        this.cargarAudioMinijuego();
    }

    create() {
        this.cameras.main.setBackgroundColor('#031027');

        this.crearFondo();
        this.crearTitulo();
        this.crearControles();
        this.iniciarMandos();

        this.generarLaberinto();
        this.dibujarLaberinto();
        this.crearPreguntasMapa();
        this.crearJugadores();
        this.crearHUD();
        this.iniciarTemporizador();

        this.actualizarHUD();

        this.iniciarMusicaMinijuego();
        this.crearBarraVolumenMinijuego();
    }

    update(time, delta) {
        if (this.yaTermino) return;

        if (this.preguntaActiva) {
            this.actualizarControlesPregunta(time);
            return;
        }

        const mando1 = this.leerMando(1);
        const mando2 = this.leerMando(2);

        if (this.jugadores === 2) {
            this.moverJugador(this.alex, delta, {
                arriba: this.keys.W.isDown || mando1.arriba,
                abajo: this.keys.S.isDown || mando1.abajo,
                izquierda: this.keys.A.isDown || mando1.izquierda,
                derecha: this.keys.D.isDown || mando1.derecha
            });

            this.moverJugador(this.valeria, delta, {
                arriba: this.cursors.up.isDown || mando2.arriba,
                abajo: this.cursors.down.isDown || mando2.abajo,
                izquierda: this.cursors.left.isDown || mando2.izquierda,
                derecha: this.cursors.right.isDown || mando2.derecha
            });

            this.verificarPreguntas(this.alex);
            this.verificarPreguntas(this.valeria);
            this.verificarEncuentroDosJugadores();
        } else {
            this.moverJugador(this.alex, delta, {
                arriba: this.keys.W.isDown || this.cursors.up.isDown || mando1.arriba,
                abajo: this.keys.S.isDown || this.cursors.down.isDown || mando1.abajo,
                izquierda: this.keys.A.isDown || this.cursors.left.isDown || mando1.izquierda,
                derecha: this.keys.D.isDown || this.cursors.right.isDown || mando1.derecha
            });

            this.verificarPreguntas(this.alex);
            this.verificarEncuentroUnJugador();
        }
    }

    crearFondo() {
        this.add.rectangle(640, 360, 1280, 720, 0x031027, 1);

        for (let i = 0; i < 85; i++) {
            const x = Phaser.Math.Between(0, 1280);
            const y = Phaser.Math.Between(0, 720);

            const punto = this.add.circle(
                x,
                y,
                Phaser.Math.Between(1, 3),
                0x7bb8ff,
                Phaser.Math.FloatBetween(0.08, 0.30)
            );

            this.tweens.add({
                targets: punto,
                alpha: Phaser.Math.FloatBetween(0.04, 0.16),
                duration: Phaser.Math.Between(900, 1700),
                yoyo: true,
                repeat: -1
            });
        }

        const panel = this.add.rectangle(640, 405, 1235, 545, 0x071a3d, 0.72);
        panel.setStrokeStyle(3, 0x77aaff, 0.55);
        panel.setDepth(1);
    }

    crearTitulo() {
        const panel = this.add.rectangle(640, 62, 930, 92, 0x0a1f4d, 0.98);
        panel.setStrokeStyle(3, 0xa9c8ff, 1);

        this.add.text(640, 42, 'LABERINTO DIGITAL', {
            fontFamily: '"VT323", monospace',
            fontSize: '54px',
            color: '#ffffff',
            stroke: '#071022',
            strokeThickness: 6
        }).setOrigin(0.5);

        const subtitulo = this.jugadores === 2
            ? 'Alex y Valeria deben encontrarse dentro de la red social antes de que acabe el tiempo.'
            : 'Guía al detective Alex por el camino correcto hasta encontrar a Valeria.';

        this.add.text(640, 86, subtitulo, {
            fontFamily: '"VT323", monospace',
            fontSize: '23px',
            color: '#d7e6ff'
        }).setOrigin(0.5);
    }

    crearControles() {
        this.cursors = this.input.keyboard.createCursorKeys();

        this.keys = this.input.keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D,
            F: Phaser.Input.Keyboard.KeyCodes.F,
            ENTER: Phaser.Input.Keyboard.KeyCodes.ENTER,
            SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE
        });
    }

    iniciarMandos() {
        if (!this.input.gamepad) return;

        this.input.gamepad.on('connected', (pad) => {
            console.log('Mando conectado:', pad.index, pad.id);
        });
    }

    obtenerMando(jugador = 1) {
        if (!this.input.gamepad) return null;

        const index = jugador === 2 ? 1 : 0;

        if (typeof this.input.gamepad.getPad === 'function') {
            return this.input.gamepad.getPad(index);
        }

        if (this.input.gamepad.gamepads) {
            return this.input.gamepad.gamepads[index] || null;
        }

        return null;
    }

    leerMando(jugador = 1) {
        const pad = this.obtenerMando(jugador);

        if (!pad) {
            return {
                conectado: false,
                arriba: false,
                abajo: false,
                izquierda: false,
                derecha: false,
                accion: false,
                cancelar: false,
                start: false,
                ejeX: 0,
                ejeY: 0
            };
        }

        const ejeX = this.leerEjeMando(pad, 0);
        const ejeY = this.leerEjeMando(pad, 1);

        return {
            conectado: true,

            arriba: ejeY < -0.35 || this.botonMandoPresionado(pad, 12),
            abajo: ejeY > 0.35 || this.botonMandoPresionado(pad, 13),
            izquierda: ejeX < -0.35 || this.botonMandoPresionado(pad, 14),
            derecha: ejeX > 0.35 || this.botonMandoPresionado(pad, 15),

            accion: this.botonMandoPresionado(pad, 0),
            cancelar: this.botonMandoPresionado(pad, 1),
            start: this.botonMandoPresionado(pad, 9),

            ejeX,
            ejeY
        };
    }

    leerEjeMando(pad, index) {
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

    botonMandoPresionado(pad, index) {
        if (!pad || !pad.buttons || !pad.buttons[index]) return false;

        const boton = pad.buttons[index];

        if (typeof boton.pressed === 'boolean') {
            return boton.pressed;
        }

        if (typeof boton.value === 'number') {
            return boton.value > 0.5;
        }

        return false;
    }

    generarLaberinto() {
        if (this.cols % 2 === 0) this.cols += 1;
        if (this.rows % 2 === 0) this.rows += 1;

        this.maze = [];

        for (let y = 0; y < this.rows; y++) {
            const fila = [];
            for (let x = 0; x < this.cols; x++) {
                fila.push(1);
            }
            this.maze.push(fila);
        }

        const startX = 1;
        const startY = 1;
        this.maze[startY][startX] = 0;

        const stack = [{ x: startX, y: startY }];

        while (stack.length > 0) {
            const actual = stack[stack.length - 1];

            const direcciones = Phaser.Utils.Array.Shuffle([
                { x: 2, y: 0 },
                { x: -2, y: 0 },
                { x: 0, y: 2 },
                { x: 0, y: -2 }
            ]);

            let avanzo = false;

            for (let i = 0; i < direcciones.length; i++) {
                const dir = direcciones[i];
                const nx = actual.x + dir.x;
                const ny = actual.y + dir.y;

                if (
                    nx > 0 &&
                    nx < this.cols - 1 &&
                    ny > 0 &&
                    ny < this.rows - 1 &&
                    this.maze[ny][nx] === 1
                ) {
                    this.maze[actual.y + dir.y / 2][actual.x + dir.x / 2] = 0;
                    this.maze[ny][nx] = 0;

                    stack.push({ x: nx, y: ny });
                    avanzo = true;
                    break;
                }
            }

            if (!avanzo) {
                stack.pop();
            }
        }

        this.maze[1][1] = 0;
        this.maze[this.rows - 2][this.cols - 2] = 0;

        this.abrirZonaInicio(1, 1);
        this.abrirZonaInicio(this.cols - 2, this.rows - 2);
        this.agregarCaminosExtra();
        this.crearCompuertasDePreguntas();
    }

    agregarCaminosExtra() {
        const cantidad = Math.floor(this.cols * this.rows * 0.025);

        for (let i = 0; i < cantidad; i++) {
            const x = Phaser.Math.Between(2, this.cols - 3);
            const y = Phaser.Math.Between(2, this.rows - 3);

            if (this.maze[y][x] !== 1) continue;

            const horizontal =
                this.maze[y][x - 1] === 0 &&
                this.maze[y][x + 1] === 0;

            const vertical =
                this.maze[y - 1][x] === 0 &&
                this.maze[y + 1][x] === 0;

            if (horizontal || vertical || Phaser.Math.Between(1, 100) <= 10) {
                this.maze[y][x] = 0;
            }
        }
    }

    crearCompuertasDePreguntas() {
        this.puertasPregunta = [];

        const paredes = [
            Math.floor(this.cols * 0.25),
            Math.floor(this.cols * 0.50),
            Math.floor(this.cols * 0.75)
        ];

        const huecos = [
            Math.floor(this.rows * 0.28),
            Math.floor(this.rows * 0.72),
            Math.floor(this.rows * 0.43)
        ];

        const puertas = [];

        paredes.forEach((xWall, index) => {
            xWall = Phaser.Math.Clamp(xWall, 4, this.cols - 5);
            const yGap = Phaser.Math.Clamp(huecos[index], 3, this.rows - 4);

            for (let y = 1; y < this.rows - 1; y++) {
                this.maze[y][xWall] = 1;
            }

            this.maze[yGap][xWall] = 0;
            this.maze[yGap][xWall - 1] = 0;
            this.maze[yGap][xWall + 1] = 0;

            puertas.push({ x: xWall, y: yGap });
        });

        this.puertasPregunta = puertas;
        this.tallarRutaHastaCompuertas(puertas);
    }

    tallarRutaHastaCompuertas(puertas) {
        if (!Array.isArray(puertas) || puertas.length < 3) return;

        const inicio = { x: 1, y: 1 };
        const fin = { x: this.cols - 2, y: this.rows - 2 };

        this.tallarSegmentoACompuerta(inicio.x, inicio.y, puertas[0].x, puertas[0].y);
        this.tallarSegmentoEntreCompuertas(puertas[0], puertas[1]);
        this.tallarSegmentoEntreCompuertas(puertas[1], puertas[2]);
        this.tallarSegmentoDesdeUltimaCompuerta(puertas[2], fin);
    }

    tallarCelda(x, y) {
        if (x > 0 && x < this.cols - 1 && y > 0 && y < this.rows - 1) {
            this.maze[y][x] = 0;
        }
    }

    tallarLineaVertical(x, y1, y2) {
        const inicio = Math.min(y1, y2);
        const fin = Math.max(y1, y2);

        for (let y = inicio; y <= fin; y++) {
            this.tallarCelda(x, y);
        }
    }

    tallarLineaHorizontal(y, x1, x2) {
        const inicio = Math.min(x1, x2);
        const fin = Math.max(x1, x2);

        for (let x = inicio; x <= fin; x++) {
            this.tallarCelda(x, y);
        }
    }

    tallarSegmentoACompuerta(xInicio, yInicio, xPuerta, yPuerta) {
        this.tallarLineaVertical(xInicio, yInicio, yPuerta);
        this.tallarLineaHorizontal(yPuerta, xInicio, xPuerta);

        this.tallarCelda(xPuerta, yPuerta);
        this.tallarCelda(xPuerta - 1, yPuerta);
        this.tallarCelda(xPuerta + 1, yPuerta);
    }

    tallarSegmentoEntreCompuertas(puertaA, puertaB) {
        const xSalida = puertaA.x + 1;

        this.tallarCelda(puertaA.x, puertaA.y);
        this.tallarCelda(xSalida, puertaA.y);

        this.tallarLineaVertical(xSalida, puertaA.y, puertaB.y);
        this.tallarLineaHorizontal(puertaB.y, xSalida, puertaB.x);

        this.tallarCelda(puertaB.x, puertaB.y);
        this.tallarCelda(puertaB.x - 1, puertaB.y);
        this.tallarCelda(puertaB.x + 1, puertaB.y);
    }

    tallarSegmentoDesdeUltimaCompuerta(puerta, fin) {
        const xSalida = puerta.x + 1;

        this.tallarCelda(puerta.x, puerta.y);
        this.tallarCelda(xSalida, puerta.y);

        this.tallarLineaVertical(xSalida, puerta.y, fin.y);
        this.tallarLineaHorizontal(fin.y, xSalida, fin.x);
    }

    abrirZonaInicio(cx, cy) {
        const posiciones = [
            { x: cx, y: cy },
            { x: cx + 1, y: cy },
            { x: cx - 1, y: cy },
            { x: cx, y: cy + 1 },
            { x: cx, y: cy - 1 }
        ];

        posiciones.forEach(p => {
            if (p.x > 0 && p.x < this.cols - 1 && p.y > 0 && p.y < this.rows - 1) {
                this.maze[p.y][p.x] = 0;
            }
        });
    }

    dibujarLaberinto() {
        this.originX = Math.floor((1280 - this.cols * this.tile) / 2);

        const fondoLaberinto = this.add.rectangle(
            this.originX + (this.cols * this.tile) / 2,
            this.originY + (this.rows * this.tile) / 2,
            this.cols * this.tile + 18,
            this.rows * this.tile + 18,
            0x06122a,
            0.96
        );

        fondoLaberinto.setStrokeStyle(4, 0x8fc0ff, 1);
        fondoLaberinto.setDepth(4);

        const g = this.add.graphics();
        g.setDepth(5);

        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const px = this.originX + x * this.tile;
                const py = this.originY + y * this.tile;

                if (this.maze[y][x] === 1) {
                    g.fillStyle(0x1d376e, 1);
                    g.fillRect(px, py, this.tile, this.tile);

                    g.lineStyle(1, 0x6faeff, 0.35);
                    g.strokeRect(px, py, this.tile, this.tile);
                } else {
                    g.fillStyle(0x0b1c3f, 1);
                    g.fillRect(px, py, this.tile, this.tile);
                }
            }
        }

        for (let i = 0; i < 50; i++) {
            const celda = this.obtenerCeldaLibreAleatoria();
            const pos = this.celdaAPixel(celda.x, celda.y);

            const nodo = this.add.circle(pos.x, pos.y, Phaser.Math.Between(2, 4), 0x8fd5de, 0.32);
            nodo.setDepth(6);

            this.tweens.add({
                targets: nodo,
                alpha: 0.08,
                duration: Phaser.Math.Between(800, 1400),
                yoyo: true,
                repeat: -1
            });
        }
    }

    obtenerCeldaLibreAleatoria() {
        let x = 1;
        let y = 1;

        for (let i = 0; i < 200; i++) {
            x = Phaser.Math.Between(1, this.cols - 2);
            y = Phaser.Math.Between(1, this.rows - 2);

            if (this.maze[y][x] === 0) {
                return { x, y };
            }
        }

        return { x, y };
    }

    celdaAPixel(cx, cy) {
        return {
            x: this.originX + cx * this.tile + this.tile / 2,
            y: this.originY + cy * this.tile + this.tile / 2
        };
    }

    pixelACelda(x, y) {
        return {
            x: Math.floor((x - this.originX) / this.tile),
            y: Math.floor((y - this.originY) / this.tile)
        };
    }

    crearJugadores() {
        const inicioAlex = this.celdaAPixel(1, 1);
        const inicioValeria = this.celdaAPixel(this.cols - 2, this.rows - 2);

        this.alex = this.crearPersonaje({
            nombre: 'ALEX',
            x: inicioAlex.x,
            y: inicioAlex.y,
            tipo: 'alex'
        });

        if (this.jugadores === 2) {
            this.valeria = this.crearPersonaje({
                nombre: 'VALERIA',
                x: inicioValeria.x,
                y: inicioValeria.y,
                tipo: 'valeria'
            });
        } else {
            this.valeria = this.crearValeriaMeta(inicioValeria.x, inicioValeria.y);
        }
    }

    crearPersonaje(config) {
        const cont = this.add.container(config.x, config.y);
        cont.setDepth(30);

        if (config.tipo === 'alex') {
            const g = this.add.graphics();

            g.fillStyle(0x000000, 0.25);
            g.fillEllipse(0, 12, 22, 7);

            g.fillStyle(0x17345f, 1);
            g.fillRoundedRect(-4, 4, 8, 11, 2);

            g.fillStyle(0x2f7cf4, 1);
            g.fillRoundedRect(-8, -9, 16, 18, 3);

            g.lineStyle(2, 0x9ecbff, 1);
            g.strokeRoundedRect(-8, -9, 16, 18, 3);

            g.fillStyle(0xe8f4ff, 1);
            g.fillRect(-3, -6, 6, 12);

            g.fillStyle(0xf1c27d, 1);
            g.fillCircle(0, -17, 7);

            g.lineStyle(2, 0x9ecbff, 1);
            g.strokeCircle(0, -17, 7);

            g.fillStyle(0x071022, 1);
            g.fillCircle(-2.2, -18, 0.8);
            g.fillCircle(2.2, -18, 0.8);

            g.fillStyle(0x0d1b3a, 1);
            g.fillRoundedRect(-7, -27, 14, 5, 1);
            g.fillRoundedRect(-10, -23, 20, 3, 1);

            g.lineStyle(2, 0xd8e7ff, 1);
            g.strokeCircle(10, -1, 3.2);
            g.beginPath();
            g.moveTo(12, 2);
            g.lineTo(16, 6);
            g.strokePath();

            const label = this.add.text(0, 21, 'ALEX', {
                fontFamily: '"VT323", monospace',
                fontSize: '13px',
                color: '#ffffff',
                stroke: '#071022',
                strokeThickness: 3
            }).setOrigin(0.5);

            cont.add([g, label]);
        } else {
            const g = this.add.graphics();

            g.fillStyle(0x000000, 0.25);
            g.fillEllipse(0, 13, 23, 7);

            g.fillStyle(0xe63946, 1);
            g.fillTriangle(0, -2, -11, 15, 11, 15);

            g.lineStyle(2, 0xffb3c1, 1);
            g.strokeTriangle(0, -2, -11, 15, 11, 15);

            g.fillStyle(0x5a2d2d, 1);
            g.fillCircle(0, -12, 8);

            g.fillStyle(0xf1c27d, 1);
            g.fillCircle(0, -11, 6.8);

            g.lineStyle(2, 0xffb6dd, 1);
            g.strokeCircle(0, -11, 6.8);

            g.fillStyle(0x5a2d2d, 1);
            g.fillCircle(-3, -15, 3);
            g.fillCircle(3, -15, 3);
            g.fillCircle(0, -16, 3.5);

            g.fillStyle(0xf1c27d, 1);
            g.fillCircle(0, -10.4, 5.6);

            g.fillStyle(0x071022, 1);
            g.fillCircle(-2, -11, 0.8);
            g.fillCircle(2, -11, 0.8);

            g.fillStyle(0xffccd5, 0.9);
            g.fillTriangle(0, 1, -3, 7, 3, 7);

            const label = this.add.text(0, 22, 'VALERIA', {
                fontFamily: '"VT323", monospace',
                fontSize: '13px',
                color: '#ffffff',
                stroke: '#071022',
                strokeThickness: 3
            }).setOrigin(0.5);

            cont.add([g, label]);
        }

        cont.x = config.x;
        cont.y = config.y;

        return {
            nombre: config.nombre,
            x: config.x,
            y: config.y,
            contenedor: cont
        };
    }

    crearValeriaMeta(x, y) {
        const personaje = this.crearPersonaje({
            nombre: 'VALERIA',
            x,
            y,
            tipo: 'valeria'
        });

        this.tweens.add({
            targets: personaje.contenedor,
            scaleX: 1.12,
            scaleY: 1.12,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        const aura = this.add.circle(x, y, this.tile * 0.65, 0xffb6dd, 0.12);
        aura.setDepth(20);

        this.tweens.add({
            targets: aura,
            scaleX: 1.25,
            scaleY: 1.25,
            alpha: 0.03,
            duration: 900,
            yoyo: true,
            repeat: -1
        });

        return personaje;
    }

    crearHUD() {
        this.panelHUD = this.add.rectangle(640, 130, 1060, 56, 0x0b2356, 0.96);
        this.panelHUD.setStrokeStyle(3, 0xa9c8ff, 1);
        this.panelHUD.setDepth(50);

        this.txtTiempo = this.add.text(155, 130, 'Tiempo: 05:00', {
            fontFamily: '"VT323", monospace',
            fontSize: '27px',
            color: '#fff2a8',
            stroke: '#071022',
            strokeThickness: 4
        }).setOrigin(0, 0.5).setDepth(51);

        this.txtBonus = this.add.text(545, 130, 'Bonus tiempo: 600', {
            fontFamily: '"VT323", monospace',
            fontSize: '27px',
            color: '#8dff9c',
            stroke: '#071022',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(51);

        this.txtPreguntas = this.add.text(1115, 130, 'Preguntas: 0 pts', {
            fontFamily: '"VT323", monospace',
            fontSize: '27px',
            color: '#ffffff',
            stroke: '#071022',
            strokeThickness: 4
        }).setOrigin(1, 0.5).setDepth(51);

        const ayuda = this.jugadores === 2
            ? 'J1 Alex: WASD / mando 1   •   J2 Valeria: flechas / mando 2'
            : 'Mueve a Alex con WASD, flechas o mando. Encuentra a Valeria y responde preguntas';

        this.txtAyuda = this.add.text(640, 688, ayuda, {
            fontFamily: '"VT323", monospace',
            fontSize: '24px',
            color: '#dcecff',
            stroke: '#071022',
            strokeThickness: 4,
            align: 'center',
            wordWrap: { width: 1100, useAdvancedWrap: true }
        }).setOrigin(0.5).setDepth(50);
    }

    iniciarTemporizador() {
        this.timerEvento = this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (this.yaTermino) return;
                if (this.preguntaActiva) return;

                this.tiempoRestante -= 1;

                if (this.tiempoRestante <= 0) {
                    this.tiempoRestante = 0;
                    this.actualizarHUD();
                    this.finalizarMinijuego(false);
                    return;
                }

                this.actualizarHUD();
            },
            loop: true
        });
    }

    actualizarHUD() {
        const min = Math.floor(this.tiempoRestante / 60);
        const seg = this.tiempoRestante % 60;
        const textoTiempo = `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;

        if (this.txtTiempo) {
            this.txtTiempo.setText(`Tiempo: ${textoTiempo}`);
        }

        if (this.txtBonus) {
            const bonusPosible = Math.floor(this.tiempoRestante * 2);
            this.txtBonus.setText(`Bonus tiempo: ${bonusPosible}`);
        }

        if (this.txtPreguntas) {
            this.txtPreguntas.setText(`Preguntas: ${this.puntosPreguntas} pts`);
        }
    }

    moverJugador(jugador, delta, controles) {
        if (!jugador) return;

        let dx = 0;
        let dy = 0;

        if (controles.izquierda) dx -= 1;
        if (controles.derecha) dx += 1;
        if (controles.arriba) dy -= 1;
        if (controles.abajo) dy += 1;

        if (dx === 0 && dy === 0) return;

        if (dx !== 0 && dy !== 0) {
            dx *= 0.7071;
            dy *= 0.7071;
        }

        const dt = delta / 1000;
        const nuevoX = jugador.x + dx * this.velocidad * dt;
        const nuevoY = jugador.y + dy * this.velocidad * dt;

        if (this.esPosicionValida(nuevoX, jugador.y)) {
            jugador.x = nuevoX;
        }

        if (this.esPosicionValida(jugador.x, nuevoY)) {
            jugador.y = nuevoY;
        }

        jugador.contenedor.x = jugador.x;
        jugador.contenedor.y = jugador.y;
    }

    esPosicionValida(x, y) {
        const r = this.radioJugador;

        const puntos = [
            { x: x - r, y: y - r },
            { x: x + r, y: y - r },
            { x: x - r, y: y + r },
            { x: x + r, y: y + r },
            { x, y }
        ];

        for (let i = 0; i < puntos.length; i++) {
            const celda = this.pixelACelda(puntos[i].x, puntos[i].y);

            if (
                celda.x < 0 ||
                celda.x >= this.cols ||
                celda.y < 0 ||
                celda.y >= this.rows ||
                this.maze[celda.y][celda.x] === 1
            ) {
                return false;
            }
        }

        return true;
    }

    obtenerPreguntasBase() {
        return [
            {
                texto: 'Si varias personas se organizan para atacar a alguien en redes, ¿qué debes hacer?',
                opciones: ['Unirme al grupo', 'Guardar evidencia y avisar', 'Reenviar los mensajes'],
                correcta: 1,
                explicacion: 'Lo correcto es guardar evidencia y avisar a un adulto o autoridad.'
            },
            {
                texto: 'Si recibes una amenaza por mensaje, ¿qué acción es más segura?',
                opciones: ['Responder con otra amenaza', 'Ignorar y borrar todo', 'Bloquear, guardar prueba y reportar'],
                correcta: 2,
                explicacion: 'Ante una amenaza, se debe guardar prueba, bloquear y reportar.'
            },
            {
                texto: 'Si un grupo reparte tareas para molestar a una persona, eso se parece a...',
                opciones: ['Organización de ciberacoso', 'Una broma normal', 'Un mensaje positivo'],
                correcta: 0,
                explicacion: 'Cuando hay tareas, horarios o roles, existe organización del ataque.'
            },
            {
                texto: '¿Qué NO debes hacer si ves que atacan a alguien en redes?',
                opciones: ['Pedir ayuda', 'Compartir la burla', 'Tomar capturas como evidencia'],
                correcta: 1,
                explicacion: 'Compartir la burla aumenta el daño y hace crecer el acoso.'
            },
            {
                texto: '¿Cuál señal indica que un ataque digital está coordinado?',
                opciones: ['Un comentario aislado', 'Mensajes con horarios y tareas', 'Un mensaje de apoyo'],
                correcta: 1,
                explicacion: 'Los horarios y tareas muestran que varias personas se organizaron.'
            }
        ];
    }

    crearPreguntasMapa() {
        const preguntas = this.obtenerPreguntasBase();
        const celdasUsadas = new Set();

        preguntas.forEach((pregunta, index) => {
            let celda;

            if (index < 3 && this.puertasPregunta[index]) {
                celda = {
                    x: this.puertasPregunta[index].x,
                    y: this.puertasPregunta[index].y
                };
            } else {
                celda = this.obtenerCeldaParaPregunta(celdasUsadas, index);
            }

            celdasUsadas.add(`${celda.x}_${celda.y}`);

            const pos = this.celdaAPixel(celda.x, celda.y);

            const base = this.add.circle(pos.x, pos.y, this.tile * 0.36, 0xffdf8a, 0.95);
            base.setStrokeStyle(3, 0xffffff, 1);
            base.setDepth(24);

            const txt = this.add.text(pos.x, pos.y, '?', {
                fontFamily: '"VT323", monospace',
                fontSize: this.jugadores === 2 ? '28px' : '32px',
                color: '#40291a',
                stroke: '#ffffff',
                strokeThickness: 2
            }).setOrigin(0.5).setDepth(25);

            const aura = this.add.circle(pos.x, pos.y, this.tile * 0.48, 0xffdf8a, 0.16);
            aura.setDepth(23);

            this.tweens.add({
                targets: aura,
                scaleX: 1.35,
                scaleY: 1.35,
                alpha: 0.04,
                duration: 700,
                yoyo: true,
                repeat: -1
            });

            this.preguntasMapa.push({
                ...pregunta,
                index,
                x: pos.x,
                y: pos.y,
                celdaX: celda.x,
                celdaY: celda.y,
                respondida: false,
                elementos: [base, txt, aura]
            });
        });
    }

    obtenerCeldaParaPregunta(celdasUsadas, index = 0) {
        const zonasX = [0.18, 0.34, 0.58, 0.68, 0.86];
        const zonasY = [0.30, 0.70, 0.45, 0.25, 0.68];

        const targetX = Math.floor(this.cols * zonasX[index % zonasX.length]);
        const targetY = Math.floor(this.rows * zonasY[index % zonasY.length]);

        for (let i = 0; i < 250; i++) {
            const x = Phaser.Math.Clamp(targetX + Phaser.Math.Between(-5, 5), 2, this.cols - 3);
            const y = Phaser.Math.Clamp(targetY + Phaser.Math.Between(-4, 4), 2, this.rows - 3);

            if (this.maze[y][x] !== 0) continue;
            if (celdasUsadas.has(`${x}_${y}`)) continue;

            const distInicio = Math.abs(x - 1) + Math.abs(y - 1);
            const distFin = Math.abs(x - (this.cols - 2)) + Math.abs(y - (this.rows - 2));

            if (distInicio < 6 || distFin < 6) continue;

            return { x, y };
        }

        return this.obtenerCeldaLibreAleatoria();
    }

    verificarPreguntas(jugador) {
        if (!jugador || this.preguntaActiva) return;

        for (let i = 0; i < this.preguntasMapa.length; i++) {
            const pregunta = this.preguntasMapa[i];

            if (pregunta.respondida) continue;

            const distancia = Phaser.Math.Distance.Between(jugador.x, jugador.y, pregunta.x, pregunta.y);

            if (distancia <= this.tile * 0.52) {
                this.abrirPregunta(pregunta, jugador);
                return;
            }
        }
    }

    abrirPregunta(pregunta, jugador) {
        if (!pregunta || pregunta.respondida || this.preguntaActiva) return;

        this.preguntaActiva = pregunta;
        this.jugadorPregunta = jugador;
        this.opcionPreguntaIndex = 0;
        this.preguntaInputLiberado = false;
        this.preguntaCooldownHasta = this.time.now + 160;

        this.reproducirSFX('enter', 0.75);

        const esAlex = jugador.nombre === 'ALEX';

        const textoControles = esAlex
            ? (this.jugadores === 1
                ? 'Alex responde: W/S, ↑/↓ o mando para elegir  •  F, ENTER o botón A para responder'
                : 'Alex responde: W/S o mando 1 para elegir  •  F o botón A para responder')
            : 'Valeria responde: ↑/↓ o mando 2 para elegir  •  ENTER o botón A para responder';

        const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.72);
        overlay.setDepth(120);

        const panel = this.add.rectangle(640, 360, 960, 510, 0xf4e5bd, 1);
        panel.setStrokeStyle(5, 0x8a5a2b, 1);
        panel.setDepth(121);

        const titulo = this.add.text(640, 135, 'PREGUNTA DE LA RED', {
            fontFamily: '"VT323", monospace',
            fontSize: '42px',
            color: '#40291a',
            stroke: '#fff0c8',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(122);

        const quien = this.add.text(640, 176, `Turno de respuesta: ${jugador.nombre}`, {
            fontFamily: '"VT323", monospace',
            fontSize: '27px',
            color: esAlex ? '#1f4f9f' : '#9f2f6f',
            stroke: '#fff0c8',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(122);

        const cajaPregunta = this.add.rectangle(640, 248, 810, 100, 0xfff5d9, 1);
        cajaPregunta.setStrokeStyle(3, 0xc08a45, 1);
        cajaPregunta.setDepth(122);

        const texto = this.add.text(640, 248, pregunta.texto, {
            fontFamily: '"VT323", monospace',
            fontSize: '28px',
            color: '#2b1a10',
            align: 'center',
            wordWrap: { width: 750, useAdvancedWrap: true },
            lineSpacing: 3
        }).setOrigin(0.5).setDepth(123);

        const opciones = [];
        const letras = ['A', 'B', 'C'];

        pregunta.opciones.forEach((opcion, index) => {
            const y = 335 + index * 56;

            const bg = this.add.rectangle(640, y, 760, 46, 0x1d376e, 1);
            bg.setStrokeStyle(3, 0x9ecbff, 1);
            bg.setDepth(122);

            const indicador = this.add.text(285, y, '', {
                fontFamily: '"VT323", monospace',
                fontSize: '30px',
                color: '#fff2a8',
                stroke: '#071022',
                strokeThickness: 4
            }).setOrigin(0.5).setDepth(124);

            const txt = this.add.text(640, y, `${letras[index]}. ${opcion}`, {
                fontFamily: '"VT323", monospace',
                fontSize: '24px',
                color: '#ffffff',
                stroke: '#071022',
                strokeThickness: 4,
                align: 'center',
                wordWrap: { width: 680, useAdvancedWrap: true }
            }).setOrigin(0.5).setDepth(123);

            opciones.push({ bg, txt, indicador });
        });

        const resultadoBg = this.add.rectangle(640, 520, 810, 64, 0xfff5d9, 1);
        resultadoBg.setStrokeStyle(3, 0xc08a45, 1);
        resultadoBg.setDepth(122);
        resultadoBg.setVisible(false);

        const resultado = this.add.text(640, 520, '', {
            fontFamily: '"VT323", monospace',
            fontSize: '23px',
            color: '#2b1a10',
            align: 'center',
            wordWrap: { width: 760, useAdvancedWrap: true },
            lineSpacing: 2
        }).setOrigin(0.5).setDepth(123);

        const ayuda = this.add.text(640, 590, `${textoControles}\nSuelta los botones un momento para responder.`, {
            fontFamily: '"VT323", monospace',
            fontSize: '23px',
            color: '#5a3921',
            align: 'center',
            wordWrap: { width: 880, useAdvancedWrap: true }
        }).setOrigin(0.5).setDepth(122);

        this.elementosPregunta = [
            overlay,
            panel,
            titulo,
            quien,
            cajaPregunta,
            texto,
            resultadoBg,
            resultado,
            ayuda
        ];

        opciones.forEach(op => {
            this.elementosPregunta.push(op.bg, op.txt, op.indicador);
        });

        this.preguntaActiva.opcionesVisuales = opciones;
        this.preguntaActiva.resultadoTexto = resultado;
        this.preguntaActiva.resultadoBg = resultadoBg;
        this.preguntaAyudaTexto = ayuda;
        this.preguntaTextoControlesBase = textoControles;

        this.actualizarSeleccionPregunta();
    }

    obtenerInputPregunta(jugador) {
        const mando1 = this.leerMando(1);
        const mando2 = this.leerMando(2);

        let subir = false;
        let bajar = false;
        let confirmar = false;

        if (!jugador) {
            return {
                subir,
                bajar,
                confirmar,
                cualquiera: false
            };
        }

        if (jugador.nombre === 'ALEX') {
            subir = this.keys.W.isDown || mando1.arriba;
            bajar = this.keys.S.isDown || mando1.abajo;
            confirmar = this.keys.F.isDown || mando1.accion;

            if (this.jugadores === 1) {
                subir = subir || this.cursors.up.isDown;
                bajar = bajar || this.cursors.down.isDown;
                confirmar = confirmar || this.keys.ENTER.isDown;
            }
        }

        if (jugador.nombre === 'VALERIA') {
            subir = this.cursors.up.isDown || mando2.arriba;
            bajar = this.cursors.down.isDown || mando2.abajo;
            confirmar = this.keys.ENTER.isDown || mando2.accion;
        }

        return {
            subir,
            bajar,
            confirmar,
            cualquiera: subir || bajar || confirmar
        };
    }

    actualizarControlesPregunta(time) {
        if (!this.preguntaActiva || !this.jugadorPregunta) return;
        if (this.preguntaActiva.respondiendo) return;

        const ahora = time || this.time.now;
        const input = this.obtenerInputPregunta(this.jugadorPregunta);

        if (!this.preguntaInputLiberado) {
            if (!input.cualquiera) {
                this.preguntaInputLiberado = true;
                this.preguntaCooldownHasta = ahora + 150;

                if (this.preguntaAyudaTexto && this.preguntaAyudaTexto.setText) {
                    this.preguntaAyudaTexto.setText(this.preguntaTextoControlesBase);
                }
            }

            return;
        }

        if (ahora < this.preguntaCooldownHasta) return;

        if (input.subir) {
            this.moverSeleccionPregunta(-1);
            this.preguntaCooldownHasta = ahora + 220;
            return;
        }

        if (input.bajar) {
            this.moverSeleccionPregunta(1);
            this.preguntaCooldownHasta = ahora + 220;
            return;
        }

        if (input.confirmar) {
            this.preguntaCooldownHasta = ahora + 350;
            this.confirmarPregunta();
        }
    }

    moverSeleccionPregunta(direccion) {
        if (!this.preguntaActiva || this.preguntaActiva.respondiendo) return;

        this.opcionPreguntaIndex += direccion;

        if (this.opcionPreguntaIndex < 0) {
            this.opcionPreguntaIndex = this.preguntaActiva.opciones.length - 1;
        }

        if (this.opcionPreguntaIndex >= this.preguntaActiva.opciones.length) {
            this.opcionPreguntaIndex = 0;
        }

        this.reproducirClick(0.18);
        this.actualizarSeleccionPregunta();
    }

    actualizarSeleccionPregunta() {
        if (!this.preguntaActiva || !this.preguntaActiva.opcionesVisuales) return;

        this.preguntaActiva.opcionesVisuales.forEach((op, index) => {
            if (index === this.opcionPreguntaIndex) {
                op.bg.setFillStyle(0x2d82ff, 1);
                op.bg.setStrokeStyle(4, 0xfff19c, 1);
                op.txt.setColor('#ffffff');
                op.indicador.setText('►');
            } else {
                op.bg.setFillStyle(0x1d376e, 1);
                op.bg.setStrokeStyle(3, 0x9ecbff, 1);
                op.txt.setColor('#dcecff');
                op.indicador.setText('');
            }
        });
    }

    confirmarPregunta() {
        if (!this.preguntaActiva || this.preguntaActiva.respondiendo) return;

        const pregunta = this.preguntaActiva;
        pregunta.respondiendo = true;

        const correcta = this.opcionPreguntaIndex === pregunta.correcta;

        pregunta.opcionesVisuales.forEach((op, index) => {
            if (index === pregunta.correcta) {
                op.bg.setFillStyle(0x2f9f6a, 1);
                op.bg.setStrokeStyle(4, 0xb7ffc8, 1);
            } else if (index === this.opcionPreguntaIndex && !correcta) {
                op.bg.setFillStyle(0x9f2f3a, 1);
                op.bg.setStrokeStyle(4, 0xffb2b2, 1);
            } else {
                op.bg.setAlpha(0.55);
                op.txt.setAlpha(0.65);
            }
        });

        if (correcta) {
            this.reproducirSFX('collect', 0.7);

            this.puntosPreguntas += 25;
            this.preguntasCorrectas += 1;

            pregunta.resultadoBg.setVisible(true);
            pregunta.resultadoBg.setFillStyle(0xdfffdc, 1);
            pregunta.resultadoBg.setStrokeStyle(3, 0x52a85a, 1);

            pregunta.resultadoTexto.setColor('#1f7a35');
            pregunta.resultadoTexto.setText(`Correcto +25. ${pregunta.explicacion}`);
        } else {
            this.reproducirSFX('wrong', 0.75);

            this.puntosPreguntas = Math.max(0, this.puntosPreguntas - 15);
            this.preguntasIncorrectas += 1;

            pregunta.resultadoBg.setVisible(true);
            pregunta.resultadoBg.setFillStyle(0xffdddd, 1);
            pregunta.resultadoBg.setStrokeStyle(3, 0xc85a5a, 1);

            pregunta.resultadoTexto.setColor('#9f2f3a');
            pregunta.resultadoTexto.setText(`Incorrecto -15. Correcta: ${pregunta.opciones[pregunta.correcta]}`);
            this.cameras.main.shake(100, 0.003);
        }

        pregunta.respondida = true;

        if (pregunta.elementos) {
            pregunta.elementos.forEach(el => {
                if (el && el.destroy) el.destroy();
            });

            pregunta.elementos = [];
        }

        this.actualizarHUD();

        this.time.delayedCall(2300, () => {
            this.cerrarPregunta();
        });
    }

    cerrarPregunta() {
        this.elementosPregunta.forEach(el => {
            if (el && el.destroy) el.destroy();
        });

        this.elementosPregunta = [];
        this.preguntaActiva = null;
        this.jugadorPregunta = null;
        this.opcionPreguntaIndex = 0;

        this.preguntaInputLiberado = false;
        this.preguntaCooldownHasta = 0;
        this.preguntaAyudaTexto = null;
        this.preguntaTextoControlesBase = '';
    }

    verificarEncuentroUnJugador() {
        const distancia = Phaser.Math.Distance.Between(
            this.alex.x,
            this.alex.y,
            this.valeria.x,
            this.valeria.y
        );

        if (distancia <= this.tile * 0.75) {
            this.finalizarMinijuego(true);
        }
    }

    verificarEncuentroDosJugadores() {
        const distancia = Phaser.Math.Distance.Between(
            this.alex.x,
            this.alex.y,
            this.valeria.x,
            this.valeria.y
        );

        if (distancia <= this.tile * 0.85) {
            this.finalizarMinijuego(true);
        }
    }

    calcularBonus(encontrados) {
        const bonusPreguntas = this.puntosPreguntas;

        if (!encontrados) {
            return bonusPreguntas;
        }

        const bonusTiempo = Math.floor(this.tiempoRestante * 2);
        return bonusTiempo + bonusPreguntas;
    }

    finalizarMinijuego(encontrados) {
        if (this.yaTermino) return;

        this.yaTermino = true;
        this.encontrados = encontrados;

        if (this.timerEvento) {
            this.timerEvento.remove(false);
            this.timerEvento = null;
        }

        if (this.preguntaActiva) {
            this.cerrarPregunta();
        }

        if (encontrados) {
            this.cameras.main.shake(120, 0.003);
            this.crearEfectoEncuentro();

            this.time.delayedCall(800, () => {
                this.mostrarInformeFinal();
            });
        } else {
            this.time.delayedCall(500, () => {
                this.mostrarInformeFinal();
            });
        }
    }

    crearEfectoEncuentro() {
        const x = (this.alex.x + this.valeria.x) / 2;
        const y = (this.alex.y + this.valeria.y) / 2;

        const circulo = this.add.circle(x, y, 12, 0x8dff9c, 0.75);
        circulo.setDepth(90);

        this.tweens.add({
            targets: circulo,
            radius: 90,
            alpha: 0,
            duration: 650,
            ease: 'Sine.easeOut',
            onComplete: () => {
                circulo.destroy();
            }
        });

        const texto = this.add.text(x, y - 48, '¡SE ENCONTRARON!', {
            fontFamily: '"VT323", monospace',
            fontSize: '34px',
            color: '#8dff9c',
            stroke: '#071022',
            strokeThickness: 5
        }).setOrigin(0.5).setDepth(91);

        this.tweens.add({
            targets: texto,
            alpha: 0,
            y: texto.y - 25,
            duration: 900,
            onComplete: () => {
                texto.destroy();
            }
        });
    }

    reproducirClick(volumen = 0.35) {
        if (this.cache.audio.exists('click')) {
            this.sound.play('click', { volume: volumen });
        }
    }

    mostrarInformeFinal() {
        const bonus = this.calcularBonus(this.encontrados);
        const puntajeBase = this.puntajeDia || {};

        const puntajeActualizado = {
            ...puntajeBase,
            bonusMinijuego: bonus,
            totalBruto: (puntajeBase.totalBruto || 0) + bonus,
            total: (puntajeBase.total || 0) + bonus
        };

        const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.72);
        overlay.setDepth(100);

        const papel = this.add.rectangle(640, 360, 1080, 660, 0xf4e5bd, 1);
        papel.setStrokeStyle(5, 0x8a5a2b, 1);
        papel.setDepth(101);

        this.add.text(640, 66, 'INFORME DEL LABERINTO DIGITAL', {
            fontFamily: '"VT323", monospace',
            fontSize: '41px',
            color: '#40291a',
            stroke: '#fff0c8',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(102);

        const estado = this.encontrados
            ? 'Alex y Valeria lograron encontrarse dentro de la red.'
            : 'El tiempo terminó antes de que pudieran encontrarse.';

        this.add.text(640, 103, estado, {
            fontFamily: '"VT323", monospace',
            fontSize: '24px',
            color: '#5a3921'
        }).setOrigin(0.5).setDepth(102);

        const min = Math.floor(this.tiempoRestante / 60);
        const seg = this.tiempoRestante % 60;
        const textoTiempo = `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;

        this.add.text(
            640,
            133,
            `Tiempo restante: ${textoTiempo}  •  Preguntas: ${this.puntosPreguntas} pts  •  Bonus total: ${bonus} pts`,
            {
                fontFamily: '"VT323", monospace',
                fontSize: '21px',
                color: '#7a4a28'
            }
        ).setOrigin(0.5).setDepth(102);

        let y = 168;

        if (this.casos.length > 0) {
            this.casos.forEach((caso, index) => {
                const bloque = this.add.rectangle(640, y + 70, 930, 145, 0xfff5d9, 1);
                bloque.setStrokeStyle(3, 0xc08a45, 1);
                bloque.setDepth(102);

                this.add.text(205, y + 8, `${index + 1}. Persona identificada: ${caso.nombre}`, {
                    fontFamily: '"VT323", monospace',
                    fontSize: '25px',
                    color: '#2b1a10'
                }).setDepth(103);

                this.add.text(205, y + 36, `Delito cometido: ${caso.delito}`, {
                    fontFamily: '"VT323", monospace',
                    fontSize: '22px',
                    color: '#2b1a10'
                }).setDepth(103);

                this.add.text(205, y + 64, `Sanción correspondiente: ${caso.sancionTexto || caso.sancionCorta}`, {
                    fontFamily: '"VT323", monospace',
                    fontSize: '19px',
                    color: '#5a3921',
                    wordWrap: { width: 850, useAdvancedWrap: true }
                }).setDepth(103);

                this.add.text(205, y + 98, `Significado: ${caso.significadoSancion || 'Esta sanción corresponde al daño causado por la conducta detectada.'}`, {
                    fontFamily: '"VT323", monospace',
                    fontSize: '18px',
                    color: '#5a3921',
                    wordWrap: { width: 850, useAdvancedWrap: true }
                }).setDepth(103);

                y += 153;
            });
        }

        const btn = this.add.rectangle(640, 675, 320, 52, 0x2d82ff, 1);
        btn.setStrokeStyle(3, 0xffffff, 1);
        btn.setDepth(104);

        this.add.text(640, 675, 'CONTINUAR', {
            fontFamily: '"VT323", monospace',
            fontSize: '32px',
            color: '#ffffff',
            stroke: '#071021',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(105);

        const zone = this.add.zone(640, 675, 320, 52);
        zone.setInteractive({ cursor: 'pointer' });
        zone.setDepth(106);

        zone.on('pointerover', () => {
            btn.setFillStyle(0x4b9bff, 1);
        });

        zone.on('pointerout', () => {
            btn.setFillStyle(0x2d82ff, 1);
        });

        zone.on('pointerdown', () => {
            this.reproducirClick();

            this.cameras.main.fadeOut(350, 0, 0, 0);

            this.time.delayedCall(350, () => {
                this.scene.start('PuntajeDia', {
                    puntajeDia: puntajeActualizado,
                    siguienteEstado: this.siguienteEstado,
                    modoJuego: this.modoJuego,
                    jugadores: this.jugadores,
                    resultadoMinijuego: {
                        bonus,
                        encontrados: this.encontrados,
                        tiempoRestante: this.tiempoRestante,
                        puntosPreguntas: this.puntosPreguntas,
                        preguntasCorrectas: this.preguntasCorrectas,
                        preguntasIncorrectas: this.preguntasIncorrectas
                    }
                });
            });
        });
    }

    cargarAudioMinijuego() {
        if (!this.cache.audio.exists('musicaMinijuegos')) {
            this.load.audio('musicaMinijuegos', 'music/Minijuegos.mp3');
        }

        if (!this.cache.audio.exists('collect')) {
            this.load.audio('collect', 'music/Collect.mp3');
        }

        if (!this.cache.audio.exists('wrong')) {
            this.load.audio('wrong', 'music/wrong.mp3');
        }

        if (!this.cache.audio.exists('disparo')) {
            this.load.audio('disparo', 'music/disparo.mp3');
        }

        if (!this.cache.audio.exists('enter')) {
            this.load.audio('enter', 'music/enter.mp3');
        }

        if (!this.cache.audio.exists('click')) {
            this.load.audio('click', 'music/click.mp3');
        }
    }

    _obtenerVolumenMinijuego() {
        let volumen = this.game.registry.get('volumenMinijuegos');

        if (typeof volumen !== 'number') {
            volumen = 0.10;
            this.game.registry.set('volumenMinijuegos', volumen);
        }

        return Phaser.Math.Clamp(volumen, 0, 1);
    }

    _setVolumenMinijuego(volumen) {
        volumen = Phaser.Math.Clamp(volumen, 0, 1);

        this.volumenMinijuegos = volumen;
        this.game.registry.set('volumenMinijuegos', volumen);
        this.game.registry.set('volumenGlobal', volumen);

        if (this.musicaMinijuegos) {
            this.musicaMinijuegos.setVolume(volumen);
        }

        if (this.volFillMini) {
            this.volFillMini.width = 120 * volumen;
        }

        if (this.volKnobMini) {
            this.volKnobMini.x = this.volBarXMini - 60 + 120 * volumen;
        }

        if (this.volTxtMini) {
            this.volTxtMini.setText(`VOL ${Math.round(volumen * 100)}%`);
        }
    }

    iniciarMusicaMinijuego() {
        this.volumenMinijuegos = this._obtenerVolumenMinijuego();

        if (this.cache.audio.exists('musicaMinijuegos')) {
            this.musicaMinijuegos = this.sound.add('musicaMinijuegos', {
                volume: this.volumenMinijuegos,
                loop: true
            });

            this.musicaMinijuegos.play();
        }

        this.events.off('shutdown', this.detenerAudioMinijuego, this);
        this.events.off('destroy', this.detenerAudioMinijuego, this);

        this.events.on('shutdown', this.detenerAudioMinijuego, this);
        this.events.on('destroy', this.detenerAudioMinijuego, this);
    }

    crearBarraVolumenMinijuego() {
        this.volBarXMini = 1130;
        this.volBarYMini = 42;
        this.arrastrandoVolMini = false;

        const bg = this.add.rectangle(this.volBarXMini, this.volBarYMini, 150, 34, 0x071022, 0.82);
        bg.setStrokeStyle(2, 0x9ecbff, 1);
        bg.setDepth(300);

        this.volTxtMini = this.add.text(this.volBarXMini, this.volBarYMini - 25, '', {
            fontFamily: '"VT323", monospace',
            fontSize: '18px',
            color: '#ffffff',
            stroke: '#071022',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(301);

        const track = this.add.rectangle(this.volBarXMini, this.volBarYMini, 120, 7, 0x23385f, 1);
        track.setDepth(301);

        this.volFillMini = this.add.rectangle(this.volBarXMini - 60, this.volBarYMini, 1, 7, 0x8dff9c, 1);
        this.volFillMini.setOrigin(0, 0.5);
        this.volFillMini.setDepth(302);

        this.volKnobMini = this.add.circle(this.volBarXMini - 60, this.volBarYMini, 9, 0xffffff, 1);
        this.volKnobMini.setStrokeStyle(2, 0x071022, 1);
        this.volKnobMini.setDepth(303);

        const zona = this.add.zone(this.volBarXMini, this.volBarYMini, 140, 34);
        zona.setInteractive({ cursor: 'pointer' });
        zona.setDepth(304);

        const moverVolumen = (pointer) => {
            const minX = this.volBarXMini - 60;
            const maxX = this.volBarXMini + 60;
            const nuevoVol = Phaser.Math.Clamp((pointer.x - minX) / (maxX - minX), 0, 1);

            this._setVolumenMinijuego(nuevoVol);
        };

        zona.on('pointerdown', (pointer) => {
            this.arrastrandoVolMini = true;
            moverVolumen(pointer);
        });

        this.pointerMoveVolMiniHandler = (pointer) => {
            if (this.arrastrandoVolMini) {
                moverVolumen(pointer);
            }
        };

        this.pointerUpVolMiniHandler = () => {
            this.arrastrandoVolMini = false;
        };

        this.input.on('pointermove', this.pointerMoveVolMiniHandler);
        this.input.on('pointerup', this.pointerUpVolMiniHandler);

        this._setVolumenMinijuego(this.volumenMinijuegos);
    }

    reproducirSFX(clave, volumenBase = 0.6) {
        if (!this.cache.audio.exists(clave)) return;

        const volumenEscena = typeof this.volumenMinijuegos === 'number'
            ? this.volumenMinijuegos
            : this._obtenerVolumenMinijuego();

        let ajuste = 1;

        if (clave === 'collect') {
            ajuste = 0.55;
        }

        if (clave === 'wrong') {
            ajuste = 0.50;
        }

        const volumenFinal = Phaser.Math.Clamp(
            volumenBase * ajuste * (0.35 + volumenEscena),
            0,
            1
        );

        this.sound.play(clave, {
            volume: volumenFinal
        });
    }

    detenerAudioMinijuego() {
        if (this.pointerMoveVolMiniHandler) {
            this.input.off('pointermove', this.pointerMoveVolMiniHandler);
            this.pointerMoveVolMiniHandler = null;
        }

        if (this.pointerUpVolMiniHandler) {
            this.input.off('pointerup', this.pointerUpVolMiniHandler);
            this.pointerUpVolMiniHandler = null;
        }

        if (this.musicaMinijuegos) {
            if (this.musicaMinijuegos.isPlaying) {
                this.musicaMinijuegos.stop();
            }

            this.musicaMinijuegos.destroy();
            this.musicaMinijuegos = null;
        }
    }
}