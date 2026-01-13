import React from "react";
import { Mail, Lock, Shield } from "lucide-react";
import { FormInput } from "../components/FormInput";

export function AccessDataStep() {
  return (
    <div className="space-y-5">
      {/* Email */}
      <FormInput
        name="email"
        label="Email"
        type="email"
        icon={<Mail className="w-5 h-5 text-gray-400" />}
        placeholder="seu@email.com"
      />

      {/* Senha */}
      <FormInput
        name="password"
        label="Senha"
        type="password"
        icon={<Lock className="w-5 h-5 text-gray-400" />}
        placeholder="Digite uma senha forte"
      />

      {/* Confirmar Senha */}
      <FormInput
        name="confirmPassword"
        label="Confirmar Senha"
        type="password"
        icon={<Shield className="w-5 h-5 text-gray-400" />}
        placeholder="Digite a senha novamente"
      />
    </div>
  );
}
