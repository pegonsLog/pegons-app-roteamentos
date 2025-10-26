#!/bin/bash

# Script de Verificação de Segurança
# Verifica se arquivos sensíveis estão protegidos

echo "🔍 Verificando Segurança das API Keys..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se .gitignore existe
if [ ! -f .gitignore ]; then
    echo -e "${RED}❌ ERRO: Arquivo .gitignore não encontrado!${NC}"
    exit 1
fi

# Verificar se environment.ts está no .gitignore
if grep -q "environment.ts" .gitignore; then
    echo -e "${GREEN}✅ environment.ts está protegido no .gitignore${NC}"
else
    echo -e "${RED}❌ PERIGO: environment.ts NÃO está no .gitignore!${NC}"
    exit 1
fi

# Verificar se environment.prod.ts está no .gitignore
if grep -q "environment.prod.ts" .gitignore; then
    echo -e "${GREEN}✅ environment.prod.ts está protegido no .gitignore${NC}"
else
    echo -e "${RED}❌ PERIGO: environment.prod.ts NÃO está no .gitignore!${NC}"
    exit 1
fi

# Verificar se os arquivos existem
if [ -f src/environments/environment.ts ]; then
    echo -e "${GREEN}✅ environment.ts existe localmente${NC}"
else
    echo -e "${YELLOW}⚠️  environment.ts não encontrado (você precisa criá-lo)${NC}"
fi

if [ -f src/environments/environment.prod.ts ]; then
    echo -e "${GREEN}✅ environment.prod.ts existe localmente${NC}"
else
    echo -e "${YELLOW}⚠️  environment.prod.ts não encontrado (você precisa criá-lo)${NC}"
fi

# Verificar se é um repositório Git
if [ -d .git ]; then
    echo ""
    echo "📦 Verificando status do Git..."
    
    # Verificar se arquivos sensíveis estão sendo rastreados
    if git ls-files | grep -q "src/environments/environment.ts"; then
        echo -e "${RED}❌ PERIGO: environment.ts está sendo rastreado pelo Git!${NC}"
        echo -e "${YELLOW}Execute: git rm --cached src/environments/environment.ts${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ environment.ts NÃO está sendo rastreado${NC}"
    fi
    
    if git ls-files | grep -q "src/environments/environment.prod.ts"; then
        echo -e "${RED}❌ PERIGO: environment.prod.ts está sendo rastreado pelo Git!${NC}"
        echo -e "${YELLOW}Execute: git rm --cached src/environments/environment.prod.ts${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ environment.prod.ts NÃO está sendo rastreado${NC}"
    fi
    
    # Verificar se há mudanças staged que incluem os arquivos
    if git diff --cached --name-only | grep -q "environment.ts\|environment.prod.ts"; then
        echo -e "${RED}❌ PERIGO: Arquivos sensíveis estão staged para commit!${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ Nenhum arquivo sensível staged${NC}"
    fi
else
    echo ""
    echo -e "${YELLOW}⚠️  Não é um repositório Git (ainda)${NC}"
    echo "Quando você executar 'git init', os arquivos já estarão protegidos."
fi

echo ""
echo -e "${GREEN}🎉 Verificação concluída! Suas API keys estão seguras.${NC}"
echo ""
echo "📝 Lembre-se:"
echo "   - NUNCA commite arquivos com API keys"
echo "   - Use environment.example.ts como template"
echo "   - Revogue chaves expostas imediatamente"
