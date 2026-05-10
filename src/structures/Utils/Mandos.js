export const MAPEO_MANDOS = {
    jugador1: {
        padIndex: 0,

        ejeX: 0,
        ejeY: 1,

        botonArriba: 12,
        botonAbajo: 13,
        botonIzquierda: 14,
        botonDerecha: 15,

        botonAccion: 0,
        botonCancelar: 1,
        botonExtra: 2,
        botonStart: 9
    },

    jugador2: {
        padIndex: 1,

        ejeX: 0,
        ejeY: 1,

        botonArriba: 12,
        botonAbajo: 13,
        botonIzquierda: 14,
        botonDerecha: 15,

        botonAccion: 0,
        botonCancelar: 1,
        botonExtra: 2,
        botonStart: 9
    }
};

export function iniciarMandos(scene) {
    if (!scene.input.gamepad) return;

    scene.input.gamepad.once('connected', (pad) => {
        console.log('Mando conectado:', pad.id);
    });
}

export function obtenerMando(scene, jugador = 1) {
    if (!scene.input.gamepad) return null;

    const mapa = jugador === 2 ? MAPEO_MANDOS.jugador2 : MAPEO_MANDOS.jugador1;
    const index = mapa.padIndex;

    if (scene.input.gamepad.getPad) {
        return scene.input.gamepad.getPad(index);
    }

    if (scene.input.gamepad.gamepads) {
        return scene.input.gamepad.gamepads[index] || null;
    }

    return null;
}

export function leerMando(scene, jugador = 1) {
    const mapa = jugador === 2 ? MAPEO_MANDOS.jugador2 : MAPEO_MANDOS.jugador1;
    const pad = obtenerMando(scene, jugador);

    if (!pad) {
        return {
            conectado: false,
            arriba: false,
            abajo: false,
            izquierda: false,
            derecha: false,
            accion: false,
            cancelar: false,
            extra: false,
            start: false,
            ejeX: 0,
            ejeY: 0
        };
    }

    const ejeX = leerEje(pad, mapa.ejeX);
    const ejeY = leerEje(pad, mapa.ejeY);

    return {
        conectado: true,

        arriba: ejeY < -0.35 || botonPresionado(pad, mapa.botonArriba),
        abajo: ejeY > 0.35 || botonPresionado(pad, mapa.botonAbajo),
        izquierda: ejeX < -0.35 || botonPresionado(pad, mapa.botonIzquierda),
        derecha: ejeX > 0.35 || botonPresionado(pad, mapa.botonDerecha),

        accion: botonPresionado(pad, mapa.botonAccion),
        cancelar: botonPresionado(pad, mapa.botonCancelar),
        extra: botonPresionado(pad, mapa.botonExtra),
        start: botonPresionado(pad, mapa.botonStart),

        ejeX,
        ejeY
    };
}

function leerEje(pad, index) {
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

function botonPresionado(pad, index) {
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

export function crearDebugMandos(scene) {
    const txt = scene.add.text(20, 20, '', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: {
            x: 8,
            y: 8
        }
    });

    txt.setDepth(9999);

    scene.events.on('update', () => {
        if (!scene.input.gamepad) {
            txt.setText('Gamepad no activo');
            return;
        }

        const pads = [];

        for (let i = 0; i < 4; i++) {
            const pad = scene.input.gamepad.getPad
                ? scene.input.gamepad.getPad(i)
                : scene.input.gamepad.gamepads?.[i];

            if (!pad) continue;

            const botones = [];

            if (pad.buttons) {
                pad.buttons.forEach((btn, index) => {
                    const presionado = btn?.pressed || btn?.value > 0.5;

                    if (presionado) {
                        botones.push(index);
                    }
                });
            }

            const ejes = [];

            if (pad.axes) {
                pad.axes.forEach((axis, index) => {
                    let valor = 0;

                    if (typeof axis.getValue === 'function') {
                        valor = axis.getValue();
                    } else if (typeof axis.value === 'number') {
                        valor = axis.value;
                    }

                    if (Math.abs(valor) > 0.2) {
                        ejes.push(`${index}: ${valor.toFixed(2)}`);
                    }
                });
            }

            pads.push(
                `Mando ${i}\n` +
                `Botones: ${botones.join(', ') || 'ninguno'}\n` +
                `Ejes: ${ejes.join(', ') || 'quieto'}`
            );
        }

        txt.setText(pads.join('\n\n') || 'Presiona un botón del mando para detectarlo');
    });

    return txt;
}