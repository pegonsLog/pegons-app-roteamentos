import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { GoogleGeocodeService } from './services/google-geocode.service';
import { FirestoreDataService } from './services/firestore-data.service';
import { FirebaseStorageService } from './services/firebase-storage.service';
import { AddressWithCoordinates, ExcelRow } from './models/address.model';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Geocodificador de Endereços');
  
  addresses = signal<AddressWithCoordinates[]>([]);
  isLoading = signal(false);
  loadingMessage = signal('');
  errorMessage = signal('');
  successMessage = signal('');
  processedCount = signal(0);
  totalCount = signal(0);
  private currentRoute = signal('/');

  // Modais de confirmação
  showFirestoreModal = signal(false);
  showStorageModal = signal(false);
  showStorageByShiftModal = signal(false);
  pendingSaveData = signal<{count: number, turnos?: string[]}>({count: 0});

  constructor(
    private geocodeService: GoogleGeocodeService,
    private firestoreService: FirestoreDataService,
    private storageService: FirebaseStorageService,
    private router: Router
  ) {
    // Monitora mudanças de rota
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentRoute.set(event.url);
    });
  }

  isRootRoute(): boolean {
    return this.currentRoute() === '/';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    this.readExcelFile(file);
  }

  private readExcelFile(file: File): void {
    this.errorMessage.set('');
    this.successMessage.set('');
    this.isLoading.set(true);
    this.loadingMessage.set('Lendo arquivo Excel...');

    const reader = new FileReader();
    
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const data = e.target?.result;
      if (data) {
        this.processExcelData(data);
      }
    };

    reader.onerror = () => {
      this.errorMessage.set('Erro ao ler o arquivo.');
      this.isLoading.set(false);
    };

    reader.readAsBinaryString(file);
  }

  private async geocodeAllAddresses(): Promise<void> {
    this.loadingMessage.set('Geocodificando endereços...');
    const addresses = this.addresses();
    
    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i];
      
      try {
        // Melhora o formato do endereço adicionando Brasil se não tiver
        const formattedAddress = this.formatAddress(address.endereco);
        const coords = await this.geocodeService.geocodeAddressAsync(formattedAddress);
        
        addresses[i] = {
          ...address,
          latitude: coords.lat,
          longitude: coords.lng,
          status: 'success'
        };
        
      } catch (error) {
        addresses[i] = {
          ...address,
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Erro desconhecido'
        };
      }
      
      this.processedCount.set(i + 1);
      this.addresses.set([...addresses]); // Atualiza o signal
      
      // Pequeno delay para não sobrecarregar a API
      await this.delay(200);
    }
    
    this.isLoading.set(false);
    this.loadingMessage.set('');
    this.successMessage.set(`Processamento concluído! ${this.processedCount()} de ${this.totalCount()} endereços processados.`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private formatAddress(address: string): string {
    // Remove espaços extras
    let formatted = address.trim().replace(/\s+/g, ' ');
    
    // Se não contém "Brasil" ou "Brazil", adiciona ", MG, Brasil"
    const hasBrasil = /brasil|brazil/i.test(formatted);
    const hasEstado = /\b(MG|Minas Gerais)\b/i.test(formatted);
    
    if (!hasBrasil) {
      if (!hasEstado) {
        formatted += ', MG, Brasil';
      } else {
        formatted += ', Brasil';
      }
    }
    
    return formatted;
  }

  /**
   * Abre modal de confirmação para salvar no Storage
   */
  openStorageModal(): void {
    const addresses = this.addresses();
    
    if (addresses.length === 0) {
      this.errorMessage.set('Não há dados para salvar.');
      return;
    }

    const successAddresses = addresses.filter(addr => addr.status === 'success');
    
    if (successAddresses.length === 0) {
      this.errorMessage.set('Não há endereços geocodificados com sucesso para salvar.');
      return;
    }

    this.pendingSaveData.set({count: successAddresses.length});
    this.showStorageModal.set(true);
  }

  closeStorageModal(): void {
    this.showStorageModal.set(false);
  }

  /**
   * Salva todos os endereços geocodificados no Firebase Storage
   */
  async confirmSaveToStorage(): Promise<void> {
    this.closeStorageModal();
    const addresses = this.addresses();
    const successAddresses = addresses.filter(addr => addr.status === 'success');

    this.isLoading.set(true);
    this.loadingMessage.set('☁️ Salvando no Firebase Storage...');
    this.errorMessage.set('');

    try {
      // Prepara os dados para exportação
      const exportData = successAddresses.map(addr => ({
        'nome - endereco': `${addr.nome} - ${addr.endereco}`,
        nome: addr.nome,
        endereco: addr.endereco,
        turno: addr.turno,
        nivelAtendimento: addr.nivelAtendimento ?? 'N/A',
        latitude: addr.latitude ?? 'N/A',
        longitude: addr.longitude ?? 'N/A',
        status: 'Sucesso'
      }));

      // Cria a planilha
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Endereços Geocodificados');

      // Gera o arquivo CSV
      const csvOutput = XLSX.write(workbook, { bookType: 'csv', type: 'string' });
      
      // Gera timestamp para nome do arquivo
      const now = new Date();
      const timestamp = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}_${now.getHours().toString().padStart(2, '0')}h${now.getMinutes().toString().padStart(2, '0')}`;
      const fileName = `enderecos_geocodificados_${timestamp}.csv`;
      
      // Converte CSV para File
      const blob = new Blob([csvOutput], { type: 'text/csv' });
      const csvFile = new File([blob], fileName, { type: 'text/csv' });
      
      // Upload para o Storage na pasta "enderecos_geocodificados"
      await this.storageService.uploadFile(csvFile, 'enderecos_geocodificados');
      
      this.successMessage.set(`✅ Arquivo salvo no Firebase Storage com sucesso! (${successAddresses.length} endereços)`);
      setTimeout(() => this.successMessage.set(''), 5000);
    } catch (error: any) {
      console.error('Erro ao salvar no Storage:', error);
      this.errorMessage.set(`❌ Erro ao salvar no Storage: ${error.message || 'Erro desconhecido'}`);
    } finally {
      this.isLoading.set(false);
      this.loadingMessage.set('');
    }
  }

  /**
   * Abre modal de confirmação para salvar no Storage por turno
   */
  openStorageByShiftModal(): void {
    const addresses = this.addresses();
    
    if (addresses.length === 0) {
      this.errorMessage.set('Não há dados para salvar.');
      return;
    }

    const successAddresses = addresses.filter(addr => addr.status === 'success');
    
    if (successAddresses.length === 0) {
      this.errorMessage.set('Não há endereços geocodificados com sucesso para salvar.');
      return;
    }

    const turnos = this.getUniqueTurnos();
    this.pendingSaveData.set({count: successAddresses.length, turnos});
    this.showStorageByShiftModal.set(true);
  }

  closeStorageByShiftModal(): void {
    this.showStorageByShiftModal.set(false);
  }

  /**
   * Salva os endereços geocodificados separados por turno no Firebase Storage
   */
  async confirmSaveToStorageByShift(): Promise<void> {
    this.closeStorageByShiftModal();
    const addresses = this.addresses();
    const successAddresses = addresses.filter(addr => addr.status === 'success');

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      // Agrupa os endereços por turno
      const addressesByShift = new Map<string, AddressWithCoordinates[]>();
      
      successAddresses.forEach(addr => {
        const turno = addr.turno || 'Sem Turno';
        if (!addressesByShift.has(turno)) {
          addressesByShift.set(turno, []);
        }
        addressesByShift.get(turno)!.push(addr);
      });

      // Gera timestamp para nome dos arquivos
      const now = new Date();
      const timestamp = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}_${now.getHours().toString().padStart(2, '0')}h${now.getMinutes().toString().padStart(2, '0')}`;
      
      let savedCount = 0;

      for (const [turno, shiftAddresses] of addressesByShift.entries()) {
        this.loadingMessage.set(`☁️ Salvando turno ${turno} no Firebase Storage...`);
        
        // Prepara os dados para exportação
        const exportData = shiftAddresses.map(addr => ({
          'nome - endereco': `${addr.nome} - ${addr.endereco}`,
          nome: addr.nome,
          endereco: addr.endereco,
          turno: addr.turno,
          nivelAtendimento: addr.nivelAtendimento ?? 'N/A',
          latitude: addr.latitude ?? 'N/A',
          longitude: addr.longitude ?? 'N/A',
          status: 'Sucesso'
        }));

        // Cria a planilha
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, `Turno ${turno}`);

        // Gera o arquivo CSV
        const csvOutput = XLSX.write(workbook, { bookType: 'csv', type: 'string' });
        
        // Normaliza o nome do turno para usar no nome do arquivo
        const turnoNormalizado = turno.toString().replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `enderecos_turno_${turnoNormalizado}_${timestamp}.csv`;
        
        // Converte CSV para File
        const blob = new Blob([csvOutput], { type: 'text/csv' });
        const csvFile = new File([blob], fileName, { type: 'text/csv' });
        
        // Upload para o Storage na pasta "enderecos_geocodificados/por_turno"
        await this.storageService.uploadFile(csvFile, 'enderecos_geocodificados/por_turno');
        
        savedCount++;
      }
      
      this.successMessage.set(`✅ ${savedCount} arquivo(s) salvos no Firebase Storage com sucesso!`);
      setTimeout(() => this.successMessage.set(''), 5000);
    } catch (error: any) {
      console.error('Erro ao salvar no Storage:', error);
      this.errorMessage.set(`❌ Erro ao salvar no Storage: ${error.message || 'Erro desconhecido'}`);
    } finally {
      this.isLoading.set(false);
      this.loadingMessage.set('');
    }
  }

  getUniqueTurnos(): string[] {
    const addresses = this.addresses();
    const turnos = new Set<string>();
    
    addresses
      .filter(addr => addr.status === 'success')
      .forEach(addr => {
        if (addr.turno) {
          turnos.add(addr.turno);
        }
      });
    
    return Array.from(turnos).sort();
  }

  clearData(): void {
    this.addresses.set([]);
    this.processedCount.set(0);
    this.totalCount.set(0);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.loadingMessage.set('');
  }

  /**
   * Processa dados do Excel
   */
  private processExcelData(data: ArrayBuffer | string): void {
    try {
      const workbook = XLSX.read(data, { type: data instanceof ArrayBuffer ? 'array' : 'binary' });
      
      // Pega a primeira planilha
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Converte para JSON
      const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);
      
      if (jsonData.length === 0) {
        this.errorMessage.set('O arquivo Excel está vazio.');
        this.isLoading.set(false);
        return;
      }

      // Valida se tem as colunas necessárias
      const firstRow = jsonData[0];
      const keys = Object.keys(firstRow).map(k => k.toLowerCase().trim());
      
      const hasNome = keys.some(k => k === 'nome' || k === 'name');
      const hasEndereco = keys.some(k => k === 'endereco' || k === 'endereço' || k === 'address');
      const hasTurno = keys.some(k => k === 'turno' || k === 'shift' || k === 'periodo' || k === 'período');
      
      if (!hasNome || !hasEndereco || !hasTurno) {
        const availableColumns = Object.keys(firstRow).join(', ');
        this.errorMessage.set(`O arquivo deve conter as colunas: nome, endereco e turno. Colunas encontradas: ${availableColumns}`);
        this.isLoading.set(false);
        return;
      }
      
      // Normaliza os nomes das colunas
      const normalizedData: ExcelRow[] = jsonData.map(row => {
        const normalized: any = {};
        
        for (const [key, value] of Object.entries(row)) {
          const lowerKey = key.toLowerCase().trim();
          
          if (lowerKey === 'nome' || lowerKey === 'name') {
            normalized.nome = value;
          } else if (lowerKey === 'endereco' || lowerKey === 'endereço' || lowerKey === 'address') {
            normalized.endereco = value;
          } else if (lowerKey === 'turno' || lowerKey === 'shift' || lowerKey === 'periodo' || lowerKey === 'período') {
            // Normaliza o turno: se for número (1, 2, 3), converte para Turno1, Turno2, Turno3
            // Se for "Adm" ou "adm", converte para TurnoAdm
            let turnoValue = String(value).trim();
            
            // Se for um número, adiciona o prefixo "Turno"
            if (/^\d+$/.test(turnoValue)) {
              turnoValue = `Turno${turnoValue}`;
            } else if (turnoValue.toLowerCase() === 'adm') {
              turnoValue = 'TurnoAdm';
            }
            // Se já estiver no formato correto (Turno1, Turno2, etc), mantém
            
            normalized.turno = turnoValue;
          } else if (lowerKey === 'nivelatendimento' || lowerKey === 'nivel' || lowerKey === 'nivel de atendimento') {
            // Captura o nível de atendimento (campo opcional)
            normalized.nivelAtendimento = value ? String(value).trim() : undefined;
          }
        }
        
        return normalized as ExcelRow;
      });

      // Inicializa os endereços com dados normalizados
      const addressesWithStatus: AddressWithCoordinates[] = normalizedData.map(row => ({
        ...row,
        status: 'pending' as const
      }));
      
      this.addresses.set(addressesWithStatus);
      this.totalCount.set(addressesWithStatus.length);
      this.processedCount.set(0);
      
      // Inicia a geocodificação
      this.geocodeAllAddresses();
      
    } catch (error) {
      this.errorMessage.set('Erro ao ler o arquivo Excel. Verifique se o formato está correto.');
      this.isLoading.set(false);
      this.loadingMessage.set('');
      console.error('Erro ao processar Excel:', error);
    }
  }

  /**
   * Abre modal de confirmação para salvar no Firestore
   */
  openFirestoreModal(): void {
    const addresses = this.addresses();
    
    if (addresses.length === 0) {
      this.errorMessage.set('Não há dados para salvar.');
      return;
    }

    const successAddresses = addresses.filter(addr => addr.status === 'success');
    
    if (successAddresses.length === 0) {
      this.errorMessage.set('Não há endereços geocodificados com sucesso para salvar.');
      return;
    }

    const turnos = this.getUniqueTurnos();
    this.pendingSaveData.set({count: successAddresses.length, turnos});
    this.showFirestoreModal.set(true);
  }

  closeFirestoreModal(): void {
    this.showFirestoreModal.set(false);
  }

  /**
   * Salva os endereços geocodificados no Firestore
   */
  async confirmSaveToFirestore(): Promise<void> {
    this.closeFirestoreModal();
    const addresses = this.addresses();
    const successAddresses = addresses.filter(addr => addr.status === 'success');

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.loadingMessage.set('💾 Salvando dados no Firestore...');

    try {
      await this.firestoreService.saveAddressesByShift(successAddresses);
      this.successMessage.set(`✅ ${successAddresses.length} endereço(s) salvos no Firestore com sucesso!`);
      setTimeout(() => this.successMessage.set(''), 5000);
    } catch (error: any) {
      console.error('Erro ao salvar no Firestore:', error);
      this.errorMessage.set(`❌ Erro ao salvar no Firestore: ${error.message || 'Erro desconhecido'}`);
    } finally {
      this.isLoading.set(false);
      this.loadingMessage.set('');
    }
  }
}
