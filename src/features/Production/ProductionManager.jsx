import React, { useState } from 'react';
import { 
  Factory, 
  Search, 
  Filter, 
  Plus, 
  History,
  LayoutGrid
} from 'lucide-react';
import ProductionTicket from './components/ProductionTicket.jsx';

// Initial Mock Production Orders for the demo
const INITIAL_ORDERS = [
  {
    id: 'PRD-2024-001',
    date: '2024-05-20T10:30:00Z',
    author: 'Գլխավոր պահեստապետ (Demo)',
    status: 'Ընթացքի մեջ', // 'Սպասման մեջ', 'Ընթացքի մեջ', 'Արտադրված', 'Կատարված'
    products: [
      { id: 'p1', name: 'Արևածաղիկ 100գ աղի', plannedQty: 500, unit: 'հատ',
        actualQty: 50,
        history: [{ date: '2026-03-23T12:53:29Z', qty: 50 }]
      },
      { id: 'p2', name: 'Արևածաղիկ 50գ աղի', plannedQty: 200, unit: 'հատ',
        actualQty: 0,
        history: []
      }
    ],
    // Transit Raw Materials status
    transitMaterials: [
      { name: 'Հումք Արևածաղիկ', requested: 100, received: 100, unit: 'կգ', status: 'Ընդունված' },
      { name: 'Աղ (Յոդացված)', requested: 5, received: 5, unit: 'կգ', status: 'Ընդունված' }
    ]
  },
  {
    id: 'PRD-2024-002',
    date: '2024-05-21T09:00:00Z',
    author: 'Տեսակի պատասխանատու',
    status: 'Սպասման մեջ',
    products: [
      { id: 'p3', name: 'Պանրով Չիպս', plannedQty: 1000, unit: 'հատ', actualQty: 0, history: [] }
    ],
    transitMaterials: [
      { name: 'Կարտոֆիլի փոշի', requested: 300, received: 0, unit: 'կգ', status: 'Տրանզիտ' }
    ]
  }
];

// Inline mock warehouse specifically for this view
const MOCK_PROD_WAREHOUSE = [
  { name: 'Հումք Արևածաղիկ', qty: 450, unit: 'կգ', type: 'ՀՈՒՄՔ' },
  { name: 'Կարտոֆիլի փոշի', qty: 1000, unit: 'կգ', type: 'ՀՈՒՄՔ' },
  { name: 'Աղ (Յոդացված)', qty: 50, unit: 'կգ', type: 'ՀՈՒՄՔ' },
  { name: 'Արևածաղիկ 100գ աղի', qty: 1200, unit: 'հատ', type: 'ԱՐՏԱԴՐԱՆՔ' },
  { name: 'Արևածաղիկ 50գ աղի', qty: 850, unit: 'հատ', type: 'ԱՐՏԱԴՐԱՆՔ' }
];

export default function ProductionManager({ activeRole }) {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Բոլորը');
  
  // Permissions based on Role
  const isTypeResp = activeRole === 'Տեսակի պատասխանատու';
  const isProdHead = activeRole === 'Արտադրամասի պետ';
  const isChiefAdmin = ['Սուպերադմին', 'Գլխավոր պահեստապետ'].includes(activeRole);
  
  const canModifyTransit = isProdHead || isTypeResp; // Demo simplified
  
  const handleUpdateTicket = (newTicket) => {
    setOrders(prev => prev.map(o => o.id === newTicket.id ? newTicket : o));
  };
  
  const handleNewOrder = () => {
    const newId = `PRD-2024-00${orders.length + 1}`;
    const newOrder = {
      id: newId,
      date: new Date().toISOString(),
      author: activeRole,
      status: 'Սպասման մեջ',
      products: [
        { id: 'pNew', name: 'Նոր Պրոդուկտ', plannedQty: 100, unit: 'հատ', actualQty: 0, history: [] }
      ],
      transitMaterials: []
    };
    setOrders([newOrder, ...orders]);
  };

  const filteredOrders = orders.filter(o => {
    if (filterStatus !== 'Բոլորը' && o.status !== filterStatus) return false;
    if (search && !o.id.toLowerCase().includes(search.toLowerCase()) && !o.products.some(p => p.name.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] w-full overflow-hidden">
      {/* Header Area */}
      <div className="flex items-center justify-between bg-white border-b border-slate-200 px-8 py-5 flex-shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <Factory className="text-slate-800" size={28} />
          <h1 className="text-2xl font-black tracking-tight text-slate-800">
            Արտադրության Համակարգ
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-100 rounded-lg p-1.5 px-4 font-semibold text-slate-700">
             Դեր: <span className="ml-2 text-blue-700">{activeRole}</span>
          </div>
          
          {isTypeResp && (
            <button 
              onClick={handleNewOrder}
              className="flex items-center gap-2 bg-slate-800 hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all"
            >
              <Plus size={18} /> Ստեղծել Ձեռքով
            </button>
          )}
        </div>
      </div>

      {/* Main Layout: Left: Tickets (70%), Right: Warehouse (30%) */}
      <div className="flex-1 overflow-hidden flex flex-row p-6 gap-6 relative">
      
        {/* LEFT PANEL: Orders List */}
        <div className="flex-[7] flex flex-col min-w-0 h-full">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <History size={16} /> Պատվերների Ցանկ
            </h2>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Որոնել ID կամ պրոդուկտ..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm w-64"
                />
              </div>
              
              <div className="relative">
                <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                  className="pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 appearance-none shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                >
                  <option value="Բոլորը">Բոլորը (Status)</option>
                  <option value="Սպասման մեջ">Սպասման մեջ</option>
                  <option value="Ընթացքի մեջ">Ընթացքի մեջ</option>
                  <option value="Արտադրված">Արտադրված</option>
                  <option value="Կատարված">Կատարված</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-20 custom-scrollbar">
             {filteredOrders.length === 0 ? (
               <div className="text-center p-12 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
                 Արդյունքներ չգտնվեցին...
               </div>
             ) : (
               filteredOrders.map(order => (
                 <ProductionTicket 
                   key={order.id} 
                   ticket={order} 
                   activeRole={activeRole}
                   isProdHead={isProdHead}
                   isTypeResp={isTypeResp}
                   onUpdate={handleUpdateTicket}
                 />
               ))
             )}
          </div>
        </div>
        
        {/* RIGHT PANEL: Prod Warehouse */}
        <div className="flex-[3] flex flex-col min-w-[300px] max-w-[400px]">
           <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
              <LayoutGrid size={16} /> Պահեստ
           </h2>
           
           <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex-1 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                <div className="p-2 bg-slate-200 rounded-lg"><LayoutGrid size={16} className="text-slate-600" /></div>
                <h3 className="font-bold text-slate-700 text-sm">Մնացորդներ (Արտադրամաս)</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2">
                 {MOCK_PROD_WAREHOUSE.map((wh, idx) => (
                   <div key={idx} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border-b border-slate-50 last:border-0">
                      <div>
                        <div className="font-semibold text-sm text-slate-800">{wh.name}</div>
                        <div className="text-[10px] font-bold text-slate-400 mt-1 tracking-wider">{wh.type}</div>
                      </div>
                      <div className="font-black text-blue-600 text-sm">{wh.qty} {wh.unit}</div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
