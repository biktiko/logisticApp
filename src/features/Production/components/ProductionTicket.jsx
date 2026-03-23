import React, { useState } from 'react';
import { 
  PackageSearch,
  ChevronDown, 
  ChevronUp,
  Clock,
  Play,
  CheckCircle,
  Plus,
  ArrowRight,
  Truck,
  ListOrdered
} from 'lucide-react';

export default function ProductionTicket({ ticket, activeRole, isProdHead, isTypeResp, onUpdate }) {
  const [expanded, setExpanded] = useState(ticket.status === 'Ընթացքի մեջ');
  
  // Temporary state for the phasing inputs (productId -> string)
  const [phaseInputs, setPhaseInputs] = useState({});

  const StatusColor = {
    'Սպասման մեջ': 'bg-amber-100 text-amber-800',
    'Ընթացքի մեջ': 'bg-yellow-100 text-yellow-800',
    'Արտադրված': 'bg-green-100 text-green-800',
    'Կատարված': 'bg-gray-100 text-gray-800'
  }[ticket.status];

  // Raw Material Transfer Modal (mock inline)
  const [showTransitReq, setShowTransitReq] = useState(false);

  const handleStart = (e) => {
    e.stopPropagation();
    onUpdate({ ...ticket, status: 'Ընթացքի մեջ' });
    setExpanded(true);
  };

  const handleFinish = (e) => {
    e.stopPropagation();
    onUpdate({ ...ticket, status: 'Արտադրված' });
  };

  const handleAddPhase = (product) => {
    const val = Number(phaseInputs[product.id]) || 0;
    if (val <= 0) return;
    
    const newHistory = [
      { date: new Date().toISOString(), qty: val },
      ...product.history
    ];
    
    const newProducts = ticket.products.map(p => 
      p.id === product.id ? { ...p, actualQty: p.actualQty + val, history: newHistory } : p
    );

    onUpdate({ ...ticket, products: newProducts });
    setPhaseInputs(prev => ({ ...prev, [product.id]: '' }));
  };

  const handleInput = (id, val) => {
    setPhaseInputs(prev => ({ ...prev, [id]: val }));
  };

  const handleTransferRequest = () => {
    alert("Ստեղծվեց հարցում: Հումքը Տեսակի հումքի պահեստից կտեղափոխվի 'Տրանզիտ' կարգավիճակ:");
    // Mock logic: add to transit
    const updated = {
      ...ticket,
      transitMaterials: [
        ...ticket.transitMaterials,
        { name: 'Նոր Հումք', requested: 50, received: 0, unit: 'կգ', status: 'Տրանզիտ' }
      ]
    };
    onUpdate(updated);
    setShowTransitReq(false);
  };

  const handleAcceptTransit = (idx) => {
    const newTransit = [...ticket.transitMaterials];
    newTransit[idx].received = newTransit[idx].requested;
    newTransit[idx].status = 'Ընդունված';
    alert("Հումքը ընդունվեց արտադրամաս:");
    onUpdate({ ...ticket, transitMaterials: newTransit });
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 transition-all shadow-sm overflow-hidden 
      ${expanded ? 'ring-2 ring-blue-100' : 'hover:border-blue-300 hover:shadow-md cursor-pointer'}`}
    >
      {/* CARD HEADER (Collapsed View) */}
      <div 
        className="px-6 py-5 flex items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-5">
           <div className={`p-4 rounded-xl flex items-center justify-center
              ${ticket.status === 'Ընթացքի մեջ' ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-400'}`}
           >
             <PackageSearch size={22} />
           </div>
           
           <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                 <h3 className="font-extrabold text-lg text-slate-800">{ticket.id}</h3>
                 <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg uppercase tracking-wide border ${StatusColor} border-opacity-50`}>
                   {ticket.status}
                 </span>
              </div>
              <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                 <Clock size={12} />
                 {new Date(ticket.date).toLocaleString('hy-AM', { dateStyle: 'short', timeStyle: 'short' })} 
                 <span className="mx-1">•</span>
                 {ticket.author}
              </div>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
           {ticket.status === 'Սպասման մեջ' && isProdHead && (
             <button 
               onClick={handleStart}
               className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold shadow-md shadow-blue-200"
             >
               <Play size={16} fill="currentColor" /> Սկսել
             </button>
           )}
           
           {ticket.status === 'Ընթացքի մեջ' && isProdHead && (
             <button 
               onClick={handleFinish}
               className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold shadow-md shadow-purple-200"
             >
               Ավարտել <ArrowRight size={16} />
             </button>
           )}

           <div className="text-slate-400 ml-2">
             {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
           </div>
        </div>
      </div>

      {/* EXPANDED DETAILED VIEW */}
      {expanded && (
        <div className="border-t border-slate-100 bg-white p-6 cursor-default">
          
          {/* Section A: Products List and Phasing */}
          <div className="mb-6">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
               <ListOrdered size={14} /> ՊՐՈԴՈՒԿՏՆԵՐԻ ՑԱՆԿ ԵՎ ՓՈՒԼԱՅԻՆ ՄՈՒՏՔԱԳՐՈՒՄ
            </h4>
            
            <div className="space-y-4">
              {ticket.products.map(product => (
                <div key={product.id} className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 relative">
                  <div className="flex justify-between items-start mb-4">
                     <div>
                       <h5 className="font-extrabold text-slate-800 text-lg mb-1">{product.name}</h5>
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                         Պլանավորված <span className="text-slate-700">{product.plannedQty}</span>
                       </span>
                     </div>
                     
                     <div className="flex gap-4 items-center">
                        <div className="flex flex-col items-end mr-4">
                           <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ընդհանուր Փաստ.</span>
                           <span className="text-xl font-black text-blue-600">{product.actualQty}</span>
                        </div>
                        
                        {ticket.status === 'Ընթացքի մեջ' && isProdHead && (
                          <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1">
                            <input 
                              type="number"
                              placeholder="Քանակ"
                              value={phaseInputs[product.id] || ''}
                              onChange={e => handleInput(product.id, e.target.value)}
                              className="w-24 px-3 py-1.5 text-sm font-bold text-slate-700 outline-none rounded-lg"
                            />
                            <button 
                              onClick={() => handleAddPhase(product)}
                              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors ml-1"
                              title="Ավելացնել տվյալ փուլի քանակը"
                            >
                              <Plus size={18} strokeWidth={3} />
                            </button>
                          </div>
                        )}
                     </div>
                  </div>
                  
                  {/* Phasing History */}
                  {product.history.length > 0 && (
                     <div className="mt-4 pt-4 border-t border-slate-200/60 pl-2">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-3 block">
                          Արտադրության Պատմություն
                        </span>
                        <div className="space-y-2">
                           {product.history.map((h, idx) => (
                             <div key={idx} className="flex justify-between items-center text-xs text-slate-500 font-medium">
                               <div className="flex items-center gap-2">
                                 <Clock size={12} className="text-slate-300" />
                                 {new Date(h.date).toLocaleString('hy-AM')}
                               </div>
                               <span className="font-bold text-slate-700">+ {h.qty} {product.unit}</span>
                             </div>
                           ))}
                        </div>
                     </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section B: Raw Materials Transfer Box */}
          <div className="bg-[#0b1b36] rounded-2xl p-6 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-10 -mr-10 -mt-20 pointer-events-none"></div>
             
             <div className="flex justify-between items-center mb-6">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle size={14} /> ՀՈՒՄՔԻ ԾԱԽՍԻ ՀԱՇՎԱՐԿ ԵՎ ՏԵՂԱՓՈԽՈՒՄ
                </h4>
                {isTypeResp && ticket.status !== 'Կատարված' && (
                  <button 
                    onClick={() => setShowTransitReq(!showTransitReq)}
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
                  >
                    <Truck size={14} /> Տեղափոխել հումք
                  </button>
                )}
             </div>

             <div className="grid grid-cols-[1fr_auto_1fr] gap-x-4 gap-y-3 font-medium text-sm text-slate-300">
                {ticket.transitMaterials.map((mat, idx) => (
                   <React.Fragment key={idx}>
                      <div className="py-2 border-b border-white/5 font-semibold text-slate-100">{mat.name}</div>
                      <div className="py-2 border-b border-white/5 font-bold text-yellow-500 mx-8">
                         {mat.requested} <span className="text-xs text-yellow-600">{mat.unit}</span>
                         <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded uppercase ${mat.status === 'Տրանզիտ' ? 'bg-amber-500/20 text-amber-300' : 'bg-green-500/20 text-green-300'}`}>{mat.status}</span>
                      </div>
                      <div className="py-2 border-b border-white/5 text-right flex items-center justify-end gap-3">
                         {/* Action for Prod Head to receive transit */}
                         {mat.status === 'Տրանզիտ' && isProdHead && (
                           <button 
                             onClick={() => handleAcceptTransit(idx)}
                             className="text-xs bg-green-500 text-white font-bold px-3 py-1.5 rounded-md hover:bg-green-600 transition-colors shadow-sm shadow-green-900"
                           >
                              Հաստատել Ստացումը
                           </button>
                         )}
                         {mat.status === 'Ընդունված' && (
                           <span className="text-xs text-slate-500 border border-slate-700 rounded px-2 py-1">Արտադրամասում է</span>
                         )}
                      </div>
                   </React.Fragment>
                ))}
             </div>

             <p className="text-[10px] text-slate-500 mt-6 italic">
                * Հումքի վերջնական ելքագրումը արտադրամասից կատարվում է պրոդուկտի ձևավորումից հետո: (Mocked logic for demo)
             </p>
          </div>

      </div>
      )}
    </div>
  );
}
