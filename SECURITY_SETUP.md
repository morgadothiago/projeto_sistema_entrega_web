# 🔒 Guia de Configuração de Segurança

## ⚠️ AÇÃO URGENTE NECESSÁRIA

O projeto teve secrets expostos no repositório Git. Siga este guia para corrigir.

---

## 1. Configurar Variáveis de Ambiente

### 1.1 Criar arquivo .env

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

### 1.2 Gerar novos secrets

Execute os comandos abaixo e copie os valores gerados:

```bash
# Gerar AUTH_SECRET
openssl rand -base64 32

# Gerar NEXTAUTH_SECRET
openssl rand -base64 32
```

### 1.3 Atualizar .env com os novos valores

Abra o arquivo `.env` e substitua os valores:

```env
# ❌ NÃO use os secrets antigos expostos no Git!
# ✅ Use os novos secrets gerados acima

AUTH_SECRET=<cole-o-primeiro-secret-gerado>
NEXTAUTH_SECRET=<cole-o-segundo-secret-gerado>

# API Configuration
NEXT_PUBLIC_NEXTAUTH_API_HOST=http://localhost:3000
NEXT_PUBLIC_API_HOST=http://localhost:3000

# WebSocket Configuration
NEXT_PUBLIC_SOCKET_URL=http://localhost:2000

# Environment
NODE_ENV=development
```

---

## 2. Garantir que .env não seja commitado

### 2.1 Verificar .gitignore

O arquivo `.gitignore` já contém `.env`, mas verifique:

```bash
cat .gitignore | grep .env
```

Deve retornar: `.env`

### 2.2 Remover .env do histórico do Git (se ainda estiver)

```bash
# Remover do cache do Git
git rm --cached .env

# Commit a remoção
git commit -m "security: remove .env from repository"
```

---

## 3. Atualizar Secrets em Produção

### 3.1 Vercel / Netlify / Outros

1. Acesse o painel de configuração do seu provedor
2. Vá em "Environment Variables" ou "Variáveis de Ambiente"
3. Adicione as variáveis:
   - `AUTH_SECRET`: (novo secret gerado)
   - `NEXTAUTH_SECRET`: (novo secret gerado)
   - `NEXT_PUBLIC_NEXTAUTH_API_HOST`: URL da sua API em produção
   - `NEXT_PUBLIC_API_HOST`: URL da sua API em produção
   - `NEXT_PUBLIC_SOCKET_URL`: URL do WebSocket em produção

### 3.2 Docker / VPS

Adicione as variáveis no arquivo docker-compose.yml ou .env do servidor:

```yaml
environment:
  - AUTH_SECRET=<novo-secret>
  - NEXTAUTH_SECRET=<novo-secret>
  - NEXT_PUBLIC_NEXTAUTH_API_HOST=https://api.seudominio.com
  - NEXT_PUBLIC_API_HOST=https://api.seudominio.com
  - NEXT_PUBLIC_SOCKET_URL=https://socket.seudominio.com
```

---

## 4. Revisar e Rotacionar Outros Secrets

### 4.1 Verificar se há outros secrets expostos

```bash
# Buscar por possíveis secrets no código
git grep -i "password\|secret\|key\|token" -- ':!node_modules' ':!.git'
```

### 4.2 Lista de verificação

- [ ] Secrets do banco de dados
- [ ] Chaves de API de terceiros (Google Maps, AWS, etc.)
- [ ] Tokens de serviços externos
- [ ] Certificados SSL/TLS
- [ ] Credenciais de SMTP

---

## 5. Melhorias de Segurança Implementadas

✅ Sistema de logging profissional (não expõe dados em produção)
✅ Tipagem TypeScript melhorada (menos `any`)
✅ Helper para formatar tokens de autenticação
✅ Console.logs removidos dos arquivos críticos
✅ .env.example criado para referência

---

## 6. Próximos Passos Recomendados

### 6.1 Implementar Rate Limiting

```typescript
// Em middleware.ts
import { rateLimit } from '@/lib/rate-limit'

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'
  const { success } = await rateLimit(ip)

  if (!success) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }

  return NextResponse.next()
}
```

### 6.2 Adicionar Helmet para headers de segurança

```bash
npm install helmet
```

### 6.3 Implementar CSRF protection

```typescript
// Usar next-auth com CSRF tokens habilitados
```

### 6.4 Adicionar Sentry para monitoramento

```bash
npm install @sentry/nextjs
```

---

## 7. Checklist de Segurança

- [ ] Novos secrets gerados e configurados
- [ ] .env removido do Git
- [ ] Secrets em produção atualizados
- [ ] Console.logs verificados
- [ ] Variáveis de ambiente documentadas
- [ ] Time notificado sobre mudanças de secrets
- [ ] Logs de acesso revisados para atividade suspeita

---

## 8. Contatos de Emergência

Em caso de breach de segurança:

1. Rotacione TODOS os secrets imediatamente
2. Revise logs de acesso
3. Notifique o time de segurança
4. Documente o incidente

---

## 📚 Recursos Adicionais

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/deploying/production-checklist#security)
- [TypeScript Security](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)

---

**⚠️ IMPORTANTE:** Nunca commite secrets no Git. Use sempre variáveis de ambiente!
