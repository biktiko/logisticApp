import React, { useState } from 'react';
import { PackageSearch, ScanBarcode, ArrowRight, Trash2, Plus } from 'lucide-react';
import { INITIAL_STOCK } from '../../../data/mockData'; // we use mock stock as items to pick from

export default function NewInboundTab({ onSubmit, sourcingOrders, activeRole }) {
  const [useScanner, setUseScanner] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState('');
  
  const [supplier, setSupplier] = useState('');
  const [comment, setComment] = useState('');
  const [items, setItems] = useState([]);

  // Mock warehouses
  const mockTargetWarehouses = [
    'Գլխավոր հումքի պահեստ',
    'Տեսակի հումքի պահեստ (Արևածաղիկ)',
    'Տեսակի հումքի պահեստ (Տպագրական)',
    'Վաճառքի պահեստ (Չիպսեր)'
  ];

  const handleAttachTicket = (ticketId) => {
    setSelectedTicket(ticketId);
    if (!ticketId) {
      setItems([]);
      return;
    }
    
    // Auto-fill from Sourcing Ticket
    const ticket = sourcingOrders.find(o => o.id === ticketId);
    if (ticket) {
      // populate with missing items
      const newItems = ticket.items.map(it => ({
        itemId: it.itemId,
        name: it.name,
        qty: it.requestedQty - it.receivedQty,
        unit: it.unit,
        expiration: '',
        targetWarehouse: mockTargetWarehouses[0]
      }));
      setItems(newItems);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { itemId: '', name: '', qty: '', unit: 'կգ', expiration: '', targetWarehouse: mockTargetWarehouses[0] }]);
  };

  const handleRemove = (idx) => setItems(items.filter((_, i) => i !== idx));

  const handleChange = (idx, field, val) => {
    const next = [...items];
    next[idx][field] = val;
    setItems(next);
  };

  const submitForm = (e) => {
    e.preventDefault();
    if (items.length === 0) return alert('No items added');
    
    onSubmit({
      linkedTicket: selectedTicket,
      supplier,
      comment,
      items
    });
  };

  return (
    <form onSubmit={submitForm} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-5xl mx-auto flex flex-col">
      <div className="p-6 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-6 items-start justify-between">
        
        {/* Top Controls */}
        <div className="flex-1 min-w-[300px] flex flex-col gap-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <PackageSearch className="text-blue-500" /> Նոր Մուտքի Հարցում
          </h2>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">Կցել Մատակարարման Պատվեր (Ընտրել)</label>
            <select
              value={selectedTicket}
              onChange={e => handleAttachTicket(e.target.value)}
              className="border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full max-w-sm"
            >
              <option value="">-- Առանց կցված պատվերի (Direct Inbound) --</option>
              {sourcingOrders.filter(o => o.status === 'Նոր/Բաց' || o.status === 'Մասնակի').map(o => (
                <option key={o.id} value={o.id}>{o.id} - Սպասվող հումք: {o.items.length} տեսակ</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-4 flex-1 min-w-[300px]">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">Մատակարար</label>
            <input 
              type="text" 
              placeholder="Օրինակ՝ Ագրո ՍՊԸ"
              value={supplier}
              onChange={e => setSupplier(e.target.value)}
              className="border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-full"
            />
          </div>
          
          <div className="flex items-center gap-4 border border-blue-100 bg-blue-50/50 p-2 rounded-lg">
            <button 
              type="button" 
              onClick={() => setUseScanner(!useScanner)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-sm font-bold transition-colors ${useScanner ? 'bg-blue-600 text-white shadow' : 'text-blue-600 hover:bg-blue-100'}`}
            >
              <ScanBarcode size={18} /> Միացնել Սկաները (Շտրիխկոդ)
            </button>
          </div>
        </div>

      </div>

      <div className="p-6 bg-white flex-1 overflow-auto">
        <div className="space-y-4">
          {items.map((it, idx) => (
            <div key={idx} className="flex flex-wrap items-end gap-3 bg-slate-50 p-4 border border-slate-200 rounded-lg relative">
              <button 
                type="button" 
                onClick={() => handleRemove(idx)}
                className="absolute top-3 right-3 text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors"
                title="Հեռացնել"
              >
                <Trash2 size={16} />
              </button>

              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Անվանում/SKU</label>
                <input 
                  type="text"
                  placeholder="Ապրանքի անվանում..."
                  value={it.name}
                  onChange={e => handleChange(idx, 'name', e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none pr-8"
                  required
                />
              </div>

              <div className="w-24">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Քանակ</label>
                <input 
                  type="number"
                  min="0.01" step="0.01"
                  value={it.qty}
                  onChange={e => handleChange(idx, 'qty', e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-800"
                  required
                />
              </div>

              <div className="w-20">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Չ/Մ</label>
                <select
                  value={it.unit}
                  onChange={e => handleChange(idx, 'unit', e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="կգ">կգ</option>
                  <option value="լիտր">լիտր</option>
                  <option value="հատ">հատ</option>
                </select>
              </div>

              <div className="w-40">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Պիտանիություն (Եթե կա)</label>
                <input 
                  type="date"
                  value={it.expiration}
                  onChange={e => handleChange(idx, 'expiration', e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              
              <div className="w-56">
                <label className="block text-xs font-semibold text-slate-500 mb-1">Թիրախային Պահեստ</label>
                <select
                  value={it.targetWarehouse}
                  onChange={e => handleChange(idx, 'targetWarehouse', e.target.value)}
                  className="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-blue-50/30"
                >
                  {mockTargetWarehouses.map(wh => (
                    <option key={wh} value={wh}>{wh}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          <button 
            type="button"
            onClick={handleAddItem}
            className="flex w-full items-center justify-center gap-2 mt-4 py-3 border-2 border-dashed border-blue-200 text-blue-600 bg-blue-50/50 hover:bg-blue-50 font-bold rounded-lg transition-colors text-sm"
          >
            <Plus size={18} /> Ավելացնել Դատարկ Տող (Ձեռքով)
          </button>
        </div>
      </div>

      <div className="bg-slate-50 border-t border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between gap-4 flex-shrink-0">
        <textarea
          placeholder="Մեկնաբանություն թողնել վերադասի համար..."
          value={comment}
          onChange={e => setComment(e.target.value)}
          className="w-full md:w-1/2 border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none h-12"
        />
        
        <button 
          type="submit"
          disabled={items.length === 0}
          className="flex items-center gap-2 px-8 py-3 font-bold rounded-xl transition-all shadow-md text-white bg-blue-600 hover:bg-blue-700 shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          Ստեղծել Մուտք Հարցում <ArrowRight size={18} />
        </button>
      </div>
    </form>
  );
}
