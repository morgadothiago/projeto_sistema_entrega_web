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
  NO_DOCUMENTS = "NO_DOCUMENTS",
}

export interface ILocalization {
  longitude: number;
  latitude: number;
}

export interface IAddress {
  id: number;
  street: string;
  number: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  complement?: string;
  createdAt?: string;
  updatedAt?: string;
  localization?: ILocalization;
}

export interface IVehicleType {
  type: string;
}

export interface IVehicle {
  licensePlate: string; // Backend usa licensePlate, não plate
  brand: string;
  model: string;
  year?: string; // Backend retorna como string
  color?: string;
  vehicleTypeId?: number;
  Type?: IVehicleType;
}

export interface IFile {
  path: string;
  filename: string;
  mimetype: string;
  size: number;
}

export interface IDocument {
  id: number;
  deliverymanId: number;
  type: string;
  documentType?: string | null;
  description?: string | null;
  documentNumber: string;
  fullName: string;
  cpf: string;
  cnhType?: string | null;
  issuingAgency: string;
  status: string;
  fileId: number;
  createdAt: string;
  updatedAt: string;
  File: IFile;
}

export interface IBankAccount {
  id: number;
  bankCode?: string | null;
  bankName?: string | null;
  agency?: string | null;
  account?: string | null;
  accountType?: string | null;
  holderName?: string | null;
  cpf?: string | null;
  pixKey: string;
  pixKeyType: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IDeliveryMan {
  id: number;
  name: string;
  cpf: string;
  dob: string;
  phone: string;
  Address?: IAddress;
  Vehicle?: IVehicle;
  Documents?: IDocument[];
  BankAccounts?: IBankAccount[];
  userId?: number;
}

export interface User {
  id: number;
  email: string;
  role: ERole | string; // Aceita tanto enum quanto string
  status: EStatus | string; // Aceita tanto enum quanto string
  information?: string;
  avatarId?: number | null;
  Avatar?: any | null; // Tipo genérico para avatar
  Balance?: IBalance;
  Extract?: IExtract[];
  Company?: ICompany | null;
  DeliveryMan?: IDeliveryMan | null;
  emailVerified?: Date | null; // ← necessário para NextAuth
  name?: string; // Opcional pois pode vir de DeliveryMan.name ou Company.name
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
