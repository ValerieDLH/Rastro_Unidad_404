import { ContenidoSancion } from './ContenidoSancion.js';

export class NodoB {
    constructor(
        orden,
        nombre = '',
        delito = false,
        textoCaso = '',
        rango = 0,
        dia = 0,
        sancion = null,
        apareceEnAbb = false,
        ordenAbb = null,
        idDispositivo = null,
        padreReal = null,
        izqReal = null,
        derReal = null
    ) {
        this.orden = orden;
        this.claves = [];
        this.hijos = [];
        this.esHoja = true;
        this._nombre = nombre;
        this._delito = delito;
        this._textoCaso = textoCaso;
        this._rango = rango;
        this._dia = dia;
        this._sancion = sancion instanceof ContenidoSancion ? sancion : null;
        this._apareceEnAbb = apareceEnAbb;
        this._ordenAbb = ordenAbb;
        this._idDispositivo = idDispositivo;
        this._padreReal = padreReal;
        this._izqReal = izqReal;
        this._derReal = derReal;
        this._padreJugador = null;
        this._izqJugador = null;
        this._derJugador = null;
    }

    get idDispositivo() { return this._idDispositivo; }

    get nombre() { return this._nombre; }
    get delito() { return this._delito; }
    get textoCaso() { return this._textoCaso; }
    get rango() { return this._rango; }
    get dia() { return this._dia; }
    get sancion() { return this._sancion !== null ? this._sancion : 'NO TIENE'; }

    get apareceEnAbb() { return this._apareceEnAbb; }
    get ordenAbb() { return this._ordenAbb; }
    get padreReal() { return this._padreReal; }
    get izqReal() { return this._izqReal; }
    get derReal() { return this._derReal; }
    get padreJugador() { return this._padreJugador; }
    get izqJugador() { return this._izqJugador; }
    get derJugador() { return this._derJugador; }

    set padreJugador(v) { this._padreJugador = v; }
    set izqJugador(v) { this._izqJugador = v; }
    set derJugador(v) { this._derJugador = v; }
}