import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, map, retryWhen, mergeMap, finalize } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { GeocodeResponse } from '../models/address.model';

@Injectable({
  providedIn: 'root'
})
export class GoogleGeocodeService {
  private readonly apiUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
  private readonly maxRetries = 3;
  private readonly initialDelayMs = 1000;
  private geocodeCache = new Map<string, { lat: number; lng: number }>();
  private requestQueue: Promise<any> = Promise.resolve();
  private lastRequestTime = 0;
  private readonly minRequestIntervalMs = 200; // Delay mínimo entre requisições

  constructor(private http: HttpClient) {}

  geocodeAddress(address: string): Observable<{ lat: number; lng: number }> {
    // Verificar cache
    const cached = this.geocodeCache.get(address);
    if (cached) {
      console.log('📦 Cache hit:', address);
      return new Observable(observer => {
        observer.next(cached);
        observer.complete();
      });
    }

    const url = `${this.apiUrl}?address=${encodeURIComponent(address)}&key=${environment.googleMapsApiKey}`;

    return this.http.get<GeocodeResponse>(url).pipe(
      map(response => {
        if (response.status === 'OK' && response.results.length > 0) {
          const location = response.results[0].geometry.location;
          const result = { lat: location.lat, lng: location.lng };
          
          // Armazenar no cache
          this.geocodeCache.set(address, result);
          
          console.log('✅ Geocodificado:', address);
          return result;
        } else if (response.status === 'ZERO_RESULTS') {
          throw new Error(`ZERO_RESULTS: Endereço não encontrado`);
        } else if (response.status === 'OVER_QUERY_LIMIT') {
          throw new Error(`OVER_QUERY_LIMIT: Limite de requisições excedido`);
        } else if (response.status === 'REQUEST_DENIED') {
          throw new Error(`REQUEST_DENIED: Verifique a API Key e se a Geocoding API está habilitada`);
        } else if (response.status === 'INVALID_REQUEST') {
          throw new Error(`INVALID_REQUEST: Endereço inválido`);
        } else {
          throw new Error(`Geocoding falhou: ${response.status}`);
        }
      }),
      retryWhen(errors => 
        errors.pipe(
          mergeMap((error, index) => {
            const retryAttempt = index + 1;
            
            // Não fazer retry para erros que não são temporários
            if (error.message?.includes('REQUEST_DENIED') || 
                error.message?.includes('INVALID_REQUEST') ||
                error.message?.includes('ZERO_RESULTS')) {
              console.error('❌ Erro permanente ao geocodificar:', address, error.message);
              return throwError(() => error);
            }
            
            // Fazer retry apenas para OVER_QUERY_LIMIT e erros de rede
            if (retryAttempt > this.maxRetries) {
              console.error(`❌ Máximo de ${this.maxRetries} tentativas atingido para:`, address);
              return throwError(() => error);
            }
            
            const delayMs = this.initialDelayMs * Math.pow(2, retryAttempt - 1);
            console.warn(`⏳ Tentativa ${retryAttempt}/${this.maxRetries} para: ${address} (aguardando ${delayMs}ms)`);
            
            return timer(delayMs);
          })
        )
      ),
      catchError(error => {
        console.error('❌ Erro ao geocodificar:', address, error.message || error);
        return throwError(() => new Error(`Não foi possível geocodificar: ${error.message || 'Erro desconhecido'}`));
      })
    );
  }

  async geocodeAddressAsync(address: string): Promise<{ lat: number; lng: number }> {
    // Adicionar à fila para evitar requisições simultâneas
    return new Promise((resolve, reject) => {
      this.requestQueue = this.requestQueue.then(async () => {
        // Garantir delay mínimo entre requisições
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.minRequestIntervalMs) {
          const waitTime = this.minRequestIntervalMs - timeSinceLastRequest;
          await new Promise(r => setTimeout(r, waitTime));
        }
        
        this.lastRequestTime = Date.now();
        
        try {
          const result = await this.geocodeAddress(address).toPromise() as { lat: number; lng: number };
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  clearCache(): void {
    this.geocodeCache.clear();
    console.log('🗑️ Cache de geocodificação limpo');
  }

  getCacheSize(): number {
    return this.geocodeCache.size;
  }
}
