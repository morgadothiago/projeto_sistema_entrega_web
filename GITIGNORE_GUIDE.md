# 📝 Guia do .gitignore - Sistema de Entregas

## 🎯 O que é o .gitignore?

O `.gitignore` especifica quais arquivos e diretórios o Git deve **ignorar** (não rastrear).

---

## ✅ O QUE ESTÁ SENDO IGNORADO

### 🔒 Segurança (CRÍTICO)

```gitignore
.env
.env.local
.env.*.local
*.pem
*.key
*.cert
secrets/
private/
```

**Por quê?** Previne vazamento de credenciais e informações sensíveis

### 📦 Dependencies

```gitignore
node_modules/
.yarn/
.pnpm/
```

**Por quê?** Arquivos de dependências são grandes e podem ser reinstalados

### 🏗️ Build & Cache

```gitignore
.next/
out/
build/
dist/
.swc/
*.tsbuildinfo
```

**Por quê?** Arquivos gerados automaticamente, não precisam estar no repositório

### 💻 IDEs & Editores

```gitignore
.vscode/
.idea/
*.sublime-project
*.swp
```

**Por quê?** Configurações pessoais de cada desenvolvedor

### 🖥️ Sistema Operacional

```gitignore
.DS_Store          # macOS
Thumbs.db          # Windows
*~                 # Linux
```

**Por quê?** Arquivos específicos do SO, não relevantes para o projeto

### 📊 Logs & Debug

```gitignore
*.log
npm-debug.log*
yarn-debug.log*
```

**Por quê?** Logs são temporários e podem conter informações sensíveis

---

## 📋 ARQUIVOS QUE **DEVEM** SER COMMITADOS

### ✅ Sempre commitar:

- `package.json` - Dependências do projeto
- `package-lock.json` - Lock das versões (recomendado)
- `tsconfig.json` - Configuração TypeScript
- `next.config.js` - Configuração Next.js
- `.env.example` - Template de variáveis (SEM valores reais!)
- `README.md` - Documentação
- `src/` - Todo código fonte
- `public/` - Assets públicos
- `.eslintrc`, `.prettierrc` - Configurações de linting

### ❌ NUNCA commitar:

- `.env` - Variáveis de ambiente (valores reais)
- `node_modules/` - Dependências instaladas
- `.next/` - Build do Next.js
- `*.log` - Arquivos de log
- `.DS_Store` - Arquivos do macOS
- Credenciais, tokens, senhas

---

## 🔍 Como Verificar o que está sendo ignorado

```bash
# Ver todos arquivos ignorados
git status --ignored

# Ver apenas arquivos não trackeados
git status --short

# Verificar se um arquivo específico está sendo ignorado
git check-ignore -v nome-do-arquivo
```

---

## 🛠️ Comandos Úteis

### Limpar arquivos que deveriam estar ignorados

```bash
# Ver o que será removido (dry-run)
git clean -xdn

# Remover arquivos não trackeados
git clean -xdf

# Remover arquivos do cache do Git (se já foram commitados)
git rm -r --cached .
git add .
git commit -m "chore: apply .gitignore rules"
```

### Forçar adicionar arquivo ignorado (use com cuidado!)

```bash
git add -f arquivo-ignorado.txt
```

---

## 📝 Customização

Se você precisa ignorar arquivos específicos do seu projeto, adicione na seção **Custom Project Files** no final do `.gitignore`:

```gitignore
# ==============================================================================
# Custom Project Files
# ==============================================================================
/uploads/          # Pasta de uploads
/reports/*.pdf     # PDFs na pasta reports
temp_*             # Arquivos temporários
```

---

## ⚠️ Problemas Comuns

### Problema 1: Arquivo já foi commitado antes

**Sintoma:** Mudanças no arquivo aparecem mesmo estando no `.gitignore`

**Solução:**
```bash
# Remover do Git mas manter no disco
git rm --cached arquivo.txt

# Commitar a remoção
git commit -m "chore: remove arquivo.txt from git"
```

### Problema 2: .gitignore não está funcionando

**Possíveis causas:**
1. Arquivo já está sendo rastreado (ver solução acima)
2. Padrão incorreto no `.gitignore`
3. `.gitignore` não está na raiz do projeto

**Verificar:**
```bash
# Testar se o padrão funciona
git check-ignore -v arquivo.txt
```

### Problema 3: Commitei .env por acidente!

**Solução URGENTE:**
```bash
# 1. Remover do Git
git rm --cached .env

# 2. Commitar remoção
git commit -m "security: remove .env from repository"

# 3. ROTACIONAR TODOS OS SECRETS IMEDIATAMENTE!
# 4. Gerar novos secrets
openssl rand -base64 32

# 5. Atualizar em produção
```

---

## 🎓 Boas Práticas

### ✅ DO

- Mantenha `.gitignore` na raiz do projeto
- Adicione comentários para padrões complexos
- Use `.env.example` para documentar variáveis
- Revise regularmente arquivos ignorados
- Documente padrões customizados

### ❌ DON'T

- Nunca commite secrets ou credenciais
- Evite `.gitignore` genérico demais
- Não ignore arquivos importantes do projeto
- Não force add de arquivos que deveriam estar ignorados

---

## 📊 Verificação de Saúde

Execute este checklist periodicamente:

```bash
# 1. Ver arquivos não trackeados
git status --short

# 2. Ver arquivos ignorados
git status --ignored

# 3. Verificar se .env está ignorado
git check-ignore .env

# 4. Procurar por arquivos grandes
find . -type f -size +5M | grep -v node_modules

# 5. Buscar possíveis secrets
git grep -i "password\|secret\|api_key" -- ':!*.md' ':!.gitignore'
```

---

## 🔗 Recursos

- [GitHub .gitignore templates](https://github.com/github/gitignore)
- [gitignore.io](https://www.toptal.com/developers/gitignore)
- [Git documentation](https://git-scm.com/docs/gitignore)

---

## 📞 Suporte

Se tiver dúvidas sobre o que ignorar:

1. Consulte este guia
2. Verifique a [documentação oficial](https://git-scm.com/docs/gitignore)
3. Pergunte ao time antes de commitar arquivos grandes

---

**⚠️ LEMBRE-SE:** É mais fácil prevenir do que corrigir. Sempre revise `git status` antes de commitar!

---

*Última atualização: 19/01/2025*
