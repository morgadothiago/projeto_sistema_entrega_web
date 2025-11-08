export interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  labelName: string
  className?: string
  placeholder?: string
  required?: boolean
  classNameInput?: string
  labelColor?: string
  inputBorderColor?: string
}
