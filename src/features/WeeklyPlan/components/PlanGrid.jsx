import React, { useMemo } from 'react';
import { Package, Search } from 'lucide-react';

const DAYS = [
  { key: 'Mon', label: 'Երկ' },
  { key: 'Tue', label: 'Երք' },
  { key: 'Wed', label: 'Չրք' },
  { key: 'Thu', label: 'Հնգ' },
  { key: 'Fri', label: 'Ուր' },
  { key: 'Sat', label: 'Շբթ' },
  { key: 'Sun', label: 'Կիր' },
];

export default function PlanGrid({ planData, onDayChange, isReadOnly, bomConfig, products }) {
  
  // Calculate raw materials based on the sum of planned production
  const renderRowMaterials = (productId, totalQuantity) => {
    const config = bomConfig[productId];
    if (!config || totalQuantity === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-100">
        <div className="text-xs font-semibold text-slate-500 w-full mb-1">Հումքի պահանջարկ:</div>
        {config.map(mat => {
          const req = mat.amountPerUnit * totalQuantity;
          return (
            <span key={mat.itemId} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-800 border border-blue-100">
              {mat.name}: {(req % 1 !== 0) ? req.toFixed(2) : req} {mat.unit}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden m-8 mt-6 flex-grow flex flex-col">
      <div className="overflow-auto h-full flex-grow">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 min-w-64">Պրոդուկտ / Հումքի բանաձև</th>
              {DAYS.map(day => (
                <th key={day.key} className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-center w-24">
                  {day.label}
                </th>
              ))}
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right w-36">Պլան (Ընդհանուր)</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right w-36">Փաստացի ԱՐտադրված</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-center w-36">Շեղում</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {products.map((product) => {
              const rowData = planData[product.id] || {};
              const totalPlanned = DAYS.reduce((sum, d) => sum + (rowData[d.key] || 0), 0);
              const actual = rowData.actualProduced || 0;
              
              const diff = actual - totalPlanned;
              let diffBadge;
              if (totalPlanned === 0) {
                diffBadge = <span className="text-slate-400">--</span>;
              } else if (diff === 0) {
                diffBadge = <span className="text-green-600 font-bold px-2 py-0.5 bg-green-50 rounded">0</span>;
              } else if (diff > 0) {
                diffBadge = <span className="text-blue-600 font-bold px-2 py-0.5 bg-blue-50 rounded">+{diff}</span>;
              } else {
                diffBadge = <span className="text-red-600 font-bold px-2 py-0.5 bg-red-50 rounded">{diff}</span>;
              }

              return (
                <tr key={product.id} className="bg-white hover:bg-slate-50 transition-colors">
                  
                  {/* Product Details & Tooltip for BOM */}
                  <td className="p-4 align-top">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 bg-slate-100 p-1.5 rounded text-slate-400">
                        <Package size={16} />
                      </div>
                      <div className="w-full">
                        <div className="font-bold text-slate-800 text-sm">{product.name}</div>
                        <div className="text-xs font-mono text-slate-500 mb-1">{product.code}</div>
                        {renderRowMaterials(product.id, totalPlanned)}
                      </div>
                    </div>
                  </td>

                  {/* Daily Inputs */}
                  {DAYS.map(day => (
                    <td key={day.key} className="p-4 text-center align-top">
                      <input 
                        type="number" 
                        min="0"
                        disabled={isReadOnly}
                        value={rowData[day.key] || ''}
                        onChange={(e) => onDayChange(product.id, day.key, e.target.value)}
                        placeholder="0"
                        className={`w-16 border rounded text-center px-1.5 py-1.5 text-sm font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors
                          ${isReadOnly ? 'bg-slate-50 border-transparent text-slate-700 cursor-not-allowed font-bold text-base bg-transparent' : 'border-slate-300 text-slate-800 bg-white hover:border-slate-400'}
                          ${rowData[day.key] > 0 ? 'text-blue-700 bg-blue-50/50' : ''}
                        `}
                      />
                    </td>
                  ))}

                  {/* Summary Columns */}
                  <td className="p-4 text-right align-top">
                    <div className="text-lg font-bold text-slate-800 tabular-nums bg-slate-100 rounded px-3 py-1.5 inline-block min-w-20 text-center">
                      {totalPlanned}
                    </div>
                  </td>
                  
                  <td className="p-4 text-right align-top">
                    <div className="text-lg font-bold text-slate-800 tabular-nums px-3 py-1.5 inline-block border-b-2 border-slate-200">
                      {actual}
                    </div>
                  </td>

                  <td className="p-4 text-center align-top tabular-nums pt-6 text-sm">
                    {diffBadge}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
