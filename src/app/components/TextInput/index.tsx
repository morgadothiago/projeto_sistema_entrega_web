import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  ...rest
}: TextInputProps) {
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
          className={`w-full border ${
            classNameInput ? classNameInput : "border-blue-500"
          } rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200 ease-in-out ${classNameInput} ${
            classNameInput && classNameInput.includes("error")
              ? "border-red-500"
              : "border-blue-500"
          } ${icon ? "pl-10" : ""}`}
          {...inputProps}
        />
      </div>
      {error && (
        <span className="text-red-500 text-sm text-left w-full mt-1">
          {error.message}
        </span>
      )}
    </div>
  )
}
