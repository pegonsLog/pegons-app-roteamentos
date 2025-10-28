import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { GoogleRoutesService } from '../../services/google-routes.service';
import { GoogleGeocodeService } from '../../services/google-geocode.service';
import { GoogleDriveService } from '../../services/google-drive.service';
import { Route } from '../../models/route.model';

@Component({
  selector: 'app-rotas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rotas.html',
  styleUrl: './rotas.css'
})
export class RotasComponent {
  // Formulário
  origin = signal('');
  destination = signal('');
  waypoints = signal<string[]>([]);
  newWaypoint = signal('');
  
  // Opções
  travelMode = signal<'DRIVE' | 'BICYCLE' | 'WALK' | 'TWO_WHEELER'>('DRIVE');
  avoidTolls = signal(false);
  avoidHighways = signal(false);
  avoidFerries = signal(false);
  showAlternatives = signal(false);
  
  // Resultados
  routes = signal<Route[]>([]);
  selectedRoute = signal<Route | null>(null);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  
  // Validação individual
  originValidation = signal<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  destinationValidation = signal<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  originValidationMessage = signal('');
  destinationValidationMessage = signal('');

  constructor(
    private routesService: GoogleRoutesService,
    private geocodeService: GoogleGeocodeService,
    private driveService: GoogleDriveService
  ) {}

  addWaypoint(): void {
    const waypoint = this.newWaypoint().trim();
    if (!waypoint) return;

    // Verifica limite máximo de waypoints
    if (this.waypoints().length >= 25) {
      this.errorMessage.set('❌ Limite máximo de 25 pontos intermediários atingido!');
      return;
    }

    // Valida o waypoint antes de adicionar
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.geocodeService.geocodeAddress(waypoint).subscribe({
      next: () => {
        this.waypoints.update(w => [...w, waypoint]);
        this.newWaypoint.set('');
        this.isLoading.set(false);
        
        const count = this.waypoints().length;
        let message = `✅ Ponto intermediário validado e adicionado! (${count}/25)`;
        
        if (count === 10) {
          message += '\n⚠️ A partir de 11 pontos, o custo dobra (SKU Pro)';
        } else if (count === 25) {
          message += '\n⚠️ Limite máximo atingido!';
        }
        
        this.successMessage.set(message);
        setTimeout(() => this.successMessage.set(''), 3000);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(`❌ Endereço inválido: ${error.message || 'Não foi possível encontrar este endereço'}`);
      }
    });
  }

  removeWaypoint(index: number): void {
    this.waypoints.update(w => w.filter((_, i) => i !== index));
  }

  calculateRoute(): void {
    const origin = this.origin().trim();
    const destination = this.destination().trim();

    if (!origin || !destination) {
      this.errorMessage.set('Origem e destino são obrigatórios');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.routes.set([]);
    this.selectedRoute.set(null);

    // Primeiro valida todos os endereços
    this.validateAddresses(origin, destination, this.waypoints()).subscribe({
      next: (isValid) => {
        if (isValid) {
          this.proceedWithRouteCalculation(origin, destination);
        }
      },
      error: (error) => {
        this.errorMessage.set(error.message);
        this.isLoading.set(false);
      }
    });
  }

  private validateAddresses(origin: string, destination: string, waypoints: string[]): Observable<boolean> {
    const validations: Observable<any>[] = [];

    // Valida origem
    validations.push(
      this.geocodeService.geocodeAddress(origin).pipe(
        map(() => ({ address: origin, type: 'Origem', valid: true })),
        catchError((error) => of({ address: origin, type: 'Origem', valid: false, error: error.message }))
      )
    );

    // Valida destino
    validations.push(
      this.geocodeService.geocodeAddress(destination).pipe(
        map(() => ({ address: destination, type: 'Destino', valid: true })),
        catchError((error) => of({ address: destination, type: 'Destino', valid: false, error: error.message }))
      )
    );

    // Valida waypoints
    waypoints.forEach((waypoint, index) => {
      validations.push(
        this.geocodeService.geocodeAddress(waypoint).pipe(
          map(() => ({ address: waypoint, type: `Ponto ${index + 1}`, valid: true })),
          catchError((error) => of({ address: waypoint, type: `Ponto ${index + 1}`, valid: false, error: error.message }))
        )
      );
    });

    return forkJoin(validations).pipe(
      map((results) => {
        const invalid = results.filter(r => !r.valid);
        
        if (invalid.length > 0) {
          const errors = invalid.map(r => `${r.type}: ${r.error || 'Endereço não encontrado'}`).join('\n');
          throw new Error(`Endereços inválidos encontrados:\n${errors}`);
        }
        
        this.successMessage.set('✅ Todos os endereços validados com sucesso!');
        return true;
      })
    );
  }

  private proceedWithRouteCalculation(origin: string, destination: string): void {

    const waypoints = this.waypoints();
    
    let routeObservable: Observable<Route[]>;
    
    if (this.showAlternatives()) {
      // Calcula rotas alternativas
      routeObservable = this.routesService.calculateAlternativeRoutes(origin, destination);
    } else if (waypoints.length > 0) {
      // Calcula rota com waypoints
      routeObservable = this.routesService.calculateRouteWithWaypoints(
        origin,
        destination,
        waypoints
      ).pipe(map(route => [route])); // Converte para array
    } else {
      // Calcula rota simples
      routeObservable = this.routesService.calculateSimpleRoute(origin, destination)
        .pipe(map(route => [route])); // Converte para array
    }

    routeObservable.subscribe({
      next: (routes: Route[]) => {
        this.routes.set(routes);
        this.selectedRoute.set(routes[0]);
        this.isLoading.set(false);
        this.successMessage.set(`${routes.length} rota(s) calculada(s) com sucesso!`);
      },
      error: (error) => {
        this.errorMessage.set(error.message || 'Erro ao calcular rota');
        this.isLoading.set(false);
      }
    });
  }

  selectRoute(route: Route): void {
    this.selectedRoute.set(route);
  }

  clearForm(): void {
    this.origin.set('');
    this.destination.set('');
    this.waypoints.set([]);
    this.newWaypoint.set('');
    this.routes.set([]);
    this.selectedRoute.set(null);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.originValidation.set('idle');
    this.destinationValidation.set('idle');
    this.originValidationMessage.set('');
    this.destinationValidationMessage.set('');
  }

  validateOrigin(): void {
    const address = this.origin().trim();
    if (!address) {
      this.originValidation.set('idle');
      this.originValidationMessage.set('');
      return;
    }

    this.originValidation.set('validating');
    this.geocodeService.geocodeAddress(address).subscribe({
      next: () => {
        this.originValidation.set('valid');
        this.originValidationMessage.set('✓ Endereço válido');
      },
      error: (error) => {
        this.originValidation.set('invalid');
        this.originValidationMessage.set('✗ ' + (error.message || 'Endereço não encontrado'));
      }
    });
  }

  validateDestination(): void {
    const address = this.destination().trim();
    if (!address) {
      this.destinationValidation.set('idle');
      this.destinationValidationMessage.set('');
      return;
    }

    this.destinationValidation.set('validating');
    this.geocodeService.geocodeAddress(address).subscribe({
      next: () => {
        this.destinationValidation.set('valid');
        this.destinationValidationMessage.set('✓ Endereço válido');
      },
      error: (error) => {
        this.destinationValidation.set('invalid');
        this.destinationValidationMessage.set('✗ ' + (error.message || 'Endereço não encontrado'));
      }
    });
  }

  formatDuration(duration: string): string {
    return this.routesService.formatDuration(duration);
  }

  formatDistance(meters: number): string {
    return this.routesService.formatDistance(meters);
  }

  openInGoogleMaps(): void {
    const route = this.selectedRoute();
    if (!route) return;

    const origin = encodeURIComponent(this.origin());
    const destination = encodeURIComponent(this.destination());
    const waypoints = this.waypoints();
    
    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    
    if (waypoints.length > 0) {
      const waypointsParam = waypoints.map(w => encodeURIComponent(w)).join('|');
      url += `&waypoints=${waypointsParam}`;
    }
    
    window.open(url, '_blank');
  }

  exportRoute(): void {
    const route = this.selectedRoute();
    if (!route) return;

    const data = {
      origin: this.origin(),
      destination: this.destination(),
      waypoints: this.waypoints(),
      distance: this.formatDistance(route.distanceMeters),
      duration: this.formatDuration(route.duration),
      polyline: route.polyline.encodedPolyline,
      calculatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rota_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    this.successMessage.set('Rota exportada como JSON com sucesso!');
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  async exportRouteAsKML(): Promise<void> {
    const route = this.selectedRoute();
    if (!route) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const kml = this.generateKML(route);
      const fileName = `rota_${this.origin()}_${this.destination()}_${Date.now()}.kml`;
      
      // Busca ou cria a pasta "Rotas Pegons"
      let folder = await this.driveService.findFolderByName('Rotas Pegons');
      if (!folder) {
        folder = await this.driveService.createFolder('Rotas Pegons');
      }

      // Faz upload do arquivo KML
      const file = await this.driveService.uploadFile(
        fileName,
        kml,
        'application/vnd.google-earth.kml+xml',
        folder.id
      );

      // Compartilha com pegons.app@gmail.com
      await this.driveService.shareFileWithEmail(file.id, 'pegons.app@gmail.com', 'writer');

      this.successMessage.set('✅ Rota enviada para o Google Drive com sucesso! Arquivo compartilhado com pegons.app@gmail.com');
      setTimeout(() => this.successMessage.set(''), 5000);
    } catch (error: any) {
      console.error('Erro ao enviar para Google Drive:', error);
      this.errorMessage.set(`❌ Erro ao enviar para Google Drive: ${error.message || 'Erro desconhecido'}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  private generateKML(route: Route): string {
    const origin = this.origin();
    const destination = this.destination();
    const waypoints = this.waypoints();
    const timestamp = new Date().toISOString();
    
    // Decodifica a polyline para obter as coordenadas
    const coordinates = this.decodePolyline(route.polyline.encodedPolyline);
    
    let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Rota - ${origin} até ${destination}</name>
    <description>
      Rota calculada em ${new Date(timestamp).toLocaleString('pt-BR')}
      Distância: ${this.formatDistance(route.distanceMeters)}
      Duração: ${this.formatDuration(route.duration)}
    </description>
    
    <!-- Estilo para a linha da rota -->
    <Style id="routeStyle">
      <LineStyle>
        <color>ff0000ff</color>
        <width>4</width>
      </LineStyle>
    </Style>
    
    <!-- Estilo para marcadores -->
    <Style id="originStyle">
      <IconStyle>
        <color>ff00ff00</color>
        <scale>1.2</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/paddle/grn-circle.png</href>
        </Icon>
      </IconStyle>
    </Style>
    
    <Style id="destinationStyle">
      <IconStyle>
        <color>ff0000ff</color>
        <scale>1.2</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/paddle/red-circle.png</href>
        </Icon>
      </IconStyle>
    </Style>
    
    <Style id="waypointStyle">
      <IconStyle>
        <color>ff00ffff</color>
        <scale>1.0</scale>
        <Icon>
          <href>http://maps.google.com/mapfiles/kml/paddle/ylw-circle.png</href>
        </Icon>
      </IconStyle>
    </Style>
    
    <!-- Marcador de Origem -->
    <Placemark>
      <name>Origem</name>
      <description>${this.escapeXml(origin)}</description>
      <styleUrl>#originStyle</styleUrl>
      <Point>
        <coordinates>${route.legs[0].startLocation.latLng.longitude},${route.legs[0].startLocation.latLng.latitude},0</coordinates>
      </Point>
    </Placemark>
    `;

    // Adiciona waypoints
    waypoints.forEach((waypoint, index) => {
      const leg = route.legs[index];
      if (leg && leg.endLocation) {
        kml += `
    <Placemark>
      <name>Ponto ${index + 1}</name>
      <description>${this.escapeXml(waypoint)}</description>
      <styleUrl>#waypointStyle</styleUrl>
      <Point>
        <coordinates>${leg.endLocation.latLng.longitude},${leg.endLocation.latLng.latitude},0</coordinates>
      </Point>
    </Placemark>
        `;
      }
    });

    // Marcador de Destino
    const lastLeg = route.legs[route.legs.length - 1];
    kml += `
    <Placemark>
      <name>Destino</name>
      <description>${this.escapeXml(destination)}</description>
      <styleUrl>#destinationStyle</styleUrl>
      <Point>
        <coordinates>${lastLeg.endLocation.latLng.longitude},${lastLeg.endLocation.latLng.latitude},0</coordinates>
      </Point>
    </Placemark>
    
    <!-- Linha da Rota -->
    <Placemark>
      <name>Trajeto</name>
      <description>
        Distância: ${this.formatDistance(route.distanceMeters)}
        Duração: ${this.formatDuration(route.duration)}
      </description>
      <styleUrl>#routeStyle</styleUrl>
      <LineString>
        <tessellate>1</tessellate>
        <coordinates>
          ${coordinates.map(coord => `${coord.lng},${coord.lat},0`).join('\n          ')}
        </coordinates>
      </LineString>
    </Placemark>
    
  </Document>
</kml>`;

    return kml;
  }

  private decodePolyline(encoded: string): Array<{lat: number, lng: number}> {
    const coordinates: Array<{lat: number, lng: number}> = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let b;
      let shift = 0;
      let result = 0;
      
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      coordinates.push({
        lat: lat / 1e5,
        lng: lng / 1e5
      });
    }

    return coordinates;
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
