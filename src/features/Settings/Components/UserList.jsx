import React from 'react';
import { MoreVertical, Edit2, Lock, Unlock, Mail, Phone, Shield, UserCheck, UserX } from 'lucide-react';

export default function UserList({ users, canManage }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Օգտատեր</th>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Կոնտակտային Տվյալներ</th>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Դեր</th>
            <th className="p-4 text-xs font-bold text-slate-500 uppercase">Կարգավիճակ</th>
            {canManage && <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Գործողություններ</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-slate-50 group">
              <td className="p-4">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase">
                      {user.firstName[0]}{user.lastName[0]}
                   </div>
                   <div>
                      <div className="font-bold text-slate-700">{user.firstName} {user.lastName}</div>
                      <div className="text-xs text-slate-400">ID: {user.id}</div>
                   </div>
                </div>
              </td>
              <td className="p-4">
                 <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                       <Mail size={14} className="text-slate-400" /> {user.email}
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                         <Phone size={14} className="text-slate-400" /> {user.phone}
                      </div>
                    )}
                 </div>
              </td>
              <td className="p-4">
                 <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg w-max shadow-sm border border-slate-200">
                    <Shield size={14} className="text-indigo-500" /> {user.role}
                 </div>
              </td>
              <td className="p-4">
                 <div className={`flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border w-max shadow-sm ${user.status === 'Ակտիվ' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {user.status === 'Ակտիվ' ? <UserCheck size={14} /> : <UserX size={14} />} {user.status}
                 </div>
              </td>
              {canManage && (
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                     <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Խմբագրել">
                        <Edit2 size={18} />
                     </button>
                     {user.status === 'Ակտիվ' ? (
                       <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Արգելափակել">
                          <Lock size={18} />
                       </button>
                     ) : (
                       <button className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Ապաարգելափակել">
                          <Unlock size={18} />
                       </button>
                     )}
                     <button className="p-2 text-slate-300 hover:text-red-700 rounded-lg">
                        <MoreVertical size={18} />
                     </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
