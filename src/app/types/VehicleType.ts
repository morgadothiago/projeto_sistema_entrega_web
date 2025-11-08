export interface VehicleType {
  id: number;
  type: string;
  tarifaBase: number;
  valorKMAdicional: number;
  paradaAdicional: number;
  ajudanteAdicional: number;
}

export interface VehicleTypePaginate {
  data: VehicleType[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
