# Geocodificador de Endereços

Aplicativo Angular para geocodificação de endereços a partir de arquivos Excel, utilizando a API do Google Maps.

## 📋 Funcionalidades

- ✅ Upload de arquivo Excel (.xlsx)
- ✅ Conversão automática de Excel para JSON
- ✅ Geocodificação de endereços via Google Maps API
- ✅ Visualização de resultados em tabela
- ✅ Exportação de dados com coordenadas em CSV
- ✅ **Gerenciamento de Mapas** com Firestore
- ✅ Interface moderna com Bootstrap
- ✅ Deploy no Firebase Hosting

## 🚀 Tecnologias

- Angular 20.1.0
- Bootstrap 5
- TypeScript
- Google Maps Geocoding API
- Firebase Hosting
- **Firestore Database** (gerenciamento de mapas)
- Bibliotecas: xlsx, file-saver, @angular/fire

## 📦 Instalação

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar API Keys e Firebase

#### 2.1. Google Maps API Key

1. Obtenha uma API Key do Google Maps:
   - Acesse o [Google Cloud Console](https://console.cloud.google.com/)
   - Crie um projeto ou selecione um existente
   - Ative a API "Geocoding API"
   - Crie uma credencial (API Key)

#### 2.2. Firebase (Firestore)

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative o **Firestore Database**
3. Registre um app Web e copie as credenciais

📖 **Guia detalhado**: Veja [CONFIGURACAO_FIRESTORE.md](CONFIGURACAO_FIRESTORE.md)

#### 2.3. Configurar Environments

Copie o arquivo de exemplo:
```bash
cp src/environments/environment.example.ts src/environments/environment.ts
cp src/environments/environment.example.ts src/environments/environment.prod.ts
```

Edite os arquivos `src/environments/environment.ts` e `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: false, // true para environment.prod.ts
  googleMapsApiKey: 'SUA_GOOGLE_MAPS_API_KEY',
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

⚠️ **IMPORTANTE**: Os arquivos `environment.ts` e `environment.prod.ts` estão no `.gitignore` para proteger suas credenciais. Nunca faça commit desses arquivos!

## 💻 Desenvolvimento Local

Inicie o servidor de desenvolvimento:

```bash
npm start
```

ou

```bash
ng serve
```

Acesse `http://localhost:4200/` no navegador. A aplicação recarrega automaticamente quando você modifica os arquivos.

## 📝 Como Usar

### Geocodificação de Endereços

1. **Prepare o arquivo Excel**:
   - Crie um arquivo `.xlsx` com as colunas: `nome`, `endereco`, `turno`
   - Veja o arquivo `exemplo.csv` como referência (você pode convertê-lo para .xlsx)

2. **Faça o upload**:
   - Na página inicial, clique em "Escolher arquivo" e selecione seu arquivo Excel
   - O app automaticamente lerá e processará os dados

3. **Aguarde a geocodificação**:
   - O app buscará as coordenadas de cada endereço
   - Você verá o progresso em tempo real

4. **Visualize os resultados**:
   - Uma tabela mostrará todos os endereços com suas coordenadas
   - Status de sucesso/erro para cada endereço

5. **Exporte os dados**:
   - Clique em "Exportar CSV" para baixar o arquivo com as coordenadas

### Gerenciamento de Mapas (Novo! 🗺️)

1. **Acessar a página de mapas**:
   - Clique em "Meus Mapas" no menu de navegação

2. **Adicionar um novo mapa**:
   - Clique em "Novo Mapa"
   - Preencha os campos:
     - **Nome do Mapa**: Ex: "Mapa de Entregas SP"
     - **URL do Mapa**: Cole a URL do Google My Maps
     - **Empresa Cliente**: Nome do cliente
     - **Empresa Cotante**: Nome da empresa que faz a cotação
   - Clique em "Salvar"

3. **Visualizar mapas salvos**:
   - Todos os mapas aparecem em cards com informações
   - Data de criação é exibida automaticamente

4. **Abrir um mapa**:
   - Clique no botão "Abrir" para abrir o mapa em nova aba

5. **Editar um mapa**:
   - Clique no ícone de lápis para editar as informações

6. **Deletar um mapa**:
   - Clique no ícone de lixeira e confirme a exclusão

## 🏗️ Build para Produção

Para compilar o projeto para produção:

```bash
npm run build
```

ou

```bash
ng build --configuration production
```

Os arquivos compilados estarão em `dist/roteamento/browser/`.

## 🔥 Deploy no Firebase Hosting

### 1. Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login no Firebase

```bash
firebase login
```

### 3. Inicializar Firebase (se necessário)

Se você ainda não configurou o Firebase no projeto:

```bash
firebase init hosting
```

Selecione:
- Use an existing project ou Create a new project
- Public directory: `dist/roteamento/browser`
- Configure as a single-page app: `Yes`
- Set up automatic builds and deploys with GitHub: `No` (ou Yes se preferir)

### 4. Editar .firebaserc

Edite o arquivo `.firebaserc` e substitua `"seu-projeto-firebase"` pelo ID do seu projeto Firebase:

```json
{
  "projects": {
    "default": "seu-projeto-firebase-id"
  }
}
```

### 5. Build e Deploy

```bash
npm run build
firebase deploy
```

Ou em um único comando:

```bash
ng build --configuration production && firebase deploy
```

Após o deploy, você receberá a URL do seu app hospedado no Firebase!

## 📂 Estrutura do Projeto

```
src/
├── app/
│   ├── models/
│   │   └── address.model.ts          # Interfaces e tipos
│   ├── services/
│   │   └── google-geocode.service.ts # Service de geocodificação
│   ├── app.ts                         # Componente principal
│   ├── app.html                       # Template HTML
│   ├── app.css                        # Estilos do componente
│   ├── app.config.ts                  # Configuração do app
│   └── app.routes.ts                  # Rotas
├── environments/
│   ├── environment.example.ts         # Exemplo de configuração
│   ├── environment.ts                 # Config desenvolvimento (gitignored)
│   └── environment.prod.ts            # Config produção (gitignored)
└── styles.css                         # Estilos globais
```

## 🔒 Segurança

### Proteção de API Keys

- ✅ **API Keys protegidas**: Armazenadas em arquivos de environment
- ✅ **Arquivos no .gitignore**: `environment.ts` e `environment.prod.ts` NÃO serão commitados
- ✅ **Arquivo de exemplo**: Use `environment.example.ts` como template
- ✅ **Nunca commite credenciais**: As chaves permanecem apenas na sua máquina local

### Script de Verificação

Execute o script de verificação para garantir que suas chaves estão seguras:

```bash
./verificar-seguranca.sh
```

Este script verifica:
- ✅ Se os arquivos sensíveis estão no `.gitignore`
- ✅ Se os arquivos não estão sendo rastreados pelo Git
- ✅ Se não há arquivos sensíveis staged para commit

### Boas Práticas

1. **Restrinja sua API Key** no Google Cloud Console:
   - Limite por domínio (produção)
   - Limite por IP (desenvolvimento)
   - Ative apenas as APIs necessárias

2. **Se expor acidentalmente**:
   - Revogue a chave imediatamente no Google Cloud Console
   - Gere uma nova chave
   - Nunca reutilize chaves expostas

3. **Para produção**:
   - Use variáveis de ambiente do servidor
   - Configure Firebase App Check
   - Implemente rate limiting

📖 **Guia completo**: Veja [SEGURANCA_API_KEYS.md](SEGURANCA_API_KEYS.md)

## 🐛 Solução de Problemas

### Erro de CORS
Se você receber erros de CORS, verifique se a API Key está configurada corretamente e se a API Geocoding está ativada no Google Cloud Console.

### Limite de requisições
A API do Google Maps tem limites de uso. Para produção, considere:
- Adicionar billing no Google Cloud
- Implementar cache de coordenadas
- Adicionar rate limiting

### Arquivo não é lido
Certifique-se de que:
- O arquivo é `.xlsx` (não `.xls` ou `.csv`)
- As colunas têm exatamente os nomes: `nome`, `endereco`, `turno`
- O arquivo não está vazio

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

---

Desenvolvido com ❤️ usando Angular e Firebase
# pegons-app-roteamentos
