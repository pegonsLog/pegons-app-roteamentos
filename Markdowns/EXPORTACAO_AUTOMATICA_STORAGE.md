# Exportação Automática para Firebase Storage

## Descrição

Os botões de exportação de CSV agora salvam os arquivos automaticamente em **3 locais**:
1. **Google Drive** - Na pasta "Endereços Geocodificados"
2. **Firebase Storage** - Na pasta "enderecos_geocodificados"
3. **Compartilhamento** - Com pegons.app@gmail.com

## Funcionalidades Implementadas

### 1. Exportar CSV (Todos)

**Botão:** "Exportar CSV (Todos)"

**O que faz:**
- Exporta todos os endereços geocodificados em um único arquivo CSV
- Salva no Google Drive (pasta com data/hora)
- **NOVO:** Salva no Firebase Storage em `enderecos_geocodificados/`
- Compartilha com pegons.app@gmail.com

**Estrutura no Storage:**
```
enderecos_geocodificados/
  └── enderecos_geocodificados_2025-11-16.csv
```

**Mensagem de sucesso:**
```
✅ Arquivo CSV enviado para o Google Drive e Firebase Storage com sucesso! 
   Compartilhado com pegons.app@gmail.com
```

### 2. Exportar por Turno

**Botão:** "Exportar por Turno"

**O que faz:**
- Exporta os endereços separados por turno (1, 2, 3, Adm, etc.)
- Cria um arquivo CSV para cada turno
- Salva no Google Drive (pasta com data/hora)
- **NOVO:** Salva no Firebase Storage em `enderecos_geocodificados/por_turno/`
- Compartilha todos os arquivos com pegons.app@gmail.com

**Estrutura no Storage:**
```
enderecos_geocodificados/
  └── por_turno/
      ├── enderecos_turno_1_2025-11-16.csv
      ├── enderecos_turno_2_2025-11-16.csv
      ├── enderecos_turno_3_2025-11-16.csv
      └── enderecos_turno_Adm_2025-11-16.csv
```

**Mensagem de sucesso:**
```
✅ 4 arquivo(s) CSV enviado(s) para o Google Drive e Firebase Storage com sucesso! 
   Compartilhados com pegons.app@gmail.com
```

## Fluxo de Exportação

### Exportar CSV (Todos)

```
1. Usuário clica em "Exportar CSV (Todos)"
   ↓
2. Valida se há endereços geocodificados
   ↓
3. Prepara dados para exportação
   ↓
4. Cria arquivo CSV
   ↓
5. Busca/cria pasta no Google Drive
   ↓
6. Upload para Google Drive
   ↓
7. Compartilha com pegons.app@gmail.com
   ↓
8. 🆕 Converte CSV para Blob/File
   ↓
9. 🆕 Upload para Firebase Storage
   ↓
10. Exibe mensagem de sucesso
```

### Exportar por Turno

```
1. Usuário clica em "Exportar por Turno"
   ↓
2. Valida se há endereços geocodificados
   ↓
3. Agrupa endereços por turno
   ↓
4. Para cada turno:
   ├─ Prepara dados
   ├─ Cria arquivo CSV
   ├─ Upload para Google Drive
   ├─ Compartilha com pegons.app@gmail.com
   ├─ 🆕 Converte CSV para Blob/File
   └─ 🆕 Upload para Firebase Storage
   ↓
5. Exibe mensagem de sucesso com total de arquivos
```

## Implementação Técnica

### Modificações no `app.ts`

#### 1. Import do Serviço
```typescript
import { FirebaseStorageService } from './services/firebase-storage.service';
```

#### 2. Injeção no Construtor
```typescript
constructor(
  private geocodeService: GoogleGeocodeService,
  private driveService: GoogleDriveService,
  private firestoreService: FirestoreDataService,
  private storageService: FirebaseStorageService, // 🆕
  private router: Router
) { }
```

#### 3. Método `exportToCSV()` - Adicionado
```typescript
// Após upload no Drive e compartilhamento...

// Salva também no Firebase Storage
this.loadingMessage.set('☁️ Salvando no Firebase Storage...');
try {
  // Converte CSV para Blob
  const blob = new Blob([csvOutput], { type: 'text/csv' });
  const csvFile = new File([blob], fileName, { type: 'text/csv' });
  
  // Upload para o Storage
  await this.storageService.uploadFile(csvFile, 'enderecos_geocodificados');
  
  this.successMessage.set('✅ Arquivo CSV enviado para o Google Drive e Firebase Storage...');
} catch (storageError: any) {
  console.error('Erro ao salvar no Storage:', storageError);
  this.successMessage.set('✅ Arquivo CSV enviado para o Google Drive com sucesso! (Erro ao salvar no Storage)');
}
```

#### 4. Método `exportToCSVByShift()` - Adicionado
```typescript
// Dentro do loop de cada turno, após upload no Drive...

// Salva também no Firebase Storage
this.loadingMessage.set(`☁️ Salvando turno ${turno} no Firebase Storage...`);
try {
  const blob = new Blob([csvOutput], { type: 'text/csv' });
  const csvFile = new File([blob], fileName, { type: 'text/csv' });
  
  await this.storageService.uploadFile(csvFile, 'enderecos_geocodificados/por_turno');
} catch (storageError: any) {
  console.error(`Erro ao salvar turno ${turno} no Storage:`, storageError);
}
```

## Tratamento de Erros

### Erro no Storage (Não Crítico)

Se o upload para o Firebase Storage falhar:
- ✅ O processo continua normalmente
- ✅ O arquivo é salvo no Google Drive
- ✅ O compartilhamento é feito
- ⚠️ Mensagem indica que houve erro no Storage
- 📝 Erro é logado no console

**Mensagem alternativa:**
```
✅ Arquivo CSV enviado para o Google Drive com sucesso! 
   (Erro ao salvar no Storage)
```

### Erro no Drive (Crítico)

Se o upload para o Google Drive falhar:
- ❌ O processo é interrompido
- ❌ Não tenta salvar no Storage
- ❌ Exibe mensagem de erro
- 📝 Erro é logado no console

**Mensagem de erro:**
```
❌ Erro ao enviar para Google Drive: [mensagem do erro]
```

## Feedback Visual

### Loading Messages

Durante o processo, o usuário vê:

1. **Preparando dados:**
   - Spinner de loading ativo
   - Barra de progresso (se aplicável)

2. **Enviando para Drive:**
   - "Enviando para Google Drive..."

3. **Salvando no Storage:**
   - "☁️ Salvando no Firebase Storage..."
   - Para múltiplos turnos: "☁️ Salvando turno 1 no Firebase Storage..."

### Success Messages

- Mensagem verde com ícone ✅
- Desaparece automaticamente após 5 segundos
- Indica ambos os destinos (Drive e Storage)

## Vantagens

### 1. Backup Redundante
- ✅ Arquivos em 2 locais diferentes
- ✅ Maior segurança dos dados
- ✅ Recuperação facilitada

### 2. Acesso Facilitado
- ✅ Visualização pelo Storage Viewer (`/storage`)
- ✅ Acesso pelo Google Drive
- ✅ Compartilhamento automático

### 3. Organização
- ✅ Estrutura de pastas clara
- ✅ Separação por tipo (todos vs por turno)
- ✅ Nomenclatura padronizada com timestamp

### 4. Transparência
- ✅ Usuário é informado de ambos os uploads
- ✅ Feedback visual durante o processo
- ✅ Tratamento de erros claro

## Estrutura de Pastas no Storage

```
Firebase Storage (raiz)
│
└── enderecos_geocodificados/
    ├── enderecos_geocodificados_2025-11-16.csv
    ├── enderecos_geocodificados_2025-11-15.csv
    │
    └── por_turno/
        ├── enderecos_turno_1_2025-11-16.csv
        ├── enderecos_turno_2_2025-11-16.csv
        ├── enderecos_turno_3_2025-11-16.csv
        ├── enderecos_turno_Adm_2025-11-16.csv
        ├── enderecos_turno_1_2025-11-15.csv
        └── ...
```

## Visualização dos Arquivos

### Pelo Storage Viewer

1. Acesse `/storage` na aplicação
2. Navegue para a pasta `enderecos_geocodificados`
3. Visualize todos os arquivos exportados
4. Ações disponíveis:
   - 👁️ Abrir/visualizar
   - ⬇️ Baixar
   - 🗑️ Deletar

### Pelo Google Drive

1. Acesse o Google Drive
2. Vá para "Endereços Geocodificados"
3. Abra a pasta com data/hora
4. Visualize os arquivos CSV

## Nomenclatura de Arquivos

### Arquivo Único (Todos)
```
enderecos_geocodificados_YYYY-MM-DD.csv
```
Exemplo: `enderecos_geocodificados_2025-11-16.csv`

### Arquivos por Turno
```
enderecos_turno_[TURNO]_YYYY-MM-DD.csv
```
Exemplos:
- `enderecos_turno_1_2025-11-16.csv`
- `enderecos_turno_2_2025-11-16.csv`
- `enderecos_turno_Adm_2025-11-16.csv`

**Nota:** Caracteres especiais no nome do turno são substituídos por `_`

## Considerações de Performance

### Upload Sequencial
- Os uploads para Storage são feitos **após** o upload para Drive
- Não bloqueia o processo principal
- Erros no Storage não afetam o Drive

### Múltiplos Arquivos
- Na exportação por turno, cada arquivo é processado sequencialmente
- Loading message atualiza para cada turno
- Total de arquivos é exibido ao final

### Tamanho dos Arquivos
- Arquivos CSV são geralmente pequenos (< 1MB)
- Upload rápido para ambos os destinos
- Sem necessidade de compressão

## Segurança

### Regras do Firebase Storage

Certifique-se de que as regras permitem escrita:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /enderecos_geocodificados/{allPaths=**} {
      allow read, write: if request.auth != null;
      // Ou para acesso público (não recomendado):
      // allow read, write: if true;
    }
  }
}
```

### Compartilhamento

- Arquivos são compartilhados apenas com `pegons.app@gmail.com`
- Permissão de "writer" no Google Drive
- Firebase Storage segue as regras configuradas

## Manutenção

### Limpeza de Arquivos Antigos

Considere implementar:
- [ ] Rotina de limpeza automática de arquivos antigos
- [ ] Limite de armazenamento
- [ ] Arquivamento de arquivos antigos

### Monitoramento

- Logs de erro no console do navegador
- Mensagens de sucesso/erro para o usuário
- Verificação manual pelo Storage Viewer

## Troubleshooting

### Problema: Erro ao salvar no Storage
**Causa:** Regras de segurança ou falta de permissão
**Solução:** Verifique as regras do Firebase Storage

### Problema: Arquivo não aparece no Storage Viewer
**Causa:** Cache ou delay na listagem
**Solução:** Clique em "Atualizar" no Storage Viewer

### Problema: Mensagem de erro mas arquivo foi salvo
**Causa:** Timeout ou erro de rede temporário
**Solução:** Verifique manualmente no Storage Viewer

## Conclusão

A exportação automática para o Firebase Storage adiciona uma camada extra de segurança e facilita o acesso aos arquivos exportados, mantendo a funcionalidade original do Google Drive intacta.

Os usuários agora têm:
- ✅ Backup redundante automático
- ✅ Acesso via Storage Viewer
- ✅ Organização clara de arquivos
- ✅ Feedback transparente do processo
