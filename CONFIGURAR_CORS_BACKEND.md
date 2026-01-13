# Configuração de CORS no Backend

## Problema

A aplicação está com erro de CORS ao tentar fazer cadastro e login:

```
Access to XMLHttpRequest at 'https://api.quicktecnologia.com/auth/signup/company'
from origin 'http://localhost:3000' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solução (Backend)

O **backend** (API) precisa ser configurado para aceitar requisições do frontend.

### NestJS

Adicione no arquivo `main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',              // Desenvolvimento local
      'https://www.quicktecnologia.com',    // Produção
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  await app.listen(3000);
}
bootstrap();
```

### Express

Adicione no arquivo principal (app.js ou server.js):

```javascript
const express = require('express');
const cors = require('cors');

const app = express();

// Configurar CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://www.quicktecnologia.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Resto da configuração...
```

### Fastify

```javascript
const fastify = require('fastify')();

// Configurar CORS
fastify.register(require('@fastify/cors'), {
  origin: [
    'http://localhost:3000',
    'https://www.quicktecnologia.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
});
```

## Verificar se funcionou

Após configurar o CORS no backend:

1. **Reinicie o servidor backend**
2. **Teste o cadastro no frontend**:
   - Acesse: http://localhost:3000/signup
   - Preencha o formulário
   - Clique em "Finalizar"

3. **Teste o login**:
   - Acesse: http://localhost:3000/signin
   - Faça login com credenciais válidas

## Erro 502 Bad Gateway

Se você ainda receber erro 502, significa que a API está:
- ❌ Offline
- ❌ Com problemas de rede
- ❌ Em manutenção

Verifique:
```bash
# Testar se a API está respondendo
curl https://api.quicktecnologia.com/health

# ou
curl https://api.quicktecnologia.com/
```

## Frontend - Configuração Atual

O frontend está configurado para chamar a API diretamente:

- **Desenvolvimento**: `http://localhost:3000` → `https://api.quicktecnologia.com`
- **Produção**: `https://www.quicktecnologia.com` → `https://api.quicktecnologia.com`

Todas as chamadas vão direto para `https://api.quicktecnologia.com` conforme solicitado.

## Variáveis de Ambiente

O frontend usa estas variáveis (arquivo `.env`):

```env
NODE_ENV=production
NEXT_PUBLIC_API_HOST=https://api.quicktecnologia.com
NEXTAUTH_URL=https://www.quicktecnologia.com
```

## Próximos Passos

1. ✅ **Frontend configurado** - Aponta para API de produção
2. ⚠️ **Backend precisa configurar CORS** - Use as configurações acima
3. 🔄 **Reiniciar backend** após configurar
4. ✅ **Testar cadastro e login**
