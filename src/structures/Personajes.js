import { NodoB } from './NodoB.js';
import { ArbolB } from './ArbolB.js';
import { Sanciones } from './Sanciones.js';

// =========================================================
//  NOMBRES DISPONIBLES
//  Estos nombres se mezclan cada nueva partida.
// =========================================================
const NOMBRES_PERSONAJES = [
    'Abril', 'Adam', 'Allison', 'Alma', 'Ana',
    'Andres', 'Anthony', 'Ben', 'Bruno', 'Camila',
    'Camilo', 'Clara', 'Cora', 'Dani', 'Diego',
    'Dylan', 'Elena', 'Emma', 'Eric', 'Ethan',
    'Eva', 'Fabio', 'Irene', 'Isabel', 'Isacc',
    'Jackson', 'Joel', 'Julia', 'Kevin', 'Laura',
    'Leo', 'Lina', 'Lucas', 'Luis', 'Luisa',
    'Mia', 'Nico', 'Nora', 'Oscar', 'Paula',
    'Ronald', 'Rosa', 'Ruben', 'Sara', 'Sofia',
    'Tomas', 'Tyler', 'Valen', 'Violeta', 'Zoe'
];

// =========================================================
//  CASOS POR DÍA
//  El día define el tipo de caso, delito y sanción.
//  El nombre del personaje se asigna aleatoriamente.
// =========================================================
const CASOS_POR_DIA = {
    1: {
        delitos: [
            {
                texto: '"Valeria, tus publicaciones dan pena y todos se burlan de ti." /// Pista: insulto directo que daña su dignidad.',
                rango: 1,
                sancion: Sanciones[1][0],
                activo: true,
                posicion: 0
            },
            {
                texto: '"Cada día voy a recordarte lo ridícula que eres." /// Pista: molestia repetida contra Valeria.',
                rango: 11,
                sancion: Sanciones[1][1],
                activo: true,
                posicion: 25
            },
            {
                texto: '"Cada vez que publiques, volveré a burlarme de ti." /// Pista: burla repetida cada vez que Valeria publica.',
                rango: 11,
                sancion: Sanciones[1][1],
                activo: true,
                posicion: -10
            },
            {
                texto: '"[Reaccionó con burlas en muchas publicaciones de Valeria.]" /// Pista: varias burlas alteran su tranquilidad.',
                rango: 12,
                sancion: Sanciones[1][2],
                activo: true,
                posicion: -25
            },
            {
                texto: '"[Dejó burlas constantes en fotos de Valeria durante varios días.]" /// Pista: molestia continua en sus redes.',
                rango: 12,
                sancion: Sanciones[1][2],
                activo: true,
                posicion: -40
            }
        ],
        inocentes: [
            {
                texto: '"Valeria, si necesitas apoyo, puedo acompañarte a hablar con alguien." /// Pista: ayuda a Valeria.',
                rango: -53,
                posicion: null
            },
            {
                texto: '"[No comentó ni compartió nada contra Valeria.]" /// Pista: no participa en el daño.',
                rango: -54,
                posicion: null
            },
            {
                texto: '"Dejen de molestar a Valeria por lo que publica." /// Pista: intenta detener la agresión.',
                rango: -55,
                posicion: null
            },
            {
                texto: '"Profe, tengo capturas de lo que le están haciendo a Valeria." /// Pista: aporta evidencia.',
                rango: -56,
                posicion: null
            },
            {
                texto: '"[Vio la situación, pero no participó ni difundió nada.]" /// Pista: no realizó una acción dañina.',
                rango: -57,
                posicion: null
            }
        ],
        cantidadDelitos: 4,
        cantidadInocentes: 1
    },

    2: {
        delitos: [
            // INJURIA AGRAVADA POR MEDIOS DIGITALES
            // Clave: insulto directo o humillación pública.
            {
                texto: '"Valeria es una inútil y una vergüenza para todos." /// Pista: insulto público directo.',
                rango: 2,
                sancion: Sanciones[2][0],
                activo: true,
                posicion: 63
            },
            {
                texto: '"Miren a Valeria, da pena verla hacer el ridículo." /// Pista: humillación pública con insultos.',
                rango: 2,
                sancion: Sanciones[2][0],
                activo: true,
                posicion: 20
            },

            // HOSTIGAMIENTO DIGITAL
            // Clave: persecución directa para presionarla o aislarla.
            {
                texto: '"No le respondan a Valeria y sáquenla de todos los grupos." /// Pista: presión directa para aislarla.',
                rango: 21,
                sancion: Sanciones[2][1],
                activo: true,
                posicion: 5
            },
            {
                texto: '"Cada vez que Valeria aparezca, la vamos a perseguir hasta que se vaya." /// Pista: persecución directa contra ella.',
                rango: 21,
                sancion: Sanciones[2][1],
                activo: true,
                posicion: 75
            },

            // PERTURBACIÓN A LA TRANQUILIDAD AGRAVADA
            // Clave: spam, llamadas, notificaciones o mensajes insistentes que no la dejan tranquila.
            {
                texto: '"Envíenle mensajes sin parar para llenarle las notificaciones." /// Pista: spam que altera su tranquilidad.',
                rango: 22,
                sancion: Sanciones[2][2],
                activo: true,
                posicion: 85
            },
            {
                texto: '"Etiquétenla en muchas publicaciones para que el celular no deje de sonar." /// Pista: molestias repetidas por notificaciones.',
                rango: 22,
                sancion: Sanciones[2][2],
                activo: true,
                posicion: 35
            }
        ],

        inocentes: [
            {
                texto: '"Borré esa publicación porque podía hacerle daño a Valeria." /// Pista: frena la difusión.',
                rango: -43,
                posicion: null
            },
            {
                texto: '"[No comentó ni compartió contenido del caso.]" /// Pista: no hay acción dañina.',
                rango: -44,
                posicion: null
            },
            {
                texto: '"Me llegó la publicación, pero no la reenvié." /// Pista: no difundió el contenido.',
                rango: -45,
                posicion: null
            },
            {
                texto: '"Esto está empeorando y alguien debería ayudar a Valeria." /// Pista: alerta sobre el daño.',
                rango: -46,
                posicion: null
            },
            {
                texto: '"[Guardó capturas y las envió a directivas.]" /// Pista: documenta para ayudar.',
                rango: -47,
                posicion: null
            }
        ],

        cantidadDelitos: 3,
        cantidadInocentes: 2
    },
    3: {
        delitos: [
            {
                texto: '"Valeria robó los exámenes y todos deberían saberlo." /// Pista: acusación grave sin pruebas.',
                rango: 4,
                sancion: Sanciones[3][0],
                activo: true,
                posicion: -3
            },
            {
                texto: '"Aquí está la captura donde Valeria supuestamente confiesa todo." /// Pista: prueba dudosa usada contra ella.',
                rango: 41,
                sancion: Sanciones[3][1],
                activo: true,
                posicion: 8
            },
            {
                texto: '"Reenvíen esa captura para que Valeria no siga mintiendo." /// Pista: circula una prueba sin verificar.',
                rango: 41,
                sancion: Sanciones[3][1],
                activo: true,
                posicion: 27
            },
            {
                texto: '"Algo raro hizo Valeria, aunque todavía no haya pruebas." /// Pista: sospecha sin evidencia.',
                rango: 42,
                sancion: Sanciones[3][2],
                activo: true,
                posicion: 35
            },
            {
                texto: '"Si todos hablan mal de Valeria, por algo será." /// Pista: refuerza rumores sin pruebas.',
                rango: 42,
                sancion: Sanciones[3][2],
                activo: true,
                posicion: 50
            }
        ],
        inocentes: [
            {
                texto: '"Yo estuve allí y no vi nada raro con Valeria." /// Pista: contradice el rumor.',
                rango: -23,
                posicion: null
            },
            {
                texto: '"[Recibió las capturas, pero no las compartió.]" /// Pista: no difundió la información.',
                rango: -24,
                posicion: null
            },
            {
                texto: '"Le dije a quien me mandó eso que dejara de reenviarlo." /// Pista: corta la cadena de difusión.',
                rango: -25,
                posicion: null
            },
            {
                texto: '"[No tuvo actividad relacionada con el rumor.]" /// Pista: no participa en el caso.',
                rango: -26,
                posicion: null
            },
            {
                texto: '"Esa captura parece editada y deberían revisarla bien." /// Pista: pide verificar la prueba.',
                rango: -27,
                posicion: null
            }
        ],
        cantidadDelitos: 3,
        cantidadInocentes: 2
    },

    4: {
        delitos: [
            {
                texto: '"[Creó un perfil falso usando fotos de Valeria.]" /// Pista: se hace pasar por Valeria.',
                rango: 5,
                sancion: Sanciones[4][0],
                activo: true,
                posicion: -5
            },
            {
                texto: '"[Entró a la cuenta real de Valeria y publicó desde allí.]" /// Pista: usa una cuenta ajena.',
                rango: 51,
                sancion: Sanciones[4][1],
                activo: true,
                posicion: -1
            },
            {
                texto: '"[Envió fotos de Valeria a varios grupos sin autorización.]" /// Pista: comparte fotos sin permiso.',
                rango: 52,
                sancion: Sanciones[4][2],
                activo: true,
                posicion: 6
            },
            {
                texto: '"[Compartió el número y usuario de Valeria en privado.]" /// Pista: expone datos personales.',
                rango: 52,
                sancion: Sanciones[4][2],
                activo: true,
                posicion: 11
            },
            {
                texto: '"[Reunió fotos y contactos de Valeria para pasarlos a otros.]" /// Pista: distribuye información privada.',
                rango: 52,
                sancion: Sanciones[4][2],
                activo: true,
                posicion: 23
            }
        ],
        inocentes: [
            {
                texto: '"[Reportó una cuenta falsa que usaba fotos de Valeria.]" /// Pista: ayuda a denunciar.',
                rango: -13,
                posicion: null
            },
            {
                texto: '"[Cambió su propia contraseña por seguridad.]" /// Pista: protege su cuenta.',
                rango: -14,
                posicion: null
            },
            {
                texto: '"[Avisó que estaban compartiendo datos privados de Valeria.]" /// Pista: alerta sobre el riesgo.',
                rango: -15,
                posicion: null
            }
        ],
        cantidadDelitos: 5,
        cantidadInocentes: 0
    },

    5: {
        delitos: [
            {
                texto: '"A las 8 todos comentamos hasta que Valeria desaparezca de redes." /// Pista: ataque grupal organizado.',
                rango: 3,
                sancion: Sanciones[5][0],
                activo: true,
                posicion: 29
            },
            {
                texto: '"Si sigues hablando, te va a ir muy mal." /// Pista: intenta asustarla.',
                rango: 31,
                sancion: Sanciones[5][1],
                activo: true,
                posicion: 33
            },
            {
                texto: '"No cuentes nada si sabes lo que te conviene." /// Pista: la intimida para que calle.',
                rango: 31,
                sancion: Sanciones[5][1],
                activo: true,
                posicion: 38
            },
            {
                texto: '"[Organizó horarios y tareas para atacar a Valeria.]" /// Pista: reparte tareas del ataque.',
                rango: 32,
                sancion: Sanciones[5][2],
                activo: true,
                posicion: 48
            },
            {
                texto: '"[Invitó personas al grupo y les indicó qué publicar.]" /// Pista: coordina participantes.',
                rango: 32,
                sancion: Sanciones[5][2],
                activo: true,
                posicion: 16
            }
        ],
        inocentes: [
            {
                texto: '"[Salió del grupo cuando vio que atacarían a Valeria.]" /// Pista: no participa en el ataque.',
                rango: -33,
                posicion: null
            },
            {
                texto: '"[Guardó evidencia del grupo para entregarla.]" /// Pista: ayuda a probar lo ocurrido.',
                rango: -34,
                posicion: null
            }
        ],
        cantidadDelitos: 5,
        cantidadInocentes: 0
    }
};

// =========================================================
//  VARIABLES EXPORTADAS
//  Se actualizan cada vez que se resetea la partida.
// =========================================================
export let TodosLosPersonajes = [];
export let Dias = {};
export let implicadosTotales = [];
export let conexionesMaestras = [];
export let desbloqueoPorDia = {};
export const arbolDias = {};

let seleccionPartidaActual = {};

// =========================================================
//  FUNCIONES AUXILIARES
// =========================================================
function mezclarArray(lista) {
    const copia = [...lista];

    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }

    return copia;
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

function obtenerClaveTipoDelito(caso) {
    if (caso.sancion && caso.sancion.nombre) {
        return caso.sancion.nombre;
    }

    return `tipo_${caso.rango}`;
}

function escogerDelitosUsandoTodosLosTipos(delitosBase, cantidadDelitos) {
    const delitos = delitosBase.map(caso => ({
        ...caso,
        delito: true
    }));

    const grupos = {};

    delitos.forEach(caso => {
        const clave = obtenerClaveTipoDelito(caso);

        if (!grupos[clave]) {
            grupos[clave] = [];
        }

        grupos[clave].push(caso);
    });

    const tipos = Object.keys(grupos);
    const seleccionados = [];

    tipos.forEach(tipo => {
        const opciones = grupos[tipo];
        const elegido = escogerVariosSinRepetir(opciones, 1)[0];

        if (elegido) {
            seleccionados.push(elegido);
        }
    });

    if (seleccionados.length > cantidadDelitos) {
        return mezclarArray(seleccionados).slice(0, cantidadDelitos);
    }

    let faltan = cantidadDelitos - seleccionados.length;

    const restantes = delitos.filter(caso => {
        return !seleccionados.some(sel =>
            sel.texto === caso.texto &&
            sel.rango === caso.rango &&
            obtenerClaveTipoDelito(sel) === obtenerClaveTipoDelito(caso)
        );
    });

    const extras = mezclarArray(restantes).slice(0, faltan);
    seleccionados.push(...extras);

    faltan = cantidadDelitos - seleccionados.length;

    while (faltan > 0 && delitos.length > 0) {
        const copia = {
            ...delitos[Math.floor(Math.random() * delitos.length)]
        };

        seleccionados.push(copia);
        faltan--;
    }

    return mezclarArray(seleccionados);
}

function tomarNombre(nombresDisponibles) {
    if (!nombresDisponibles.length) {
        return `Persona_${Math.floor(Math.random() * 9999)}`;
    }

    return nombresDisponibles.shift();
}

function crearNodoDesdeCaso(nombre, caso, dia) {
    return new NodoB(
        5,
        nombre,
        caso.delito === true,
        caso.texto,
        caso.rango,
        dia,
        caso.sancion || null,
        caso.activo === true,
        caso.posicion
    );
}

function seleccionarCasosDelDia(dia) {
    const cfg = CASOS_POR_DIA[dia];

    if (!cfg) return [];

    const delitos = escogerDelitosUsandoTodosLosTipos(
        cfg.delitos,
        cfg.cantidadDelitos
    );

    const inocentes = escogerVariosSinRepetir(
        cfg.inocentes.map(caso => ({
            ...caso,
            delito: false,
            sancion: null,
            activo: false
        })),
        cfg.cantidadInocentes
    );

    return mezclarArray([
        ...delitos,
        ...inocentes
    ]);
}

function sincronizarGlobales() {
    window.implicadosTotales = implicadosTotales;
    window.conexionesMaestras = conexionesMaestras;
    window.desbloqueoPorDia = desbloqueoPorDia;
    window.VALERIA = VALERIA;
}

function nombreNodo(nodo) {
    return nodo ? nodo.nombre : 'VALERIA';
}

function crearConexion(nodoA, nodoB, relacion, peso, capacidad) {
    return {
        from: nombreNodo(nodoA),
        to: nodoB === VALERIA ? 'Valeria' : nombreNodo(nodoB),
        relacion,
        peso,
        capacidad
    };
}

function construirGrafoDinamico() {
    const culpables = TodosLosPersonajes.filter(pj => pj.delito === true);

    implicadosTotales = culpables;

    const g = culpables;

    conexionesMaestras = [];

    if (g.length >= 4) {
        conexionesMaestras.push(
            crearConexion(g[0], g[1], 'nivel 1', 2, 4),
            crearConexion(g[0], g[2], 'nivel 1', 4, 3),
            crearConexion(g[1], g[3], 'nivel 2', 3, 4),
            crearConexion(g[2], g[3], 'nivel 2', 5, 4),
            crearConexion(g[3], VALERIA, 'impacto final', 6, 5)
        );
    }

    if (g.length >= 7) {
        conexionesMaestras.push(
            crearConexion(g[1], g[4], 'difusión del rastro', 3, 5),
            crearConexion(g[2], g[5], 'presión en red', 4, 4),
            crearConexion(g[4], g[5], 'interacción grupal', 2, 6),
            crearConexion(g[4], g[6], 'expansión del caso', 5, 4),
            crearConexion(g[5], VALERIA, 'afectación indirecta', 7, 5),
            crearConexion(g[6], VALERIA, 'afectación indirecta', 6, 4)
        );
    }

    if (g.length >= 10) {
        conexionesMaestras.push(
            crearConexion(g[5], g[7], 'nuevo rastro', 4, 4),
            crearConexion(g[6], g[8], 'contenido reenviado', 5, 5),
            crearConexion(g[7], g[8], 'evidencia dudosa', 2, 6),
            crearConexion(g[7], g[9], 'rumor extendido', 6, 3),
            crearConexion(g[8], VALERIA, 'daño reputacional', 8, 5),
            crearConexion(g[9], VALERIA, 'daño reputacional', 7, 4)
        );
    }

    if (g.length >= 15) {
        conexionesMaestras.push(
            crearConexion(g[8], g[10], 'salto a identidad digital', 5, 4),
            crearConexion(g[9], g[11], 'rastro técnico', 4, 5),
            crearConexion(g[10], g[11], 'actividad coordinada', 3, 6),
            crearConexion(g[10], g[12], 'uso de imagen', 6, 4),
            crearConexion(g[11], g[13], 'acceso y exposición', 5, 5),
            crearConexion(g[12], g[14], 'datos compartidos', 4, 5),
            crearConexion(g[13], VALERIA, 'exposición personal', 8, 4),
            crearConexion(g[14], VALERIA, 'exposición personal', 7, 4)
        );
    }

    if (g.length >= 20) {
        conexionesMaestras.push(
            crearConexion(g[13], g[15], 'organización del caso', 5, 6),
            crearConexion(g[14], g[16], 'presión directa', 6, 5),
            crearConexion(g[15], g[17], 'coordinación', 3, 7),
            crearConexion(g[15], g[18], 'roles asignados', 4, 6),
            crearConexion(g[17], g[19], 'presión sostenida', 5, 5),
            crearConexion(g[18], g[19], 'grupo organizado', 2, 7),
            crearConexion(g[16], VALERIA, 'presión final', 8, 5),
            crearConexion(g[19], VALERIA, 'presión final', 7, 6)
        );
    }

    construirDesbloqueoDinamico();
}

function construirDesbloqueoDinamico() {
    const acumulado = [];

    desbloqueoPorDia = {};

    for (let dia = 1; dia <= 5; dia++) {
        const culpablesDia = (Dias[dia] || [])
            .filter(pj => pj.delito === true)
            .map(pj => pj.nombre);

        acumulado.push(...culpablesDia);

        desbloqueoPorDia[dia] = [...acumulado];
    }
}

// =========================================================
//  DATOS DE VALERIA
// =========================================================
export const VALERIA = {
    id: 'VALERIA',
    nombre: 'Valeria',
    esVictima: true,
    activo: true
};

// =========================================================
//  REINICIAR / GENERAR NUEVA PARTIDA
// =========================================================
export function resetPersonajesPartida() {
    seleccionPartidaActual = {};

    Object.keys(arbolDias).forEach(k => delete arbolDias[k]);

    const nombresDisponibles = mezclarArray(NOMBRES_PERSONAJES);

    Dias = {};
    TodosLosPersonajes = [];

    for (let dia = 1; dia <= 5; dia++) {
        const casosDia = seleccionarCasosDelDia(dia);

        const personajesDia = casosDia.map(caso => {
            const nombre = tomarNombre(nombresDisponibles);
            return crearNodoDesdeCaso(nombre, caso, dia);
        });

        Dias[dia] = personajesDia;
        TodosLosPersonajes.push(...personajesDia);
    }

    construirReferenciasABB();
    construirGrafoDinamico();
    sincronizarGlobales();
}

function construirReferenciasABB() {
    const culpables = TodosLosPersonajes.filter(pj => pj.delito === true);

    for (let i = 0; i < culpables.length; i++) {
        culpables[i]._izqReal = null;
        culpables[i]._derReal = null;
        culpables[i]._padreReal = null;
    }

    for (let i = 0; i < culpables.length; i++) {
        const actual = culpables[i];
        const izq = culpables[(i * 2) + 1];
        const der = culpables[(i * 2) + 2];

        if (izq) {
            actual._izqReal = izq;
            izq._padreReal = actual;
        }

        if (der) {
            actual._derReal = der;
            der._padreReal = actual;
        }
    }
}

// =========================================================
//  FUNCIONES USADAS POR LAS ESCENAS
// =========================================================
export function vectorDelDia(dia) {
    if (!seleccionPartidaActual[dia]) {
        seleccionPartidaActual[dia] = Dias[dia] || [];
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

// Genera una partida inicial cuando se importa el archivo.
// Luego ModoJuego vuelve a llamar resetPersonajesPartida()
// cada vez que empieza una partida nueva.
resetPersonajesPartida();