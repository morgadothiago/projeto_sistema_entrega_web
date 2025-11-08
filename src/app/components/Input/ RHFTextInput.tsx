import { useFormContext } from "react-hook-form"
import { TextInput } from "./index"
import type { TextInputProps } from "@/app/types/TextInputProps"

interface RHFTextInputProps extends TextInputProps {
  name: string
}

export function RHFTextInput({ name, ...props }: RHFTextInputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  const errorMessage = errors[name]?.message as string | undefined

  return (
    <div className="flex flex-col gap-1">
      <TextInput
        {...register(name)}
        {...props}
        inputBorderColor={
          errorMessage ? "border-red-500" : props.inputBorderColor
        }
      />

      {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
    </div>
  )
}
