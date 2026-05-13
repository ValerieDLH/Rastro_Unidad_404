export class GrafoDia extends Phaser.Scene {

    constructor() {
        super('GrafoDia');
    }

    init(data) {

        data = data || {};

        this.diaActual = data.diaActual || 1;

        this.algoritmo = data.algoritmo || 'BFS';

        this.casosDia = Array.isArray(data.casosDia)
            ? data.casosDia
            : [];

        this.siguienteEstado = data.siguienteEstado || {};

        this.volumenActual =
            typeof data.volumenActual === 'number'
                ? data.volumenActual
                : 0.7;

        this.nodosVisuales = [];
        this.aristasVisuales = [];
        this.adyacencia = {};

        this.yaPuedeContinuar = false;

    }

    preload() {

        this.casosDia.forEach(caso => {

            if (!caso || !caso.nombre) return;

            const key = this._obtenerClaveAvatar(caso);

            if (!this.textures.exists(key)) {

                this.load.image(
                    key,
                    `Personajes/${this._normalizarNombre(caso.nombre)}.png`
                );

            }

        });

        if (!this.cache.audio.exists('click')) {

            this.load.audio(
                'click',
                'music/click.mp3'
            );

        }

    }

    create() {

        this.cameras.main.setBackgroundColor('#031027');

        this.cameras.main.fadeIn(
            450,
            0,
            0,
            0
        );

        this.crearFondo();

        this.crearTitulo();

        this.crearPanelAnalisis();

        this.crearTextoEstado();

        const culpables =
            this._filtrarCulpablesDia();

        if (culpables.length === 0) {

            this.mostrarSinDatos();

            return;

        }

        this.crearGrafo(culpables);

        this.dibujarGrafo();

        if(this.algoritmo === 'DFS') {
            this.animarDFS();
        } 

        else if (this.algoritmo === 'DIJKSTRA') {
            this.animarDijkstra();
        }
        
        else {
            this.animarBFS();
        }

    }

    _normalizarNombre(nombre = '') {

        return nombre
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '_');

    }

    _obtenerClaveAvatar(pj) {

        return `pj_${this._normalizarNombre(
            pj.nombre || ''
        )}`;

    }

    _obtenerIdNodo(pj) {

        return `${pj.dia || this.diaActual}_${pj.rango}_${this._normalizarNombre(
            pj.nombre || ''
        )}`;

    }

    _filtrarCulpablesDia() {

        return this.casosDia.filter(caso => {
            return caso && caso.nombre;
        });

    }

    crearFondo() {

        this.add.rectangle(
            640,
            360,
            1280,
            720,
            0x031027,
            1
        );

        for (let i = 0; i < 90; i++) {

            const x =
                Phaser.Math.Between(0, 1280);

            const y =
                Phaser.Math.Between(0, 720);

            const punto = this.add.circle(
                x,
                y,
                Phaser.Math.Between(1, 3),
                0x7bb8ff,
                Phaser.Math.FloatBetween(
                    0.08,
                    0.30
                )
            );

            this.tweens.add({
                targets: punto,
                alpha:
                    Phaser.Math.FloatBetween(
                        0.04,
                        0.16
                    ),
                duration:
                    Phaser.Math.Between(
                        900,
                        1700
                    ),
                yoyo: true,
                repeat: -1
            });

        }

        this.panelPrincipal =
            this.add.rectangle(
                640,
                420,
                1180,
                560,
                0x071a3d,
                0.82
            );

        this.panelPrincipal.setStrokeStyle(
            3,
            0x5ea2ff,
            0.85
        );

    }

    crearTitulo() {

        this.add.text(
            640,
            55,
            `DÍA ${this.diaActual} - RECORRIDO ${this.algoritmo}`,
            {
                fontFamily:
                    '"VT323", monospace',

                fontSize: '52px',

                color: '#ffffff',

                stroke: '#071022',

                strokeThickness: 6
            }
        ).setOrigin(0.5);

        this.add.text(
            640,
            100,
            'Conexión entre los casos culpables encontrados',
            {
                fontFamily:
                    '"VT323", monospace',

                fontSize: '26px',

                color: '#d7e6ff'
            }
        ).setOrigin(0.5);

    }

    crearPanelAnalisis() {

        this.panelAnalisis =
            this.add.rectangle(
                235,
                395,
                360,
                470,
                0x041127,
                0.96
            );

        this.panelAnalisis.setStrokeStyle(
            2,
            0x1d5eb5,
            1
        );

        this.panelAnalisis.setDepth(20);

        this.add.text(
            70,
            200,
            `ANÁLISIS ${this.algoritmo}`,
            {
                fontFamily:
                    '"VT323", monospace',

                fontSize: '38px',

                color: '#8dff9c'
            }
        ).setDepth(21);

        this.txtEstadisticas =
            this.add.text(
                70,
                240,
                '',
                {
                    fontFamily:
                        '"VT323", monospace',

                    fontSize: '22px',

                    color: '#dcecff',

                    lineSpacing: 18
                }
            );

        this.txtEstadisticas.setDepth(21);

        this.add.rectangle(
            235,
            505,
            260,
            2,
            0x2d6dcc,
            0.8
        ).setDepth(21);

        this.add.text(
            70,
            535,

            this.algoritmo === 'DFS'
                ? 'RECORRIDO DFS'
                : this.algoritmo === 'DIJKSTRA'
                    ? 'RUTA ÓPTIMA'
                    : 'RECORRIDO BFS',
            {
                fontFamily:
                    '"VT323", monospace',

                fontSize: '34px',

                color: '#8dff9c'
            }
        ).setDepth(21);

        this.txtRecorrido =
            this.add.text(
                70,
                585,
                '',
                {
                    fontFamily:
                        '"VT323", monospace',

                    fontSize: '22px',

                    color: '#ffffff',

                    wordWrap: {
                        width: 240
                    },

                    lineSpacing: 12
                }
            );

        this.txtRecorrido.setDepth(21);

    }

    crearTextoEstado() {

        this.txtEstadoDinamico =
            this.add.text(
                640,
                645,
                '',
                {
                    fontFamily:
                        '"VT323", monospace',

                    fontSize: '30px',

                    color: '#8dff9c',

                    align: 'center'
                }
            );

        this.txtEstadoDinamico.setOrigin(
            0.5
        );

        this.txtEstadoDinamico.setDepth(
            60
        );

    }

    crearGrafo(culpables) {

        this.nodos = [];

        this.aristas = [];

        this.adyacencia = {};

        const centroX = 860;

        const centroY = 450;

        let radio = 170;

        if (culpables.length >= 5) {
            radio = 145;
        }

        if (culpables.length >= 7) {
            radio = 120;
        }

        this.panelGrafo =
            this.add.rectangle(
                860,
                430,
                560,
                500,
                0x041127,
                0.55
            );

        this.panelGrafo.setStrokeStyle(
            2,
            0x194b8f,
            0.8
        );

        this.panelGrafo.setDepth(4);

        culpables.forEach((caso, index) => {

            const angulo =
                (Math.PI * 2 * index)
                / culpables.length
                - Math.PI / 2;

            const nodo = {

                id:
                    this._obtenerIdNodo(
                        caso
                    ),

                nombre:
                    caso.nombre,

                caso,

                x:
                    centroX
                    + Math.cos(
                        angulo
                    ) * radio,

                y:
                    centroY
                    + Math.sin(
                        angulo
                    ) * radio,

                visitado: false

            };

            this.nodos.push(nodo);

            this.adyacencia[
                nodo.id
            ] = [];

        });

        for (
            let i = 0;
            i < this.nodos.length;
            i++
        ) {

            for (
                let j = i + 1;
                j < this.nodos.length;
                j++
            ) {

                const a =
                    this.nodos[i];

                const b =
                    this.nodos[j];

                const tiposConexion = [

                    'Difusión de rumores',

                    'Ataques coordinados',

                    'Misma evidencia digital',

                    'Patrón de acoso',

                    'Manipulación de información'

                ];

                const conexionRandom =

                    tiposConexion[
                        Phaser.Math.Between(
                            0,
                            tiposConexion.length - 1
                        )
                    ];

                const peso =
                    Phaser.Math.Between(1, 10);

                const arista = {

                    from: a.id,

                    to: b.id,

                    nodoA: a,

                    nodoB: b,

                    tipo: conexionRandom,

                    peso: peso,

                    graphics: null,

                    textoPeso: null

                };

                this.aristas.push(
                    arista
                );

                this.adyacencia[
                    a.id
                ].push(b.id);

                this.adyacencia[
                    b.id
                ].push(a.id);

            }

        }

    }

    dibujarGrafo() {

        this.aristas.forEach(arista => {

            const g =
                this.add.graphics();

            g.lineStyle(
                4,
                0x9fc7ff,
                0.55
            );

            g.beginPath();

            g.moveTo(
                arista.nodoA.x,
                arista.nodoA.y
            );

            g.lineTo(
                arista.nodoB.x,
                arista.nodoB.y
            );

            g.strokePath();

            g.setDepth(5);

            arista.graphics = g;

            const medioX =
                (arista.nodoA.x + arista.nodoB.x) / 2;

            const medioY =
                (arista.nodoA.y + arista.nodoB.y) / 2;

            const txtPeso = this.add.text(

                medioX,
                medioY,

                `${arista.peso}`,

                {
                    fontFamily: '"VT323", monospace',
                    fontSize: '22px',
                    color: '#fff2a8',
                    stroke: '#071022',
                    strokeThickness: 4,
                    backgroundColor: '#041127'
                }

            );

            txtPeso.setOrigin(0.5);

            txtPeso.setDepth(30);

            arista.textoPeso = txtPeso;

            this.aristasVisuales.push(g);

        });

        this.nodos.forEach(nodo => {

            const cont =
                this.add.container(
                    nodo.x,
                    nodo.y
                );

            cont.setDepth(20);

            const halo =
                this.add.circle(
                    0,
                    0,
                    52,
                    0x1a3f77,
                    1
                );

            halo.setStrokeStyle(
                4,
                0x7bb8ff,
                1
            );

            const key =
                this._obtenerClaveAvatar(
                    nodo.caso
                );

            let avatar;

            if (
                this.textures.exists(
                    key
                )
            ) {

                avatar =
                    this.add.image(
                        0,
                        -6,
                        key
                    );

                avatar.setDisplaySize(
                    66,
                    66
                );

            }

            else {

                avatar =
                    this.add.circle(
                        0,
                        -6,
                        32,
                        0xffffff,
                        1
                    );

            }

            const nombre =
                this.add.text(
                    0,
                    54,
                    nodo.nombre,
                    {
                        fontFamily:
                            '"VT323", monospace',

                        fontSize: '22px',

                        color:
                            '#ffffff',

                        stroke:
                            '#071022',

                        strokeThickness: 4
                    }
                ).setOrigin(0.5);

            const estado =
                this.add.text(
                    0,
                    80,
                    'culpable',
                    {
                        fontFamily:
                            '"VT323", monospace',

                        fontSize: '18px',

                        color:
                            '#fff2a8',

                        stroke:
                            '#071022',

                        strokeThickness: 3
                    }
                ).setOrigin(0.5);

            cont.add([
                halo,
                avatar,
                nombre,
                estado
            ]);

            nodo.container = cont;

            nodo.halo = halo;

            nodo.avatar = avatar;

        });

    }

    obtenerOrdenBFS() {

        if (
            !this.nodos
            || this.nodos.length === 0
        ) {
            return [];
        }

        const inicio =
            this.nodos[0].id;

        const visitados =
            new Set();

        const cola = [];

        const orden = [];

        cola.push({
            id: inicio,
            nivel: 0
        });

        visitados.add(inicio);

        while (cola.length > 0) {

            const actual =
                cola.shift();

            orden.push(actual);

            const vecinos =
                this.adyacencia[
                    actual.id
                ] || [];

            vecinos.forEach(
                vecino => {

                    if (
                        !visitados.has(
                            vecino
                        )
                    ) {

                        visitados.add(
                            vecino
                        );

                        cola.push({

                            id: vecino,

                            nivel:
                                actual.nivel + 1

                        });

                    }

                }
            );

        }

        return orden;

    }

    obtenerRutaDijkstra() {

        if (!this.nodos || this.nodos.length === 0) {

            return {
                ruta: [],
                costoTotal: 0
            };

        }

        const inicio =
            this.nodos[0].id;

        const destino =
            this.nodos[
                this.nodos.length - 1
            ].id;

        const distancias = {};

        const previos = {};

        const visitados =
            new Set();

        this.nodos.forEach(nodo => {

            distancias[nodo.id] =
                Infinity;

            previos[nodo.id] =
                null;

        });

        distancias[inicio] = 0;

        while (
            visitados.size
            < this.nodos.length
        ) {

            let actual = null;

            let menor =
                Infinity;

            this.nodos.forEach(nodo => {

                if (

                    !visitados.has(
                        nodo.id
                    )

                    &&

                    distancias[nodo.id]
                    < menor

                ) {

                    menor =
                        distancias[nodo.id];

                    actual =
                        nodo.id;

                }

            });

            if (actual === null)
                break;

            visitados.add(actual);

            this.aristas.forEach(arista => {

                let vecino = null;

                if (
                    arista.from === actual
                ) {

                    vecino =
                        arista.to;

                }

                else if (
                    arista.to === actual
                ) {

                    vecino =
                        arista.from;

                }

                if (
                    vecino &&
                    !visitados.has(
                        vecino
                    )
                ) {

                    const nuevaDistancia =

                        distancias[actual]
                        + arista.peso;

                    if (

                        nuevaDistancia
                        < distancias[vecino]

                    ) {

                        distancias[vecino] =
                            nuevaDistancia;

                        previos[vecino] =
                            actual;

                    }

                }

            });

        }

        const ruta = [];

        let actual =
            destino;

        while (actual) {

            ruta.unshift(actual);

            actual =
                previos[actual];

        }

        return {

            ruta,

            costoTotal:
                distancias[destino]

        };

    }

    animarDijkstra() {

        const resultado =
            this.obtenerRutaDijkstra();

        const ruta =
            resultado.ruta;

        let nombresRuta = [];

        ruta.forEach(

            (idNodo, index) => {

                this.time.delayedCall(

                    900 + index * 1400,

                    () => {

                        const nodo =
                            this.nodos.find(
                                n =>
                                    n.id === idNodo
                            );

                        if (!nodo) return;

                        nombresRuta.push(
                            nodo.nombre
                        );

                        nodo.halo.setFillStyle(
                            0x2563eb,
                            1
                        );

                        nodo.halo.setStrokeStyle(
                            5,
                            0x7dd3fc,
                            1
                        );

                        this.tweens.add({

                            targets:
                                nodo.container,

                            scaleX: 1.18,

                            scaleY: 1.18,

                            duration: 300,

                            yoyo: true

                        });

                        if (index > 0) {

                            const anterior =
                                ruta[index - 1];

                            this.resaltarRutaDijkstra(
                                anterior,
                                idNodo
                            );

                        }

                        this.txtRecorrido.setText(

                            nombresRuta.join(
                                ' → '
                            )

                        );

                        this.txtEstadoDinamico.setText(

                            `Calculando ruta óptima...\n${nodo.nombre}`

                        );

                    }

                );

            }

        );

        this.time.delayedCall(

            1600 + ruta.length * 1400,

            () => {

                this.mostrarConclusionDijkstra(
                    resultado
                );

            }

        );

    }

    resaltarRutaDijkstra(idA, idB) {

        this.aristas.forEach(arista => {

            const coincide =

                (

                    arista.from === idA
                    && arista.to === idB

                )

                ||

                (

                    arista.from === idB
                    && arista.to === idA

                );

            if (coincide) {

                arista.graphics.clear();

                arista.graphics.lineStyle(
                    7,
                    0x7dd3fc,
                    1
                );

                arista.graphics.beginPath();

                arista.graphics.moveTo(
                    arista.nodoA.x,
                    arista.nodoA.y
                );

                arista.graphics.lineTo(
                    arista.nodoB.x,
                    arista.nodoB.y
                );

                arista.graphics.strokePath();

                if (arista.textoPeso) {

                    arista.textoPeso.setColor(
                        '#7dd3fc'
                    );

                    arista.textoPeso.setFontSize(
                        '28px'
                    );

                }

            }

        });

    }

    mostrarConclusionDijkstra(resultado) {

        this.txtEstadisticas.setText(

            `Nodos evaluados: ${this.nodos.length}\n`

            + `Conexiones: ${this.aristas.length}\n`

            + `Costo mínimo:${resultado.costoTotal}\n`

            + `Análisis completado`

        );

        this.txtEstadoDinamico.setText(
            'Análisis Dijkstra completado.'
        );

        this.mostrarBotonContinuar();

    }

    obtenerOrdenDFS() {

        if (!this.nodos || this.nodos.length === 0) {
            return [];
        }

        const visitados = new Set();

        const orden = [];

        const inicio = this.nodos[0].id;

        const dfs = (idNodo, profundidad) => {

            visitados.add(idNodo);

            orden.push({
                id: idNodo,
                nivel: profundidad
            });

            const vecinos =
                this.adyacencia[idNodo] || [];

            vecinos.forEach(vecino => {

                if (!visitados.has(vecino)) {

                    dfs(
                        vecino,
                        profundidad + 1
                    );

                }

            });

        };

        dfs(inicio, 0);

        return orden;

    }

    animarDFS() {

        const orden =
            this.obtenerOrdenDFS();

        let nombresVisitados = [];

        orden.forEach(
            (paso, index) => {

                this.time.delayedCall(
                    900 + index * 1200,

                    () => {

                        const nodo =
                            this.nodos.find(
                                n => n.id === paso.id
                            );

                        if (!nodo) return;

                        nombresVisitados.push(
                            nodo.nombre
                        );

                        nodo.halo.setFillStyle(
                            0xff7b39,
                            1
                        );

                        nodo.halo.setStrokeStyle(
                            5,
                            0xffc266,
                            1
                        );

                        this.tweens.add({
                            targets:
                                nodo.container,

                            scaleX: 1.15,

                            scaleY: 1.15,

                            duration: 280,

                            yoyo: true
                        });

                        this.resaltarAristasDeNodo(
                            paso.id
                        );

                        this.txtRecorrido.setText(
                            nombresVisitados.join(
                                ' → '
                            )
                        );

                        this.txtEstadoDinamico.setText(
                            `Explorando conexiones profundas...\n${nodo.nombre}`
                        );

                    }
                );

            }
        );

        this.time.delayedCall(
            1400 + orden.length * 1200,

            () => {

                this.mostrarConclusionDFS(
                    orden
                );

            }
        );

    }

    mostrarConclusionDFS(orden) {

        const profundidadMaxima =
            Math.max(
                ...orden.map(
                    p => p.nivel
                )
            );

        const conexionesTexto = this.aristas
            .slice(0, 2)
            .map(a =>
                `• ${a.tipo} (${a.peso})`
            )
            .join('\n');

        this.txtEstadisticas.setText(

            `Casos explorados: ${orden.length}\n\n`

            + `Profundidad DFS: ${profundidadMaxima}\n\n`

            + `Relaciones:\n${conexionesTexto}`

        );

        this.txtEstadoDinamico.setText(
            'Exploración DFS completada.'
        );

        this.mostrarBotonContinuar();

    }

    
    animarBFS() {

        const orden =
            this.obtenerOrdenBFS();

        let nombresVisitados =
            [];

        orden.forEach(
            (paso, index) => {

                this.time.delayedCall(
                    900 + index * 1200,

                    () => {

                        const nodo =
                            this.nodos.find(
                                n =>
                                    n.id
                                    === paso.id
                            );

                        if (!nodo) return;

                        nombresVisitados.push(
                            nodo.nombre
                        );

                        nodo.halo.setFillStyle(
                            0x2f8f46,
                            1
                        );

                        nodo.halo.setStrokeStyle(
                            5,
                            0x8dff9c,
                            1
                        );

                        this.tweens.add({
                            targets:
                                nodo.container,

                            scaleX: 1.15,

                            scaleY: 1.15,

                            duration: 280,

                            yoyo: true
                        });

                        this.resaltarAristasDeNodo(
                            paso.id
                        );

                        this.txtRecorrido.setText(
                            nombresVisitados.join(
                                ' → '
                            )
                        );

                        this.txtEstadoDinamico.setText(
                            `Investigando conexiones...\n${nodo.nombre}`
                        );

                    }
                );

            }
        );

        this.time.delayedCall(
            1400 + orden.length * 1200,

            () => {

                this.mostrarConclusionBFS(
                    orden
                );

            }
        );

    }

    mostrarConclusionBFS(orden) {

        const niveles =
            Math.max(
                ...orden.map(
                    p => p.nivel
                )
            );

        const conexionesTexto = this.aristas
            .slice(0, 2)
            .map(a =>
                `• ${a.tipo} (${a.peso})`
            )
            .join('\n');

        this.txtEstadisticas.setText(

            `Casos analizados: ${orden.length}\n\n`

            + `Niveles BFS: ${niveles}\n\n`

            + `Relaciones:\n${conexionesTexto}`

        );

        this.txtEstadoDinamico.setText(
            'Investigación completada.'
        );

        this.mostrarBotonContinuar();

    }

    
    resaltarAristasDeNodo(idNodo) {

        this.aristas.forEach(arista => {

            if (
                arista.from === idNodo
                || arista.to === idNodo
            ) {

                arista.graphics.clear();

                arista.graphics.lineStyle(
                    5,
                    0x8dff9c,
                    0.95
                );

                arista.graphics.beginPath();

                arista.graphics.moveTo(
                    arista.nodoA.x,
                    arista.nodoA.y
                );

                arista.graphics.lineTo(
                    arista.nodoB.x,
                    arista.nodoB.y
                );

                arista.graphics.strokePath();

            }

        });

    }


    mostrarSinDatos() {

        this.add.text(
            640,
            360,
            'No hay culpables para construir el grafo.',
            {
                fontFamily:
                    '"VT323", monospace',

                fontSize: '38px',

                color: '#ffffff',

                stroke: '#071022',

                strokeThickness: 5
            }
        ).setOrigin(0.5);

        this.mostrarBotonContinuar();

    }

    mostrarBotonContinuar() {

        this.yaPuedeContinuar = true;

        const btn =
            this.add.rectangle(
                640,
                670,
                340,
                58,
                0x2d82ff,
                1
            );

        btn.setStrokeStyle(
            3,
            0xffffff,
            1
        );

        btn.setDepth(100);

        this.add.text(
            640,
            670,
            'CONTINUAR',
            {
                fontFamily:
                    '"VT323", monospace',

                fontSize: '36px',

                color: '#ffffff',

                stroke: '#071021',

                strokeThickness: 4
            }
        )
            .setOrigin(0.5)
            .setDepth(101);

        const zone =
            this.add.zone(
                640,
                670,
                340,
                58
            );

        zone.setInteractive({
            cursor: 'pointer'
        });

        zone.setDepth(102);

        zone.on(
            'pointerover',
            () => {

                btn.setFillStyle(
                    0x4b9bff,
                    1
                );

            }
        );

        zone.on(
            'pointerout',
            () => {

                btn.setFillStyle(
                    0x2d82ff,
                    1
                );

            }
        );

        zone.on(
            'pointerdown',
            () => {

                this.irASiguienteDia();

            }
        );

    }

    irASiguienteDia() {

        if (
            !this.yaPuedeContinuar
        ) return;

        if (
            this.cache.audio.exists(
                'click'
            )
        ) {

            this.sound.play(
                'click',
                {
                    volume: 0.35
                }
            );

        }

        this.yaPuedeContinuar =
            false;

        this.cameras.main.fadeOut(
            420,
            0,
            0,
            0
        );

        this.time.delayedCall(
            420,
            () => {

                this.scene.start(
                    'Ventana1',
                    this.siguienteEstado
                );

            }
        );

    }

}