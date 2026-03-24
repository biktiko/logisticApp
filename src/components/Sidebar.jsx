import React from 'react';
import { 
  Warehouse, 
  CalendarDays, 
  ClipboardCheck, 
  BarChart3, 
  Bell, 
  Calculator, 
  Users, 
  HelpCircle,
  Truck,
  PackagePlus,
  ChevronLeft,
  ChevronRight,
  Factory,
  Database,
  Globe
} from 'lucide-react';

const MENU_ITEMS = [
  { id: 'warehouses', label: 'Պահեստներ', icon: Warehouse },
  { id: 'weekly-plan', label: 'Շաբաթվա պլան', icon: CalendarDays },
  { id: 'sourcing', label: 'Մատակարարումներ', icon: Truck },
  { id: 'inbound', label: 'Մուտքագրումներ', icon: PackagePlus },
  { id: 'production', label: 'Արտադրություն', icon: Factory },
  { id: 'inventory', label: 'Գույքագրումներ', icon: ClipboardCheck },
  { id: 'sales', label: 'Արտահանում', icon: Globe },
  { id: 'reports', label: 'Հաշվետվություններ', icon: BarChart3 },
  { id: 'calculator', label: 'Հաշվիչ', icon: Calculator },
  { id: 'settings', label: 'Օգտատերեր և Դերեր', icon: Users },
  { id: 'directory', label: 'Տեղեկատու', icon: Database },
];

export default function Sidebar({ activeView, onNavigate, activeRole, onChangeRole, roles, isOpen, onToggle, unreadCount }) {
  // Define what each role can see
  const visibleItems = MENU_ITEMS.filter(item => {
    if (activeRole === 'Արտահանման վաճառքի մենեջեր') {
      return ['notifications', 'directory', 'sales'].includes(item.id);
    }
    
    if (item.id === 'sales') {
      return ['Սուպերադմին', 'Գլխավոր պահեստապետ', 'Տեսակի պատասխանատու', 'Պատրաստի արտադրանքի պատասխանատու'].includes(activeRole);
    }

    if (item.id === 'weekly-plan') {
      return !['Հումքի պատասխանատու', 'Պատրաստի արտադրանքի պատասխանատու', 'Արտադրամասի աշխատակից'].includes(activeRole);
    }
    
    if (item.id === 'sourcing') {
      return ['Սուպերադմին', 'Գլխավոր պահեստապետ', 'Տեսակի պատասխանատու'].includes(activeRole);
    }

    if (item.id === 'production') {
      return !['Արտահանման վաճառքի մենեջեր', 'Հումքի պատասխանատու', 'Պատրաստի արտադրանքի պատասխանատու'].includes(activeRole);
    }

    if (item.id === 'inbound') {
      return !['Արտադրամասի պետ', 'Արտադրամասի աշխատակից', 'Արտահանման վաճառքի մենեջեր'].includes(activeRole);
    }

    if (item.id === 'inventory' || item.id === 'calculator') {
      return activeRole !== 'Արտահանման վաճառքի մենեջեր';
    }

    if (item.id === 'reports') {
      return !['Արտադրամասի աշխատակից', 'Արտահանման վաճառքի մենեջեր'].includes(activeRole);
    }

    if (item.id === 'settings') {
      return ['Սուպերադմին', 'Գլխավոր պահեստապետ'].includes(activeRole);
    }

    return true;
  });

  return (
    <div className={`bg-white border-r border-slate-200 h-full flex flex-col items-center py-6 gap-3 flex-shrink-0 z-50 transition-all duration-300 relative ${isOpen ? 'w-64 min-w-[256px]' : 'w-[72px] min-w-[72px]'}`}>
      
      {/* Toggle Button */}
      <button 
        onClick={onToggle}
        className="absolute -right-3 top-6 bg-white border border-slate-200 rounded-full p-1 text-slate-400 hover:text-blue-600 shadow-sm z-50"
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      {/* Navigation Items (Scrollable) */}
      <div className="flex-1 w-full overflow-y-auto px-4 flex flex-col items-center gap-2 py-2 thin-scrollbar">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          const isNotif = item.id === 'notifications';
          
          return (
            <button
              key={item.id}
              title={!isOpen ? item.label : ''}
              onClick={() => onNavigate(item.id)}
              className={`${isOpen ? 'w-full px-4' : 'w-12 justify-center'} flex items-center gap-3 py-3 rounded-lg font-medium text-sm transition-colors relative flex-shrink-0 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 bg-blue-50/50'
              }`}
            >
              <div className="relative flex-shrink-0">
                <Icon size={18} />
                {!isOpen && isNotif && unreadCount > 0 && (
                   <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 border border-white"></span>
                )}
              </div>
              {isOpen && <span className="truncate">{item.label}</span>}
              
              {/* Unread Badge (when open) */}
              {isOpen && isNotif && unreadCount > 0 && (
                 <span className="ml-auto bg-red-500 text-white font-bold text-[10px] px-1.5 py-0.5 rounded-full shadow-sm">
                   {unreadCount}
                 </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Role Selection (Fixed at Bottom with padding) */}
      <div className={`w-full py-4 border-t border-slate-100 flex-shrink-0 ${isOpen ? 'px-6' : 'px-2'}`}>
        {isOpen ? (
          <>
            <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">
              Ակտիվ Դեր
            </label>
            <select 
              value={activeRole}
              onChange={(e) => onChangeRole(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-[13px] font-bold text-slate-700 py-2 px-3 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 cursor-pointer outline-none transition-all"
            >
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </>
        ) : (
          <div className="flex justify-center cursor-pointer hover:opacity-80 transition-opacity" title={`Ակտիվ Դեր: ${activeRole}`}>
            <div className="bg-blue-100 text-blue-700 font-bold w-10 h-10 rounded-full flex items-center justify-center text-[10px] text-center leading-tight shadow-sm border-2 border-white">
              {activeRole.substring(0,2).toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
