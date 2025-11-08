"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import React from "react";
import { TextInput } from "../Input";
import { Button } from "@/components/ui/button";
import { useForm, type SubmitHandler } from "react-hook-form";
import type { SignInFormData } from "../../types/SingInType";
import { toast } from "sonner";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SignIn() {
  const routes = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>();

  const onSubmit: SubmitHandler<SignInFormData> = async (data) => {
    try {
      const response = await signIn("credentials", {
        ...data,
        redirect: false,
      });

      if (response?.ok) {
        toast.success("Login realizado com sucesso!", {
          description: "Você está sendo redirecionado para a página inicial",
          duration: 3000,
          position: "top-right",
          richColors: true,
        });
        routes.push("/dashboard");
      } else {
        toast.error("Erro ao realizar login!", {
          description: "Credenciais inválidas. Por favor, tente novamente.",
          duration: 3000,
          position: "top-right",
          richColors: true,
        });
      }
    } catch {
      toast.error("Login realizado com sucesso!", {
        description: "Você está sendo redirecionado para a página inicial",
        duration: 3000,
        position: "top-right",
        richColors: true,
      });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row">
      <div className="hidden lg:flex w-[50%] bg-gradient-to-b from-[#003B73] to-[#5DADE2] h-screen flex-col justify-between p-10">
        <div className="flex flex-col mb-10 text-center md:text-left">
          <h1 className="text-white text-4xl font-bold sm:text-3xl">Login</h1>
          <h3 className="text-white text-lg sm:text-base whitespace-nowrap pl-3.5">
            Entre com suas credenciais
          </h3>
        </div>
        <div className="flex items-start justify-center text-center">
          <Link
            href="/create-accounts"
            className="flex gap-2.5 py-2 items-center justify-center"
          >
            <Plus className="text-white" />
            <h4 className="text-white font-bold text-lg ">Cadastra-se</h4>
          </Link>
        </div>
      </div>
      <div className="flex items-center justify-center w-full h-screen">
        <form
          className="flex flex-col items-center justify-center w-full max-w-md gap-1 p-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <TextInput
            className="w-full  xl:w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
            labelName="Email"
            placeholder="Digite seu email"
            {...register("email", { required: true })}
          />
          {errors.email && (
            <span className="text-red-500 text-sm text-left w-[95%]">
              Este campo é obrigatório
            </span>
          )}
          <TextInput
            className="w-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
            labelName="Senha"
            placeholder="Digite sua senha"
            type="password"
            {...register("password", { required: true })}
          />
          {errors.password && (
            <span className="text-red-500 text-sm text-left  w-[95%]">
              Este campo é obrigatório
            </span>
          )}
          <div className="flex items-center justify-between w-[95%] mt-10 ">
            <Link
              href="/reset-password"
              className="text-[#5dade2] hover:text-[#ff0000] font-bold"
            >
              Esqueceu a senha
            </Link>
            <Button
              className="bg-[#024db9] hover:bg-[#5DADE2] hover:text-black px-5 w-[30%] text-white"
              type="submit"
            >
              Login
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
