export interface Company {
  name: string;
}

export interface Delivery {
  Company: Company;
  code: string;
  completedAt: string | null;
  email: string;
  height: number;
  information: string;
  isFragile: boolean;
  length: number;
  price: string;
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  telefone: string;
  vehicleType: 'Bike' | 'Car' | 'Truck' | 'Van';
  weight: number;
  width: number;
  // Optional fields that might be present in the response
  id?: string;
  createdAt?: string;
  updatedAt?: string;
}
