import React, { useState } from 'react';
import { 
  Factory, Search, Plus, Play, CheckCircle, Clock, Truck, 
  ArrowRight, Box, Boxes, ClipboardEdit, AlertCircle, XCircle
} from 'lucide-react';
import { 
  PRODUCTION_PRODUCTS, 
  BOM_CONFIGURATION, 
  INITIAL_STOCK 
} from '../../data/mockData';

// Mock Real-time Warehouse balances
const MOCK_RAW_WH = {
  'A123': 2000,
  'A124': 500,
  'B002': 10000,
  'B991': 100
};
const MOCK_PROD_WH = {
  'A123': 100, // already accepted in PRD-AW-001
  'A124': 0,
  'B002': 0,
  'B991': 0
};

export default function ProductionManager({ activeRole, orders, setOrders }) {
  const [activeOrderId, setActiveOrderId] = useState(orders.length > 0 ? orders[0].id : null);
  const [search, setSearch] = useState('');
  
  // Modals state
  const [isNewOrderModal, setIsNewOrderModal] = useState(false);
  const [isTransferModal, setIsTransferModal] = useState(false);
  const [isRejectModal, setIsRejectModal] = useState(null); // holds transit ID
  
  // Role checks
  const isChief = ['Սուպերադմին', 'Գլխավոր պահեստապետ'].includes(activeRole);
  const isProdHead = activeRole === 'Արտադրամասի պետ';
  const isRawResp = activeRole === 'Հումքի պատասխանատու' || activeRole === 'Տեսակի պատասխանատու';
  const isFinGoodsResp = activeRole === 'Պատրաստի արտադրանքի պատասխանատու' || activeRole === 'Տեսակի պատասխանատու';

  const activeOrder = orders.find(o => o.id === activeOrderId);

  // Core Actions
  const addLog = (orderId, action) => {
    setOrders(prev => prev.map(o => o.id === orderId ? {
      ...o,
      logs: [{ date: new Date().toISOString(), user: activeRole, action }, ...o.logs]
    } : o));
  };

  const handleChiefApprove = (id) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Սպասման մեջ' } : o));
    addLog(id, 'Հաստատվեց Գլխավոր պահեստապետի կողմից և դարձավ ՊԱՍԻՎ (Սպասման մեջ):');
  };

  const handleStartProduction = (id) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Ընթացքի մեջ' } : o));
    addLog(id, 'Արտադրությունը սկսվեց: Կարգավիճակը փոխվեց «Ընթացքի մեջ»։');
  };

  const handleFinishProduction = (id) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Արտադրված' } : o));
    addLog(id, 'Արտադրամասի պետը ԱՎԱՐՏԵՑ արտադրությունը այս պատվերի համար (Կարգավիճակ՝ Արտադրված):');
  };

  const handleAcceptTransit = (orderId, transitId) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        transits: o.transits.map(t => t.id === transitId ? { ...t, status: 'Ընդունված' } : t)
      }
    }));
    const order = orders.find(o => o.id === orderId);
    const tr = order.transits.find(t => t.id === transitId);
    MOCK_PROD_WH[tr.materialId] = (MOCK_PROD_WH[tr.materialId] || 0) + tr.requestedQty;
    addLog(orderId, `Արտադրամասը ընդունեց ${tr.requestedQty} ${tr.unit} ${tr.name} հումքը:`);
  };

  const handleRejectTransit = (orderId, transitId, reason) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        transits: o.transits.map(t => t.id === transitId ? { ...t, status: 'Մերժված' } : t)
      }
    }));
    const order = orders.find(o => o.id === orderId);
    const tr = order.transits.find(t => t.id === transitId);
    MOCK_RAW_WH[tr.materialId] = (MOCK_RAW_WH[tr.materialId] || 0) + tr.requestedQty; // Return to Raw WH
    addLog(orderId, `ՄԵՐԺՎԵԾ: Արտադրամասը մերժեց ${tr.requestedQty} ${tr.unit} ${tr.name}-ի ստացումը: Պատճառ՝ ${reason}`);
  };

  const checkOverallFulfillment = (orderId) => {
    setTimeout(() => {
       setOrders(currentOrders => {
          const ord = currentOrders.find(o => o.id === orderId);
          if (!ord) return currentOrders;
          // All produced items that are sent out must be accepted. And ActualQty >= PlannedQty (Optional). But logic says, when all transferred are accepted, it can be "Կատարված".
          const allSentAccepted = ord.products.every(p => p.sentQty > 0 && p.sentQty === p.acceptedQty);
          if (allSentAccepted && ord.status === 'Արտադրված') {
             const updated = currentOrders.map(o => o.id === orderId ? { ...o, status: 'Կատարված' } : o);
             const target = updated.find(o => o.id === orderId);
             target.logs = [{ date: new Date().toISOString(), user: 'Համակարգ', action: 'Բոլոր արտադրված և ուղարկված խմբաքանակները ընդունվել են պահեստի կողմից: Պատվերը ԿԱՏԱՐՎԱԾ Է:' }, ...target.logs];
             return updated;
          }
          return currentOrders;
       });
    }, 100);
  };

  const handleProducePhase = (orderId, prodId, phaseQty) => {
    if (phaseQty <= 0) return;
    
    // Deduct from PROD WH
    const order = orders.find(o => o.id === orderId);
    const pInfo = order.products.find(x => x.id === prodId);
    const bom = BOM_CONFIGURATION[pInfo.prodId] || [];
    
    // Quick validation check
    let hasEnough = true;
    for(let b of bom) {
      const required = b.amountPerUnit * phaseQty;
      if ((MOCK_PROD_WH[b.itemId] || 0) < required) {
        hasEnough = false;
        break;
      }
    }
    if(!hasEnough) {
      alert("Արտադրամասում բավարար հումք չկա այս քանակն արտադրելու համար:");
      return;
    }

    // Process Deduction
    for(let b of bom) {
      const required = b.amountPerUnit * phaseQty;
      MOCK_PROD_WH[b.itemId] -= required;
    }

    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        products: o.products.map(p => p.id === prodId ? { ...p, actualQty: p.actualQty + phaseQty } : p)
      }
    }));
    addLog(orderId, `Արտադրվեց նոր խմբաքանակ -> ${phaseQty} հատ ${pInfo.name}: Համապատասխան հումքը դուրս գրվեց արտադրամասից:`);
  };

  const handleSendToFinished = (orderId, prodId) => {
     // Send (actualQty - sentQty) to Finished Goods
     setOrders(prev => prev.map(o => {
        if(o.id !== orderId) return o;
        return {
           ...o,
           products: o.products.map(p => p.id === prodId ? { ...p, sentQty: p.actualQty } : p)
        }
     }));
     const order = orders.find(o => o.id === orderId);
     const pInfo = order.products.find(x => x.id === prodId);
     addLog(orderId, `Պատրաստի արտադրանք հանձնվեց պահեստին (${pInfo.actualQty - pInfo.sentQty} տուփ ${pInfo.name}):`);
  };

  const handleAcceptFinished = (orderId, prodId) => {
    setOrders(prev => prev.map(o => {
      if(o.id !== orderId) return o;
      return {
         ...o,
         products: o.products.map(p => p.id === prodId ? { ...p, acceptedQty: p.sentQty } : p)
      }
   }));
   const order = orders.find(o => o.id === orderId);
   const pInfo = order.products.find(x => x.id === prodId);
   addLog(orderId, `Պահեստը ընդունեց ${pInfo.sentQty - pInfo.acceptedQty} տուփ ${pInfo.name}:`);
   checkOverallFulfillment(orderId);
  };

  // UI Parts
  const renderTransitsTable = () => {
    if(!activeOrder.transits || activeOrder.transits.length === 0) return (
      <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-6 text-center text-slate-400 font-medium">Այս պատվերի համար հումքի տեղափոխման հարցումներ չկան:</div>
    );

    return (
      <div className="bg-white border text-left border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
           <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                 <th className="p-3 text-[11px] font-bold text-slate-500 uppercase">Հումք</th>
                 <th className="p-3 text-[11px] font-bold text-slate-500 uppercase">Քանակ</th>
                 <th className="p-3 text-[11px] font-bold text-slate-500 uppercase">Կարգավիճակ</th>
                 <th className="p-3 text-[11px] font-bold text-slate-500 uppercase text-right">Գործողություն</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
              {activeOrder.transits.map(t => (
                <tr key={t.id} className="hover:bg-slate-50">
                   <td className="p-3 font-bold text-slate-700 text-sm">{t.name}</td>
                   <td className="p-3 font-mono text-sm font-bold text-indigo-700">{t.requestedQty} {t.unit}</td>
                   <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide
                         ${t.status === 'Տրանզիտ' ? 'bg-amber-100 text-amber-700' :
                           t.status === 'Ընդունված' ? 'bg-green-100 text-green-700' :
                           'bg-red-100 text-red-700'}
                      `}>
                        {t.status}
                      </span>
                   </td>
                   <td className="p-3 text-right">
                     {t.status === 'Տրանզիտ' && isProdHead && (
                       <div className="flex gap-2 justify-end">
                         <button onClick={() => setIsRejectModal(t.id)} className="bg-red-50 text-red-600 font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-red-100">Մերժել</button>
                         <button onClick={() => handleAcceptTransit(activeOrder.id, t.id)} className="bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-indigo-700 shadow flex items-center gap-1">
                           <CheckCircle size={14}/> Ստացել եմ
                         </button>
                       </div>
                     )}
                     {t.status === 'Ընդունված' && <span className="text-xs text-slate-400 font-medium flex items-center gap-1 justify-end"><CheckCircle size={14}/> Հաստատված</span>}
                   </td>
                </tr>
              ))}
           </tbody>
        </table>
      </div>
    );
  };


  const filteredOrders = orders.filter(o => 
    search === '' || o.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex bg-[#f8fafc] h-full overflow-hidden w-full relative">
       {/* LEFT: Order List */}
       <div className="w-80 min-w-[320px] bg-white border-r border-slate-200 flex flex-col z-10 shadow-sm">
          <div className="p-6 border-b border-slate-100 bg-slate-50">
             <div className="flex items-center gap-3 text-indigo-700 mb-4">
               <Factory size={24} />
               <h1 className="text-xl font-black tracking-tight">Արտադրություն</h1>
             </div>
             
             {/* Anyone can create manually, but essentially type responsible */}
             {!isProdHead && (
               <button onClick={() => setIsNewOrderModal(true)} className="w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-2.5 rounded-xl shadow-md transition-all mb-4">
                 <Plus size={16} /> Νոր Արտադրություն
               </button>
             )}

             <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Որոնել ID-ով..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
             </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
             {filteredOrders.length === 0 && <div className="text-center text-sm text-slate-400 mt-4">Արդյունքներ չկան</div>}
             {filteredOrders.map(o => {
               const isActive = activeOrderId === o.id;
               return (
                 <button 
                   key={o.id}
                   onClick={() => setActiveOrderId(o.id)}
                   className={`text-left p-4 rounded-xl transition-all border relative
                     ${isActive ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'}
                   `}
                 >
                   <div className="flex items-center justify-between mb-2">
                     <span className={`font-mono text-sm font-bold ${isActive ? 'text-indigo-700' : 'text-slate-600'}`}>{o.id}</span>
                     <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full
                       ${o.status === 'Հաստատման ենթակա' ? 'bg-red-100 text-red-700' :
                         o.status === 'Սպասման մեջ' ? 'bg-slate-200 text-slate-700' : 
                         o.status === 'Ընթացքի մեջ' ? 'bg-yellow-100 text-yellow-700' :
                         o.status === 'Արտադրված' ? 'bg-green-100 text-green-700' :
                         'bg-gray-100 text-gray-700'}
                     `}>
                       {o.status}
                     </span>
                   </div>
                   <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 line-clamp-1">
                     <Clock size={12} className="text-slate-400"/>
                     {new Date(o.date).toLocaleDateString()}
                     <span className="mx-1">•</span>
                     {o.author}
                   </div>
                 </button>
               )
             })}
          </div>
       </div>

       {/* RIGHT: Detailed Active Order Passport */}
       <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden relative">
          {activeOrder ? (
            <div className="flex-1 overflow-y-auto">
               
               <div className="bg-white px-10 py-8 border-b border-slate-200 shadow-sm sticky top-0 z-20">
                  <div className="flex justify-between items-start mb-6">
                     <div>
                       <div className="flex items-center gap-3 mb-2">
                         <span className="bg-slate-100 text-slate-600 font-mono font-bold px-3 py-1 rounded-lg border border-slate-200">{activeOrder.id}</span>
                         <span className="text-sm font-black text-slate-400 border border-slate-200 bg-slate-50 px-3 py-1 rounded-lg uppercase tracking-widest">{activeOrder.status}</span>
                       </div>
                       <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                         Արտադրական Պատվեր
                       </h2>
                       {activeOrder.comment && (
                         <div className="text-sm font-medium text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100 max-w-xl">
                           <span className="font-bold">Մեկնաբանություն:</span> {activeOrder.comment}
                         </div>
                       )}
                     </div>

                     <div className="flex gap-2">
                        {activeOrder.status === 'Հաստատման ենթակա' && isChief && (
                          <button onClick={() => handleChiefApprove(activeOrder.id)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-all">
                            <CheckCircle size={16}/> Հաստատել Пատվերը
                          </button>
                        )}
                        {activeOrder.status === 'Սպասման մեջ' && isProdHead && (
                          <button onClick={() => handleStartProduction(activeOrder.id)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-all">
                            <Play size={16} fill="currentColor"/> Սկսել Արտադրությունը
                          </button>
                        )}
                        {['Սպասման մեջ', 'Ընթացքի մեջ'].includes(activeOrder.status) && (isRawResp || isChief) && (
                           <button onClick={() => setIsTransferModal(true)} className="flex items-center gap-2 bg-amber-50 border-2 border-amber-200 text-amber-700 hover:bg-amber-100 px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all">
                             <Truck size={16} /> Տեղափոխել հումք
                           </button>
                        )}
                        {activeOrder.status === 'Ընթացքի մեջ' && isProdHead && (
                          <button onClick={() => handleFinishProduction(activeOrder.id)} className="flex items-center gap-2 bg-slate-800 text-white hover:bg-black px-5 py-2.5 rounded-xl font-bold shadow-md transition-all">
                            Ավարտել  <ArrowRight size={16} />
                          </button>
                        )}
                     </div>
                  </div>
               </div>

               <div className="px-10 py-6">
                 {/* Transit Table Area */}
                 <div className="mb-10">
                    <h3 className="text-base font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Boxes size={18} className="text-indigo-500"/> Հումքի շարժ
                    </h3>
                    {renderTransitsTable()}
                 </div>

                 {/* Product Phases */}
                 <div className="mb-10">
                    <h3 className="text-base font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Box size={18} className="text-indigo-500"/> Պրոդուկտների կատարում
                    </h3>

                    <div className="bg-white border text-left border-slate-200 rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full">
                         <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                               <th className="p-4 text-[11px] font-bold text-slate-500 uppercase">Պրոդուկտ</th>
                               <th className="p-4 text-[11px] font-bold text-slate-500 uppercase border-l border-slate-100 text-center">Պլանային</th>
                               <th className="p-4 text-[11px] font-bold text-slate-500 uppercase border-l border-slate-100 text-center">Արտադրել Փուլ</th>
                               <th className="p-4 text-[11px] font-bold text-slate-500 uppercase border-l border-slate-100 text-center">Արտադրված Է / Ուղարկված</th>
                               <th className="p-4 text-[11px] font-bold text-slate-500 uppercase border-l border-slate-100 text-center">Պահեստը Ընդունել Է</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100">
                            {activeOrder.products.map(p => {
                               return (
                                 <tr key={p.id} className="hover:bg-slate-50">
                                    <td className="p-4 align-middle">
                                       <div className="font-bold text-slate-700 text-sm">{p.name}</div>
                                       <div className="text-xs text-slate-400 font-mono mt-0.5">{p.prodId}</div>
                                    </td>
                                    <td className="p-4 border-l border-slate-100 align-middle text-center bg-slate-50/50">
                                       <div className="font-bold text-slate-700 font-mono text-base">{p.plannedQty}</div>
                                       <div className="text-[10px] text-slate-400 font-bold uppercase">{p.unit}</div>
                                    </td>
                                    
                                    <td className="p-4 border-l border-slate-100 align-middle text-center">
                                       {activeOrder.status === 'Ընթացքի մեջ' && isProdHead ? (
                                          <div className="flex px-1 flex-col items-center gap-2">
                                             <div className="flex w-32 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-indigo-500">
                                               <input 
                                                 id={`phase-${p.id}`}
                                                 type="number" 
                                                 className="w-full text-center font-mono font-bold outline-none py-1.5" 
                                                 placeholder="+ Քանակ" 
                                                 min="1"
                                               />
                                               <button 
                                                 onClick={() => {
                                                   const val = parseInt(document.getElementById(`phase-${p.id}`).value) || 0;
                                                   handleProducePhase(activeOrder.id, p.id, val);
                                                   document.getElementById(`phase-${p.id}`).value = '';
                                                 }} 
                                                 className="bg-indigo-50 text-indigo-700 px-3 hover:bg-indigo-100 border-l border-slate-200 font-bold"
                                               >
                                                 +
                                               </button>
                                             </div>
                                          </div>
                                       ) : (
                                          <span className="text-xs text-slate-300 font-bold uppercase">Անհասանելի</span>
                                       )}
                                    </td>

                                    <td className="p-4 border-l border-slate-100 align-middle text-center relative">
                                       <div className="text-lg font-black font-mono text-indigo-700">{p.actualQty} / <span className="text-slate-400">{p.plannedQty}</span></div>
                                       
                                       <div className="mt-2 text-xs font-bold text-slate-500">
                                         Ուղարկված: <span className={p.sentQty > 0 ? "text-blue-600 font-black" : "text-slate-400"}>{p.sentQty}</span>
                                       </div>
                                       
                                       {p.actualQty > p.sentQty && isProdHead && (
                                         <button 
                                           onClick={() => handleSendToFinished(activeOrder.id, p.id)}
                                           className="mt-2 w-full bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-[10px] uppercase py-1.5 rounded-lg border border-blue-200 transition-colors"
                                         >
                                           Ուղարկել Պահեստ ({p.actualQty - p.sentQty})
                                         </button>
                                       )}
                                    </td>

                                    <td className="p-4 border-l border-slate-100 align-middle text-center bg-green-50/30">
                                       <div className="text-lg font-black font-mono text-green-700">{p.acceptedQty}</div>
                                       
                                       {p.sentQty > p.acceptedQty && isFinGoodsResp && (
                                         <button 
                                           onClick={() => handleAcceptFinished(activeOrder.id, p.id)}
                                           className="mt-2 w-full bg-green-500 text-white hover:bg-green-600 font-bold text-[10px] py-1.5 rounded-lg border border-green-600 shadow-sm transition-colors"
                                         >
                                           Հաստատել Ստացումը ({p.sentQty - p.acceptedQty})
                                         </button>
                                       )}
                                    </td>
                                 </tr>
                               )
                            })}
                         </tbody>
                      </table>
                    </div>
                 </div>

                 {/* Logs */}
                 <div className="mb-10">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Clock size={16} /> Գործողությունների Պատմություն
                  </h3>
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                     {activeOrder.logs.map((log, i) => (
                       <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-slate-100 text-slate-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            <Clock size={14}/>
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-center mb-1 text-slate-400">
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{log.user}</span>
                              <time className="text-xs font-mono">{new Date(log.date).toLocaleString('hy-AM')}</time>
                            </div>
                            <div className="text-sm font-medium text-slate-700">
                              {log.action}
                            </div>
                          </div>
                       </div>
                     ))}
                  </div>
                 </div>

               </div>
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-slate-400">
               <Factory size={48} className="mb-4 opacity-20" />
               <p className="font-medium">Ընտրեք պատվեր ձախ ցանկից</p>
            </div>
          )}
       </div>


       {/* Modals placed globally within the component to avoid overlapping issues */}
       {isTransferModal && (
         <TransferRawModal 
            order={activeOrder}
            onClose={() => setIsTransferModal(false)}
            onSave={(newTransitLogs) => {
              setOrders(prev => prev.map(o => {
                if(o.id !== activeOrder.id) return o;
                return {
                  ...o, 
                  transits: [...o.transits, ...newTransitLogs]
                }
              }));
              addLog(activeOrder.id, `Ստեղծվեց հումքի ${newTransitLogs.length} տեղափոխման հարցում դեպի արտադրամաս: (Սպասում է հաստատման)`);
              setIsTransferModal(false);
            }}
         />
       )}

       {isRejectModal && (
         <RejectTransitModal 
            onClose={() => setIsRejectModal(null)}
            onConfirm={(reason) => {
               handleRejectTransit(activeOrder.id, isRejectModal, reason);
               setIsRejectModal(null);
            }}
         />
       )}

       {/* Manual Creation Modal */}
       {isNewOrderModal && (
         <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl p-6 w-[400px] shadow-2xl">
              <h2 className="text-xl font-bold mb-4">Նոր Արտադրական Պատվեր</h2>
              <div className="text-sm text-slate-500 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100">Պատվերը կստանա «Հաստատման ենթակա» կարգավիճակ:</div>
              <div className="flex justify-end gap-3">
                 <button onClick={() => setIsNewOrderModal(false)} className="px-4 py-2 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">Չեղարկել</button>
                 <button onClick={() => {
                   const n = {
                     id: `PRD-MN-00${Math.floor(Math.random()*100)}`,
                     date: new Date().toISOString(),
                     author: activeRole,
                     comment: 'Ձեռքով ստեղծված',
                     status: 'Հաստատման ենթակա',
                     products: [{ id: 'I3', prodId: 'P001', name: 'Արևածաղիկ 100գ դասական', plannedQty: 100, actualQty: 0, sentQty: 0, acceptedQty: 0, unit: 'տուփ' }],
                     transits: [],
                     logs: [{ date: new Date().toISOString(), user: activeRole, action: 'Ստեղծվել է ձեռքով: Սպասում է հաստատման:' }]
                   };
                   setOrders([n, ...orders]);
                   setIsNewOrderModal(false);
                 }} className="px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg">Ստեղծել</button>
              </div>
            </div>
         </div>
       )}

    </div>
  );
}

// ==========================================
// SUBCOMPONENTS: MODALS
// ==========================================

function TransferRawModal({ order, onClose, onSave }) {
  // Compute BOM needs vs transferred
  const bomNeeds = {};
  order.products.forEach(p => {
    const bom = BOM_CONFIGURATION[p.prodId] || [];
    bom.forEach(b => {
      if(!bomNeeds[b.itemId]) {
        bomNeeds[b.itemId] = { 
          name: b.name, 
          unit: b.unit, 
          required: 0,
          transferred: 0
        };
      }
      bomNeeds[b.itemId].required += b.amountPerUnit * p.plannedQty;
    });
  });

  order.transits.forEach(t => {
     if(bomNeeds[t.materialId]) {
        bomNeeds[t.materialId].transferred += t.requestedQty;
     }
  });

  const [transferInputs, setTransferInputs] = useState({});

  const handleSave = () => {
    const toCreate = [];
    Object.keys(transferInputs).forEach(matId => {
       const qty = Number(transferInputs[matId]);
       if(qty > 0) {
         toCreate.push({
           id: `T-${Date.now()}-${Math.floor(Math.random()*1000)}`,
           materialId: matId,
           name: bomNeeds[matId].name,
           requestedQty: qty,
           unit: bomNeeds[matId].unit,
           status: 'Տրանզիտ'
         });
         MOCK_RAW_WH[matId] -= qty; // Deduct from raw warehouse
       }
    });

    if(toCreate.length === 0) return alert('Մուտքագրեք գոնե 1 քանակ որևէ հումքի դաշտում:');
    onSave(toCreate);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in duration-200">
       <div className="bg-white rounded-2xl w-[900px] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
             <div>
               <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 tracking-tight">
                 <Truck className="text-indigo-600" /> Տեղափոխել հումք դեպի արտադրամաս
               </h2>
               <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">Ըստ BOM բանաձևի հաշվարկված տարբերություններ</p>
             </div>
             <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"><XCircle size={20}/></button>
          </div>

          <div className="p-6 max-h-[60vh] overflow-y-auto">
             <table className="w-full text-left">
                <thead className="bg-slate-50 border border-slate-200 rounded-lg">
                  <tr>
                    <th className="p-3 text-[11px] font-bold text-slate-500 uppercase">Հումք</th>
                    <th className="p-3 text-[11px] font-bold text-slate-500 uppercase text-center border-l border-slate-200/50">Արդեն Տեղափոխված / Պահանջվող (BOM)</th>
                    <th className="p-3 text-[11px] font-bold text-slate-500 uppercase text-center border-l border-slate-200/50 bg-amber-50/50 text-amber-900">Արտադրամասի<br/>Ազատ մնացորդ</th>
                    <th className="p-3 text-[11px] font-bold text-slate-500 uppercase text-center border-l border-slate-200/50 bg-indigo-50/50 text-indigo-900 w-48">Նոր Տեղափոխություն</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 border-x border-b border-slate-200">
                   {Object.keys(bomNeeds).map(matId => {
                     const row = bomNeeds[matId];
                     const whRaw = MOCK_RAW_WH[matId] || 0;
                     const prodBal = MOCK_PROD_WH[matId] || 0;
                     return (
                       <tr key={matId} className="hover:bg-slate-50">
                          <td className="p-3">
                            <div className="font-bold text-sm text-slate-800">{row.name}</div>
                            <div className="text-[10px] font-mono font-medium text-slate-400 mt-0.5">Առկա հումքի պահեստում: <span className="text-indigo-600 font-bold">{whRaw}</span></div>
                          </td>
                          <td className="p-3 text-center border-l border-slate-100">
                             <div className="font-mono font-bold text-slate-800 text-base">{row.transferred} <span className="text-slate-400 text-xs">/ {row.required}</span></div>
                             <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">{row.unit}</div>
                          </td>
                          <td className="p-3 text-center border-l border-slate-100 bg-amber-50/30">
                             <div className="font-mono font-black text-amber-700 text-lg">{prodBal} <span className="text-[10px]">{row.unit}</span></div>
                          </td>
                          <td className="p-3 border-l border-slate-100 bg-indigo-50/30">
                             <div className="flex items-center gap-2">
                               <input 
                                 type="number" 
                                 value={transferInputs[matId] || ''}
                                 onChange={e => setTransferInputs({...transferInputs, [matId]: e.target.value})}
                                 className="w-full border border-indigo-200 bg-white px-3 py-2 rounded-lg font-mono font-bold text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                                 placeholder="+ Քանակ"
                                 min="0"
                                 max={whRaw}
                               />
                             </div>
                          </td>
                       </tr>
                     )
                   })}
                </tbody>
             </table>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-2xl">
              <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-200 transition-colors">
                Չեղարկել
              </button>
              <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all">
                <Truck size={16}/> Ուղարկել Տեղափոխման Հարցում
              </button>
          </div>
       </div>
    </div>
  )
}

function RejectTransitModal({ onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
       <div className="bg-white rounded-xl p-6 w-[400px] shadow-2xl">
         <h2 className="text-lg font-bold text-red-600 mb-2 flex items-center gap-2"><AlertCircle size={20}/> Մերժել Տեղափոխումը</h2>
         <p className="text-sm font-medium text-slate-500 mb-4">Խնդրում ենք նշել մերժման պատճառը, որպեսզի հումքի պահեստը տեսնի այն:</p>
         
         <textarea 
            className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
            rows={3}
            placeholder="Մերժման պատճառը..."
            value={reason}
            onChange={e => setReason(e.target.value)}
         />

         <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-lg">Հետ</button>
            <button onClick={() => {
              if(!reason) return alert('Մերժման պատճառը պարտադիր է:');
              onConfirm(reason);
            }} className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow">Հաստատել Մերժումը</button>
         </div>
       </div>
    </div>
  )
}
