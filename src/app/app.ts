import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { GoogleGeocodeService } from './services/google-geocode.service';
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

  constructor(private geocodeService: GoogleGeocodeService) {}

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
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
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
        console.error('Erro ao processar Excel:', error);
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
        const coords = await this.geocodeService.geocodeAddressAsync(address.endereco);
        
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

  exportToCSV(): void {
    const addresses = this.addresses();
    
    if (addresses.length === 0) {
      this.errorMessage.set('Não há dados para exportar.');
      return;
    }

    // Prepara os dados para exportação
    const exportData = addresses.map(addr => ({
      nome: addr.nome,
      endereco: addr.endereco,
      turno: addr.turno,
      latitude: addr.latitude ?? 'N/A',
      longitude: addr.longitude ?? 'N/A',
      status: addr.status === 'success' ? 'Sucesso' : addr.status === 'error' ? 'Erro' : 'Pendente',
      erro: addr.errorMessage ?? ''
    }));

    // Cria a planilha
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Endereços Geocodificados');

    // Gera o arquivo CSV
    const csvOutput = XLSX.write(workbook, { bookType: 'csv', type: 'array' });
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    
    // Faz o download
    const timestamp = new Date().toISOString().split('T')[0];
    saveAs(blob, `enderecos_geocodificados_${timestamp}.csv`);
    
    this.successMessage.set('Arquivo CSV exportado com sucesso!');
  }

  clearData(): void {
    this.addresses.set([]);
    this.processedCount.set(0);
    this.totalCount.set(0);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.loadingMessage.set('');
  }
}
