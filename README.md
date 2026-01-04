<style>
post {
  color: white;
  background: blue;
  font-weight: 900;
  padding: .2rem .4rem;
  border-radius: .5rem;
}

</style>

# Quick - funcionalidades

# Seed

```bash
yarn seed 
```

O script de seed inicializa o banco de dados com dados essenciais para o funcionamento da aplicação. Ele realiza as seguintes operações:

## 1. Tipos de Veículos (`VehicleType`)

- Cria ou atualiza os tipos de veículos disponíveis no sistema, com seus respectivos preços por quilômetro.
- **Tipos incluídos:**
  - Carro (R$ 1,50 por km)
  - Motocicleta (R$ 1,00 por km)
  - Caminhão (R$ 2,50 por km)
  - Ônibus (R$ 2,00 por km)
  - Bicicleta (R$ 0,50 por km)

## 2. Margem de Lucro (`ProfitMargin`)

- Define uma margem de lucro padrão de **10% (0.1)** para o sistema.
- Caso já exista uma margem de lucro configurada, ela não será sobrescrita.

## 3. Usuário Administrador

- Cria um usuário administrador com as seguintes credenciais:
  - **Email:** `admin@admin.com`
  - **Senha:** `secret_admin` (armazenada como hash)
- O administrador é criado com:
  - **Papel:** `ADMIN`
  - **Status:** `ACTIVE`
  - **Informação adicional:** "admin criado com seed"
- Um saldo inicial de **R$ 0,00** é associado ao administrador.

## Fluxo do Script

1. Conecta ao banco de dados.
2. Executa as funções de seed:
   - `seedProfit`: Insere a margem de lucro.
   - `seedvehicleTypes`: Insere os tipos de veículos.
   - `createAdminUser`: Cria o usuário administrador.
3. Desconecta do banco de dados após a execução.

## Logs

- O script utiliza o `Logger` do NestJS para registrar o progresso e possíveis erros durante a execução.

Este script garante que o sistema tenha dados básicos para iniciar, como tipos de veículos, uma margem de lucro padrão e um usuário administrador para gerenciar a aplicação.

<!-- - pra que taxa da saque, se pix é gratuito e nao usaremos getway de pagamento ? lucros
- notificações
  - email tem varias possibilidades de preços (inclusive algumas gratuitas)
  - api do whats app é paga por mensagem enviada
  - se for usar sms tbm é pago por mensagem usada
- quais os possiveis status de entrega ?
  - cadastrado, em andamento, cancelado, concluido ?
- como o kilometro sera contado ? medida em linha reta por raio, usando alguma api externa(possivelmente pago), etc ?
- quais regras usadas para calculo de preço ?
  - uma moto por 1 km ?
- sobre as entregas, se ele cadastrar 3 entregas de 10 reais. mas apenas 2 foram entregues. no dia do pagamento ele vai pagar pelas 3 ou apenas nas concluidas ?
- conta bancaria sera pix, ok ? possivelmente gratuito para validar, mas senão teriamos de pagar uma api externa que normalmente cobram por pacote
  - por exemplo, 1000 verificação mensal por 200 reias(valores ficticios)
- existe a possibilidade do adm colocar uma taxa mais baixa para uma loja do que pra outra ? sempre a mesma

não tera:

- chat

deveria ter :

- codigo de segurança, 4 digitos (random)
- rate  de entidades
  - stars
  - coments
- feedback (suporte)

--------

cadastro e validação por eles
 -->