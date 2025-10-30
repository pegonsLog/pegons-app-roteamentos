# Configuração do Google Drive API

Este guia explica como configurar a integração com o Google Drive para enviar arquivos KML automaticamente.

## Passo 1: Criar Projeto no Google Cloud Platform

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Clique em "Selecionar projeto" → "Novo projeto"
3. Dê um nome ao projeto (ex: "Pegons Roteamento")
4. Clique em "Criar"

## Passo 2: Ativar a API do Google Drive

1. No menu lateral, vá em "APIs e Serviços" → "Biblioteca"
2. Pesquise por "Google Drive API"
3. Clique em "Google Drive API"
4. Clique em "Ativar"

## Passo 3: Criar Credenciais OAuth 2.0

1. No menu lateral, vá em "APIs e Serviços" → "Credenciais"
2. Clique em "+ CRIAR CREDENCIAIS" → "ID do cliente OAuth"
3. Se solicitado, configure a tela de consentimento:
   - Tipo de usuário: Externo
   - Nome do aplicativo: "Pegons Roteamento"
   - E-mail de suporte: seu e-mail
   - Adicione o escopo: `https://www.googleapis.com/auth/drive.file`
4. Tipo de aplicativo: "Aplicativo da Web"
5. Nome: "Pegons Web Client"
6. URIs de redirecionamento autorizados:
   - `http://localhost:4200`
   - `http://localhost:4200/rotas` (se necessário)
   - Adicione também a URL de produção quando disponível
7. Clique em "Criar"
8. **Copie o Client ID** que será exibido

## Passo 4: Criar API Key

1. Ainda em "Credenciais", clique em "+ CRIAR CREDENCIAIS" → "Chave de API"
2. **Copie a API Key** gerada
3. (Opcional) Clique em "Restringir chave" para adicionar restrições de segurança:
   - Restrições de aplicativo: Referenciadores HTTP
   - Adicione: `http://localhost:4200/*`
   - Restrições de API: Selecione "Google Drive API"

## Passo 5: Configurar no Projeto

1. Abra o arquivo `src/environments/google-config.ts`
2. Substitua os valores:
   ```typescript
   export const GOOGLE_CONFIG = {
     CLIENT_ID: 'SEU_CLIENT_ID_AQUI.apps.googleusercontent.com',
     API_KEY: 'SUA_API_KEY_AQUI',
     SCOPES: 'https://www.googleapis.com/auth/drive.file',
     DISCOVERY_DOCS: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
   };
   ```

## Passo 6: Testar a Integração

1. Inicie o servidor de desenvolvimento: `ng serve`
2. Acesse `http://localhost:4200`
3. Vá para a página de "Calcular Rotas"
4. Calcule uma rota
5. Clique em "Exportar KML"
6. Você será solicitado a fazer login com sua conta Google
7. Autorize o aplicativo a acessar o Google Drive
8. O arquivo será enviado para a pasta "Rotas Pegons" no Google Drive
9. O arquivo será compartilhado automaticamente com `pegons.app@gmail.com`

## Funcionalidades

- ✅ Upload automático de arquivos KML para Google Drive
- ✅ Criação automática da pasta "Rotas Pegons"
- ✅ Compartilhamento automático com pegons.app@gmail.com
- ✅ Nome do arquivo inclui origem, destino e timestamp
- ✅ Autenticação OAuth 2.0 segura

## Segurança

- As credenciais são armazenadas apenas no arquivo de configuração local
- O token de acesso é temporário e gerenciado pelo Google
- Apenas o escopo `drive.file` é solicitado (acesso apenas aos arquivos criados pelo app)
- Não há acesso a outros arquivos do Google Drive do usuário

## Troubleshooting

### Erro: "Invalid Client ID"
- Verifique se o CLIENT_ID está correto no arquivo `google-config.ts`
- Certifique-se de que a URL está nos URIs de redirecionamento autorizados

### Erro: "Access Denied"
- Verifique se a API do Google Drive está ativada no projeto
- Confirme que os escopos estão configurados corretamente

### Erro: "Origin not allowed"
- Adicione a URL atual aos URIs de redirecionamento autorizados no Google Cloud Console

## Próximos Passos

Para produção:
1. Adicione a URL de produção aos URIs de redirecionamento
2. Configure variáveis de ambiente para as credenciais
3. Considere implementar um backend para gerenciar tokens de forma mais segura


