import React from 'react';
import { Check, X, Clock, Navigation } from 'lucide-react';

export default function MovementsTable({ tickets, activeWarehouse, onAction, isArchiveMode }) {
  
  // We filter tickets slightly: maybe show all related to this warehouse? 
  // But let's just show all for the demo, or filter by destination/source
  const relevantTickets = tickets.filter(t => 
    t.destination === activeWarehouse || t.source === activeWarehouse
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden m-6 flex-grow flex flex-col">
      <div className="overflow-auto h-full flex-grow">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-32">Ticket ID</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-40">Ամսաթիվ</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Ուղարկող</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Ստացող</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Ապրանք ու Քանակ</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-center w-36">Կարգավիճակ</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right w-36">Գործողություն</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {relevantTickets.map((ticket) => {
              const isReceiver = ticket.destination === activeWarehouse;
              const status = ticket.status; // 'pending', 'approved', 'rejected'

              let StatusBadge;
              if (status === 'pending') {
                StatusBadge = <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800"><Clock size={12}/> Սպասում է</span>;
              } else if (status === 'approved') {
                StatusBadge = <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><Check size={12}/> Հաստատված</span>;
              } else {
                StatusBadge = <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><X size={12}/> Մերժված</span>;
              }

              return (
                <tr key={ticket.id} className="bg-white hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono text-sm text-slate-600">{ticket.id}</td>
                  <td className="p-4 text-sm text-slate-600">{new Date(ticket.date).toLocaleString('hy-AM')}</td>
                  <td className="p-4 text-sm font-medium text-slate-800">{ticket.source}</td>
                  <td className="p-4 text-sm font-medium text-slate-800 flex items-center gap-2">
                    <Navigation size={14} className="text-slate-400 rotate-90" />
                    {ticket.destination}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-800">{ticket.item.name}</div>
                    <div className="text-sm text-slate-600 font-semibold">{ticket.quantity} {ticket.item.unit}</div>
                    {ticket.purpose && <div className="text-xs text-red-600 mt-1">Նպատակ: {ticket.purpose}</div>}
                    {ticket.rejectReason && <div className="text-xs text-red-600 mt-1 line-clamp-2" title={ticket.rejectReason}>Պատճառ: {ticket.rejectReason}</div>}
                  </td>
                  <td className="p-4 text-center">{StatusBadge}</td>
                  <td className="p-4 text-right align-middle">
                    {/* Receiver can approve or reject if pending. Archive mode disables it. */}
                    {status === 'pending' && isReceiver && !isArchiveMode ? (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => onAction(ticket.id, 'reject')}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-colors"
                          title="Մերժել"
                        >
                          <X size={18} />
                        </button>
                        <button 
                          onClick={() => onAction(ticket.id, 'approve')}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded border border-transparent hover:border-green-200 transition-colors"
                          title="Ստանալ"
                        >
                          <Check size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400">Անհասանելի</div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {relevantTickets.length === 0 && (
          <div className="p-8 text-center text-slate-500 font-medium bg-slate-50/50">
            Այս պահեստի հետ կապված տեղափոխություններ չկան:
          </div>
        )}
      </div>
    </div>
  );
}
