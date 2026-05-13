export class ContenidoSancion {
  constructor(nombre = '', descripcion = '', consecuencia = '', ejemplo = '', queSignifica = '') {
    this._nombre       = nombre;
    this._descripcion  = descripcion;
    this._consecuencia = consecuencia;
    this._ejemplo      = ejemplo;
    this._queSignifica = queSignifica;
  }

  get nombre()        { return this._nombre; }
  get descripcion()   { return this._descripcion; }
  get consecuencia()  { return this._consecuencia; }
  get ejemplo()       { return this._ejemplo; }
  get queSignifica()  { return this._queSignifica; }
}