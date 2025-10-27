# 🔐 Guia de Segurança - Proteção de API Keys

## ⚠️ NUNCA COMMITE CHAVES DE API

### Arquivos Protegidos no .gitignore

Os seguintes arquivos **NÃO devem ser enviados** para o GitHub:

```
/src/environments/environment.ts
/src/environments/environment.prod.ts
```

## 📝 Como Configurar

1. Copie o arquivo de exemplo:
   ```bash
   cp src/environments/environment.example.ts src/environments/environment.ts
   ```

2. Edite `environment.ts` e adicione sua chave REAL (apenas localmente)

3. **NUNCA** adicione chaves reais em arquivos de documentação

## 🚨 Se Você Expor uma Chave

1. **Revogue IMEDIATAMENTE** no Google Cloud Console
2. **Gere uma nova chave**
3. **Remova do histórico do Git** usando BFG Repo-Cleaner
4. **Force push** para o GitHub
5. **Atualize** seus arquivos locais com a nova chave

## 🛡️ Boas Práticas

- ✅ Use o arquivo `.example.ts` como template (sem chaves reais)
- ✅ Mantenha chaves apenas em arquivos locais
- ✅ Configure restrições de API no Google Cloud Console
- ✅ Revise o que será commitado antes de fazer push
- ❌ NUNCA coloque chaves em arquivos de documentação
- ❌ NUNCA commite arquivos `environment.ts` ou `environment.prod.ts`

## 🔍 Verificação Antes de Commit

Sempre execute:
```bash
git status
git diff
```

Confirme que NÃO aparecem:
- ❌ `src/environments/environment.ts`
- ❌ `src/environments/environment.prod.ts`
- ❌ Chaves de API em arquivos .md ou .txt

---

**Lembre-se**: Uma chave exposta deve ser REVOGADA imediatamente! 🔒
