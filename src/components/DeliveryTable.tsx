'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Eye, MoreVertical, Edit, Trash2, Package } from 'lucide-react'
import type { IDeliverySummaryResponse } from '../app/services/api'
import { StatusBadge } from '../app/components/StatusBadge'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip'

type Delivery = NonNullable<IDeliverySummaryResponse['deliveries']>[number]

export default function DeliveryTable({ deliveries }: { deliveries: Delivery[] }) {
  const router = useRouter()

  const handleViewDelivery = (d: Delivery) => {
    const idOrCode = d.code ?? d.id
    router.push(`/dashboard/store/delivery/${idOrCode}`)
  }

  const normalizeStatus = (status?: string): "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "CANCELED" => {
    if (!status) return "PENDING"
    const normalized = status.toUpperCase()
    if (normalized.includes('PEND')) return "PENDING"
    if (normalized.includes('PROGRESS') || normalized.includes('ANDAMENTO')) return "IN_PROGRESS"
    if (normalized.includes('COMPLET') || normalized.includes('DELIV') || normalized.includes('CONCLU')) return "COMPLETED"
    if (normalized.includes('CANCEL')) return "CANCELLED"
    return "PENDING"
  }

  const getCompanyName = (d: any): string => {
    // Tenta múltiplos campos possíveis para o nome da empresa
    if (d.clientName) return d.clientName
    if (d.companyName) return d.companyName
    if (d.Company?.name) return d.Company.name
    if (d.company?.name) return d.company.name
    if (d.Cliente?.name) return d.Cliente.name
    if (d.cliente?.name) return d.cliente.name

    // Se não encontrar nome, mostra ID ou placeholder
    if (d.companyId) return `Empresa #${d.companyId}`
    return '—'
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/50">
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Código
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Empresa
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Veículo
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Preço
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Telefone
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {deliveries.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="rounded-full bg-gray-100 p-4">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Nenhuma entrega encontrada</p>
                      <p className="text-sm text-gray-500">Comece criando uma nova entrega</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              deliveries.map((d) => (
                <tr
                  key={d.id}
                  className="group transition-colors duration-150 hover:bg-gray-50/50"
                >
                  <td className="px-6 py-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleViewDelivery(d)}
                            className="font-mono text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700"
                          >
                            {d.code ?? d.id}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Clique para ver detalhes</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={normalizeStatus(d.status)} />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">
                      {getCompanyName(d)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{d.email ?? '—'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-md bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-600/10">
                      {d.vehicleType ?? '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-green-600">
                      R$ {d.price}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{d.telefone ?? '—'}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDelivery(d)}
                        className="h-8 gap-1.5"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Ver
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={`Mais ações para entrega ${d.code ?? d.id}`}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => handleViewDelivery(d)}
                            className="gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Edit className="h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 text-red-600 focus:text-red-600">
                            <Trash2 className="h-4 w-4" />
                            Cancelar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
