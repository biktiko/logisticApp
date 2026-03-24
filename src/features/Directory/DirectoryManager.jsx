import React, { useState } from 'react';
import { 
  Database, Package, FlaskConical, LayoutGrid, Users, Warehouse, 
  Plus, Search, Edit2, Archive, ChevronRight, Save, Trash2, ArrowRight
} from 'lucide-react';
import { INITIAL_STOCK, PRODUCTION_PRODUCTS, BOM_CONFIGURATION } from '../../data/mockData';

// Mock initial data for the Directory
const MOCK_PARTNERS = [
  { id: 'P01', name: 'Ագրո ՍՊԸ', type: 'Մատակարար', contact: '+374 99 112233', status: 'Ակտիվ' },
  { id: 'P02', name: 'Էքսպորտ Գրուպ', type: 'Հաճախորդ', contact: '+374 55 998877', status: 'Ակտիվ' },
];

const MOCK_CATEGORIES = [
  { id: 'C01', name: 'Հումք', sub: 'Հիմնական', type: 'product' },
  { id: 'C02', name: 'Փաթեթավորում', sub: 'Առանց քյուառի', type: 'product' },
  { id: 'C03', name: 'Պատրաստի արտադրանք', sub: 'Ստանդարտ', type: 'product' },
];

const MOCK_WAREHOUSES = [
  { id: 'W01', name: 'Գլխավոր հումքի պահեստ', type: 'Հումք', status: 'Ակտիվ' },
  { id: 'W02', name: 'Արտադրամաս', type: 'Արտադրություն', status: 'Ակտիվ' },
  { id: 'W03', name: 'Վաճառքի պահեստ', type: 'Պատրաստի', status: 'Ակտիվ' },
];

const TABS = [
  { id: 'catalog', label: 'Ապրանքացանկ', icon: Package, desc: 'Հումք, նյութեր և արտադրանք' },
  { id: 'bom', label: 'Բաղադրատոմսեր (BOM)', icon: FlaskConical, desc: 'Արտադրության ռեցեպտներ' },
  { id: 'categories', label: 'Կատեգորիաներ', icon: LayoutGrid, desc: 'Դասակարգիչներ և միավորներ' },
  { id: 'partners', label: 'Գործընկերներ', icon: Users, desc: 'Մատակարարներ և հաճախորդներ' },
  { id: 'warehouses', label: 'Պահեստներ', icon: Warehouse, desc: 'Ֆիզիկական լոկացիաներ' },
];

export default function DirectoryManager({ activeRole }) {
  const [activeTab, setActiveTab] = useState('catalog');
  
  // Permissions
  const isChiefAdmin = ['Սուպերադմին', 'Գլխավոր պահեստապետ'].includes(activeRole);
  const isProdHead = activeRole === 'Արտադրամասի պետ';

  const renderContent = () => {
    switch(activeTab) {
      case 'catalog': return <CatalogTab isEditAllowed={isChiefAdmin} />;
      case 'bom': return <BomTab isEditAllowed={isProdHead} />;
      case 'categories': return <CategoriesTab isEditAllowed={isChiefAdmin} />;
      case 'partners': return <PartnersTab isEditAllowed={isChiefAdmin} />;
      case 'warehouses': return <WarehousesTab isEditAllowed={isChiefAdmin} />;
      default: return null;
    }
  };

  return (
    <div className="flex h-full bg-[#f8fafc] overflow-hidden">
      {/* ── Left Sidebar Navigation ── */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col py-6 px-4 gap-6 overflow-y-auto flex-shrink-0 z-10 shadow-[2px_0_8px_rgba(0,0,0,0.02)]">
         <div className="flex items-center gap-3 px-2 mb-2">
           <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
             <Database size={24} />
           </div>
           <div>
             <h2 className="font-extrabold text-slate-800 tracking-tight text-lg leading-tight">Տեղեկատու</h2>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Master Data</p>
           </div>
         </div>

         <div className="flex flex-col gap-1.5 px-1">
            {TABS.map(tab => {
               const isActive = activeTab === tab.id;
               const Icon = tab.icon;
               return (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`text-left flex items-start gap-3 px-4 py-3 rounded-xl transition-all border
                     ${isActive ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-transparent border-transparent hover:bg-slate-50 hover:border-slate-200'}
                   `}
                 >
                   <Icon size={18} className={`mt-0.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                   <div>
                     <div className={`text-sm font-bold ${isActive ? 'text-indigo-700' : 'text-slate-700'}`}>{tab.label}</div>
                     <div className={`text-xs font-medium mt-0.5 ${isActive ? 'text-indigo-500/80' : 'text-slate-400'}`}>{tab.desc}</div>
                   </div>
                   {isActive && <ChevronRight size={16} className="ml-auto mt-1 text-indigo-400" />}
                 </button>
               )
            })}
         </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-slate-50">
         {renderContent()}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────
// 1. ԱՊՐԱՆՔԱՑԱՆԿ (Catalog)
// ────────────────────────────────────────────────────────
function CatalogTab({ isEditAllowed }) {
  const [search, setSearch] = useState('');
  // Use INITIAL_STOCK mixed with PRODUCTION_PRODUCTS to get a unified catalog
  const catalogList = INITIAL_STOCK; 

  const filtered = catalogList.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    i.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-200">
      <div className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between shadow-sm z-10 flex-shrink-0">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Ապրանքացանկ և Հումք</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Համակարգում գրանցված բոլոր նյութերի և արտադրանքի ռեեստր</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input 
              type="text" 
              placeholder="Փնտրել ըստ անվանման կամ կոդի..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
            />
          </div>
          {isEditAllowed && (
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-indigo-200 transition-all">
              <Plus size={16} /> Նոր ապրանք
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Կոդ</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Անվանում</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Տիպ</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Կատեգորիա</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Չ/Մ</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Գործող.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-4">
                    <span className="font-mono text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">{item.code}</span>
                  </td>
                  <td className="p-4 font-bold text-slate-800">{item.name}</td>
                  <td className="p-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${item.type === 'Հումք' ? 'bg-amber-50 text-amber-700 border border-amber-200/50' : 'bg-green-50 text-green-700 border border-green-200/50'}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-medium text-slate-600">{item.category} <span className="text-slate-400 mx-1">/</span> {item.categoryType}</td>
                  <td className="p-4 text-sm font-bold text-slate-500 text-center">{item.unit}</td>
                  <td className="p-4 text-right">
                    <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" disabled={!isEditAllowed}>
                      <Edit2 size={16} />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1" disabled={!isEditAllowed}>
                      <Archive size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────
// 2. ԲԱՂԱԴՐԱՏՈՄՍԵՐ (BOM)
// ────────────────────────────────────────────────────────
function BomTab({ isEditAllowed }) {
  const [activeProduct, setActiveProduct] = useState(PRODUCTION_PRODUCTS[0]);
  
  const currentBom = BOM_CONFIGURATION[activeProduct.id] || [];

  return (
    <div className="flex h-full animate-in fade-in duration-200">
      {/* Left List */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col z-10">
         <div className="p-5 border-b border-slate-200 bg-slate-50/50">
           <h2 className="font-bold text-slate-800">Արտադրանք</h2>
           <p className="text-xs font-medium text-slate-500 mt-0.5">Ընտրեք ապրանքը BOM-ը տեսնելու համար</p>
         </div>
         <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
            {PRODUCTION_PRODUCTS.map(prod => {
              const isActive = activeProduct.id === prod.id;
              return (
                <button 
                  key={prod.id}
                  onClick={() => setActiveProduct(prod)}
                  className={`text-left px-3 py-2.5 rounded-lg border transition-all flex items-center justify-between
                    ${isActive ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'}
                  `}
                >
                  <div>
                    <div className={`text-sm font-bold ${isActive ? 'text-indigo-700' : 'text-slate-700'}`}>{prod.name}</div>
                    <div className={`text-[10px] font-mono mt-0.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`}>{prod.code}</div>
                  </div>
                  {isActive && <ChevronRight size={16} className="text-indigo-600" />}
                </button>
              );
            })}
         </div>
      </div>

      {/* Right Details */}
      <div className="flex-1 flex flex-col bg-slate-50 overflow-y-auto p-8 relative">
         {!isEditAllowed && (
           <div className="absolute top-8 right-8 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm flex items-center gap-2">
             <span>🔒 Միայն դիտման ռեժիմ</span>
             <span className="text-[10px] font-medium opacity-80">(Միայն արտադրամասի պետը կարող է փոփոխել)</span>
           </div>
         )}
         
         <div className="mb-6 max-w-3xl">
           <h1 className="text-2xl font-black text-slate-800 tracking-tight">{activeProduct.name}</h1>
           <div className="flex items-center gap-3 mt-2">
             <span className="font-mono text-sm font-bold bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500">{activeProduct.code}</span>
             <span className="text-sm font-bold text-slate-500">Բազային միավոր: <span className="text-slate-700">1 {activeProduct.unit}</span></span>
           </div>
         </div>

         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden max-w-3xl">
            <div className="border-b border-slate-100 bg-slate-50/50 p-4 flex items-center justify-between">
               <h3 className="font-bold text-slate-700 flex items-center gap-2">
                 <FlaskConical size={18} className="text-indigo-500" /> 
                 Բաղադրատոմս (Bill of Materials)
               </h3>
               {isEditAllowed && (
                 <button className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 px-3 py-1.5 hover:bg-indigo-50 rounded-lg transition-colors">
                   <Plus size={16} /> Ավելացնել Հումք
                 </button>
               )}
            </div>
            
            <div className="p-4">
              {currentBom.length === 0 ? (
                <div className="text-center py-8 text-slate-400 font-medium">Բաղադրատոմսը դատարկ է</div>
              ) : (
                <table className="w-full text-left border-collapse">
                   <thead>
                     <tr>
                       <th className="pb-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Հումք / Նյութ</th>
                       <th className="pb-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Քանակ (1 {activeProduct.unit}-ի համար)</th>
                       {isEditAllowed && <th className="pb-3 w-10"></th>}
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {currentBom.map((mat, idx) => (
                       <tr key={idx} className="group">
                         <td className="py-3">
                           <div className="font-bold text-slate-700 text-sm">{mat.name}</div>
                           <div className="text-xs text-slate-400 mt-0.5">{mat.itemId}</div>
                         </td>
                         <td className="py-3 text-right">
                           <div className="inline-flex items-center gap-2">
                             <input 
                               type="number" 
                               disabled={!isEditAllowed}
                               defaultValue={mat.amountPerUnit} 
                               className="w-20 text-right font-mono font-bold text-slate-700 border border-slate-200 rounded px-2 py-1 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:border-transparent disabled:bg-transparent"
                             />
                             <span className="text-sm font-bold text-slate-500 w-8 text-left">{mat.unit}</span>
                           </div>
                         </td>
                         {isEditAllowed && (
                           <td className="py-3 text-right">
                             <button className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all">
                               <Trash2 size={16} />
                             </button>
                           </td>
                         )}
                       </tr>
                     ))}
                   </tbody>
                </table>
              )}
            </div>
            
            {isEditAllowed && currentBom.length > 0 && (
              <div className="border-t border-slate-100 p-4 bg-slate-50/50 flex justify-end">
                <button className="flex items-center gap-2 bg-slate-800 hover:bg-black text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-md">
                  <Save size={16} /> Պահպանել Փոփոխությունները
                </button>
              </div>
            )}
         </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────
// 3. ԿԱՏԵԳՈՐԻԱՆԵՐ (Categories & Typologies)
// ────────────────────────────────────────────────────────
function CategoriesTab({ isEditAllowed }) {
  return (
    <div className="p-8 animate-in fade-in duration-200 max-w-5xl mx-auto w-full">
       <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Կատեգորիաներ և Տիպեր</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Համակարգի դասակարգիչներ</p>
          </div>
          {isEditAllowed && (
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-indigo-200 transition-all">
              <Plus size={16} /> Նոր Կատեգորիա
            </button>
          )}
       </div>

       <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Ապրանքների Կատեգորիաներ</h3>
            </div>
            <div className="p-4 flex flex-col gap-2">
               {MOCK_CATEGORIES.map(c => (
                 <div key={c.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:border-slate-300 transition-colors">
                    <div>
                      <div className="font-bold text-slate-700 text-sm">{c.name}</div>
                      <div className="text-xs font-medium text-slate-400 mt-0.5">Ենթատեսակ: {c.sub}</div>
                    </div>
                    {isEditAllowed && <button className="text-slate-400 hover:text-indigo-600"><Edit2 size={16}/></button>}
                 </div>
               ))}
            </div>
          </div>
       </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────
// 4. ԳՈՐԾԸՆԿԵՐՆԵՐ (Partners)
// ────────────────────────────────────────────────────────
function PartnersTab({ isEditAllowed }) {
  return (
    <div className="p-8 animate-in fade-in duration-200 max-w-5xl mx-auto w-full">
       <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Գործընկերներ</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Մատակարարներ և հաճախորդներ</p>
          </div>
          {isEditAllowed && (
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-indigo-200 transition-all">
              <Plus size={16} /> Նոր Գործընկեր
            </button>
          )}
       </div>

       <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Անվանում</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Տիպ</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Կոնտակտ</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ստատուս</th>
                {isEditAllowed && <th className="p-4 w-16"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_PARTNERS.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono text-xs font-bold text-slate-500">{p.id}</td>
                  <td className="p-4 font-bold text-slate-800">{p.name}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-[11px] font-bold ${p.type === 'Մատակարար' ? 'bg-orange-50 text-orange-700 border border-orange-200/50' : 'bg-blue-50 text-blue-700 border border-blue-200/50'}`}>
                      {p.type}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-slate-600 text-sm">{p.contact}</td>
                  <td className="p-4">
                     <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200/50">{p.status}</span>
                  </td>
                  {isEditAllowed && (
                    <td className="p-4 text-right">
                      <button className="text-slate-400 hover:text-indigo-600"><Edit2 size={16}/></button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
       </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────
// 5. ՊԱՀԵՍՏՆԵՐ (Warehouses Configuration)
// ────────────────────────────────────────────────────────
function WarehousesTab({ isEditAllowed }) {
  return (
    <div className="p-8 animate-in fade-in duration-200 max-w-5xl mx-auto w-full">
       <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Պահեստներ և Լոկացիաներ</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Համակարգի ֆիզիկական և վիրտուալ պահեստները</p>
          </div>
          {isEditAllowed && (
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-indigo-200 transition-all">
              <Plus size={16} /> Ավելացնել Պահեստ
            </button>
          )}
       </div>

       <div className="grid grid-cols-3 gap-6">
          {MOCK_WAREHOUSES.map(w => (
             <div key={w.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative group">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 mb-4">
                  <Warehouse size={20} />
                </div>
                <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">{w.name}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{w.type}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded uppercase">{w.status}</span>
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center mt-auto">
                  <span className="text-xs font-mono text-slate-400 font-medium">ID: {w.id}</span>
                  {isEditAllowed && (
                    <button className="text-indigo-600 hover:text-indigo-800 text-sm font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Կարգավորել <ArrowRight size={14} />
                    </button>
                  )}
                </div>
             </div>
          ))}
       </div>
    </div>
  );
}
