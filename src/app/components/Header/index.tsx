"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/app/context"
import { Bell, LogOutIcon, Menu, User2, Settings } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

import { signOut } from "next-auth/react"
import api from "@/app/services/api"
import { useRouter } from "next/navigation"
import Image from "next/image"

import LogoMarca from "../../../../public/Logo.png"

export default function Header() {
  const { user } = useAuth()
  const router = useRouter()
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    // This will be replaced with actual API call to fetch notification count
    // For now, we'll check if there are any notifications
    setNotificationCount(0)
  }, [])

  const handleLogOut = async () => {
    await signOut({ redirect: false })
    api.cleanToken()
    router.push("/signin")
  }

  const balanceValue = user?.Balance?.amount || 0
  const isNegative = balanceValue < 0

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-2 sm:px-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger
            className="lg:hidden hover:bg-gray-100 transition-colors rounded-lg"
            size="lg"
            variant="ghost"
            aria-label="Abrir menu lateral"
          >
            <Menu className="h-5 w-5" />
          </SidebarTrigger>

          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <Image
                src={LogoMarca}
                alt={user?.Company?.name || "Logo da empresa"}
                width={40}
                height={40}
                priority
              />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {user?.Company?.name?.charAt(0) || user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="hidden sm:flex flex-col">
              <span className="text-xs text-gray-500">Bem-vindo,</span>
              <span className="font-bold text-sm text-gray-800 truncate max-w-[150px]">
                {user?.Company?.name || user?.name || "Usuário"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border transition-colors ${
            isNegative
              ? 'bg-red-50 border-red-200'
              : 'bg-primary/5 border-primary/10'
          }`}>
            <span className="text-xs sm:text-sm font-medium text-gray-600 hidden md:flex">
              Saldo:
            </span>
            <span className={`font-bold text-sm sm:text-base ${
              isNegative ? 'text-red-600' : 'text-primary'
            }`}>
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL"
              }).format(balanceValue)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-gray-100 rounded-lg"
                  aria-label={`Notificações${notificationCount > 0 ? ` - ${notificationCount} não lidas` : ''}`}
                >
                  <Bell className="h-5 w-5 text-gray-600" />
                  {notificationCount > 0 && (
                    <Badge
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 hover:bg-red-600 text-white text-[10px] rounded-full"
                    >
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Notificações</h4>
                  {notificationCount === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhuma notificação no momento
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {/* Notifications will be mapped here */}
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    className="w-full text-xs"
                    onClick={() => router.push("/dashboard/notification")}
                  >
                    Ver todas as notificações
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="flex items-center rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 flex-shrink-0 p-0 w-10 h-10 justify-center transition-all"
                  aria-label="Menu do usuário"
                >
                  <User2 className="w-5 h-5 text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 mt-2 rounded-xl shadow-xl border bg-white"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name || user?.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                    {user?.role && (
                      <Badge variant="outline" className="w-fit text-xs mt-1">
                        {user.role === "ADMIN" ? "Administrador" : "Usuário"}
                      </Badge>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex items-center gap-2 px-3 py-2 hover:bg-primary/10 cursor-pointer"
                  onClick={() => router.push("/dashboard/profile")}
                >
                  <User2 className="w-4 h-4 text-primary" />
                  <span>Meu Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="flex items-center gap-2 px-3 py-2 hover:bg-primary/10 cursor-pointer"
                  onClick={() => router.push("/dashboard/settings")}
                >
                  <Settings className="w-4 h-4 text-primary" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-600"
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
