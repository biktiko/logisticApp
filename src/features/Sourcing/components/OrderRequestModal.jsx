import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

export default function OrderRequestModal({ onClose, onSubmit }) {
  const [items, setItems] = useState([{ name: '', requestedQty: '', unit: 'կգ' }]);

  const handleAddItem = () => {
    setItems([...items, { name: '', requestedQty: '', unit: 'կգ' }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validItems = items.filter(it => it.name.trim() && Number(it.requestedQty) > 0).map(it => ({
      ...it,
      itemId: `M-${Math.floor(Math.random() * 900)}`,
      requestedQty: Number(it.requestedQty),
      receivedQty: 0
    }));

    if (validItems.length === 0) {
      alert("Խնդրում ենք լրացնել գոնե մեկ ապրանքի տվյալներ ճիշտ քանակով։");
      return;
    }

    onSubmit({ items: validItems });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center px-6 py-4 border-b bg-blue-50 border-blue-100">
          <h2 className="text-lg font-bold text-slate-800">Ստեղծել Մատակարարման Հարցում</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-6">
          <form id="request-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="bg-amber-50 text-amber-800 border-amber-200 border px-4 py-3 text-sm font-medium rounded-lg">
              Խնդրում ենք ավելացնել անհրաժեշտ հումքը կամ պրոդուկտը։ Հարցումը կառաքվի գլխավոր պահեստապետի հաստատմանը։
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-3 bg-slate-50 p-3 border border-slate-200 rounded-lg">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Անվանում</label>
                    <input 
                      type="text"
                      placeholder="Օրինակ՝ Արևածաղիկ..."
                      value={item.name}
                      onChange={(e) => handleChange(index, 'name', e.target.value)}
                      className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  
                  <div className="w-32">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Քանակ</label>
                    <input 
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      value={item.requestedQty}
                      onChange={(e) => handleChange(index, 'requestedQty', e.target.value)}
                      className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none tabular-nums"
                      required
                    />
                  </div>

                  <div className="w-24">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Չ/Մ</label>
                    <select
                      value={item.unit}
                      onChange={(e) => handleChange(index, 'unit', e.target.value)}
                      className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="կգ">կգ</option>
                      <option value="լիտր">լիտր</option>
                      <option value="հատ">հատ</option>
                      <option value="տուփ">տուփ</option>
                    </select>
                  </div>

                  <button 
                    type="button" 
                    onClick={() => handleRemoveItem(index)}
                    disabled={items.length === 1}
                    className="p-2 ml-2 mt-5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <button 
              type="button"
              onClick={handleAddItem}
              className="flex items-center justify-center gap-2 mt-2 w-full py-3 border-2 border-dashed border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 font-semibold rounded-lg transition-colors text-sm"
            >
              <Plus size={16} /> Ավելացնել տող
            </button>
          </form>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 mt-auto">
          <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">
            Չեղարկել
          </button>
          <button type="submit" form="request-form" className="px-5 py-2 font-medium rounded-lg transition-colors shadow-sm text-white bg-blue-600 hover:bg-blue-700 shadow-blue-200">
            Ուղարկել հարցումը
          </button>
        </div>
      </div>
    </div>
  );
}
