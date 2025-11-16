import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { GoogleGeocodeService } from './services/google-geocode.service';
import { GoogleDriveService } from './services/google-drive.service';
import { FirestoreDataService } from './services/firestore-data.service';
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
  driveDropdownOpen = signal(false);
  driveFilesModalOpen = signal(false);
  driveFiles = signal<any[]>([]);
  loadingDriveFiles = signal(false);

  constructor(
    private geocodeService: GoogleGeocodeService,
    private driveService: GoogleDriveService,
    private firestoreService: FirestoreDataService,
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

  async exportToCSV(): Promise<void> {
    const addresses = this.addresses();
    
    if (addresses.length === 0) {
      this.errorMessage.set('Não há dados para exportar.');
      return;
    }

    // Filtra apenas endereços geocodificados com sucesso
    const successAddresses = addresses.filter(addr => addr.status === 'success');
    
    if (successAddresses.length === 0) {
      this.errorMessage.set('Não há endereços geocodificados com sucesso para exportar.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      // Prepara os dados para exportação
      const exportData = successAddresses.map(addr => ({
        'nome - endereco': `${addr.nome} - ${addr.endereco}`,
        nome: addr.nome,
        endereco: addr.endereco,
        turno: addr.turno,
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
      
      // Gera timestamp para nome da pasta e arquivo
      const now = new Date();
      const dateFolder = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}_${now.getHours().toString().padStart(2, '0')}h${now.getMinutes().toString().padStart(2, '0')}`;
      const timestamp = now.toISOString().split('T')[0];
      const fileName = `enderecos_geocodificados_${timestamp}.csv`;
      
      // Busca ou cria a pasta "Endereços Geocodificados"
      let mainFolder = await this.driveService.findFolderByName('Endereços Geocodificados');
      if (!mainFolder) {
        mainFolder = await this.driveService.createFolder('Endereços Geocodificados');
      }

      // Cria pasta com a data/hora da exportação
      const dateSubFolder = await this.driveService.createFolder(dateFolder, mainFolder.id);

      // Faz upload do arquivo CSV na pasta da data
      const file = await this.driveService.uploadFile(
        fileName,
        csvOutput,
        'text/csv',
        dateSubFolder.id
      );

      // Compartilha com pegons.app@gmail.com
      await this.driveService.shareFileWithEmail(file.id, 'pegons.app@gmail.com', 'writer');

      this.successMessage.set('✅ Arquivo CSV enviado para o Google Drive com sucesso! Compartilhado com pegons.app@gmail.com');
      setTimeout(() => this.successMessage.set(''), 5000);
    } catch (error: any) {
      console.error('Erro ao enviar para Google Drive:', error);
      this.errorMessage.set(`❌ Erro ao enviar para Google Drive: ${error.message || 'Erro desconhecido'}`);
    } finally {
      this.isLoading.set(false);
    }
  }

  async exportToCSVByShift(): Promise<void> {
    const addresses = this.addresses();
    
    if (addresses.length === 0) {
      this.errorMessage.set('Não há dados para exportar.');
      return;
    }

    // Filtra apenas endereços geocodificados com sucesso
    const successAddresses = addresses.filter(addr => addr.status === 'success');
    
    if (successAddresses.length === 0) {
      this.errorMessage.set('Não há endereços geocodificados com sucesso para exportar.');
      return;
    }

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

      // Busca ou cria a pasta "Endereços Geocodificados"
      let mainFolder = await this.driveService.findFolderByName('Endereços Geocodificados');
      if (!mainFolder) {
        mainFolder = await this.driveService.createFolder('Endereços Geocodificados');
      }

      // Gera timestamp para nome da pasta e arquivos
      const now = new Date();
      const dateFolder = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}_${now.getHours().toString().padStart(2, '0')}h${now.getMinutes().toString().padStart(2, '0')}`;
      const timestamp = now.toISOString().split('T')[0];
      
      // Cria pasta com a data/hora da exportação
      const dateSubFolder = await this.driveService.createFolder(dateFolder, mainFolder.id);
      
      let exportedCount = 0;

      for (const [turno, shiftAddresses] of addressesByShift.entries()) {
        // Prepara os dados para exportação
        const exportData = shiftAddresses.map(addr => ({
          'nome - endereco': `${addr.nome} - ${addr.endereco}`,
          nome: addr.nome,
          endereco: addr.endereco,
          turno: addr.turno,
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
        
        // Faz upload do arquivo CSV na pasta da data
        const file = await this.driveService.uploadFile(
          fileName,
          csvOutput,
          'text/csv',
          dateSubFolder.id
        );

        // Compartilha com pegons.app@gmail.com
        await this.driveService.shareFileWithEmail(file.id, 'pegons.app@gmail.com', 'writer');
        
        exportedCount++;
      }
      
      this.successMessage.set(`✅ ${exportedCount} arquivo(s) CSV enviado(s) para o Google Drive com sucesso! Compartilhados com pegons.app@gmail.com`);
      setTimeout(() => this.successMessage.set(''), 5000);
    } catch (error: any) {
      console.error('Erro ao enviar para Google Drive:', error);
      this.errorMessage.set(`❌ Erro ao enviar para Google Drive: ${error.message || 'Erro desconhecido'}`);
    } finally {
      this.isLoading.set(false);
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
   * Toggle do dropdown do Drive
   */
  toggleDriveDropdown(): void {
    this.driveDropdownOpen.set(!this.driveDropdownOpen());
  }

  /**
   * Fecha o dropdown do Drive
   */
  closeDriveDropdown(): void {
    this.driveDropdownOpen.set(false);
  }

  /**
   * Troca a conta do Google para operações com o Drive
   */
  async switchGoogleAccount(): Promise<void> {
    this.closeDriveDropdown();
    try {
      this.loadingMessage.set('🔄 Abrindo seletor de contas do Google...');
      await this.driveService.switchAccount();
      this.successMessage.set('✅ Conta do Google alterada com sucesso!');
      setTimeout(() => this.successMessage.set(''), 3000);
    } catch (error) {
      console.error('Erro ao trocar conta:', error);
      this.errorMessage.set('❌ Erro ao trocar de conta. Tente novamente.');
      setTimeout(() => this.errorMessage.set(''), 5000);
    } finally {
      this.loadingMessage.set('');
    }
  }

  /**
   * Abre o modal para selecionar arquivo do Google Drive
   */
  async openDriveFilePicker(): Promise<void> {
    this.driveFilesModalOpen.set(true);
    this.loadingDriveFiles.set(true);
    this.errorMessage.set('');

    try {
      // Autentica e lista arquivos
      await this.driveService.authenticate();
      const files = await this.driveService.listSpreadsheetFiles();
      this.driveFiles.set(files);
    } catch (error: any) {
      console.error('Erro ao listar arquivos do Drive:', error);
      this.errorMessage.set(`❌ Erro ao acessar Google Drive: ${error.message || 'Erro desconhecido'}`);
      this.closeDriveFilePicker();
    } finally {
      this.loadingDriveFiles.set(false);
    }
  }

  /**
   * Fecha o modal de seleção de arquivos do Drive
   */
  closeDriveFilePicker(): void {
    this.driveFilesModalOpen.set(false);
    this.driveFiles.set([]);
  }

  /**
   * Seleciona e processa um arquivo do Google Drive
   */
  async selectDriveFile(file: any): Promise<void> {
    this.closeDriveFilePicker();
    this.isLoading.set(true);
    this.loadingMessage.set('📥 Baixando arquivo do Google Drive...');
    this.errorMessage.set('');

    try {
      // Verifica se é Google Sheets ou XLSX
      const isGoogleSheet = file.mimeType === 'application/vnd.google-apps.spreadsheet';
      
      let fileContent: ArrayBuffer;
      
      if (isGoogleSheet) {
        // Exporta Google Sheets como XLSX
        fileContent = await this.driveService.exportGoogleSheetAsXlsx(file.id);
      } else {
        // Baixa arquivo XLSX
        fileContent = await this.driveService.downloadFile(file.id);
      }

      // Processa o arquivo
      this.loadingMessage.set('📊 Processando planilha...');
      this.processExcelData(fileContent);
      
    } catch (error: any) {
      console.error('Erro ao processar arquivo do Drive:', error);
      this.errorMessage.set(`❌ Erro ao processar arquivo: ${error.message || 'Erro desconhecido'}`);
      this.isLoading.set(false);
      this.loadingMessage.set('');
    }
  }

  /**
   * Processa dados do Excel (usado tanto para upload local quanto Drive)
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
            normalized.turno = value;
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
   * Salva os endereços geocodificados no Firestore
   */
  async saveToFirestore(): Promise<void> {
    const addresses = this.addresses();
    
    if (addresses.length === 0) {
      this.errorMessage.set('Não há dados para salvar.');
      return;
    }

    // Filtra apenas endereços geocodificados com sucesso
    const successAddresses = addresses.filter(addr => addr.status === 'success');
    
    if (successAddresses.length === 0) {
      this.errorMessage.set('Não há endereços geocodificados com sucesso para salvar.');
      return;
    }

    if (!confirm(`Deseja salvar ${successAddresses.length} endereço(s) no Firestore? Os dados serão organizados por turno.`)) {
      return;
    }

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
