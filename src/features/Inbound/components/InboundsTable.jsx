import React, { useState } from 'react';
import { Check, X, Edit3, ClipboardList, Link, History } from 'lucide-react';

export default function InboundsTable({ inbounds, onAction, activeRole, isHistory }) {

  const canApproveGlobal = ['Սուպերադմին', 'Գլխավոր պահեստապետ'].includes(activeRole);
  const isTypeResp = activeRole === 'Տեսակի պատասխանատու';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full h-full flex flex-col">
      <div className="overflow-auto flex-grow h-full">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-32">Ticket ID</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-40">Ամսաթիվ</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Մուտք (Պրոդուկտ / Քանակ / Պահեստ)</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Մատակարար</th>
              {!isHistory && (
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right w-48">Գործողություն</th>
              )}
              {isHistory && (
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-32 text-center">Կարգավիճակ</th>
              )}
              {isHistory && (
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-32 text-center">Log</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {inbounds.map((entry) => {
              const { items, status } = entry;

              const badgeClass = 
                status === 'Հաստատման ենթակա' ? 'bg-amber-100 text-amber-800' :
                status === 'Հաստատված' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'; 

              return (
                <tr key={entry.id} className="bg-white hover:bg-slate-50 transition-colors group">
                  <td className="p-4">
                    <div className="font-mono text-sm text-slate-600 font-semibold">{entry.id}</div>
                    <div className="text-[10px] text-slate-400 mt-1">Նախաձեռնող. {entry.initiator}</div>
                    {entry.linkedTicket && (
                      <div className="flex items-center gap-1 mt-1 text-blue-500 text-[10px] font-bold">
                        <Link size={10} /> {entry.linkedTicket}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-sm text-slate-600">{new Date(entry.date).toLocaleString('hy-AM', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td className="p-4">
                    <div className="flex flex-col gap-2">
                      {items.map((it, idx) => (
                        <div key={idx} className="text-sm font-medium text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 w-max grid grid-cols-[1fr_auto] items-center gap-x-6">
                           <div className="flex flex-col">
                             <span>{it.name}</span>
                             <span className="text-[10px] text-slate-500">{it.targetWarehouse}</span>
                           </div>
                           <span className="font-bold text-blue-700">{it.qty} {it.unit}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    {entry.supplier || <span className="italic text-slate-400">Չի նշված</span>}
                  </td>
                  
                  {!isHistory && (
                    <td className="p-4 text-right align-middle">
                      {/* Workflow Actions */}
                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => {
                            const reason = prompt("Նշել մերժման պատճառը:");
                            if (reason !== null) onAction(entry.id, 'reject', { reason });
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 shadow-sm" title="Մերժել"
                        >
                          <X size={14} /> Մերժել
                        </button>
                        <button 
                          onClick={() => {
                            // Check if Chief needs to approve (Global Warehouse access logic)
                            // If they are not Chief, and items contain Global Warehouse, they logically shouldn't be able to approve 
                            // but UI restriction is simple here since only Chief/TypeResp see this tab based on our rules.
                            if (!window.confirm("Համոզվա՞ծ եք, որ ցանկանում եք հաստատել: Մնացորդները ավտոմատ կավելանան նշված պահեստներում:")) return;
                            onAction(entry.id, 'approve');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 shadow-sm" title="Հաստատել և Ավելացնել"
                        >
                          <Check size={14} /> Հաստատել
                        </button>
                      </div>
                    </td>
                  )}
                  
                  {isHistory && (
                    <td className="p-4 text-center align-middle">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold w-max ${badgeClass}`}>
                        {status}
                      </span>
                    </td>
                  )}

                  {isHistory && (
                    <td className="p-4 text-center align-middle">
                      <button 
                        className="text-slate-400 hover:text-blue-600 transition-colors"
                        onClick={() => alert(`Log entries for ${entry.id}:\n${entry.log.map(l => `${new Date(l.date).toLocaleTimeString()} - ${l.actor} (${l.action}) - ${l.comment}`).join('\n')}`)}
                        title="Դիտել Log-ը"
                      >
                         <History size={18} />
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
        {inbounds.length === 0 && (
          <div className="p-8 text-center text-slate-500 font-medium flex flex-col items-center gap-2 mt-8">
             <ClipboardList size={36} className="text-slate-200" />
             Այս պահին հարցումներ չկան:
          </div>
        )}
      </div>
    </div>
  );
}
