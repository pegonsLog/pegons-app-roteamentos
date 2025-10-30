# 🔥 Configuração do Firebase Hosting

## Passo a passo completo para deploy

### 1. Criar projeto no Firebase

1. Acesse https://console.firebase.google.com/
2. Clique em "Adicionar projeto"
3. Dê um nome ao projeto (ex: `geocodificador-enderecos`)
4. Aceite os termos e crie o projeto
5. Anote o **Project ID** (você vai precisar dele)

### 2. Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

### 3. Fazer login no Firebase

```bash
firebase login
```

Isso abrirá o navegador para você fazer login com sua conta Google.

### 4. Configurar o projeto

Edite o arquivo `.firebaserc` na raiz do projeto:

```json
{
  "projects": {
    "default": "SEU_PROJECT_ID_AQUI"
  }
}
```

Substitua `SEU_PROJECT_ID_AQUI` pelo Project ID que você anotou no passo 1.

### 5. Build do projeto

```bash
npm run build
```

ou

```bash
ng build --configuration production
```

Isso criará a pasta `dist/roteamento/browser/` com os arquivos compilados.

### 6. Deploy

```bash
firebase deploy
```

Aguarde o processo de upload. Ao final, você verá algo como:

```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/seu-projeto/overview
Hosting URL: https://seu-projeto.web.app
```

### 7. Acessar o app

Abra a URL fornecida (ex: `https://seu-projeto.web.app`) no navegador!

## 🔄 Atualizações futuras

Sempre que fizer mudanças no código:

```bash
npm run build
firebase deploy
```

## 💡 Dicas

### Deploy rápido (um comando)
```bash
ng build --configuration production && firebase deploy
```

### Ver logs do Firebase
```bash
firebase hosting:channel:list
```

### Configurar domínio customizado
1. Acesse o Console do Firebase
2. Vá em Hosting
3. Clique em "Adicionar domínio personalizado"
4. Siga as instruções

## ⚙️ Arquivo firebase.json

O arquivo `firebase.json` já está configurado corretamente:

```json
{
  "hosting": {
    "public": "dist/roteamento/browser",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

Isso garante que:
- Os arquivos corretos sejam enviados
- O roteamento do Angular funcione corretamente
- Arquivos desnecessários sejam ignorados

## 🚨 Solução de problemas

### Erro: "No project active"
Execute: `firebase use --add` e selecione seu projeto

### Erro: "Permission denied"
Execute: `firebase login` novamente

### Erro: "Build failed"
Certifique-se de que o build local funciona: `npm run build`

### Página em branco após deploy
Verifique se o caminho em `firebase.json` está correto: `dist/roteamento/browser`
