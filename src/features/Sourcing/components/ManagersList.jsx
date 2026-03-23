import React from 'react';
import { Mail, Briefcase, Plus } from 'lucide-react';

export default function ManagersList({ managers }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden m-6 flex-grow flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
        <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
          <Briefcase size={20} className="text-blue-500" />
          Վաճառքի մենեջերների ցանկ
        </h3>
        <button className="flex items-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors">
          <Plus size={16} /> Ավելացնել Մենեջեր
        </button>
      </div>
      
      <div className="p-6">
        <p className="text-sm text-slate-500 mb-6 max-w-2xl leading-relaxed bg-blue-50/50 p-4 border border-slate-100 rounded-lg">
          Այս ցանկում գրանցված անձինք <strong>չեն հանդիսանում</strong> համակարգի օգտատերեր։ Նրանց տվյալներն օգտագործվում են բացառապես մատակարարման հաստատված հարցումները էլեկտրոնային փոստով նրանց ավտոմատ ուղարկելու համար։ Ավելացումը հասանելի է միայն ադմիններին և գլխավոր պահեստապետին։
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {managers.map(mgr => (
            <div key={mgr.id} className={`border rounded-xl p-4 flex flex-col items-start shadow-sm transition-shadow hover:shadow-md ${mgr.status === 'Ակտիվ' ? 'border-slate-200 bg-white' : 'border-red-100 bg-red-50/20'}`}>
              <div className="flex justify-between w-full items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 text-lg">{mgr.firstName} {mgr.lastName}</h4>
                  <div className="text-xs font-mono text-slate-400 mt-0.5">{mgr.id}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${mgr.status === 'Ակտիվ' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {mgr.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 mt-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full w-full">
                <Mail size={14} className="text-blue-500 flex-shrink-0" />
                <span className="truncate" title={mgr.email}>{mgr.email}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
