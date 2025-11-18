# 🔧 Configuração do Firebase Storage - Correção de Permissões

## 🚨 Problema Identificado

Erro: `Firebase Storage: User does not have permission to access 'enderecos_geocodificados/por_turno/...' (storage/unauthorized)`

**Causa**: As regras de segurança do Firebase Storage estão bloqueando operações porque não há autenticação configurada.

---

## ✅ Solução Rápida (Desenvolvimento)

### Passo 1: Fazer deploy das regras de Storage

Execute o comando abaixo para fazer deploy das regras de segurança:

```bash
firebase deploy --only storage
```

### Passo 2: Verificar no Console do Firebase

1. Acesse: https://console.firebase.google.com
2. Selecione seu projeto
3. Vá em **Storage** → **Rules**
4. Verifique se as regras foram atualizadas

---

## 🔒 Configuração para Produção (Recomendado)

### Opção A: Manter acesso público apenas para leitura

Edite o arquivo `storage.rules` e use:

```
match /enderecos_geocodificados/{allPaths=**} {
  allow read: if true;  // Qualquer um pode ler
  allow write: if request.auth != null;  // Apenas autenticados podem escrever
}
```

### Opção B: Implementar autenticação completa

1. **Instalar Firebase Auth**:
```bash
npm install @angular/fire
```

2. **Configurar no app.config.ts**:
```typescript
import { provideAuth, getAuth } from '@angular/fire/auth';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... outros providers
    provideAuth(() => getAuth()),
  ]
};
```

3. **Criar serviço de autenticação**:
```bash
ng generate service services/auth
```

4. **Atualizar storage.rules**:
```
match /enderecos_geocodificados/{allPaths=**} {
  allow read, write: if request.auth != null;
}
```

---

## 🧪 Testar as Regras

Após fazer deploy, teste:

1. **Listar arquivos**: Deve funcionar
2. **Upload de arquivo**: Deve funcionar
3. **Deletar arquivo/pasta**: Deve funcionar

---

## 📝 Comandos Úteis

```bash
# Deploy apenas das regras de Storage
firebase deploy --only storage

# Ver logs do Firebase
firebase functions:log

# Testar regras localmente (requer emulador)
firebase emulators:start --only storage
```

---

## ⚠️ Importante

- **Desenvolvimento**: Use `allow read, write: if true;` (já configurado no arquivo)
- **Produção**: Sempre use autenticação (`if request.auth != null`)
- Faça backup das regras antes de modificá-las no console

---

## 🆘 Problemas Comuns

### Erro persiste após deploy
- Aguarde 1-2 minutos para propagação
- Limpe o cache do navegador (Ctrl+Shift+Delete)
- Verifique se está usando o projeto correto: `firebase use`

### Não consegue fazer deploy
- Faça login: `firebase login`
- Verifique o projeto: `firebase projects:list`
- Selecione o projeto: `firebase use <project-id>`
