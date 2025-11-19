"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import { itemAdm, items, itemSupport } from "@/app/utils/menu"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/app/context"
import Image from "next/image"
import logoMarcaSimbol from "../../../../public/Logo.png"
import { toast } from "sonner"

export function SideBar() {
  const { user } = useAuth()
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const router = useRouter()
  const { setOpenMobile } = useSidebar()

  function handleNextPage(itemTitle: string) {
    setSelectedItem(itemTitle)
    router.push(`/dashboard/${itemTitle}`)
    setOpenMobile(false)
  }

  function handleEmailSupport() {
    const email = "suporte@empresa.com"
    const subject = encodeURIComponent("Suporte - Sistema de Entregas")
    const body = encodeURIComponent(
      `Olá,\n\nPreciso de ajuda com:\n\n---\nUsuário: ${user?.name || user?.email}\nEmpresa: ${user?.Company?.name || "N/A"}\n`
    )
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank")
    toast.success("Cliente de e-mail aberto!")
  }

  function handleWhatsAppSupport() {
    const phoneNumber = "5511999999999" // Replace with actual support number
    const message = encodeURIComponent(
      `Olá! Preciso de suporte.\n\nUsuário: ${user?.name || user?.email}\nEmpresa: ${user?.Company?.name || "N/A"}`
    )
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank")
    toast.success("WhatsApp aberto!")
  }

  return (
    <Sidebar className="flex-1 flex h-screen shadow-xl transition-all duration-300 ease-in-out ">
      <div className="bg-gradient-to-b from-[#003B73] via-[#2E86C1] to-[#5DADE2] flex-1 flex flex-col p-6">
        <SidebarHeader className="">
          <div className="flex flex-col items-center justify-center gap-2 py-4 px-2  animate-fade-in transition-all duration-500">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Image
                src={logoMarcaSimbol}
                alt={user?.Company?.name || "Logo da empresa"}
                className="w-12 h-12 object-contain"
                aria-label="Logo da empresa"
                title={user?.Company?.name || "Logo da empresa"}
                priority
              />
            </div>
            <h1
              className="text-white font-black text-xl md:text-2xl tracking-tight text-center max-w-[220px] break-words whitespace-normal leading-tight"
              title={user?.Company?.name || "Sistema de Entregas"}
            >
              {user?.Company?.name || "Sistema de Entregas"}
            </h1>
            <span className="text-white/80 text-xs text-center max-w-[180px] italic font-light">
              Entregando com agilidade
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent className="overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {/* Menu para usuários comuns (não admin) */}
          {user?.role !== "ADMIN" && (
            <SidebarGroup className="mb-6">
              <SidebarGroupLabel className="text-lg text-white/90 font-semibold mb-3">
                Application
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {items.map((item) => (
                    <SidebarMenuItem
                      key={item.title}
                      className={`transition-all duration-200 rounded-xl ${
                        selectedItem === item.title
                          ? "bg-white/95 text-[#003B73] shadow-lg transform scale-[1.02]"
                          : "text-white hover:bg-white/10 hover:transform hover:scale-[1.02]"
                      }`}
                    >
                      <SidebarMenuButton asChild>
                        <a
                          onClick={() => handleNextPage(item.url)}
                          className="flex items-center p-3 w-full"
                        >
                          <item.icon className="mr-3 flex-shrink-0 w-5 h-5" />
                          <span className="text-[15px] font-medium truncate">
                            {item.subTile}
                          </span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Menu apenas para administradores */}
          {user?.role === "ADMIN" && (
            <SidebarGroup className="mb-6">
              <SidebarGroupLabel className="text-lg text-white/90 font-semibold mb-3">
                Administrativa
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {itemAdm.map((item) => (
                    <SidebarMenuItem
                      key={item.title}
                      className={`transition-all duration-200 rounded-xl ${
                        selectedItem === item.subTile
                          ? "bg-white/95 text-[#003B73] shadow-lg transform scale-[1.02]"
                          : "text-white hover:bg-white/10 hover:transform hover:scale-[1.02]"
                      }`}
                    >
                      <SidebarMenuButton asChild>
                        <a
                          onClick={() => handleNextPage(item.url)}
                          className="flex items-center p-3 w-full"
                        >
                          <item.icon className="mr-2 flex-shrink-0" />
                          <span className="text-sm md:text-sm truncate">
                            {item.subTile}
                          </span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {/* Menu de suporte para todos os usuários */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-lg text-white/90 font-semibold mb-3">
              Suporte
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {itemSupport.map((item) => (
                  <SidebarMenuItem
                    key={item.title}
                    className="transition-all duration-200 rounded-xl text-white hover:bg-white/10 hover:transform hover:scale-[1.02]"
                  >
                    <SidebarMenuButton asChild>
                      <button
                        onClick={() => {
                          if (item.action === "email") {
                            handleEmailSupport()
                          } else if (item.action === "whatsapp") {
                            handleWhatsAppSupport()
                          }
                        }}
                        className="flex items-center p-3 w-full"
                      >
                        <item.icon className="mr-3 flex-shrink-0 w-5 h-5" />
                        <span className="text-[15px] font-medium truncate">
                          {item.title}
                        </span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </div>
    </Sidebar>
  )
}
