export interface Mapa {
  id?: string;
  nomeMapa: string;
  urlMapa: string;
  empresaCliente: string;
  empresaCotante: string;
  dataCriacao?: Date;
  dataAtualizacao?: Date;
}

export interface MapaFormData {
  nomeMapa: string;
  urlMapa: string;
  empresaCliente: string;
  empresaCotante: string;
}
