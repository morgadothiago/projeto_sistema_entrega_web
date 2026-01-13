# 🧪 Como Testar o Login - Guia Completo

## ✅ API Verificada

A API está **online e funcionando**:

```bash
✅ API Status: https://api.quicktecnologia.com/ → 200 OK
✅ Login Endpoint: https://api.quicktecnologia.com/auth/login → Responde corretamente
```

---

## 🔍 Logs Detalhados Adicionados

O sistema agora mostra **TODOS** os detalhes da requisição:

```
[NextAuth] Tentando login em: https://api.quicktecnologia.com/auth/login
[NextAuth] Response status: 401
[NextAuth] Response headers: { content-type: 'application/json', ... }
[NextAuth] Response body: {"message":"Credenciais inválidas",...}
[NextAuth] Erro JSON parseado: { message: 'Credenciais inválidas', ... }
```

---

## 📋 Passo a Passo para Testar

### 1. **Limpar Cache e Reiniciar**

```bash
# Parar servidor se estiver rodando
Ctrl+C

# Limpar cache do Next.js
rm -rf .next

# Reinstalar dependências (opcional, apenas se necessário)
npm install

# Iniciar servidor novamente
npm run dev
```

### 2. **Abrir Terminal em Tela Cheia**

O terminal mostrará todos os logs detalhados. Mantenha-o visível.

### 3. **Abrir Navegador**

```
http://localhost:3000/signin
```

### 4. **Abrir Console do Navegador**

- Chrome/Edge: `F12` ou `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
- Firefox: `F12` ou `Ctrl+Shift+K` (Windows) / `Cmd+Option+K` (Mac)

### 5. **Fazer Login**

Digite **credenciais válidas** do seu banco de dados.

**⚠️ IMPORTANTE:** Use credenciais que existem no banco!

---

## 🔍 O Que Você Vai Ver

### ✅ **Login com Sucesso**

**Terminal (Servidor):**
```bash
[NextAuth] Tentando login em: https://api.quicktecnologia.com/auth/login
[NextAuth] Response status: 200
[NextAuth] Response headers: { content-type: 'application/json', ... }
[NextAuth] Response body: {"token":"eyJhbGc...","user":{...},...}
[NextAuth] Login bem-sucedido para: user@example.com
[NextAuth JWT] Novo login, salvando dados do usuário
```

**Navegador (Console):**
```
✅ Login realizado com sucesso!
Redirecionando para o painel...
```

**Resultado:** Você será redirecionado para `/dashboard`

---

### ❌ **Credenciais Inválidas (401)**

**Terminal (Servidor):**
```bash
[NextAuth] Tentando login em: https://api.quicktecnologia.com/auth/login
[NextAuth] Response status: 401
[NextAuth] Response headers: { content-type: 'application/json', ... }
[NextAuth] Response body: {"message":"Credenciais inválidas","error":"Unauthorized","statusCode":401}
[NextAuth] Erro JSON parseado: { message: 'Credenciais inválidas', ... }
[NextAuth] Erro no login: Error: Credenciais inválidas
```

**Navegador (Console):**
```
❌ Credenciais inválidas
Email ou senha incorretos
```

**Resultado:** Toast de erro aparece na tela

---

### ⚠️ **Erro de CORS**

**Navegador (Console):**
```
❌ Access to XMLHttpRequest at 'https://api.quicktecnologia.com/auth/login'
   from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solução:** Configure CORS no backend (ver `CONFIGURAR_CORS_BACKEND.md`)

---

### ⏱️ **Timeout (API não responde)**

**Terminal (Servidor):**
```bash
[NextAuth] Tentando login em: https://api.quicktecnologia.com/auth/login
[NextAuth] Erro no login: Error: Timeout ao conectar com o servidor. Tente novamente.
```

**Solução:**
1. Verificar se API está online
2. Verificar conexão de rede
3. Aumentar timeout se necessário

---

## 🐛 Debug Avançado

### Ver Resposta Completa da API

No terminal, você verá:

```bash
[NextAuth] Response body: {"token":"eyJhbGc...","user":{"id":1,"email":"user@example.com"},...}
```

Se a resposta for muito grande, ela será truncada em 500 caracteres. Para ver completa:

```bash
# No arquivo auth.ts linha 153, mude:
responseText.substring(0, 500)
# para:
responseText
```

### Testar API Manualmente

```bash
# Teste com credenciais inválidas (deve retornar 401)
curl -X POST https://api.quicktecnologia.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}' \
  -w "\nStatus: %{http_code}\n"

# Teste com credenciais válidas (substitua pelos dados reais)
curl -X POST https://api.quicktecnologia.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"SEU_EMAIL","password":"SUA_SENHA"}' \
  -w "\nStatus: %{http_code}\n"
```

### Ver Sessão Atual

Após fazer login, no console do navegador:

```javascript
// Ver dados da sessão
fetch('/api/auth/session')
  .then(r => r.json())
  .then(console.log)
```

Deve retornar:
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "COMPANY"
  },
  "token": "eyJhbGc...",
  "expires": "2026-01-19T..."
}
```

---

## ❓ Possíveis Problemas e Soluções

### 1. "Erro desconhecido"

**Causa:** API retornou resposta não-JSON ou vazia

**Debug:**
- Verificar logs: `[NextAuth] Response body: ...`
- Se estiver vazio ou HTML, a API tem problema

**Solução:**
- Verificar se backend está configurado corretamente
- Verificar se endpoint `/auth/login` existe

---

### 2. "Credenciais inválidas" com credenciais corretas

**Causa:** Senha ou email incorretos no banco

**Debug:**
- Verificar banco de dados
- Verificar se senha está hasheada corretamente

**Solução:**
```sql
-- Verificar usuário no banco
SELECT id, email, role, status FROM users WHERE email = 'seu@email.com';
```

---

### 3. "Timeout ao conectar"

**Causa:** API não responde em 10 segundos

**Debug:**
```bash
# Testar latência
time curl https://api.quicktecnologia.com/
```

**Solução:**
- Se levar mais de 10s, aumentar timeout em `auth.ts:141`
- Verificar conexão de rede

---

### 4. Nada aparece nos logs

**Causa:** Servidor não iniciou corretamente

**Solução:**
```bash
# Reiniciar servidor
Ctrl+C
npm run dev
```

---

## ✅ Checklist de Verificação

Antes de reportar erro, verifique:

- [ ] Servidor rodando (`npm run dev`)
- [ ] API online (curl retorna 200)
- [ ] Credenciais válidas (existem no banco)
- [ ] Console do navegador aberto
- [ ] Terminal visível para ver logs
- [ ] Sem erros de CORS no console
- [ ] Build foi feito (`npm run build` sem erros)

---

## 📞 Ao Reportar Problema

**Compartilhe:**

1. **Logs completos do terminal** (copie tudo)
2. **Logs do console do navegador** (aba Console)
3. **Resultado do teste manual da API:**
   ```bash
   curl -X POST https://api.quicktecnologia.com/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"seu@email.com","password":"suasenha"}'
   ```
4. **Credenciais usadas** (apenas confirmar que existem no banco, não envie senha)

---

## 🎯 Teste Rápido

Execute este script para testar tudo:

```bash
# 1. Testar API
echo "=== Testando API ==="
curl -s https://api.quicktecnologia.com/ && echo "✅ API Online"

# 2. Testar endpoint de login
echo -e "\n=== Testando Login Endpoint ==="
curl -X POST https://api.quicktecnologia.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}' \
  -w "\nStatus: %{http_code}\n"

# 3. Build
echo -e "\n=== Fazendo Build ==="
npm run build 2>&1 | grep -E "(Compiled|Error)"

# 4. Iniciar servidor
echo -e "\n=== Iniciando Servidor ==="
npm run dev
```

---

## 🚀 Status Atual

✅ **API funcionando**
✅ **Logs detalhados adicionados**
✅ **Tratamento de erro melhorado**
✅ **Build compilando**
⚠️ **Aguardando teste com credenciais válidas**

**Agora teste o login e compartilhe os logs do terminal!**
