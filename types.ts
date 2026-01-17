export interface Customer {
  id: string;
  name: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  customerId: string;
  productName: string;
  quantity: number;
  price: number;
  date: string; // ISO string
  dueDate?: string; // YYYY-MM-DD
  note?: string;
}

export type ViewState = 'DASHBOARD' | 'CUSTOMER_DETAILS';

export interface DashboardStats {
  totalDue: number;
  totalCustomers: number;
}