import React from 'react';
import { ArrowRightLeft, AlertTriangle, AlertCircle, CheckCircle2, Clock, Lock } from 'lucide-react';

export default function DataTable({ items, onThresholdChange, onTransferRow, activeWarehouse, isArchiveMode }) {
  
  // Checking if Min Threshold / Expense logics apply to the current active warehouse
  const applyThresholdsAndExpenses = 
    activeWarehouse === 'Գլխավոր հումքի պահեստ' || 
    activeWarehouse === 'Տեսակի հումքի պահեստ' || 
    activeWarehouse === 'Վաճառքի պահեստ';

  // Calculate specific analytics fields safely
  const calculateAnalytics = (qty, expense) => {
    if (expense === 0 || !expense) return '∞';
    const days = qty / expense;
    // Don't format with decimals if it's exact
    return parseFloat(days.toFixed(1));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden m-6 flex-grow flex flex-col">
      <div className="overflow-auto h-full flex-grow">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-1/4">Ապրանք</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 w-[15%]">Տեսակ և Խումբ</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right w-[15%]">Առկա մնացորդ</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right w-[12%]">Մինիմալ շեմ</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right w-[15%]"> Սպառում </th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-center w-[12%]">Կարգավիճակ</th>
              <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right w-[6%]">Գործողություններ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((item) => {
              // Critical Business Logic Check
              const isAlert = applyThresholdsAndExpenses && item.minThreshold > 0 && item.quantity <= item.minThreshold;
              
              const coverageDaysRaw = applyThresholdsAndExpenses ? calculateAnalytics(item.quantity, item.dailyExpense) : null;
              const isExpenseAlert = applyThresholdsAndExpenses && coverageDaysRaw !== '∞' && coverageDaysRaw < item.expenseNotifyDays;

              // Row Highlights
              let rowClasses = 'bg-white hover:bg-slate-50 transition-colors';
              if (isAlert) {
                rowClasses = 'bg-red-50 hover:bg-red-100/50 transition-colors border-red-200';
              } else if (isExpenseAlert) {
                rowClasses = 'bg-amber-50 hover:bg-amber-100/50 transition-colors border-amber-200';
              }

              // Text Highlights
              const qtyClasses = isAlert 
                ? 'text-red-700 font-bold' 
                : 'text-slate-800 font-semibold';

              // Status Badge Logic
              let StatusBadge;
              if (item.quantity === 0 && (!applyThresholdsAndExpenses || item.minThreshold > 0)) {
                // Out of stock
                StatusBadge = (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                    <AlertCircle size={14} /> Սպառված է
                  </span>
                );
              } else if (isAlert) {
                StatusBadge = (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                    <AlertTriangle size={14} /> Քիչ քանակ
                  </span>
                );
              } else if (item.quantity === 0 && applyThresholdsAndExpenses && item.minThreshold === 0) {
                // Not an error, just sitting at 0 with 0 threshold.
                StatusBadge = (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                    Դատարկ
                  </span>
                );
              } else if (isExpenseAlert) {
                StatusBadge = (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                    <Clock size={14} /> Մոտենում է սպառման
                  </span>
                );
              } else {
                StatusBadge = (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                    <CheckCircle2 size={14} /> Բավարար է
                  </span>
                );
              }

              return (
                <tr key={item.id} className={rowClasses}>
                  {/* Item Details */}
                  <td className="p-4">
                    <div className="font-bold text-slate-800 mb-1 line-clamp-2" title={item.name}>{item.name}</div>
                    <div className="font-mono text-xs text-slate-500 font-medium bg-slate-100 inline-block px-1.5 rounded">{item.code}</div>
                  </td>
                  
                  {/* Type & Category */}
                  <td className="p-4 align-top">
                    <div className="text-sm font-semibold text-slate-700">{item.type}</div>
                    <div className="text-xs text-slate-500 mt-1">{item.category} / {item.categoryType}</div>
                  </td>

                  {/* Current Stock */}
                  <td className={`p-4 text-right align-top ${qtyClasses}`}>
                    <div className="text-lg tabular-nums flex items-baseline justify-end gap-1.5">
                      <span>{item.quantity}</span>
                      <span className="text-xs font-normal text-slate-500 uppercase">{item.unit}</span>
                    </div>
                  </td>

                  {/* Min Threshold (Editable only if applies) */}
                  <td className="p-4 align-top text-right">
                    {applyThresholdsAndExpenses ? (
                      <div className="flex justify-end relative">
                        <input 
                          type="number"
                          min="0"
                          title="Մինիմալ շեմ"
                          disabled={isArchiveMode}
                          className={`w-24 border border-slate-300 rounded block px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 tabular-nums text-slate-800 font-semibold ${isArchiveMode ? 'opacity-60 bg-slate-100 cursor-not-allowed' : ''}`}
                          value={item.minThreshold}
                          onChange={(e) => onThresholdChange(item.id, e.target.value)}
                        />
                      </div>
                    ) : (
                      <div className="text-slate-400 text-sm">--</div>
                    )}
                  </td>

                  {/* Analytics */}
                  <td className="p-4 text-right align-top">
                    {applyThresholdsAndExpenses ? (
                      <>
                        <div className="text-slate-800 font-bold tabular-nums">
                          {coverageDaysRaw} {coverageDaysRaw !== '∞' ? 'օր' : ''}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {item.dailyExpense} {item.unit}/օր միջին
                        </div>
                      </>
                    ) : (
                      <div className="text-slate-400 text-sm">--</div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="p-4 text-center align-middle whitespace-nowrap">
                    {StatusBadge}
                  </td>

                  {/* Actions */}
                  <td className="p-4 text-right align-middle">
                    <div className="flex justify-end">
                      <button 
                        onClick={() => onTransferRow(item)}
                        title="Տեղափոխել ապրանքը"
                        disabled={isArchiveMode}
                        className={`p-2 rounded-lg transition-colors border shadow-sm ${
                          isArchiveMode 
                            ? 'text-slate-400 border-slate-200 bg-slate-50 cursor-not-allowed opacity-60' 
                            : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-blue-100 hover:border-blue-200'
                        }`}
                      >
                        <ArrowRightLeft size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="p-8 text-center text-slate-500 font-medium bg-slate-50/50">
            Այս պայմաններին համապատասխանող ապրանքներ չեն գտնվել:
          </div>
        )}
      </div>
    </div>
  );
}
