import React, { useState, useMemo } from 'react';
import TopBar from './components/TopBar';
import DataTable from './components/DataTable';
import MovementsTable from './components/MovementsTable';
import TransferModal from './components/TransferModal';
import { INITIAL_STOCK, WAREHOUSE_OPTIONS, INITIAL_TICKETS } from '../../data/mockData';

export default function WarehouseManagement({ activeRole, onNavigate, unreadCount }) {
  const [items, setItems] = useState(INITIAL_STOCK);
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Role-based visibility logic
  const visibleWarehouses = useMemo(() => {
    switch(activeRole) {
      case 'Սուպերադմին':
      case 'Գլխավոր պահեստապետ':
        return WAREHOUSE_OPTIONS;
      case 'Տեսակի պատասխանատու':
        return ['Տեսակի հումքի պահեստ', 'Վաճառքի պահեստ'];
      case 'Պատրաստի արտադրանքի պատասխանատու':
        return ['Վաճառքի պահեստ', 'Օտարման պահեստ'];
      case 'Հումքի պատասխանատու':
        return ['Գլխավոր հումքի պահեստ', 'Տեսակի հումքի պահեստ'];
      case 'Արտադրամասի պետ':
      case 'Արտադրամասի աշխատակից':
        return ['Արտադրամաս', 'Վերամշակման պահեստ'];
      default:
        return WAREHOUSE_OPTIONS; // Fallback
    }
  }, [activeRole]);

  const [activeWarehouse, setActiveWarehouse] = useState(visibleWarehouses[0]);

  // Sync active warehouse if role changes and the current one is no longer visible
  React.useEffect(() => {
    if (!visibleWarehouses.includes(activeWarehouse)) {
      setActiveWarehouse(visibleWarehouses[0]);
    }
  }, [activeRole, visibleWarehouses, activeWarehouse]);

  const [activeTab, setActiveTab] = useState('Պահեստ'); // 'Պահեստ' or 'Շարժեր'
  const [archiveDate, setArchiveDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedTransferItem, setSelectedTransferItem] = useState(null);

  // Archive logic (Read Only simulation)
  const isArchiveMode = archiveDate !== new Date().toISOString().split('T')[0];
  
  // Specific role restrictions
  // Prod Head/Employee can view only, no transfers allowed in Warehouses
  const isProdStaff = ['Արտադրամասի պետ', 'Արտադրամասի աշխատակից'].includes(activeRole);
  const isReadOnlyMode = isArchiveMode || isProdStaff;

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    status: '', // 'Ռիսկային', 'Նորմալ'
    movementType: '' // for movements tab (e.g. 'Մուտք', 'Ելք')
  });

  const filteredItems = useMemo(() => {
    let result = items;
    
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(lowerQuery) || 
        item.code.toLowerCase().includes(lowerQuery) ||
        item.category.toLowerCase().includes(lowerQuery)
      );
    }

    if (activeTab === 'Պահեստ') {
      if (filters.type) result = result.filter(item => item.type === filters.type);
      if (filters.category) result = result.filter(item => item.category === filters.category);
      if (filters.status) {
         if (filters.status === 'Ռիսկային') result = result.filter(item => item.quantity < item.minThreshold);
         if (filters.status === 'Նորմալ') result = result.filter(item => item.quantity >= item.minThreshold);
      }
    }
    return result;
  }, [items, searchQuery, filters, activeTab]);

  const filteredTickets = useMemo(() => {
    let result = tickets;
    if (activeTab === 'Շարժեր') {
       if (filters.movementType === 'Մուտք') {
          result = result.filter(t => t.destination === activeWarehouse);
       } else if (filters.movementType === 'Ելք') {
          result = result.filter(t => t.source === activeWarehouse);
       }
    }
    return result;
  }, [tickets, filters, activeWarehouse, activeTab]);

  const handleThresholdChange = (id, newVal) => {
    if (isReadOnlyMode) return;
    const parsed = newVal === '' ? 0 : Number(newVal);
    setItems((prev) => 
      prev.map(item => item.id === id ? { ...item, minThreshold: Math.max(0, parsed) } : item)
    );
  };

  const handleTransferRow = (item) => {
    if (isReadOnlyMode) return;
    setSelectedTransferItem(item);
    setIsTransferModalOpen(true);
  };

  const handleNewTransfer = () => {
    if (isReadOnlyMode) return;
    setSelectedTransferItem(null); 
    setIsTransferModalOpen(true);
  };

  const handleConfirmTransfer = (transferData) => {
    const { item, quantity, destination, purpose, comment } = transferData;
    
    // Auto-approve logic based on specific flows (e.g., Disposal or Write-off)
    const isAutoApproved = destination === 'Օտարման պահեստ' || destination.includes('Վերջնական');
    
    const newTicket = {
      id: `TR-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString(),
      item: { name: item?.name || 'Անհայտ', code: item?.code || '', unit: item?.unit || '' },
      quantity,
      source: activeWarehouse,
      destination,
      purpose,
      comment,
      status: isAutoApproved ? 'approved' : 'pending',
    };

    setTickets([newTicket, ...tickets]);

    // If auto-approved, deduct from current stock immediately (mock DB sync)
    if (isAutoApproved && item) {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: Math.max(0, i.quantity - quantity) } : i));
      alert(`Ավտոմատ հաստատված գործողություն. ${quantity} ${item.unit} դուրսգրվել / տեղափոխվել է:`);
    } else {
      alert(`Ստեղծվել է նոր հարցում / Ticket. Սպասում է ${destination} պատասխանատուի հաստատմանը:`);
    }
    
    setIsTransferModalOpen(false);
    setSelectedTransferItem(null);
  };

  // Called when receiver responds to ticket
  const handleTicketAction = (id, action) => {
    if (isReadOnlyMode) return;

    if (action === 'reject') {
      const reason = prompt("Մուտքագրեք մերժման պատճառը / մեկնաբանությունը:");
      if (!reason) return; // Rejection requires comment per rules
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'rejected', rejectReason: reason } : t));
    } else if (action === 'approve') {
      let movedQuantity = 0;
      let movedItemCode = '';
      
      setTickets(prev => prev.map(t => {
        if (t.id === id) {
          movedQuantity = t.quantity;
          movedItemCode = t.item.code;
          return { ...t, status: 'approved' };
        }
        return t;
      }));

      // Deduct from total global stock to mock receiving it
      if (movedItemCode && movedQuantity > 0) {
        setItems(prev => prev.map(i => i.code === movedItemCode ? { ...i, quantity: Math.max(0, i.quantity - movedQuantity) } : i));
      }
    }
  };

  return (
    <div className="h-full relative">
      <div className="flex flex-col h-full relative">
        <TopBar 
          onNewTransfer={handleNewTransfer}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeWarehouse={activeWarehouse}
          setActiveWarehouse={setActiveWarehouse}
          visibleWarehouses={visibleWarehouses}
          archiveDate={archiveDate}
          setArchiveDate={setArchiveDate}
          isReadOnlyMode={isReadOnlyMode}
          onNavigate={onNavigate}
          unreadCount={unreadCount}
          onToggleFilter={() => setShowFilters(!showFilters)}
          showFilter={showFilters}
        />
        
        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-white border-b border-slate-200 px-8 py-4 shadow-sm z-20 flex gap-6 animate-in slide-in-from-top-2">
            {activeTab === 'Պահեստ' ? (
              <React.Fragment>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Տիպ</label>
                  <select 
                    value={filters.type} 
                    onChange={e => setFilters({...filters, type: e.target.value})}
                    className="bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 py-1.5 px-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
                  >
                    <option value="">Բոլորը</option>
                    <option value="Հումք">Հումք</option>
                    <option value="Պատրաստի արտադրանք">Պատրաստի</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Կատեգորիա</label>
                  <select 
                    value={filters.category} 
                    onChange={e => setFilters({...filters, category: e.target.value})}
                    className="bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 py-1.5 px-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 min-w-[160px]"
                  >
                    <option value="">Բոլորը</option>
                    <option value="Փաթեթավորում">Փաթեթավորում</option>
                    <option value="Հումք">Հումք</option>
                    <option value="Հեղուկներ">Հեղուկներ</option>
                    <option value="Տպագրական">Տպագրական</option>
                    <option value="Պատրաստի արտադրանք">Պատրաստի արտադրանք</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Կարգավիճակ</label>
                  <select 
                    value={filters.status} 
                    onChange={e => setFilters({...filters, status: e.target.value})}
                    className="bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 py-1.5 px-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
                  >
                    <option value="">Բոլորը</option>
                    <option value="Նորմալ">Նորմալ</option>
                    <option value="Ռիսկային">Ռիսկային (պակասորդ)</option>
                  </select>
                </div>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Տեղափոխության տիպ</label>
                  <select 
                    value={filters.movementType} 
                    onChange={e => setFilters({...filters, movementType: e.target.value})}
                    className="bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 py-1.5 px-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
                  >
                    <option value="">Ամբողջը</option>
                    <option value="Մուտք">Մուտք (+)</option>
                    <option value="Ելք">Ելք (−)</option>
                  </select>
                </div>
              </React.Fragment>
            )}

            <div className="ml-auto flex items-end">
              <button 
                onClick={() => setFilters({ type: '', category: '', status: '', movementType: '' })}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest px-4 py-2 bg-blue-50 rounded-lg"
              >
                Մաքրել Ֆիլտրերը
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-8 pt-4 pb-0 bg-white border-b border-slate-200 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02)] z-10 flex gap-4">
          <button 
            className={`pb-3 px-2 border-b-2 font-medium transition-colors ${activeTab === 'Պահեստ' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            onClick={() => setActiveTab('Պահեստ')}
          >
            Պահեստ
          </button>
          <button 
            className={`pb-3 px-2 border-b-2 font-medium transition-colors ${activeTab === 'Շարժեր' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
            onClick={() => setActiveTab('Շարժեր')}
          >
             Տեղափոխություններ
          </button>
        </div>

        {/* Tab Content Area */}
        {activeTab === 'Պահեստ' ? (
          <DataTable 
            items={filteredItems}
            onThresholdChange={handleThresholdChange}
            onTransferRow={handleTransferRow}
            activeWarehouse={activeWarehouse}
            isArchiveMode={isReadOnlyMode}
          />
        ) : (
          <MovementsTable 
            tickets={filteredTickets} 
            activeWarehouse={activeWarehouse}
            onAction={handleTicketAction}
            isArchiveMode={isReadOnlyMode}
          />
        )}

        <TransferModal 
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          selectedItem={selectedTransferItem}
          onConfirm={handleConfirmTransfer}
          activeWarehouse={activeWarehouse}
        />
      </div>
    </div>
  );
}
