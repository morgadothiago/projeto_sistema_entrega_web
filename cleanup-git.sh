#!/bin/bash

# ==============================================================================
# Script de Limpeza do Git - Remove arquivos que deveriam estar no .gitignore
# ==============================================================================

echo "🧹 Iniciando limpeza do repositório Git..."
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ==============================================================================
# 1. Remover arquivos do macOS
# ==============================================================================
echo "${YELLOW}📁 Removendo arquivos do macOS (.DS_Store)...${NC}"
find . -name ".DS_Store" -type f -delete
git rm --cached -r --ignore-unmatch **/.DS_Store 2>/dev/null
echo "${GREEN}✅ Arquivos .DS_Store removidos${NC}"
echo ""

# ==============================================================================
# 2. Remover logs
# ==============================================================================
echo "${YELLOW}📝 Removendo arquivos de log...${NC}"
find . -name "*.log" -type f -not -path "./node_modules/*" -delete
git rm --cached -r --ignore-unmatch "*.log" 2>/dev/null
echo "${GREEN}✅ Arquivos .log removidos${NC}"
echo ""

# ==============================================================================
# 3. Remover cache do TypeScript
# ==============================================================================
echo "${YELLOW}🔧 Removendo cache do TypeScript...${NC}"
find . -name "*.tsbuildinfo" -type f -delete
git rm --cached -r --ignore-unmatch "*.tsbuildinfo" 2>/dev/null
echo "${GREEN}✅ Cache TypeScript removido${NC}"
echo ""

# ==============================================================================
# 4. Limpar node_modules do git (se acidentalmente adicionado)
# ==============================================================================
echo "${YELLOW}📦 Verificando node_modules...${NC}"
if git ls-files | grep -q "^node_modules/"; then
    echo "${RED}⚠️  node_modules está sendo rastreado! Removendo...${NC}"
    git rm -r --cached node_modules/ 2>/dev/null
    echo "${GREEN}✅ node_modules removido do Git${NC}"
else
    echo "${GREEN}✅ node_modules não está sendo rastreado${NC}"
fi
echo ""

# ==============================================================================
# 5. Limpar build artifacts
# ==============================================================================
echo "${YELLOW}🏗️  Removendo build artifacts...${NC}"
git rm -r --cached --ignore-unmatch .next/ out/ build/ dist/ 2>/dev/null
echo "${GREEN}✅ Build artifacts removidos${NC}"
echo ""

# ==============================================================================
# 6. Verificar se .env está sendo rastreado
# ==============================================================================
echo "${YELLOW}🔒 Verificando .env...${NC}"
if git ls-files | grep -q "^\.env$"; then
    echo "${RED}❌ CRÍTICO: .env está sendo rastreado!${NC}"
    echo "${YELLOW}Removendo .env do Git...${NC}"
    git rm --cached .env 2>/dev/null
    echo "${GREEN}✅ .env removido${NC}"
    echo "${RED}⚠️  IMPORTANTE: Rotacione todos os secrets imediatamente!${NC}"
else
    echo "${GREEN}✅ .env não está sendo rastreado${NC}"
fi
echo ""

# ==============================================================================
# 7. Mostrar estatísticas
# ==============================================================================
echo ""
echo "📊 Estatísticas:"
echo "─────────────────────────────────────────"
echo "Arquivos sendo rastreados: $(git ls-files | wc -l)"
echo "Arquivos modificados: $(git status --short | wc -l)"
echo "Arquivos não rastreados: $(git status --short | grep '^??' | wc -l)"
echo ""

# ==============================================================================
# 8. Próximos passos
# ==============================================================================
echo "✅ Limpeza concluída!"
echo ""
echo "📝 Próximos passos:"
echo "  1. Revisar mudanças: ${YELLOW}git status${NC}"
echo "  2. Commitar remoções: ${YELLOW}git commit -m \"chore: apply .gitignore rules\"${NC}"
echo "  3. Verificar ignorados: ${YELLOW}git status --ignored${NC}"
echo ""
echo "💡 Dica: Execute 'git clean -xdn' para ver arquivos não rastreados"
echo ""
