import React from 'react';
import { 
  Bell, 
  Info, 
  AlertCircle, 
  CheckCircle2, 
  Link as LinkIcon,
  Trash2,
  Check
} from 'lucide-react';

export default function NotificationsManager({ notifications, setNotifications, onDeepLink, triggerDemo }) {
  
  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleDemoTrigger = () => {
    triggerDemo({
      type: 'action',
      text: 'Արտադրամասի պետը ուղարկել է նոր հարցում հումքի տեղափոխման վերաբերյալ (TR-8005):',
      author: 'Համակարգ',
      target: 'production',
      linkId: 'TR-8005'
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between bg-white border-b border-slate-200 px-8 py-5 flex-shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl relative">
             <Bell size={28} />
             {notifications.filter(n => !n.read).length > 0 && (
               <span className="absolute -top-1 -right-1 flex h-4 w-4">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
               </span>
             )}
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">
            Ծանուցումների Կենտրոն
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
           <button 
             onClick={handleDemoTrigger}
             className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors text-sm border border-slate-200"
           >
             Սիմուլացնել նոր ծանուցում (Demo)
           </button>
           <button 
             onClick={markAllRead}
             className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold rounded-xl transition-colors text-sm flex items-center gap-2"
           >
             <Check size={16} /> Նշել բոլորը ընթերցված
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto space-y-4">
           {notifications.length === 0 ? (
             <div className="text-center p-12 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
                Նոր ծանուցումներ չկան:
             </div>
           ) : (
             notifications.map(notif => (
               <div 
                 key={notif.id} 
                 className={`flex items-start gap-4 p-5 rounded-2xl border transition-all ${notif.read ? 'bg-white border-slate-200/60 opacity-70' : 'bg-white border-blue-200 shadow-md shadow-blue-100/50 relative overflow-hidden'}`}
               >
                 {/* Unread indicator bar */}
                 {!notif.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
                 
                 <div className="mt-1">
                   {notif.type === 'action' ? (
                     <AlertCircle className={notif.read ? "text-slate-400" : "text-amber-500"} size={24} />
                   ) : (
                     <Info className={notif.read ? "text-slate-400" : "text-blue-500"} size={24} />
                   )}
                 </div>

                 <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                       <span className={`text-[10px] font-bold uppercase tracking-widest ${notif.read ? 'text-slate-400' : 'text-blue-600'}`}>
                         {notif.author}
                       </span>
                    </div>
                    
                    <p className={`text-sm mb-4 ${notif.read ? 'text-slate-600 font-medium' : 'text-slate-800 font-bold'}`}>
                      {notif.text}
                    </p>

                    <div className="flex items-center gap-3">
                       {notif.target && (
                         <button 
                           onClick={() => {
                             markAsRead(notif.id);
                             onDeepLink(notif.target, notif.linkId);
                           }}
                           className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm
                             ${notif.read 
                               ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' 
                               : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'}`}
                         >
                           <LinkIcon size={14} /> Անցնել
                         </button>
                       )}

                       {!notif.read && (
                         <button 
                           onClick={() => markAsRead(notif.id)}
                           className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors bg-green-50 text-green-700 hover:bg-green-100"
                         >
                           <CheckCircle2 size={14} /> Տեղեկացված եմ
                         </button>
                       )}
                    </div>
                 </div>

                 <button 
                   onClick={() => deleteNotification(notif.id)}
                   className="text-slate-300 hover:text-red-500 transition-colors p-2"
                 >
                   <Trash2 size={18} />
                 </button>
               </div>
             ))
           )}
        </div>
      </div>
    </div>
  );
}
