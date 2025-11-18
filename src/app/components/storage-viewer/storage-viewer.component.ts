import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseStorageService, StorageFile, StorageFolder } from '../../services/firebase-storage.service';
import { GoogleDriveService } from '../../services/google-drive.service';

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

  constructor(
    private storageService: FirebaseStorageService,
    private googleDriveService: GoogleDriveService
  ) {}

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
  async downloadFile(file: StorageFile): Promise<void> {
    console.log('🔽 Iniciando download do arquivo:', file.name);
    
    try {
      // Para arquivos CSV, precisamos processar com BOM UTF-8
      if (file.name.toLowerCase().endsWith('.csv')) {
        console.log('📄 Arquivo CSV detectado, processando com BOM UTF-8...');
        
        // Baixa o arquivo via fetch usando a URL de download do Firebase
        const response = await fetch(file.downloadURL);
        if (!response.ok) {
          throw new Error(`Erro ao baixar: ${response.status} ${response.statusText}`);
        }
        
        const text = await response.text();
        console.log('📝 Conteúdo CSV lido, tamanho:', text.length, 'caracteres');
        
        // Adiciona BOM UTF-8
        const BOM = '\uFEFF';
        const csvWithBOM = BOM + text;
        
        // Cria blob com BOM
        const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
        console.log('✅ Blob CSV criado com BOM, tamanho:', blob.size, 'bytes');
        
        // Cria URL e faz download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.successMessage = '✅ Arquivo CSV baixado com encoding UTF-8 + BOM para Google My Maps';
        setTimeout(() => this.successMessage = '', 5000);
      } else {
        console.log('📁 Arquivo normal, baixando diretamente...');
        
        // Para outros arquivos, usa download direto
        const link = document.createElement('a');
        link.href = file.downloadURL;
        link.download = file.name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.successMessage = '✅ Arquivo baixado com sucesso';
        setTimeout(() => this.successMessage = '', 3000);
      }
      
      console.log('✅ Download concluído com sucesso!');
    } catch (error: any) {
      console.error('❌ Erro ao baixar arquivo:', error);
      this.error = 'Erro ao baixar arquivo: ' + (error.message || 'Erro desconhecido');
    }
  }

  /**
   * Exporta arquivo CSV diretamente para o Google Drive
   */
  async exportToGoogleDrive(file: StorageFile, forceAccountSelection: boolean = false): Promise<void> {
    console.log('📤 Iniciando exportação para Google Drive:', file.name);
    this.loading = true;
    this.error = '';
    
    try {
      // Se forçar seleção de conta, limpa o token primeiro
      if (forceAccountSelection) {
        this.googleDriveService.clearToken();
      }
      
      // Baixa o arquivo do Firebase Storage
      const response = await fetch(file.downloadURL);
      if (!response.ok) {
        throw new Error(`Erro ao baixar: ${response.status} ${response.statusText}`);
      }
      
      const text = await response.text();
      
      // Adiciona BOM UTF-8 para arquivos CSV
      let content = text;
      if (file.name.toLowerCase().endsWith('.csv')) {
        const BOM = '\uFEFF';
        content = BOM + text;
      }
      
      // Faz upload para o Google Drive
      console.log('☁️ Fazendo upload para Google Drive...');
      const result = await this.googleDriveService.uploadFile(
        file.name,
        content,
        'text/csv;charset=utf-8'
      );
      
      console.log('✅ Arquivo exportado para Google Drive:', result);
      this.successMessage = `✅ Arquivo "${file.name}" exportado para o Google Drive com sucesso!`;
      setTimeout(() => this.successMessage = '', 5000);
    } catch (error: any) {
      console.error('❌ Erro ao exportar para Google Drive:', error);
      
      // Se o erro for de autenticação, sugere trocar de conta
      if (error.message && error.message.includes('redirect_uri')) {
        this.error = 'Erro de autenticação. Tente trocar de conta do Google.';
      } else {
        this.error = 'Erro ao exportar para Google Drive: ' + (error.message || 'Erro desconhecido');
      }
    } finally {
      this.loading = false;
    }
  }

  /**
   * Exporta para Google Drive com seleção de conta
   */
  async exportToGoogleDriveWithAccountSelection(file: StorageFile): Promise<void> {
    await this.exportToGoogleDrive(file, true);
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
