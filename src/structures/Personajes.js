import { NodoB } from './NodoB.js';
import { ArbolB } from './ArbolB.js';
import { Sanciones } from './Sanciones.js';

// =========================================================
//  DÍA 1
// =========================================================
const Abril = new NodoB(5, 'Abril', true,
    '"Valeria, tus publicaciones dan pena y todos se burlan de ti." /// Det. Alex: Es un ataque directo a su dignidad.',
    1, 1, Sanciones[1][0], true, 0);

const Adam = new NodoB(5, 'Adam', true,
    '"Cada día voy a recordarte lo ridícula que eres." /// Det. Alex: La clave es la molestia repetida.',
    11, 1, Sanciones[1][1], true, 25);

const Allison = new NodoB(5, 'Allison', true,
    '"Cada vez que publiques, volveré a burlarme de ti." /// Det. Alex: Anuncia una conducta repetida contra Valeria.',
    11, 1, Sanciones[1][1], true, -10);

const Alma = new NodoB(5, 'Alma', true,
    '"[Reaccionó con burlas en muchas publicaciones de Valeria.]" /// Det. Alex: La repetición altera su tranquilidad.',
    12, 1, Sanciones[1][2], true, -25);

const Ana = new NodoB(5, 'Ana', true,
    '"[Dejó burlas constantes en fotos de Valeria durante varios días.]" /// Det. Alex: Son actos pequeños, pero repetidos.',
    12, 1, Sanciones[1][2], true, -40);

const Andres = new NodoB(5, 'Andres', false,
    '"Valeria, si necesitas apoyo, puedo acompañarte a hablar con alguien." /// Det. Alex: Es un mensaje de ayuda, no de ataque.',
    -53, 1, null, false, null);

const Anthony = new NodoB(5, 'Anthony', false,
    '"[No comentó ni compartió nada contra Valeria.]" /// Det. Alex: No hay conducta dañina.',
    -54, 1, null, false, null);

const Ben = new NodoB(5, 'Ben', false,
    '"Dejen de molestar a Valeria por lo que publica." /// Det. Alex: Intenta frenar el daño.',
    -55, 1, null, false, null);

const Bruno = new NodoB(5, 'Bruno', false,
    '"Profe, tengo capturas de lo que le están haciendo a Valeria." /// Det. Alex: Aporta evidencia del caso.',
    -56, 1, null, false, null);

const Camila = new NodoB(5, 'Camila', false,
    '"[Vio la situación, pero no participó ni difundió nada.]" /// Det. Alex: No intervino en el ataque.',
    -57, 1, null, false, null);
// =========================================================
//  DÍA 2
// =========================================================
const Camilo = new NodoB(5, 'Camilo', true,
    '"Compartan esto para que todos vean lo vergonzosa que es Valeria." /// Det. Alex: El daño se amplifica públicamente.',
    2, 2, Sanciones[2][0], true, 63);

const Clara = new NodoB(5, 'Clara', true,
    '"Comentemos todos hasta que Valeria cierre su cuenta." /// Det. Alex: Está convocando un ataque grupal.',
    21, 2, Sanciones[2][1], true, 5);

const Cora = new NodoB(5, 'Cora', true,
    '"No le hablen y hagan que se sienta sola." /// Det. Alex: Busca aislarla con presión digital.',
    21, 2, Sanciones[2][1], true, 75);

const Dani = new NodoB(5, 'Dani', true,
    '"[Reenvió una publicación ofensiva de Valeria en varios grupos.]" /// Det. Alex: Ayudó a expandir el daño.',
    22, 2, Sanciones[2][2], true, 85);

const Diego = new NodoB(5, 'Diego', true,
    '"Yo también lo pasaré por los grupos para que todos lo vean." /// Det. Alex: Refuerza la difusión del contenido dañino.',
    22, 2, Sanciones[2][2], true, 20);

const Dylan = new NodoB(5, 'Dylan', false,
    '"Borré esa publicación porque podía hacerle daño a Valeria." /// Det. Alex: No colaboró con la difusión.',
    -43, 2, null, false, null);

const Elena = new NodoB(5, 'Elena', false,
    '"[No comentó ni compartió contenido del caso.]" /// Det. Alex: No hay participación relevante.',
    -44, 2, null, false, null);

const Emma = new NodoB(5, 'Emma', false,
    '"Me llegó la publicación, pero no la reenvié." /// Det. Alex: Recibió el contenido, pero no lo difundió.',
    -45, 2, null, false, null);

const Eric = new NodoB(5, 'Eric', false,
    '"Esto está empeorando y alguien debería ayudar a Valeria." /// Det. Alex: Expresa preocupación, no agresión.',
    -46, 2, null, false, null);

const Ethan = new NodoB(5, 'Ethan', false,
    '"[Guardó capturas y las envió a directivas.]" /// Det. Alex: Documenta el caso para ayudar.',
    -47, 2, null, false, null);

// =========================================================
//  DÍA 3
// =========================================================
const Eva = new NodoB(5, 'Eva', true,
    '"Valeria robó los exámenes y todos deberían saberlo." /// Det. Alex: La acusa de un hecho grave sin prueba.',
    4, 3, Sanciones[3][0], true, -3);

const Fabio = new NodoB(5, 'Fabio', true,
    '"Aquí está la captura donde Valeria supuestamente confiesa todo." /// Det. Alex: Difunde una prueba digital dudosa.',
    41, 3, Sanciones[3][1], true, 8);

const Irene = new NodoB(5, 'Irene', true,
    '"Reenvíen esa captura para que Valeria no siga mintiendo." /// Det. Alex: Ayuda a circular contenido dañino.',
    41, 3, Sanciones[3][1], true, 27);

const Isabel = new NodoB(5, 'Isabel', true,
    '"Algo raro hizo Valeria, aunque todavía no haya pruebas." /// Det. Alex: Difunde sospechas que dañan su imagen.',
    42, 3, Sanciones[3][2], true, 35);

const Isacc = new NodoB(5, 'Isacc', true,
    '"Si todos hablan mal de Valeria, por algo será." /// Det. Alex: Refuerza rumores sin evidencia.',
    42, 3, Sanciones[3][2], true, 50);

const Jackson = new NodoB(5, 'Jackson', false,
    '"Yo estuve allí y no vi nada raro con Valeria." /// Det. Alex: Contradice el rumor.',
    -23, 3, null, false, null);

const Joel = new NodoB(5, 'Joel', false,
    '"[Recibió las capturas, pero no las compartió.]" /// Det. Alex: No difundió el contenido.',
    -24, 3, null, false, null);

const Julia = new NodoB(5, 'Julia', false,
    '"Le dije a quien me mandó eso que dejara de reenviarlo." /// Det. Alex: Intenta detener la cadena.',
    -25, 3, null, false, null);

const Kevin = new NodoB(5, 'Kevin', false,
    '"[No tuvo actividad relacionada con el rumor.]" /// Det. Alex: No aparece vinculado al daño.',
    -26, 3, null, false, null);

const Laura = new NodoB(5, 'Laura', false,
    '"Esa captura parece editada y deberían revisarla bien." /// Det. Alex: Cuestiona la validez de la prueba.',
    -27, 3, null, false, null);
// =========================================================
//  DÍA 4
// =========================================================
const Leo = new NodoB(5, 'Leo', true,
    '"[Creó un perfil falso usando fotos de Valeria.]" /// Det. Alex: Se hizo pasar por ella.',
    5, 4, Sanciones[4][0], true, -5);

const Lina = new NodoB(5, 'Lina', true,
    '"[Entró a la cuenta real de Valeria y publicó desde allí.]" /// Det. Alex: Usó una cuenta ajena sin permiso.',
    51, 4, Sanciones[4][1], true, -1);

const Lucas = new NodoB(5, 'Lucas', true,
    '"[Envió fotos de Valeria a varios grupos sin autorización.]" /// Det. Alex: Difundió imágenes personales.',
    52, 4, Sanciones[4][2], true, 6);

const Luis = new NodoB(5, 'Luis', true,
    '"[Compartió el número y usuario de Valeria en privado.]" /// Det. Alex: Expuso datos personales.',
    52, 4, Sanciones[4][2], true, 11);

const Luisa = new NodoB(5, 'Luisa', true,
    '"[Reunió fotos y contactos de Valeria para pasarlos a otros.]" /// Det. Alex: Recopiló y distribuyó información privada.',
    52, 4, Sanciones[4][2], true, 23);

const Mia = new NodoB(5, 'Mia', true,
    '"[Abrió una cuenta falsa y respondió mensajes como Valeria.]" /// Det. Alex: Suplantó su identidad digital.',
    5, 4, Sanciones[4][0], true, -7);

const Nico = new NodoB(5, 'Nico', true,
    '"[Copió el nombre y fotos de Valeria para confundir a otros.]" /// Det. Alex: Usó su imagen para engañar.',
    5, 4, Sanciones[4][0], true, -4);

const Nora = new NodoB(5, 'Nora', true,
    '"[La cuenta real de Valeria fue usada desde un dispositivo extraño.]" /// Det. Alex: Hubo acceso no autorizado.',
    51, 4, Sanciones[4][1], true, -2);

const Oscar = new NodoB(5, 'Oscar', true,
    '"[Cambió la biografía de la cuenta real de Valeria.]" /// Det. Alex: Manipuló un perfil ajeno.',
    51, 4, Sanciones[4][1], true, 1);

const Paula = new NodoB(5, 'Paula', true,
    '"[Reenvió datos y fotos privadas de Valeria a grupos externos.]" /// Det. Alex: Difundió información personal.',
    52, 4, Sanciones[4][2], true, 7);

// =========================================================
//  DÍA 5
// =========================================================
const Ronald = new NodoB(5, 'Ronald', true,
    '"A las 8 todos comentamos hasta que Valeria desaparezca de redes." /// Det. Alex: Coordina un ataque digital.',
    3, 5, Sanciones[5][0], true, 29);

const Rosa = new NodoB(5, 'Rosa', true,
    '"Si sigues hablando, te va a ir muy mal." /// Det. Alex: Busca intimidarla.',
    31, 5, Sanciones[5][1], true, 33);

const Ruben = new NodoB(5, 'Ruben', true,
    '"No cuentes nada si sabes lo que te conviene." /// Det. Alex: Usa miedo para silenciarla.',
    31, 5, Sanciones[5][1], true, 38);

const Sara = new NodoB(5, 'Sara', true,
    '"[Organizó horarios y tareas para atacar a Valeria.]" /// Det. Alex: Hay planeación grupal.',
    32, 5, Sanciones[5][2], true, 48);

const Sofia = new NodoB(5, 'Sofia', true,
    '"[Invitó personas al grupo y les indicó qué publicar.]" /// Det. Alex: Ayuda a organizar el ataque.',
    32, 5, Sanciones[5][2], true, 16);

const Tomas = new NodoB(5, 'Tomas', true,
    '"[Indicó la hora para enviar mensajes contra Valeria.]" /// Det. Alex: Coordina acciones simultáneas.',
    3, 5, Sanciones[5][0], true, 26);

const Tyler = new NodoB(5, 'Tyler', true,
    '"[Publicó una lista con el orden de participación.]" /// Det. Alex: Organiza quién ataca y cuándo.',
    3, 5, Sanciones[5][0], true, 31);

const Valen = new NodoB(5, 'Valen', true,
    '"[Asignó roles para comentar, compartir y presionar.]" /// Det. Alex: Reparte tareas dentro del grupo.',
    32, 5, Sanciones[5][2], true, 34);

const Violeta = new NodoB(5, 'Violeta', true,
    '"[Preparó mensajes para que todos copiaran el mismo ataque.]" /// Det. Alex: Hay preparación coordinada.',
    32, 5, Sanciones[5][2], true, 36);

const Zoe = new NodoB(5, 'Zoe', true,
    '"Si denuncias, después no digas que no te avisamos." /// Det. Alex: Amenaza para evitar que hable.',
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

const configDias = {
    1: {
        principales: [Abril],
        secundariosA: [Adam, Allison],
        secundariosB: [Alma, Ana],
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