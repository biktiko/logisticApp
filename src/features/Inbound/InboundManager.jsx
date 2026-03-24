import React, { useState } from 'react';
import { PackagePlus } from 'lucide-react';
import NewInboundTab from './components/NewInboundTab.jsx';
import InboundsTable from './components/InboundsTable.jsx';
import { INITIAL_SOURCING_ORDERS, MOCK_SALES_MANAGERS } from '../../data/mockData';

// Initial Mock Approvals State
const INITIAL_INBOUNDS = [
  {
    id: 'INB-8001',
    date: new Date().toISOString(),
    initiator: 'Պատրաստի արտադրանքի պատ.',
    items: [
      { name: 'Արևածաղիկ', qty: 500, unit: 'կգ', targetWarehouse: 'Գլխավոր հումքի պահեստ' }
    ],
    supplier: 'Ագրո ՍՊԸ',
    linkedTicket: 'REQ-2001',
    status: 'Հաստատման ենթակա',
    log: []
  }
];

export default function InboundManager({ activeRole }) {
  const [inbounds, setInbounds] = useState(INITIAL_INBOUNDS);
  
  // Roles handling
  // "Գլխավոր պահեստապետ" -> sees global warehouse approvals
  // "Տեսակի պատասխանատու" -> sees type warehouse approvals, can auto-approve own
  const canApproveGlobal = ['Սուպերադմին', 'Գլխավոր պահեստապետ'].includes(activeRole);
  const isTypeResp = activeRole === 'Տեսակի պատասխանատու';
  const canInitiate = !['Գլխավոր պահեստապետ'].includes(activeRole); // Usually sub-warehouse keepers initiate

  const [activeTab, setActiveTab] = useState('Նոր Մուտք');
  // Tabs: 'Նոր Մուտք', 'Հաստատումներ', 'Մուտքերի Պատմություն'

  const activeApprovals = inbounds.filter(i => i.status === 'Հաստատման ենթակա');
  const inboundHistory = inbounds.filter(i => i.status === 'Հաստատված' || i.status === 'Մերժված');

  const handleAction = (id, actionStr, payload) => {
    setInbounds(prev => prev.map(i => {
      if (i.id === id) {
        const logEntry = {
          date: new Date().toISOString(),
          actor: activeRole,
          action: actionStr,
          comment: payload?.reason || ''
        };
        const newStatus = actionStr === 'approve' ? 'Հաստատված' : 'Մերժված';
        return { ...i, status: newStatus, log: [...i.log, logEntry] };
      }
      return i;
    }));
  };

  const handleSubmitInbound = (formData) => {
    // Determine auto-approval
    // If Type Responsible creates and it doesn't go to Global Warehouse exclusively, auto approve
    // Simplified logic: Type Resp auto-approves unless Target is solely Global Warehouse 
    // Wait, requirement 7.1.5: If inbound to Global and no access -> 'Հաստատման ենթակա'
    
    let isAutoApprove = false;
    if (isTypeResp) {
      const allGlobal = formData.items.every(it => it.targetWarehouse === 'Գլխավոր հումքի պահեստ');
      isAutoApprove = !allGlobal;
    }

    const newEntry = {
      id: `INB-${Math.floor(Math.random() * 9000) + 1000}`,
      date: new Date().toISOString(),
      initiator: activeRole,
      items: formData.items,
      supplier: formData.supplier,
      linkedTicket: formData.linkedTicket,
      status: isAutoApprove ? 'Հաստատված' : 'Հաստատման ենթակա',
      log: [{
        date: new Date().toISOString(),
        actor: activeRole,
        action: 'create',
        comment: formData.comment
      }]
    };

    setInbounds([newEntry, ...inbounds]);
    
    alert(isAutoApprove 
      ? 'Մուտքագրումը ավտոմատ հաստատվել է (Ինքնահաստատման իրավունքով): Մնացորդներն ավելացվեցին:' 
      : 'Մուտքագրման հարցումն ուղարկված է հաստատման:');
    
    setActiveTab('Մուտքերի Պատմություն');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      <div className="flex items-center justify-between bg-white border-b border-slate-200 px-8 py-4 z-10 shadow-sm gap-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <PackagePlus className="text-blue-600" size={24} />
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            Հումքի և Պրոդուկտի Մուտքագրում
          </h1>
        </div>

      </div>

      <div className="px-8 pt-4 pb-0 bg-white border-b border-slate-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02)] z-30 flex gap-4 overflow-x-auto flex-shrink-0">
        {canInitiate && (
          <button 
            className={`pb-3 px-2 border-b-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'Նոր Մուտք' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            onClick={() => setActiveTab('Նոր Մուտք')}
          >
            Նոր Մուտք
          </button>
        )}
        <button 
          className={`pb-3 px-2 border-b-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'Հաստատումներ' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          onClick={() => setActiveTab('Հաստատումներ')}
        >
          Հաստատումներ {activeApprovals.length > 0 && <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-xs ml-1 font-bold">{activeApprovals.length}</span>}
        </button>
        <button 
          className={`pb-3 px-2 border-b-2 font-medium transition-colors whitespace-nowrap ${activeTab === 'Մուտքերի Պատմություն' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
          onClick={() => setActiveTab('Մուտքերի Պատմություն')}
        >
          Մուտքերի Պատմություն
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6 relative">
        {activeTab === 'Նոր Մուտք' && canInitiate && (
          <NewInboundTab 
            onSubmit={handleSubmitInbound}
            sourcingOrders={INITIAL_SOURCING_ORDERS} 
            activeRole={activeRole}
          />
        )}
        
        {activeTab === 'Հաստատումներ' && (
          <InboundsTable 
            inbounds={activeApprovals} 
            onAction={handleAction} 
            activeRole={activeRole} 
            isHistory={false}
          />
        )}

        {activeTab === 'Մուտքերի Պատմություն' && (
          <InboundsTable 
            inbounds={inboundHistory} 
            activeRole={activeRole}
            isHistory={true} 
            onAction={handleAction}
          />
        )}
      </div>
    </div>
  );
}
