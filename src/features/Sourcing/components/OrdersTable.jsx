import React, { useState } from 'react';
import { Mail, Check, X, Edit3, ClipboardList } from 'lucide-react';
import { Clock } from 'lucide-react';

export default function OrdersTable({ orders, isChief, managers, onAction, isHistory }) {
  const [selectedManager, setSelectedManager] = useState({}); // orderId -> managerId

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden w-full flex-grow flex flex-col">
      <div className="overflow-auto h-full flex-grow">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-32">Ticket ID</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-40">Ամսաթիվ</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Պատվեր (Նյութեր)</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Նախաձեռնող</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Մենեջեր (Մատակարարող)</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-center w-36">Կարգավիճակ</th>
              {!isHistory && (
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right w-48">Գործողություն</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {orders.map((order) => {
              const { status } = order;

              // Derive badge class based on status
              const badgeClass = 
                status === 'Սպասում է' ? 'bg-amber-100 text-amber-800' :
                status === 'Նոր/Բաց' ? 'bg-blue-100 text-blue-800' :
                status === 'Մասնակի' ? 'bg-purple-100 text-purple-800' :
                status === 'Կատարված' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'; // Մերժված

              const mgr = managers.find(m => m.id === order.managerId);

              return (
                <tr key={order.id} className="bg-white hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono text-sm text-slate-600 font-semibold">{order.id}</td>
                  <td className="p-4 text-sm text-slate-600">{new Date(order.date).toLocaleString('hy-AM', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="text-sm font-medium text-slate-800 bg-slate-100 px-2 py-1 rounded inline-flex border border-slate-200 w-max">
                          {it.name}: <span className="ml-2 font-bold">{it.requestedQty} {it.unit}</span>
                          {status !== 'Սպասում է' && status !== 'Նոր/Բաց' && (
                            <span className="ml-2 pl-2 border-l border-slate-300 text-slate-500 font-normal">Ստացված՝ <b className="text-blue-700">{it.receivedQty}</b></span>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{order.initiator}</td>
                  <td className="p-4 text-sm font-medium text-slate-800">
                    {mgr ? (
                      <span className="flex items-center gap-1.5"><Mail size={14} className="text-slate-400" /> {mgr.firstName} {mgr.lastName}</span>
                    ) : (
                      <span className="text-slate-400 italic">--</span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold w-max ${badgeClass}`}>
                      {status}
                    </span>
                    {order.rejectReason && <div className="text-[10px] text-red-600 mt-1 max-w-[120px] truncate" title={order.rejectReason}>Խախտում: {order.rejectReason}</div>}
                  </td>
                  
                  {!isHistory && (
                    <td className="p-4 text-right align-middle">
                      {/* Workflow Actions */}
                      
                      {/* Chief Approval for Pending Requests */}
                      {isChief && status === 'Սպասում է' && (
                        <div className="flex flex-col gap-2 items-end">
                          <select 
                            className="text-xs border border-blue-200 bg-blue-50 text-blue-800 px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 w-36"
                            value={selectedManager[order.id] || ''}
                            onChange={(e) => setSelectedManager({ ...selectedManager, [order.id]: e.target.value })}
                          >
                            <option value="" disabled>Ընտրել Մենեջեր...</option>
                            {managers.filter(m => m.status === 'Ակտիվ').map(m => (
                              <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                            ))}
                          </select>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                const reason = prompt("Նշել մերժման պատճառը:");
                                if (reason) onAction(order.id, 'reject', { rejectReason: reason });
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-100 rounded border border-transparent hover:border-red-200" title="Մերժել"
                            >
                              <X size={16} />
                            </button>
                            <button 
                              onClick={() => {
                                const mId = selectedManager[order.id];
                                if (!mId) return alert('Ընտրեք մենեջերին վերևի մենյուից նախքան հաստատելը։');
                                onAction(order.id, 'approve', { managerId: mId });
                                alert(`Հաստատված է: Համակարգային Email-ը հաջողությամբ ուղարկվել է մենեջերին:`);
                              }}
                              className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 shadow-sm" title="Հաստատել և Ուղարկել"
                            >
                              <Check size={16} />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Sub-Warehouse Keeper manual conclusion */}
                      {!isChief && (status === 'Նոր/Բաց' || status === 'Մասնակի') && (
                        <button 
                          onClick={() => {
                            if (window.confirm('Համոզվա՞ծ եք, որ ցանկանում եք ավարտել այս հարցումը։ Քանակները անցնելու են պատմություն։')) {
                              onAction(order.id, 'complete', { adjustedItems: order.items });
                            }
                          }}
                          className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-lg shadow-sm w-max ml-auto"
                        >
                          <Check size={14} /> Ավարտել / Ընդունել լրիվ
                        </button>
                      )}

                      {/* Active but No UI Action required for this role */}
                      {((isChief && (status === 'Նոր/Բաց' || status === 'Մասնակի')) || (!isChief && status === 'Սպասում է')) && (
                        <span className="text-[11px] font-semibold text-slate-400 flex justify-end gap-1 items-center">
                          <Clock size={12} /> Սպասում է գործընկերոջը
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="p-8 text-center text-slate-500 font-medium flex flex-col items-center gap-2">
             <ClipboardList size={32} className="text-slate-300" />
             Դատարկ է:
          </div>
        )}
      </div>
    </div>
  );
}
