import React from "react";
import { TextInput } from "../components/TextInput";
import { useFormContext } from "react-hook-form";
import { Mail, Lock, Shield } from "lucide-react";

export function AccessDataStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <TextInput
          labelName="Email"
          type="email"
          className="w-full"
          placeholder="Digite seu email"
          icon={<Mail className="w-5 h-5 text-gray-400" />}
          classNameInput=""
          {...register("email", { required: true })}
        />
        {errors.email && (
          <span className="text-red-500 text-sm flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Email é obrigatório
          </span>
        )}
      </div>

      <div className="space-y-2">
        <TextInput
          labelName="Senha"
          type="password"
          className="w-full"
          placeholder="Digite sua senha"
          icon={<Lock className="w-5 h-5 text-gray-400" />}
          classNameInput=""
          {...register("password", { required: true })}
        />
        {errors.password && (
          <span className="text-red-500 text-sm flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Senha é obrigatória
          </span>
        )}
      </div>

      <div className="space-y-2">
        <TextInput
          labelName="Confirmar Senha"
          type="password"
          className="w-full"
          placeholder="Confirme sua senha"
          icon={<Shield className="w-5 h-5 text-gray-400" />}
          classNameInput=""
          {...register("confirmPassword", { required: true })}
        />
        {errors.confirmPassword && (
          <span className="text-red-500 text-sm flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Confirmação de senha é obrigatória
          </span>
        )}
      </div>
    </div>
  );
}
