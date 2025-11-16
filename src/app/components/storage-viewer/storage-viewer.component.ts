import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseStorageService, StorageFile, StorageFolder } from '../../services/firebase-storage.service';

@Component({
  selector: 'app-storage-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './storage-viewer.component.html',
  styleUrls: ['./storage-viewer.component.css']
})
export class StorageViewerComponent implements OnInit {
  files: StorageFile[] = [];
  folders: StorageFolder[] = [];
  currentPath: string = '';
  pathHistory: string[] = [''];
  loading: boolean = false;
  error: string = '';
  selectedFile: File | null = null;
  uploading: boolean = false;

  constructor(private storageService: FirebaseStorageService) {}

  ngOnInit(): void {
    this.loadFiles();
  }

  /**
   * Carrega os arquivos do caminho atual
   */
  async loadFiles(): Promise<void> {
    this.loading = true;
    this.error = '';
    
    try {
      const result = await this.storageService.listFiles(this.currentPath);
      this.files = result.files;
      this.folders = result.folders;
    } catch (error: any) {
      this.error = 'Erro ao carregar arquivos: ' + (error.message || 'Erro desconhecido');
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  /**
   * Navega para uma pasta
   */
  navigateToFolder(folder: StorageFolder): void {
    this.pathHistory.push(this.currentPath);
    this.currentPath = folder.fullPath;
    this.loadFiles();
  }

  /**
   * Volta para a pasta anterior
   */
  goBack(): void {
    if (this.pathHistory.length > 1) {
      this.currentPath = this.pathHistory.pop() || '';
      this.loadFiles();
    }
  }

  /**
   * Vai para a raiz
   */
  goToRoot(): void {
    this.currentPath = '';
    this.pathHistory = [''];
    this.loadFiles();
  }

  /**
   * Seleciona um arquivo para upload
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  /**
   * Faz upload do arquivo selecionado
   */
  async uploadFile(): Promise<void> {
    if (!this.selectedFile) {
      alert('Por favor, selecione um arquivo primeiro');
      return;
    }

    this.uploading = true;
    this.error = '';

    try {
      await this.storageService.uploadFile(this.selectedFile, this.currentPath);
      alert('Arquivo enviado com sucesso!');
      this.selectedFile = null;
      
      // Limpa o input
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
      // Recarrega a lista
      await this.loadFiles();
    } catch (error: any) {
      this.error = 'Erro ao fazer upload: ' + (error.message || 'Erro desconhecido');
      console.error(error);
    } finally {
      this.uploading = false;
    }
  }

  /**
   * Deleta um arquivo
   */
  async deleteFile(file: StorageFile): Promise<void> {
    if (!confirm(`Tem certeza que deseja deletar o arquivo "${file.name}"?`)) {
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      await this.storageService.deleteFile(file.fullPath);
      alert('Arquivo deletado com sucesso!');
      await this.loadFiles();
    } catch (error: any) {
      this.error = 'Erro ao deletar arquivo: ' + (error.message || 'Erro desconhecido');
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  /**
   * Abre o arquivo em uma nova aba
   */
  openFile(file: StorageFile): void {
    window.open(file.downloadURL, '_blank');
  }

  /**
   * Faz download do arquivo
   */
  downloadFile(file: StorageFile): void {
    const link = document.createElement('a');
    link.href = file.downloadURL;
    link.download = file.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Formata o tamanho do arquivo
   */
  formatSize(bytes: number): string {
    return this.storageService.formatFileSize(bytes);
  }

  /**
   * Obtém o ícone do arquivo
   */
  getFileIcon(contentType: string): string {
    return this.storageService.getFileIcon(contentType);
  }

  /**
   * Formata a data
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  }

  /**
   * Obtém o nome do caminho atual para exibição
   */
  getCurrentPathDisplay(): string {
    return this.currentPath || 'Raiz';
  }

  /**
   * Verifica se é uma imagem
   */
  isImage(contentType: string): boolean {
    return contentType.includes('image');
  }
}
