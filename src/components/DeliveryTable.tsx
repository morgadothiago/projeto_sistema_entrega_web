'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import type { IDeliverySummaryResponse } from '../app/services/api'

type Delivery = NonNullable<IDeliverySummaryResponse['deliveries']>[number]

export default function DeliveryTable({ deliveries }: { deliveries: Delivery[] }) {
  const router = useRouter()

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto bg-transparent">
        <thead>
          <tr className="text-left text-sm text-gray-500">
            <th className="px-4 py-3">Código</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Empresa</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Veículo</th>
            <th className="px-4 py-3">Preço</th>
            <th className="px-4 py-3">Telefone</th>
            <th className="px-4 py-3">Ações</th>
          </tr>
        </thead>
        <tbody>
          {deliveries.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-8 text-center text-gray-400">
                Sem entregas
              </td>
            </tr>
          ) : (
            deliveries.map((d) => (
              <tr key={d.id} className="border-t">
                <td className="px-4 py-3 text-indigo-600 font-medium">{d.code ?? d.id}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs ${d.status?.toLowerCase().includes('pend') ? 'bg-yellow-100 text-yellow-800' :
                      d.status?.toLowerCase().includes('deliv') ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}
                  >
                    {d.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{d.clientName ?? '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{d.email ?? '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{d.vehicleType ?? '—'}</td>
                <td className="px-4 py-3 text-sm text-green-600 font-semibold">{d.price}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{d.telefone ?? '—'}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => {
                      const idOrCode = d.code ?? d.id
                      console.log('🔗 Navigating to delivery detail:', { code: d.code, id: d.id, using: idOrCode })
                      router.push(`/dashboard/store/delivery/${idOrCode}`)
                    }}
                    className="text-indigo-600 hover:underline text-sm"
                    aria-label={`Ver detalhes da entrega ${d.code ?? d.id}`}
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
