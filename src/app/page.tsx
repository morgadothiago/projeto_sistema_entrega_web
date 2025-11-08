"use client";

import React from "react";
import Image from "next/image";

import quickLogo from "@/app/assets/img3.png";
import Logo from "@/app/assets/img2.png";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const routes = useRouter();

  function handleSignInPage() {
    routes.push("/signin");
  }

  return (
    <div className="w-screen min-h-screen flex flex-col">
      {/* Top Bar com logo */}
      <header className="w-full h-16 md:h-20 bg-[#00449a] flex items-center justify-center px-4">
        <Image
          src={quickLogo}
          alt="logo"
          className="w-22 h-22 md:w-26 md:h-26 object-contain"
        />
      </header>

      {/* Conteúdo principal */}
      <main className="relative flex-1 flex items-center justify-center bg-[#00449a] overflow-hidden">
        {/* Imagem de fundo com overlay escura */}
        <div className="absolute inset-0 z-0">
          <Image
            src={Logo}
            alt="Logo Quick Fast"
            className="w-full h-full p-10 object-cover opacity-30"
            fill
            priority
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        {/* Conteúdo acima da imagem */}
        <div className="relative z-10 text-center px-6 w-full max-w-2xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-lg leading-snug">
            Quick Fast
          </h1>
          <p className="mt-6 text-base sm:text-lg md:text-2xl text-white font-medium drop-shadow-md">
            Faça login para acessar sua conta e aproveitar nossos serviços
            rápidos e eficientes.
          </p>
          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleSignInPage}
              className="px-6 py-3 font-bold text-base sm:text-lg  bg-[#00FFB3] text-[#00449a] rounded-xl shadow-md hover:bg-gray-200 transition"
            >
              Acessar agora
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
