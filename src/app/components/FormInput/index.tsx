import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import { useFormContext } from "react-hook-form"

export interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> {
  name: string
  label: string
  icon?: React.ReactNode
  containerClassName?: string
  inputClassName?: string
  mask?: string | string[]
}

export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ name, label, icon, containerClassName = "", inputClassName = "", mask, type, ...props }, ref) => {
    const {
      register,
      formState: { errors },
    } = useFormContext()

    const [showPassword, setShowPassword] = useState(false)
    const isPasswordField = type === "password"

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
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10 text-gray-400 group-focus-within:text-[#5DADE2] transition-colors duration-200">
              {icon}
            </div>
          )}

          <Input
            id={name}
            {...registration}
            {...props}
            type={isPasswordField ? (showPassword ? "text" : "password") : type}
            className={`
              h-12 w-full
              ${icon ? "pl-11" : "pl-4"}
              ${isPasswordField || error ? "pr-11" : "pr-4"}
              text-base
              bg-white
              border-2
              ${error
                ? "border-red-300 focus-visible:border-red-500 focus-visible:ring-red-500/20"
                : "border-gray-200 focus-visible:border-[#5DADE2] focus-visible:ring-[#5DADE2]/20"
              }
              rounded-xl
              shadow-sm hover:shadow-md
              transition-all duration-200
              focus-visible:ring-4
              placeholder:text-gray-400
              ${inputClassName}
            `}
          />

          {isPasswordField && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center z-10 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}

          {error && !isPasswordField && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
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
)

FormInput.displayName = "FormInput"
