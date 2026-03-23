import React, { useState } from 'react';
import { ClipboardCheck } from 'lucide-react';
import NewInventory from './components/NewInventory.jsx';
import InventoryList from './components/InventoryList.jsx';

const INITIAL_INVENTORIES = [
  {
    id: 'INV-2024-001',
    date: new Date(Date.now() - 86400000).toISOString(), // yesterday
    targetDate: new Date(Date.now() - 86400000).toISOString(),
    author: 'Պահեստապետ (Հումք)',
    warehouse: 'Տեսակի հումքի պահեստ',
    status: 'Հաստատված',
    changes: [
      { itemId: 'A123', name: 'Արևածաղիկ', systemQty: 500, actualQty: 512, diff: 12, unit: 'կգ' }
    ],
    log: [
      { actor: 'Պահեստապետ (Հումք)', action: 'Ստեղծված', date: new Date(Date.now() - 86400000).toISOString() },
      { actor: 'Գլխավոր պահեստապետ', action: 'Հաստատված', date: new Date(Date.now() - 86000000).toISOString() }
    ]
  }
];

export default function InventoryManager({ activeRole }) {
  const [inventories, setInventories] = useState(INITIAL_INVENTORIES);
  const [activeTab, setActiveTab] = useState('Ցանկ'); // 'Ցանկ', 'Նոր Գույքագրում', 'Դիտել'
  const [selectedInv, setSelectedInv] = useState(null);

  const canApprove = ['Սուպերադմին', 'Գլխավոր պահեստապետ'].includes(activeRole);
  
  const handleCreate = (data) => {
    const newInv = {
      id: `INV-${new Date().getFullYear()}-00${inventories.length + 1}`,
      date: new Date().toISOString(),
      targetDate: data.targetDate,
      author: activeRole,
      warehouse: data.warehouse,
      status: 'Պատրաստ', // Wait for Chief approval
      changes: data.changes,
      log: [
        { actor: activeRole, action: 'Ստեղծված և ուղարկված հաստատման', date: new Date().toISOString() }
      ]
    };
    setInventories([newInv, ...inventories]);
    setActiveTab('Ցանկ');
  };

  const handleAction = (id, actionStr, reason = '') => {
    setInventories(prev => prev.map(inv => {
      if (inv.id === id) {
        let newStatus = inv.status;
        if (actionStr === 'approve') newStatus = 'Հաստատված';
        if (actionStr === 'reject') newStatus = 'Մերժված';
        if (actionStr === 'correct') newStatus = 'Ուղղման հարցում'; // creating correction ticket

        return {
          ...inv,
          status: newStatus,
          log: [...inv.log, { actor: activeRole, action: actionStr, date: new Date().toISOString(), note: reason }]
        };
      }
      return inv;
    }));
  };

  const pendingCount = inventories.filter(i => i.status === 'Պատրաստ' || i.status === 'Ուղղման հարցում').length;

  return (
    <div className="flex flex-col h-full bg-slate-50 w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between bg-white border-b border-slate-200 px-8 py-5 flex-shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
             <ClipboardCheck size={28} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">
            Գույքագրման Մոդուլ
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-100 rounded-lg p-1.5 px-4 font-semibold text-slate-700">
             Դեր: <span className="ml-2 text-teal-700">{activeRole}</span>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="px-8 pt-4 pb-0 bg-white border-b border-slate-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02)] z-10 flex gap-4 overflow-x-auto flex-shrink-0">
        <button 
          className={`pb-3 px-2 border-b-2 font-medium transition-colors whitespace-nowrap flex items-center gap-2
            ${activeTab === 'Ցանկ' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          onClick={() => { setActiveTab('Ցանկ'); setSelectedInv(null); }}
        >
          Գույքագրումների Ցանկ 
          {canApprove && pendingCount > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>}
        </button>
        <button 
          className={`pb-3 px-2 border-b-2 font-medium transition-colors whitespace-nowrap 
            ${activeTab === 'Նոր Գույքագրում' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          onClick={() => setActiveTab('Նոր Գույքագրում')}
        >
          Սկսել նոր Գույքագրում
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6 relative">
        {activeTab === 'Ցանկ' && (
           <InventoryList 
             inventories={inventories} 
             activeRole={activeRole} 
             onAction={handleAction} 
             canApprove={canApprove}
           />
        )}

        {activeTab === 'Նոր Գույքագրում' && (
           <NewInventory 
             onComplete={handleCreate} 
             onCancel={() => setActiveTab('Ցանկ')} 
           />
        )}
      </div>
    </div>
  );
}
