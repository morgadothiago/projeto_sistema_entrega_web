import React from "react";
import { Building, FileText, Phone, Briefcase } from "lucide-react";
import { FormInput } from "../components/FormInput";
import { MaskedInput } from "../components/FormInput/MaskedInput";

export function BusinessDataStep() {
  return (
    <div className="space-y-5">
      {/* Nome da Empresa */}
      <FormInput
        name="companyName"
        label="Nome da Empresa"
        icon={<Building className="w-5 h-5 text-gray-400" />}
        placeholder="lojad"
      />

      {/* CNPJ e Telefone lado a lado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MaskedInput
          name="cnpj"
          label="CNPJ"
          icon={<FileText className="w-5 h-5 text-gray-400" />}
          mask="99.999.999/9999-99"
          placeholder="00.000.000/0000-00"
        />

        <MaskedInput
          name="phone"
          label="Telefone"
          icon={<Phone className="w-5 h-5 text-gray-400" />}
          mask="(99) 99999-9999"
          placeholder="(00) 00000-0000"
        />
      </div>

      {/* Tipo de Negócio */}
      <FormInput
        name="businessType"
        label="Tipo de Negócio"
        icon={<Briefcase className="w-5 h-5 text-gray-400" />}
        placeholder="Ex: Restaurante, Loja, Farmácia"
      />
    </div>
  );
}
