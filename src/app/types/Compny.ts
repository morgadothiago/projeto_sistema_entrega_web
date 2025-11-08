// ICompany.ts
export interface ICompany {
  id: number;
  name: string;
  phone: string;
  cnpj: string;
  idAddress: number;
  Adress: Adress;
  createdAt: string;
  updatedAt: string;
}
export interface Adress {
  id: number;
  street: string;
  number: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  complement: string;
  createdAt: string;
  updatedAt: string;
}
