import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, User, ChevronLeft, Trash2, Edit2, Wallet, Calendar, Clock, Package, MoreVertical, LogOut, AlertCircle } from 'lucide-react';
import { Customer, Transaction, ViewState } from './types';
import { storageService } from './services/storage';
import { Button } from './components/Button';
import { Modal } from './components/Modal';
import { TransactionForm } from './components/TransactionForm';

function App() {
  // --- State ---
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [view, setView] = useState<ViewState>('DASHBOARD');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  
  // New Customer Form State
  const [newCustomerName, setNewCustomerName] = useState('');

  // --- Effects ---
  useEffect(() => {
    const loadedCustomers = storageService.getCustomers();
    const loadedTransactions = storageService.getTransactions();
    setCustomers(loadedCustomers);
    setTransactions(loadedTransactions);
  }, []);

  useEffect(() => {
    storageService.saveCustomers(customers);
  }, [customers]);

  useEffect(() => {
    storageService.saveTransactions(transactions);
  }, [transactions]);

  // --- Computed Data ---
  const selectedCustomer = useMemo(() => 
    customers.find(c => c.id === selectedCustomerId), 
  [customers, selectedCustomerId]);

  const customerTransactions = useMemo(() => 
    transactions
      .filter(t => t.customerId === selectedCustomerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  [transactions, selectedCustomerId]);

  const customerTotalDue = useMemo(() => 
    customerTransactions.reduce((sum, t) => sum + t.price, 0),
  [customerTransactions]);

  const overallTotalDue = useMemo(() => 
    transactions.reduce((sum, t) => sum + t.price, 0),
  [transactions]);

  // Map of customer ID to total due for the list view
  const customerDueMap = useMemo(() => {
    const map = new Map<string, number>();
    transactions.forEach(t => {
      const current = map.get(t.customerId) || 0;
      map.set(t.customerId, current + t.price);
    });
    return map;
  }, [transactions]);

  const filteredCustomers = useMemo(() => {
    return customers
      .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        // Sort by due amount descending
        const dueA = customerDueMap.get(a.id) || 0;
        const dueB = customerDueMap.get(b.id) || 0;
        return dueB - dueA;
      });
  }, [customers, searchQuery, customerDueMap]);

  // --- Handlers ---
  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim()) return;

    const newCustomer: Customer = {
      id: crypto.randomUUID(),
      name: newCustomerName.trim(),
      createdAt: new Date().toISOString()
    };

    setCustomers(prev => [...prev, newCustomer]);
    setNewCustomerName('');
    setIsCustomerModalOpen(false);
    
    // Auto navigate to the new customer
    setSelectedCustomerId(newCustomer.id);
    setView('CUSTOMER_DETAILS');
  };

  const handleDeleteCustomer = () => {
    if (!selectedCustomerId) return;
    if (!window.confirm('আপনি কি নিশ্চিত যে এই ক্রেতার সব তথ্য মুছে ফেলতে চান? (Are you sure you want to delete this customer and all their transactions?)')) return;

    setTransactions(prev => prev.filter(t => t.customerId !== selectedCustomerId));
    setCustomers(prev => prev.filter(c => c.id !== selectedCustomerId));
    setView('DASHBOARD');
    setSelectedCustomerId(null);
  };

  const handleSaveTransaction = (data: Omit<Transaction, 'id' | 'customerId'>) => {
    if (!selectedCustomerId) return;

    if (editingTransaction) {
      setTransactions(prev => prev.map(t => 
        t.id === editingTransaction.id 
          ? { ...t, ...data }
          : t
      ));
    } else {
      const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        customerId: selectedCustomerId,
        ...data
      };
      setTransactions(prev => [...prev, newTransaction]);
    }

    setIsTransactionModalOpen(false);
    setEditingTransaction(undefined);
  };

  const handleDeleteTransaction = (id: string) => {
    if (!window.confirm('এই বাকি মুছে ফেলতে চান? (Delete this transaction?)')) return;
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const openAddTransactionModal = () => {
    setEditingTransaction(undefined);
    setIsTransactionModalOpen(true);
  };

  const openEditTransactionModal = (t: Transaction) => {
    setEditingTransaction(t);
    setIsTransactionModalOpen(true);
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString('bn-BD', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // --- Render ---

  // 1. Dashboard View
  if (view === 'DASHBOARD') {
    return (
      <div className="min-h-screen pb-20 max-w-lg mx-auto bg-slate-50 relative">
        {/* Header */}
        <header className="bg-white sticky top-0 z-30 shadow-sm px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-indigo-700 flex items-center gap-2">
                <Wallet className="fill-indigo-100" />
                বাকি খাতা
              </h1>
              <p className="text-sm text-slate-500">দোকানের হিসাব রাখুন সহজে</p>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-indigo-600 rounded-xl p-4 text-white shadow-lg shadow-indigo-200 mb-6">
            <p className="text-indigo-100 text-sm font-medium mb-1">মোট পাওনা (Total Due)</p>
            <h2 className="text-3xl font-bold">৳ {overallTotalDue.toLocaleString('bn-BD')}</h2>
            <div className="mt-4 flex items-center justify-between text-xs text-indigo-200 border-t border-indigo-500 pt-3">
               <span>মোট কাস্টমার: {customers.length}</span>
               <span>লেনদেন: {transactions.length}</span>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="ক্রেতার নাম খুঁজুন... (Search)"
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        {/* Customer List */}
        <main className="px-4 py-2 space-y-3">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="text-slate-400" size={32} />
              </div>
              <p className="text-slate-500 font-medium">কোন ক্রেতা পাওয়া যায়নি</p>
              <p className="text-slate-400 text-sm mt-1">নতুন ক্রেতা যোগ করতে নিচের বাটনে ক্লিক করুন</p>
            </div>
          ) : (
            filteredCustomers.map(customer => {
              const due = customerDueMap.get(customer.id) || 0;
              return (
                <div 
                  key={customer.id}
                  onClick={() => {
                    setSelectedCustomerId(customer.id);
                    setView('CUSTOMER_DETAILS');
                  }}
                  className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 active:scale-[0.98] transition-transform flex justify-between items-center cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{customer.name}</h3>
                      <p className="text-xs text-slate-400">আইডি: ...{customer.id.slice(-4)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">৳ {due.toLocaleString('bn-BD')}</p>
                    <p className="text-xs text-slate-400">বাকি</p>
                  </div>
                </div>
              );
            })
          )}
        </main>

        {/* FAB */}
        <button
          onClick={() => setIsCustomerModalOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-indigo-700 transition-colors focus:ring-4 focus:ring-indigo-300 active:scale-90"
          aria-label="Add Customer"
        >
          <Plus size={28} />
        </button>

        {/* Add Customer Modal */}
        <Modal 
          isOpen={isCustomerModalOpen} 
          onClose={() => setIsCustomerModalOpen(false)}
          title="নতুন ক্রেতা যোগ করুন"
        >
          <form onSubmit={handleAddCustomer} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ক্রেতার নাম (Customer Name)</label>
              <input
                autoFocus
                type="text"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="নাম লিখুন..."
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
              />
            </div>
            <Button type="submit" fullWidth size="lg">যোগ করুন (Add)</Button>
          </form>
        </Modal>
      </div>
    );
  }

  // 2. Customer Details View
  if (view === 'CUSTOMER_DETAILS' && selectedCustomer) {
    return (
      <div className="min-h-screen bg-slate-50 max-w-lg mx-auto pb-20">
        {/* Detail Header */}
        <header className="bg-white sticky top-0 z-30 shadow-sm">
          <div className="px-4 py-3 flex items-center gap-3 border-b border-slate-100">
            <button 
              onClick={() => setView('DASHBOARD')}
              className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-slate-800">{selectedCustomer.name}</h1>
              <p className="text-xs text-slate-500">লেনদেনের তালিকা</p>
            </div>
            <button 
               onClick={handleDeleteCustomer}
               className="p-2 text-red-500 hover:bg-red-50 rounded-full"
               title="Delete Customer"
            >
               <Trash2 size={20} />
            </button>
          </div>
          
          {/* Summary Strip */}
          <div className="px-6 py-4 bg-white flex justify-between items-center">
             <span className="text-slate-500 font-medium">মোট বাকি:</span>
             <span className="text-2xl font-bold text-red-600">৳ {customerTotalDue.toLocaleString('bn-BD')}</span>
          </div>
        </header>

        {/* Transaction List */}
        <main className="px-4 py-4 space-y-3">
          {customerTransactions.length === 0 ? (
            <div className="text-center py-10 opacity-50">
              <Package size={48} className="mx-auto mb-2 text-slate-300" />
              <p>কোন লেনদেন নেই</p>
            </div>
          ) : (
            customerTransactions.map(t => (
              <div key={t.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative group">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{t.productName}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                        {t.quantity} টি
                      </span>
                      <span>•</span>
                      <Calendar size={12} />
                      <span>{formatDate(t.date)}</span>
                      <span>•</span>
                      <Clock size={12} />
                      <span>{formatTime(t.date)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-indigo-600 text-lg">৳ {t.price.toLocaleString('bn-BD')}</span>
                  </div>
                </div>
                
                {t.dueDate && (
                  <div className="mt-2 flex items-center gap-2 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded w-fit border border-amber-100">
                    <AlertCircle size={12} />
                    <span>পরিশোধের তারিখ: {formatDate(t.dueDate)}</span>
                  </div>
                )}
                
                {t.note && (
                  <div className="mt-2 text-sm text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 italic">
                    "{t.note}"
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-slate-50 flex justify-end gap-3">
                  <button 
                    onClick={() => openEditTransactionModal(t)}
                    className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-indigo-600 px-2 py-1 rounded hover:bg-slate-50"
                  >
                    <Edit2 size={14} /> এডিট
                  </button>
                  <button 
                    onClick={() => handleDeleteTransaction(t.id)}
                    className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-red-600 px-2 py-1 rounded hover:bg-slate-50"
                  >
                    <Trash2 size={14} /> মুছুন
                  </button>
                </div>
              </div>
            ))
          )}
        </main>

        {/* Add Transaction Button (Sticky Bottom) */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 max-w-lg mx-auto">
          <Button 
            fullWidth 
            size="lg" 
            onClick={openAddTransactionModal}
            className="shadow-lg shadow-indigo-200"
          >
            <Plus size={20} className="mr-2" />
            নতুন বাকি যোগ করুন
          </Button>
        </div>

        {/* Transaction Modal */}
        <Modal
          isOpen={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
          title={editingTransaction ? "বাকি এডিট করুন" : "নতুন বাকি যোগ করুন"}
        >
          <TransactionForm 
            customerId={selectedCustomer.id}
            initialData={editingTransaction}
            onSubmit={handleSaveTransaction}
            onCancel={() => setIsTransactionModalOpen(false)}
          />
        </Modal>
      </div>
    );
  }

  return null;
}

export default App;