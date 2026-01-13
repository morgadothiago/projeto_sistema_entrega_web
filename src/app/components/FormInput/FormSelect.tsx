import React from "react"
import { Label } from "@/components/ui/label"
import { AlertCircle, ChevronDown } from "lucide-react"
import { useFormContext } from "react-hook-form"

export interface FormSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "className"> {
  name: string
  label: string
  options: { value: string; label: string }[]
  containerClassName?: string
  selectClassName?: string
  placeholder?: string
}

export const FormSelect: React.FC<FormSelectProps> = ({
  name,
  label,
  options,
  containerClassName = "",
  selectClassName = "",
  placeholder = "Selecione",
  ...props
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  const error = errors[name]
  const errorMessage = error?.message as string | undefined
  const registration = register(name)

  return (
    <div className={`group space-y-2.5 ${containerClassName}`}>
      <Label
        htmlFor={name}
        className="text-sm font-semibold text-gray-700 group-focus-within:text-[#5DADE2] transition-colors duration-200"
      >
        {label}
      </Label>

      <div className="relative">
        <select
          id={name}
          {...registration}
          {...props}
          className={`
            h-12 w-full px-4 pr-10
            text-base
            bg-white
            border-2
            ${error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
              : "border-gray-200 focus:border-[#5DADE2] focus:ring-[#5DADE2]/20"
            }
            rounded-xl
            shadow-sm hover:shadow-md
            transition-all duration-200
            focus:ring-4 focus:outline-none
            appearance-none
            ${selectClassName}
          `}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none transition-colors group-focus-within:text-[#5DADE2]"
          size={18}
        />

        {error && (
          <div className="absolute inset-y-0 right-10 pr-2 flex items-center pointer-events-none">
            <AlertCircle className="h-5 w-5 text-red-500 animate-pulse" />
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="flex items-start gap-2 px-1 text-red-600 text-sm font-medium animate-in slide-in-from-top-1 duration-200">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  )
}
