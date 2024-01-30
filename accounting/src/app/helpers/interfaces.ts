// interfaces.ts

export interface FiscalYearSpan {
  start: Date | null;
  end: Date | null;
}

export interface Organization {
  accountCode: string;
  accountName: string;
  balance: number;
}

export interface BalanceEntry {
  balance: Organization;
}

export interface BalanceData {
  accountCode: string;
  balance: number;
}

export interface AccountDetails {
  id: string;
  name: string;
  number: number;
  vatRate: string;
  logo: any;
  accountingPlan: string;
}

export interface Item {
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  vatRate: string;
}

export interface InvoiceData {
  organizationNumber: string;
  vatNumber?: string; // Made optional
  organizationName: string;
  customerName: string;
  customerAddress: {
    street: string;
    postalCode: string;
    postalTown: string;
  };
  customerNumber: string;
  invoiceNumber: string; // Made mandatory
  invoiceDate: string;
  dueDate: string;
  paymentTerms: string;
  items: Item[];
}
