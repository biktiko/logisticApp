import React, { useState } from 'react';
import { 
  History, 
  Check, 
  X,
  Edit2,
  CalendarDays
} from 'lucide-react';

export default function InventoryList({ inventories, activeRole, onAction, canApprove }) {
  const [filter, setFilter] = useState('Բոլորը');

  const filtered = inventories.filter(i => filter === 'Բոլորը' || i.status === filter);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-full">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
         <h2 className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2">
           <History size={18} /> Գույքագրումների Պատմություն
         </h2>
         <select 
           value={filter}
           onChange={e => setFilter(e.target.value)}
           className="bg-slate-50 border border-slate-200 text-sm font-semibold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
         >
           <option value="Բոլորը">Բոլոր Կարգավիճակները</option>
           <option value="Պատրաստ">Սպասում է Հաստատման</option>
           <option value="Հաստատված">Հաստատված</option>
           <option value="Մերժված">Մերժված (Ակտիվ չէ)</option>
           <option value="Ուղղման հարցում">Ուղղման հարցում</option>
         </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px] text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
             <tr>
               <th className="p-4 text-xs font-bold text-slate-500 uppercase w-32">ID / Կարգավիճակ</th>
               <th className="p-4 text-xs font-bold text-slate-500 uppercase w-48">Ամսաթիվ / Հեղինակ</th>
               <th className="p-4 text-xs font-bold text-slate-500 uppercase">Մանրամասներ (Շեղումներ)</th>
               <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right w-48">Գործողություն</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
             {filtered.length === 0 ? (
               <tr><td colSpan="4" className="text-center p-8 text-slate-400">Գրառումներ չգտնվեցին</td></tr>
             ) : (
               filtered.map((inv) => {
                 const diffCount = inv.changes?.filter(c => c.diff !== 0).length || 0;
                 
                 const StatusColor = {
                   'Պատրաստ': 'bg-amber-100 text-amber-800 border-amber-200',
                   'Հաստատված': 'bg-teal-100 text-teal-800 border-teal-200',
                   'Ուղղման հարցում': 'bg-purple-100 text-purple-800 border-purple-200',
                   'Մերժված': 'bg-red-100 text-red-800 border-red-200'
                 }[inv.status] || 'bg-slate-100 text-slate-800';

                 return (
                   <tr key={inv.id} className="hover:bg-slate-50/50">
                     <td className="p-4 align-top">
                        <div className="font-bold text-slate-700 font-mono text-sm">{inv.id}</div>
                        <div className={`mt-2 text-[10px] font-bold uppercase px-2 py-1 bg-white border ${StatusColor} rounded-md w-max shadow-sm tracking-wide`}>
                           {inv.status}
                        </div>
                     </td>
                     <td className="p-4 align-top">
                        <div className="text-sm font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                           <CalendarDays size={14} className="text-teal-600" />
                           {new Date(inv.date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-slate-500 mb-1">Հետին ամսաթիվ. {new Date(inv.targetDate).toLocaleDateString()}</div>
                        <div className="text-xs text-slate-400 mt-2 font-medium bg-slate-100 px-2 py-1 rounded w-max">
                          {inv.author}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{inv.warehouse}</div>
                     </td>
                     <td className="p-4 align-top">
                        <div className="text-sm font-bold text-slate-600 mb-3 block">
                          Շեղումներ և փոփոխություններ ({diffCount})
                        </div>
                        <div className="max-h-32 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                           {inv.changes?.map((c, idx) => (
                             <div key={idx} className="flex items-center justify-between text-xs bg-white border border-slate-200 p-2 rounded-lg shadow-sm">
                                <span className="font-semibold text-slate-700">{c.name}</span>
                                <div className="flex gap-4 items-center">
                                   <div className="flex flex-col items-center">
                                     <span className="text-[10px] text-slate-400">Համակարգ</span>
                                     <span className="font-medium">{c.systemQty} {c.unit}</span>
                                   </div>
                                   <div className="flex flex-col items-center">
                                     <span className="text-[10px] text-slate-400">Փաստացի</span>
                                     <span className="font-bold">{c.actualQty} {c.unit}</span>
                                   </div>
                                   <div className={`flex flex-col items-center w-16 px-2 py-1 rounded text-white font-bold
                                     ${c.diff > 0 ? 'bg-green-500' : c.diff < 0 ? 'bg-red-500' : 'bg-slate-300'}`}
                                   >
                                     <span className="text-[10px] opacity-80 uppercase">{c.diff > 0 ? 'Ավել' : c.diff < 0 ? 'Պակաս' : 'Նույնը'}</span>
                                     <span>{c.diff > 0 ? `+${c.diff}` : c.diff}</span>
                                   </div>
                                </div>
                             </div>
                           ))}
                        </div>
                        
                        {/* Inline log viewing */}
                        <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-400 flex gap-2">
                           <History size={14} /> Log: {inv.log.map(l => `${l.actor} (${l.action})`).join(' 👉 ')}
                        </div>
                     </td>
                     <td className="p-4 align-top text-right">
                        <div className="flex flex-col gap-2 items-end">
                          {(inv.status === 'Պատրաստ' || inv.status === 'Ուղղման հարցում') && canApprove && (
                            <>
                              <button 
                                onClick={() => onAction(inv.id, 'approve')}
                                className="w-full flex justify-center items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2 px-3 rounded-lg shadow transition-colors"
                              >
                                <Check size={14} /> Հաստատել
                              </button>
                              <button 
                                onClick={() => {
                                  let r = prompt('Նշել մերժման պատճառը:');
                                  if (r) onAction(inv.id, 'reject', r);
                                }}
                                className="w-full flex justify-center items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 font-bold text-xs py-2 px-3 rounded-lg transition-colors"
                              >
                                <X size={14} /> Մերժել
                              </button>
                            </>
                          )}
                          
                          {inv.status === 'Հաստատված' && (
                             <button
                               onClick={() => {
                                 const r = prompt("Նշել ուղղման պատճառը (ինչը սխալ էր փաստացիի մեջ):");
                                 if (r) onAction(inv.id, 'correct', r);
                               }}
                               className="w-full flex justify-center items-center gap-2 bg-white text-purple-600 border border-purple-200 hover:bg-purple-50 font-bold text-xs py-2 px-3 rounded-lg shadow-sm transition-colors"
                             >
                                <Edit2 size={12} /> Ուղղման հարցում
                             </button>
                          )}
                          
                          {inv.status === 'Մերժված' && (
                             <div className="text-xs text-red-500 font-bold w-full bg-red-50 p-2 rounded border border-red-100 text-center">
                               Մերժված է Գլխ. կողմից
                             </div>
                          )}
                        </div>
                     </td>
                   </tr>
                 );
               })
             )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
