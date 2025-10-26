# 🚨 AÇÕES URGENTES - CHAVE EXPOSTA NO GITHUB

## ⚡ EXECUTE ESTAS AÇÕES AGORA (EM ORDEM):

### 1. REVOGUE A CHAVE ANTIGA (PRIORIDADE MÁXIMA) ⏰ 5 minutos

1. Acesse: https://console.cloud.google.com/apis/credentials?project=roteamentos
2. Localize a chave que foi exposta (veja o email do Google)
3. Clique nela
4. Clique em **"REGENERATE KEY"** (Regenerar Chave)
5. **COPIE A NOVA CHAVE** gerada
6. Salve em um lugar seguro (temporariamente)

### 2. ATUALIZE OS ARQUIVOS LOCAIS ⏰ 2 minutos

```bash
# Abra o arquivo environment.ts
nano src/environments/environment.ts

# Substitua a chave antiga pela NOVA chave
# Cole a nova chave que você copiou no passo 1

# Faça o mesmo para environment.prod.ts
nano src/environments/environment.prod.ts
```

### 3. COMMIT E PUSH DAS CORREÇÕES ⏰ 3 minutos

```bash
# Commit das mudanças
git commit -m "🔒 SEGURANÇA: Remove chaves expostas e atualiza documentação"

# Push para o GitHub
git push origin main
```

### 4. LIMPE O HISTÓRICO DO GIT (CRÍTICO) ⏰ 10 minutos

A chave antiga ainda está no histórico do Git. Você precisa removê-la:

#### Opção A: Usando BFG Repo-Cleaner (Recomendado)

```bash
# Instale o BFG
brew install bfg

# Faça backup
cp -r . ../roteamento-backup

# Clone um mirror
cd ..
git clone --mirror https://github.com/pegonsLog/pegons-app-roteamentos.git

# Entre no mirror
cd pegons-app-roteamentos.git

# Remova a chave do histórico (substitua CHAVE_EXPOSTA pela chave do email)
bfg --replace-text <(echo 'CHAVE_EXPOSTA==>***CHAVE_REMOVIDA***')

# Limpe
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push --force
```

#### Opção B: Reescrever Histórico Manualmente

```bash
# Remova os arquivos do histórico
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch SEGURANCA_API_KEYS.md CHECKLIST_SEGURANCA.md RESUMO_SEGURANCA.txt" \
  --prune-empty --tag-name-filter cat -- --all

# Force push
git push origin --force --all
```

### 5. CONFIGURE RESTRIÇÕES DA API ⏰ 5 minutos

No Google Cloud Console:

1. Vá em: https://console.cloud.google.com/apis/credentials?project=roteamentos
2. Clique na NOVA chave
3. Em "Restrições de aplicativo", selecione:
   - **Para desenvolvimento**: "Endereços IP" e adicione seu IP
   - **Para produção**: "Referenciadores HTTP" e adicione seu domínio
4. Em "Restrições de API":
   - Selecione "Restringir chave"
   - Marque apenas: "Geocoding API"
5. Clique em **"SALVAR"**

### 6. VERIFIQUE O GITHUB ⏰ 2 minutos

1. Acesse: https://github.com/pegonsLog/pegons-app-roteamentos
2. Verifique que os arquivos foram removidos
3. Procure pela chave antiga no código (use a busca do GitHub)
4. Se ainda aparecer, o histórico não foi limpo - volte ao passo 4

### 7. MONITORE O USO ⏰ Contínuo

1. Configure alertas no Google Cloud Console
2. Monitore o uso da API nos próximos dias
3. Verifique se há cobranças inesperadas

## ✅ Checklist de Verificação

Marque conforme completar:

- [ ] Chave antiga REVOGADA no Google Cloud Console
- [ ] Nova chave gerada e copiada
- [ ] Arquivos locais atualizados com a nova chave
- [ ] Commit e push das correções feito
- [ ] Histórico do Git limpo (chave antiga removida)
- [ ] Restrições de API configuradas
- [ ] GitHub verificado (chave não aparece mais)
- [ ] Alertas de uso configurados

## 🎯 Resultado Esperado

Após completar todos os passos:

✅ Chave antiga REVOGADA (não funciona mais)
✅ Nova chave configurada e RESTRITA
✅ Histórico do Git LIMPO
✅ GitHub SEM chaves expostas
✅ Monitoramento ATIVO

## 📞 Suporte

Se tiver dúvidas ou problemas:

1. Consulte: https://cloud.google.com/docs/authentication/api-keys
2. Veja: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository

---

**TEMPO TOTAL ESTIMADO**: 30-40 minutos
**PRIORIDADE**: 🔴 CRÍTICA - Execute AGORA!
