import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { MapPin, Hash, Building, Navigation, Loader2, ChevronDown } from "lucide-react";
import { FormInput } from "../components/FormInput";
import { MaskedInput } from "../components/FormInput/MaskedInput";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useViaCep } from "../hooks/useViaCep";
import { unmaskInput } from "../utils/unmaskInput";
import { SignupFormData } from "../schema/signupSchema";

const ESTADOS_BRASIL = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

export function AddressStep() {
  const {
    setValue,
    watch,
    register,
    formState: { errors },
  } = useFormContext<SignupFormData>();

  const { loading, error, fetchAddress } = useViaCep();
  const zipCode = watch("zipCode");

  useEffect(() => {
    const fetchCepData = async () => {
      if (zipCode && zipCode.replace(/\D/g, "").length === 8) {
        const cleanedCep = unmaskInput(zipCode);
        const address = await fetchAddress(cleanedCep);

        if (address) {
          setValue("address", address.logradouro);
          setValue("city", address.localidade);
          setValue("state", address.uf);

          toast.success("CEP encontrado!", {
            description: `Endereço preenchido automaticamente: ${address.localidade} - ${address.uf}`,
          });
        }
      }
    };

    fetchCepData();
  }, [zipCode, fetchAddress, setValue]);

  return (
    <div className="space-y-5">
      {/* CEP */}
      <div className="relative">
        <MaskedInput
          name="zipCode"
          label="CEP"
          icon={<Navigation className="w-5 h-5 text-gray-400" />}
          mask="99999-999"
          placeholder="05835-004"
        />
        {loading && (
          <div className="absolute right-3 top-[42px]">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-500 flex items-center gap-2">
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
          {error}
        </div>
      )}

      {/* Endereço */}
      <FormInput
        name="address"
        label="Endereço"
        icon={<MapPin className="w-5 h-5 text-gray-400" />}
        placeholder="Estrada de Itapecerica"
      />

      {/* Número e Complemento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          name="number"
          label="Número"
          icon={<Hash className="w-5 h-5 text-gray-400" />}
          placeholder="20"
        />

        <FormInput
          name="complement"
          label="Complemento"
          icon={<Building className="w-5 h-5 text-gray-400" />}
          placeholder="loja terrio"
        />
      </div>

      {/* Cidade e Estado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          name="city"
          label="Cidade"
          icon={<MapPin className="w-5 h-5 text-gray-400" />}
          placeholder="São Paulo"
        />

        {/* UF Select */}
        <div className="group space-y-2.5">
          <Label
            htmlFor="state"
            className="text-sm font-semibold text-gray-700 group-focus-within:text-[#5DADE2] transition-colors duration-200"
          >
            UF
          </Label>
          <div className="relative">
            <select
              id="state"
              {...register("state")}
              className={`
                h-12 w-full
                pl-4 pr-10
                text-base
                bg-white
                border-2
                ${errors.state
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                  : "border-gray-200 focus:border-[#5DADE2] focus:ring-[#5DADE2]/20"
                }
                rounded-xl
                shadow-sm hover:shadow-md
                transition-all duration-200
                focus:ring-4 focus:outline-none
                appearance-none
                cursor-pointer
              `}
            >
              <option value="">Selecione</option>
              {ESTADOS_BRASIL.map((estado) => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
              <ChevronDown className="h-5 w-5" />
            </div>
          </div>
          {errors.state?.message && (
            <div className="flex items-start gap-2 px-1 text-red-600 text-sm font-medium">
              <span>{errors.state.message as string}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
