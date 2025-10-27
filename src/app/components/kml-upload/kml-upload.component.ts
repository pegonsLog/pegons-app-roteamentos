import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx';

interface LocalData {
  nome: string;
  endereco: string;
  turno: string;
}

@Component({
  selector: 'app-kml-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kml-upload.component.html',
  styleUrl: './kml-upload.component.css'
})
export class KmlUploadComponent {
  // Estado do componente
  isProcessing = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  extractedData = signal<LocalData[]>([]);
  fileName = signal('');

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    
    // Valida extensão do arquivo
    if (!file.name.toLowerCase().endsWith('.kml')) {
      this.errorMessage.set('❌ Por favor, selecione um arquivo .kml válido');
      return;
    }

    this.fileName.set(file.name);
    this.processKmlFile(file);
  }

  private processKmlFile(file: File): void {
    this.isProcessing.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.extractedData.set([]);

    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const kmlContent = e.target?.result as string;
        const data = this.parseKml(kmlContent);
        
        if (data.length === 0) {
          this.errorMessage.set('⚠️ Nenhum dado foi encontrado no arquivo KML');
          this.isProcessing.set(false);
          return;
        }

        this.extractedData.set(data);
        this.successMessage.set(`✅ ${data.length} local(is) extraído(s) com sucesso!`);
        this.isProcessing.set(false);
      } catch (error) {
        this.errorMessage.set(`❌ Erro ao processar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        this.isProcessing.set(false);
      }
    };

    reader.onerror = () => {
      this.errorMessage.set('❌ Erro ao ler o arquivo');
      this.isProcessing.set(false);
    };

    reader.readAsText(file);
  }

  private parseKml(kmlContent: string): LocalData[] {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(kmlContent, 'text/xml');

    // Verifica se há erros de parsing
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('Arquivo KML inválido ou corrompido');
    }

    const placemarks = xmlDoc.getElementsByTagName('Placemark');
    const data: LocalData[] = [];

    for (let i = 0; i < placemarks.length; i++) {
      const placemark = placemarks[i];
      
      // Extrai nome do Placemark
      const nameElement = placemark.getElementsByTagName('name')[0];
      const nome = nameElement?.textContent?.trim() || `Local ${i + 1}`;

      // Inicializa variáveis
      let endereco = '';
      let turno = '';

      // Procura por ExtendedData
      const extendedData = placemark.getElementsByTagName('ExtendedData')[0];
      
      if (extendedData) {
        // Extrai todos os elementos Data dentro de ExtendedData
        const dataElements = extendedData.getElementsByTagName('Data');
        
        for (let j = 0; j < dataElements.length; j++) {
          const dataElement = dataElements[j];
          const dataName = dataElement.getAttribute('name');
          const valueElement = dataElement.getElementsByTagName('value')[0];
          const value = valueElement?.textContent?.trim() || '';
          
          // Mapeia os campos baseado no atributo name
          if (dataName === 'endereco') {
            endereco = value;
          } else if (dataName === 'turno') {
            // Remove decimal do turno (converte 1.0 para 1)
            const turnoNum = parseFloat(value);
            turno = isNaN(turnoNum) ? value : Math.floor(turnoNum).toString();
          }
        }
      }

      // Se não encontrou endereço no ExtendedData, tenta outras fontes
      if (!endereco) {
        // Tenta extrair da tag address
        const addressElement = placemark.getElementsByTagName('address')[0];
        if (addressElement) {
          endereco = addressElement.textContent?.trim() || '';
        }
        
        // Se ainda não encontrou, tenta da descrição
        if (!endereco) {
          const descElement = placemark.getElementsByTagName('description')[0];
          const description = descElement?.textContent?.trim() || '';
          
          if (description) {
            const addressMatch = description.match(/(?:endereço|endereco|address):\s*([^\n]+)/i);
            if (addressMatch) {
              endereco = addressMatch[1].trim();
            }
          }
        }
      }

      // Se não encontrou turno no ExtendedData, tenta da descrição
      if (!turno) {
        const descElement = placemark.getElementsByTagName('description')[0];
        const description = descElement?.textContent?.trim() || '';
        
        if (description) {
          const turnoMatch = description.match(/(?:turno|shift):\s*([^\n]+)/i);
          if (turnoMatch) {
            turno = turnoMatch[1].trim();
          }
        }
      }

      // Define valores padrão se não encontrou
      if (!endereco) {
        endereco = 'Endereço não disponível';
      }
      
      if (!turno) {
        turno = 'Não especificado';
      }

      data.push({
        nome,
        endereco,
        turno
      });
    }

    return data;
  }

  exportToExcel(): void {
    const data = this.extractedData();
    
    if (data.length === 0) {
      this.errorMessage.set('❌ Não há dados para exportar');
      return;
    }

    try {
      // Cria uma planilha a partir dos dados
      const worksheet = XLSX.utils.json_to_sheet(data, {
        header: ['nome', 'endereco', 'turno']
      });

      // Define largura das colunas
      worksheet['!cols'] = [
        { wch: 30 }, // Nome
        { wch: 50 }, // Endereço
        { wch: 20 }  // Turno
      ];

      // Formata o cabeçalho
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (worksheet[cellAddress]) {
          worksheet[cellAddress].v = this.formatHeader(worksheet[cellAddress].v);
        }
      }

      // Cria o workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Locais');

      // Gera o arquivo
      const fileName = `locais_${this.getTimestamp()}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      this.successMessage.set(`✅ Arquivo Excel exportado com sucesso: ${fileName}`);
      setTimeout(() => this.successMessage.set(''), 4000);
    } catch (error) {
      this.errorMessage.set(`❌ Erro ao exportar para Excel: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  private formatHeader(header: string): string {
    const headers: { [key: string]: string } = {
      'nome': 'Nome',
      'endereco': 'Endereço',
      'turno': 'Turno'
    };
    return headers[header] || header;
  }

  private getTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
  }

  clearData(): void {
    this.extractedData.set([]);
    this.fileName.set('');
    this.errorMessage.set('');
    this.successMessage.set('');
    
    // Limpa o input file
    const fileInput = document.getElementById('kmlFileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}
