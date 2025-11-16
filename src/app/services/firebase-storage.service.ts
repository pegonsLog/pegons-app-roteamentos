import { Injectable } from '@angular/core';
import { 
  Storage, 
  ref, 
  listAll, 
  getDownloadURL, 
  getMetadata,
  uploadBytes,
  deleteObject,
  getBlob,
  StorageReference,
  UploadResult
} from '@angular/fire/storage';

export interface StorageFile {
  name: string;
  fullPath: string;
  downloadURL: string;
  size: number;
  contentType: string;
  timeCreated: string;
  updated: string;
}

export interface StorageFolder {
  name: string;
  fullPath: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseStorageService {

  constructor(private storage: Storage) { }

  /**
   * Lista todos os arquivos e pastas em um caminho específico
   */
  async listFiles(path: string = ''): Promise<{ files: StorageFile[], folders: StorageFolder[] }> {
    try {
      const storageRef = ref(this.storage, path);
      const result = await listAll(storageRef);
      
      // Processa arquivos
      const filesPromises = result.items.map(async (itemRef) => {
        const metadata = await getMetadata(itemRef);
        const downloadURL = await getDownloadURL(itemRef);
        
        return {
          name: itemRef.name,
          fullPath: itemRef.fullPath,
          downloadURL: downloadURL,
          size: metadata.size,
          contentType: metadata.contentType || 'unknown',
          timeCreated: metadata.timeCreated,
          updated: metadata.updated
        } as StorageFile;
      });
      
      const files = await Promise.all(filesPromises);
      
      // Processa pastas
      const folders = result.prefixes.map(prefixRef => ({
        name: prefixRef.name,
        fullPath: prefixRef.fullPath
      } as StorageFolder));
      
      return { files, folders };
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      throw error;
    }
  }

  /**
   * Faz upload de um arquivo
   */
  async uploadFile(file: File, path: string): Promise<UploadResult> {
    try {
      const storageRef = ref(this.storage, `${path}/${file.name}`);
      const result = await uploadBytes(storageRef, file);
      return result;
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      throw error;
    }
  }

  /**
   * Deleta um arquivo
   */
  async deleteFile(fullPath: string): Promise<void> {
    try {
      const storageRef = ref(this.storage, fullPath);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      throw error;
    }
  }

  /**
   * Obtém a URL de download de um arquivo
   */
  async getDownloadURL(fullPath: string): Promise<string> {
    try {
      const storageRef = ref(this.storage, fullPath);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Erro ao obter URL:', error);
      throw error;
    }
  }

  /**
   * Baixa um arquivo como Blob (evita problemas de CORS)
   */
  async downloadFileAsBlob(fullPath: string): Promise<Blob> {
    try {
      const storageRef = ref(this.storage, fullPath);
      const blob = await getBlob(storageRef);
      return blob;
    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);
      throw error;
    }
  }

  /**
   * Formata o tamanho do arquivo em formato legível
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Obtém o ícone apropriado baseado no tipo de arquivo
   */
  getFileIcon(contentType: string): string {
    if (contentType.includes('image')) return 'bi-file-image';
    if (contentType.includes('pdf')) return 'bi-file-pdf';
    if (contentType.includes('video')) return 'bi-file-play';
    if (contentType.includes('audio')) return 'bi-file-music';
    if (contentType.includes('text')) return 'bi-file-text';
    if (contentType.includes('spreadsheet') || contentType.includes('excel')) return 'bi-file-spreadsheet';
    if (contentType.includes('word') || contentType.includes('document')) return 'bi-file-word';
    if (contentType.includes('zip') || contentType.includes('compressed')) return 'bi-file-zip';
    return 'bi-file-earmark';
  }
}
