import React from 'react';
import { Search, Plus, Bell, Filter, Calendar } from 'lucide-react';
import { WAREHOUSE_OPTIONS } from '../../../data/mockData';

export default function TopBar({ 
  onNewTransfer, searchQuery, setSearchQuery, activeWarehouse, setActiveWarehouse,
  archiveDate, setArchiveDate, visibleWarehouses, isReadOnlyMode,
  onNavigate, unreadCount, onToggleFilter, showFilter
}) {
  const isArchiveMode = isReadOnlyMode; // map variable for styling

  return (
    <div className="flex items-center justify-between bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-40 shadow-sm">
      {/* Left side: Title & Active View */}
      <div className="flex items-center gap-6">
        <h1 className="text-2xl font-black tracking-tight text-slate-800">Պահեստներ</h1>
        <div className="h-6 w-px bg-slate-200" />
        
        <div className="relative">
          <select 
            className="appearance-none bg-blue-50 border border-blue-200 text-blue-800 font-bold py-2.5 pl-4 pr-10 rounded-xl hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
            value={activeWarehouse}
            onChange={(e) => setActiveWarehouse(e.target.value)}
          >
            {visibleWarehouses?.map((wh) => (
              <option key={wh} value={wh} className="text-slate-800">{wh}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-blue-600">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>

      {/* Right side: Actions & Utilities */}
      <div className="flex items-center gap-5">
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-sm">
          <div className="relative flex items-center">
            <Calendar className="absolute left-3 w-4 h-4 text-slate-500 pointer-events-none" />
            <input 
              type="date"
              title="Արխիվի ամսաթիվ (Historical Date)"
              value={archiveDate}
              onChange={(e) => setArchiveDate(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-transparent text-slate-700 font-bold text-sm hover:text-slate-900 transition-colors focus:outline-none cursor-pointer"
            />
          </div>
          {isArchiveMode && (
            <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-1 rounded-lg border border-amber-200 uppercase tracking-widest ml-1 mr-1">
              Արխիվ
            </span>
          )}
        </div>

        <button 
          onClick={onNewTransfer}
          disabled={isArchiveMode}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md ${
            isArchiveMode 
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
          }`}
        >
          <Plus size={16} />
          <span>Նոր տեղափոխում</span>
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        <button 
          onClick={() => onNavigate('notifications')}
          className="relative text-slate-500 hover:text-blue-600 transition-colors p-2.5 rounded-xl hover:bg-blue-50 focus:ring-2 focus:ring-blue-100"
        >
          <Bell size={22} />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white shadow-sm"></span>
          )}
        </button>
      </div>
    </div>
  );
}
