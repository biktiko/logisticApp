import React, { useState, useMemo } from 'react';
import { Calendar, Download, Save, Send, CheckCircle, XCircle } from 'lucide-react';
import { PRODUCTION_PRODUCTS, BOM_CONFIGURATION } from '../../data/mockData';
import PlanGrid from './components/PlanGrid';

export default function WeeklyPlanManager({ activeRole }) {
  const [activePlanId, setActivePlanId] = useState('CURRENT_WEEK');
  
  // Basic mock state structure for a weekly plan
  const [plans, setPlans] = useState({
    'CURRENT_WEEK': {
      id: 'CURRENT_WEEK',
      title: 'Շաբաթվա պլան (23-29 Մարտ 2026)',
      status: 'Հաստատման ենթակա', // 'Հաստատման ենթակա', 'Հաստատված է', 'Փոփոխման ենթակա'
      rejectionReason: '',
      data: PRODUCTION_PRODUCTS.reduce((acc, p) => {
        acc[p.id] = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0, actualProduced: 120 };
        return acc;
      }, {})
    }
  });

  const activePlan = plans[activePlanId];
  
  // Roles
  const isTypeResp = activeRole === 'Տեսակի պատասխանատու';
  const isProdHead = activeRole === 'Արտադրամասի պետ';

  const isReadOnly = activePlan.status === 'Հաստատված է' || !isTypeResp; // Only Type Resp can edit inputs (when not approved)

  const handleDayChange = (productId, day, value) => {
    if (isReadOnly) return;
    const parsed = value === '' ? 0 : Number(value);
    setPlans(prev => ({
      ...prev,
      [activePlanId]: {
        ...prev[activePlanId],
        data: {
          ...prev[activePlanId].data,
          [productId]: {
            ...prev[activePlanId].data[productId],
            [day]: Math.max(0, parsed)
          }
        }
      }
    }));
  };

  const handleExport = () => {
    alert('Plan exported to Excel successfully!');
  };

  const handleSendOrApprove = () => {
    if (isTypeResp) {
      setPlans(prev => ({
        ...prev,
        [activePlanId]: { ...prev[activePlanId], status: 'Հաստատման ենթակա', rejectionReason: '' }
      }));
      alert('Պլանը ուղարկվել է արտադրամասի պետի հաստատմանը:');
    } else if (isProdHead) {
      setPlans(prev => ({
        ...prev,
        [activePlanId]: { ...prev[activePlanId], status: 'Հաստատված է' }
      }));
      alert('Պլանը հաստատվել է: Պատվերները փոխանցվել են արտադրամաս:');
    }
  };

  const handleReject = () => {
    const reason = prompt("Նշել մերժման պատճառը:");
    if (!reason) return;
    setPlans(prev => ({
      ...prev,
      [activePlanId]: { ...prev[activePlanId], status: 'Փոփոխման ենթակա', rejectionReason: reason }
    }));
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      <div className="flex items-center justify-between bg-white border-b border-slate-200 px-8 py-4 z-10 shadow-sm">
        <div className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity">
          <Calendar className="text-blue-600" size={24} />
          <h1 className="text-xl font-bold tracking-tight text-slate-800">
            {activePlan.title}
          </h1>
          <span className={`text-xs ml-2 px-2.5 py-1 rounded-full border font-semibold tracking-wide ${
            activePlan.status === 'Հաստատված է' ? 'bg-green-100 text-green-800 border-green-200' :
            activePlan.status === 'Փոփոխման ենթակա' ? 'bg-red-100 text-red-800 border-red-200' :
            'bg-amber-100 text-amber-800 border-amber-200' // 'Հաստատման ենթակա'
          }`}>
            {activePlan.status}
          </span>
        </div>

        <div className="flex items-center gap-3">

          <button 
            title="Արտահանել Excel"
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-600 border border-slate-300 bg-white hover:bg-slate-50 rounded-lg transition-colors"
          >
            <Download size={16} /> Արտահանել
          </button>

          {/* Type Responsible Action */}
          {isTypeResp && activePlan.status !== 'Հաստատված է' && activePlan.status !== 'Հաստատման ենթակա' && (
             <button 
               onClick={handleSendOrApprove}
               className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-md shadow-blue-200"
             >
               <Send size={16} /> Ուղարկել Հաստատման
             </button>
          )}

          {/* Production Head Actions */}
          {isProdHead && activePlan.status === 'Հաստատման ենթակա' && (
             <div className="flex gap-2">
               <button 
                 onClick={handleReject}
                 className="flex items-center gap-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-sm"
               >
                 <XCircle size={16} /> Մերժել
               </button>
               <button 
                 onClick={handleSendOrApprove}
                 className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-md shadow-green-200"
               >
                 <CheckCircle size={16} /> Հաստատել
               </button>
             </div>
          )}
        </div>
      </div>

      {activePlan.status === 'Փոփոխման ենթակա' && activePlan.rejectionReason && (
        <div className="mx-8 mt-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-3">
          <XCircle size={18} className="mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-semibold text-sm mb-0.5">Արտադրության պետը մերժել է պլանը</div>
            <div className="text-sm">Մեկնաբանություն: {activePlan.rejectionReason}</div>
          </div>
        </div>
      )}

      {activePlan.status === 'Հաստատված է' && (
        <div className="mx-8 mt-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-start gap-3">
          <CheckCircle size={18} className="mt-0.5 flex-shrink-0" />
          <div className="text-sm font-medium">Այս շաբաթվա պլանը հաստատված է և պասիվ պատվերները փոխանցվել են արտադրամաս:</div>
        </div>
      )}

      <PlanGrid 
        planData={activePlan.data} 
        onDayChange={handleDayChange} 
        isReadOnly={isReadOnly}
        bomConfig={BOM_CONFIGURATION}
        products={PRODUCTION_PRODUCTS}
      />
    </div>
  );
}
