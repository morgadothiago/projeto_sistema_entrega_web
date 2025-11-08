import React from "react";
import { TextInput } from "../components/TextInput";
import { useFormContext, UseFormRegister } from "react-hook-form";
import { useHookFormMask } from "use-mask-input";
import { Building2, Phone, FileText, Store } from "lucide-react";

type MaskOptions = {
  mask: string[];
  required?: boolean;
};

type RegisterWithMask = (
  name: string,
  options: MaskOptions
) => ReturnType<
  UseFormRegister<{
    address: string;
    number: string;
    complement: string;
    city: string;
    state: string;
    zipCode: string;
    name: string;
    cnpj: string;
    phone: string;
    businessType: string;
  }>
>;

type FormData = {
  address: string;
  number: string;
  complement: string;
  city: string;
  state: string;
  zipCode: string;
  name: string;
  cnpj: string;
  phone: string;
  businessType: string;
};

export function BusinessDataStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<FormData>();

  const registerWithMask = useHookFormMask(
    register
  ) as unknown as RegisterWithMask;
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <TextInput
          labelName="Nome da Empresa"
          className="w-full"
          placeholder="Digite o nome da empresa"
          icon={<Building2 className="w-5 h-5 text-gray-400" />}
          classNameInput=""
          {...register("name", { required: true })}
        />
        {errors.name && (
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
            Nome da empresa é obrigatório
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <TextInput
            labelName="CNPJ"
            className="w-full"
            placeholder="00.000.000/0000-00"
            icon={<FileText className="w-5 h-5 text-gray-400" />}
            classNameInput=""
            {...registerWithMask("cnpj", {
              mask: ["99.999.999/9999-99"] as string[],
              required: true,
            })}
          />
          {errors.cnpj && (
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
              CNPJ é obrigatório
            </span>
          )}
        </div>

        <div className="space-y-2">
          <TextInput
            labelName="Telefone"
            className="w-full"
            placeholder="(00) 00000-0000"
            icon={<Phone className="w-5 h-5 text-gray-400" />}
            classNameInput=""
            {...registerWithMask("phone", {
              mask: ["(99) 99999-9999"] as string[],
              required: true,
            })}
          />
          {errors.phone && (
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
              Telefone é obrigatório
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <TextInput
          labelName="Tipo de Negócio"
          className="w-full"
          placeholder="Digite o tipo de negócio"
          icon={<Store className="w-5 h-5 text-gray-400" />}
          classNameInput=""
          {...register("businessType", { required: true })}
        />
        {errors.businessType && (
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
            Tipo de negócio é obrigatório
          </span>
        )}
      </div>
    </div>
  );
}
