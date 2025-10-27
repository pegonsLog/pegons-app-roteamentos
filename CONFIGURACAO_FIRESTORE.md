# 🔥 Configuração do Firebase e Firestore

## Passo a Passo Completo

### 1. Criar Projeto no Firebase Console

1. Acesse https://console.firebase.google.com/
2. Clique em "Adicionar projeto"
3. Dê um nome ao projeto (ex: `geocodificador-enderecos`)
4. Desabilite o Google Analytics (opcional)
5. Clique em "Criar projeto"

### 2. Adicionar App Web ao Projeto

1. No painel do projeto, clique no ícone **</>** (Web)
2. Registre o app com um apelido (ex: "Geocodificador Web")
3. **NÃO** marque "Firebase Hosting" (já configuramos)
4. Clique em "Registrar app"
5. **COPIE** as configurações do Firebase que aparecem:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 3. Ativar o Firestore Database

1. No menu lateral, clique em **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Escolha o modo:
   - **Modo de produção**: Requer regras de segurança
   - **Modo de teste**: Permite leitura/escrita por 30 dias (recomendado para desenvolvimento)
4. Escolha a localização (ex: `southamerica-east1` para São Paulo)
5. Clique em "Ativar"

### 4. Configurar Regras de Segurança (Importante!)

No Firestore, vá em **"Regras"** e configure:

#### Para Desenvolvimento (30 dias):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 12, 31);
    }
  }
}
```

#### Para Produção (com autenticação):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /mapas/{mapaId} {
      allow read: if true;  // Qualquer um pode ler
      allow write: if request.auth != null;  // Apenas usuários autenticados podem escrever
    }
  }
}
```

### 5. Configurar o App Angular

#### 5.1. Atualizar environment.ts

Edite `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  googleMapsApiKey: 'SUA_GOOGLE_MAPS_API_KEY',
  firebase: {
    apiKey: 'AIza...',  // Cole aqui
    authDomain: 'seu-projeto.firebaseapp.com',
    projectId: 'seu-projeto-id',
    storageBucket: 'seu-projeto.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123456789:web:abc123'
  }
};
```

#### 5.2. Atualizar environment.prod.ts

Edite `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,  // Importante: true para produção
  googleMapsApiKey: 'SUA_GOOGLE_MAPS_API_KEY',
  firebase: {
    apiKey: 'AIza...',  // Mesmas credenciais
    authDomain: 'seu-projeto.firebaseapp.com',
    projectId: 'seu-projeto-id',
    storageBucket: 'seu-projeto.appspot.com',
    messagingSenderId: '123456789',
    appId: '1:123456789:web:abc123'
  }
};
```

### 6. Testar a Conexão

1. Inicie o servidor: `npm start`
2. Acesse: http://localhost:4200/mapas
3. Tente adicionar um novo mapa
4. Verifique no Firebase Console se o documento foi criado

## 📊 Estrutura de Dados no Firestore

### Coleção: `mapas`

Cada documento terá a seguinte estrutura:

```json
{
  "nomeMapa": "Mapa de Entregas SP",
  "urlMapa": "https://www.google.com/maps/d/...",
  "empresaCliente": "Empresa ABC Ltda",
  "empresaCotante": "Transportadora XYZ",
  "dataCriacao": "2025-10-25T18:00:00.000Z",
  "dataAtualizacao": "2025-10-25T18:00:00.000Z"
}
```

## 🔒 Segurança

### ⚠️ IMPORTANTE

1. **Nunca** commite os arquivos `environment.ts` e `environment.prod.ts` com credenciais reais
2. Os arquivos já estão no `.gitignore`
3. Use o `environment.example.ts` como referência

### Restrições de API Key (Recomendado)

No Firebase Console:

1. Vá em **"Configurações do projeto"** > **"Geral"**
2. Role até **"Seus apps"**
3. Clique no ícone de configurações do app web
4. Em **"Restrições de API"**, configure:
   - Domínios autorizados (ex: `localhost`, `seu-dominio.com`)
   - APIs permitidas (Firestore, etc.)

## 🧪 Testando o Firestore

### Adicionar Dados Manualmente

1. No Firebase Console, vá em **"Firestore Database"**
2. Clique em **"Iniciar coleção"**
3. ID da coleção: `mapas`
4. Adicione um documento de teste:
   - Campo: `nomeMapa` | Tipo: string | Valor: "Teste"
   - Campo: `urlMapa` | Tipo: string | Valor: "https://google.com"
   - Campo: `empresaCliente` | Tipo: string | Valor: "Cliente Teste"
   - Campo: `empresaCotante` | Tipo: string | Valor: "Cotante Teste"

### Verificar no App

1. Acesse http://localhost:4200/mapas
2. O documento de teste deve aparecer na lista

## 🚀 Deploy

Quando fizer deploy no Firebase Hosting, o Firestore já estará configurado automaticamente, pois ambos fazem parte do mesmo projeto Firebase.

## 🐛 Solução de Problemas

### Erro: "Missing or insufficient permissions"
- Verifique as regras de segurança no Firestore
- Certifique-se de que está no modo de teste ou com regras adequadas

### Erro: "Firebase: No Firebase App '[DEFAULT]' has been created"
- Verifique se o `environment.ts` tem a configuração `firebase`
- Verifique se o `app.config.ts` está importando corretamente

### Dados não aparecem
- Verifique o console do navegador para erros
- Verifique se a coleção `mapas` existe no Firestore
- Verifique as regras de segurança

### Erro de CORS
- Firestore não tem problemas de CORS
- Se ocorrer, verifique a configuração do Firebase

## 📚 Recursos Adicionais

- [Documentação do Firestore](https://firebase.google.com/docs/firestore)
- [Regras de Segurança](https://firebase.google.com/docs/firestore/security/get-started)
- [Angular Fire](https://github.com/angular/angularfire)

## ✅ Checklist de Configuração

- [ ] Projeto Firebase criado
- [ ] App Web registrado no Firebase
- [ ] Firestore Database ativado
- [ ] Regras de segurança configuradas
- [ ] Credenciais copiadas
- [ ] `environment.ts` atualizado
- [ ] `environment.prod.ts` atualizado
- [ ] App testado localmente
- [ ] Dados aparecem na lista de mapas
