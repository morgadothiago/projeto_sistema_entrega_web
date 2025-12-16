import { ERole, EStatus, User } from "@/app/types/User"

export const users: User[] = [
    {
        id: 1,
        name: "Tech Solutions Ltda",
        email: "contato@techsolutions.com",
        role: ERole.COMPANY,
        status: EStatus.ACTIVE,
        Balance: {
            amount: 1500.00,
            currency: "BRL"
        },
        Company: {
            id: 1,
            name: "Tech Solutions",
            cnpj: "12345678000199",
            address: "Rua Tecnológica, 123",
            city: "São Paulo",
            state: "SP",
            zipCode: "01234-567",
            phone: "11999999999"
        },
        Extract: [],
        emailVerified: new Date()
    },
    {
        id: 2,
        name: "Logística Rápida",
        email: "adm@logisticarapida.com.br",
        role: ERole.COMPANY,
        status: EStatus.ACTIVE,
        Balance: {
            amount: 3200.50,
            currency: "BRL"
        },
        Company: {
            id: 2,
            name: "Logística Rápida",
            cnpj: "98765432000155",
            address: "Av. das Entregas, 500",
            city: "Rio de Janeiro",
            state: "RJ",
            zipCode: "21000-000",
            phone: "21988888888"
        },
        Extract: [],
        emailVerified: new Date()
    },
    {
        id: 3,
        name: "João da Silva",
        email: "joao.silva@email.com",
        role: ERole.DELIVERY,
        status: EStatus.ACTIVE,
        Balance: {
            amount: 450.00,
            currency: "BRL"
        },
        Company: {} as any, // Entregador não tem empresa vinculada da mesma forma
        Extract: [],
        emailVerified: new Date()
    },
    {
        id: 4,
        name: "Maria Oliveira",
        email: "maria.entregas@email.com",
        role: ERole.DELIVERY,
        status: EStatus.ACTIVE,
        Balance: {
            amount: 120.00,
            currency: "BRL"
        },
        Company: {} as any,
        Extract: [],
        emailVerified: new Date()
    },
    {
        id: 5,
        name: "Mercado do Bairro",
        email: "contato@mercadobairro.com",
        role: ERole.COMPANY,
        status: EStatus.INACTIVE,
        Balance: {
            amount: 0.00,
            currency: "BRL"
        },
        Company: {
            id: 3,
            name: "Mercado do Bairro",
            cnpj: "11222333000144",
            address: "Rua do Comércio, 10",
            city: "Belo Horizonte",
            state: "MG",
            zipCode: "30000-000",
            phone: "3133333333"
        },
        Extract: [],
        emailVerified: new Date()
    },
    {
        id: 6,
        name: "Pedro Santos",
        email: "pedro.moto@email.com",
        role: ERole.DELIVERY,
        status: EStatus.BLOCKED,
        Balance: {
            amount: 50.00,
            currency: "BRL"
        },
        Company: {} as any,
        Extract: [],
        emailVerified: new Date()
    }
]
