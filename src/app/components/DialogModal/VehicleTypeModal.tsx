import { useForm, FormProvider } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { vehicleTypeSchema } from "@/app/schema/vehicleTypeSchema"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RHFTextInput } from "@/app/components/Input/ RHFTextInput"

import { Save, X, Car } from "lucide-react"

interface VehicleTypeModalProps {
  isModalOpen: boolean
  setIsModalOpen: (value: boolean) => void
  onSubmit: (data: any) => Promise<void>
  isEditing?: boolean
  defaultValues?: any
}

export function VehicleTypeModal({
  isModalOpen,
  setIsModalOpen,
  onSubmit,
  isEditing = false,
  defaultValues = {},
}: VehicleTypeModalProps) {
  const methods = useForm({
    resolver: yupResolver(vehicleTypeSchema),
    defaultValues: {
      type: "",
      tarifaBase: 0,
      valorKMAdicional: 0,
      paradaAdicional: 0,
      ajudanteAdicional: 0,
      ...defaultValues,
    },
  })

  const { handleSubmit, formState } = methods
  const { isSubmitting } = formState

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            {isEditing ? "Editar Tipo de Veículo" : "Adicionar Tipo de Veículo"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize as informações:"
              : "Preencha os dados abaixo:"}
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form className="grid gap-4 py-4" onSubmit={handleSubmit(onSubmit)}>
            <RHFTextInput
              name="type"
              labelName="Nome do Tipo *"
              placeholder="Ex: Carro"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RHFTextInput
                name="tarifaBase"
                labelName="Tarifa Base (R$) *"
                type="number"
              />
              <RHFTextInput
                name="valorKMAdicional"
                labelName="Valor por KM Adicional (R$) *"
                type="number"
              />
              <RHFTextInput
                name="paradaAdicional"
                labelName="Valor por Parada Adicional (R$) *"
                type="number"
              />
              <RHFTextInput
                name="ajudanteAdicional"
                labelName="Valor por Ajudante Adicional (R$) *"
                type="number"
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting
                  ? "Salvando..."
                  : isEditing
                  ? "Atualizar"
                  : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
