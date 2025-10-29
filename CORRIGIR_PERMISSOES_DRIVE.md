# Corrigir Permissões do Google Drive

## Problema
O scope atual `drive.file` só permite acesso a arquivos criados pela aplicação, não permite buscar pastas existentes.

## Solução

### 1. Atualizar o arquivo `environment.ts`

Abra o arquivo `src/environments/environment.ts` e altere o scope:

**ANTES:**
```typescript
scopes: 'https://www.googleapis.com/auth/drive.file',
```

**DEPOIS:**
```typescript
scopes: 'https://www.googleapis.com/auth/drive',
```

### 2. Atualizar também o `environment.prod.ts` (se existir)

Faça a mesma alteração no arquivo de produção.

### 3. Limpar o token armazenado

Como você já fez login com o scope antigo, precisa limpar o token:

1. Abra o Console do navegador (F12)
2. Execute no console:
```javascript
localStorage.clear();
sessionStorage.clear();
```

3. Ou simplesmente faça logout e login novamente na aplicação

### 4. Atualizar as credenciais no Google Cloud Console (se necessário)

1. Acesse: https://console.cloud.google.com/apis/credentials
2. Encontre seu OAuth 2.0 Client ID
3. Verifique se os escopos autorizados incluem `https://www.googleapis.com/auth/drive`

### 5. Testar novamente

1. Recarregue a aplicação
2. Faça login novamente (vai pedir permissões novamente)
3. Aceite as novas permissões
4. Tente fazer o upload do KML e salvar no Drive

## Scopes disponíveis

- `drive.file` - Acesso apenas a arquivos criados pela app ❌ (atual)
- `drive` - Acesso completo ao Drive ✅ (recomendado)
- `drive.readonly` - Acesso somente leitura
- `drive.metadata.readonly` - Acesso somente aos metadados

## Observação de Segurança

O scope `drive` dá acesso completo ao Google Drive do usuário. Certifique-se de:
- Usar apenas para operações necessárias
- Informar claramente aos usuários sobre as permissões
- Seguir as melhores práticas de segurança
