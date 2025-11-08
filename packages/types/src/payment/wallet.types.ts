export enum WalletStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CLOSED = 'closed',
}

export enum WalletType {
  PERSONAL = 'personal',
  BUSINESS = 'business',
}

export interface IWallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  status: WalletStatus;
  type: WalletType;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWalletDto {
  userId: string;
  currency?: string;
  type?: WalletType;
  isDefault?: boolean;
}

export interface UpdateWalletDto {
  status?: WalletStatus;
  isDefault?: boolean;
}

export interface WalletBalanceDto {
  balance: number;
  currency: string;
}

export interface WalletTransferDto {
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  description?: string;
}
