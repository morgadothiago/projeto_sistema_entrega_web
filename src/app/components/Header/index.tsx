"use client"

import React from "react"
import { useAuth } from "@/app/context"
import { Bell, LogOutIcon, Menu, User2 } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Avatar,
  AvatarFallback /* , AvatarImage */,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { signOut } from "next-auth/react"
import api from "@/app/services/api"
import { useRouter } from "next/navigation"

import LogoMarca from "../../../../public/Logo.png"

export default function Header() {
  const { user } = useAuth()
  const router = useRouter()

  const handleLogOut = async () => {
    await signOut({ redirect: false })
    api.cleanToken()
    router.push("/signin")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-md">
      <div className="container flex h-16 items-center justify-between px-2 sm:px-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger
            className="lg:hidden hover:bg-gray-100 transition-colors"
            size="lg"
            variant="ghost"
          >
            <Menu className="h-5 w-5" />
          </SidebarTrigger>

          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-15 border-2 border-primary/20">
              <AvatarImage src={LogoMarca.src} alt={user?.name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {user?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500  md:flex">Bem-vindo,</span>
              <span className="font-bold text-lg text-gray-800">
                {user?.Company?.name || "Empresa"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-primary/10">
            <span className="text-sm font-medium text-gray-600 hidden md:flex">
              Debitos:
            </span>
            <span className="font-bold text-primary">
              R${" "}
              {user?.Balance?.amount?.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              }) || "0,00"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                3
              </span>
            </Button>
            {/* User Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="flex items-center rounded-full bg-[#5DADE2] hover:bg-[#003B73] flex-shrink-0 p-0 w-10 h-10 justify-center">
                  <User2 className="w-6 h-6 text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-44 mt-2 rounded-xl shadow-xl border bg-white animate-fade-in"
              >
                <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 hover:bg-primary/10 cursor-pointer">
                  <User2 className="w-4 h-4 text-primary" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600 cursor-pointer"
                  onClick={handleLogOut}
                >
                  <LogOutIcon className="w-4 h-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
