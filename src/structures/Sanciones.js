import { ContenidoSancion } from './ContenidoSancion.js';

export const Sanciones = {
    1: [
        new ContenidoSancion(
            'Injuria',
            'Qué significa: ocurre cuando una persona insulta, humilla o ataca la dignidad de Valeria con palabras ofensivas. No le inventa un delito, solo busca hacerla sentir menos o dañar su honra.',
            'Sanción guía: multa, retractación y corrección pública del daño causado. Si el insulto se difunde por redes, la sanción puede ser más fuerte.',
            'Ejemplo fácil: decirle a Valeria “das pena”, “nadie te quiere” o “eres lo peor” para humillarla públicamente.',
            'Art. 220 del Código Penal Colombiano — Injuria: imputaciones deshonrosas contra otra persona.'
        ),
        new ContenidoSancion(
            'Acoso reiterado',
            'Qué significa: ocurre cuando una persona molesta, persigue o incomoda a Valeria varias veces. La clave no es solo lo que dice, sino que lo repite muchas veces hasta afectar su tranquilidad.',
            'Sanción guía: orden de cese, bloqueo, medida de protección y sanción disciplinaria o judicial si se demuestra afectación psicológica.',
            'Ejemplo fácil: comentar cosas ofensivas cada vez que Valeria publica algo, durante varios días, para hacerla sentir perseguida.',
            'Ley 1620 de 2013 — Convivencia Escolar: reconoce el ciberacoso como daño psicológico por medios electrónicos.'
        ),
        new ContenidoSancion(
            'Perturbación a la tranquilidad',
            'Qué significa: ocurre cuando alguien altera la paz de Valeria con burlas, reacciones o molestias repetidas. Puede parecer menos grave que una amenaza, pero igual interrumpe su tranquilidad.',
            'Sanción guía: llamado de atención, orden de cese, multa menor o medida para impedir que la molestia continúe.',
            'Ejemplo fácil: reaccionar con burlas a muchas publicaciones de Valeria sin escribir una amenaza directa.',
            'Protección general a la tranquilidad, honra y vida cotidiana de la víctima frente a interferencias injustificadas.'
        )
    ],

    2: [
        new ContenidoSancion(
            'Injuria agravada por medios digitales',
            'Qué significa: es un insulto o ataque contra la honra de Valeria, pero se vuelve más grave porque se publica en redes, grupos o plataformas donde muchas personas pueden verlo.',
            'Sanción guía: multa, retractación pública y aumento de la sanción por la difusión masiva del daño.',
            'Ejemplo fácil: publicar algo ofensivo sobre Valeria y pedir que todos lo compartan para humillarla.',
            'Art. 220 del Código Penal Colombiano, con agravación por difusión mediante medios digitales o masivos.'
        ),
        new ContenidoSancion(
            'Hostigamiento digital',
            'Qué significa: ocurre cuando varias acciones digitales buscan cansar, presionar, humillar o aislar a Valeria. La clave es que el ataque ocurre en internet y puede involucrar a varias personas.',
            'Sanción guía: orden de cese, restricciones digitales, sanción disciplinaria y posibles consecuencias penales si hay daño grave.',
            'Ejemplo fácil: pedirle a un grupo que comente contra Valeria hasta que borre su cuenta o deje de participar en redes.',
            'Ley 1620 de 2013 y normas de convivencia escolar sobre ciberacoso y protección de la víctima.'
        ),
        new ContenidoSancion(
            'Perturbación a la tranquilidad agravada',
            'Qué significa: ocurre cuando una molestia o burla repetida se vuelve más grave porque otras personas ayudan a expandirla. No siempre hay amenaza, pero sí hay daño aumentado por la difusión.',
            'Sanción guía: multa mayor, orden de cese y responsabilidad individual para quienes participaron en la perturbación coordinada.',
            'Ejemplo fácil: compartir una burla en varios grupos para que más personas se rían de Valeria.',
            'La agravación aparece cuando la perturbación se ejecuta de forma coordinada o con mayor alcance.'
        )
    ],

    3: [
        new ContenidoSancion(
            'Calumnia',
            'Qué significa: ocurre cuando alguien acusa falsamente a Valeria de haber cometido un delito o una falta grave concreta. La clave es que la acusación es específica y dañina.',
            'Sanción guía: retractación pública, multa y posible prisión si se demuestra la imputación falsa.',
            'Ejemplo fácil: decir que Valeria robó exámenes cuando no hay prueba y la acusación es falsa.',
            'Art. 221 del Código Penal Colombiano — Calumnia: imputar falsamente una conducta típica a otra persona.'
        ),
        new ContenidoSancion(
            'Difamación digital',
            'Qué significa: ocurre cuando se comparte información falsa, editada, manipulada o sacada de contexto para dañar la imagen de Valeria en medios digitales.',
            'Sanción guía: eliminar el contenido, retractarse públicamente y responder por el daño causado a la imagen de la víctima.',
            'Ejemplo fácil: compartir una captura editada para hacer creer que Valeria dijo o hizo algo que nunca ocurrió.',
            'Protección del buen nombre y responsabilidad por difusión de información falsa en entornos digitales.'
        ),
        new ContenidoSancion(
            'Daño a la reputación por información falsa',
            'Qué significa: ocurre cuando se difunden rumores o comentarios falsos que dañan el buen nombre de Valeria, aunque no necesariamente la acusen de un delito concreto.',
            'Sanción guía: retractación, eliminación del contenido, reparación del daño e indemnización según la gravedad.',
            'Ejemplo fácil: decir en grupos que Valeria engaña a todos o que es mala persona, sin pruebas.',
            'Art. 15 de la Constitución Política de Colombia — derecho a la intimidad y al buen nombre.'
        )
    ],

    4: [
        new ContenidoSancion(
            'Suplantación de identidad digital',
            'Qué significa: ocurre cuando alguien usa el nombre, foto o identidad de Valeria para hacerse pasar por ella en internet. La clave es que crea una apariencia falsa de que es Valeria.',
            'Sanción guía: eliminación del perfil falso, reparación del daño y sanción penal o disciplinaria según la gravedad.',
            'Ejemplo fácil: crear una cuenta falsa con fotos reales de Valeria y publicar mensajes como si ella los hubiera escrito.',
            'Ley 1273 de 2009 — protección de datos e identidad en entornos informáticos.'
        ),
        new ContenidoSancion(
            'Delito informático por acceso no autorizado',
            'Qué significa: ocurre cuando alguien entra sin permiso a una cuenta, correo, celular, computador o plataforma de Valeria. La clave es que se usa una cuenta real sin autorización.',
            'Sanción guía: prisión y multa si se demuestra el acceso abusivo a un sistema informático.',
            'Ejemplo fácil: entrar a la cuenta real de Valeria y publicar mensajes desde su propio perfil.',
            'Ley 1273 de 2009 — Art. 269A: acceso abusivo a un sistema informático.'
        ),
        new ContenidoSancion(
            'Uso indebido de datos personales',
            'Qué significa: ocurre cuando alguien guarda, publica, envía o comparte datos privados de Valeria sin permiso, como fotos, número, ubicación, usuario o información personal.',
            'Sanción guía: multa, eliminación de los datos, sanción administrativa y posible proceso penal si el daño es grave.',
            'Ejemplo fácil: reenviar fotos privadas, número de teléfono o ubicación de Valeria en grupos sin autorización.',
            'Ley 1581 de 2012 — protección de datos personales y habeas data.'
        )
    ],

    5: [
        new ContenidoSancion(
            'Acoso y hostigamiento digital coordinado',
            'Qué significa: ocurre cuando una persona dirige o coordina a varias cuentas para atacar a Valeria al mismo tiempo. La clave es que hay liderazgo del ataque digital.',
            'Sanción guía: sanción más fuerte para quien organiza y responsabilidad para quienes participan activamente.',
            'Ejemplo fácil: dar una hora exacta para que todos comenten, etiqueten y presionen a Valeria en redes.',
            'Ley 1620 de 2013 y reglas sobre responsabilidad por acciones coordinadas de ciberacoso.'
        ),
        new ContenidoSancion(
            'Amenazas graves por medios digitales',
            'Qué significa: ocurre cuando alguien envía un mensaje para asustar a Valeria anunciando que le puede pasar algo malo a ella o a alguien cercano.',
            'Sanción guía: prisión, medidas de protección y agravación si la amenaza es repetida o se realiza desde cuentas anónimas.',
            'Ejemplo fácil: escribir “si hablas, te va a ir muy mal” o “después no digas que no te avisamos”.',
            'Art. 347 del Código Penal Colombiano — amenazas.'
        ),
        new ContenidoSancion(
            'Asociación para cometer ciberacoso',
            'Qué significa: ocurre cuando varias personas se organizan en un grupo con tareas, horarios o roles para acosar a Valeria. La clave es la planificación entre varios.',
            'Sanción guía: sanción para organizadores e integrantes activos, según su participación dentro del grupo.',
            'Ejemplo fácil: crear un chat donde se decide quién comenta, quién comparte, a qué hora atacan y qué mensaje debe usar cada persona.',
            'Art. 340 del Código Penal Colombiano — concierto para delinquir, usado aquí como referencia narrativa para organización del ataque.'
        )
    ]
};