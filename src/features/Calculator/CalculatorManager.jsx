import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  BarChart, 
  AlertTriangle,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { PRODUCTION_PRODUCTS, BOM_CONFIGURATION, INITIAL_STOCK } from '../../data/mockData';

export default function CalculatorManager({ activeRole }) {
  // Input: list of objects { productId, quantity }
  const [simulationItems, setSimulationItems] = useState([]);

  // Mock checking type responsible permission
  const isTypeResp = activeRole === 'Տեսակի պատասխանատու';
  // Note: in a real app, we'd filter PRODUCTION_PRODUCTS based on the user's assigned type.
  // For this mock, both Chief and Type Resp see the same list.

  const handleAddItem = () => {
    setSimulationItems([...simulationItems, { productId: PRODUCTION_PRODUCTS[0].id, quantity: 1000 }]);
  };

  const handleRemoveItem = (index) => {
    setSimulationItems(simulationItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...simulationItems];
    updated[index][field] = field === 'quantity' ? Math.max(0, Number(value)) : value;
    setSimulationItems(updated);
  };

  // 1. Calculate Aggregated Raw Material Requirement
  const rawMaterialNeeds = useMemo(() => {
    const needsMap = {}; // itemId -> { name, requiredQty, unit, actualStock }
    
    simulationItems.forEach(item => {
       const qtyToProduce = Number(item.quantity) || 0;
       const bom = BOM_CONFIGURATION[item.productId];
       
       if (bom && qtyToProduce > 0) {
         bom.forEach(mat => {
           if (!needsMap[mat.itemId]) {
             const stockItem = INITIAL_STOCK.find(s => s.code === mat.itemId || s.id === mat.itemId);
             needsMap[mat.itemId] = {
               name: mat.name,
               unit: mat.unit,
               requiredQty: 0,
               actualStock: stockItem ? stockItem.quantity : 0
             };
           }
           needsMap[mat.itemId].requiredQty += (qtyToProduce * mat.amountPerUnit);
         });
       }
    });
    
    return Object.values(needsMap);
  }, [simulationItems]);

  // 2. Product Sales Coverage (Days remaining)
  const productCoverage = useMemo(() => {
    return simulationItems.map((item, idx) => {
      const prodInfo = PRODUCTION_PRODUCTS.find(p => p.id === item.productId);
      const stockInfo = INITIAL_STOCK.find(s => s.code === item.productId || s.id === item.productId);
      const name = prodInfo ? prodInfo.name : 'Անհայտ';
      const dailySales = stockInfo ? stockInfo.dailyExpense : 0;
      const targetQty = Number(item.quantity) || 0;
      
      const coverageDays = dailySales > 0 ? (targetQty / dailySales).toFixed(1) : '∞';
      
      return {
        id: `${idx}-${item.productId}`,
        name,
        targetQty,
        dailySales,
        coverageDays
      };
    }).filter(i => i.targetQty > 0);
  }, [simulationItems]);

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between bg-white border-b border-slate-200 px-8 py-5 flex-shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <Calculator className="text-indigo-600" size={28} />
          <h1 className="text-2xl font-black tracking-tight text-slate-800">
            Արտադրական Հաշվիչ (Սիմուլյացիա)
          </h1>
        </div>
        
        <div className="flex items-center bg-slate-100 rounded-lg p-1.5 px-4 font-semibold text-slate-700">
           Դեր: <span className="ml-2 text-indigo-700">{activeRole}</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          
          {/* LEFT PANEL: Setup */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
               <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-6">
                 <Calculator size={18} /> Մոդելավորվող Պրոդուկտներ
               </h2>
               
               <p className="text-sm text-slate-500 mb-6 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                 Ավելացրեք պրոդուկտներ և նշեք արտադրման թիրախային քանակները: Համակարգը կհաշվարկի անհրաժեշտ հումքը և կհամեմատի այն ընթացիկ մնացորդի հետ:
               </p>

               <div className="space-y-4">
                 {simulationItems.map((item, index) => (
                   <div key={index} className="flex flex-wrap items-end gap-3 bg-slate-50 p-4 border border-slate-200 rounded-xl relative group">
                      <button 
                        onClick={() => handleRemoveItem(index)}
                        className="absolute top-3 right-3 text-red-300 hover:text-red-500 transition-colors"
                        title="Հեռացնել"
                      >
                        <Trash2 size={18} />
                      </button>
                      
                      <div className="flex-1 min-w-[200px]">
                         <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Պրոդուկտ</label>
                         <select 
                           value={item.productId}
                           onChange={e => handleItemChange(index, 'productId', e.target.value)}
                           className="w-full bg-white border border-slate-300 text-sm font-semibold text-slate-700 py-2.5 px-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                         >
                           {PRODUCTION_PRODUCTS.map(p => (
                             <option key={p.id} value={p.id}>{p.name}</option>
                           ))}
                         </select>
                      </div>

                      <div className="w-32">
                         <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Քանակ (Հատ)</label>
                         <input 
                           type="number" 
                           min="0"
                           value={item.quantity}
                           onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                           className="w-full bg-white border border-slate-300 text-sm font-black text-indigo-700 py-2.5 px-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                         />
                      </div>
                   </div>
                 ))}
               </div>

               <button 
                 onClick={handleAddItem}
                 className="mt-6 flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-indigo-200 text-indigo-600 bg-indigo-50/30 hover:bg-indigo-50 transition-colors font-bold text-sm"
               >
                 <Plus size={18} /> Ավելացնել Շարք
               </button>
            </div>
          </div>

          {/* RIGHT PANEL: Analytics & Results */}
          <div className="flex flex-col gap-6">
             
             {/* Box 1: Raw Material Needs & Deficits */}
             <div className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-6 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-20 pointer-events-none"></div>
                
                <h2 className="text-sm font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-2 mb-6">
                  <BarChart size={18} /> Հումքի Պահանջ և Մնացորդ (BOM)
                </h2>

                {rawMaterialNeeds.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 font-medium">
                    Սիմուլյացիայի արդյունքները կերևան այստեղ
                  </div>
                ) : (
                  <div className="space-y-3 relative z-10">
                    {rawMaterialNeeds.map((mat, idx) => {
                      const deficit = mat.actualStock - mat.requiredQty;
                      const isShort = deficit < 0;
                      
                      return (
                        <div key={idx} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                           <div>
                             <h4 className="font-bold text-slate-100">{mat.name}</h4>
                             <div className="text-xs text-slate-400 mt-1">
                               Պահեստի մնացորդ. <span className="font-bold text-slate-300">{Number(mat.actualStock).toFixed(1)} {mat.unit}</span>
                             </div>
                           </div>
                           
                           <div className="flex flex-col items-end">
                              <span className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">Պահանջվող</span>
                              <span className="text-lg font-black text-indigo-400">{Number(mat.requiredQty).toFixed(2)} {mat.unit}</span>
                           </div>

                           <div className={`flex flex-col items-end px-3 py-1.5 rounded-lg border ${isShort ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-green-500/10 border-green-500/30 text-green-400'}`}>
                              <span className="text-[10px] uppercase font-bold tracking-widest flex items-center gap-1">
                                {isShort ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />} 
                                {isShort ? 'Պակասորդ' : 'Ավելցուկ'}
                              </span>
                              <span className="font-black text-sm">
                                {isShort ? deficit.toFixed(2) : `+${deficit.toFixed(2)}`} {mat.unit}
                              </span>
                           </div>
                        </div>
                      );
                    })}
                  </div>
                )}
             </div>

             {/* Box 2: Sales Coverage Analytics */}
             {productCoverage.length > 0 && (
               <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-6">
                    <TrendingUp size={18} /> Վաճառքի Ծածկույթ (Անալիտիկա)
                  </h2>

                  <div className="space-y-4">
                    {productCoverage.map(cov => (
                       <div key={cov.id} className="flex items-center justify-between border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                          <div>
                            <div className="font-bold text-slate-800">{cov.name} <span className="text-sm font-normal text-slate-500">({cov.targetQty} հատ)</span></div>
                            <div className="text-xs font-semibold text-slate-400 mt-0.5 tracking-wide">Միջին օրական վաճառք. {cov.dailySales} հատ</div>
                          </div>
                          
                          <div className="text-right">
                             <div className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-0.5">Կբավականացնի</div>
                             <div className="text-xl font-black text-indigo-600">
                               {cov.coverageDays} <span className="text-sm font-bold">օր</span>
                             </div>
                          </div>
                       </div>
                    ))}
                  </div>
               </div>
             )}

          </div>
        </div>

      </div>
    </div>
  );
}
