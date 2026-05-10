import { Start } from './Scenes/Start.js';
import { Instrucciones } from './Scenes/Instrucciones.js';
import { ModoJuego } from './Scenes/ModoJuego.js';
import { EscenaHistoria } from './Scenes/EscenaHistoria.js';
import { Ventana1 } from './Scenes/Ventana1.js';

import { AtrapaEvidencia } from './Scenes/AtrapaEvidencia.js';
import { DetenCadena } from './Scenes/DetenCadena.js';
import { CazaRumores } from './Scenes/CazaRumores.js';

import { PuntajeDia } from './Scenes/PuntajeDia.js';
import { GameOver } from './Scenes/GameOver.js';
import { MemoriaPistas } from './Scenes/MemoriaPistas.js';
import { LaberintoDigital } from './Scenes/LaberintoDigital.js';

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#000000',

    input: {
        gamepad: true
    },

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },

    scene: [
        Start,
        Instrucciones,
        ModoJuego,
        EscenaHistoria,
        Ventana1,

        AtrapaEvidencia,
        DetenCadena,
        CazaRumores,
        MemoriaPistas,
        LaberintoDigital,

        PuntajeDia,
        GameOver
    ]
};

const game = new Phaser.Game(config);

export default game;