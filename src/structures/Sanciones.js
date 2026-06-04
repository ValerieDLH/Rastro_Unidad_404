import { ContenidoSancion } from './ContenidoSancion.js';

export const Sanciones = {
    1: [
        new ContenidoSancion(
            'Injuria',
            'Insultos o humillaciones que dañan la dignidad de Valeria.',
            'Multa, retractación y corrección pública.',
            'Ejemplo: decirle “das pena” para humillarla.',
            'Art. 220 Código Penal Colombiano — Injuria.'
        ),
        new ContenidoSancion(
            'Acoso reiterado',
            'Molestias repetidas que afectan la tranquilidad de Valeria.',
            'Orden de cese, bloqueo y medida de protección.',
            'Ejemplo: insultarla cada vez que publica algo.',
            'Ley 1620 de 2013 — Ciberacoso.'
        ),
        new ContenidoSancion(
            'Perturbación a la tranquilidad',
            'Burlas o molestias constantes que alteran su paz digital.',
            'Llamado de atención, orden de cese o multa menor.',
            'Ejemplo: reaccionar con burlas en muchas publicaciones.',
            'Protección a la honra y tranquilidad de la víctima.'
        )
    ],

    2: [
        new ContenidoSancion(
            'Injuria agravada por medios digitales',
            'Insulto difundido en redes o grupos, aumentando el daño.',
            'Multa, retractación pública y sanción agravada.',
            'Ejemplo: publicar una burla y pedir que todos la compartan.',
            'Art. 220 Código Penal, agravado por difusión digital.'
        ),
        new ContenidoSancion(
            'Hostigamiento digital',
            'Presión o ataque en redes para cansar, aislar o humillar.',
            'Orden de cese, restricciones digitales y sanción disciplinaria.',
            'Ejemplo: pedir a un grupo que ataque su cuenta.',
            'Ley 1620 de 2013 — Ciberacoso.'
        ),
        new ContenidoSancion(
            'Perturbación a la tranquilidad agravada',
            'Molestia repetida que se agrava porque otros la difunden.',
            'Multa mayor, orden de cese y responsabilidad individual.',
            'Ejemplo: compartir una burla en varios grupos.',
            'Agravación por difusión o participación coordinada.'
        )
    ],

    3: [
        new ContenidoSancion(
            'Calumnia',
            'Acusar falsamente a Valeria de un hecho grave o delito.',
            'Retractación, multa y posible sanción penal.',
            'Ejemplo: decir que robó exámenes sin pruebas.',
            'Art. 221 Código Penal Colombiano — Calumnia.'
        ),
        new ContenidoSancion(
            'Difamación digital',
            'Compartir información falsa o manipulada para dañar su imagen.',
            'Eliminar contenido, retractarse y reparar el daño.',
            'Ejemplo: reenviar una captura editada.',
            'Protección del buen nombre en medios digitales.'
        ),
        new ContenidoSancion(
            'Daño a la reputación por información falsa',
            'Difundir rumores que dañan el buen nombre de Valeria.',
            'Retractación, eliminación del contenido y reparación.',
            'Ejemplo: decir que Valeria engaña a todos sin pruebas.',
            'Art. 15 Constitución Política — Buen nombre.'
        )
    ],

    4: [
        new ContenidoSancion(
            'Suplantación de identidad digital',
            'Usar nombre, foto o identidad de Valeria para hacerse pasar por ella.',
            'Eliminar perfil falso y reparar el daño.',
            'Ejemplo: crear una cuenta falsa con sus fotos.',
            'Ley 1273 de 2009 — Protección de identidad digital.'
        ),
        new ContenidoSancion(
            'Delito informático por acceso no autorizado',
            'Entrar sin permiso a una cuenta o plataforma de Valeria.',
            'Prisión y multa si se demuestra el acceso abusivo.',
            'Ejemplo: publicar desde la cuenta real de Valeria.',
            'Ley 1273 de 2009 — Art. 269A.'
        ),
        new ContenidoSancion(
            'Uso indebido de datos personales',
            'Compartir fotos, número, ubicación o datos privados sin permiso.',
            'Eliminar datos, multa y posible sanción penal.',
            'Ejemplo: reenviar fotos o número de Valeria.',
            'Ley 1581 de 2012 — Protección de datos personales.'
        )
    ],

    5: [
        new ContenidoSancion(
            'Acoso y hostigamiento digital coordinado',
            'Organizar a varias personas para atacar a Valeria en redes.',
            'Sanción mayor para organizadores y participantes.',
            'Ejemplo: fijar una hora para que todos la ataquen.',
            'Ley 1620 de 2013 — Ciberacoso coordinado.'
        ),
        new ContenidoSancion(
            'Amenazas graves por medios digitales',
            'Mensajes que buscan asustar a Valeria anunciando un posible daño.',
            'Prisión y medidas de protección.',
            'Ejemplo: “si hablas, te va a ir muy mal”.',
            'Art. 347 Código Penal Colombiano — Amenazas.'
        ),
        new ContenidoSancion(
            'Asociación para cometer ciberacoso',
            'Grupo organizado con roles, horarios o tareas para acosar.',
            'Sanción según participación dentro del grupo.',
            'Ejemplo: decidir quién comenta, comparte y presiona.',
            'Art. 340 Código Penal — Referencia narrativa de organización.'
        )
    ]
};