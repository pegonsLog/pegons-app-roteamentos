#!/bin/bash

echo "🚨 RECUPERAÇÃO DE EMERGÊNCIA - CHAVE EXPOSTA"
echo "=============================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${RED}ATENÇÃO: Este script irá:${NC}"
echo "1. Remover arquivos com a chave exposta do Git"
echo "2. Limpar o histórico do Git"
echo "3. Forçar push para o GitHub"
echo ""
echo -e "${YELLOW}ANTES DE CONTINUAR:${NC}"
echo "1. Acesse: https://console.cloud.google.com/apis/credentials?project=roteamentos"
echo "2. REVOGUE ou REGENERE a chave exposta (veja o email do Google)"
echo "3. Copie a NOVA chave gerada"
echo ""
read -p "Você já REVOGOU a chave antiga? (s/n): " confirmacao

if [ "$confirmacao" != "s" ]; then
    echo -e "${RED}PARE! Revogue a chave primeiro!${NC}"
    exit 1
fi

echo ""
echo "Removendo arquivos comprometidos do Git..."

# Remover arquivos do Git (mas manter localmente)
git rm --cached SEGURANCA_API_KEYS.md
git rm --cached CHECKLIST_SEGURANCA.md
git rm --cached RESUMO_SEGURANCA.txt
git rm --cached src/environments/environment.example.ts

# Adicionar ao .gitignore
echo "" >> .gitignore
echo "# Arquivos temporariamente removidos por segurança" >> .gitignore
echo "SEGURANCA_API_KEYS.md" >> .gitignore
echo "CHECKLIST_SEGURANCA.md" >> .gitignore
echo "RESUMO_SEGURANCA.txt" >> .gitignore

# Commit
git add .gitignore
git commit -m "🔒 SEGURANÇA: Remove arquivos com chave exposta"

echo ""
echo -e "${YELLOW}Agora você precisa fazer force push:${NC}"
echo "git push origin main --force"
echo ""
echo -e "${RED}IMPORTANTE:${NC}"
echo "1. Atualize a NOVA chave nos arquivos locais"
echo "2. Remova a chave dos arquivos de documentação"
echo "3. Nunca mais commite chaves reais"
echo ""
