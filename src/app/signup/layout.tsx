import { LogIn, Plus } from "lucide-react"
import Link from "next/link"
import React, { type ReactNode } from "react"
import bannerCadastrase from "../../../public/banner_cadastro.png"

export default function layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col lg:flex-row">
      <div
        className="hidden lg:flex w-[598px] h-screen flex-col justify-center items-center relative overflow-hidden"
        style={{
          backgroundImage: `url(${bannerCadastrase.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Div para botão de cadastro no final, centralizado */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center w-full px-10">
          <Link
            href="/signin"
            className="flex gap-2.5 py-2 items-center justify-center bg-gradient-to-r from-cyan-400 to-blue-600 shadow-lg hover:scale-105 hover:shadow-xl focus:ring-4 focus:ring-cyan-300/60 rounded-xl px-8 text-white font-bold text-lg transition-all duration-200 outline-none ring-0 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]"
            style={{
              boxShadow:
                "0 4px 24px 0 rgba(56,189,248,0.25), 0 0 16px 2px rgba(56,189,248,0.4)",
            }}
          >
            <LogIn className="text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.7)]" />
            <span className="drop-shadow-[0_0_6px_rgba(56,189,248,0.7)]">
              Fazer login
            </span>
          </Link>
        </div>
      </div>
      <div className="flex items-center justify-center w-full h-screen">
        {children}
      </div>
    </div>
  )
}
