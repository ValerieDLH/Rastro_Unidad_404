export class ArbolABB {
    constructor() {
        this.raiz = null;
    }

    insertar(nodo) {
        if (!this.raiz) {
            this.raiz = nodo;
            return;
        }
        this._insertar(this.raiz, nodo);
    }

    _insertar(actual, nodo) {
        if (nodo.ordenAbb < actual.ordenAbb) {
            if (actual.izqReal === null) {
                actual._izqReal = nodo;
                nodo._padreReal = actual;
            } else {
                this._insertar(actual.izqReal, nodo);
            }
        } else {
            if (actual.derReal === null) {
                actual._derReal = nodo;
                nodo._padreReal = actual;
            } else {
                this._insertar(actual.derReal, nodo);
            }
        }
    }

    buscar(ordenAbb, nodo = this.raiz) {
        if (!nodo) return null;
        if (ordenAbb === nodo.ordenAbb) return nodo;
        if (ordenAbb < nodo.ordenAbb) return this.buscar(ordenAbb, nodo.izqReal);
        return this.buscar(ordenAbb, nodo.derReal);
    }

    recorrer(nodo = this.raiz, resultado = []) {
        if (!nodo) return resultado;
        this.recorrer(nodo.izqReal, resultado);
        resultado.push(nodo);
        this.recorrer(nodo.derReal, resultado);
        return resultado;
    }

    calcularPrecision() {
        const nodos = this.recorrer();
        if (nodos.length === 0) return 0;

        let correctos = 0;
        for (const nodo of nodos) {
            const padreOk = nodo.padreJugador?.ordenAbb === nodo.padreReal?.ordenAbb;
            const izqOk = nodo.izqJugador?.ordenAbb === nodo.izqReal?.ordenAbb;
            const derOk = nodo.derJugador?.ordenAbb === nodo.derReal?.ordenAbb;
            if (padreOk && izqOk && derOk) correctos++;
        }

        return Math.round((correctos / nodos.length) * 100);
    }
    
    calcularPrecisionABB(vectorNodos) {
        if (!vectorNodos || vectorNodos.length === 0) return 0;

        const nodos = vectorNodos.filter(n => n.apareceEnAbb);
        if (nodos.length === 0) return 0;

        let puntosCorrectos = 0;
        const puntosPosibles = nodos.length * 3;

        for (const nodo of nodos) {
            if (nodo.padreJugador?.ordenAbb === nodo.padreReal?.ordenAbb) puntosCorrectos++;
            if (nodo.izqJugador?.ordenAbb === nodo.izqReal?.ordenAbb) puntosCorrectos++;
            if (nodo.derJugador?.ordenAbb === nodo.derReal?.ordenAbb) puntosCorrectos++;
        }

        const precisionArbolAbbJugador = Math.round((puntosCorrectos / puntosPosibles) * 100);
        return precisionArbolAbbJugador;
    }
}