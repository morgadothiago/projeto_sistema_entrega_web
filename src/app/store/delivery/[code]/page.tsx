'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ApiService from '../../../services/api'

export default function DeliveryDetailPage() {
  const params = useParams()
  const code = Array.isArray(params?.code) ? params.code[0] : params?.code
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [delivery, setDelivery] = useState<any | null>(null)

  useEffect(() => {
    if (!code) return
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || '' : ''
    setLoading(true)
    ApiService.getDeliveryDetail(code, token)
      .then((res) => {
        if ((res as any)?.status && (res as any).message) {
          setError((res as any).message)
          setDelivery(null)
        } else {
          setDelivery(res)
        }
      })
      .catch((e) => setError(e?.message || 'Erro ao carregar detalhes'))
      .finally(() => setLoading(false))
  }, [code])

  if (!code) return <div className="p-6">Código inválido</div>

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => history.back()} className="text-sm text-indigo-600 mb-4">Voltar</button>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Carregando...</div>
      ) : error ? (
        <div className="py-12 text-center text-red-500">{error}</div>
      ) : !delivery ? (
        <div className="py-12 text-center text-gray-500">Nenhum detalhe encontrado</div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-2">Detalhes da entrega {delivery.code ?? code}</h2>

          <dl className="grid grid-cols-1 gap-y-3 gap-x-6 sm:grid-cols-2 mt-4">
            <div>
              <dt className="text-xs text-gray-500">Status</dt>
              <dd className="text-sm text-gray-800">{delivery.status ?? '—'}</dd>
            </div>

            <div>
              <dt className="text-xs text-gray-500">Preço</dt>
              <dd className="text-sm text-gray-800">{delivery.price ?? '—'}</dd>
            </div>

            <div>
              <dt className="text-xs text-gray-500">Cliente</dt>
              <dd className="text-sm text-gray-800">{delivery.clientName ?? '—'}</dd>
            </div>

            <div>
              <dt className="text-xs text-gray-500">Email</dt>
              <dd className="text-sm text-gray-800">{delivery.email ?? '—'}</dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-xs text-gray-500">Endereço</dt>
              <dd className="text-sm text-gray-800">{delivery.clientAddress ?? '—'}</dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-xs text-gray-500">Observações</dt>
              <dd className="text-sm text-gray-800">{delivery.observations ?? '—'}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  )
}
