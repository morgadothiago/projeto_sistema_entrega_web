export interface ViaCepAddress {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  ibge: string
  gia: string
  ddd: string
  siafi: string
  erro?: boolean
}

/**
 * Busca dados de endereço pela API do ViaCEP
 * @param cep - CEP no formato 00000-000 ou 00000000
 * @returns Dados do endereço ou null em caso de erro
 */
export async function fetchAddressByCep(cep: string): Promise<ViaCepAddress | null> {
  try {
    // Remove caracteres não numéricos do CEP
    const cleanCep = cep.replace(/\D/g, "")

    // Valida o formato do CEP
    if (cleanCep.length !== 8) {
      throw new Error("CEP inválido")
    }

    // Faz a requisição para a API do ViaCEP
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)

    if (!response.ok) {
      throw new Error("Erro ao buscar CEP")
    }

    const data: ViaCepAddress = await response.json()

    // Verifica se o CEP foi encontrado
    if (data.erro) {
      throw new Error("CEP não encontrado")
    }

    return data
  } catch (error) {
    return null
  }
}
