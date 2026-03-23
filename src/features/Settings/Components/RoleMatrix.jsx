import React, { useState } from 'react';
import { Shield, ChevronRight, CheckCircle2, XCircle, Info, Lock, Settings } from 'lucide-react';
import { PERMISSIONS_LIST } from '../../../data/mockData';

const ROLES = [
  'Սուպերադմին',
  'Գլխավոր պահեստապետ',
  'Տեսակի պատասխանատու',
  'Պատրաստի արտադրանքի պատասխանատու',
  'Հումքի պատասխանատու',
  'Արտադրամասի պետ',
  'Արտադրամասի աշխատակից',
  'Արտահանման վաճառքի մենեջեր'
];

export default function RoleMatrix({ canManage }) {
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);

  // Mock checking if a permission belongs to a role based on the document 3.3
  const hasPermission = (permissionId, role) => {
    if (role === 'Սուպերադմին') return true;
    
    const isChief = role === 'Գլխավոր պահեստապետ';
    const isTypeResp = role === 'Տեսակի պատասխանատու';
    const isFinishedProd = role === 'Պատրաստի արտադրանքի պատասխանատու';
    const isRawMat = role === 'Հումքի պատասխանատու';
    const isProdHead = role === 'Արտադրամասի պետ';
    const isExportManager = role === 'Արտահանման վաճառքի մենեջեր';

    // Users Management
    if (['USER_VIEW', 'USER_MANAGE', 'ROLE_MANAGE'].includes(permissionId)) {
      return isChief; // Chief can manage users (except admin rights)
    }

    // Catalog & Products
    if (['CAT_VIEW', 'PRD_VIEW', 'BOM_VIEW'].includes(permissionId)) {
      return !isExportManager; 
    }
    if (['CAT_MANAGE', 'PRD_CREATE', 'BOM_EDIT'].includes(permissionId)) {
      return isChief || isTypeResp || isProdHead;
    }

    // Stocks
    if (permissionId === 'STK_VIEW_ALL') return isChief;
    if (permissionId === 'STK_VIEW_OWN') return true;
    if (permissionId === 'TRNS_CREATE') return isChief || isTypeResp || isFinishedProd || isRawMat;

    // Production
    if (permissionId === 'PROD_ORDER_CREATE') return isTypeResp;
    if (permissionId === 'PROD_START' || permissionId === 'PROD_FINALIZE') return isProdHead;

    // Sales
    if (permissionId === 'SALE_ORDER_CREATE') return isExportManager || isTypeResp;

    // Inventory
    if (permissionId === 'INV_START') return isChief || isTypeResp || isProdHead;

    return false;
  };

  const categories = [...new Set(PERMISSIONS_LIST.map(p => p.category))];

  return (
    <div className="flex gap-8 h-full">
      {/* Role Selector Sidebar */}
      <div className="w-72 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-xs text-slate-500 uppercase flex items-center gap-2">
           <Shield size={14} /> Դերերի Ցանկ
        </div>
        <div className="flex-1 overflow-auto">
           {ROLES.map(role => (
             <button
               key={role}
               onClick={() => setSelectedRole(role)}
               className={`w-full text-left px-5 py-4 flex items-center justify-between border-b border-slate-50 transition-all font-bold text-sm ${selectedRole === role ? 'bg-indigo-50 text-indigo-700 border-l-4 border-l-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}
             >
               {role}
               <ChevronRight size={16} className={selectedRole === role ? 'text-indigo-400' : 'text-slate-300'} />
             </button>
           ))}
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-w-0">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
           <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-3">
                 <Settings size={22} className="text-indigo-600" />
                 Իրավասությունների Հավաքածու: <span className="text-indigo-700">{selectedRole}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium tracking-wide">
                 Դիտարկեք և կառավարեք տվյալ դերի իրավասությունները և սահմանափակումները
              </p>
           </div>
           {canManage && (
             <button className="px-5 py-2 bg-slate-800 hover:bg-black text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-2">
                <Edit2 size={14} className="opacity-70" /> Խմբագրել Իրավասությունները
             </button>
           )}
        </div>

        <div className="flex-1 overflow-auto p-6 scroll-smooth">
          <div className="max-w-4xl mx-auto space-y-8">
            {categories.map(cat => (
              <div key={cat} className="space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="h-px bg-slate-100 flex-1"></div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100 shadow-sm">
                       {cat}
                    </h3>
                    <div className="h-px bg-slate-100 flex-1"></div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {PERMISSIONS_LIST.filter(p => p.category === cat).map(perm => {
                       const allowed = hasPermission(perm.id, selectedRole);
                       return (
                         <div key={perm.id} className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all group ${allowed ? 'bg-indigo-50/30 border-indigo-200' : 'bg-slate-50/30 border-slate-200 opacity-60'}`}>
                            <div className="flex flex-col gap-0.5">
                               <span className={`text-[13px] font-bold ${allowed ? 'text-indigo-900' : 'text-slate-500'}`}>{perm.label}</span>
                               <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-500 transition-colors uppercase tracking-widest">{perm.id}</span>
                            </div>
                            <div className={`p-1.5 rounded-lg transition-transform group-hover:scale-110 ${allowed ? 'text-indigo-600' : 'text-slate-300'}`}>
                               {allowed ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                            </div>
                         </div>
                       );
                    })}
                 </div>
              </div>
            ))}
            
            {/* Logic Constraints Footer */}
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6 mt-12 flex gap-4 items-start shadow-sm">
               <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                  <Info size={24} />
               </div>
               <div>
                  <h4 className="text-sm font-black text-amber-900 uppercase tracking-wider mb-2">Համակարգային Սահմանափակումներ: {selectedRole}</h4>
                  <ul className="text-xs text-amber-800 font-bold space-y-2 opacity-80 list-disc list-inside bg-white/40 p-3 rounded-xl border border-amber-100">
                     {selectedRole === 'Գլխավոր պահեստապետ' && (
                       <>
                         <li>Չի կարող ձևակերպել կամ չեղարկել արտադրության պատվեր:</li>
                         <li>Չի կարող ձևակերպել արտահանման պատվեր:</li>
                         <li>Չի կարող պահեստ հումք մուտք անել:</li>
                       </>
                     )}
                     {selectedRole.includes('պատասխանատու') && (
                       <>
                         <li>Չի կարող ավելացնել օգտատերեր կամ փոփոխել նրանց դերերը:</li>
                         <li>Տեսնում է պրոդուկտները միայն իր տիրույթում:</li>
                       </>
                     )}
                     {selectedRole.includes('Արտահանման') && (
                       <>
                         <li>Չի տեսնում պահեստների ազատ մնացորդները:</li>
                         <li>Չունի հասանելիություն արտադրական պրոցեսներին:</li>
                       </>
                     )}
                     {selectedRole === 'Սուպերադմին' ? <li>Բոլոր հնարավոր հասանելիությունները և դիտելիությունները:</li> : <li>Վերոհիշյալ իրավասությունները կարող են փոփոխվել միայն Ադմինի կողմից:</li>}
                  </ul>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Edit2 = ({ size, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);
