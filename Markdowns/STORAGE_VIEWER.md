# Visualizador de Arquivos - Firebase Storage

## Descrição

Componente completo para visualizar, fazer upload e gerenciar arquivos armazenados no Firebase Storage.

## Funcionalidades

### 1. Navegação de Diretórios
- Visualização de pastas e arquivos
- Navegação hierárquica entre diretórios
- Botão para voltar à pasta anterior
- Botão para ir direto à raiz
- Exibição do caminho atual

### 2. Upload de Arquivos
- Interface intuitiva para selecionar arquivos
- Upload para o diretório atual
- Feedback visual durante o upload
- Exibição do nome e tamanho do arquivo selecionado

### 3. Visualização de Arquivos
- Lista de arquivos em formato de tabela
- Ícones coloridos baseados no tipo de arquivo
- Informações detalhadas:
  - Nome do arquivo
  - Tamanho formatado
  - Tipo de conteúdo
  - Data de criação
  - Caminho completo

### 4. Ações sobre Arquivos
- **Abrir**: Abre o arquivo em uma nova aba
- **Baixar**: Faz download do arquivo
- **Deletar**: Remove o arquivo (com confirmação)

### 5. Visualização de Pastas
- Cards visuais para cada pasta
- Efeito hover com animação
- Clique para navegar para dentro da pasta

## Arquivos Criados

### 1. Serviço: `firebase-storage.service.ts`
Localização: `/src/app/services/firebase-storage.service.ts`

**Métodos principais:**
- `listFiles(path)`: Lista arquivos e pastas em um caminho
- `uploadFile(file, path)`: Faz upload de um arquivo
- `deleteFile(fullPath)`: Deleta um arquivo
- `getDownloadURL(fullPath)`: Obtém URL de download
- `formatFileSize(bytes)`: Formata tamanho em formato legível
- `getFileIcon(contentType)`: Retorna ícone baseado no tipo

### 2. Componente: `storage-viewer.component.ts`
Localização: `/src/app/components/storage-viewer/storage-viewer.component.ts`

**Propriedades:**
- `files`: Array de arquivos do diretório atual
- `folders`: Array de pastas do diretório atual
- `currentPath`: Caminho atual
- `pathHistory`: Histórico de navegação
- `loading`: Estado de carregamento
- `error`: Mensagem de erro
- `selectedFile`: Arquivo selecionado para upload
- `uploading`: Estado de upload

### 3. Template: `storage-viewer.component.html`
Localização: `/src/app/components/storage-viewer/storage-viewer.component.html`

Interface completa com:
- Barra de navegação
- Área de upload
- Lista de pastas (cards)
- Tabela de arquivos
- Mensagens de erro e loading

### 4. Estilos: `storage-viewer.component.css`
Localização: `/src/app/components/storage-viewer/storage-viewer.component.css`

Estilos modernos com:
- Gradientes para cards de pastas
- Animações de hover
- Ícones coloridos por tipo de arquivo
- Design responsivo
- Animações de fade-in

## Configuração

### 1. Provedor do Firebase Storage
O provedor foi adicionado em `app.config.ts`:

```typescript
import { provideStorage, getStorage } from '@angular/fire/storage';

providers: [
  // ... outros provedores
  provideStorage(() => getStorage())
]
```

### 2. Rota
Adicionada em `app.routes.ts`:

```typescript
{ path: 'storage', component: StorageViewerComponent }
```

### 3. Menu de Navegação
Link adicionado no menu principal em `app.html`:

```html
<li class="nav-item">
  <a class="nav-link nav-link-modern" routerLink="/storage" routerLinkActive="active">
    <i class="bi bi-cloud-arrow-up-fill"></i>
    <span>Arquivos Storage</span>
  </a>
</li>
```

## Como Usar

### Acessar o Componente
Navegue para `/storage` ou clique no menu "Arquivos Storage"

### Fazer Upload
1. Clique no botão de seleção de arquivo
2. Escolha um arquivo do seu computador
3. Clique em "Enviar"
4. Aguarde a confirmação

### Navegar entre Pastas
1. Clique em qualquer card de pasta para entrar
2. Use o botão "Voltar" para retornar
3. Use o ícone de casa para ir à raiz

### Gerenciar Arquivos
- **Visualizar**: Clique no ícone de olho
- **Baixar**: Clique no ícone de download
- **Deletar**: Clique no ícone de lixeira (confirme a ação)

## Tipos de Arquivo Suportados

O componente identifica e exibe ícones específicos para:
- 📷 Imagens (image/*)
- 📄 PDF (application/pdf)
- 🎥 Vídeos (video/*)
- 🎵 Áudio (audio/*)
- 📝 Texto (text/*)
- 📊 Planilhas (spreadsheet/excel)
- 📃 Documentos Word (word/document)
- 🗜️ Arquivos compactados (zip/compressed)
- 📁 Outros arquivos

## Segurança

### Regras do Firebase Storage
Certifique-se de configurar as regras de segurança no Firebase Console:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // Permite leitura e escrita apenas para usuários autenticados
      allow read, write: if request.auth != null;
      
      // OU permite acesso público (não recomendado para produção)
      // allow read, write: if true;
    }
  }
}
```

## Dependências

- `@angular/fire`: ^20.0.1
- `firebase`: ^11.10.0
- `bootstrap`: ^5.3.8
- `bootstrap-icons`: ^1.13.1

## Melhorias Futuras

Possíveis melhorias para implementar:
- [ ] Busca de arquivos por nome
- [ ] Filtros por tipo de arquivo
- [ ] Ordenação (nome, data, tamanho)
- [ ] Visualização em grid/lista
- [ ] Upload múltiplo de arquivos
- [ ] Drag and drop para upload
- [ ] Preview de imagens inline
- [ ] Criação de novas pastas
- [ ] Renomear arquivos
- [ ] Mover arquivos entre pastas
- [ ] Compartilhamento de links
- [ ] Controle de permissões

## Troubleshooting

### Erro: "Access Denied"
- Verifique as regras de segurança do Firebase Storage
- Certifique-se de que o usuário está autenticado (se necessário)

### Arquivos não aparecem
- Verifique se há arquivos no Storage pelo Firebase Console
- Confirme que o storageBucket está configurado corretamente no environment

### Upload falha
- Verifique o tamanho máximo permitido
- Confirme as regras de escrita no Firebase
- Verifique a conexão com a internet

## Suporte

Para mais informações sobre Firebase Storage:
- [Documentação Firebase Storage](https://firebase.google.com/docs/storage)
- [Angular Fire Storage](https://github.com/angular/angularfire/blob/master/docs/storage.md)
