import { NodoB } from './NodoB.js';
import { ArbolB } from './ArbolB.js';
import { Sanciones } from './Sanciones.js';

// =========================================================
//  DÍA 1
// =========================================================
const Abril = new NodoB(5, 'Abril', true,
    '"Valeria, das pena. Nadie te soporta en este colegio y ojalá dejaras de publicar cosas porque solo haces el ridículo." /// Det. Alex: Pista fuerte: aquí el daño está en insultar y humillar directamente a Valeria. No se habla de cuentas falsas, amenazas ni de acusarla de haber cometido un delito.',
    1, 1, Sanciones[1][0], true, 0);

const Adam = new NodoB(5, 'Adam', true,
    '"Otra vez tú publicando. Todos los días haces el mismo ridículo. Mañana también voy a estar aquí para recordártelo." /// Det. Alex: Pista fuerte: no es un comentario aislado. El problema es que la molestia se repite varias veces y busca incomodar a Valeria de forma constante.',
    11, 1, Sanciones[1][1], true, 25);

const Allison = new NodoB(5, 'Allison', true,
    '"Cada vez que subas una foto, yo voy a aparecer para burlarme. No creas que esto se acaba hoy." /// Det. Alex: Pista fuerte: la clave está en la repetición. La persona anuncia que seguirá molestando a Valeria cada vez que publique algo.',
    11, 1, Sanciones[1][1], true, -10);

const Alma = new NodoB(5, 'Alma', true,
    '"[Reaccionó con 😂 en muchas publicaciones de Valeria y compartió varias sin escribir nada más]" /// Det. Alex: Pista media: no hay insulto directo ni amenaza, pero la repetición de reacciones y compartidos altera la tranquilidad de Valeria.',
    12, 1, Sanciones[1][2], true, -25);

const Ana = new NodoB(5, 'Ana', true,
    '"[Dejó reacciones de burla en varias fotos de Valeria durante varios días, sin escribir mensajes directos]" /// Det. Alex: Pista media: la conducta parece pequeña por separado, pero al repetirse muchas veces termina molestando y afectando la calma de Valeria.',
    12, 1, Sanciones[1][2], true, -40);

const Andres = new NodoB(5, 'Andres', false,
    '"Oye, vi lo que está pasando en el grupo. ¿Estás bien? Si necesitas ayuda, puedo acompañarte a hablar con alguien." /// Det. Alex: mensaje de apoyo. No hay burla, amenaza, acusación ni difusión de contenido dañino.',
    -53, 1, null, false, null);

const Anthony = new NodoB(5, 'Anthony', false,
    '"[Aparece en la lista de contactos, pero no comentó, no compartió y no reaccionó contra Valeria]" /// Det. Alex: no hay actividad relevante contra la víctima.',
    -54, 1, null, false, null);

const Ben = new NodoB(5, 'Ben', false,
    '"Ya paren. No está bien seguir molestando a Valeria por lo que publica." /// Det. Alex: intenta frenar la situación. No participa en el ataque.',
    -55, 1, null, false, null);

const Bruno = new NodoB(5, 'Bruno', false,
    '"Profe, mire estas capturas. Creo que están molestando a Valeria en el grupo." /// Det. Alex: aporta evidencia a una autoridad. No participa en la conducta dañina.',
    -56, 1, null, false, null);

const Camila = new NodoB(5, 'Camila', false,
    '"[Vio algunos hilos, pero no publicó, no reaccionó y no compartió contenido contra Valeria]" /// Det. Alex: presencia pasiva sin participación activa.',
    -57, 1, null, false, null);

// =========================================================
//  DÍA 2
// =========================================================
const Camilo = new NodoB(5, 'Camilo', true,
    '"Miren lo que publicó Valeria. Es una vergüenza. Compártanlo para que todo el colegio vea la clase de persona que es." /// Det. Alex: Pista fuerte: hay ataque público a la honra de Valeria y además se busca que el daño se expanda por redes o grupos.',
    2, 2, Sanciones[2][0], true, 63);

const Clara = new NodoB(5, 'Clara', true,
    '"Vamos todos a comentarle hasta que cierre la cuenta. Que nadie le responda normal y que se canse de estar en redes." /// Det. Alex: Pista fuerte: no actúa sola. Está llamando a varias personas para presionar y atacar a Valeria en internet.',
    21, 2, Sanciones[2][1], true, 5);

const Cora = new NodoB(5, 'Cora', true,
    '"No le den like, no le hablen y hagan que se quede sola. Que sienta que nadie la quiere aquí." /// Det. Alex: Pista fuerte: la intención es aislar a Valeria y presionarla digitalmente con ayuda de otras personas.',
    21, 2, Sanciones[2][1], true, 75);

const Dani = new NodoB(5, 'Dani', true,
    '"[Reenvió la publicación ofensiva de Valeria en varios grupos del colegio para que más personas la vieran]" /// Det. Alex: Pista media: no inició el ataque, pero ayudó a difundirlo. La clave está en aumentar el alcance del daño.',
    22, 2, Sanciones[2][2], true, 85);

const Diego = new NodoB(5, 'Diego', true,
    '"Exactamente, que todos se enteren. Yo también lo voy a mover por los grupos." /// Det. Alex: Pista media: refuerza y expande una publicación dañina. No crea el contenido principal, pero ayuda a que circule.',
    22, 2, Sanciones[2][2], true, 20);

const Dylan = new NodoB(5, 'Dylan', false,
    '"Borré eso de mi perfil apenas lo vi. No quiero ayudar a que sigan dañando a Valeria." /// Det. Alex: elimina contenido relacionado. No participa activamente en el daño.',
    -43, 2, null, false, null);

const Elena = new NodoB(5, 'Elena', false,
    '"[No aparece comentando, compartiendo ni reaccionando al contenido del caso]" /// Det. Alex: no hay actividad relevante contra Valeria.',
    -44, 2, null, false, null);

const Emma = new NodoB(5, 'Emma', false,
    '"Me llegó esa publicación, pero no la reenvié porque podía hacerle más daño." /// Det. Alex: recibió contenido, pero no lo difundió ni lo reforzó.',
    -45, 2, null, false, null);

const Eric = new NodoB(5, 'Eric', false,
    '"Esto se salió de control. Alguien debería ayudar a Valeria antes de que siga empeorando." /// Det. Alex: comentario de preocupación. No ataca ni distribuye contenido dañino.',
    -46, 2, null, false, null);

const Ethan = new NodoB(5, 'Ethan', false,
    '"[Guardó capturas del hilo principal y las envió con fecha y hora a directivas]" /// Det. Alex: aporta documentación al caso. No participa en el ataque.',
    -47, 2, null, false, null);

// =========================================================
//  DÍA 3
// =========================================================
const Eva = new NodoB(5, 'Eva', true,
    '"Valeria robó los exámenes del colegio. Yo sé que fue ella, aunque intente negarlo." /// Det. Alex: Pista fuerte: aquí se acusa a Valeria de un hecho grave y concreto. No es solo insulto; se le atribuye una conducta seria que dañaría su reputación.',
    4, 3, Sanciones[3][0], true, -3);

const Fabio = new NodoB(5, 'Fabio', true,
    '"Les mando esta captura donde supuestamente Valeria admite lo de los exámenes. Pásenla para que todos sepan." /// Det. Alex: Pista fuerte: usa una supuesta prueba digital para hacer creer algo dañino. La clave está en difundir material dudoso, falso o manipulado.',
    41, 3, Sanciones[3][1], true, 8);

const Irene = new NodoB(5, 'Irene', true,
    '"Yo vi esa captura. Valeria sí lo aceptó. Reenvíenla para que no siga fingiendo." /// Det. Alex: Pista fuerte: no creó la captura, pero ayuda a mover información dañina por medios digitales.',
    41, 3, Sanciones[3][1], true, 27);

const Isabel = new NodoB(5, 'Isabel', true,
    '"Se lo conté a varios papás porque Valeria no es tan buena como parece. Algo raro hizo, aunque no tenga pruebas." /// Det. Alex: Pista media: no presenta un hecho concreto comprobado, pero difunde sospechas que dañan la imagen de Valeria ante otros.',
    42, 3, Sanciones[3][2], true, 35);

const Isacc = new NodoB(5, 'Isacc', true,
    '"Varios dicen que Valeria engaña a todos y hace cosas raras. Si tanta gente lo dice, por algo será." /// Det. Alex: Pista media: alimenta rumores sin prueba clara. El daño está en afectar el buen nombre de Valeria.',
    42, 3, Sanciones[3][2], true, 50);

const Jackson = new NodoB(5, 'Jackson', false,
    '"Esperen, eso no tiene sentido. Yo estaba en esa clase y no vi nada raro con Valeria." /// Det. Alex: contradice la versión circulante. No ataca a Valeria.',
    -23, 3, null, false, null);

const Joel = new NodoB(5, 'Joel', false,
    '"[Recibió las capturas por WhatsApp, pero no las reenvió a nadie]" /// Det. Alex: receptor sin redistribución.',
    -24, 3, null, false, null);

const Julia = new NodoB(5, 'Julia', false,
    '"Me llegó eso y le dije a quien me lo mandó que no lo siguiera pasando." /// Det. Alex: intenta frenar la distribución del contenido.',
    -25, 3, null, false, null);

const Kevin = new NodoB(5, 'Kevin', false,
    '"[No tuvo actividad relacionada con las capturas ni con los rumores sobre Valeria]" /// Det. Alex: sin interacción con el contenido del caso.',
    -26, 3, null, false, null);

const Laura = new NodoB(5, 'Laura', false,
    '"Esa captura parece editada. Miren bien la fuente del texto y la hora del mensaje." /// Det. Alex: señala inconsistencias en el material. No difunde el daño.',
    -27, 3, null, false, null);

// =========================================================
//  DÍA 4
// =========================================================
const Leo = new NodoB(5, 'Leo', true,
    '"[Creó un perfil nuevo con fotos reales de Valeria y publicó: soy una amargada y odio a todos]" /// Det. Alex: Pista fuerte: no entró a la cuenta real. Creó una cuenta aparte usando la identidad de Valeria para hacer creer que ella escribía eso.',
    5, 4, Sanciones[4][0], true, -5);

const Lina = new NodoB(5, 'Lina', true,
    '"[Entró a la cuenta real de Valeria y publicó desde allí: me inventé todo para llamar la atención]" /// Det. Alex: Pista fuerte: la cuenta sí era la verdadera. El problema es que alguien ingresó sin permiso y publicó desde un perfil ajeno.',
    51, 4, Sanciones[4][1], true, -1);

const Lucas = new NodoB(5, 'Lucas', true,
    '"[Descargó fotos de Valeria y las envió a varios grupos sin autorización]" /// Det. Alex: Pista fuerte: no se trata de insultos ni de una cuenta falsa. El centro del daño es usar y mover imágenes personales sin permiso.',
    52, 4, Sanciones[4][2], true, 6);

const Luis = new NodoB(5, 'Luis', true,
    '"[Compartió por privado el número de teléfono, usuario y ubicación aproximada de Valeria]" /// Det. Alex: Pista fuerte: está difundiendo información personal. La clave está en datos privados como contacto, ubicación o identidad digital.',
    52, 4, Sanciones[4][2], true, 11);

const Luisa = new NodoB(5, 'Luisa', true,
    '"[Reunió fotos, usuarios y contactos de Valeria para pasarlos a otros perfiles]" /// Det. Alex: Pista fuerte: recopila y distribuye información personal sin autorización. No necesita entrar a la cuenta para causar daño.',
    52, 4, Sanciones[4][2], true, 23);

const Mia = new NodoB(5, 'Mia', true,
    '"[Abrió una cuenta nueva con la foto de Valeria y empezó a responder mensajes como si fuera ella]" /// Det. Alex: Pista fuerte: usa una identidad falsa para engañar a otros. La cuenta no pertenece realmente a Valeria.',
    5, 4, Sanciones[4][0], true, -7);

const Nico = new NodoB(5, 'Nico', true,
    '"[Usó un nombre parecido al de Valeria, copió sus fotos y habló con compañeros fingiendo ser ella]" /// Det. Alex: Pista fuerte: intenta confundir a otras personas usando la imagen y el nombre de Valeria.',
    5, 4, Sanciones[4][0], true, -4);

const Nora = new NodoB(5, 'Nora', true,
    '"[Desde la cuenta real de Valeria se publicaron mensajes durante la madrugada desde un dispositivo desconocido]" /// Det. Alex: Pista fuerte: la señal importante es el ingreso a un perfil verdadero sin autorización, no la creación de una cuenta falsa.',
    51, 4, Sanciones[4][1], true, -2);

const Oscar = new NodoB(5, 'Oscar', true,
    '"[Cambió la biografía de la cuenta real de Valeria y dejó mensajes ofensivos desde ese mismo perfil]" /// Det. Alex: Pista fuerte: manipuló una cuenta existente. El punto clave es el uso de un acceso ajeno sin permiso.',
    51, 4, Sanciones[4][1], true, 1);

const Paula = new NodoB(5, 'Paula', true,
    '"[Reenvió capturas con el número, usuario y fotos privadas de Valeria a grupos externos]" /// Det. Alex: Pista fuerte: el daño está en difundir datos e imágenes personales. No se evidencia que haya entrado a la cuenta original.',
    52, 4, Sanciones[4][2], true, 7);

// =========================================================
//  DÍA 5
// =========================================================
const Ronald = new NodoB(5, 'Ronald', true,
    '"Todos juntos a las 8. Comenten, etiqueten y no paren hasta que Valeria desaparezca de redes." /// Det. Alex: Pista fuerte: coordina un ataque digital entre varias personas. La clave es que da una hora y llama a actuar en grupo.',
    3, 5, Sanciones[5][0], true, 29);

const Rosa = new NodoB(5, 'Rosa', true,
    '"Si sigues hablando, te va a ir muy mal. Esto no es una broma." /// Det. Alex: Pista fuerte: el mensaje busca causar miedo. No es burla ni rumor; anuncia una consecuencia negativa si Valeria sigue hablando.',
    31, 5, Sanciones[5][1], true, 33);

const Ruben = new NodoB(5, 'Ruben', true,
    '"Más te vale no contar nada. Ya sabes cómo termina la gente que habla de más." /// Det. Alex: Pista fuerte: hay intimidación directa para silenciar a Valeria. La intención principal es meter miedo.',
    31, 5, Sanciones[5][1], true, 38);

const Sara = new NodoB(5, 'Sara', true,
    '"[Grupo privado: hoy atacamos a las 8, mañana a las 10. Cada uno tiene una tarea]" /// Det. Alex: Pista fuerte: hay planeación, horarios y tareas. No es espontáneo; varias personas se organizan para ejecutar el daño.',
    32, 5, Sanciones[5][2], true, 48);

const Sofia = new NodoB(5, 'Sofia', true,
    '"[Invitó a nuevos contactos al grupo privado y les explicó qué mensajes debían publicar]" /// Det. Alex: Pista fuerte: ayuda a organizar a más personas y reparte instrucciones. La clave es la estructura del grupo.',
    32, 5, Sanciones[5][2], true, 16);

const Tomas = new NodoB(5, 'Tomas', true,
    '"[Dio la hora exacta para que varias cuentas enviaran mensajes contra Valeria al mismo tiempo]" /// Det. Alex: Pista fuerte: la señal principal es la coordinación simultánea. No es un comentario aislado.',
    3, 5, Sanciones[5][0], true, 26);

const Tyler = new NodoB(5, 'Tyler', true,
    '"[Publicó una lista de perfiles que debían comentar y el orden en que cada uno debía hacerlo]" /// Det. Alex: Pista fuerte: organiza la dinámica del ataque. Hay control sobre quién participa y cuándo lo hace.',
    3, 5, Sanciones[5][0], true, 31);

const Valen = new NodoB(5, 'Valen', true,
    '"[Asignó tareas dentro del grupo: quién comenta, quién comparte y quién presiona a los amigos de Valeria]" /// Det. Alex: Pista fuerte: hay roles repartidos. La conducta depende de la organización entre varias personas.',
    32, 5, Sanciones[5][2], true, 34);

const Violeta = new NodoB(5, 'Violeta', true,
    '"[Preparó mensajes modelo y pidió que todos copiaran el mismo texto durante la noche]" /// Det. Alex: Pista fuerte: existe preparación previa e instrucciones comunes. No parece una reacción individual.',
    32, 5, Sanciones[5][2], true, 36);

const Zoe = new NodoB(5, 'Zoe', true,
    '"Si vas con la coordinación, después no digas que no te avisamos." /// Det. Alex: Pista fuerte: busca asustar a Valeria para que no denuncie. La clave está en la intimidación directa.',
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