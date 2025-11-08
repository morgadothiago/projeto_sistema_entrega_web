import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  labelName: string
  className?: string // Made optional to allow for default styling
  placeholder?: string
  required?: boolean
  classNameInput?: string
  labelColor?: string // New prop for dynamic label color
  inputBorderColor?: string // New prop for dynamic input border color
}

export const TextInput: React.FC<TextInputProps> = ({
  labelName,
  className = "", // Default to an empty string if not provided
  classNameInput = "", // Default to an empty string if not provided
  labelColor = "#003B73", // Default label color
  inputBorderColor = "border-blue-500", // Default input border color
  ...rest
}) => {
  // Create a new object without classNameInput to pass to Input component
  const inputProps = { ...rest }
  delete (inputProps as any).classNameInput

  return (
    <div className={`flex flex-col ${className}`}>
      <Label
        className={`mb-2 text-[${labelColor}] text-base sm:text-lg md:text-xl font-semibold`}
      >
        {labelName}
      </Label>
      <Input
        className={`w-full ${inputBorderColor} rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out ${classNameInput}`}
        {...inputProps}
      />
    </div>
  )
}
