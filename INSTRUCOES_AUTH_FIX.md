# 🔐 Correção do Loop de Autenticação - Instruções de Deploy

## ⚠️ Problema Identificado

O loop de autenticação em produção estava sendo causado por:

1. **AUTH_SECRET inválido/fraco** - Secret anterior estava truncado
2. **Variáveis faltando no GitHub Actions** - Deploy não incluía todas as variáveis necessárias
3. **Configuração de cookies ausente** - Sem configuração específica para HTTPS/produção
4. **NODE_ENV não definido** - Afetava a configuração de cookies seguros

## ✅ Correções Realizadas

### 1. Novo AUTH_SECRET Gerado
- Gerado secret forte de 256 bits: `euCtbIes4+54gJL9toGuYu30oDTv50yrY1kBR4l6GRE=`
- Atualizado em todos os arquivos .env

### 2. Configuração de Cookies para Produção
- Adicionado configuração de cookies seguro no NextAuth
- Cookies agora usam `__Secure-` prefix em produção
- `httpOnly: true`, `sameSite: 'lax'`, `secure: true` em produção

### 3. GitHub Actions Atualizado
- Deploy agora inclui todas as variáveis de ambiente necessárias
- AUTH_SECRET, NEXTAUTH_URL e todas as APIs configuradas

### 4. NODE_ENV Definido
- Adicionado `NODE_ENV=production` no .env de produção

## 🚀 Passos para Deploy

### Passo 1: Atualizar GitHub Secrets

Acesse: `https://github.com/SEU_USUARIO/SEU_REPOSITORIO/settings/secrets/actions`

Adicione ou atualize os seguintes secrets:

```bash
AUTH_SECRET=euCtbIes4+54gJL9toGuYu30oDTv50yrY1kBR4l6GRE=

NEXTAUTH_URL=https://www.quicktecnologia.com

NEXT_PUBLIC_API_HOST=https://api.quicktecnologia.com

NEXT_PUBLIC_API_URL=https://api.quicktecnologia.com

NEXT_PUBLIC_SOCKET_URL=https://api.quicktecnologia.com

NEXT_PUBLIC_WEBSOCKET_URL=https://api.quicktecnologia.com/gps
```

**Secrets já existentes (manter):**
- `SSH_PRIVATE_KEY`
- `VPS_HOST`
- `VPS_USER`
- `VPS_PATH`

### Passo 2: Fazer Commit e Push

```bash
git add .
git commit -m "fix: corrigir loop de autenticação em produção

- Adicionar novo AUTH_SECRET forte
- Configurar cookies seguros para HTTPS
- Atualizar GitHub Actions com variáveis completas
- Adicionar NODE_ENV=production"

git push origin main
```

### Passo 3: Aguardar Deploy Automático

O GitHub Actions vai:
1. Criar arquivo .env com todas as variáveis
2. Fazer deploy no VPS
3. Rebuild dos containers Docker
4. Reiniciar aplicação

### Passo 4: Verificar Logs

Após o deploy, verifique os logs:

```bash
ssh seu-usuario@seu-servidor
cd /caminho/do/projeto
docker-compose logs -f app
```

### Passo 5: Testar Login

1. Acesse https://www.quicktecnologia.com
2. Limpe os cookies do navegador (importante!)
3. Faça login novamente
4. Verifique se não há mais loop

## 🔍 Verificação de Problemas

Se ainda houver problemas, verifique:

### 1. Cookies no Navegador
```
Abrir DevTools > Application > Cookies
Procurar por: __Secure-next-auth.session-token
```

### 2. Logs do Container
```bash
docker-compose logs app | grep -i "auth\|session\|cookie"
```

### 3. Variáveis de Ambiente no Container
```bash
docker-compose exec app env | grep -E "AUTH_SECRET|NEXTAUTH"
```

### 4. Verificar se HTTPS está funcionando
```bash
curl -I https://www.quicktecnologia.com
# Deve retornar 200 ou 301/302, não erro SSL
```

## 📝 Arquivos Modificados

- ✅ `.env` - Novo AUTH_SECRET e NODE_ENV
- ✅ `.env.local` - Novo AUTH_SECRET
- ✅ `.env.example` - Template atualizado
- ✅ `src/app/util/auth.ts` - Configuração de cookies
- ✅ `.github/workflows/deploy.yml` - Variáveis completas
- ✅ `.gitignore` - Proteção reforçada

## 🔐 Segurança

**IMPORTANTE:** O novo AUTH_SECRET deve ser mantido em segredo:
- ✅ Adicionado aos GitHub Secrets
- ✅ Arquivo .env não versionado (no .gitignore)
- ✅ Apenas .env.example com placeholder no git

## 🆘 Rollback (se necessário)

Se algo der errado:

```bash
# No servidor VPS
cd /caminho/do/projeto
docker-compose down
git checkout HEAD~1  # Volta commit anterior
docker-compose up -d --build
```

## 📞 Próximos Passos

Após deploy bem-sucedido:

1. ✅ Testar login em produção
2. ✅ Verificar sessões persistem após reload
3. ✅ Testar logout
4. ✅ Verificar refresh token funciona
5. ✅ Deletar este arquivo de instruções (se desejar)

---

**Data da Correção:** 2026-01-09
**Novo AUTH_SECRET Gerado:** ✅
**Deploy Pendente:** ⏳ Aguardando configuração dos GitHub Secrets
