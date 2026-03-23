import React, { useState, useMemo } from 'react';
import {
  BarChart3, FileDown, ChevronRight, Calendar, Factory, Boxes,
  PackageSearch, TrendingUp, AlertTriangle, RotateCcw, ShoppingCart,
  Filter, FlaskConical, Shield
} from 'lucide-react';
import {
  INITIAL_STOCK, BOM_CONFIGURATION, PRODUCTION_PRODUCTS,
  INITIAL_SOURCING_ORDERS, MOCK_SALES_MANAGERS
} from '../../data/mockData';

// ─── Mock data used as report rows ───────────────────────────────────────────
const MOCK_PRODUCTION_RUNS = [
  { id: 'PRD-2024-001', date: '2026-03-20', product: 'Արևածաղիկ 100գ աղի', planned: 500, actual: 50, unit: 'հատ', rawUsed: [{ name: 'Արևածաղիկ', qty: 5, unit: 'կգ' }, { name: 'Աղ', qty: 1, unit: 'կգ' }] },
  { id: 'PRD-2024-002', date: '2026-03-21', product: 'Արևածաղիկ 100գ դասական', planned: 1000, actual: 800, unit: 'հատ', rawUsed: [{ name: 'Արևածաղիկ', qty: 80, unit: 'կգ' }, { name: 'Թաղանթ', qty: 40, unit: 'կգ' }] },
];
const MOCK_WEEKLY_PLANS = [
  { week: '2026-W12', product: 'Արևածաղիկ 100գ աղի', planned: 500, actual: 50, variance: -450, unit: 'հատ', status: 'Ընթացքի մեջ' },
  { week: '2026-W11', product: 'Արևածաղիկ 100գ դասական', planned: 1000, actual: 800, variance: -200, unit: 'հատ', status: 'Կատարված' },
  { week: '2026-W10', product: 'Պանրով Չիպս', planned: 300, actual: 300, variance: 0, unit: 'հատ', status: 'Կատարված' },
];
const MOCK_INVENTORY_RESULTS = [
  { id: 'INV-2024-001', date: '2026-03-22', warehouse: 'Տեսակի հումքի պահեստ', approver: 'Գլխ. Պահ.', items: [{ name: 'Արևածաղիկ', sys: 500, actual: 512, diff: +12, unit: 'կգ' }], status: 'Հաստատված' },
];
const MOCK_STOCK_MOVEMENT = [
  { code: 'A123', name: 'Արևածաղիկ', opening: 600, in: 500, out: 80, transfer: 0, closing: 512, unit: 'կգ' },
  { code: 'A124', name: 'Թաղանթ', opening: 400, in: 0, out: 40, transfer: 0, closing: 351, unit: 'կգ' },
  { code: 'B991', name: 'Աղ', opening: 0, in: 0, out: 0, transfer: 0, closing: 0, unit: 'կգ' },
  { code: 'B002', name: 'Պիտակ', opening: 3500, in: 10000, out: 500, transfer: 0, closing: 8500, unit: 'հատ' },
  { code: 'L005', name: 'Յուղ', opening: 70, in: 0, out: 20, transfer: 0, closing: 50, unit: 'լ' },
];
const MOCK_SALES_SUMMARY = [
  { id: 'ORD-001', date: '2026-03-18', product: 'Արևածաղիկ 100գ դասական', qty: 200, unit: 'տուփ', channel: 'Ներքին', country: 'ՀՀ', planned: 200, actual: 200 },
  { id: 'ORD-002', date: '2026-03-20', product: 'Արևածաղիկ 100գ աղի', qty: 150, unit: 'տուփ', channel: 'Արտահանում', country: 'ՌՖ', planned: 200, actual: 150 },
];
const MOCK_INBOUND_REPORT = [
  { ticket: 'REQ-2001', date: '2026-03-15', supplier: 'Ագրո ՍՊԸ', item: 'Արևածաղիկ', qty: 500, unit: 'կգ', status: 'Կատարված' },
  { ticket: 'REQ-2002', date: '2026-03-18', supplier: 'Տպ. Ձեռ.', item: 'Պիտակ', qty: 5000, unit: 'հատ', status: 'Մասնակի' },
];
// ─────────────────────────────────────────────────────────────────────────────

const REPORT_GROUPS = [
  {
    id: 'production',
    label: 'Արտ. և Պլանային',
    icon: Factory,
    color: 'blue',
    reports: [
      { id: 'prod_raw', label: 'Արտ. / Հումքի Ծախս', icon: FlaskConical },
      { id: 'weekly_exec', label: 'Շաբ. Պլան Կատ.', icon: Calendar },
      { id: 'inventory_res', label: 'Գույքագրման Արդ.', icon: Boxes },
    ]
  },
  {
    id: 'warehouse',
    label: 'Պահ. Շարժ / Մնացորդ',
    icon: Boxes,
    color: 'teal',
    reports: [
      { id: 'turnover', label: 'Ապ. Շրջանառություն', icon: RotateCcw },
      { id: 'balances', label: 'Մնացորդներ Ըստ Պ.', icon: PackageSearch },
      { id: 'inbound_rep', label: 'Ստացված Հումք', icon: ShoppingCart },
    ]
  },
  {
    id: 'sales',
    label: 'Վաճառք / Արտահ.',
    icon: TrendingUp,
    color: 'indigo',
    reports: [
      { id: 'sales_summary', label: 'Վաճ. Ամփոփ.', icon: TrendingUp },
      { id: 'export_detail', label: 'Արտ. Մանր.', icon: ShoppingCart },
    ]
  },
  {
    id: 'analytics',
    label: 'Անալիտ. / Ռիսկ',
    icon: AlertTriangle,
    color: 'orange',
    reports: [
      { id: 'expiry_risk', label: 'Ժ/Ա Ռիսկ', icon: AlertTriangle },
      { id: 'turnover_analysis', label: 'Շրջ. Անալիզ', icon: BarChart3 },
      { id: 'waste', label: 'Խոտան / Վերամ.', icon: RotateCcw },
    ]
  }
];

const COLOR = {
  blue:   { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', btn: 'bg-blue-600 hover:bg-blue-700', tag: 'bg-blue-100 text-blue-800' },
  teal:   { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', btn: 'bg-teal-600 hover:bg-teal-700', tag: 'bg-teal-100 text-teal-800' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', btn: 'bg-indigo-600 hover:bg-indigo-700', tag: 'bg-indigo-100 text-indigo-800' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', btn: 'bg-orange-500 hover:bg-orange-600', tag: 'bg-orange-100 text-orange-800' },
};

// Simple CSV export (simulates Excel)
function exportCSV(filename, headers, rows) {
  const csv = [headers.join(','), ...rows.map(r => r.map(v => `"${v}"`).join(','))].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsManager({ activeRole }) {
  const [activeReport, setActiveReport] = useState('prod_raw');
  const [dateFrom, setDateFrom] = useState('2026-03-01');
  const [dateTo, setDateTo] = useState('2026-03-23');

  const isChief = ['Սուպերադմին', 'Գլխավոր պահեստապետ'].includes(activeRole);
  const isTypeResp = activeRole === 'Տեսակի պատասխանատու';

  // Find colour for active group
  const activeGroup = REPORT_GROUPS.find(g => g.reports.some(r => r.id === activeReport));
  const c = COLOR[activeGroup?.color ?? 'blue'];

  return (
    <div className="flex h-full bg-[#f8fafc] overflow-hidden">
      {/* ── Left navigation ── */}
      <aside className="w-64 min-w-[256px] bg-white border-r border-slate-200 flex flex-col py-6 px-4 gap-6 overflow-y-auto flex-shrink-0">
        <div className="flex items-center gap-3 px-2 mb-2">
          <BarChart3 className="text-slate-500" size={22} />
          <h2 className="font-extrabold text-slate-700 tracking-tight">Հաշվետվություններ</h2>
        </div>

        {REPORT_GROUPS.map(group => {
          const GIcon = group.icon;
          const gc = COLOR[group.color];
          return (
            <div key={group.id}>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-1 ${gc.bg} ${gc.border} border`}>
                <GIcon size={15} className={gc.text} />
                <span className={`text-[11px] font-extrabold uppercase tracking-widest ${gc.text}`}>{group.label}</span>
              </div>
              {group.reports.map(r => {
                const RIcon = r.icon;
                const isActive = activeReport === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setActiveReport(r.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all mb-0.5
                      ${isActive ? `${gc.bg} ${gc.text} ${gc.border} border font-bold shadow-sm` : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                  >
                    <RIcon size={15} />
                    <span>{r.label}</span>
                    {isActive && <ChevronRight size={14} className="ml-auto opacity-60" />}
                  </button>
                );
              })}
            </div>
          );
        })}
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Filters bar */}
        <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center gap-6 flex-wrap flex-shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <Filter size={16} className="text-slate-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Ժ/Ա</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-sm">
            <Calendar size={14} className="text-slate-400" />
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-700 font-semibold text-sm" />
            <span className="text-slate-400">→</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-700 font-semibold text-sm" />
          </div>

          {!isChief && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-700">
              <Shield size={14} /> Ֆիլտրված ըստ Ձեր Տեսակի
            </div>
          )}

          <div className="ml-auto flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span className={`px-2.5 py-1 rounded-full ${c.tag} font-bold text-[10px] uppercase tracking-wider`}>
              {REPORT_GROUPS.flatMap(g => g.reports).find(r => r.id === activeReport)?.label}
            </span>
          </div>
        </div>

        {/* Report body */}
        <div className="flex-1 overflow-auto p-8">
          <ReportBody reportId={activeReport} dateFrom={dateFrom} dateTo={dateTo} activeRole={activeRole} c={c} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── Report Bodies ───────────────────────────────────
function ReportBody({ reportId, dateFrom, dateTo, activeRole, c }) {
  switch (reportId) {
    case 'prod_raw':      return <ProdRawReport     c={c} />;
    case 'weekly_exec':   return <WeeklyExecReport  c={c} />;
    case 'inventory_res': return <InventoryResReport c={c} />;
    case 'turnover':      return <TurnoverReport    c={c} />;
    case 'balances':      return <BalancesReport    c={c} />;
    case 'inbound_rep':   return <InboundReport     c={c} />;
    case 'sales_summary': return <SalesSummaryReport c={c} />;
    case 'export_detail': return <ExportDetailReport c={c} />;
    case 'expiry_risk':   return <ExpiryRiskReport  c={c} />;
    case 'turnover_analysis': return <TurnoverAnalysis c={c} />;
    case 'waste':         return <WasteReport       c={c} />;
    default:              return <div className="text-slate-400">Ընտրեք հաշվետվություն</div>;
  }
}

// ── Helper ──
function ReportWrapper({ title, description, onExport, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-slate-50/50">
        <div>
          <h2 className="font-extrabold text-slate-800 text-lg">{title}</h2>
          {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
        </div>
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-5 py-2 bg-slate-800 hover:bg-black text-white text-sm font-bold rounded-xl shadow transition-all"
        >
          <FileDown size={16} /> Ներբ. Excel/CSV
        </button>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

function Th({ children }) {
  return <th className="p-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-left border-b border-slate-100 bg-slate-50 whitespace-nowrap">{children}</th>;
}
function Td({ children, className='' }) {
  return <td className={`p-4 text-sm text-slate-700 border-b border-slate-50 ${className}`}>{children}</td>;
}

function DiffChip({ val }) {
  if (val === 0) return <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded font-bold text-xs">0</span>;
  return val > 0
    ? <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded font-bold text-xs">+{val}</span>
    : <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded font-bold text-xs">{val}</span>;
}

// ─── A. Production / Raw Usage ─────────────────────────────────────────────
function ProdRawReport({ c }) {
  const doExport = () => exportCSV('production_raw', ['ID','Ամս.','Պրոդ.','Պլ.','Փաստ.','Հ/Մ','Հումք','Ծախս'],
    MOCK_PRODUCTION_RUNS.flatMap(r => r.rawUsed.map(u => [r.id, r.date, r.product, r.planned, r.actual, r.unit, u.name, `${u.qty} ${u.unit}`])));
  return (
    <ReportWrapper title="Արտ. / Հումքի Ծախս" description="Փաստ. արտ. պրոդ. + ծախ. հումք ըստ BOM-ի" onExport={doExport}>
      <table className="w-full min-w-[900px]">
        <thead><tr>
          <Th>ID</Th><Th>Ամսաթիվ</Th><Th>Պրոդուկտ</Th><Th>Պլ.</Th><Th>Փաստ.</Th>
          <Th>Կատ.%</Th><Th>Ծախ. Հումք</Th>
        </tr></thead>
        <tbody>
          {MOCK_PRODUCTION_RUNS.map(r => (
            <tr key={r.id} className="hover:bg-slate-50 group">
              <Td><span className="font-mono font-bold text-slate-600">{r.id}</span></Td>
              <Td>{r.date}</Td>
              <Td><span className="font-semibold">{r.product}</span></Td>
              <Td><span className="font-bold text-slate-800">{r.planned} {r.unit}</span></Td>
              <Td><span className="font-bold text-blue-700">{r.actual} {r.unit}</span></Td>
              <Td>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{width:`${Math.min(100,Math.round(r.actual/r.planned*100))}%`}} />
                  </div>
                  <span className="font-bold text-sm">{Math.round(r.actual/r.planned*100)}%</span>
                </div>
              </Td>
              <Td>
                <div className="flex flex-col gap-1">
                  {r.rawUsed.map((u,i) => (
                    <span key={i} className="text-xs bg-slate-100 px-2 py-0.5 rounded font-medium w-max">{u.name}: <b>{u.qty} {u.unit}</b></span>
                  ))}
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </ReportWrapper>
  );
}

// ─── A2. Weekly Plan Execution ────────────────────────────────────────────
function WeeklyExecReport({ c }) {
  const doExport = () => exportCSV('weekly_plan', ['Շ/Ա','Պրոդ.','Պլ.','Փաստ.','Շ/Ն','Կ/Ն'],
    MOCK_WEEKLY_PLANS.map(r => [r.week, r.product, r.planned, r.actual, r.variance, r.status]));
  return (
    <ReportWrapper title="Շաբ. Պլան Կատ." description="Պլ. vs Փաստ. համեմատ. + Excel" onExport={doExport}>
      <table className="w-full min-w-[700px]">
        <thead><tr><Th>Շաբ.</Th><Th>Պրոդ.</Th><Th>Պլ.</Th><Th>Փաստ.</Th><Th>Շ/Ն</Th><Th>Կ/Ն</Th></tr></thead>
        <tbody>
          {MOCK_WEEKLY_PLANS.map((r,i) => (
            <tr key={i} className="hover:bg-slate-50">
              <Td><span className="font-mono font-bold text-slate-500">{r.week}</span></Td>
              <Td><span className="font-semibold">{r.product}</span></Td>
              <Td><b>{r.planned} {r.unit}</b></Td>
              <Td><b className="text-blue-700">{r.actual} {r.unit}</b></Td>
              <Td><DiffChip val={r.variance} /></Td>
              <Td>
                <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${r.status==='Կատարված'?'bg-green-100 text-green-700':'bg-amber-100 text-amber-700'}`}>
                  {r.status}
                </span>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </ReportWrapper>
  );
}

// ─── A3. Inventory results ────────────────────────────────────────────────
function InventoryResReport({ c }) {
  const doExport = () => exportCSV('inventory_results', ['ID','Ամս.','Պ/ՏÙ','Ապ.','Հ/Ն','Փ/Ն','Տ/Ն','Կ/Ն'],
    MOCK_INVENTORY_RESULTS.flatMap(r => r.items.map(i => [r.id, r.date, r.warehouse, i.name, i.sys, i.actual, i.diff, r.status])));
  return (
    <ReportWrapper title="Գույք. Արդ." description="Ավ./պ. + Գ.Պ. հաստ. ուղղ." onExport={doExport}>
      <table className="w-full min-w-[800px]">
        <thead><tr><Th>ID</Th><Th>Ամս.</Th><Th>Պ. Տ.</Th><Th>Ապ.</Th><Th>Հ/Ն</Th><Th>Փ/Ն</Th><Th>Տ/Ն</Th><Th>Կ/Ն</Th></tr></thead>
        <tbody>
          {MOCK_INVENTORY_RESULTS.flatMap((r,ri) => r.items.map((item,ii) => (
            <tr key={`${ri}-${ii}`} className="hover:bg-slate-50">
              <Td><span className="font-mono font-bold text-slate-500 text-xs">{r.id}</span></Td>
              <Td>{r.date}</Td>
              <Td className="text-slate-500">{r.warehouse}</Td>
              <Td><b>{item.name}</b></Td>
              <Td>{item.sys} {item.unit}</Td>
              <Td><b className="text-blue-700">{item.actual} {item.unit}</b></Td>
              <Td><DiffChip val={item.diff} /></Td>
              <Td>
                <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${r.status==='Հաստատված'?'bg-teal-100 text-teal-700':'bg-amber-100 text-amber-700'}`}>
                  {r.status}
                </span>
              </Td>
            </tr>
          )))}
        </tbody>
      </table>
    </ReportWrapper>
  );
}

// ─── B1. Stock Turnover ────────────────────────────────────────────────────
function TurnoverReport({ c }) {
  const doExport = () => exportCSV('stock_turnover', ['Կոդ','Ապ.','Բ/Մ','Մ.','Ե.','Տ.','Վ/Մ','Հ/Մ'],
    MOCK_STOCK_MOVEMENT.map(r => [r.code, r.name, r.opening, r.in, r.out, r.transfer, r.closing, r.unit]));
  return (
    <ReportWrapper title="Ապ. Շ." description="Բ/Մ, Մ., Ե., Տ., Վ/Մ ըստ Կ. / Ապ. մ." onExport={doExport}>
      <table className="w-full min-w-[900px]">
        <thead><tr>
          <Th>Կոդ</Th><Th>Ապ. Անուն</Th>
          <Th className="text-right">Բ/Մ</Th>
          <Th className="text-right bg-green-50">Մ. (+)</Th>
          <Th className="text-right bg-red-50">Ե. (−)</Th>
          <Th className="text-right">Տ.</Th>
          <Th className="text-right font-extrabold">Վ/Մ</Th>
          <Th>Հ/Մ</Th>
        </tr></thead>
        <tbody>
          {MOCK_STOCK_MOVEMENT.map((r,i) => (
            <tr key={i} className="hover:bg-slate-50">
              <Td><span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded font-bold text-slate-600">{r.code}</span></Td>
              <Td><span className="font-semibold">{r.name}</span></Td>
              <Td className="text-right text-slate-500">{r.opening}</Td>
              <Td className="text-right font-bold text-green-700 bg-green-50/30">+{r.in}</Td>
              <Td className="text-right font-bold text-red-600 bg-red-50/30">−{r.out}</Td>
              <Td className="text-right text-slate-500">{r.transfer}</Td>
              <Td className="text-right font-extrabold text-blue-700 text-base">{r.closing}</Td>
              <Td className="text-slate-400">{r.unit}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </ReportWrapper>
  );
}

// ─── B2. Balances ─────────────────────────────────────────────────────────
function BalancesReport({ c }) {
  const doExport = () => exportCSV('balances', ['Կոդ','Ապ.','Մնաց.','Հ/Մ','Ն/Ս','Կ/Ն'],
    INITIAL_STOCK.map(r => [r.code, r.name, r.quantity, r.unit, r.minThreshold, r.quantity < r.minThreshold ? 'Ռիսկ':'OK']));
  return (
    <ReportWrapper title="Մնաց. Ըստ Պ." description="Ընթ. մ. + Ն/Ս + ռիսկ ազդ." onExport={doExport}>
      <table className="w-full min-w-[700px]">
        <thead><tr><Th>Կոդ</Th><Th>Ապ. Անուն</Th><Th>Տ.</Th><Th>Մ. Ն.</Th><Th>Հ/Մ</Th><Th>Ն/Ս</Th><Th>Ռ/Ն</Th></tr></thead>
        <tbody>
          {INITIAL_STOCK.map((item,i) => {
            const atRisk = item.quantity < item.minThreshold;
            return (
              <tr key={i} className={`hover:bg-slate-50 ${atRisk ? 'bg-red-50/30' : ''}`}>
                <Td><span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded font-bold">{item.code}</span></Td>
                <Td><span className="font-semibold">{item.name}</span></Td>
                <Td className="text-slate-400 text-xs">{item.type}</Td>
                <Td><span className="font-extrabold text-blue-700 text-base">{item.quantity}</span></Td>
                <Td className="text-slate-500">{item.unit}</Td>
                <Td className="text-slate-400">{item.minThreshold}</Td>
                <Td>
                  {atRisk
                    ? <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full w-max"><AlertTriangle size={12}/> Ռ</span>
                    : <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full w-max">OK</span>
                  }
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </ReportWrapper>
  );
}

// ─── B3. Inbound Report ───────────────────────────────────────────────────
function InboundReport({ c }) {
  const doExport = () => exportCSV('inbound', ['Ticket','Ամս.','Մ/Ն','Ապ.','Ք.','Հ/Մ','Կ/Ն'],
    MOCK_INBOUND_REPORT.map(r => [r.ticket, r.date, r.supplier, r.item, r.qty, r.unit, r.status]));
  return (
    <ReportWrapper title="Ստ. Հ/Ք" description="Մ/ն-ից ստ. հ. ըստ թ/ք. + մ/ն" onExport={doExport}>
      <table className="w-full min-w-[700px]">
        <thead><tr><Th>Ticket</Th><Th>Ամս.</Th><Th>Մ/Ն</Th><Th>Ապ.</Th><Th>Քան.</Th><Th>Կ/Ն</Th></tr></thead>
        <tbody>
          {MOCK_INBOUND_REPORT.map((r,i) => (
            <tr key={i} className="hover:bg-slate-50">
              <Td><span className="font-mono font-bold text-slate-500 text-xs">{r.ticket}</span></Td>
              <Td>{r.date}</Td>
              <Td><span className="font-semibold">{r.supplier}</span></Td>
              <Td>{r.item}</Td>
              <Td><b className="text-blue-700">{r.qty} {r.unit}</b></Td>
              <Td>
                <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${r.status==='Կատարված'?'bg-teal-100 text-teal-700':'bg-amber-100 text-amber-700'}`}>
                  {r.status}
                </span>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </ReportWrapper>
  );
}

// ─── C1. Sales Summary ────────────────────────────────────────────────────
function SalesSummaryReport({ c }) {
  const doExport = () => exportCSV('sales_summary', ['ID','Ամս.','Պ.','Ք.','Հ/Մ','Կ.','Երկ.','Պլ.','Փ.'],
    MOCK_SALES_SUMMARY.map(r => [r.id, r.date, r.product, r.qty, r.unit, r.channel, r.country, r.planned, r.actual]));
  return (
    <ReportWrapper title="Վ. Ամ." description="Ն/Ա + Արտ. վ. + Պլ. vs Փ. բ." onExport={doExport}>
      <table className="w-full min-w-[900px]">
        <thead><tr><Th>Պատ. ID</Th><Th>Ամս.</Th><Th>Պ.</Th><Th>Ք.</Th><Th>Կ.</Th><Th>Երկ.</Th><Th>Պլ.</Th><Th>Փ.</Th><Th>Շ/Ն</Th></tr></thead>
        <tbody>
          {MOCK_SALES_SUMMARY.map((r,i) => (
            <tr key={i} className="hover:bg-slate-50">
              <Td><span className="font-mono font-bold text-xs text-slate-500">{r.id}</span></Td>
              <Td>{r.date}</Td>
              <Td><b>{r.product}</b></Td>
              <Td><b className="text-indigo-700">{r.qty} {r.unit}</b></Td>
              <Td>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${r.channel==='Ներքին'?'bg-blue-100 text-blue-700':'bg-indigo-100 text-indigo-700'}`}>
                  {r.channel}
                </span>
              </Td>
              <Td className="text-slate-500">{r.country}</Td>
              <Td>{r.planned}</Td>
              <Td><b className="text-indigo-700">{r.actual}</b></Td>
              <Td><DiffChip val={r.actual - r.planned} /></Td>
            </tr>
          ))}
        </tbody>
      </table>
    </ReportWrapper>
  );
}

// ─── C2. Export Detail ────────────────────────────────────────────────────
function ExportDetailReport() {
  const rows = MOCK_SALES_SUMMARY.filter(r => r.channel === 'Արտահանում');
  const doExport = () => exportCSV('export_detail', ['ID','Ամս.','Պ.','Ք.','Հ/Մ','Երկ.'],
    rows.map(r => [r.id, r.date, r.product, r.qty, r.unit, r.country]));
  return (
    <ReportWrapper title="Արտ. Մ." description="Բ. ըստ ժ/հ, երկ. + գ/ն" onExport={doExport}>
      <table className="w-full min-w-[700px]">
        <thead><tr><Th>ID</Th><Th>Ամս.</Th><Th>Պ.</Th><Th>Ք.</Th><Th>Հ/Մ</Th><Th>Երկ.</Th></tr></thead>
        <tbody>
          {rows.length===0 ? <tr><td colSpan={6} className="text-center p-6 text-slate-400">Տ/Ա Ն/Ք</td></tr> : rows.map((r,i) => (
            <tr key={i} className="hover:bg-slate-50">
              <Td><span className="font-mono font-bold text-xs">{r.id}</span></Td>
              <Td>{r.date}</Td><Td><b>{r.product}</b></Td>
              <Td><b className="text-indigo-700">{r.qty} {r.unit}</b></Td>
              <Td>{r.unit}</Td><Td>{r.country}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </ReportWrapper>
  );
}

// ─── D1. Expiry Risk ──────────────────────────────────────────────────────
function ExpiryRiskReport() {
  const today = new Date('2026-03-23');
  const rows = INITIAL_STOCK.map(item => {
    const daysLeft = item.dailyExpense > 0 ? Math.floor(item.quantity / item.dailyExpense) : 999;
    return { ...item, daysLeft };
  }).filter(i => i.daysLeft < 30).sort((a,b) => a.daysLeft - b.daysLeft);
  const doExport = () => exportCSV('expiry_risk', ['Կ.','Ապ.','Մ/Ն','Հ/Մ','Ա/Ծ.','Ն/め'],
    rows.map(r => [r.code, r.name, r.quantity, r.unit, r.dailyExpense, r.daysLeft]));
  return (
    <ReportWrapper title="Ժ/Ա Ռ." description="Ա. ≤ 30 Ա/Ծ. ըստ մ/ն" onExport={doExport}>
      {rows.length === 0 ? <div className="p-8 text-center text-slate-400">Ռ/Ն ապ. չ/Կ (30+ Ա)</div> : (
        <table className="w-full min-w-[700px]">
          <thead><tr><Th>Կ.</Th><Th>Ապ.</Th><Th>Մ/Ն</Th><Th>Ա/Ծ./Օ.</Th><Th>Ն/め</Th><Th>Վ/Ն</Th></tr></thead>
          <tbody>
            {rows.map((r,i) => (
              <tr key={i} className={`hover:bg-slate-50 ${r.daysLeft<10?'bg-red-50/40':r.daysLeft<20?'bg-amber-50/40':''}`}>
                <Td><span className="font-mono text-xs font-bold bg-slate-100 px-2 rounded">{r.code}</span></Td>
                <Td><b>{r.name}</b></Td>
                <Td><b className={r.daysLeft<10?'text-red-600':r.daysLeft<20?'text-amber-600':'text-slate-700'}>{r.quantity} {r.unit}</b></Td>
                <Td>{r.dailyExpense}</Td>
                <Td>
                  <span className={`font-extrabold text-sm ${r.daysLeft<10?'text-red-600':r.daysLeft<20?'text-amber-600':'text-slate-700'}`}>
                    {r.daysLeft} Ա
                  </span>
                </Td>
                <Td>
                  {r.daysLeft<10 && <span className="text-[11px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">🔴 Կ/Ռ</span>}
                  {r.daysLeft>=10&&r.daysLeft<20 && <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">🟡 Զ/Ռ</span>}
                  {r.daysLeft>=20 && <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Ն/Ռ</span>}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </ReportWrapper>
  );
}

// ─── D2. Turnover Analysis (ABC) ──────────────────────────────────────────
function TurnoverAnalysis() {
  const sorted = [...INITIAL_STOCK].sort((a,b) => b.dailyExpense - a.dailyExpense);
  const total = sorted.reduce((s,i) => s + i.dailyExpense, 0);
  let cumul = 0;
  const withABC = sorted.map(item => {
    cumul += item.dailyExpense;
    const pct = total > 0 ? cumul / total * 100 : 0;
    const cls = pct <= 70 ? 'A' : pct <= 90 ? 'B' : 'C';
    return { ...item, pct: Math.round(pct), cls };
  });
  const doExport = () => exportCSV('turnover_abc', ['Կ.','Ապ.','Ա/Ծ.','Հ/Մ','ABC'],
    withABC.map(r => [r.code, r.name, r.dailyExpense, r.unit, r.cls]));
  return (
    <ReportWrapper title="Շ. Ան. (ABC)" description="Ա. ըստ ս/ն − A(70%), B(90%), C(100%)" onExport={doExport}>
      <table className="w-full min-w-[600px]">
        <thead><tr><Th>Կ.</Th><Th>Ապ.</Th><Th>Ա/Ծ./Օ.</Th><Th>Հ/Մ</Th><Th>Ա.%</Th><Th>ABC</Th></tr></thead>
        <tbody>
          {withABC.map((r,i) => (
            <tr key={i} className="hover:bg-slate-50">
              <Td><span className="font-mono text-xs font-bold bg-slate-100 px-2 rounded">{r.code}</span></Td>
              <Td><b>{r.name}</b></Td>
              <Td><b className="text-blue-700">{r.dailyExpense}</b></Td>
              <Td className="text-slate-400">{r.unit}</Td>
              <Td>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-20 bg-slate-100 rounded-full">
                    <div className="h-full bg-blue-500 rounded-full" style={{width:`${r.pct}%`}}/>
                  </div>
                  <span className="text-xs font-bold text-slate-500">{r.pct}%</span>
                </div>
              </Td>
              <Td>
                <span className={`px-3 py-1 rounded-full font-extrabold text-sm ${r.cls==='A'?'bg-green-100 text-green-700':r.cls==='B'?'bg-amber-100 text-amber-700':'bg-slate-100 text-slate-600'}`}>
                  {r.cls}
                </span>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </ReportWrapper>
  );
}

// ─── D3. Waste / Rework ───────────────────────────────────────────────────
function WasteReport() {
  const mock = [
    { date: '2026-03-15', product: 'Արևածաղիկ 100գ դ.', qty: 12, unit: 'հատ', reason: 'Ձ/Ա վ/ի', warehouse: 'Վ/Մ' },
    { date: '2026-03-20', product: 'Թաղ.', qty: 5, unit: 'կգ', reason: 'Վ/Բ', warehouse: 'Վ/Մ' },
  ];
  const doExport = () => exportCSV('waste', ['Ամս.','Ապ.','Ք.','Հ/Մ','Պ.','Պ/Ն'],
    mock.map(r => [r.date, r.product, r.qty, r.unit, r.reason, r.warehouse]));
  return (
    <ReportWrapper title="Խ. / Վ/Մ" description="Վ/Մ + Բ/Ա ապ. վ/ն" onExport={doExport}>
      <table className="w-full min-w-[700px]">
        <thead><tr><Th>Ամս.</Th><Th>Ապ.</Th><Th>Ք.</Th><Th>Հ/Մ</Th><Th>Պ.</Th><Th>Պ/Ն</Th></tr></thead>
        <tbody>
          {mock.map((r,i) => (
            <tr key={i} className="hover:bg-slate-50">
              <Td>{r.date}</Td><Td><b>{r.product}</b></Td>
              <Td><b className="text-orange-600">{r.qty}</b></Td>
              <Td>{r.unit}</Td>
              <Td className="text-slate-500 text-xs">{r.reason}</Td>
              <Td className="text-slate-400 text-xs">{r.warehouse}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </ReportWrapper>
  );
}
