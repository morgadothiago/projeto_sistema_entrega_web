import type { IBalance } from "./Belance";
import { ICompany } from "./Compny";
import type { IExtract } from "./Extract";

export enum ERole {
  DELIVERY = "DELIVERY",
  ADMIN = "ADMIN",
  COMPANY = "COMPANY",
}

export enum EStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}
export interface User {
  id: number;
  name: string;
  email: string;
  role: ERole;
  status: EStatus;
  Balance: IBalance;
  Company: ICompany;
  Extract: IExtract[];
  emailVerified?: Date | null; // ← necessário para NextAuth
}

export interface ICreateUser {
  name: string;
  email: string;
  cnpj: string;
  password: string;
  phone: string;
  address: string;
  city: string;
  number: string;
  complement: string;
  state: string;
  zipCode: string;
}

export interface IUserPaginate {
  id: number;
  name: string;
  email: string;
  role: ERole;
  status: EStatus;
  information: string;
}

export interface IFilterUser {
  status?: EStatus | "";
  role?: ERole | "";
  email?: string;
  page?: number;
  limit?: number;
}
