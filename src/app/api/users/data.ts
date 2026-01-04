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
            phone: "11999999999",
            idAddress: 1,
            Adress: {
                id: 1,
                street: "Rua Tecnológica",
                number: "123",
                city: "São Paulo",
                state: "SP",
                zipCode: "01234-567",
                country: "Brasil",
                complement: "",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
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
            phone: "21988888888",
            idAddress: 2,
            Adress: {
                id: 2,
                street: "Av. das Entregas",
                number: "500",
                city: "Rio de Janeiro",
                state: "RJ",
                zipCode: "21000-000",
                country: "Brasil",
                complement: "",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
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
            phone: "3133333333",
            idAddress: 3,
            Adress: {
                id: 3,
                street: "Rua do Comércio",
                number: "10",
                city: "Belo Horizonte",
                state: "MG",
                zipCode: "30000-000",
                country: "Brasil",
                complement: "",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
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
