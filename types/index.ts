export interface InventoryItem {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  unit: string;
  lastUpdated: string;
}

export interface Transaction {
  _id: string;
  itemId: string;
  type: 'purchase' | 'sale';
  quantity: number;
  price: number;
  totalAmount: number;
  date: string;
}

export interface Expense {
  _id: string;
  itemId: string;
  description: string;
  amount: number;
  date: string;
}

export interface ReportSummary {
  totalValue: number;
  totalPurchases: number;
  totalSales: number;
  profit: number;
}

export interface ReportData {
  summary: ReportSummary;
  items: InventoryItem[];
  transactions: Transaction[];
  expenses: Expense[];
} 