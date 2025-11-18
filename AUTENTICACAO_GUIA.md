# 🔐 Guia de Autenticação Firebase

## 📋 Resposta à sua pergunta

**"Quando eu fizer o deploy, como vou autenticar para poder excluir pasta no storage?"**

### ✅ Situação Atual (Após Deploy)

Com as regras atuais em `storage.rules`:
```
allow read, write: if true;
```

✅ **Você NÃO precisa autenticar** - qualquer pessoa pode deletar
⚠️ **Isso é inseguro para produção!**

---

## 🎯 Opções de Configuração

### **Opção 1: Manter Sem Autenticação (Atual)**

**Quando usar**: Desenvolvimento, app interno, ambiente controlado

**Prós**:
- ✅ Funciona imediatamente após deploy
- ✅ Sem necessidade de login
- ✅ Mais simples

**Contras**:
- ⚠️ Qualquer pessoa pode deletar arquivos
- ⚠️ Sem controle de acesso
- ⚠️ Inseguro para produção

**Nenhuma ação necessária** - já está funcionando!

---

### **Opção 2: Implementar Autenticação (Recomendado)**

**Quando usar**: Produção, múltiplos usuários, dados sensíveis

#### Passo 1: Ativar Autenticação no Firebase Console

1. Acesse: https://console.firebase.google.com
2. Selecione seu projeto: **pegons-app-roteamentos**
3. Vá em **Authentication** → **Get Started**
4. Ative os métodos de login:
   - ✅ **Email/Password**
   - ✅ **Google** (recomendado)

#### Passo 2: Criar Usuário Administrador

No Firebase Console → Authentication → Users:
- Clique em **Add User**
- Digite seu email e senha
- Salve

#### Passo 3: Atualizar Regras do Storage

Edite `storage.rules`:

```
match /enderecos_geocodificados/{allPaths=**} {
  // Comentar a linha de acesso público
  // allow read, write: if true;
  
  // Descomentar para exigir autenticação
  allow read, write: if request.auth != null;
}
```

Depois faça deploy:
```bash
firebase deploy --only storage
```

#### Passo 4: Adicionar Rota de Login

Edite `src/app/app.routes.ts`:

```typescript
import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  // ... suas outras rotas
];
```

#### Passo 5: Proteger Componentes

No componente principal, adicione verificação de autenticação:

```typescript
import { AuthService } from './services/auth.service';

export class SeuComponente {
  constructor(public authService: AuthService) {}
  
  // Mostrar botão de deletar apenas se autenticado
  canDelete(): boolean {
    return this.authService.isAuthenticated();
  }
}
```

No template:
```html
@if (authService.isAuthenticated()) {
  <button (click)="deleteFolder()">🗑️ Deletar</button>
} @else {
  <a routerLink="/login">🔐 Faça login para deletar</a>
}
```

---

## 🚀 Como Usar Após Deploy

### **Com Autenticação Desabilitada (Atual)**

1. Acesse seu app: `https://seu-app.web.app`
2. Use normalmente - pode deletar sem login

### **Com Autenticação Habilitada**

1. Acesse: `https://seu-app.web.app/login`
2. Faça login com:
   - Email/senha cadastrado no Firebase
   - OU conta Google
3. Após login, pode deletar normalmente

---

## 🔄 Fluxo Completo com Autenticação

```
1. Usuário acessa o app
   ↓
2. Tenta deletar pasta
   ↓
3. Sistema verifica: está autenticado?
   ├─ SIM → Permite deletar ✅
   └─ NÃO → Redireciona para /login ❌
      ↓
   4. Usuário faz login
      ↓
   5. Firebase valida credenciais
      ↓
   6. Usuário autenticado pode deletar ✅
```

---

## 🧪 Testar Localmente

```bash
# Inicie o servidor de desenvolvimento
ng serve

# Acesse
http://localhost:4200/login

# Teste login com usuário criado no Firebase Console
```

---

## 📝 Comandos Úteis

```bash
# Ver usuários cadastrados
firebase auth:export users.json

# Fazer deploy completo
firebase deploy

# Fazer deploy apenas das regras
firebase deploy --only storage

# Ver logs de autenticação
firebase functions:log
```

---

## ⚠️ Importante

### Para Desenvolvimento
- Use `allow read, write: if true;` (atual)
- Não precisa login

### Para Produção
- Use `allow read, write: if request.auth != null;`
- Crie usuários no Firebase Console
- Implemente tela de login

---

## 🆘 Problemas Comuns

### "Não consigo deletar após deploy"
- Verifique se as regras foram atualizadas: `firebase deploy --only storage`
- Aguarde 1-2 minutos para propagação

### "Erro de autenticação"
- Verifique se o método de login está ativo no Console
- Confirme que o usuário existe em Authentication → Users

### "Login não funciona"
- Verifique se `provideAuth` está em `app.config.ts`
- Confirme que a rota `/login` existe em `app.routes.ts`

---

## 📚 Próximos Passos

1. **Agora**: Use sem autenticação (já funciona)
2. **Depois**: Implemente autenticação seguindo este guia
3. **Produção**: Sempre use autenticação!
