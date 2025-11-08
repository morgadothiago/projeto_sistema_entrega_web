import React from "react";
import { TextInput } from "../components/TextInput";
import { Select } from "@/app/components/Select";
import { useFormContext, UseFormRegister } from "react-hook-form";
import { cities } from "../utils/citys";
import { ufs } from "../utils/citys";
import { useHookFormMask } from "use-mask-input";
import { MapPin, Hash, Building, Navigation } from "lucide-react";

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
  }>
>;

export function AddressStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const registerWithMask = useHookFormMask(
    register
  ) as unknown as RegisterWithMask;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <TextInput
          labelName="Endereço"
          className="w-full"
          placeholder="Digite o endereço"
          icon={<MapPin className="w-5 h-5 text-gray-400" />}
          classNameInput=""
          {...register("address", { required: true })}
        />
        {errors.address && (
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
            Endereço é obrigatório
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <TextInput
            labelName="Número"
            className="w-full"
            placeholder="Digite o número"
            icon={<Hash className="w-5 h-5 text-gray-400" />}
            classNameInput=""
            {...register("number", { required: true })}
          />
          {errors.number && (
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
              Número é obrigatório
            </span>
          )}
        </div>

        <div className="space-y-2">
          <TextInput
            labelName="Complemento"
            className="w-full"
            placeholder="Digite o complemento"
            icon={<Building className="w-5 h-5 text-gray-400" />}
            classNameInput=""
            {...register("complement", { required: true })}
          />
          {errors.complement && (
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
              Complemento é obrigatório
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Select
            labelName="Cidade"
            options={cities}
            {...register("city", { required: true })}
            className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5DADE2] focus:border-transparent transition-all duration-200 bg-white text-sm"
          />
          {errors.city && (
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
              Cidade é obrigatória
            </span>
          )}
        </div>

        <div className="space-y-2">
          <Select
            labelName="UF"
            options={ufs}
            {...register("state", { required: true })}
            className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5DADE2] focus:border-transparent transition-all duration-200 bg-white text-sm"
          />
          {errors.state && (
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
              Estado UF é obrigatório
            </span>
          )}
        </div>

        <div className="space-y-2">
          <TextInput
            {...registerWithMask("zipCode", {
              mask: ["99999-999"],
              required: true,
            })}
            labelName="CEP"
            className="w-full"
            placeholder="00000-000"
            icon={<Navigation className="w-5 h-5 text-gray-400" />}
            classNameInput=""
          />
          {errors.zipCode && (
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
              CEP é obrigatório
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
