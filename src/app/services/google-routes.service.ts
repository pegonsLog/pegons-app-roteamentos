import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { RouteRequest, RoutesResponse, Route } from '../models/route.model';

@Injectable({
  providedIn: 'root'
})
export class GoogleRoutesService {
  private readonly apiUrl = 'https://routes.googleapis.com/directions/v2:computeRoutes';

  constructor(private http: HttpClient) {}

  /**
   * Calcula rotas usando a Google Routes API
   * @param request Configuração da rota
   * @returns Observable com a resposta contendo as rotas
   */
  computeRoutes(request: RouteRequest): Observable<RoutesResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': environment.googleMapsApiKey,
      'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs,routes.viewport,routes.travelAdvisory,routes.description,routes.warnings'
    });

    const body = this.buildRequestBody(request);

    return this.http.post<RoutesResponse>(this.apiUrl, body, { headers }).pipe(
      map(response => {
        return response;
      }),
      catchError(error => {
        console.error('❌ Erro ao calcular rota:', error);
        let errorMessage = 'Erro ao calcular rota';
        
        if (error.status === 403) {
          errorMessage = 'API Key inválida ou Routes API não habilitada';
        } else if (error.status === 400) {
          errorMessage = 'Requisição inválida. Verifique os endereços';
        } else if (error.error?.error?.message) {
          errorMessage = error.error.error.message;
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Calcula rota simples entre origem e destino
   * @param origin Endereço de origem
   * @param destination Endereço de destino
   * @returns Observable com a primeira rota calculada
   */
  calculateSimpleRoute(origin: string, destination: string): Observable<Route> {
    const request: RouteRequest = {
      origin: { address: origin },
      destination: { address: destination },
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_AWARE',
      computeAlternativeRoutes: false
    };

    return this.computeRoutes(request).pipe(
      map(response => {
        if (!response.routes || response.routes.length === 0) {
          throw new Error('Nenhuma rota encontrada');
        }
        return response.routes[0];
      })
    );
  }

  /**
   * Calcula rota com pontos intermediários (waypoints)
   * @param origin Endereço de origem
   * @param destination Endereço de destino
   * @param waypoints Array de endereços intermediários
   * @returns Observable com a rota calculada
   */
  calculateRouteWithWaypoints(
    origin: string,
    destination: string,
    waypoints: string[]
  ): Observable<Route> {
    const request: RouteRequest = {
      origin: { address: origin },
      destination: { address: destination },
      intermediates: waypoints.map(address => ({ address })),
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_AWARE'
    };

    return this.computeRoutes(request).pipe(
      map(response => {
        if (!response.routes || response.routes.length === 0) {
          throw new Error('Nenhuma rota encontrada');
        }
        return response.routes[0];
      })
    );
  }

  /**
   * Calcula rotas alternativas
   * @param origin Endereço de origem
   * @param destination Endereço de destino
   * @returns Observable com array de rotas alternativas
   */
  calculateAlternativeRoutes(origin: string, destination: string): Observable<Route[]> {
    const request: RouteRequest = {
      origin: { address: origin },
      destination: { address: destination },
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_AWARE',
      computeAlternativeRoutes: true
    };

    return this.computeRoutes(request).pipe(
      map(response => {
        if (!response.routes || response.routes.length === 0) {
          throw new Error('Nenhuma rota encontrada');
        }
        return response.routes;
      })
    );
  }

  /**
   * Formata duração em segundos para formato legível
   * @param duration String de duração (ex: "1234s")
   * @returns String formatada (ex: "20 min")
   */
  formatDuration(duration: string): string {
    const seconds = parseInt(duration.replace('s', ''));
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes} min`;
  }

  /**
   * Formata distância em metros para formato legível
   * @param meters Distância em metros
   * @returns String formatada (ex: "12.5 km")
   */
  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${meters} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }

  /**
   * Constrói o corpo da requisição para a API
   * @param request Configuração da rota
   * @returns Objeto formatado para a API
   */
  private buildRequestBody(request: RouteRequest): any {
    const body: any = {
      origin: {
        address: request.origin.address
      },
      destination: {
        address: request.destination.address
      },
      travelMode: request.travelMode || 'DRIVE',
      routingPreference: request.routingPreference || 'TRAFFIC_AWARE',
      computeAlternativeRoutes: request.computeAlternativeRoutes || false
    };

    // Adiciona coordenadas se fornecidas
    if (request.origin.location) {
      body.origin.location = {
        latLng: {
          latitude: request.origin.location.lat,
          longitude: request.origin.location.lng
        }
      };
    }

    if (request.destination.location) {
      body.destination.location = {
        latLng: {
          latitude: request.destination.location.lat,
          longitude: request.destination.location.lng
        }
      };
    }

    // Adiciona pontos intermediários
    if (request.intermediates && request.intermediates.length > 0) {
      body.intermediates = request.intermediates.map(waypoint => ({
        address: waypoint.address,
        ...(waypoint.location && {
          location: {
            latLng: {
              latitude: waypoint.location.lat,
              longitude: waypoint.location.lng
            }
          }
        })
      }));
    }

    // Adiciona modificadores de rota
    if (request.routeModifiers) {
      body.routeModifiers = request.routeModifiers;
    }

    return body;
  }
}
