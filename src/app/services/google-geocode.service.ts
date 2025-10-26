import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { GeocodeResponse } from '../models/address.model';

@Injectable({
  providedIn: 'root'
})
export class GoogleGeocodeService {
  private readonly apiUrl = 'https://maps.googleapis.com/maps/api/geocode/json';

  constructor(private http: HttpClient) {}

  geocodeAddress(address: string): Observable<{ lat: number; lng: number }> {
    const url = `${this.apiUrl}?address=${encodeURIComponent(address)}&key=${environment.googleMapsApiKey}`;

    return this.http.get<GeocodeResponse>(url).pipe(
      map(response => {
        if (response.status === 'OK' && response.results.length > 0) {
          const location = response.results[0].geometry.location;
          return { lat: location.lat, lng: location.lng };
        } else {
          throw new Error(`Geocoding falhou: ${response.status}`);
        }
      }),
      catchError(error => {
        console.error('Erro ao geocodificar endereço:', address, error);
        return throwError(() => new Error(`Não foi possível geocodificar o endereço: ${address}`));
      })
    );
  }

  async geocodeAddressAsync(address: string): Promise<{ lat: number; lng: number }> {
    try {
      return await this.geocodeAddress(address).toPromise() as { lat: number; lng: number };
    } catch (error) {
      throw error;
    }
  }
}
