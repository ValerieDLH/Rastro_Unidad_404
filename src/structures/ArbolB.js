import { NodoB } from './NodoB.js';

export class ArbolB {
  constructor(orden) {
    this.orden = orden;           // max hijos por nodo
    this.maxClaves = orden - 1;   // max claves por nodo
    this.minClaves = Math.floor((orden - 1) / 2);
    this.raiz = new NodoB(orden);
  }

  //BUSCAR
  buscar(rango, nodo = this.raiz) {
    let i = 0;
    while (i < nodo.claves.length && rango > nodo.claves[i].rango) i++;

    if (i < nodo.claves.length && rango === nodo.claves[i].rango)
      return nodo.claves[i];

    if (nodo.esHoja) return null;

    return this.buscar(rango, nodo.hijos[i]);
  }

  //INSERTAR
  insertar(nodoDato) {
    const raiz = this.raiz;

    if (raiz.claves.length === this.maxClaves) {
      const nuevaRaiz = new NodoB(this.orden);
      nuevaRaiz.esHoja = false;
      nuevaRaiz.hijos.push(this.raiz);
      this._splitHijo(nuevaRaiz, 0);
      this.raiz = nuevaRaiz;
    }

    this._insertarNoLleno(this.raiz, nodoDato);
  }

  _insertarNoLleno(nodo, nodoDato) {
    let i = nodo.claves.length - 1;

    if (nodo.esHoja) {
      nodo.claves.push(null);
      while (i >= 0 && nodoDato.rango < nodo.claves[i].rango) {
        nodo.claves[i + 1] = nodo.claves[i];
        i--;
      }
      nodo.claves[i + 1] = nodoDato;
    } else {
      while (i >= 0 && nodoDato.rango < nodo.claves[i].rango) i--;
      i++;

      if (nodo.hijos[i].claves.length === this.maxClaves) {
        this._splitHijo(nodo, i);
        if (nodoDato.rango > nodo.claves[i].rango) i++;
      }

      this._insertarNoLleno(nodo.hijos[i], nodoDato);
    }
  }

  _splitHijo(padre, i) {
    const orden = this.orden;
    const medio = Math.floor(this.maxClaves / 2);
    const hijo = padre.hijos[i];
    const nuevoHijo = new NodoB(orden);

    nuevoHijo.esHoja = hijo.esHoja;
    nuevoHijo.claves = hijo.claves.splice(medio + 1);
    const claveMedio = hijo.claves.splice(medio, 1)[0];

    if (!hijo.esHoja) {
      nuevoHijo.hijos = hijo.hijos.splice(medio + 1);
    }

    padre.hijos.splice(i + 1, 0, nuevoHijo);
    padre.claves.splice(i, 0, claveMedio);
    padre.esHoja = false;
  }

  //ELIMINAR
  eliminar(rango) {
    this._eliminar(this.raiz, rango);

    if (this.raiz.claves.length === 0 && !this.raiz.esHoja) {
      this.raiz = this.raiz.hijos[0];
    }
  }

  _eliminar(nodo, rango) {
    let i = 0;
    while (i < nodo.claves.length && rango > nodo.claves[i].rango) i++;

    if (i < nodo.claves.length && nodo.claves[i].rango === rango) {
      if (nodo.esHoja) {
        nodo.claves.splice(i, 1);
      } else {
        this._eliminarInterno(nodo, i);
      }
    } else {
      if (nodo.esHoja) return; // no existe

      const esFinalHijos = (i === nodo.claves.length);

      if (nodo.hijos[i].claves.length < this.minClaves + 1) {
        this._rellenar(nodo, i);
        // re-calcular i tras rellenar
        if (esFinalHijos && i > nodo.claves.length) i--;
      }

      this._eliminar(nodo.hijos[i], rango);
    }
  }

  _eliminarInterno(nodo, i) {
    const rango = nodo.claves[i].rango;

    if (nodo.hijos[i].claves.length >= this.minClaves + 1) {
      const predecesor = this._getPredecesor(nodo.hijos[i]);
      nodo.claves[i] = predecesor;
      this._eliminar(nodo.hijos[i], predecesor.rango);
    } else if (nodo.hijos[i + 1].claves.length >= this.minClaves + 1) {
      const sucesor = this._getSucesor(nodo.hijos[i + 1]);
      nodo.claves[i] = sucesor;
      this._eliminar(nodo.hijos[i + 1], sucesor.rango);
    } else {
      this._merge(nodo, i);
      this._eliminar(nodo.hijos[i], rango);
    }
  }

  _getPredecesor(nodo) {
    while (!nodo.esHoja) nodo = nodo.hijos[nodo.hijos.length - 1];
    return nodo.claves[nodo.claves.length - 1];
  }

  _getSucesor(nodo) {
    while (!nodo.esHoja) nodo = nodo.hijos[0];
    return nodo.claves[0];
  }

  _rellenar(padre, i) {
    if (i > 0 && padre.hijos[i - 1].claves.length >= this.minClaves + 1) {
      this._prestarDeIzquierda(padre, i);
    } else if (i < padre.claves.length && padre.hijos[i + 1].claves.length >= this.minClaves + 1) {
      this._prestarDeDerecha(padre, i);
    } else {
      if (i < padre.claves.length) {
        this._merge(padre, i);
      } else {
        this._merge(padre, i - 1);
      }
    }
  }

  _prestarDeIzquierda(padre, i) {
    const hijo = padre.hijos[i];
    const hermano = padre.hijos[i - 1];

    hijo.claves.unshift(padre.claves[i - 1]);
    padre.claves[i - 1] = hermano.claves.pop();

    if (!hermano.esHoja) hijo.hijos.unshift(hermano.hijos.pop());
  }

  _prestarDeDerecha(padre, i) {
    const hijo = padre.hijos[i];
    const hermano = padre.hijos[i + 1];

    hijo.claves.push(padre.claves[i]);
    padre.claves[i] = hermano.claves.shift();

    if (!hermano.esHoja) hijo.hijos.push(hermano.hijos.shift());
  }

  _merge(padre, i) {
    const hijo = padre.hijos[i];
    const hermano = padre.hijos[i + 1];

    hijo.claves.push(padre.claves[i]);
    hijo.claves.push(...hermano.claves);

    if (!hijo.esHoja) hijo.hijos.push(...hermano.hijos);

    padre.claves.splice(i, 1);
    padre.hijos.splice(i + 1, 1);
  }
}