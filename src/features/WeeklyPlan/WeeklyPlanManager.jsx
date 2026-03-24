import React, { useState, useMemo } from 'react';
import { Calendar, Download, Save, Send, CheckCircle, XCircle, History, Filter } from 'lucide-react';
import { PRODUCTION_PRODUCTS, BOM_CONFIGURATION } from '../../data/mockData';
import PlanGrid from './components/PlanGrid';

const INITIAL_PLANS = [
  {
    id: 'W13-2026',
    title: 'Շաբաթվա պլան (23-29 Մարտ 2026)',
    author: 'Տեսակի պատասխանատու',
    status: 'Հաստատման ենթակա',
    rejectionReason: '',
    data: PRODUCTION_PRODUCTS.reduce((acc, p) => {
      acc[p.id] = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0, actualProduced: 120 };
      return acc;
    }, {})
  },
  {
    id: 'W12-2026',
    title: 'Շաբաթվա պլան (16-22 Մարտ 2026)',
    author: 'Տեսակի պատասխանատու',
    status: 'Հաստատված է',
    rejectionReason: '',
    data: PRODUCTION_PRODUCTS.reduce((acc, p) => {
      acc[p.id] = { Mon: 100, Tue: 150, Wed: 120, Thu: 200, Fri: 180, Sat: 50, Sun: 0, actualProduced: p.id === 'ITEM-004' ? 800 : 750 };
      return acc;
    }, {})
  }
];

export default function WeeklyPlanManager({ activeRole, productionOrders, setProductionOrders }) {
  const [plans, setPlans] = useState(INITIAL_PLANS);
  const [activePlanId, setActivePlanId] = useState('W13-2026');
  const [typeFilter, setTypeFilter] = useState('Բոլորը');

  const isTypeResp = activeRole === 'Տեսակի պատասխանատու';
  const isProdHead = activeRole === 'Արտադրամասի պետ';
  const isChief = ['Սուպերադմին', 'Գլխավոր պահեստապետ'].includes(activeRole);

  const filteredPlans = useMemo(() => {
    // In a real app we'd filter by the specific responsible's product type. Mocked here.
    if (typeFilter !== 'Բոլորը') {
      return plans; // Demo only
    }
    return plans;
  }, [plans, typeFilter]);

  const activePlan = plans.find(p => p.id === activePlanId);

  const isReadOnly = activePlan?.status === 'Հաստատված է' || !isTypeResp; // Only Type Resp can edit inputs (when not approved)

  const handleDayChange = (productId, day, value) => {
    if (isReadOnly) return;
    const parsed = value === '' ? 0 : Number(value);
    
    setPlans(prev => prev.map(plan => {
      if (plan.id === activePlanId) {
        return {
          ...plan,
          data: {
             ...plan.data,
             [productId]: {
               ...plan.data[productId],
               [day]: Math.max(0, parsed)
             }
          }
        };
      }
      return plan;
    }));
  };

  const handleExport = () => {
    alert('Պլանը հաջողությամբ արտահանվեց Excel:');
  };

  const handleApproveAndGenerateOrders = () => {
    setPlans(prev => prev.map(p => p.id === activePlanId ? { ...p, status: 'Հաստատված է' } : p));
    
    // Auto-generate orders for each day
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const newOrders = [];
    
    days.forEach((day, idx) => {
       const productsToProduce = [];
       PRODUCTION_PRODUCTS.forEach(prod => {
          const qty = activePlan.data[prod.id]?.[day] || 0;
          if (qty > 0) {
             productsToProduce.push({
               id: prod.id,
               name: prod.name,
               plannedQty: qty,
               unit: prod.unit || 'հատ',
               actualQty: 0,
               history: []
             });
          }
       });
       
       if (productsToProduce.length > 0) {
          const date = new Date();
          date.setDate(date.getDate() + idx + 1); // Mock future date per day
          const dayOrder = {
            id: `PRD-${activePlan.id}-${day.toUpperCase()}`,
            date: date.toISOString(),
            author: 'Ավտոմատ (Շաբ. պլանից)',
            status: 'Սպասման մեջ', // passive status per requirements
            products: productsToProduce,
            transitMaterials: [] // Raw materials would be requested later or populated automatically
          };
          newOrders.push(dayOrder);
       }
    });

    if (newOrders.length > 0 && setProductionOrders) {
      setProductionOrders(prev => [...newOrders, ...prev]);
    }
    
    alert(`Պլանը հաստատվել է: 7 օրվա համար ստեղծվել են ${newOrders.length} պատվերներ և ավելացվել արտադրության բաժնում (պասիվ կարգավիճակով):`);
  };

  const handleSendOrApprove = () => {
    if (isTypeResp) {
      setPlans(prev => prev.map(p => p.id === activePlanId ? { ...p, status: 'Հաստատման ենթակա', rejectionReason: '' } : p));
      alert('Պլանը ուղարկվել է արտադրամասի պետի հաստատմանը:');
    } else if (isProdHead) {
      handleApproveAndGenerateOrders();
    }
  };

  const handleReject = () => {
    const reason = prompt("Նշել մերժման պատճառը:");
    if (!reason) return;
    setPlans(prev => prev.map(p => p.id === activePlanId ? { ...p, status: 'Փոփոխման ենթակա', rejectionReason: reason } : p));
  };

  return (
    <div className="flex h-full bg-[#f8fafc] overflow-hidden w-full">
      {/* ── Left Sidebar (History & Filters) ── */}
      <aside className="w-72 min-w-[288px] bg-white border-r border-slate-200 flex flex-col pt-6 pb-2 px-4 gap-6 overflow-y-auto flex-shrink-0 z-10 shadow-sm">
         <div className="flex items-center gap-3 px-2 mb-2">
           <History className="text-slate-500" size={22} />
           <h2 className="font-extrabold text-slate-700 tracking-tight">Պլանների Պատմություն</h2>
         </div>

         {isChief && (
           <div className="px-2 pb-4 border-b border-slate-100 flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <Filter size={14} /> Ֆիլտր ըստ տեսակի
              </label>
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Բոլորը">Բոլոր Պահեստապետերի</option>
                <option value="Չորահացի">Չորահացի</option>
                <option value="Չիպսերի">Չիպսերի</option>
                <option value="Արևածաղկի">Արևածաղկի (Հիմնական)</option>
              </select>
           </div>
         )}
         
         <div className="flex flex-col gap-1.5 px-1">
            {filteredPlans.map(plan => {
               const isActive = activePlanId === plan.id;
               return (
                 <button
                   key={plan.id}
                   onClick={() => setActivePlanId(plan.id)}
                   className={`text-left flex flex-col gap-1 px-4 py-3 rounded-xl transition-all border
                     ${isActive ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'}
                   `}
                 >
                   <div className="flex items-center justify-between w-full">
                     <span className={`text-sm font-bold ${isActive ? 'text-blue-700' : 'text-slate-700'}`}>{plan.id}</span>
                     <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full
                        ${plan.status === 'Հաստատված է' ? 'bg-green-100 text-green-700' : 
                          plan.status === 'Փոփոխման ենթակա' ? 'bg-red-100 text-red-700' : 
                          'bg-amber-100 text-amber-700'}
                     `}>
                       {plan.status === 'Հաստատված է' ? 'OK' : plan.status.substring(0,6)+'...'}
                     </span>
                   </div>
                   <span className="text-xs font-medium text-slate-500 line-clamp-1">{plan.title}</span>
                 </button>
               )
            })}
         </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="flex items-center justify-between bg-white border-b border-slate-200 px-8 py-5 z-10 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="p-2 border border-slate-200 bg-slate-50 rounded-xl shadow-sm text-blue-600">
               <Calendar size={24} />
            </div>
            <div>
               <h1 className="text-xl font-bold tracking-tight text-slate-800">
                 {activePlan?.title || 'Ընտրեք Պլան'}
               </h1>
               {activePlan && (
                 <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-semibold text-slate-400">Տիպի Պատասխանատու. {activePlan.author}</span>
                    <span className="text-[10px] text-slate-300">•</span>
                    <span className={`text-xs font-bold ${
                      activePlan.status === 'Հաստատված է' ? 'text-green-600' :
                      activePlan.status === 'Փոփոխման ենթակա' ? 'text-red-600' : 'text-amber-600'
                    }`}>
                       {activePlan.status}
                    </span>
                 </div>
               )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              title="Արտահանել Excel"
              onClick={handleExport}
              disabled={!activePlan}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 border border-slate-300 bg-white hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              <Download size={16} /> Արտահանել
            </button>

            {/* Type Responsible Action */}
            {isTypeResp && activePlan?.status !== 'Հաստատված է' && activePlan?.status !== 'Հաստատման ենթակա' && (
               <button 
                 onClick={handleSendOrApprove}
                 className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-200"
               >
                 <Send size={16} /> Ուղարկել Հաստատման
               </button>
            )}

            {/* Production Head Actions */}
            {isProdHead && activePlan?.status === 'Հաստատման ենթակա' && (
               <div className="flex gap-2">
                 <button 
                   onClick={handleReject}
                   className="flex items-center gap-2 border-2 border-red-200 text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-300 px-5 py-2 rounded-xl text-sm font-bold transition-all"
                 >
                   <XCircle size={18} /> Մերժել
                 </button>
                 <button 
                   onClick={handleSendOrApprove}
                   className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-green-200"
                 >
                   <CheckCircle size={18} /> Հաստատել այն
                 </button>
               </div>
            )}
          </div>
        </div>

        {activePlan?.status === 'Փոփոխման ենթակա' && activePlan.rejectionReason && (
          <div className="mx-8 mt-6 bg-red-50/50 border border-red-200 text-red-800 px-5 py-4 rounded-2xl flex items-start gap-3 shadow-sm flex-shrink-0 animate-in slide-in-from-top-2">
            <XCircle size={20} className="mt-0.5 flex-shrink-0 text-red-500" />
            <div>
              <div className="font-extrabold text-sm mb-1 uppercase tracking-widest text-red-600">Արտադրության պետը մերժել է պլանը</div>
              <div className="text-sm font-semibold">Մեկնաբանություն: <span className="font-normal text-slate-700 bg-white px-2 py-0.5 rounded border border-red-100 shadow-sm ml-1">{activePlan.rejectionReason}</span></div>
            </div>
          </div>
        )}

        {activePlan?.status === 'Հաստատված է' && (
          <div className="mx-8 mt-6 bg-green-50/50 border border-green-200 text-green-800 px-5 py-4 rounded-2xl flex items-start gap-3 shadow-sm flex-shrink-0 animate-in slide-in-from-top-2">
            <CheckCircle size={20} className="mt-0.5 flex-shrink-0 text-green-500" />
            <div>
               <div className="font-extrabold text-sm mb-1 uppercase tracking-widest text-green-600">Պլանը Հաստատված է</div>
               <div className="text-sm font-medium text-slate-700">Բոլոր 7 օրերի պատվերները ավտոմատ ավելացվել են «Արտադրություն» բաժնում (որպես Սպասման մեջ):</div>
            </div>
          </div>
        )}

        {activePlan && (
          <PlanGrid 
            planData={activePlan.data} 
            onDayChange={(prodId, day, val) => handleDayChange(prodId, day, val)} 
            isReadOnly={isReadOnly}
            bomConfig={BOM_CONFIGURATION}
            products={PRODUCTION_PRODUCTS}
          />
        )}
      </div>
    </div>
  );
}
