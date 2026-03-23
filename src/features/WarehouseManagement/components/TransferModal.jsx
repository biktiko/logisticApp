import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { WAREHOUSE_OPTIONS } from '../../../data/mockData';

export default function TransferModal({ isOpen, onClose, selectedItem, onConfirm, activeWarehouse }) {
  const [quantity, setQuantity] = useState('');
  
  // Dynamic destination options based on source warehouse (activeWarehouse)
  const getAvailableDestinations = () => {
    let options = [...WAREHOUSE_OPTIONS];

    if (activeWarehouse === 'Խոտանման պահեստ') {
      options.push('Վերջնական դուրսգրում (Խոտանում)');
    }
    if (activeWarehouse === 'Վերամշակման պահեստ') {
      // Custom workflow for Reprocessing warehouse
      return [
        'Վերամշակած (Տեղափոխել պահեստ)',
        'Խոտանված (Դեպի Խոտանման պահեստ)'
      ];
    }
    
    return options.filter(w => w !== activeWarehouse);
  };

  const [destinationOptions, setDestinationOptions] = useState([]);
  const [destination, setDestination] = useState('');
  
  // Specific fields for certain actions
  const [purpose, setPurpose] = useState('');
  const [comment, setComment] = useState('');

  // When modal options change, select the first one by default
  useEffect(() => {
    if (isOpen) {
      const opts = getAvailableDestinations();
      setDestinationOptions(opts);
      setDestination(opts[0] || '');
      setQuantity('');
      setPurpose('');
      setComment('');
    }
  }, [isOpen, activeWarehouse]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!quantity || isNaN(quantity) || Number(quantity) <= 0) return;
    
    // Validate purpose for Disposal warehouse
    if (destination === 'Օտարման պահեստ' && !purpose.trim()) {
      alert("Խնդրում ենք նշել օտարման նպատակը: / Please provide a disposal purpose.");
      return;
    }

    onConfirm({
      item: selectedItem,
      quantity: Number(quantity),
      destination,
      purpose: destination === 'Օտարման պահեստ' ? purpose : undefined,
      comment
    });
  };

  const isRecyclingDest = destination === 'Վերամշակման պահեստ';
  const isDisposalDest = destination === 'Օտարման պահեստ';
  const isFinalWriteOff = destination === 'Վերջնական դուրսգրում (Խոտանում)';

  let submitText = 'Հաստատել';
  if (isRecyclingDest) submitText = 'Ստեղծել հարցում / Թասկ';
  else if (isFinalWriteOff) submitText = 'Դուրս գրել համակարգից';
  else if (activeWarehouse === 'Վերամշակման պահեստ') submitText = 'Հաստատել գործողությունը';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className={`flex justify-between items-center px-6 py-4 border-b ${isFinalWriteOff ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}>
          <h2 className="text-lg font-bold text-slate-800">
            {activeWarehouse === 'Վերամշակման պահեստ' ? 'Արտադրամասի գործողություն (Վերամշակում)' : 'Պաշարների տեղափոխում / Ելք'}
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6">
          <form id="transfer-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
            {selectedItem && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Ընտրված ապրանք</label>
                <div className="bg-slate-100 border border-slate-200 rounded-lg p-3 text-slate-700">
                  <span className="font-bold">{selectedItem.name}</span>
                  <div className="text-xs text-slate-500 mt-1">Կոդ: {selectedItem.code} • Հասանելի քանակ: {selectedItem.quantity} {selectedItem.unit}</div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Նպատակակետ պահեստ</label>
              <select 
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800 font-medium bg-white"
              >
                {destinationOptions.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
              {isRecyclingDest && (
                <div className="flex items-start gap-1.5 mt-2 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-100">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                  <span>Այս գործողությունը կստեղծի թասկ արտադրամասի պետի համար՝ ապրանքը վերամշակելու կամ խոտանելու նպատակով:</span>
                </div>
              )}
              {isFinalWriteOff && (
                <div className="flex items-start gap-1.5 mt-2 text-xs text-red-700 bg-red-50 p-2 rounded border border-red-100">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                  <span>Ուշադրություն: Այս գործողությունը վերջնական կհեռացնի ընտրված քանակությունը համակարգի մնացորդներից:</span>
                </div>
              )}
            </div>

            {/* Extra field for Disposal Warehouse (Օտարման պահեստ) */}
            {isDisposalDest && (
              <div>
                <label className="block text-sm font-semibold text-red-600 mb-1">Օտարման նպատակ <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Նշեք օտարման նպատակը... (օրինակ՝ Նմուշառում, Թեստավորում...)"
                  className="w-full border border-red-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-slate-800"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Քանակ</label>
              <div className="flex relative">
                <input 
                  type="number" 
                  min="0"
                  step="0.01"
                  max={selectedItem ? selectedItem.quantity : undefined}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder={`Մուտքագրեք քանակը...`}
                  className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all pr-12 text-slate-800 tabular-nums"
                  required
                />
                {selectedItem && (
                  <span className="absolute right-3 top-2.5 text-slate-400 text-sm">{selectedItem.unit}</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Մեկնաբանություն</label>
              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ավելացրեք նշումներ կամ մեկնաբանություն..."
                rows={2}
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-800 resize-none"
              />
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 mt-auto">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
          >
            Անվավեր
          </button>
          <button 
            type="submit"
            form="transfer-form"
            className={`px-5 py-2 font-medium rounded-lg transition-colors shadow-sm text-white
              ${isFinalWriteOff ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}
            `}
          >
            {submitText}
          </button>
        </div>
      </div>
    </div>
  );
}
