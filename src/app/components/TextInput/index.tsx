import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import { FieldError } from "react-hook-form"

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  labelName: string
  className?: string
  placeholder?: string
  error?: FieldError | undefined
  required?: boolean
  classNameInput?: string
  icon?: React.ReactNode
}

export function TextInput({
  labelName,
  className,
  error,
  icon,
  classNameInput,
  type,
  ...rest
}: TextInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPasswordField = type === "password"

  // Create a new object without classNameInput to pass to Input component
  const inputProps = { ...rest }
  delete (inputProps as any).classNameInput

  return (
    <div className={className}>
      <Label className="mb-3 text-[#003B73] text-base sm:text-lg md:text-xl font-semibold">
        {labelName}
      </Label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <Input
          type={isPasswordField ? (showPassword ? "text" : "password") : type}
          className={`w-full border ${
            classNameInput ? classNameInput : "border-blue-500"
          } rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200 ease-in-out ${classNameInput} ${
            classNameInput && classNameInput.includes("error")
              ? "border-red-500"
              : "border-blue-500"
          } ${icon ? "pl-10" : ""} ${isPasswordField ? "pr-10" : ""}`}
          {...inputProps}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      {error && (
        <span className="text-red-500 text-sm text-left w-full mt-1">
          {error.message}
        </span>
      )}
    </div>
  )
}
