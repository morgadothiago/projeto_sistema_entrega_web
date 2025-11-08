"use client"

import * as React from "react"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table"

import type { EStatus } from "@/app/types/User"
import { Mail } from "lucide-react"

interface User {
  id: number
  name: string
  email: string
  role: string
  status: EStatus
}

export default function UserTable() {
  // Estado local para refletir mudanças imediatamente
  const [userList, setUserList] = React.useState<User[]>([])

  const handleStatusChange = async (userId: number, newStatus: EStatus) => {
    try {
      // Atualiza localmente
      setUserList((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      )
    } catch (error) {
      // Remover todos os console.log
    }
  }

  const formatStatus = (status?: string) => {
    switch (status) {
      case "ACTIVE":
        return "Ativo"
      case "INACTIVE":
        return "Inativo"
      case "BLOCKED":
        return "Bloqueado"
      default:
        return "Desconhecido"
    }
  }

  return (
    <div className="rounded-2xl border shadow-xl overflow-hidden bg-white">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-[#003873] to-[#5DADE2]">
              {["ID", "Nome", "Email", "Perfil", "Status"].map(
                (title, index) => (
                  <TableHead
                    key={`th-${index}`}
                    className="font-bold uppercase tracking-wider text-center text-white py-4"
                  >
                    {title}
                  </TableHead>
                )
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {userList.map((user) => (
              <TableRow
                key={`tr-${user.id}`}
                className="hover:bg-[#5DADE2]/10 transition-all duration-200"
              >
                <TableCell className="font-mono text-sm text-[#003873] py-4">
                  #{user.id}
                </TableCell>
                <TableCell className="font-medium text-[#2C3E50] py-4">
                  {user.name}
                </TableCell>
                <TableCell className="text-[#2C3E50] py-4">
                  {user.email}
                </TableCell>
                <TableCell className="py-4">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gradient-to-r from-[#5DADE2] to-[#003873] text-white shadow-sm">
                    {user.role || "Usuário"}
                  </span>
                </TableCell>
                <TableCell className="text-center py-4">
                  <div className="relative group">
                    <select
                      value={user.status}
                      onChange={(e) =>
                        handleStatusChange(user.id, e.target.value as EStatus)
                      }
                      title={`Status atual de ${user.name}: ${formatStatus(
                        user.status
                      )}`}
                      className={`
                        appearance-none px-4 py-2.5 rounded-xl border-2 
                        focus:outline-none focus:ring-2 focus:ring-[#003873] 
                        cursor-pointer transition-all duration-300 font-medium 
                        shadow-sm hover:shadow-md backdrop-blur-sm
                        ${
                          user.status === "ACTIVE"
                            ? "bg-gradient-to-br from-[#00FFB3]/90 to-[#00E6A3]/90"
                            : user.status === "INACTIVE"
                            ? "bg-gradient-to-br from-[#FFB300]/90 to-[#FFA000]/90"
                            : "bg-gradient-to-br from-[#FF3000]/90 to-[#FF2000]/90"
                        }
                        text-[#003873] border-[#003873]
                      `}
                    >
                      <option value="ACTIVE" className="bg-white/90">
                        Ativo
                      </option>
                      <option value="INACTIVE" className="bg-white/90">
                        Inativo
                      </option>
                      <option value="BLOCKED" className="bg-white/90">
                        Bloqueado
                      </option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-[#003873] transition-transform duration-300 group-hover:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden p-4 space-y-4">
        {userList.length === 0 && (
          <div className="p-8 text-center bg-gray-50 rounded-xl">
            <p className="text-[#2C3E50] font-medium">
              Nenhum usuário encontrado.
            </p>
          </div>
        )}
        {userList.map((user) => (
          <div
            key={`card-${user.id}`}
            className="group relative rounded-2xl border-2 p-6 bg-white shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
          >
            {/* Efeito de brilho no hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#003873]/0 via-[#5DADE2]/0 to-[#003873]/0 group-hover:from-[#003873]/5 group-hover:via-[#5DADE2]/10 group-hover:to-[#003873]/5 transition-all duration-500" />

            <div className="relative flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-[#003873] bg-[#003873]/5 px-3 py-1 rounded-full">
                  #{user.id}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-[#5DADE2] to-[#003873] text-white shadow-sm">
                  {user.role || "Usuário"}
                </span>
              </div>

              <div className="relative group/select">
                <select
                  value={user.status}
                  onChange={(e) =>
                    handleStatusChange(user.id, e.target.value as EStatus)
                  }
                  className="appearance-none px-4 py-2 rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-[#003873] cursor-pointer transition-all duration-300 font-medium shadow-sm hover:shadow-md backdrop-blur-sm"
                  style={{
                    background:
                      user.status === "ACTIVE"
                        ? "linear-gradient(135deg, #00FFB3, #00E6A3)"
                        : user.status === "INACTIVE"
                        ? "linear-gradient(135deg, #FFB300, #FFA000)"
                        : "linear-gradient(135deg, #FF3000, #FF2000)",
                    color: "#003873",
                    borderColor: "#003873",
                  }}
                >
                  <option value="ACTIVE" className="bg-white">
                    Ativo
                  </option>
                  <option value="INACTIVE" className="bg-white">
                    Inativo
                  </option>
                  <option value="BLOCKED" className="bg-white">
                    Bloqueado
                  </option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-300 group-hover/select:rotate-180">
                  <svg
                    className="w-4 h-4 text-[#003873]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="relative space-y-2">
              <h3 className="font-semibold text-xl text-[#2C3E50] group-hover:text-[#003873] transition-colors duration-300">
                {user.name}
              </h3>
              <p className="text-[#2C3E50]/80 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
