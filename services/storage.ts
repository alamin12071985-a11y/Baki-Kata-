import { Customer, Transaction } from '../types';

const CUSTOMERS_KEY = 'baki_khata_customers';
const TRANSACTIONS_KEY = 'baki_khata_transactions';

export const storageService = {
  getCustomers: (): Customer[] => {
    try {
      const data = localStorage.getItem(CUSTOMERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading customers', e);
      return [];
    }
  },

  saveCustomers: (customers: Customer[]) => {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  },

  getTransactions: (): Transaction[] => {
    try {
      const data = localStorage.getItem(TRANSACTIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading transactions', e);
      return [];
    }
  },

  saveTransactions: (transactions: Transaction[]) => {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  }
};