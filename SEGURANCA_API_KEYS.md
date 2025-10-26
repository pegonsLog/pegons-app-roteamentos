# 🔐 Segurança - Proteção de API Keys

## ✅ Status de Proteção

### Arquivos Protegidos no .gitignore

Os seguintes arquivos **NÃO serão enviados** para o GitHub:

```
/src/environments/environment.ts
/src/environments/environment.prod.ts
```

Estes arquivos contêm:
- ✅ Chave da API do Google Maps: `AIzaSyDFLzh7sqOtWUDHP9_e1DUDi8WZ9X7Sc9o`
- ✅ Credenciais do Firebase

## 📁 Arquivos no Repositório

### ✅ Arquivo Seguro (será commitado)
- `src/environments/environment.example.ts` - Template sem credenciais sensíveis

### ❌ Arquivos Protegidos (NÃO serão commitados)
- `src/environments/environment.ts` - Contém chaves reais
- `src/environments/environment.prod.ts` - Contém chaves reais

## 🚀 Como Configurar em Outro Ambiente

Se você clonar este repositório ou outra pessoa precisar configurar:

1. Copie o arquivo de exemplo:
   ```bash
   cp src/environments/environment.example.ts src/environments/environment.ts
   cp src/environments/environment.example.ts src/environments/environment.prod.ts
   ```

2. Edite os arquivos criados e adicione suas credenciais reais

3. Os arquivos `environment.ts` e `environment.prod.ts` permanecerão apenas na sua máquina local

## 🔍 Verificação de Segurança

### Antes de Fazer o Primeiro Commit

Execute este comando para verificar que os arquivos sensíveis não serão commitados:

```bash
git status
```

**Você NÃO deve ver** na lista:
- ❌ `src/environments/environment.ts`
- ❌ `src/environments/environment.prod.ts`

**Você DEVE ver** na lista:
- ✅ `src/environments/environment.example.ts`
- ✅ `.gitignore`

### Se Inicializar o Git Agora

```bash
# Inicializar repositório
git init

# Verificar status (os arquivos com chaves NÃO devem aparecer)
git status

# Adicionar arquivos
git add .

# Verificar novamente
git status

# Fazer commit
git commit -m "Initial commit"
```

## ⚠️ IMPORTANTE

### Se Você Acidentalmente Commitou as Chaves

Se você já fez commit dos arquivos com as chaves, siga estes passos:

1. **Remova os arquivos do histórico do Git:**
   ```bash
   git rm --cached src/environments/environment.ts
   git rm --cached src/environments/environment.prod.ts
   git commit -m "Remove sensitive environment files"
   ```

2. **Revogue as chaves antigas:**
   - Acesse o [Google Cloud Console](https://console.cloud.google.com/)
   - Desative a chave antiga
   - Gere uma nova chave
   - Atualize seus arquivos locais

3. **Se já fez push para o GitHub:**
   - As chaves antigas ficam no histórico do Git
   - É OBRIGATÓRIO revogar e gerar novas chaves
   - Considere usar `git filter-branch` ou `BFG Repo-Cleaner` para limpar o histórico

## 🛡️ Boas Práticas

1. ✅ **Nunca** commite arquivos com API keys
2. ✅ **Sempre** use arquivos `.example` como template
3. ✅ **Sempre** adicione arquivos sensíveis no `.gitignore`
4. ✅ **Revogue** chaves expostas imediatamente
5. ✅ **Use** variáveis de ambiente em produção
6. ✅ **Configure** restrições de API no Google Cloud Console

## 🔗 Recursos

- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [Google Cloud: API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
- [Firebase: Security Best Practices](https://firebase.google.com/docs/rules/basics)

---

**Status Atual**: ✅ **SEGURO** - As chaves estão protegidas pelo `.gitignore`
