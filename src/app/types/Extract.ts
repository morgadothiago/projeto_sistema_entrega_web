export enum EExtractType {
  DEPOSIT = "DEPOSIT",
  WITHDRAW = "WITHDRAW",
}
export interface IExtract {
  id: number;
  amount: number;
  type: EExtractType;
}
