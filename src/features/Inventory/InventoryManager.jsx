import React, { useState, useMemo } from 'react';
import { 
  ClipboardCheck, Search, Plus, CheckCircle, XCircle, FileText,
  Calendar, Clock, ScanBarcode, ArrowRight, CornerDownRight, History
} from 'lucide-react';
import { INITIAL_STOCK, WAREHOUSE_OPTIONS, PRODUCTION_PRODUCTS } from '../../data/mockData';

// Generate complex logs
const INITIAL_INVENTORIES = [
  {
    id: 'INV-2024-001',
    date: new Date(Date.now() - 86400000).toISOString(),
    targetDate: new Date(Date.now() - 86400000).toISOString(),
    author: 'Պահեստապետ (Հումք)',
    warehouse: 'Տեսակի հումքի պահեստ',
    status: 'Հաստատված',
    changes: [
      { itemId: 'A123', name: 'Արևածաղիկ', systemQty: 500, actualQty: 512, diff: 12, unit: 'կգ' }
    ],
    log: [
      { actor: 'Պահեստապետ (Հումք)', action: 'Ստեղծված և ուղարկված հաստատման', date: new Date(Date.now() - 86400000).toISOString() },
      { actor: 'Գլխավոր պահեստապետ', action: 'Հաստատված', date: new Date(Date.now() - 86000000).toISOString(), note: 'Ընդունված է' }
    ]
  }
];

export default function InventoryManager({ activeRole }) {
  const [inventories, setInventories] = useState(INITIAL_INVENTORIES);
  const [activeInvId, setActiveInvId] = useState(INITIAL_INVENTORIES[0].id);
  const [search, setSearch] = useState('');
  
  // New Inventory State
  const [isCreating, setIsCreating] = useState(false);
  const [correctionModal, setCorrectionModal] = useState(null); // holds inv id

  const isChief = ['Սուպերադմին', 'Գլխավոր պահեստապետ'].includes(activeRole);
  const activeInv = inventories.find(i => i.id === activeInvId);

  const addLog = (invId, actionStr, note = '') => {
    setInventories(prev => prev.map(inv => {
      if (inv.id !== invId) return inv;
      return {
        ...inv,
        log: [{ actor: activeRole, action: actionStr, date: new Date().toISOString(), note }, ...inv.log]
      };
    }));
  };

  const handleAction = (id, actionStr, note = '') => {
    setInventories(prev => prev.map(inv => {
      if (inv.id !== id) return inv;
      let status = inv.status;
      if (actionStr === 'Անցկացնել Հաստատում (Ընդունել)') status = 'Հաստատված';
      if (actionStr === 'Մերժել Գույքագրումը') status = 'Մերժված';
      if (actionStr === 'Ուղղման հարցում') status = 'Ուղղման հարցում';

      return { ...inv, status };
    }));
    addLog(id, actionStr, note);
  };

  const filteredInvs = inventories.filter(i => 
    search === '' || i.id.toLowerCase().includes(search.toLowerCase()) || i.warehouse.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex bg-[#f8fafc] h-full overflow-hidden w-full relative">
       {/* LEFT COLUMN: LIST */}
       <div className="w-80 min-w-[320px] bg-white border-r border-slate-200 flex flex-col z-10 shadow-sm">
          <div className="p-6 border-b border-slate-100 bg-teal-50/30">
             <div className="flex items-center gap-3 text-teal-700 mb-4">
               <ClipboardCheck size={24} />
               <h1 className="text-xl font-black tracking-tight">Գույքագրում</h1>
             </div>
             
             <button 
                onClick={() => setIsCreating(true)}
                className="w-full flex justify-center items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm py-2.5 rounded-xl shadow-md shadow-teal-200 transition-all mb-4"
             >
               <Plus size={16} /> Սկսել Գույքագրում
             </button>

             <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Որոնել ID կամ Պահեստ..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                />
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
             {filteredInvs.length === 0 && <div className="text-center text-sm text-slate-400 mt-4">Արդյունքներ չկան</div>}
             {filteredInvs.map(inv => {
               const isActive = activeInvId === inv.id && !isCreating;
               return (
                 <button 
                   key={inv.id}
                   onClick={() => { setActiveInvId(inv.id); setIsCreating(false); }}
                   className={`text-left p-4 rounded-xl transition-all border relative
                     ${isActive ? 'bg-teal-50 border-teal-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'}
                   `}
                 >
                   <div className="flex items-center justify-between mb-2">
                     <span className={`font-mono text-sm font-bold ${isActive ? 'text-teal-700' : 'text-slate-600'}`}>{inv.id}</span>
                     <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full
                       ${inv.status === 'Պատրաստ' ? 'bg-amber-100 text-amber-700' :
                         inv.status === 'Հաստատված' ? 'bg-green-100 text-green-700' : 
                         inv.status === 'Մերժված' ? 'bg-red-100 text-red-700' :
                         inv.status === 'Ուղղման հարցում' ? 'bg-purple-100 text-purple-700' :
                         'bg-gray-100 text-gray-700'}
                     `}>
                       {inv.status}
                     </span>
                   </div>
                   <div className="text-xs font-bold text-slate-800 line-clamp-1 mb-1">{inv.warehouse}</div>
                   <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 line-clamp-1">
                     <Calendar size={12} className="text-slate-400"/>
                     {new Date(inv.date).toLocaleDateString()}
                   </div>
                 </button>
               )
             })}
          </div>
       </div>

       {/* RIGHT COLUMN: DETAILS OR CREATION */}
       <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden relative">
          
          {isCreating ? (
             <NewInventoryCreator 
                activeRole={activeRole} 
                onCancel={() => setIsCreating(false)} 
                onSave={(newInv) => {
                  setInventories([newInv, ...inventories]);
                  setActiveInvId(newInv.id);
                  setIsCreating(false);
                }}
             />
          ) : activeInv ? (
             <div className="flex-1 overflow-y-auto">
                <div className="bg-white px-10 py-8 border-b border-slate-200 shadow-sm sticky top-0 z-20">
                  <div className="flex justify-between items-start mb-6">
                     <div>
                       <div className="flex items-center gap-3 mb-2">
                         <span className="bg-slate-100 text-slate-600 font-mono font-bold px-3 py-1 rounded-lg border border-slate-200">{activeInv.id}</span>
                         <span className={`px-3 py-1 text-sm font-black border rounded-lg uppercase tracking-widest
                            ${activeInv.status === 'Պատրաստ' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                              activeInv.status === 'Հաստատված' ? 'bg-green-50 text-green-600 border-green-200' : 
                              activeInv.status === 'Մերժված' ? 'bg-red-50 text-red-600 border-red-200' :
                              activeInv.status === 'Ուղղման հարցում' ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-slate-50 text-slate-600 border-slate-200'}
                         `}>{activeInv.status}</span>
                       </div>
                       <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                         {activeInv.warehouse}
                       </h2>
                       <div className="flex items-center gap-4 mt-3 text-sm font-medium text-slate-500">
                          <span className="flex items-center gap-1"><Calendar size={14}/> Թիրախային ամսաթիվ: {new Date(activeInv.targetDate).toLocaleDateString('hy-AM')}</span>
                          <span className="flex items-center gap-1"><Clock size={14}/> Հեղինակ: {activeInv.author}</span>
                       </div>
                     </div>

                     <div className="flex flex-wrap justify-end gap-2 max-w-sm">
                        {(activeInv.status === 'Պատրաստ' || activeInv.status === 'Ուղղման հարցում') && isChief && (
                          <>
                             <button onClick={() => {
                               const note = prompt("Մերժման պատճառ:");
                               if(note) handleAction(activeInv.id, 'Մերժել Գույքագրումը', note);
                             }} className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl font-bold shadow-sm transition-colors border border-red-200 text-sm">Մերժել</button>
                             <button onClick={() => {
                               const ok = window.confirm("Հաստատե՞լ: Համակարգը կկատարի ավելցուկի/պակասորդի մնացորդների ավտոմատ ճշգրտում:");
                               if(ok) handleAction(activeInv.id, 'Անցկացնել Հաստատում (Ընդունել)', 'Մնացորդները թարմացվել են ըստ տարբերության');
                             }} className="bg-teal-600 text-white hover:bg-teal-700 px-4 py-2 rounded-xl font-bold shadow-md shadow-teal-200 transition-colors flex items-center gap-2 text-sm"><CheckCircle size={16}/> Հաստատել</button>
                          </>
                        )}

                        {activeInv.status === 'Հաստատված' && (
                           <button onClick={() => setCorrectionModal(activeInv.id)} className="bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 px-4 py-2 rounded-xl font-bold transition-colors text-sm">
                             Ստեղծել Ուղղման Հարցում
                           </button>
                        )}
                     </div>
                  </div>
                </div>

                <div className="px-10 py-6">
                   <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <FileText size={18} className="text-teal-500"/> Շեղումների և Մնացորդների Աղյուսակ
                   </h3>
                   <div className="bg-white border text-left border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full">
                         <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                               <th className="p-4 text-[11px] font-bold text-slate-500 uppercase">Ապրանք</th>
                               <th className="p-4 text-[11px] font-bold text-slate-500 uppercase border-l border-slate-100 text-center bg-slate-100/50">Համակարգային</th>
                               <th className="p-4 text-[11px] font-bold text-slate-500 uppercase border-l border-slate-100 text-center bg-teal-50/50">Փաստացի</th>
                               <th className="p-4 text-[11px] font-bold text-slate-500 uppercase border-l border-slate-100 text-center">Շեղում (Տարբերություն)</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100">
                            {activeInv.changes.map(c => (
                              <tr key={c.itemId} className="hover:bg-slate-50">
                                 <td className="p-4 align-middle">
                                    <div className="font-bold text-slate-800 text-sm">{c.name}</div>
                                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{c.itemId}</div>
                                 </td>
                                 <td className="p-4 align-middle border-l border-slate-100 text-center font-mono font-bold text-slate-500 text-base bg-slate-50/50">
                                    {c.systemQty} <span className="text-xs">{c.unit}</span>
                                 </td>
                                 <td className="p-4 align-middle border-l border-slate-100 text-center font-mono font-black text-slate-800 text-lg bg-teal-50/20">
                                    {c.actualQty} <span className="text-xs text-slate-500">{c.unit}</span>
                                 </td>
                                 <td className="p-4 align-middle border-l border-slate-100 text-center">
                                    {c.diff === 0 ? (
                                      <span className="text-slate-400 font-black text-sm">-- Ճիշտ է --</span>
                                    ) : (
                                      <span className={`px-2.5 py-1 rounded border font-black text-sm
                                        ${c.diff > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}
                                      `}>
                                        {c.diff > 0 ? `Ավելցուկ: +${c.diff}` : `Պակասորդ: ${c.diff}`} {c.unit}
                                      </span>
                                    )}
                                 </td>
                              </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>

                   <div className="mt-10">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <History size={16} /> Գործողությունների Պատմություն (Logs)
                    </h3>
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                      {activeInv.log.map((log, i) => (
                        <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-slate-100 text-slate-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                              <History size={14}/>
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                              <div className="flex justify-between items-center mb-1 text-slate-400">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{log.actor}</span>
                                <time className="text-xs font-mono">{new Date(log.date).toLocaleString('hy-AM')}</time>
                              </div>
                              <div className="text-sm font-bold text-slate-700 mb-1">
                                {log.action}
                              </div>
                              {log.note && <div className="text-sm text-slate-500 font-medium">Նշում: {log.note}</div>}
                            </div>
                        </div>
                      ))}
                    </div>
                   </div>

                </div>
             </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
               <ClipboardCheck size={48} className="mb-4 opacity-20" />
               <p className="font-medium">Ընտրեք Գույքագրումը ձախ ցանկից</p>
            </div>
          )}
       </div>

       {correctionModal && (
         <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl p-6 w-[400px] shadow-2xl">
              <h2 className="text-xl font-bold mb-4">Ուղղման Հարցում</h2>
              <textarea id="correctionReason" placeholder="Ուղղման հիմնավորում (օրինակ՝ վրիպակ է եղել...)" className="w-full border border-slate-300 rounded p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4 h-24"></textarea>
              <div className="flex justify-end gap-3">
                 <button onClick={() => setCorrectionModal(null)} className="px-4 py-2 font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg">Չեղարկել</button>
                 <button onClick={() => {
                   const txt = document.getElementById('correctionReason').value;
                   if(!txt) return alert("Մեկնաբանությունը պարտադիր է");
                   handleAction(correctionModal, 'Ուղղման հարցում', txt);
                   setCorrectionModal(null);
                 }} className="px-4 py-2 font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg">Ստեղծել Հարցում</button>
              </div>
            </div>
         </div>
       )}
    </div>
  );
}


// ==========================================
// NEW INVENTORY CREATOR (SPLIT VIEW RIGHT)
// ==========================================
function NewInventoryCreator({ activeRole, onCancel, onSave }) {
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [warehouse, setWarehouse] = useState(WAREHOUSE_OPTIONS[0]);
  const [search, setSearch] = useState('');
  
  // Accumulated quantities
  // totals = { [itemId]: { amount: Number } }
  const [totals, setTotals] = useState({});

  const expectedItems = useMemo(() => {
     let itemsToTrack = [];
     if (warehouse === 'Արտադրամաս' || warehouse.includes('հումքի պահեստ')) {
       itemsToTrack = INITIAL_STOCK.filter(i => i.type === 'Հումք');
     } else if (warehouse.includes('Վաճառքի')) {
       itemsToTrack = INITIAL_STOCK.filter(i => i.type === 'Պատրաստի արտադրանք');
       if (itemsToTrack.length === 0) {
         itemsToTrack = PRODUCTION_PRODUCTS.map(p => ({
            id: p.id, code: p.code, name: p.name, quantity: 100, unit: 'հատ', type: 'Արտադրանք'
         }));
       }
     } else {
       itemsToTrack = INITIAL_STOCK;
     }
     return itemsToTrack;
  }, [warehouse]);

  const filteredItems = expectedItems.filter(i => 
    search === '' || i.name.toLowerCase().includes(search.toLowerCase()) || i.code.toLowerCase().includes(search.toLowerCase())
  );

  const addPhaseQty = (id, phaseQty) => {
    const qty = Number(phaseQty);
    if(isNaN(qty) || qty === 0) return;
    setTotals(prev => {
       const existing = prev[id]?.amount || 0;
       return { ...prev, [id]: { amount: existing + qty }};
    });
  };

  const handleFinish = () => {
    const changes = [];
    expectedItems.forEach(item => {
      const recorded = totals[item.id]?.amount;
      if (recorded !== undefined) {
         changes.push({
           itemId: item.id,
           name: item.name,
           unit: item.unit,
           systemQty: item.quantity,
           actualQty: recorded,
           diff: recorded - item.quantity
         });
      }
    });

    if (changes.length === 0) return alert("Խնդրում ենք մուտքագրել գոնե 1 ապրանքի փաստացի քանակ");
    
    onSave({
      id: `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString(),
      targetDate,
      author: activeRole,
      warehouse,
      status: 'Պատրաստ',
      changes,
      log: [
        { actor: activeRole, action: 'Սկսված է նոր Գույքագրում', date: new Date().toISOString() },
        { actor: activeRole, action: 'Պատրաստ (Ավարտված է ձեռքով մուտքագրումը): Ուղարկված է Գլխավորի հաստատմանը:', date: new Date().toISOString() }
      ]
    });
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-white animate-in zoom-in-95 duration-200">
       <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="p-2 bg-teal-100 text-teal-700 rounded-lg"><ClipboardCheck size={20}/></div>
             <div>
               <h2 className="text-lg font-black text-slate-800 tracking-tight">Սկսել Գույքագրում (Scanner / Accumulator)</h2>
               <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-0.5">Աջ սյունակում ավելացրեք քանակները փուլերով</p>
             </div>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-slate-100"><XCircle size={20}/></button>
       </div>

       <div className="px-6 py-4 bg-white border-b border-slate-100 flex flex-wrap gap-4 shrink-0">
          <div className="flex flex-col gap-1.5 w-48">
             <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ամսաթիվ (Հետին ամսաթիվ)</label>
             <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold focus:ring-2 outline-none"/>
          </div>
          <div className="flex flex-col gap-1.5 min-w-[200px]">
             <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Դիրք (Պահեստ/Արտադրամաս)</label>
             <select value={warehouse} onChange={e => {setWarehouse(e.target.value); setTotals({});}} className="w-full border border-teal-200 bg-teal-50 text-teal-800 rounded-lg px-3 py-1.5 text-sm font-bold focus:ring-2 outline-none">
                {WAREHOUSE_OPTIONS.map(w => <option key={w} value={w}>{w}</option>)}
             </select>
          </div>
       </div>

       <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT: System Items List */}
          <div className="flex-1 w-1/2 flex flex-col border-r border-slate-200 bg-slate-50 relative overflow-hidden">
             <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center shadow-sm z-10">
                <span className="font-bold text-slate-600 uppercase tracking-widest text-xs">Համակարգային Մնացորդ</span>
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Որոնել..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 pr-3 py-1 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-teal-500 bg-slate-50 outline-none w-40"/>
                </div>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredItems.map(item => (
                  <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                     <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono tracking-wider">{item.code}</span>
                     </div>
                     <div className="bg-slate-100 px-3 py-1.5 rounded-lg flex flex-col items-end min-w-[100px]">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Ակնկալվող</span>
                        <span className="text-base font-black text-slate-600 font-mono">{item.quantity} <span className="text-[10px]">{item.unit}</span></span>
                     </div>
                  </div>
                ))}
             </div>
          </div>

          {/* RIGHT: Input Accumulator */}
          <div className="flex-1 w-1/2 flex flex-col bg-white overflow-hidden relative">
             <div className="p-4 border-b border-slate-200 bg-teal-50 flex justify-between items-center shadow-sm z-10">
                <span className="font-bold text-teal-800 uppercase tracking-widest text-xs flex items-center gap-2"><ScanBarcode size={16}/> Փաստացի Ավելացումներ</span>
             </div>
             
             <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {filteredItems.map(item => {
                  const hasInput = totals[item.id]?.amount !== undefined;
                  const totalAmt = totals[item.id]?.amount || 0;
                  return (
                    <div key={item.id} className={`p-4 rounded-xl border-2 transition-colors ${
                      hasInput ? 'border-teal-400 bg-teal-50/20 shadow-sm' : 'border-slate-100 hover:border-slate-200'
                    }`}>
                       <div className="flex justify-between items-start mb-3">
                          <div className="font-bold text-slate-700 text-sm line-clamp-1 flex-1">{item.name}</div>
                          {hasInput && (
                            <div className="bg-teal-100 text-teal-800 px-3 py-1 rounded-lg flex flex-col items-end shadow-sm border border-teal-200">
                               <span className="text-[9px] font-black uppercase tracking-widest opacity-70">Գումարային Փաստացի</span>
                               <span className="font-mono font-black text-lg">{totalAmt} <span className="text-[10px]">{item.unit}</span></span>
                            </div>
                          )}
                       </div>
                       
                       <div className="flex items-center gap-2 pl-4 border-l-2 border-slate-100">
                          <CornerDownRight size={16} className="text-slate-300"/>
                          <div className="flex w-full items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-teal-500 pr-1">
                             <input 
                               id={`inv-inp-${item.id}`}
                               type="number" 
                               placeholder="+ Սկան կամ ձեռքով"
                               className="w-full bg-transparent px-3 py-2 text-sm font-black font-mono outline-none"
                               onKeyDown={e => {
                                 if(e.key === 'Enter') {
                                   addPhaseQty(item.id, e.target.value);
                                   e.target.value = '';
                                 }
                               }}
                             />
                             <button 
                               onClick={() => {
                                 const val = document.getElementById(`inv-inp-${item.id}`).value;
                                 addPhaseQty(item.id, val);
                                 document.getElementById(`inv-inp-${item.id}`).value = '';
                               }}
                               className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-1.5 rounded uppercase text-xs tracking-wider transition-colors my-1 shrink-0"
                             >
                               Ավելացնել
                             </button>
                          </div>
                       </div>
                    </div>
                  );
                })}
             </div>
          </div>

       </div>

       {/* Footer Action */}
       <div className="p-5 bg-white border-t border-slate-200 flex justify-end gap-3 shrink-0 z-20 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.05)]">
           <div className="text-xs text-slate-400 italic font-medium my-auto mr-auto pl-4">
             Մուտքագրեք արժեքներ և համակարգը կհաշվի իրական գումարային մնացորդը:
           </div>
           <button onClick={onCancel} className="px-5 py-2.5 font-bold text-slate-500 hover:bg-slate-100 rounded-xl">Չեղարկել</button>
           <button onClick={handleFinish} className="flex items-center gap-2 px-8 py-2.5 font-black text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-lg shadow-teal-200 transition-transform hover:scale-105 active:scale-95 text-sm uppercase tracking-wide">
             <CheckCircle size={18}/> Պատրաստ է (Ուղարկել)
           </button>
       </div>
    </div>
  );
}
