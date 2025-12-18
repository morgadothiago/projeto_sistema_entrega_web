#!/bin/bash

# Script para remover console.logs de produção
# Mantém apenas console.error para debugging crítico

echo "Removendo console.logs..."

# Encontrar e processar arquivos
find src -type f \( -name "*.ts" -o -name "*.tsx" \) | while read file; do
  # Remover linhas com console.log, console.warn, console.info, console.debug
  # Manter console.error
  sed -i.bak '/console\.\(log\|warn\|info\|debug\)/d' "$file"
  
  # Remover comentários com console (comentados)
  sed -i.bak '/\/\/.*console\./d' "$file"
  
  # Remover arquivos backup
  rm -f "${file}.bak"
done

echo "Console.logs removidos com sucesso!"
echo "Verificando arquivos restantes com console..."
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec grep -l "console\." {} \; | wc -l
