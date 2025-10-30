# 🚀 Início Rápido

## Passos para começar a usar o app

### 1️⃣ Configurar a API Key do Google Maps

```bash
# Copie os arquivos de exemplo
cp src/environments/environment.example.ts src/environments/environment.ts
cp src/environments/environment.example.ts src/environments/environment.prod.ts
```

Edite `src/environments/environment.ts` e `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: false, // true para environment.prod.ts
  googleMapsApiKey: 'COLE_SUA_API_KEY_AQUI',
  firebase: {
    apiKey: 'SUA_FIREBASE_API_KEY',
    authDomain: 'seu-projeto.firebaseapp.com',
    projectId: 'seu-projeto-id',
    storageBucket: 'seu-projeto.appspot.com',
    messagingSenderId: '123456789',
    appId: 'seu-app-id'
  }
};
```

**Como obter a API Key:**
1. Acesse https://console.cloud.google.com/
2. Crie/selecione um projeto
3. Ative a "Geocoding API"
4. Crie uma credencial (API Key)
5. Copie a chave gerada

⚠️ **IMPORTANTE**: Os arquivos `environment.ts` e `environment.prod.ts` estão protegidos no `.gitignore` e NÃO serão enviados ao GitHub!

### 2️⃣ Iniciar o servidor de desenvolvimento

```bash
npm start
```

Acesse: http://localhost:4200/

### 3️⃣ Testar o app

1. Abra o arquivo `exemplo.csv` no Excel e salve como `.xlsx`
2. Faça upload do arquivo no app
3. Aguarde a geocodificação
4. Exporte o resultado em CSV

### 4️⃣ Deploy no Firebase (opcional)

```bash
# Instalar Firebase CLI (uma vez)
npm install -g firebase-tools

# Login
firebase login

# Editar .firebaserc com seu projeto Firebase
# Depois:
npm run build
firebase deploy
```

## 📝 Formato do Excel

Seu arquivo Excel deve ter estas colunas:

| nome | endereco | turno |
|------|----------|-------|
| João Silva | Av. Paulista 1578 - São Paulo - SP | Manhã |
| Maria Santos | Rua Augusta 2690 - São Paulo - SP | Tarde |

## ❓ Problemas?

Veja o arquivo `README.md` para documentação completa.
