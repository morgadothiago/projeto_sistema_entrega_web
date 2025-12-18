# 🚀 Guia de Deploy - Sistema de Entregas

## 📋 Checklist Pré-Deploy

### Segurança
- [x] ✅ Arquivo `.env` removido do repositório
- [x] ✅ Secrets regenerados (AUTH_SECRET, NEXTAUTH_SECRET)
- [x] ✅ URLs hardcoded substituídas por variáveis de ambiente
- [x] ✅ Token estático removido do ApiService
- [x] ✅ Validação de input adicionada nas API routes
- [ ] ⚠️ Configurar CORS no backend de produção
- [ ] ⚠️ Configurar rate limiting no backend

### Performance
- [x] ✅ Polling centralizado no NotificationContext
- [x] ✅ Polling duplicado removido do Header e páginas admin
- [x] ✅ Memory leaks corrigidos (socket com verificação de unmount)
- [ ] ⚠️ Considerar adicionar React Query/SWR para cache

### Qualidade de Código
- [x] ✅ Console.logs removidos (exceto console.error)
- [x] ✅ Error Boundary implementado
- [ ] ⚠️ Adicionar testes (recomendado)
- [ ] ⚠️ Configurar monitoring (Sentry, LogRocket)

---

## 🔐 Configuração de Variáveis de Ambiente

### 1. Copiar Template
```bash
cp .env.example .env.production
```

### 2. Gerar Secrets
```bash
# Gerar AUTH_SECRET
openssl rand -base64 32

# Gerar NEXTAUTH_SECRET (pode ser o mesmo ou diferente)
openssl rand -base64 32
```

### 3. Configurar `.env.production`
```env
# Authentication Secrets
AUTH_SECRET=seu_secret_gerado_aqui
NEXTAUTH_SECRET=seu_secret_gerado_aqui

# API Configuration
NEXT_PUBLIC_API_HOST=https://api.seu-dominio.com
NEXT_PUBLIC_SOCKET_URL=https://socket.seu-dominio.com
NEXT_PUBLIC_NEXTAUTH_API_HOST=https://seu-dominio.com
```

---

## 🏗️ Build e Testes Locais

### 1. Instalar Dependências
```bash
npm install
```

### 2. Verificar TypeScript
```bash
npx tsc --noEmit
```

### 3. Build de Produção
```bash
npm run build
```

### 4. Testar Build Localmente
```bash
npm run start
# Acesse http://localhost:3000
```

---

## 🌐 Deploy

### Opção 1: Vercel (Recomendado para Next.js)

#### 1. Install Vercel CLI
```bash
npm i -g vercel
```

#### 2. Login
```bash
vercel login
```

#### 3. Configurar Variáveis de Ambiente na Vercel
```bash
# Através do dashboard: https://vercel.com/seu-projeto/settings/environment-variables
# Ou via CLI:
vercel env add AUTH_SECRET
vercel env add NEXTAUTH_SECRET
vercel env add NEXT_PUBLIC_API_HOST
vercel env add NEXT_PUBLIC_SOCKET_URL
```

#### 4. Deploy
```bash
# Deploy de preview
vercel

# Deploy para produção
vercel --prod
```

### Opção 2: Docker

#### Dockerfile já existe? Se não, criar:
```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### Build e Run
```bash
# Build image
docker build -t sistema-entregas-web .

# Run container
docker run -p 3000:3000 \
  -e AUTH_SECRET=seu_secret \
  -e NEXTAUTH_SECRET=seu_secret \
  -e NEXT_PUBLIC_API_HOST=https://api.seu-dominio.com \
  -e NEXT_PUBLIC_SOCKET_URL=https://socket.seu-dominio.com \
  sistema-entregas-web
```

### Opção 3: AWS / Azure / GCP

1. Fazer build estático:
```bash
npm run build
```

2. Fazer upload da pasta `.next` e arquivos necessários

3. Configurar variáveis de ambiente no painel da cloud

4. Configurar domínio e SSL

---

## 🔧 Configurações Pós-Deploy

### 1. Configurar CORS no Backend
```typescript
// Backend NestJS example
app.enableCors({
  origin: ['https://seu-dominio.com'],
  credentials: true,
})
```

### 2. Configurar Rate Limiting
```typescript
// Backend NestJS example
import { ThrottlerModule } from '@nestjs/throttler'

ThrottlerModule.forRoot({
  ttl: 60,
  limit: 100,
})
```

### 3. Configurar SSL/HTTPS
- Usar Let's Encrypt ou certificado da cloud
- Redirecionar HTTP → HTTPS
- Configurar HSTS headers

### 4. Configurar Monitoring

#### Sentry (Error Tracking)
```bash
npm install @sentry/nextjs

# Configurar sentry.client.config.ts e sentry.server.config.ts
npx @sentry/wizard@latest -i nextjs
```

#### LogRocket (Session Replay)
```bash
npm install logrocket

# Configurar em _app.tsx
import LogRocket from 'logrocket'
if (process.env.NODE_ENV === 'production') {
  LogRocket.init('seu-app-id')
}
```

---

## 🧪 Testes Pós-Deploy

### Funcionalidades Críticas para Testar

- [ ] Login e autenticação
- [ ] Refresh token automático
- [ ] Criar nova entrega
- [ ] Visualizar detalhes de entrega
- [ ] Rastreamento em tempo real (WebSocket)
- [ ] Notificações (admin)
- [ ] Aprovar/rejeitar notificações
- [ ] Atualização de perfil
- [ ] Logout

### Performance

- [ ] Tempo de carregamento < 3s
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Lighthouse Score > 90

### Segurança

- [ ] HTTPS ativo
- [ ] Headers de segurança configurados
- [ ] CORS configurado corretamente
- [ ] Rate limiting ativo
- [ ] Secrets não expostos

---

## 📊 Monitoring e Logs

### Métricas para Monitorar

1. **Disponibilidade**: Uptime > 99.9%
2. **Performance**: Response time < 500ms
3. **Erros**: Error rate < 1%
4. **Uso de API**: Requests/min, rate limiting hits

### Logs Importantes

- Authentication failures
- API errors (500, 401, 403)
- WebSocket connection errors
- Rate limiting hits (429)

---

## 🆘 Troubleshooting

### Problema: "Sua sessão expirou"
**Causa**: Refresh token não está funcionando
**Solução**:
- Verificar `NEXT_PUBLIC_API_HOST` está correto
- Verificar backend `/auth/refresh` está funcionando
- Check logs do backend

### Problema: WebSocket não conecta
**Causa**: `NEXT_PUBLIC_SOCKET_URL` incorreto
**Solução**:
- Verificar variável de ambiente
- Verificar servidor socket está rodando
- Check CORS no servidor socket

### Problema: "Erro ao carregar dados"
**Causa**: API retorna 404 ou 500
**Solução**:
- Verificar `NEXT_PUBLIC_API_HOST`
- Check logs do backend
- Verificar se banco de dados está online

---

## 📞 Suporte

Em caso de problemas após o deploy:

1. Verificar logs do servidor
2. Verificar métricas de monitoring
3. Revisar este guia de troubleshooting
4. Contactar equipe de desenvolvimento

---

## 🎉 Deploy Concluído!

Parabéns! Seu sistema está no ar. Não esqueça de:

- Monitorar logs nas primeiras 24-48h
- Configurar alertas para erros críticos
- Fazer backup regular do banco de dados
- Manter dependências atualizadas
