import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

declare const gapi: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleDriveService {
  private CLIENT_ID = environment.googleDrive.clientId;
  private API_KEY = environment.googleDrive.apiKey;
  private DISCOVERY_DOCS = environment.googleDrive.discoveryDocs;
  private SCOPES = environment.googleDrive.scopes;
  
  private gapiInitialized = false;
  private tokenClient: any;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Inicializa o Google API Client
   */
  async initializeGoogleAPI(): Promise<void> {
    if (this.gapiInitialized) {
      return;
    }

    return new Promise((resolve, reject) => {
      gapi.load('client', async () => {
        try {
          await gapi.client.init({
            apiKey: this.API_KEY,
            discoveryDocs: this.DISCOVERY_DOCS,
          });
          
          this.gapiInitialized = true;
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Verifica se o token ainda é válido
   */
  private isTokenValid(): boolean {
    if (!this.accessToken || !this.tokenExpiry) {
      return false;
    }
    // Considera o token válido se ainda tiver pelo menos 5 minutos de validade
    return Date.now() < this.tokenExpiry - (5 * 60 * 1000);
  }

  /**
   * Autentica o usuário com Google OAuth2
   * @param forceAccountSelection Se true, força a seleção de conta mesmo se já estiver autenticado
   */
  async authenticate(forceAccountSelection: boolean = false): Promise<string> {
    // Se já temos um token válido e não estamos forçando nova seleção, reutiliza
    if (!forceAccountSelection && this.isTokenValid() && this.accessToken) {
      return this.accessToken;
    }

    if (!this.gapiInitialized) {
      await this.initializeGoogleAPI();
    }

    return new Promise((resolve, reject) => {
      const tokenClientConfig: any = {
        client_id: this.CLIENT_ID,
        scope: this.SCOPES,
        callback: (response: any) => {
          if (response.error) {
            console.error('Erro na autenticação:', response.error);
            reject(response);
          } else {
            // Armazena o token e define a expiração (padrão: 1 hora)
            this.accessToken = response.access_token;
            this.tokenExpiry = Date.now() + (response.expires_in || 3600) * 1000;
            resolve(response.access_token);
          }
        },
      };

      // Se forçar seleção de conta, adiciona o parâmetro hint vazio para mostrar o seletor
      if (forceAccountSelection) {
        tokenClientConfig.hint = '';
      }

      this.tokenClient = (window as any).google.accounts.oauth2.initTokenClient(tokenClientConfig);

      // Se estamos forçando a seleção, solicita com prompt
      if (forceAccountSelection) {
        this.tokenClient.requestAccessToken({ prompt: 'select_account' });
      } else {
        this.tokenClient.requestAccessToken();
      }
    });
  }

  /**
   * Força a troca de conta do Google
   * Limpa o token atual e abre o seletor de contas
   */
  async switchAccount(): Promise<string> {
    this.clearToken();
    return this.authenticate(true);
  }

  /**
   * Faz upload de um arquivo para o Google Drive
   */
  async uploadFile(
    fileName: string,
    fileContent: string | ArrayBuffer | Blob,
    mimeType: string,
    folderId?: string
  ): Promise<any> {
    try {
      const accessToken = await this.authenticate();
      
      const metadata = {
        name: fileName,
        mimeType: mimeType,
        ...(folderId && { parents: [folderId] })
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      
      // Converte o conteúdo para Blob se necessário
      let fileBlob: Blob;
      if (fileContent instanceof Blob) {
        fileBlob = fileContent;
      } else if (fileContent instanceof ArrayBuffer) {
        fileBlob = new Blob([fileContent], { type: mimeType });
      } else {
        fileBlob = new Blob([fileContent], { type: mimeType });
      }
      
      form.append('file', fileBlob);

      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          body: form
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao fazer upload: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro no upload para Google Drive:', error);
      throw error;
    }
  }

  /**
   * Cria uma pasta no Google Drive
   */
  async createFolder(folderName: string, parentFolderId?: string): Promise<any> {
    try {
      const accessToken = await this.authenticate();

      const metadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        ...(parentFolderId && { parents: [parentFolderId] })
      };

      const response = await fetch(
        'https://www.googleapis.com/drive/v3/files',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(metadata)
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao criar pasta: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar pasta no Google Drive:', error);
      throw error;
    }
  }

  /**
   * Busca uma pasta pelo nome
   */
  async findFolderByName(folderName: string, parentFolderId?: string): Promise<any> {
    try {
      const accessToken = await this.authenticate();

      let query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      if (parentFolderId) {
        query += ` and '${parentFolderId}' in parents`;
      }
      
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,parents)&spaces=drive`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao buscar pasta: ${response.statusText}`);
      }

      const data = await response.json();
      return data.files && data.files.length > 0 ? data.files[0] : null;
    } catch (error) {
      console.error('Erro ao buscar pasta no Google Drive:', error);
      throw error;
    }
  }

  /**
   * Busca uma estrutura de pastas aninhadas existente
   * @param folderPath Caminho da pasta separado por / (ex: "Roteamentos/Planilhas Excel/Listas de atendimento")
   * @returns ID da pasta final
   */
  async findOrCreateFolderPath(folderPath: string): Promise<string> {
    try {
      const folders = folderPath.split('/').map(f => f.trim()).filter(f => f);
      let currentParentId: string | undefined = undefined;

      for (let i = 0; i < folders.length; i++) {
        const folderName = folders[i];
        const folder = await this.findFolderByName(folderName, currentParentId);
        
        if (!folder) {
          const pathSoFar = folders.slice(0, i + 1).join('/');
          throw new Error(`Pasta não encontrada: "${pathSoFar}". Por favor, verifique se a estrutura de pastas existe no Google Drive.`);
        }
        
        currentParentId = folder.id;
      }

      return currentParentId!;
    } catch (error) {
      console.error('Erro ao buscar estrutura de pastas:', error);
      throw error;
    }
  }

  /**
   * Compartilha um arquivo com um email específico
   */
  async shareFileWithEmail(fileId: string, email: string, role: 'reader' | 'writer' | 'owner' = 'writer'): Promise<any> {
    try {
      const accessToken = await this.authenticate();

      const permission = {
        type: 'user',
        role: role,
        emailAddress: email
      };

      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(permission)
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao compartilhar arquivo: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao compartilhar arquivo:', error);
      throw error;
    }
  }

  /**
   * Limpa o token armazenado (útil para logout ou troca de conta)
   */
  clearToken(): void {
    this.accessToken = null;
    this.tokenExpiry = null;
  }
}
