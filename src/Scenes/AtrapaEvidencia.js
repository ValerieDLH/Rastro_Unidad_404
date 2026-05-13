export class AtrapaEvidencia extends Phaser.Scene {
    constructor() {
        super('AtrapaEvidencia');
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

        this.objetivoIndex = 0;
        this.etapaActual = 'sancion';
        this.notaFinalActiva = false;
        this.aNotaAnterior = false;
        this.continuarNotaFinal = null;

        this.letrasRecogidasCounts = {};
        this.objetosCayendo = [];

        this.puntosMini = 0;
        this.piedrasRecogidas = 0;
        this.letrasPerdidas = 0;

        this.spawnTimer = null;
        this.juegoTerminado = false;

        this.cajaY = 615;
        this.cajaAncho = 180;
        this.cajaAlto = 54;
        this.lineaSueloY = 588;

        this.cajas = [];

        this.musicaMinijuegos = null;
        this.volumenMinijuegos = null;
        this.arrastrandoVolMini = false;
        this.pointerMoveVolMiniHandler = null;
        this.pointerUpVolMiniHandler = null;
        this.pointerMoveCajaHandler = null;
    }

    preload() {
        this.cargarAudioMinijuego();
    }

    create() {
        this.cameras.main.setBackgroundColor('#04112c');

        this.crearFondo();
        this.crearTitulo();
        this.crearHUD();
        this.crearCajas();

        this.cursors = this.input.keyboard.createCursorKeys();

        this.keys = this.input.keyboard.addKeys({
            A: Phaser.Input.Keyboard.KeyCodes.A,
            D: Phaser.Input.Keyboard.KeyCodes.D,
            LEFT: Phaser.Input.Keyboard.KeyCodes.LEFT,
            RIGHT: Phaser.Input.Keyboard.KeyCodes.RIGHT
        });

        this.iniciarMandos();

        this.iniciarMusicaMinijuego();
        this.crearBarraVolumenMinijuego();

        if (!this.casos.length) {
            this.mostrarNotaFinal();
            return;
        }

        this.iniciarObjetivoActual();

        this.spawnTimer = this.time.addEvent({
            delay: 620,
            callback: this.generarObjeto,
            callbackScope: this,
            loop: true
        });
    }

    update(time, delta) {
        if (this.juegoTerminado) {
            this.actualizarAceptarNotaFinalRK();
            return;
        }

        this.actualizarMovimientoCaja(delta);
        this.actualizarObjetosCayendo(delta);
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
                izquierda: false,
                derecha: false,
                ejeX: 0,
                accion: false
            };
        }

        const ejeX = this.leerEjeMando(pad, 0);

        return {
            conectado: true,
            izquierda: ejeX < -0.35 || this.botonMandoPresionado(pad, 14),
            derecha: ejeX > 0.35 || this.botonMandoPresionado(pad, 15),
            accion: this.botonMandoPresionado(pad, 0),
            ejeX
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

    crearFondo() {
        this.add.rectangle(640, 360, 1280, 720, 0x04112c, 1);

        for (let i = 0; i < 75; i++) {
            const x = Phaser.Math.Between(0, 1280);
            const y = Phaser.Math.Between(0, 720);
            const alpha = Phaser.Math.FloatBetween(0.10, 0.45);

            const estrella = this.add.circle(x, y, Phaser.Math.Between(1, 3), 0x7bb8ff, alpha);

            this.tweens.add({
                targets: estrella,
                alpha: Phaser.Math.FloatBetween(0.05, 0.25),
                duration: Phaser.Math.Between(900, 1800),
                yoyo: true,
                repeat: -1
            });
        }

        this.add.rectangle(640, this.lineaSueloY, 1280, 4, 0x3b89ff, 1).setDepth(2);
        this.add.rectangle(640, 650, 1280, 140, 0x081a3f, 0.88).setDepth(1);
    }

    crearTitulo() {
        const panel = this.add.rectangle(640, 72, 900, 88, 0x0a1f4d, 0.98);
        panel.setStrokeStyle(3, 0xa9c8ff, 1);

        this.add.text(640, 54, 'ATRAPA LA EVIDENCIA', {
            fontFamily: '"VT323", monospace',
            fontSize: '54px',
            color: '#ffffff',
            stroke: '#071022',
            strokeThickness: 6
        }).setOrigin(0.5);

        this.add.text(640, 96, 'Recoge letras verdes. Evita piedras. No dejes caer letras.', {
            fontFamily: '"VT323", monospace',
            fontSize: '25px',
            color: '#d7e6ff'
        }).setOrigin(0.5);
    }

    crearHUD() {
        this.panelInfo = this.add.rectangle(640, 205, 1150, 150, 0x0b2356, 0.97);
        this.panelInfo.setStrokeStyle(3, 0xa9c8ff, 1);

        this.txtObjetivo = this.add.text(120, 145, '', {
            fontFamily: '"VT323", monospace',
            fontSize: '31px',
            color: '#8dff9c',
            stroke: '#071022',
            strokeThickness: 4
        });

        this.txtModo = this.add.text(120, 184, '', {
            fontFamily: '"VT323", monospace',
            fontSize: '29px',
            color: '#fff2a8',
            stroke: '#071022',
            strokeThickness: 4
        });

        this.txtSubtitulo = this.add.text(120, 223, '', {
            fontFamily: '"VT323", monospace',
            fontSize: '27px',
            color: '#ffffff',
            stroke: '#071022',
            strokeThickness: 4,
            wordWrap: { width: 760, useAdvancedWrap: true }
        });

        this.txtPuntos = this.add.text(1115, 150, 'Puntos: 0\nPiedras: 0\nLetras perdidas: 0', {
            fontFamily: '"VT323", monospace',
            fontSize: '26px',
            color: '#ffffff',
            align: 'right',
            stroke: '#071022',
            strokeThickness: 4
        }).setOrigin(1, 0);

        this.txtProgreso = this.add.text(640, 325, '', {
            fontFamily: '"VT323", monospace',
            fontSize: '42px',
            color: '#fff2a8',
            stroke: '#071022',
            strokeThickness: 5,
            align: 'center'
        }).setOrigin(0.5);

        this.txtIndicacion = this.add.text(640, 670, '', {
            fontFamily: '"VT323", monospace',
            fontSize: '28px',
            color: '#dcecff',
            stroke: '#071022',
            strokeThickness: 4
        }).setOrigin(0.5);
    }

    crearCajas() {
        this.cajas = [];

        if (this.jugadores === 2) {
            this.crearUnaCaja(0, 430, 'CAJA 1', {
                base: 0x2f7cf4,
                borde: 0x8fc0ff,
                ranura: 0x0c2b64,
                stroke: 0xffffff,
                brillo1: 0x6fb6ff,
                brillo2: 0xb8dcff
            });

            this.crearUnaCaja(1, 850, 'CAJA 2', {
                base: 0xe05a47,
                borde: 0xffa08f,
                ranura: 0x6b1f16,
                stroke: 0xffffff,
                brillo1: 0xff8a78,
                brillo2: 0xffc2b8
            });

            this.txtIndicacion.setText('Caja 1: A/D o mando 1   •   Caja 2: ←/→ o mando 2');
            return;
        }

        this.crearUnaCaja(0, 640, 'CAJA', {
            base: 0xb9772f,
            borde: 0xd69345,
            ranura: 0x6b3a16,
            stroke: 0x5a3212,
            brillo1: 0xe0a45e,
            brillo2: 0xe0a45e
        });

        this.txtIndicacion.setText('Mueve la caja con ← →, A/D o mando RKGAME');
    }

    crearUnaCaja(indice, x, texto, colores) {
        const caja = {
            indice,
            x,
            y: this.cajaY,
            ancho: this.cajaAncho,
            alto: this.cajaAlto
        };

        caja.sombra = this.add.rectangle(
            x,
            this.cajaY + 8,
            this.cajaAncho + 10,
            this.cajaAlto + 10,
            0x000000,
            0.25
        );
        caja.sombra.setDepth(14);

        caja.base = this.add.rectangle(
            x,
            this.cajaY,
            this.cajaAncho,
            this.cajaAlto,
            colores.base,
            1
        );
        caja.base.setDepth(15);
        caja.base.setStrokeStyle(4, colores.stroke, 1);

        caja.bordeSuperior = this.add.rectangle(
            x,
            this.cajaY - 28,
            this.cajaAncho + 16,
            22,
            colores.borde,
            1
        );
        caja.bordeSuperior.setDepth(16);
        caja.bordeSuperior.setStrokeStyle(4, colores.stroke, 1);

        caja.ranura = this.add.rectangle(
            x,
            this.cajaY - 25,
            this.cajaAncho - 28,
            12,
            colores.ranura,
            1
        );
        caja.ranura.setDepth(17);
        caja.ranura.setStrokeStyle(2, 0x1a1a1a, 1);

        caja.brillo1 = this.add.rectangle(
            x - 55,
            this.cajaY,
            18,
            36,
            colores.brillo1,
            0.75
        );
        caja.brillo1.setDepth(17);

        caja.brillo2 = this.add.rectangle(
            x + 40,
            this.cajaY - 1,
            16,
            32,
            colores.brillo2,
            0.55
        );
        caja.brillo2.setDepth(17);

        caja.texto = this.add.text(x, this.cajaY + 42, texto, {
            fontFamily: '"VT323", monospace',
            fontSize: '26px',
            color: '#ffffff',
            stroke: '#061225',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(17);

        this.cajas[indice] = caja;
    }

    moverCajaA(indice, x) {
        const caja = this.cajas[indice];
        if (!caja) return;

        let minX = 100;
        let maxX = 1180;

        if (this.jugadores === 2) {
            if (indice === 0) {
                minX = 100;
                maxX = 560;
            }

            if (indice === 1) {
                minX = 720;
                maxX = 1180;
            }
        }

        caja.x = Phaser.Math.Clamp(x, minX, maxX);

        caja.sombra.x = caja.x;
        caja.base.x = caja.x;
        caja.bordeSuperior.x = caja.x;
        caja.ranura.x = caja.x;
        caja.brillo1.x = caja.x - 55;
        caja.brillo2.x = caja.x + 40;
        caja.texto.x = caja.x;
    }

    actualizarMovimientoCaja(delta) {
        const velocidad = 540;
        const mando1 = this.leerMando(1);
        const mando2 = this.leerMando(2);

        if (this.jugadores === 2) {
            let direccionCaja1 = 0;
            let direccionCaja2 = 0;

            if (this.keys.A.isDown || mando1.izquierda) {
                direccionCaja1 = -1;
            }

            if (this.keys.D.isDown || mando1.derecha) {
                direccionCaja1 = 1;
            }

            if (this.cursors.left.isDown || mando2.izquierda) {
                direccionCaja2 = -1;
            }

            if (this.cursors.right.isDown || mando2.derecha) {
                direccionCaja2 = 1;
            }

            if (direccionCaja1 !== 0 && this.cajas[0]) {
                this.moverCajaA(
                    0,
                    this.cajas[0].x + direccionCaja1 * velocidad * (delta / 1000)
                );
            }

            if (direccionCaja2 !== 0 && this.cajas[1]) {
                this.moverCajaA(
                    1,
                    this.cajas[1].x + direccionCaja2 * velocidad * (delta / 1000)
                );
            }

            return;
        }

        let direccion = 0;

        if (this.cursors.left.isDown || this.keys.A.isDown || mando1.izquierda) {
            direccion = -1;
        }

        if (this.cursors.right.isDown || this.keys.D.isDown || mando1.derecha) {
            direccion = 1;
        }

        if (direccion !== 0 && this.cajas[0]) {
            this.moverCajaA(
                0,
                this.cajas[0].x + direccion * velocidad * (delta / 1000)
            );
        }
    }
    iniciarObjetivoActual() {
        if (this.objetivoIndex >= this.casos.length) {
            this.mostrarNotaFinal();
            return;
        }

        this.etapaActual = 'sancion';
        this.letrasRecogidasCounts = {};
        this.limpiarObjetosCayendo();

        const caso = this.casos[this.objetivoIndex];

        this.txtObjetivo.setText(`Objetivo ${this.objetivoIndex + 1}/${this.casos.length}`);
        this.txtModo.setText('Modo: SANCIÓN CORRESPONDIENTE');
        this.txtSubtitulo.setText(`Sanción: ${caso.sancionCorta}`);

        this.actualizarProgreso();
    }

    obtenerCasoActual() {
        return this.casos[this.objetivoIndex] || null;
    }
    obtenerTextoObjetivoActualOriginal() {
        const caso = this.obtenerCasoActual();
        if (!caso) return '';

        return caso.sancionCorta || '';
    }

    limpiarTexto(texto) {
        return String(texto || '')
            .toUpperCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^A-Z0-9]/g, '');
    }

    obtenerTextoObjetivoActualLimpio() {
        return this.limpiarTexto(this.obtenerTextoObjetivoActualOriginal());
    }

    contarCaracteres(lista) {
        const counts = {};

        lista.forEach(letra => {
            counts[letra] = (counts[letra] || 0) + 1;
        });

        return counts;
    }

    contarLetrasEnPantalla() {
        const letras = this.objetosCayendo
            .filter(obj => obj.tipo === 'letra')
            .map(obj => obj.valor);

        return this.contarCaracteres(letras);
    }

    obtenerLetrasPendientesDisponibles() {
        const texto = this.obtenerTextoObjetivoActualLimpio();
        const totalCounts = this.contarCaracteres(texto.split(''));
        const pantallaCounts = this.contarLetrasEnPantalla();

        const disponibles = [];

        Object.keys(totalCounts).forEach(letra => {
            const total = totalCounts[letra] || 0;
            const recogidas = this.letrasRecogidasCounts[letra] || 0;
            const enPantalla = pantallaCounts[letra] || 0;

            const faltan = total - recogidas - enPantalla;

            for (let i = 0; i < faltan; i++) {
                disponibles.push(letra);
            }
        });

        return disponibles;
    }

    totalLetrasRecogidas() {
        return Object.values(this.letrasRecogidasCounts).reduce((acc, val) => acc + val, 0);
    }

    actualizarProgreso() {
        const texto = this.obtenerTextoObjetivoActualLimpio();

        if (!texto) {
            this.txtProgreso.setText('');
            return;
        }

        const copiaCounts = { ...this.letrasRecogidasCounts };
        let progreso = '';

        for (let i = 0; i < texto.length; i++) {
            const letra = texto[i];

            if ((copiaCounts[letra] || 0) > 0) {
                progreso += letra;
                copiaCounts[letra] -= 1;
            } else {
                progreso += '_';
            }
        }

        this.txtProgreso.setText(progreso);

        this.txtPuntos.setText(
            `Puntos: ${this.puntosMini}\n` +
            `Piedras: ${this.piedrasRecogidas}\n` +
            `Letras perdidas: ${this.letrasPerdidas}`
        );
    }
    obtenerXLibre(intentos = 40) {
        const distanciaMinimaX = 115;
        const distanciaMinimaY = 135;

        let carriles;

        if (this.jugadores === 2) {
            carriles = [
                120, 210, 300, 390, 480, 555,
                725, 815, 905, 995, 1085, 1170
            ];
        } else {
            carriles = [
                120, 220, 320, 420, 520, 620,
                720, 820, 920, 1020, 1120, 1190
            ];
        }

        Phaser.Utils.Array.Shuffle(carriles);

        for (let i = 0; i < carriles.length; i++) {
            const x = carriles[i];

            const ocupado = this.objetosCayendo.some(obj => {
                const distanciaX = Math.abs(obj.x - x);
                const distanciaY = Math.abs(obj.y - (-40));

                return distanciaX < distanciaMinimaX && distanciaY < distanciaMinimaY;
            });

            if (!ocupado) {
                return x;
            }
        }

        return null;
    }
    generarObjeto() {
        if (this.juegoTerminado) return;

        const disponibles = this.obtenerLetrasPendientesDisponibles();

        if (disponibles.length > 0) {
            const letra = Phaser.Utils.Array.GetRandom(disponibles);
            this.crearLetraCorrecta(letra);
        }

        const piedrasEnPantalla = this.objetosCayendo.filter(obj => obj.tipo === 'piedra').length;
        const letrasEnPantalla = this.objetosCayendo.filter(obj => obj.tipo === 'letra').length;

        const puedeCrearPiedra =
            piedrasEnPantalla < 2 &&
            letrasEnPantalla < 5 &&
            disponibles.length > 0;

        if (puedeCrearPiedra && Phaser.Math.Between(1, 100) <= 24) {
            this.time.delayedCall(260, () => {
                if (!this.juegoTerminado) {
                    this.crearPiedra();
                }
            });
        }
    }

    crearLetraCorrecta(letra) {
        const x = this.obtenerXLibre();

        if (x === null) {
            return;
        }

        const y = -40;

        const circulo = this.add.circle(x, y, 30, 0x2fba68, 1);
        circulo.setStrokeStyle(4, 0xffffff, 1);
        circulo.setDepth(30);

        const txt = this.add.text(x, y, letra, {
            fontFamily: '"VT323", monospace',
            fontSize: '42px',
            color: '#ffffff',
            stroke: '#082314',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(31);

        this.objetosCayendo.push({
            tipo: 'letra',
            valor: letra,
            x,
            y,
            velocidad: Phaser.Math.Between(155, 205),
            shape: circulo,
            text: txt,
            radio: 30
        });
    }

    crearPiedra() {
        const x = this.obtenerXLibre();

        if (x === null) {
            return;
        }

        const y = -40;

        const hitboxInvisible = this.add.circle(x, y, 30, 0x000000, 0);
        hitboxInvisible.setDepth(30);

        const txt = this.add.text(x, y, '🪨', {
            fontSize: '42px'
        }).setOrigin(0.5).setDepth(31);

        this.objetosCayendo.push({
            tipo: 'piedra',
            valor: '🪨',
            x,
            y,
            velocidad: Phaser.Math.Between(175, 220),
            shape: hitboxInvisible,
            text: txt,
            radio: 30
        });
    }

    actualizarObjetosCayendo(delta) {
        for (let i = this.objetosCayendo.length - 1; i >= 0; i--) {
            const obj = this.objetosCayendo[i];

            obj.y += obj.velocidad * (delta / 1000);
            obj.shape.y = obj.y;
            obj.text.y = obj.y;
            obj.shape.x = obj.x;
            obj.text.x = obj.x;

            const cajaQueAtrapo = this.objetoCaeEnCaja(obj);

            if (cajaQueAtrapo) {
                if (obj.tipo === 'letra') {
                    this.recogerLetra(obj, cajaQueAtrapo);
                } else {
                    this.recogerPiedra(cajaQueAtrapo);
                }

                this.eliminarObjeto(i);
                continue;
            }

            if (obj.y >= this.lineaSueloY - 5) {
                if (obj.tipo === 'letra') {
                    this.perderLetra(obj);
                }

                this.eliminarObjeto(i);
            }
        }
    }

    objetoCaeEnCaja(obj) {
        for (let i = 0; i < this.cajas.length; i++) {
            const caja = this.cajas[i];
            if (!caja) continue;

            const left = caja.x - caja.ancho / 2;
            const right = caja.x + caja.ancho / 2;
            const top = caja.y - caja.alto / 2 - 35;
            const bottom = caja.y + caja.alto / 2;

            const dentro =
                obj.x >= left &&
                obj.x <= right &&
                obj.y >= top &&
                obj.y <= bottom;

            if (dentro) {
                return caja;
            }
        }

        return null;
    }

    recogerLetra(obj, caja) {
        const objetivo = this.obtenerTextoObjetivoActualLimpio();
        const totalCounts = this.contarCaracteres(objetivo.split(''));
        const recogidas = this.letrasRecogidasCounts[obj.valor] || 0;

        if (recogidas >= totalCounts[obj.valor]) {
            this.reproducirSFX('wrong', 0.75);
            return;
        }

        this.reproducirSFX('collect', 0.7);

        this.letrasRecogidasCounts[obj.valor] = recogidas + 1;
        this.puntosMini += 10;

        if (caja) {
            this.tweens.add({
                targets: [caja.base, caja.bordeSuperior],
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 90,
                yoyo: true
            });
        }

        this.actualizarProgreso();

        if (this.totalLetrasRecogidas() >= objetivo.length) {
            this.time.delayedCall(350, () => {
                this.avanzarEtapa();
            });
        }
    }

    recogerPiedra(caja) {
        this.reproducirSFX('wrong', 0.75);

        this.piedrasRecogidas += 1;
        this.puntosMini = Math.max(0, this.puntosMini - 8);

        this.cameras.main.shake(100, 0.005);

        if (caja) {
            this.tweens.add({
                targets: caja.base,
                angle: 5,
                duration: 60,
                yoyo: true,
                repeat: 1,
                onComplete: () => {
                    caja.base.angle = 0;
                }
            });
        }

        this.actualizarProgreso();
    }

    perderLetra(obj) {
        this.reproducirSFX('wrong', 0.75);

        this.letrasPerdidas += 1;
        this.puntosMini = Math.max(0, this.puntosMini - 5);

        const aviso = this.add.text(obj.x, this.lineaSueloY - 35, '-5', {
            fontFamily: '"VT323", monospace',
            fontSize: '30px',
            color: '#ff8b8b',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(50);

        this.tweens.add({
            targets: aviso,
            y: aviso.y - 35,
            alpha: 0,
            duration: 550,
            onComplete: () => {
                aviso.destroy();
            }
        });

        this.cameras.main.shake(60, 0.002);
        this.actualizarProgreso();
    }
    avanzarEtapa() {
        this.objetivoIndex += 1;
        this.etapaActual = 'sancion';

        if (this.objetivoIndex >= this.casos.length) {
            this.mostrarNotaFinal();
            return;
        }

        this.iniciarObjetivoActual();
    }

    eliminarObjeto(indice) {
        const obj = this.objetosCayendo[indice];

        if (obj) {
            if (obj.shape && obj.shape.destroy) obj.shape.destroy();
            if (obj.text && obj.text.destroy) obj.text.destroy();
        }

        this.objetosCayendo.splice(indice, 1);
    }

    limpiarObjetosCayendo() {
        this.objetosCayendo.forEach(obj => {
            if (obj.shape && obj.shape.destroy) obj.shape.destroy();
            if (obj.text && obj.text.destroy) obj.text.destroy();
        });

        this.objetosCayendo = [];
    }

    mostrarNotaFinal() {
        this.juegoTerminado = true;
        this.notaFinalActiva = true;
        this.aNotaAnterior = false;

        if (this.spawnTimer) {
            this.spawnTimer.remove(false);
            this.spawnTimer = null;
        }

        this.limpiarObjetosCayendo();

        const bonus = this.puntosMini;

        const puntajeActualizado = {
            ...this.puntajeDia,
            bonusMinijuego: bonus,
            totalBruto: (this.puntajeDia?.totalBruto || 0) + bonus,
            total: (this.puntajeDia?.total || 0) + bonus
        };

        const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.72);
        overlay.setDepth(100);

        const papel = this.add.rectangle(640, 360, 1080, 660, 0xf4e5bd, 1);
        papel.setStrokeStyle(5, 0x8a5a2b, 1);
        papel.setDepth(101);

        this.add.text(640, 68, 'INFORME DEL DETECTIVE ALEX', {
            fontFamily: '"VT323", monospace',
            fontSize: '46px',
            color: '#40291a',
            stroke: '#fff0c8',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(102);

        this.add.text(640, 108, 'Evidencias recuperadas durante el minijuego', {
            fontFamily: '"VT323", monospace',
            fontSize: '26px',
            color: '#5a3921'
        }).setOrigin(0.5).setDepth(102);

        this.add.text(640, 140, `Bonus obtenido: ${bonus} puntos  •  Piedras recogidas: ${this.piedrasRecogidas}  •  Letras perdidas: ${this.letrasPerdidas}`, {
            fontFamily: '"VT323", monospace',
            fontSize: '22px',
            color: '#7a4a28'
        }).setOrigin(0.5).setDepth(102);

        let y = 178;

        this.casos.forEach((caso, index) => {
            const bloque = this.add.rectangle(640, y + 70, 930, 145, 0xfff5d9, 1);
            bloque.setStrokeStyle(3, 0xc08a45, 1);
            bloque.setDepth(102);

            this.add.text(205, y + 8, `${index + 1}. Persona identificada: ${caso.nombre}`, {
                fontFamily: '"VT323", monospace',
                fontSize: '25px',
                color: '#2b1a10'
            }).setDepth(103);

            this.add.text(205, y + 36, `Conducta detectada: ${caso.delito}`, {
                fontFamily: '"VT323", monospace',
                fontSize: '22px',
                color: '#2b1a10'
            }).setDepth(103);

            this.add.text(205, y + 64, `Medida correspondiente: ${caso.sancionTexto || caso.sancionCorta}`, {
                fontFamily: '"VT323", monospace',
                fontSize: '19px',
                color: '#5a3921',
                wordWrap: { width: 850, useAdvancedWrap: true }
            }).setDepth(103);

            this.add.text(205, y + 98, `Explicación: ${caso.significadoSancion || 'Esta medida corresponde al daño causado por la conducta detectada.'}`, {
                fontFamily: '"VT323", monospace',
                fontSize: '18px',
                color: '#5a3921',
                wordWrap: { width: 850, useAdvancedWrap: true }
            }).setDepth(103);

            y += 155;
        });

        const btn = this.add.rectangle(640, 665, 320, 58, 0x2d82ff, 1);
        btn.setStrokeStyle(3, 0xffffff, 1);
        btn.setDepth(104);

        this.add.text(640, 665, 'CONTINUAR', {
            fontFamily: '"VT323", monospace',
            fontSize: '34px',
            color: '#ffffff',
            stroke: '#071021',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(105);

        this.add.text(640, 704, 'Presiona A en RK Game o haz clic para continuar', {
            fontFamily: '"VT323", monospace',
            fontSize: '22px',
            color: '#40291a'
        }).setOrigin(0.5).setDepth(105);

        const continuar = () => {
            if (!this.notaFinalActiva) return;

            this.notaFinalActiva = false;
            this.reproducirClick();

            this.cameras.main.fadeOut(350, 0, 0, 0);

            this.time.delayedCall(350, () => {
            this.scene.start('PuntajeDia', {
                    puntajeDia: puntajeActualizado,
                    siguienteEstado: this.siguienteEstado,
                    modoJuego: this.modoJuego,
                    jugadores: this.jugadores,
                    casosDia: this.casos,
                    algoritmoGrafo: 'BFS',
                    resultadoMinijuego: {
                        bonus: bonus,
                        piedras: this.piedrasRecogidas,
                        letrasPerdidas: this.letrasPerdidas
                    }
                });
            });
        };

        this.continuarNotaFinal = continuar;

        const zone = this.add.zone(640, 665, 320, 58);
        zone.setInteractive({ cursor: 'pointer' });
        zone.setDepth(106);

        zone.on('pointerover', () => {
            btn.setFillStyle(0x4b9bff, 1);
        });

        zone.on('pointerout', () => {
            btn.setFillStyle(0x2d82ff, 1);
        });

        zone.on('pointerdown', continuar);
    }

    botonAMandoPresionado(pad) {
        return (
            this.botonMandoPresionado(pad, 0) ||
            this.botonMandoPresionado(pad, 5) ||
            this.botonMandoPresionado(pad, 8)
        );
    }

    actualizarAceptarNotaFinalRK() {
        if (!this.notaFinalActiva || typeof this.continuarNotaFinal !== 'function') {
            return;
        }

        const pad1 = this.obtenerMando(1);
        const pad2 = this.obtenerMando(2);

        const aPresionado =
            this.botonAMandoPresionado(pad1) ||
            this.botonAMandoPresionado(pad2);

        const aJustDown = aPresionado && !this.aNotaAnterior;

        if (aJustDown) {
            this.continuarNotaFinal();
        }

        this.aNotaAnterior = aPresionado;
    }

    reproducirClick(volumen = 0.35) {
        if (this.cache.audio.exists('click')) {
            this.sound.play('click', { volume: volumen });
        }
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