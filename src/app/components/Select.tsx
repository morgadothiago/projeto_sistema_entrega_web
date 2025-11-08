import { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  labelName: string;
  errorMessage?: string;
  className?: string;
  options: { value: string; label: string }[];
}

export const Select = ({
  labelName,
  errorMessage,
  className = "",
  options,
  ...props
}: SelectProps) => {
  return (
    <div className="flex flex-col gap-1 relative">
      <label className="text-sm text-gray-600 mb-1">{labelName}</label>
      <select
        className={`h-12 px-4 text-sm appearance-none border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00E676] ${className}`}
        {...props}
      >
        <option value="" disabled>
          Selecione
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="absolute right-3 bottom-3 text-gray-400 pointer-events-none"
        size={20}
      />
      {errorMessage && (
        <span className="text-sm text-red-500">{errorMessage}</span>
      )}
    </div>
  );
};
