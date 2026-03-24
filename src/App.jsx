import React, { useState } from 'react';
import WarehouseManagement from './features/WarehouseManagement/WarehouseManagement';
import WeeklyPlanManager from './features/WeeklyPlan/WeeklyPlanManager';
import SourcingManager from './features/Sourcing/SourcingManager';
import InboundManager from './features/Inbound/InboundManager';
import ProductionManager from './features/Production/ProductionManager';
import CalculatorManager from './features/Calculator/CalculatorManager';
import InventoryManager from './features/Inventory/InventoryManager';
import NotificationsManager from './features/Notifications/NotificationsManager';
import ReportsManager from './features/Reports/ReportsManager';
import UserManager from './features/Settings/UserManager';
import DirectoryManager from './features/Directory/DirectoryManager';
import SalesManager from './features/Sales/SalesManager';
import Sidebar from './components/Sidebar';
import { MOCK_PROD_ORDERS } from './data/mockData';

export const ROLES = [
  'Սուպերադմին',
  'Գլխավոր պահեստապետ',
  'Տեսակի պատասխանատու',
  'Պատրաստի արտադրանքի պատասխանատու',
  'Հումքի պատասխանատու',
  'Արտադրամասի պետ',
  'Արտադրամասի աշխատակից',
  'Արտահանման վաճառքի մենեջեր'
];

// Mock deep linking structure
// target: 'sourcing', 'inbound', 'inventory', etc.
const INITIAL_NOTS = [
  { id: 1, type: 'action', text: 'Նոր մուտքի հարցում INB-8001: Պահանջվում է հաստատում:', author: 'Արտադրանքի պատասխանատու', target: 'inbound', linkId: 'INB-8001', read: false },
  { id: 2, type: 'info', text: 'PRD-2024-001 պատվերի արտադրությունն ավարտվել է:', author: 'Արտադրամասի պետ', target: 'production', linkId: 'PRD-2024-001', read: true }
];

function App() {
  const [activeView, setActiveView] = useState('warehouses'); // 'warehouses' | 'weekly-plan' | 'sourcing' | 'inbound' | 'production' | 'calculator' | 'inventory' | 'notifications'
  const [activeRole, setActiveRole] = useState(ROLES[1]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Global State for Production Orders
  const [productionOrders, setProductionOrders] = useState(MOCK_PROD_ORDERS);

  // Notifications State
  const [notifications, setNotifications] = useState(INITIAL_NOTS);
  const [toastNotif, setToastNotif] = useState(null);

  // Global deep link param passing (mock usage)
  const [deepLinkId, setDeepLinkId] = useState(null);

  const triggerNotification = (notif) => {
    const newNotif = { ...notif, id: Date.now(), read: false };
    setNotifications(prev => [newNotif, ...prev]);
    setToastNotif(newNotif);
    setTimeout(() => setToastNotif(null), 10000); // Hide toast after 10s
  };

  const clearToast = () => setToastNotif(null);

  const handleDeepLink = (targetView, id) => {
     setActiveView(targetView);
     setDeepLinkId(id);
     clearToast();
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 antialiased overflow-hidden w-full relative">
      <Sidebar 
        activeView={activeView} 
        onNavigate={setActiveView} 
        activeRole={activeRole} 
        onChangeRole={setActiveRole} 
        roles={ROLES} 
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        unreadCount={notifications.filter(n => !n.read).length}
      />
      
      <div className="flex-1 overflow-hidden flex flex-col relative h-full">
        {activeView === 'warehouses' && (
          <WarehouseManagement 
             activeRole={activeRole} 
             onNavigate={setActiveView}
             unreadCount={notifications.filter(n => !n.read).length}
          />
        )}
        {activeView === 'weekly-plan' && <WeeklyPlanManager activeRole={activeRole} productionOrders={productionOrders} setProductionOrders={setProductionOrders} />}
        {activeView === 'sourcing' && <SourcingManager activeRole={activeRole} />}
        {activeView === 'inbound' && <InboundManager activeRole={activeRole} />}
        {activeView === 'production' && <ProductionManager activeRole={activeRole} orders={productionOrders} setOrders={setProductionOrders} />}
        {activeView === 'calculator' && <CalculatorManager activeRole={activeRole} />}
        {activeView === 'inventory' && <InventoryManager activeRole={activeRole} />}
        {activeView === 'notifications' && (
          <NotificationsManager 
             notifications={notifications} 
             setNotifications={setNotifications} 
             onDeepLink={handleDeepLink}
             triggerDemo={triggerNotification}
          />
        )}
        {activeView === 'reports' && <ReportsManager activeRole={activeRole} />}
        {activeView === 'settings' && <UserManager activeRole={activeRole} />}
        {activeView === 'directory' && <DirectoryManager activeRole={activeRole} />}
        {activeView === 'sales' && <SalesManager activeRole={activeRole} />}
        
        {/* Fallback for undeveloped sections */}
        {activeView !== 'warehouses' && activeView !== 'weekly-plan' && activeView !== 'sourcing' && activeView !== 'inbound' && activeView !== 'production' && activeView !== 'calculator' && activeView !== 'inventory' && activeView !== 'notifications' && activeView !== 'reports' && activeView !== 'settings' && activeView !== 'directory' && activeView !== 'sales' && (
          <div className="flex items-center justify-center h-full w-full text-slate-400 font-medium">
            Այս բաժինը դեռ մշակման փուլում է... (Section under development)
          </div>
        )}
      </div>

      {/* Global Toast Notification Container */}
      {toastNotif && (
        <div className="absolute bottom-6 right-6 bg-white border-l-4 border-l-blue-500 border-y border-r border-slate-200 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] rounded-lg p-5 w-80 z-50 animate-in slide-in-from-bottom-5">
           <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{toastNotif.author}</span>
              <button onClick={clearToast} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
           </div>
           <div className="text-sm font-semibold text-slate-800 mb-4 leading-snug">
              {toastNotif.text}
           </div>
           <div className="flex gap-2">
             {toastNotif.target && (
               <button 
                 onClick={() => handleDeepLink(toastNotif.target, toastNotif.linkId)}
                 className="flex-1 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs rounded-md transition-colors"
               >
                 Անցնել (Link)
               </button>
             )}
             <button 
               onClick={clearToast}
               className="flex-1 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold text-xs rounded-md transition-colors"
             >
               Փակել
             </button>
           </div>
        </div>
      )}
    </div>
  );
}

export default App;
