# Configuração Rápida do Google Drive

Como você já tem credenciais do Google Cloud e a API do Drive ativada, siga apenas estes passos:

## 1. Adicionar configurações ao environment.ts

Abra seu arquivo `src/environments/environment.ts` e adicione a seção `googleDrive`:

```typescript
export const environment = {
  production: false,
  googleMapsApiKey: 'SUA_API_KEY_EXISTENTE',
  
  // ADICIONE ESTA SEÇÃO:
  googleDrive: {
    clientId: 'SEU_CLIENT_ID.apps.googleusercontent.com',
    apiKey: 'SUA_API_KEY', // Pode usar a mesma do Google Maps
    scopes: 'https://www.googleapis.com/auth/drive.file',
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
  },
  
  firebase: {
    // suas configurações existentes do firebase
  }
};
```

## 2. Obter o Client ID (se ainda não tiver)

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione seu projeto
3. Vá em "APIs e Serviços" → "Credenciais"
4. Se já tiver um OAuth 2.0 Client ID:
   - Clique nele para editar
   - Adicione aos URIs de redirecionamento: `http://localhost:4200`
   - Copie o Client ID
5. Se não tiver, clique em "+ CRIAR CREDENCIAIS" → "ID do cliente OAuth"
   - Tipo: Aplicativo da Web
   - URIs de redirecionamento: `http://localhost:4200`
   - Copie o Client ID gerado

## 3. Atualizar environment.prod.ts

Faça o mesmo no arquivo `src/environments/environment.prod.ts`, mas com `production: true` e a URL de produção nos URIs de redirecionamento.

## 4. Testar

1. Reinicie o servidor: `ng serve`
2. Calcule uma rota
3. Clique em "Exportar KML"
4. Autorize o acesso ao Google Drive (primeira vez)
5. O arquivo será enviado para a pasta "Rotas Pegons" e compartilhado com pegons.app@gmail.com

## Pronto!

Agora os arquivos KML vão direto para o Google Drive ao invés de fazer download.
