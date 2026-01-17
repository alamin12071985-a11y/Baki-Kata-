import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { Button } from './Button';
import { Save } from 'lucide-react';

interface TransactionFormProps {
  customerId: string;
  initialData?: Transaction;
  onSubmit: (data: Omit<Transaction, 'id' | 'customerId'>) => void;
  onCancel: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel 
}) => {
  const [productName, setProductName] = useState(initialData?.productName || '');
  const [quantity, setQuantity] = useState(initialData?.quantity?.toString() || '1');
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [note, setNote] = useState(initialData?.note || '');
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '');
  
  // Default to now, or use existing date
  const [date, setDate] = useState(() => {
    if (initialData?.date) return initialData.date.split('T')[0];
    return new Date().toISOString().split('T')[0];
  });
  
  const [time, setTime] = useState(() => {
    if (initialData?.date) {
        const d = new Date(initialData.date);
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    }
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !price) return;

    // Combine date and time
    const dateTime = new Date(`${date}T${time}:00`).toISOString();

    onSubmit({
      productName,
      quantity: parseFloat(quantity) || 0,
      price: parseFloat(price) || 0,
      date: dateTime,
      dueDate: dueDate || undefined,
      note
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">পণ্যের নাম (Product)*</label>
        <input
          type="text"
          required
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="যেমন: চাল, ডাল, তেল"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">পরিমাণ (Quantity)</label>
          <input
            type="number"
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="1"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">দাম (Price)*</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-slate-400">৳</span>
            <input
              type="number"
              required
              step="any"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">তারিখ (Date)</label>
            <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
         </div>
         <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">সময় (Time)</label>
            <input 
                type="time" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
         </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">পরিশোধের তারিখ (Due Date) <span className="text-slate-400 font-normal">- Optional</span></label>
        <input 
            type="date" 
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">নোট (Note) <span className="text-slate-400 font-normal">- Optional</span></label>
        <textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="যেমন: আগামী সপ্তাহে দিবে..."
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
        />
      </div>

      <div className="pt-2 flex gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} fullWidth>
          বাতিল (Cancel)
        </Button>
        <Button type="submit" fullWidth>
            <Save size={18} className="mr-2" />
          সংরক্ষণ (Save)
        </Button>
      </div>
    </form>
  );
};