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
  successMessage: string = '';
  
  // Modal de confirmação de delete
  showDeleteModal: boolean = false;
  fileToDelete: StorageFile | null = null;
  
  // Modal de confirmação de delete pasta
  showDeleteFolderModal: boolean = false;
  folderToDelete: StorageFolder | null = null;

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
      this.error = 'Por favor, selecione um arquivo primeiro';
      return;
    }

    this.uploading = true;
    this.error = '';

    try {
      await this.storageService.uploadFile(this.selectedFile, this.currentPath);
      this.successMessage = '✅ Arquivo enviado com sucesso!';
      this.selectedFile = null;
      
      // Limpa o input
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
      // Recarrega a lista
      await this.loadFiles();
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error: any) {
      this.error = 'Erro ao fazer upload: ' + (error.message || 'Erro desconhecido');
      console.error(error);
    } finally {
      this.uploading = false;
    }
  }

  /**
   * Abre o modal de confirmação de delete
   */
  openDeleteModal(file: StorageFile): void {
    this.fileToDelete = file;
    this.showDeleteModal = true;
  }

  /**
   * Fecha o modal de confirmação de delete
   */
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.fileToDelete = null;
  }

  /**
   * Confirma e deleta o arquivo
   */
  async confirmDelete(): Promise<void> {
    if (!this.fileToDelete) return;

    // Salva as informações antes de fechar o modal
    const fileName = this.fileToDelete.name;
    const filePath = this.fileToDelete.fullPath;
    
    this.loading = true;
    this.error = '';
    this.closeDeleteModal();

    try {
      await this.storageService.deleteFile(filePath);
      this.successMessage = `✅ Arquivo "${fileName}" deletado com sucesso!`;
      await this.loadFiles();
      setTimeout(() => this.successMessage = '', 3000);
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

  /**
   * Abre o modal de confirmação para deletar pasta
   */
  openDeleteFolderModal(folder: StorageFolder): void {
    this.folderToDelete = folder;
    this.showDeleteFolderModal = true;
  }

  /**
   * Fecha o modal de confirmação de delete pasta
   */
  closeDeleteFolderModal(): void {
    this.showDeleteFolderModal = false;
    this.folderToDelete = null;
  }

  /**
   * Confirma e deleta a pasta
   */
  async confirmDeleteFolder(): Promise<void> {
    if (!this.folderToDelete) return;

    const folderName = this.folderToDelete.name;
    const folderPath = this.folderToDelete.fullPath;
    
    this.loading = true;
    this.error = '';
    this.closeDeleteFolderModal();

    try {
      const result = await this.storageService.deleteFolder(folderPath);
      this.successMessage = `✅ Pasta "${folderName}" deletada com sucesso! (${result.deletedCount} arquivo(s) removido(s))`;
      await this.loadFiles();
      setTimeout(() => this.successMessage = '', 5000);
    } catch (error: any) {
      this.error = 'Erro ao deletar pasta: ' + (error.message || 'Erro desconhecido');
      console.error(error);
    } finally {
      this.loading = false;
    }
  }
}
