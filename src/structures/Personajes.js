import { NodoB } from './NodoB.js';
import { ArbolB } from './ArbolB.js';
import { Sanciones } from './Sanciones.js';

// =========================================================
//  DÍA 1
// =========================================================
const Abril = new NodoB(5, 'Abril', true,
    '"Valeria, tus publicaciones dan pena y todos se burlan de ti." /// Pista: observa si el mensaje busca humillar públicamente a Valeria o afectar su dignidad frente a otros.',
    1, 1, Sanciones[1][0], true, 0);

const Adam = new NodoB(5, 'Adam', true,
    '"Cada día voy a recordarte lo ridícula que eres." /// Pista: revisa si la conducta anuncia repetición o insistencia contra Valeria, no solo un comentario aislado.',
    11, 1, Sanciones[1][1], true, 25);

const Allison = new NodoB(5, 'Allison', true,
    '"Cada vez que publiques, volveré a burlarme de ti." /// Pista: fíjate si la acción depende de repetirse cada vez que Valeria participa en redes.',
    11, 1, Sanciones[1][1], true, -10);

const Alma = new NodoB(5, 'Alma', true,
    '"[Reaccionó con burlas en muchas publicaciones de Valeria.]" /// Pista: analiza si las acciones repetidas alteran la tranquilidad digital de Valeria aunque no haya una amenaza directa.',
    12, 1, Sanciones[1][2], true, -25);

const Ana = new NodoB(5, 'Ana', true,
    '"[Dejó burlas constantes en fotos de Valeria durante varios días.]" /// Pista: observa si hay una molestia continua que afecta la paz de Valeria en su espacio digital.',
    12, 1, Sanciones[1][2], true, -40);

const Andres = new NodoB(5, 'Andres', false,
    '"Valeria, si necesitas apoyo, puedo acompañarte a hablar con alguien." /// Pista: revisa si la intervención busca proteger o acompañar a Valeria en lugar de dañarla.',
    -53, 1, null, false, null);

const Anthony = new NodoB(5, 'Anthony', false,
    '"[No comentó ni compartió nada contra Valeria.]" /// Pista: verifica si existe una acción concreta que cause daño o si no hay participación relevante.',
    -54, 1, null, false, null);

const Ben = new NodoB(5, 'Ben', false,
    '"Dejen de molestar a Valeria por lo que publica." /// Pista: identifica si la persona está aumentando el daño o intentando detenerlo.',
    -55, 1, null, false, null);

const Bruno = new NodoB(5, 'Bruno', false,
    '"Profe, tengo capturas de lo que le están haciendo a Valeria." /// Pista: analiza si la acción busca aportar evidencia para resolver el caso o participar en el ataque.',
    -56, 1, null, false, null);

const Camila = new NodoB(5, 'Camila', false,
    '"[Vio la situación, pero no participó ni difundió nada.]" /// Pista: revisa si la persona realizó una acción dañina o si solo estuvo presente sin intervenir.',
    -57, 1, null, false, null);


// =========================================================
//  DÍA 2
// =========================================================
const Camilo = new NodoB(5, 'Camilo', true,
    '"Compartan esto para que todos vean lo vergonzosa que es Valeria." /// Pista: observa si el daño aumenta porque el mensaje busca que más personas lo vean o lo compartan.',
    2, 2, Sanciones[2][0], true, 63);

const Clara = new NodoB(5, 'Clara', true,
    '"Comentemos todos hasta que Valeria cierre su cuenta." /// Pista: revisa si se está llamando a otras personas a presionar digitalmente a Valeria.',
    21, 2, Sanciones[2][1], true, 5);

const Cora = new NodoB(5, 'Cora', true,
    '"No le hablen y hagan que se sienta sola." /// Pista: analiza si la conducta busca aislar, presionar o afectar socialmente a Valeria desde el entorno digital.',
    21, 2, Sanciones[2][1], true, 75);

const Dani = new NodoB(5, 'Dani', true,
    '"[Reenvió una publicación ofensiva de Valeria en varios grupos.]" /// Pista: fíjate si la persona ayudó a expandir contenido dañino hacia más espacios.',
    22, 2, Sanciones[2][2], true, 85);

const Diego = new NodoB(5, 'Diego', true,
    '"Yo también lo pasaré por los grupos para que todos lo vean." /// Pista: observa si la acción no crea el daño inicial, pero sí ayuda a que llegue a más personas.',
    22, 2, Sanciones[2][2], true, 20);

const Dylan = new NodoB(5, 'Dylan', false,
    '"Borré esa publicación porque podía hacerle daño a Valeria." /// Pista: revisa si la persona contribuye a frenar el daño o a extenderlo.',
    -43, 2, null, false, null);

const Elena = new NodoB(5, 'Elena', false,
    '"[No comentó ni compartió contenido del caso.]" /// Pista: verifica si hay una acción digital que afecte a Valeria o si no existe intervención dañina.',
    -44, 2, null, false, null);

const Emma = new NodoB(5, 'Emma', false,
    '"Me llegó la publicación, pero no la reenvié." /// Pista: analiza si recibir contenido es suficiente o si lo importante es haberlo difundido.',
    -45, 2, null, false, null);

const Eric = new NodoB(5, 'Eric', false,
    '"Esto está empeorando y alguien debería ayudar a Valeria." /// Pista: observa si la intención del mensaje es alertar sobre el daño o participar en él.',
    -46, 2, null, false, null);

const Ethan = new NodoB(5, 'Ethan', false,
    '"[Guardó capturas y las envió a directivas.]" /// Pista: revisa si la acción busca documentar el problema para ayudar o aumentar la exposición de Valeria.',
    -47, 2, null, false, null);


// =========================================================
//  DÍA 3
// =========================================================
const Eva = new NodoB(5, 'Eva', true,
    '"Valeria robó los exámenes y todos deberían saberlo." /// Pista: revisa si se está acusando a Valeria de un hecho grave sin mostrar pruebas confiables.',
    4, 3, Sanciones[3][0], true, -3);

const Fabio = new NodoB(5, 'Fabio', true,
    '"Aquí está la captura donde Valeria supuestamente confiesa todo." /// Pista: analiza si la información compartida parece manipulada, dudosa o usada para dañar su imagen.',
    41, 3, Sanciones[3][1], true, 8);

const Irene = new NodoB(5, 'Irene', true,
    '"Reenvíen esa captura para que Valeria no siga mintiendo." /// Pista: observa si la persona ayuda a circular una supuesta prueba sin verificarla.',
    41, 3, Sanciones[3][1], true, 27);

const Isabel = new NodoB(5, 'Isabel', true,
    '"Algo raro hizo Valeria, aunque todavía no haya pruebas." /// Pista: fíjate si se dañan el buen nombre y la reputación de Valeria usando sospechas sin evidencia.',
    42, 3, Sanciones[3][2], true, 35);

const Isacc = new NodoB(5, 'Isacc', true,
    '"Si todos hablan mal de Valeria, por algo será." /// Pista: revisa si el mensaje refuerza un rumor sin aportar pruebas concretas.',
    42, 3, Sanciones[3][2], true, 50);

const Jackson = new NodoB(5, 'Jackson', false,
    '"Yo estuve allí y no vi nada raro con Valeria." /// Pista: analiza si la persona está creando un rumor o contradiciendo una acusación sin pruebas.',
    -23, 3, null, false, null);

const Joel = new NodoB(5, 'Joel', false,
    '"[Recibió las capturas, pero no las compartió.]" /// Pista: distingue entre recibir información y participar activamente en su difusión.',
    -24, 3, null, false, null);

const Julia = new NodoB(5, 'Julia', false,
    '"Le dije a quien me mandó eso que dejara de reenviarlo." /// Pista: observa si la persona intenta cortar la cadena de difusión o continuarla.',
    -25, 3, null, false, null);

const Kevin = new NodoB(5, 'Kevin', false,
    '"[No tuvo actividad relacionada con el rumor.]" /// Pista: revisa si aparece una conducta concreta que afecte a Valeria.',
    -26, 3, null, false, null);

const Laura = new NodoB(5, 'Laura', false,
    '"Esa captura parece editada y deberían revisarla bien." /// Pista: analiza si la persona está cuestionando una prueba dudosa o usándola para atacar.',
    -27, 3, null, false, null);


// =========================================================
//  DÍA 4
// =========================================================
const Leo = new NodoB(5, 'Leo', true,
    '"[Creó un perfil falso usando fotos de Valeria.]" /// Pista: revisa si alguien está usando la imagen o identidad de Valeria para aparentar ser ella.',
    5, 4, Sanciones[4][0], true, -5);

const Lina = new NodoB(5, 'Lina', true,
    '"[Entró a la cuenta real de Valeria y publicó desde allí.]" /// Pista: observa si se usó una cuenta real de Valeria sin autorización.',
    51, 4, Sanciones[4][1], true, -1);

const Lucas = new NodoB(5, 'Lucas', true,
    '"[Envió fotos de Valeria a varios grupos sin autorización.]" /// Pista: analiza si se compartió información o imágenes personales sin permiso.',
    52, 4, Sanciones[4][2], true, 6);

const Luis = new NodoB(5, 'Luis', true,
    '"[Compartió el número y usuario de Valeria en privado.]" /// Pista: fíjate si se expusieron datos personales que podían afectar la seguridad o privacidad de Valeria.',
    52, 4, Sanciones[4][2], true, 11);

const Luisa = new NodoB(5, 'Luisa', true,
    '"[Reunió fotos y contactos de Valeria para pasarlos a otros.]" /// Pista: observa si la persona recopiló y distribuyó información privada de Valeria.',
    52, 4, Sanciones[4][2], true, 23);

const Mia = new NodoB(5, 'Mia', true,
    '"[Abrió una cuenta falsa y respondió mensajes como Valeria.]" /// Pista: revisa si se creó una apariencia falsa usando el nombre o imagen de Valeria.',
    5, 4, Sanciones[4][0], true, -7);

const Nico = new NodoB(5, 'Nico', true,
    '"[Copió el nombre y fotos de Valeria para confundir a otros.]" /// Pista: analiza si la acción puede hacer creer a otras personas que están interactuando con Valeria.',
    5, 4, Sanciones[4][0], true, -4);

const Nora = new NodoB(5, 'Nora', true,
    '"[La cuenta real de Valeria fue usada desde un dispositivo extraño.]" /// Pista: revisa si hay señales de ingreso o uso no permitido de una cuenta verdadera.',
    51, 4, Sanciones[4][1], true, -2);

const Oscar = new NodoB(5, 'Oscar', true,
    '"[Cambió la biografía de la cuenta real de Valeria.]" /// Pista: observa si alguien modificó información dentro de un perfil que no le pertenecía.',
    51, 4, Sanciones[4][1], true, 1);

const Paula = new NodoB(5, 'Paula', true,
    '"[Reenvió datos y fotos privadas de Valeria a grupos externos.]" /// Pista: analiza si la acción expone datos privados de Valeria a personas que no debían recibirlos.',
    52, 4, Sanciones[4][2], true, 7);


// =========================================================
//  DÍA 5
// =========================================================
const Ronald = new NodoB(5, 'Ronald', true,
    '"A las 8 todos comentamos hasta que Valeria desaparezca de redes." /// Pista: revisa si hay una organización de varias personas para atacar al mismo tiempo.',
    3, 5, Sanciones[5][0], true, 29);

const Rosa = new NodoB(5, 'Rosa', true,
    '"Si sigues hablando, te va a ir muy mal." /// Pista: observa si el mensaje busca causar miedo para que Valeria deje de hablar o denunciar.',
    31, 5, Sanciones[5][1], true, 33);

const Ruben = new NodoB(5, 'Ruben', true,
    '"No cuentes nada si sabes lo que te conviene." /// Pista: analiza si se usa intimidación para silenciar a Valeria.',
    31, 5, Sanciones[5][1], true, 38);

const Sara = new NodoB(5, 'Sara', true,
    '"[Organizó horarios y tareas para atacar a Valeria.]" /// Pista: fíjate si hay reparto de funciones, planificación o coordinación entre varias personas.',
    32, 5, Sanciones[5][2], true, 48);

const Sofia = new NodoB(5, 'Sofia', true,
    '"[Invitó personas al grupo y les indicó qué publicar.]" /// Pista: revisa si la persona ayuda a organizar participantes y mensajes dentro de un ataque grupal.',
    32, 5, Sanciones[5][2], true, 16);

const Tomas = new NodoB(5, 'Tomas', true,
    '"[Indicó la hora para enviar mensajes contra Valeria.]" /// Pista: observa si existe una hora o instrucción común para que varias personas actúen juntas.',
    3, 5, Sanciones[5][0], true, 26);

const Tyler = new NodoB(5, 'Tyler', true,
    '"[Publicó una lista con el orden de participación.]" /// Pista: analiza si hay una estructura organizada para decidir quién participa y cuándo.',
    3, 5, Sanciones[5][0], true, 31);

const Valen = new NodoB(5, 'Valen', true,
    '"[Asignó roles para comentar, compartir y presionar.]" /// Pista: revisa si la conducta muestra reparto de tareas dentro de un grupo.',
    32, 5, Sanciones[5][2], true, 34);

const Violeta = new NodoB(5, 'Violeta', true,
    '"[Preparó mensajes para que todos copiaran el mismo ataque.]" /// Pista: observa si se preparó contenido común para que varias personas lo repitieran.',
    32, 5, Sanciones[5][2], true, 36);

const Zoe = new NodoB(5, 'Zoe', true,
    '"Si denuncias, después no digas que no te avisamos." /// Pista: analiza si el mensaje intenta impedir que Valeria denuncie usando miedo o advertencias.',
    31, 5, Sanciones[5][1], true, 39);


// =========================================================
//  REFERENCIAS ABB
// =========================================================
Abril._izqReal = Alma; Alma._padreReal = Abril;
Abril._derReal = Adam; Adam._padreReal = Abril;

Alma._izqReal = Ana; Ana._padreReal = Alma;
Alma._derReal = Allison; Allison._padreReal = Alma;

Adam._izqReal = Camilo; Camilo._padreReal = Adam;
Adam._derReal = Sofia; Sofia._padreReal = Adam;

Camilo._izqReal = Clara; Clara._padreReal = Camilo;
Camilo._derReal = Diego; Diego._padreReal = Camilo;

Clara._izqReal = Eva; Eva._padreReal = Clara;
Diego._izqReal = Fabio; Fabio._padreReal = Diego;

Sofia._izqReal = Cora; Cora._padreReal = Sofia;
Sofia._derReal = Dani; Dani._padreReal = Sofia;

Eva._izqReal = Leo; Leo._padreReal = Eva;
Eva._derReal = Lina; Lina._padreReal = Eva;

Fabio._izqReal = Lucas; Lucas._padreReal = Fabio;
Fabio._derReal = Luis; Luis._padreReal = Fabio;

Cora._izqReal = Irene; Irene._padreReal = Cora;
Cora._derReal = Isabel; Isabel._padreReal = Cora;

Dani._izqReal = Isacc; Isacc._padreReal = Dani;

Leo._izqReal = Mia; Mia._padreReal = Leo;
Leo._derReal = Nico; Nico._padreReal = Leo;

Lina._izqReal = Nora; Nora._padreReal = Lina;
Lina._derReal = Oscar; Oscar._padreReal = Lina;

Lucas._derReal = Paula; Paula._padreReal = Lucas;

Irene._izqReal = Luisa; Luisa._padreReal = Irene;
Irene._derReal = Ronald; Ronald._padreReal = Irene;

Isabel._izqReal = Rosa; Rosa._padreReal = Isabel;
Isabel._derReal = Ruben; Ruben._padreReal = Isabel;

Isacc._izqReal = Sara; Sara._padreReal = Isacc;

Ronald._izqReal = Tomas; Tomas._padreReal = Ronald;
Ronald._derReal = Tyler; Tyler._padreReal = Ronald;

Rosa._izqReal = Valen; Valen._padreReal = Rosa;
Rosa._derReal = Violeta; Violeta._padreReal = Rosa;

Ruben._derReal = Zoe; Zoe._padreReal = Ruben;


// =========================================================
//  ÍNDICE GLOBAL
// =========================================================
export const TodosLosPersonajes = [
    Abril, Adam, Allison, Alma, Ana, Andres, Anthony, Ben, Bruno, Camila,
    Camilo, Clara, Cora, Dani, Diego, Dylan, Elena, Emma, Eric, Ethan,
    Eva, Fabio, Irene, Isabel, Isacc, Jackson, Joel, Julia, Kevin, Laura,
    Leo, Lina, Lucas, Luis, Luisa, Mia, Nico, Nora, Oscar, Paula,
    Ronald, Rosa, Ruben, Sara, Sofia, Tomas, Tyler, Valen, Violeta, Zoe
];

export const Dias = {
    1: [Abril, Adam, Allison, Alma, Ana, Andres, Anthony, Ben, Bruno, Camila],
    2: [Camilo, Clara, Cora, Dani, Diego, Dylan, Elena, Emma, Eric, Ethan],
    3: [Eva, Fabio, Irene, Isabel, Isacc, Jackson, Joel, Julia, Kevin, Laura],
    4: [Leo, Lina, Lucas, Luis, Luisa, Mia, Nico, Nora, Oscar, Paula],
    5: [Ronald, Rosa, Ruben, Sara, Sofia, Tomas, Tyler, Valen, Violeta, Zoe]
};


// =========================================================
//  CONFIGURACIÓN PARA EL ÁRBOL / BUSCADOR DIARIO
// =========================================================
const configDias = {
    1: {
        delitosFijos: [Abril, Adam, Allison, Alma],
        inocentes: [Andres, Anthony, Ben, Bruno, Camila]
    },
    2: {
        principales: [Camilo],
        secundariosA: [Clara, Cora],
        secundariosB: [Dani, Diego],
        inocentes: [Dylan, Elena, Emma, Eric, Ethan]
    },
    3: {
        principales: [Eva],
        secundariosA: [Fabio, Irene],
        secundariosB: [Isabel, Isacc],
        inocentes: [Jackson, Joel, Julia, Kevin, Laura]
    },
    4: {
        tipo0: [Leo, Mia, Nico],
        tipo1: [Lina, Nora, Oscar],
        tipo2: [Lucas, Luis, Luisa, Paula]
    },
    5: {
        tipo0: [Ronald, Tomas, Tyler],
        tipo1: [Rosa, Ruben, Zoe],
        tipo2: [Sara, Sofia, Valen, Violeta]
    }
};

function escogerUno(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
}

function escogerVariosSinRepetir(lista, cantidad) {
    const copia = [...lista];
    const resultado = [];

    for (let i = 0; i < cantidad && copia.length > 0; i++) {
        const idx = Math.floor(Math.random() * copia.length);
        resultado.push(copia[idx]);
        copia.splice(idx, 1);
    }

    return resultado;
}

function mezclarArray(lista) {
    const copia = [...lista];

    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }

    return copia;
}

let seleccionPartidaActual = {};
export const arbolDias = {};

export function resetPersonajesPartida() {
    seleccionPartidaActual = {};
    Object.keys(arbolDias).forEach(k => delete arbolDias[k]);
}

function generarVectorDia(dia) {
    const cfg = configDias[dia];
    if (!cfg) return [];

    // Caso especial: días con delitos fijos.
    // Día 1 necesita 4 delitos fijos:
    // Abril, Adam, Allison y Alma.
    if (Array.isArray(cfg.delitosFijos)) {
        const extras = escogerVariosSinRepetir(
            cfg.inocentes || [],
            Math.max(0, 5 - cfg.delitosFijos.length)
        );

        return mezclarArray([
            ...cfg.delitosFijos,
            ...extras
        ]);
    }

    // Días 4 y 5: 5 delitos.
    if (cfg.tipo0 && cfg.tipo1 && cfg.tipo2) {
        const delitoTipo0 = escogerUno(cfg.tipo0);
        const delitosTipo1 = escogerVariosSinRepetir(cfg.tipo1, 2);
        const delitosTipo2 = escogerVariosSinRepetir(cfg.tipo2, 2);

        return mezclarArray([
            delitoTipo0,
            ...delitosTipo1,
            ...delitosTipo2
        ]);
    }

    // Días 2 y 3: 3 delitos + 2 inocentes.
    const principal = escogerUno(cfg.principales);
    const secundarioA = escogerUno(cfg.secundariosA);
    const secundarioB = escogerUno(cfg.secundariosB);
    const extras = escogerVariosSinRepetir(cfg.inocentes, 2);

    return mezclarArray([
        principal,
        secundarioA,
        secundarioB,
        ...extras
    ]);
}

export function vectorDelDia(dia) {
    if (!seleccionPartidaActual[dia]) {
        seleccionPartidaActual[dia] = generarVectorDia(dia);
    }

    return [...seleccionPartidaActual[dia]];
}

export function construirArbolDia(dia, personajesSeleccionados = null) {
    const arbol = new ArbolB(5);
    const vector = personajesSeleccionados || vectorDelDia(dia);

    vector.forEach(pj => arbol.insertar(pj));

    arbolDias[dia] = arbol;
    return arbol;
}


// =========================================================
// GRAFO MAESTRO DEL CASO
// =========================================================
export const VALERIA = {
    id: 'VALERIA',
    nombre: 'Valeria',
    esVictima: true,
    activo: true
};


// =========================================================
// NODOS IMPLICADOS DEL CASO REAL
// 20 AGRESORES EN TOTAL
//
// Día 1: 4 implicados
// Día 2: 3 implicados
// Día 3: 3 implicados
// Día 4: 5 implicados
// Día 5: 5 implicados
//
// Total: 4 + 3 + 3 + 5 + 5 = 20
// Total con Valeria: 21 nodos
// =========================================================
export const implicadosTotales = [
    // Día 1
    Abril,
    Adam,
    Allison,
    Alma,

    // Día 2
    Camilo,
    Clara,
    Cora,

    // Día 3
    Eva,
    Fabio,
    Irene,

    // Día 4
    Leo,
    Lina,
    Lucas,
    Luis,
    Luisa,

    // Día 5
    Ronald,
    Rosa,
    Ruben,
    Sara,
    Sofia
];


// =========================================================
// CONEXIONES DEL GRAFO MAESTRO
// Aristas bilaterales.
// No se escribe el delito como respuesta.
// La relación es narrativa: rastro, propagación, presión, etc.
// =========================================================
export const conexionesMaestras = [

    // =====================================================
    // DÍA 1 - BFS / DFS
    // Conexiones diseñadas para que los recorridos sean distintos
    // usando el mismo orden de lectura.
    //
    // BFS esperado:
    // Nivel 0: Abril
    // Nivel 1: Adam, Allison
    // Nivel 2: Alma, Valeria
    //
    // DFS esperado:
    // Abril → Adam → Alma → Allison → Valeria
    // =====================================================
    {
        from: 'Abril',
        to: 'Adam',
        relacion: 'rastro inicial',
        peso: 2,
        capacidad: 4
    },
    {
        from: 'Abril',
        to: 'Allison',
        relacion: 'rastro alterno',
        peso: 4,
        capacidad: 3
    },
    {
        from: 'Adam',
        to: 'Alma',
        relacion: 'cadena profunda',
        peso: 3,
        capacidad: 4
    },
    {
        from: 'Alma',
        to: 'Allison',
        relacion: 'enlace entre rastros',
        peso: 5,
        capacidad: 4
    },
    {
        from: 'Allison',
        to: 'Valeria',
        relacion: 'impacto observado',
        peso: 6,
        capacidad: 5
    },

    // =====================================================
    // DÍA 2 - DIJKSTRA
    // Pesos para ruta de menor riesgo.
    // =====================================================
    {
        from: 'Adam',
        to: 'Camilo',
        relacion: 'difusión del rastro',
        peso: 3,
        capacidad: 5
    },
    {
        from: 'Allison',
        to: 'Clara',
        relacion: 'presión en red',
        peso: 4,
        capacidad: 4
    },
    {
        from: 'Camilo',
        to: 'Clara',
        relacion: 'interacción grupal',
        peso: 2,
        capacidad: 6
    },
    {
        from: 'Camilo',
        to: 'Cora',
        relacion: 'expansión del caso',
        peso: 5,
        capacidad: 4
    },
    {
        from: 'Clara',
        to: 'Valeria',
        relacion: 'afectación indirecta',
        peso: 7,
        capacidad: 5
    },
    {
        from: 'Cora',
        to: 'Valeria',
        relacion: 'afectación indirecta',
        peso: 6,
        capacidad: 4
    },

    // =====================================================
    // DÍA 3 - PRIM
    // Costos para reconstrucción mínima de la red.
    // =====================================================
    {
        from: 'Clara',
        to: 'Eva',
        relacion: 'nuevo rastro',
        peso: 4,
        capacidad: 4
    },
    {
        from: 'Cora',
        to: 'Fabio',
        relacion: 'contenido reenviado',
        peso: 5,
        capacidad: 5
    },
    {
        from: 'Eva',
        to: 'Fabio',
        relacion: 'evidencia dudosa',
        peso: 2,
        capacidad: 6
    },
    {
        from: 'Eva',
        to: 'Irene',
        relacion: 'rumor extendido',
        peso: 6,
        capacidad: 3
    },
    {
        from: 'Fabio',
        to: 'Valeria',
        relacion: 'daño reputacional',
        peso: 8,
        capacidad: 5
    },
    {
        from: 'Irene',
        to: 'Valeria',
        relacion: 'daño reputacional',
        peso: 7,
        capacidad: 4
    },

    // =====================================================
    // DÍA 4 - FORD-FULKERSON
    // Capacidades para flujo máximo.
    // =====================================================
    {
        from: 'Fabio',
        to: 'Leo',
        relacion: 'salto a identidad digital',
        peso: 5,
        capacidad: 4
    },
    {
        from: 'Irene',
        to: 'Lina',
        relacion: 'rastro técnico',
        peso: 4,
        capacidad: 5
    },
    {
        from: 'Leo',
        to: 'Lina',
        relacion: 'actividad coordinada',
        peso: 3,
        capacidad: 6
    },
    {
        from: 'Leo',
        to: 'Lucas',
        relacion: 'uso de imagen',
        peso: 6,
        capacidad: 4
    },
    {
        from: 'Lina',
        to: 'Luis',
        relacion: 'acceso y exposición',
        peso: 5,
        capacidad: 5
    },
    {
        from: 'Lucas',
        to: 'Luisa',
        relacion: 'datos compartidos',
        peso: 4,
        capacidad: 5
    },
    {
        from: 'Luis',
        to: 'Valeria',
        relacion: 'exposición personal',
        peso: 8,
        capacidad: 4
    },
    {
        from: 'Luisa',
        to: 'Valeria',
        relacion: 'exposición personal',
        peso: 7,
        capacidad: 4
    },

    // =====================================================
    // DÍA 5 - MASTER
    // Integración final de todos los algoritmos.
    // =====================================================
    {
        from: 'Luis',
        to: 'Ronald',
        relacion: 'organización del caso',
        peso: 5,
        capacidad: 6
    },
    {
        from: 'Luisa',
        to: 'Rosa',
        relacion: 'presión directa',
        peso: 6,
        capacidad: 5
    },
    {
        from: 'Ronald',
        to: 'Ruben',
        relacion: 'coordinación',
        peso: 3,
        capacidad: 7
    },
    {
        from: 'Ronald',
        to: 'Sara',
        relacion: 'roles asignados',
        peso: 4,
        capacidad: 6
    },
    {
        from: 'Ruben',
        to: 'Sofia',
        relacion: 'presión sostenida',
        peso: 5,
        capacidad: 5
    },
    {
        from: 'Sara',
        to: 'Sofia',
        relacion: 'grupo organizado',
        peso: 2,
        capacidad: 7
    },
    {
        from: 'Rosa',
        to: 'Valeria',
        relacion: 'presión final',
        peso: 8,
        capacidad: 5
    },
    {
        from: 'Sofia',
        to: 'Valeria',
        relacion: 'presión final',
        peso: 7,
        capacidad: 6
    }
];


// =========================================================
// REVELADO PROGRESIVO ACUMULATIVO
// =========================================================
export const desbloqueoPorDia = {
    1: [
        'Abril',
        'Adam',
        'Allison',
        'Alma'
    ],

    2: [
        'Abril',
        'Adam',
        'Allison',
        'Alma',

        'Camilo',
        'Clara',
        'Cora'
    ],

    3: [
        'Abril',
        'Adam',
        'Allison',
        'Alma',

        'Camilo',
        'Clara',
        'Cora',

        'Eva',
        'Fabio',
        'Irene'
    ],

    4: [
        'Abril',
        'Adam',
        'Allison',
        'Alma',

        'Camilo',
        'Clara',
        'Cora',

        'Eva',
        'Fabio',
        'Irene',

        'Leo',
        'Lina',
        'Lucas',
        'Luis',
        'Luisa'
    ],

    5: [
        'Abril',
        'Adam',
        'Allison',
        'Alma',

        'Camilo',
        'Clara',
        'Cora',

        'Eva',
        'Fabio',
        'Irene',

        'Leo',
        'Lina',
        'Lucas',
        'Luis',
        'Luisa',

        'Ronald',
        'Rosa',
        'Ruben',
        'Sara',
        'Sofia'
    ]
};

window.implicadosTotales = implicadosTotales;
window.conexionesMaestras = conexionesMaestras;
window.desbloqueoPorDia = desbloqueoPorDia;
window.VALERIA = VALERIA;