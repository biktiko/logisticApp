import React, { useState } from 'react';
import { Users, ShieldCheck, UserPlus, Search, Filter, MoreVertical, Edit2, Lock, Unlock, UserMinus } from 'lucide-react';
import { MOCK_USERS, PERMISSIONS_LIST } from '../../data/mockData';
import UserList from './components/UserList';
import RoleMatrix from './components/RoleMatrix';

export default function UserManager({ activeRole }) {
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'roles'
  const [users, setUsers] = useState(MOCK_USERS);
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter(u => 
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const canManage = ['Սուպերադմին', 'Գլխավոր պահեստապետ'].includes(activeRole);

  return (
    <div className="flex flex-col h-full bg-slate-50 w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between bg-white border-b border-slate-200 px-8 py-5 flex-shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
             <Users size={28} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">
            Օգտատերեր և Դերեր
          </h1>
        </div>
        
        {activeTab === 'users' && canManage && (
          <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all">
            <UserPlus size={18} />
            Ավելացնել Օգտատեր
          </button>
        )}
      </div>

      {/* Tabs & Filters */}
      <div className="px-8 bg-white border-b border-slate-200 shadow-sm z-10 flex items-center justify-between">
        <div className="flex gap-6">
          <button 
            onClick={() => setActiveTab('users')}
            className={`py-4 px-2 border-b-2 font-bold transition-all text-sm uppercase tracking-wider flex items-center gap-2 ${activeTab === 'users' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <Users size={18} /> Օգտատերեր
          </button>
          <button 
            onClick={() => setActiveTab('roles')}
            className={`py-4 px-2 border-b-2 font-bold transition-all text-sm uppercase tracking-wider flex items-center gap-2 ${activeTab === 'roles' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <ShieldCheck size={18} /> Դերեր և Իրավասություններ
          </button>
        </div>

        {activeTab === 'users' && (
          <div className="flex items-center gap-4 py-3">
             <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Որոնել օգտատեր..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                />
             </div>
             <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                <Filter size={20} />
             </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        {activeTab === 'users' ? (
          <UserList users={filteredUsers} canManage={canManage} />
        ) : (
          <RoleMatrix canManage={canManage} />
        )}
      </div>
    </div>
  );
}
