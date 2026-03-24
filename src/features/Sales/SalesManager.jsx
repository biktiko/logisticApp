import React, { useState } from 'react';
import { 
  Globe, Plus, Search, CheckCircle, PackageSearch, PackageOpen, XCircle, 
  Send, Calendar, Clock, RotateCcw, Building, FileText, CheckSquare, Bell, X
} from 'lucide-react';
import { PRODUCTION_PRODUCTS } from '../../data/mockData';

// Mocks
const MOCK_BROKERS = [
  { id: 'B1', name: 'Բրոկեր Տիգրան', email: 'armen.broker@test.com' },
  { id: 'B2', name: 'Բրոկեր Արմեն', email: 'global@broker.com' },
];

const MOCK_PARTNERS = [
  { id: 'P1', name: 'Ալֆա Թրեյդ (ՌԴ)', country: 'Ռուսաստան', manager: 'Արտահանման վաճառքի մենեջեր', status: 'Ակտիվ' },
  { id: 'P2', name: 'EuroSnacks', country: 'Գերմանիա', manager: 'Արտահանման վաճառքի մենեջեր', status: 'Ակտիվ' },
  { id: 'P3', name: 'Local Dist', country: 'ՀՀ', manager: 'Այլ Մենեջեր', status: 'Ակտիվ' },
];

const INITIAL_ORDERS = [
  {
    id: 'EXP-2026-001',
    date: new Date().toISOString(),
    partner: MOCK_PARTNERS[0],
    comment: 'Շտապ առաքում Մոսկվա',
    hasSticker: true,
    hasHonestSign: true,
    brokers: [MOCK_BROKERS[0]],
    isPaid: false,
    status: 'Ակտիվացված', // Նոր, Ակտիվացված, Համալրված, Ուղարկված, Կատարված, Չեղարկված
    items: [
      { id: 'I1', product: 'Արևածաղիկ 100գ դասական', category: 'Չիպսեր և հացահատիկներ', required: 5000, unit: 'տուփ', fulfilled: 0, estDate: '', note: '', status: 'Սպասում է', assignee: 'Տեսակի պատասխանատու' },
      { id: 'I2', product: 'Պանրով Չիպս 50գ', category: 'Չիպսեր և հացահատիկներ', required: 2000, unit: 'տուփ', fulfilled: 2000, estDate: '2026-03-25', note: 'Արդեն պահեստում է', status: 'Պատրաստ է', assignee: 'Տեսակի պատասխանատու' }
    ],
    logs: [
      { date: new Date().toISOString(), user: 'Արտահանման վաճառքի մենեջեր', action: 'Պատվերը ստեղծված է (Նոր)' },
      { date: new Date().toISOString(), user: 'Արտահանման վաճառքի մենեջեր', action: 'Պատվերը Ակտիվացված է: Ծանուցումներ ուղարկվել են:' },
    ]
  }
];

export default function SalesManager({ activeRole }) {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [activeOrderId, setActiveOrderId] = useState(INITIAL_ORDERS[0].id);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isSalesMgr = activeRole === 'Արտահանման վաճառքի մենեջեր';
  const isTypeResp = activeRole === 'Տեսակի պատասխանատու' || activeRole === 'Պատրաստի արտադրանքի պատասխանատու';
  // Chief/Admin sees all
  const isChief = ['Սուպերադմին', 'Գլխավոր պահեստապետ'].includes(activeRole);

  const activeOrder = orders.find(o => o.id === activeOrderId);

  // Handlers
  const addLog = (orderId, action) => {
    setOrders(prev => prev.map(o => o.id === orderId ? {
      ...o,
      logs: [{ date: new Date().toISOString(), user: activeRole, action }, ...o.logs]
    } : o));
  };

  const handleActivate = (id) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Ակտիվացված' } : o));
    addLog(id, 'Պատվերը դարձավ ԱԿՏԻՎ: Ավտոմատ ծանուցումներ են գնացել բրոկերներին և պահեստներին:');
    alert('Պատվերն ակտիվացված է: Email-ներն ուղարկված են բրոկերներին և համապատասխան պատասխանատուներին:');
  };

  const handlePayment = (id, currentVal) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, isPaid: !currentVal } : o));
    if (!currentVal) {
      addLog(id, 'Վճարումը հաստատվել է: Ծանուցում ուղարկվել է բրոկերներին:');
      alert('Բրոկերները ստացան Email վճարման հաստատման մասին:');
    }
  };

  const handleCancel = (id) => {
    if(!window.confirm("Համոզվա՞ծ եք որ ուզում եք չեղարկել:")) return;
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Չեղարկված' } : o));
    addLog(id, 'Պատվերը ՉԵՂԱՐԿՎԵԼ Է մենեջերի կողմից: Բոլորին ուղարկվել է ծանուցում:');
  };

  const handleDispatch = (id) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'Ուղարկված' } : o));
    addLog(id, 'Ապրանքները բեռնվել և ՈՒՂԱՐԿՎԵԼ ԵՆ:');
  };

  const checkFulfillment = (orderId) => {
    setTimeout(() => {
      setOrders(currentOrders => {
         const order = currentOrders.find(o => o.id === orderId);
         if (!order) return currentOrders;
         const allReady = order.items.every(i => i.status === 'Պատրաստ է');
         if (allReady && order.status === 'Ակտիվացված') {
            const updated = currentOrders.map(o => o.id === orderId ? { ...o, status: 'Համալրված' } : o);
            // Simulate log via direct object mutation (normally bad practice, using setTimeout trick for demo)
            const o = updated.find(x => x.id === orderId);
            o.logs = [{ date: new Date().toISOString(), user: 'Համակարգ', action: 'Բոլոր ապրանքները համալրված են (Ավտոմատ):' }, ...o.logs];
            return updated;
         }
         return currentOrders;
      });
    }, 100);
  };

  const updateItemDetails = (orderId, itemId, payload) => {
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      return {
        ...o,
        items: o.items.map(i => i.id === itemId ? { ...i, ...payload } : i)
      };
    }));
    checkFulfillment(orderId);
  };

  // UI Components inside
  const renderItemAction = (item) => {
    // Only allow Type Resp to act
    const isMyTask = isTypeResp; // Demo simple condition

    if (!isMyTask || activeOrder.status === 'Նոր') return null;

    if (activeOrder.status === 'Չեղարկված' && item.status === 'Պատրաստ է') {
      return (
        <button 
          onClick={() => {
            updateItemDetails(activeOrder.id, item.id, { status: 'Հետ է ուղարկված', fulfilled: 0 });
            addLog(activeOrder.id, `${item.product} ապրանքը հետ ուղարկվեց պահեստ չեղարկման պատճառով:`);
          }}
          className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded font-bold hover:bg-red-200"
        >
          Հետ Уղարկել Պահեստ
        </button>
      )
    }

    if (item.status === 'Պատրաստ է') return <span className="text-xs text-green-600 font-bold flex items-center gap-1"><CheckCircle size={14}/> Համալրված</span>;
    if (activeOrder.status === 'Չեղարկված') return null;

    return (
      <div className="flex flex-col gap-2 w-max">
        <input 
           type="date" 
           value={item.estDate}
           onChange={(e) => {
             updateItemDetails(activeOrder.id, item.id, { estDate: e.target.value });
             addLog(activeOrder.id, `${item.product}: Կանխատեսվող ժամկետը փոխվեց -> ${e.target.value}`);
           }}
           className="text-xs border border-slate-200 rounded px-2 py-1 bg-white outline-none focus:border-indigo-500"
        />
        <button 
          onClick={() => {
             updateItemDetails(activeOrder.id, item.id, { status: 'Պատրաստ է', fulfilled: item.required });
             addLog(activeOrder.id, `${item.product}: Նշվեց որպես ՊԱՏՐԱՍՏ (Ամբողջ քանակը):`);
          }}
          className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2 py-1 rounded hover:bg-indigo-100 flex items-center justify-center gap-1 border border-indigo-200"
        >
          <PackageOpen size={14}/> Նշել Պատրաստ
        </button>
      </div>
    );
  };

  // Filtering Left List
  const filteredOrders = orders.filter(o => {
    if (!o.id.toLowerCase().includes(search.toLowerCase()) && !o.partner.name.toLowerCase().includes(search.toLowerCase())) return false;
    // Sales can see their own, Chiefs see all, Types see active ones that involve them (simplified)
    if (isSalesMgr && o.partner.manager !== activeRole) return false;
    if (isTypeResp && o.status === 'Նոր') return false; 
    return true;
  });

  return (
    <div className="flex bg-[#f8fafc] h-full overflow-hidden w-full">
       {/* LEFT: Orders List */}
       <div className="w-80 min-w-[320px] bg-white border-r border-slate-200 flex flex-col z-10 shadow-sm">
          <div className="p-6 border-b border-slate-100">
             <div className="flex items-center gap-3 text-indigo-700 mb-4">
               <Globe size={24} />
               <h1 className="text-xl font-black tracking-tight">Արտահանում</h1>
             </div>
             
             {isSalesMgr && (
               <button 
                 onClick={() => setIsModalOpen(true)}
                 className="w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-2.5 rounded-xl shadow-md transition-all mb-4">
                 <Plus size={16} /> Նոր Արտահանում
               </button>
             )}

             <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Փնտրել ID կամ Գործընկեր"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
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
                   className={`text-left p-4 rounded-xl transition-all border
                     ${isActive ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'}
                   `}
                 >
                   <div className="flex items-center justify-between mb-1">
                     <span className={`font-mono text-sm font-bold ${isActive ? 'text-indigo-700' : 'text-slate-600'}`}>{o.id}</span>
                     <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full
                       ${o.status === 'Նոր' ? 'bg-slate-200 text-slate-700' :
                         o.status === 'Ակտիվացված' ? 'bg-blue-100 text-blue-700' : 
                         o.status === 'Համալրված' ? 'bg-green-100 text-green-700' :
                         o.status === 'Չեղարկված' ? 'bg-red-100 text-red-700' :
                         'bg-indigo-100 text-indigo-700'}
                     `}>
                       {o.status}
                     </span>
                   </div>
                   <div className="font-bold text-slate-800 text-sm line-clamp-1">{o.partner.name}</div>
                   <div className="flex items-center gap-1 mt-1 text-slate-400 text-xs font-semibold">
                     <Calendar size={12}/> {new Date(o.date).toLocaleDateString()}
                   </div>
                 </button>
               )
             })}
          </div>
       </div>

       {/* RIGHT: Active Order Detail */}
       <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden relative">
          {activeOrder ? (
            <div className="flex-1 overflow-y-auto">
               
               {/* Detail Header */}
               <div className="bg-white px-10 py-8 border-b border-slate-200 shadow-sm sticky top-0 z-20">
                  <div className="flex justify-between items-start mb-6">
                     <div>
                       <div className="flex items-center gap-3 mb-2">
                         <span className="bg-slate-100 text-slate-600 font-mono font-bold px-3 py-1 rounded-lg border border-slate-200">{activeOrder.id}</span>
                         <span className={`px-3 py-1 rounded-lg text-sm font-black uppercase tracking-widest border
                           ${activeOrder.status === 'Նոր' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                             activeOrder.status === 'Ակտիվացված' ? 'bg-blue-50 text-blue-600 border-blue-200' : 
                             activeOrder.status === 'Համալրված' ? 'bg-green-50 text-green-600 border-green-200' :
                             activeOrder.status === 'Չեղարկված' ? 'bg-red-50 text-red-600 border-red-200' :
                             'bg-indigo-50 text-indigo-600 border-indigo-200'}
                         `}>
                           {activeOrder.status}
                         </span>
                       </div>
                       <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                         <Building className="text-slate-400" /> {activeOrder.partner.name} <span className="text-base text-slate-400 font-bold ml-2">({activeOrder.partner.country})</span>
                       </h2>
                     </div>

                     <div className="flex gap-2">
                        {/* Actions for Sales Manager */}
                        {isSalesMgr && (
                          <>
                            {activeOrder.status === 'Նոր' && (
                              <button onClick={() => handleActivate(activeOrder.id)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-all">
                                <Send size={16}/> Ակտիվացնել (Ուղարկել պահանջ)
                              </button>
                            )}
                            {activeOrder.status === 'Համալրված' && (
                              <button onClick={() => handleDispatch(activeOrder.id)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-all">
                                <Truck size={16}/> Հաստատել Բեռնում (Ուղարկված)
                              </button>
                            )}
                            {activeOrder.status !== 'Չեղարկված' && activeOrder.status !== 'Կատարված' && (
                              <button onClick={() => handleCancel(activeOrder.id)} className="flex items-center gap-2 border-2 border-red-200 text-red-600 bg-white hover:bg-red-50 text-sm px-4 py-2.5 rounded-xl font-bold transition-all">
                                <XCircle size={16}/> Չեղարկել
                              </button>
                            )}
                          </>
                        )}
                     </div>
                  </div>

                  {/* Order Meta Infos */}
                  <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
                     <div className="flex flex-col gap-1 w-48">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Սթիքեր</span>
                        <div className="font-semibold text-sm flex items-center gap-2">
                          {activeOrder.hasSticker ? <CheckSquare size={16} className="text-green-600"/> : <div className="w-4 h-4 border border-slate-300 rounded"/>}
                          Պահանջվում է
                        </div>
                     </div>
                     <div className="flex flex-col gap-1 w-48">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Չեսնի Զնակ (QR)</span>
                        <div className="font-semibold text-sm flex items-center gap-2">
                          {activeOrder.hasHonestSign ? <CheckSquare size={16} className="text-green-600"/> : <div className="w-4 h-4 border border-slate-300 rounded"/>}
                          Պահանջվում է
                        </div>
                     </div>
                     <div className="flex flex-col gap-1 flex-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Բրոկերներ (Որոնք ստանում են Email)</span>
                        <div className="font-semibold text-sm text-slate-700 flex flex-wrap gap-2">
                          {activeOrder.brokers.map(b => (
                            <span key={b.id} className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-xs">{b.name}</span>
                          ))}
                        </div>
                     </div>
                     {isSalesMgr && activeOrder.status !== 'Չեղարկված' && (
                       <label className="flex flex-col w-56 ml-auto cursor-pointer p-2 rounded-lg border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-colors justify-center items-center">
                          <div className="flex items-center gap-2">
                             <input type="checkbox" checked={activeOrder.isPaid} onChange={() => handlePayment(activeOrder.id, activeOrder.isPaid)} className="w-4 h-4 text-green-600" />
                             <span className="text-sm font-extrabold text-green-700 uppercase tracking-widest">Վճարումը Ստացված</span>
                          </div>
                       </label>
                     )}
                  </div>
                  {activeOrder.comment && (
                     <div className="mt-4 bg-amber-50 border border-amber-200 p-3 rounded-lg text-sm text-amber-800">
                       <b>Նշում:</b> {activeOrder.comment}
                     </div>
                  )}
               </div>

               {/* Products Grid */}
               <div className="px-10 py-6">
                  <h3 className="text-base font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <PackageSearch size={18} className="text-indigo-500"/> Պատվերի Կազմ (Ապրանքներ)
                  </h3>
                  
                  <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                     <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Ապրանք</th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-32 border-l border-slate-100">Պահանջ. Քանակ</th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-48 border-l border-slate-100">Պատասխանատուներ</th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-36 border-l border-slate-100">Համալրված</th>
                            <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-40 text-right bg-indigo-50/50">Գործողություն</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {activeOrder.items.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50/50">
                               <td className="p-4 align-top">
                                 <div className="font-bold text-sm text-slate-800">{item.product}</div>
                                 <div className="text-xs font-medium text-slate-400">{item.category}</div>
                               </td>
                               <td className="p-4 align-top border-l border-slate-100 font-mono text-base font-bold text-slate-700">
                                 {item.required} <span className="text-xs text-slate-400">{item.unit}</span>
                               </td>
                               <td className="p-4 align-top border-l border-slate-100">
                                 <div className="text-xs font-bold text-slate-600 mb-1">{item.assignee}</div>
                                 {item.estDate ? (
                                   <div className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded w-max border border-indigo-100 flex items-center gap-1">
                                      <Calendar size={12}/> K.Ժ: {new Date(item.estDate).toLocaleDateString()}
                                   </div>
                                 ) : (
                                   <div className="text-[11px] font-bold text-slate-400 uppercase">Ժամկետ նշված չէ</div>
                                 )}
                               </td>
                               <td className="p-4 align-top border-l border-slate-100">
                                 <div className={`text-base font-bold font-mono ${item.fulfilled === item.required ? 'text-green-600' : 'text-slate-500'}`}>
                                   {item.fulfilled}
                                 </div>
                                 <div className="mt-1">
                                   <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full
                                      ${item.status === 'Պատրաստ է' ? 'bg-green-100 text-green-700' :
                                        item.status === 'Հետ է ուղարկված' ? 'bg-red-100 text-red-700' :
                                       'bg-amber-100 text-amber-700'}
                                   `}>
                                     {item.status}
                                   </span>
                                 </div>
                               </td>
                               <td className="p-4 align-top text-right bg-indigo-50/20">
                                 {renderItemAction(item)}
                               </td>
                            </tr>
                          ))}
                        </tbody>
                     </table>
                  </div>
               </div>

               {/* Log History */}
               <div className="px-10 pb-10">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Clock size={16} /> Պատմություն (History Log)
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
                              <time className="text-xs font-mono">{new Date(log.date).toLocaleString()}</time>
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
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
               <Globe size={48} className="mb-4 opacity-20" />
               <p className="font-medium">Ընտրեք պատվեր ձախ ցանկից</p>
            </div>
          )}
       </div>

        {isModalOpen && (
          <NewExportModal 
            activeRole={activeRole} 
            onClose={() => setIsModalOpen(false)}
            onSave={(newOrder) => {
              setOrders([newOrder, ...orders]);
              setActiveOrderId(newOrder.id);
              setIsModalOpen(false);
            }} 
          />
        )}
    </div>
  );
}

function NewExportModal({ activeRole, onClose, onSave }) {
  const [partner, setPartner] = React.useState('');
  const [hasSticker, setHasSticker] = React.useState(false);
  const [hasHonestSign, setHasHonestSign] = React.useState(false);
  const [comment, setComment] = React.useState('');
  const [selectedBrokers, setSelectedBrokers] = React.useState([]);
  const [items, setItems] = React.useState([]);

  // Filter partners assigned to this manager
  const myPartners = MOCK_PARTNERS.filter(p => p.manager === activeRole);

  const toggleBroker = (id) => {
    setSelectedBrokers(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const addItem = () => {
    setItems([...items, { prodId: '', required: 1 }]);
  };

  const updateItem = (index, field, val) => {
    const updated = [...items];
    updated[index][field] = val;
    setItems(updated);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if(!partner) return alert('Ընտրեք գործընկերոջը');
    if(items.length === 0 || items.some(i => !i.prodId || i.required <= 0)) return alert('Ավելացրեք վավեր ապրանքներ');

    const selectedPartner = MOCK_PARTNERS.find(p => p.id === partner);
    const selectedBrokerObjs = MOCK_BROKERS.filter(b => selectedBrokers.includes(b.id));

    const mappedItems = items.map((i, idx) => {
      const prodObj = PRODUCTION_PRODUCTS.find(p => p.id === i.prodId);
      return {
        id: `N-${Date.now()}-${idx}`,
        product: prodObj.name,
        category: prodObj.category,
        required: Number(i.required),
        unit: 'տուփ', // default for export
        fulfilled: 0,
        estDate: '',
        note: '',
        status: 'Սպասում է',
        assignee: 'Տեսակի պատասխանատու' // Logic to find responsible based on category
      }
    });

    const newOrder = {
      id: `EXP-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      date: new Date().toISOString(),
      partner: selectedPartner,
      comment,
      hasSticker,
      hasHonestSign,
      brokers: selectedBrokerObjs,
      isPaid: false,
      status: 'Նոր',
      items: mappedItems,
      logs: [
        { date: new Date().toISOString(), user: activeRole, action: 'Պատվերը ստեղծված է (Նոր)' }
      ]
    };

    onSave(newOrder);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Globe className="text-indigo-600" /> Նոր Արտահանման Պատվեր
            </h2>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Ստեղծել նոր Export Order</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh] flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Գործընկեր <span className="text-red-500">*</span></label>
                 <select value={partner} onChange={e => setPartner(e.target.value)} className="w-full border border-slate-200 rounded-xl p-3 bg-slate-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500">
                   <option value="">Ընտրեք Գործընկեր</option>
                   {myPartners.map(p => (
                     <option key={p.id} value={p.id}>{p.name} ({p.country})</option>
                   ))}
                 </select>
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Բրոկերներ</label>
                 <div className="flex flex-col gap-2">
                   {MOCK_BROKERS.map(b => (
                     <label key={b.id} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100">
                       <input type="checkbox" checked={selectedBrokers.includes(b.id)} onChange={() => toggleBroker(b.id)} className="w-4 h-4 text-indigo-600 rounded" />
                       <span className="text-sm font-bold text-slate-700">{b.name}</span>
                     </label>
                   ))}
                 </div>
               </div>

               <div className="flex flex-col gap-3 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={hasSticker} onChange={e => setHasSticker(e.target.checked)} className="w-5 h-5 text-indigo-600 rounded" />
                    <span className="text-sm font-black text-slate-700">Պահանջվում է Սթիքեր</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={hasHonestSign} onChange={e => setHasHonestSign(e.target.checked)} className="w-5 h-5 text-indigo-600 rounded" />
                    <span className="text-sm font-black text-slate-700">Պահանջվում է «Честный Знак» (QR)</span>
                  </label>
               </div>
            </div>

            <div className="space-y-4 flex flex-col">
                <div className="flex-1">
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Լրացուցիչ Նշումներ</label>
                 <textarea 
                   placeholder="Պատվերի վերաբերյալ մանրամասներ..."
                   value={comment}
                   onChange={e => setComment(e.target.value)}
                   className="w-full h-[85%] border border-slate-200 rounded-xl p-3 bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 resiae-none"
                 />
                </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6 mt-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Ապրանքների Ցանկ <span className="text-red-500">*</span></h3>
              <button onClick={addItem} className="flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100 transition-colors">
                <Plus size={14}/> Ավելացնել
              </button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-6 text-sm font-medium text-slate-400 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                Ապրանքներ դեռ ավելացված չեն
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((it, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-sm">
                    <div className="flex-1">
                      <select value={it.prodId} onChange={e => updateItem(idx, 'prodId', e.target.value)} className="w-full outline-none text-sm font-bold text-slate-700">
                        <option value="">-- Ընտրել Ապրանք --</option>
                        {PRODUCTION_PRODUCTS.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-px h-6 bg-slate-200"></div>
                    <div className="w-32 flex items-center gap-2">
                      <input type="number" value={it.required} onChange={e => updateItem(idx, 'required', e.target.value)} className="w-full outline-none text-right font-mono font-bold text-indigo-700 bg-slate-50 px-2 py-1 rounded" min="1"/>
                      <span className="text-xs font-bold text-slate-400">տուփ</span>
                    </div>
                    <button onClick={() => removeItem(idx)} className="text-slate-300 hover:text-red-500 p-1">
                      <XCircle size={18}/>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-200 transition-colors">
            Չեղարկել
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 transition-all">
            <CheckCircle size={16}/> Ստեղծել Պատվեր
          </button>
        </div>

      </div>
    </div>
  )
}
