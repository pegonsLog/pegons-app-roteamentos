# 🔐 Comandos Git Seguros

## Inicialização Segura do Repositório

### 1. Verificar Proteções ANTES de Inicializar

```bash
# Verificar que o .gitignore está correto
cat .gitignore | grep environment

# Deve mostrar:
# /src/environments/environment.ts
# /src/environments/environment.prod.ts
```

### 2. Inicializar Repositório

```bash
# Inicializar Git
git init

# Verificar segurança
./verificar-seguranca.sh
```

### 3. Primeiro Commit Seguro

```bash
# Adicionar todos os arquivos
git add .

# Verificar o que será commitado
git status

# IMPORTANTE: Confirme que NÃO aparecem:
# ❌ src/environments/environment.ts
# ❌ src/environments/environment.prod.ts

# Se aparecerem, PARE e execute:
git reset
git rm --cached src/environments/environment.ts
git rm --cached src/environments/environment.prod.ts
git add .

# Fazer o commit
git commit -m "Initial commit - projeto Angular com proteção de API keys"
```

### 4. Conectar ao GitHub (Opcional)

```bash
# Criar repositório no GitHub primeiro, depois:
git remote add origin https://github.com/seu-usuario/seu-repositorio.git

# Verificar segurança uma última vez
./verificar-seguranca.sh

# Push para o GitHub
git branch -M main
git push -u origin main
```

## Comandos de Verificação

### Verificar Arquivos Rastreados

```bash
# Listar todos os arquivos rastreados pelo Git
git ls-files

# Procurar por arquivos de environment
git ls-files | grep environment

# Deve mostrar APENAS:
# src/environments/environment.example.ts
```

### Verificar Histórico

```bash
# Verificar se algum arquivo sensível foi commitado
git log --all --full-history -- src/environments/environment.ts
git log --all --full-history -- src/environments/environment.prod.ts

# Se retornar vazio: ✅ SEGURO
# Se mostrar commits: ❌ PERIGO - veja seção de recuperação
```

### Verificar Mudanças Staged

```bash
# Ver o que está staged para commit
git diff --cached --name-only

# Não deve mostrar:
# ❌ src/environments/environment.ts
# ❌ src/environments/environment.prod.ts
```

## Recuperação de Emergência

### Se Você Commitou Arquivos Sensíveis (MAS NÃO FEZ PUSH)

```bash
# Remover do último commit
git rm --cached src/environments/environment.ts
git rm --cached src/environments/environment.prod.ts
git commit --amend -m "Initial commit - projeto Angular com proteção de API keys"

# Verificar
git log --all --full-history -- src/environments/environment.ts
```

### Se Você Fez PUSH para o GitHub

⚠️ **AÇÃO URGENTE NECESSÁRIA**:

1. **Revogue a API Key IMEDIATAMENTE**:
   ```bash
   # Acesse: https://console.cloud.google.com/apis/credentials
   # Delete ou regenere a API Key comprometida
   ```

2. **Limpe o histórico do Git**:
   ```bash
   # Instale o BFG Repo-Cleaner
   brew install bfg  # macOS
   
   # Ou baixe de: https://rtyley.github.io/bfg-repo-cleaner/
   
   # Clone um mirror do repositório
   git clone --mirror https://github.com/seu-usuario/seu-repo.git
   cd seu-repo.git
   
   # Remova os arquivos sensíveis do histórico
   bfg --delete-files environment.ts
   bfg --delete-files environment.prod.ts
   
   # Limpe e force push
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push --force
   ```

3. **Configure nova API Key**:
   ```bash
   # Gere nova chave no Google Cloud Console
   # Atualize seus arquivos locais
   # Configure restrições mais rígidas
   ```

## Comandos de Manutenção

### Verificação Regular

```bash
# Execute semanalmente
./verificar-seguranca.sh

# Verifique o status
git status

# Confirme que nenhum arquivo sensível está pendente
```

### Atualizar .gitignore

```bash
# Se precisar adicionar mais arquivos ao .gitignore
echo "/novo-arquivo-sensivel.txt" >> .gitignore

# Remover do rastreamento se já foi adicionado
git rm --cached novo-arquivo-sensivel.txt

# Commit a mudança
git add .gitignore
git commit -m "Atualizar .gitignore"
```

### Verificar Configuração do Git

```bash
# Ver configuração atual
git config --list

# Configurar nome e email (se necessário)
git config user.name "Seu Nome"
git config user.email "seu@email.com"

# Configurar para não rastrear mudanças em arquivos específicos
git update-index --assume-unchanged src/environments/environment.ts
git update-index --assume-unchanged src/environments/environment.prod.ts
```

## Boas Práticas

### Antes de Cada Commit

```bash
# 1. Verificar o que será commitado
git status

# 2. Ver as mudanças
git diff

# 3. Verificar arquivos staged
git diff --cached

# 4. Confirmar segurança
./verificar-seguranca.sh

# 5. Commit
git commit -m "Sua mensagem"
```

### Branches Seguros

```bash
# Criar branch para desenvolvimento
git checkout -b feature/nova-funcionalidade

# Trabalhar normalmente
# ...

# Antes de merge, verificar segurança
./verificar-seguranca.sh

# Merge seguro
git checkout main
git merge feature/nova-funcionalidade
```

## Aliases Úteis

Adicione ao seu `~/.gitconfig`:

```bash
[alias]
    # Verificar arquivos sensíveis
    check-sensitive = !git ls-files | grep -E 'environment\\.(ts|prod\\.ts)$'
    
    # Status resumido
    st = status -s
    
    # Log formatado
    lg = log --oneline --graph --decorate --all
    
    # Ver último commit
    last = log -1 HEAD --stat
    
    # Desfazer último commit (mantém mudanças)
    undo = reset HEAD~1 --soft
```

Usar:
```bash
git check-sensitive  # Deve retornar vazio
git st               # Status resumido
git lg               # Log visual
```

## Checklist Rápido

Antes de cada push:

- [ ] `./verificar-seguranca.sh` passou
- [ ] `git status` não mostra arquivos sensíveis
- [ ] `git diff --cached` não mostra credenciais
- [ ] `git ls-files | grep environment` mostra apenas `.example.ts`
- [ ] Testei localmente e está funcionando

---

## 🆘 Ajuda Rápida

**Arquivo sensível apareceu no git status?**
```bash
git rm --cached arquivo-sensivel
```

**Commitei por engano?**
```bash
git reset HEAD~1
```

**Já fiz push?**
```bash
# 1. Revogue a chave IMEDIATAMENTE
# 2. Use BFG Repo-Cleaner
# 3. Gere nova chave
```

**Dúvidas?**
```bash
./verificar-seguranca.sh
cat SEGURANCA_API_KEYS.md
```

---

**Lembre-se**: É melhor verificar 10 vezes do que expor uma vez! 🔒
