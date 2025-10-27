export interface Mapa {
  id?: string;
  nomeMapa: string;
  urlMapa: string;
  dataCriacao?: Date;
  dataAtualizacao?: Date;
  ordem?: number;
}

export interface MapaFormData {
  nomeMapa: string;
  urlMapa: string;
}
