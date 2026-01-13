import { useState, useCallback } from "react"
import { fetchAddressByCep, ViaCepAddress } from "../services/viaCep"

interface UseViaCepReturn {
  loading: boolean
  error: string | null
  data: ViaCepAddress | null
  fetchAddress: (cep: string) => Promise<ViaCepAddress | null>
}

/**
 * Hook para buscar dados de endereço pela API do ViaCEP
 */
export function useViaCep(): UseViaCepReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<ViaCepAddress | null>(null)

  const fetchAddress = useCallback(async (cep: string) => {
    setLoading(true)
    setError(null)

    try {
      const address = await fetchAddressByCep(cep)

      if (!address) {
        setError("CEP não encontrado")
        setData(null)
        return null
      }

      setData(address)
      return address
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao buscar CEP"
      setError(errorMessage)
      setData(null)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    data,
    fetchAddress,
  }
}
