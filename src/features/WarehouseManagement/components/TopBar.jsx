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
    <div className="flex items-center justify-between bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-40 shadow-sm gap-4">
      {/* Left side: Title & Active View & Date */}
      <div className="flex items-center gap-4 flex-wrap">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Պահեստներ</h1>
        <div className="h-6 w-px bg-slate-200" />
        
        <div className="relative">
          <select 
            className="appearance-none bg-blue-50 border border-blue-200 text-blue-800 font-semibold py-2 pl-4 pr-10 rounded-lg hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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

        <div className="relative flex items-center">
          <Calendar className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <input 
            type="date"
            title="Արխիվի ամսաթիվ (Historical Date)"
            value={archiveDate}
            onChange={(e) => setArchiveDate(e.target.value)}
            className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
        </div>
        {isArchiveMode && (
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded border border-amber-200 uppercase tracking-widest">Արխիվ</span>
        )}
      </div>

      {/* Right side: Search, Actions */}
      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all text-slate-800"
            placeholder="Որոնել անվանումով կամ կոդով..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* New Transfer Button */}
        <button 
          onClick={onNewTransfer}
          disabled={isArchiveMode}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all shadow-md ${
            isArchiveMode 
            ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
          }`}
        >
          <Plus size={14} />
          <span>Նոր տեղափոխում</span>
        </button>

        {/* Utility Icons */}
        <div className="flex items-center gap-2 ml-2 pl-4 border-l border-slate-200">
          <button 
            onClick={() => onNavigate('notifications')}
            className="relative text-slate-400 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-slate-100"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white"></span>
            )}
          </button>
          <button 
            onClick={onToggleFilter}
            className={`transition-colors p-2 rounded-full ${showFilter ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100'}`}
          >
            <Filter size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
