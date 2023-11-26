// interfaces.ts

export interface FiscalYearSpan {
  start: Date | null;
  end: Date | null;
}

export interface Account {
  accountCode: string;
  accountName: string;
  balance: number;
}

export interface BalanceEntry {
  balance: Account;
}

export interface BalanceData {
  accountCode: string;
  balance: number;
}

export interface AccountDetails {
  id: string;
  name: string;
  accountingPlan: string;
}
