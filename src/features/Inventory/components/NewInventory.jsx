import React, { useState, useMemo } from 'react';
import { 
  ArrowRight,
  Calculator,
  ScanBarcode,
  Search,
  XCircle
} from 'lucide-react';
import { INITIAL_STOCK, WAREHOUSE_OPTIONS, PRODUCTION_PRODUCTS } from '../../../data/mockData';

export default function NewInventory({ onComplete, onCancel }) {
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [warehouse, setWarehouse] = useState(WAREHOUSE_OPTIONS[0]);
  
  const [search, setSearch] = useState('');
  
  // Create an editable state mapping: itemId -> string quantity
  const [inputs, setInputs] = useState({});

  // Fetch items based on selected warehouse type
  // Production warehouse -> Only raw materials
  // Sales warehouse -> Only Products
  // Raw Mat warehouse -> Only Raw materials
  const expectedItems = useMemo(() => {
     let itemsToTrack = [];
     
     if (warehouse === 'Արտադրամաս' || warehouse.includes('հումքի պահեստ')) {
       itemsToTrack = INITIAL_STOCK.filter(i => i.type === 'Հումք');
     } else if (warehouse.includes('Վաճառքի')) {
       // Mock treating initial stock that has "Պատրաստի արտադրանք"
       itemsToTrack = INITIAL_STOCK.filter(i => i.type === 'Պատրաստի արտադրանք');
       // In a real scenario we'd query all products in that warehouse
       if (itemsToTrack.length === 0) {
         itemsToTrack = PRODUCTION_PRODUCTS.map(p => ({
            id: p.id, code: p.code, name: p.name, quantity: 100, unit: 'հատ', type: 'Արտադրանք'
         }));
       }
     } else {
       itemsToTrack = INITIAL_STOCK; // fallback
     }
     
     return itemsToTrack;
  }, [warehouse]);

  const filteredItems = expectedItems.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || i.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleInput = (id, val) => {
    setInputs(prev => ({ ...prev, [id]: val }));
  };

  const handleComplete = () => {
    // Generate differences
    const changes = expectedItems.map(item => {
      const actualVal = inputs[item.id] !== undefined && inputs[item.id] !== '' ? Number(inputs[item.id]) : null;
      if (actualVal === null) return null; // skipped
      
      const diff = actualVal - item.quantity;
      return {
         itemId: item.id,
         name: item.name,
         unit: item.unit,
         systemQty: item.quantity,
         actualQty: actualVal,
         diff: diff
      };
    }).filter(i => i !== null);

    if (changes.length === 0) {
      alert("Նշեք գոնե 1 ապրանքի փաստացի քանակ");
      return;
    }

    onComplete({
      targetDate,
      warehouse,
      changes
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full max-w-6xl mx-auto">
      
      <div className="bg-slate-50 p-6 border-b border-slate-200 flex flex-wrap gap-6 items-center justify-between">
         <div className="flex flex-wrap gap-4 items-center">
            <div className="flex flex-col gap-1.5">
               <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Գույքագրման Ամսաթիվ</label>
               <input 
                 type="date"
                 value={targetDate}
                 onChange={e => setTargetDate(e.target.value)}
                 className="bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
               />
            </div>
            
            <div className="flex flex-col gap-1.5">
               <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Թիրախային Պահեստ</label>
               <select 
                 value={warehouse}
                 onChange={e => {
                   setWarehouse(e.target.value);
                   setInputs({}); // Reset inputs on warehouse change
                 }}
                 className="bg-teal-50 border border-teal-200 text-teal-800 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-teal-500 shadow-sm min-w-[250px]"
               >
                 {WAREHOUSE_OPTIONS.map(w => <option key={w} value={w}>{w}</option>)}
               </select>
            </div>
         </div>

         <div className="flex items-center gap-3">
            <div className="relative">
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <input 
                 type="text"
                 placeholder="Որոնել և սկանավորել ապրանք..."
                 value={search}
                 onChange={e => setSearch(e.target.value)}
                 className="pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 shadow-inner w-64 bg-slate-50"
               />
            </div>
            <button className="bg-slate-100 hover:bg-slate-200 text-slate-500 p-2.5 rounded-xl shadow-sm border border-slate-200" title="Ակտիվացնել Շտրիխկոդի Սկաները">
               <ScanBarcode size={20} />
            </button>
         </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-[400px]">
         {/* Left Column: System Expected */}
         <div className="flex-1 w-1/2 flex flex-col border-r border-slate-200 bg-slate-50/50 relative overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-100 font-bold text-slate-500 uppercase tracking-widest text-xs flex justify-between items-center shadow-sm z-10">
               <span>Համակարգային Տվյալներ</span>
               <span className="text-[10px] text-slate-400 font-medium">({filteredItems.length} միավոր)</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
               {filteredItems.map(item => (
                 <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
                    <div className="flex flex-col">
                       <span className="font-bold text-slate-800">{item.name}</span>
                       <span className="text-[10px] text-slate-400 font-mono tracking-wider">{item.code}</span>
                    </div>
                    <div className="bg-slate-100 px-3 py-1.5 rounded-lg flex flex-col items-end">
                       <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Առկա է</span>
                       <span className="text-sm font-black text-slate-600">{item.quantity} {item.unit}</span>
                    </div>
                 </div>
               ))}
            </div>
         </div>
         
         {/* Right Column: Actual Input & Diff */}
         <div className="flex-1 w-1/2 flex flex-col bg-white overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-teal-50 font-bold text-teal-800 uppercase tracking-widest text-xs flex justify-between items-center shadow-sm z-10">
               <span>Փաստացի մնացորդի Մուտքագրում</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
               {filteredItems.map(item => {
                 const actual = inputs[item.id];
                 const isFilled = actual !== undefined && actual !== '';
                 const diff = isFilled ? Number(actual) - item.quantity : 0;
                 
                 return (
                   <div key={item.id} className={`p-1.5 pl-3 rounded-xl border flex items-center gap-3 transition-colors ${
                     isFilled ? (diff !== 0 ? 'bg-amber-50/50 border-amber-200' : 'bg-green-50/50 border-green-200') : 'border-slate-200 hover:border-teal-300'
                   }`}>
                      <div className="font-bold text-slate-700 flex-1 truncate text-sm" title={item.name}>{item.name}</div>
                      
                      {isFilled && diff !== 0 && (
                        <div className={`text-xs font-black uppercase px-2 py-1 rounded border mr-2
                          ${diff > 0 ? 'text-green-600 border-green-200 bg-green-50' : 'text-red-600 border-red-200 bg-red-50'}`}
                        >
                          {diff > 0 ? `+${diff}` : diff} {item.unit}
                        </div>
                      )}
                      
                      <div className="flex items-center">
                         <input 
                           type="number" 
                           placeholder="Քանակ"
                           value={actual || ''}
                           onChange={e => handleInput(item.id, e.target.value)}
                           className={`w-28 text-right font-black text-sm px-3 py-2 border rounded-lg outline-none transition-shadow focus:ring-2 focus:ring-teal-500
                             ${isFilled ? 'bg-white border-teal-300 text-teal-700' : 'bg-slate-50 border-slate-300 text-slate-700'}`}
                         />
                         <div className="bg-slate-100 text-[10px] font-bold text-slate-500 px-2 py-2 rounded-r-lg border-y border-r border-slate-300 -ml-1">
                           {item.unit}
                         </div>
                      </div>
                   </div>
                 );
               })}
            </div>
         </div>
      </div>

      <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center z-20">
         <button 
           onClick={onCancel}
           className="px-6 py-2.5 text-slate-500 font-bold hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-2"
         >
           <XCircle size={18} /> Չեղարկել
         </button>
         
         <div className="text-xs text-slate-400 italic font-medium">
           Քանակները ավտոմատ կերպով կհամեմատվեն համակարգային տվյալների հետ
         </div>
         
         <button 
           onClick={handleComplete}
           className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-black uppercase tracking-wider text-sm rounded-xl shadow-lg shadow-teal-200 transition-all flex items-center gap-2"
         >
           <Calculator size={18} /> Պատրաստել Հաշվետվություն <ArrowRight size={18} />
         </button>
      </div>
      
    </div>
  );
}
