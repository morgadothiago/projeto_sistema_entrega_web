export interface IBalance {
  id?: number;
  amount: string; // Backend retorna como string
  currency?: string;
  createAt?: string;
  updateAt?: string;
}
