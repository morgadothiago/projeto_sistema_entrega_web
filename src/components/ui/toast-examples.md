# Sistema de Toast Personalizado

Este sistema de toast foi criado para padronizar e facilitar o uso de notificações em toda a aplicação.

## 🚀 Como Usar

### Importação Básica

```tsx
import {
  customToast,
  BillingToast,
  ReceiptToast,
  ValidationToast,
  AuthToast,
} from "@/components/ui/custom-toast"
```

### Uso Genérico

```tsx
// Toast básico
customToast.success("Operação realizada com sucesso!")
customToast.error("Erro ao processar solicitação")
customToast.warning("Atenção: dados incompletos")
customToast.info("Informação importante")

// Toast com opções personalizadas
customToast.success("Sucesso!", {
  duration: 3000,
  position: "bottom-right",
})
```

### Toasts Específicos por Contexto

#### BillingToast (Faturamentos)

```tsx
BillingToast.loaded() // "Faturamentos carregados com sucesso"
BillingToast.created() // "Faturamento criado com sucesso"
BillingToast.updated() // "Faturamento atualizado com sucesso"
BillingToast.deleted() // "Faturamento excluído com sucesso"
BillingToast.error("Mensagem") // Erro personalizado
BillingToast.validationError("Campo") // "Erro de validação: Campo é obrigatório"
BillingToast.networkError() // "Erro de conexão. Verifique sua internet e tente novamente"
BillingToast.unauthorized() // "Sessão expirada. Faça login novamente"
```

#### ReceiptToast (Recibos)

```tsx
ReceiptToast.created() // "Recibo criado com sucesso"
ReceiptToast.updated() // "Recibo atualizado com sucesso"
ReceiptToast.deleted() // "Recibo excluído com sucesso"
ReceiptToast.fileRequired() // "Selecione um arquivo para criar o recibo"
ReceiptToast.descriptionRequired() // "Digite uma descrição para o recibo"
ReceiptToast.uploadError() // "Erro ao fazer upload do arquivo"
ReceiptToast.invalidFileType() // "Tipo de arquivo não suportado"
```

#### ValidationToast (Validações)

```tsx
ValidationToast.required("Nome") // "Nome é obrigatório"
ValidationToast.invalidEmail() // "Email inválido"
ValidationToast.invalidPassword() // "Senha deve ter pelo menos 6 caracteres"
ValidationToast.passwordsNotMatch() // "Senhas não coincidem"
ValidationToast.invalidAmount() // "Valor deve ser maior que zero"
ValidationToast.invalidDate() // "Data inválida"
```

#### AuthToast (Autenticação)

```tsx
AuthToast.loginSuccess() // "Login realizado com sucesso"
AuthToast.logoutSuccess() // "Logout realizado com sucesso"
AuthToast.loginError() // "Erro ao fazer login. Verifique suas credenciais"
AuthToast.sessionExpired() // "Sessão expirada. Faça login novamente"
AuthToast.passwordChanged() // "Senha alterada com sucesso"
AuthToast.accountCreated() // "Conta criada com sucesso"
```

### Hook Personalizado

```tsx
import { useCustomToast } from "@/components/ui/custom-toast"

function MyComponent() {
  const toast = useCustomToast()

  const handleAction = () => {
    toast.success("Ação realizada!")
  }

  return <button onClick={handleAction}>Ação</button>
}
```

## 🎨 Configurações de Tema

As configurações de tema estão em `web/src/app/theme/global.ts`:

```tsx
export const toastConfig = {
  success: {
    position: "top-right",
    duration: 5000,
    style: {
      background: "#4CAF50",
      color: "white",
      border: "2px solid #45a049",
      borderRadius: "12px",
      fontSize: "14px",
      fontWeight: "600",
      boxShadow: "0 10px 25px rgba(76, 175, 80, 0.3)",
    },
    richColors: true,
    icon: "✅",
  },
  // ... outras configurações
}
```

## 📝 Exemplos Práticos

### Em um Formulário

```tsx
const handleSubmit = async (data) => {
  try {
    await api.createBilling(data)
    BillingToast.created()
  } catch (error) {
    BillingToast.error(error.message)
  }
}
```

### Em Validação

```tsx
const validateForm = (formData) => {
  if (!formData.name) {
    ValidationToast.required("Nome")
    return false
  }

  if (!formData.email.includes("@")) {
    ValidationToast.invalidEmail()
    return false
  }

  return true
}
```

### Em Upload de Arquivo

```tsx
const handleFileUpload = (file) => {
  if (!file) {
    ReceiptToast.fileRequired()
    return
  }

  if (![".pdf", ".jpg", ".png"].includes(file.extension)) {
    ReceiptToast.invalidFileType()
    return
  }

  // Processar upload...
  ReceiptToast.created()
}
```

## 🔧 Personalização

Para adicionar novos tipos de toast:

1. Adicione a configuração em `toastConfig` em `global.ts`
2. Crie um novo objeto de toast específico em `custom-toast.tsx`
3. Exporte e use onde necessário

```tsx
// Exemplo: UserToast
export const UserToast = {
  profileUpdated: () => customToast.success("Perfil atualizado com sucesso"),
  passwordChanged: () => customToast.success("Senha alterada com sucesso"),
  accountDeleted: () => customToast.warning("Conta excluída com sucesso"),
}
```

## 🎯 Benefícios

- **Consistência**: Todos os toasts seguem o mesmo padrão visual
- **Reutilização**: Mensagens padronizadas para contextos específicos
- **Manutenibilidade**: Fácil de atualizar mensagens em um local central
- **Tipagem**: TypeScript para melhor experiência de desenvolvimento
- **Flexibilidade**: Permite personalização quando necessário
