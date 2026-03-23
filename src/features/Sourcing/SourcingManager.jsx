import React, { useState } from 'react';
import { Truck, Plus, CheckCircle, Clock, XCircle, FileText, BarChart2, Users } from 'lucide-react';
import { INITIAL_SOURCING_ORDERS, MOCK_SALES_MANAGERS } from '../../data/mockData';
import OrdersTable from './components/OrdersTable.jsx';
import OrderRequestModal from './components/OrderRequestModal.jsx';
import ManagersList from './components/ManagersList.jsx';

export default function SourcingManager({ activeRole }) {
  const [orders, setOrders] = useState(INITIAL_SOURCING_ORDERS);
  const [managers] = useState(MOCK_SALES_MANAGERS);

  // Tabs
  const isChief = ['Սուպերադմին', 'Գլխավոր պահեստապետ'].includes(activeRole);
  
  const [activeTab, setActiveTab] = useState('Ակտիվ հարցումներ');
  // Tabs: 'Ակտիվ հարցումներ', 'Պատմություն', 'Մոնիտորինգ', 'Մատակարարներ' (only Chief)

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Derive visible orders based on tab
  const activeOrders = orders.filter(o => o.status !== 'Կատարված' && o.status !== 'Մերժված');
  const historicalOrders = orders.filter(o => o.status === 'Կատարված' || o.status === 'Մերժված');

  const displayedOrders = activeTab === 'Ակտիվ հարցումներ' ? activeOrders : 
                          activeTab === 'Պատմություն' ? historicalOrders : [];

  const handleAction = (orderId, subAction, payload) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        if (subAction === 'approve') {
          return { ...o, status: 'Նոր/Բաց', managerId: payload.managerId };
        }
        if (subAction === 'reject') {
          return { ...o, status: 'Մերժված', rejectReason: payload.rejectReason };
        }
        if (subAction === 'complete') {
          return { ...o, status: 'Կատարված', items: payload.adjustedItems || o.items };
        }
      }
      return o;
    }));
  };

  const handleCreateRequest = (newRequest) => {
    setOrders([{
      ...newRequest,
      id: `REQ-${Math.floor(Math.random() * 9000) + 1000}`,
      date: new Date().toISOString(),
      status: 'Սպասում է',
      initiator: 'Տեսակի պատասխանատու (Դեմո)',
      managerId: null,
      rejectReason: ''
    }, ...orders]);
    setIsRequestModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 w-full overflow-hidden relative">
      <div className="flex flex-wrap items-center justify-between bg-white border-b border-slate-200 px-8 py-4 z-10 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <Truck className="text-blue-600" size={24} />
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            Մատակարարումների Կառավարում
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {activeRole === 'Տեսակի պատասխանատու' && (
            <button 
              onClick={() => setIsRequestModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md shadow-blue-200"
            >
              <Plus size={16} /> Նոր Հարցում
            </button>
          )}
        </div>
      </div>

      <div className="px-8 pt-4 pb-0 bg-white border-b border-slate-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02)] z-30 flex gap-4 overflow-x-auto">
        {['Ակտիվ հարցումներ', 'Պատմություն'].map(tab => (
          <button 
            key={tab}
            className={`pb-3 px-2 border-b-2 font-medium transition-colors whitespace-nowrap ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
        {isChief && (
          <>
            <button 
              className={`pb-3 px-2 border-b-2 font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'Մոնիտորինգ' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              onClick={() => setActiveTab('Մոնիտորինգ')}
            >
              <BarChart2 size={16} /> Մոնիտորինգ
            </button>
            <button 
              className={`pb-3 px-2 border-b-2 font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'Մատակարարներ' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              onClick={() => setActiveTab('Մատակարարներ')}
            >
              <Users size={16} /> Վաճառքի Մենեջերներ
            </button>
          </>
        )}
      </div>

      <div className="flex-1 overflow-auto bg-slate-50 relative p-6">
        {(activeTab === 'Ակտիվ հարցումներ' || activeTab === 'Պատմություն') && (
          <OrdersTable 
            orders={displayedOrders} 
            isChief={isChief} 
            managers={managers} 
            onAction={handleAction} 
            isHistory={activeTab === 'Պատմություն'}
          />
        )}
        
        {activeTab === 'Մատակարարներ' && isChief && (
          <ManagersList managers={managers} />
        )}

        {activeTab === 'Մոնիտորինգ' && isChief && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 flex flex-col items-center justify-center text-slate-500 h-64">
             <BarChart2 size={48} className="text-slate-300 mb-4" />
             <h3 className="text-lg font-bold text-slate-700 mb-2">Մոնիտորինգի Վահանակ</h3>
             <p className="text-sm max-w-md text-center">Այստեղ կարտացոլվեն սպասվող և փաստացի մատակարարումների համեմատական վերլուծությունները։ (Under Development)</p>
          </div>
        )}
      </div>

      {isRequestModalOpen && (
        <OrderRequestModal onClose={() => setIsRequestModalOpen(false)} onSubmit={handleCreateRequest} />
      )}
    </div>
  );
}
