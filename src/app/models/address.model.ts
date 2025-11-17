export interface ExcelRow {
  nome: string;
  endereco: string;
  turno: string;
  nivelAtendimento?: string;
}

export interface AddressWithCoordinates extends ExcelRow {
  latitude?: number;
  longitude?: number;
  status?: 'pending' | 'success' | 'error';
  errorMessage?: string;
}

export interface GeocodeResponse {
  results: Array<{
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }>;
  status: string;
}
