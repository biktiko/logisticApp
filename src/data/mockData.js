export const INITIAL_STOCK = [
  {
    id: 'ITEM-001',
    code: 'A123',
    name: 'Արևածաղիկ 100գ աղի',
    unit: 'կգ',
    type: 'Հումք',
    category: 'Փաթեթավորում',
    categoryType: 'Քյուառով',
    quantity: 512,
    minThreshold: 400,
    dailyExpense: 50,
    expenseNotifyDays: 15,
  },
  {
    id: 'ITEM-002',
    code: 'A124',
    name: 'Թաղանթ',
    unit: 'կգ',
    type: 'Հումք',
    category: 'Փաթեթավորում',
    categoryType: 'Առանց քյուառի',
    quantity: 351,
    minThreshold: 400,
    dailyExpense: 50,
    expenseNotifyDays: 10,
  },
  {
    id: 'ITEM-003',
    code: 'B991',
    name: 'Աղ',
    unit: 'կգ',
    type: 'Հումք',
    category: 'Հումք',
    categoryType: 'Հիմնական',
    quantity: 0,
    minThreshold: 0,
    dailyExpense: 10,
    expenseNotifyDays: 5,
  },
  {
    id: 'ITEM-004',
    code: 'P001',
    name: 'Արևածաղիկ 100գ դասական',
    unit: 'տուփ',
    type: 'Պատրաստի արտադրանք',
    category: 'Պատրաստի արտադրանք',
    categoryType: 'Ստանդարտ',
    quantity: 1200,
    minThreshold: 500,
    dailyExpense: 150,
    expenseNotifyDays: 10,
  },
  {
    id: 'ITEM-005',
    code: 'L005',
    name: 'Յուղ',
    unit: 'լիտր',
    type: 'Հումք',
    category: 'Հեղուկներ',
    categoryType: 'Հիմնական',
    quantity: 50,
    minThreshold: 100,
    dailyExpense: 20,
    expenseNotifyDays: 5,
  },
  {
    id: 'ITEM-006',
    code: 'B002',
    name: 'Պիտակ',
    unit: 'հատ',
    type: 'Հումք',
    category: 'Տպագրական',
    categoryType: 'Ստանդարտ',
    quantity: 8500,
    minThreshold: 2000,
    dailyExpense: 500,
    expenseNotifyDays: 20,
  }
];

export const WAREHOUSE_OPTIONS = [
  'Գլխավոր հումքի պահեստ',
  'Տեսակի հումքի պահեստ',
  'Վաճառքի պահեստ',
  'Արտադրամաս',
  'Արտահանման պահեստ',
  'Վերամշակման պահեստ',
  'Օտարման պահեստ',
  'Խոտանման պահեստ',
];

export const INITIAL_TICKETS = [
  {
    id: 'TR-1001',
    date: new Date().toISOString(),
    item: { name: 'Արևածաղիկ 100գ աղի', unit: 'կգ', code: 'A123' },
    quantity: 10,
    source: 'Գլխավոր հումքի պահեստ',
    destination: 'Տեսակի հումքի պահեստ',
    status: 'pending', // pending, approved, rejected
    purpose: '',
    rejectReason: ''
  }
];

export const PRODUCTION_PRODUCTS = [
  { id: 'P001', code: 'P001', name: 'Արևածաղիկ 100գ դասական', category: 'Չիպսեր և հացահատիկներ' },
  { id: 'P002', code: 'P002', name: 'Արևածաղիկ 100գ աղի', category: 'Չիպսեր և հացահատիկներ' },
];

export const BOM_CONFIGURATION = {
  'P001': [
    { itemId: 'A123', name: 'Արևածաղիկ', amountPerUnit: 0.1, unit: 'կգ' },
    { itemId: 'A124', name: 'Թաղանթ', amountPerUnit: 0.05, unit: 'կգ' },
    { itemId: 'B002', name: 'Պիտակ', amountPerUnit: 1, unit: 'հատ' },
  ],
  'P002': [
    { itemId: 'A123', name: 'Արևածաղիկ', amountPerUnit: 0.1, unit: 'կգ' },
    { itemId: 'A124', name: 'Թաղանթ', amountPerUnit: 0.05, unit: 'կգ' },
    { itemId: 'B991', name: 'Աղ', amountPerUnit: 0.02, unit: 'կգ' },
    { itemId: 'B002', name: 'Պիտակ', amountPerUnit: 1, unit: 'հատ' },
  ]
};

export const MOCK_SALES_MANAGERS = [
  { id: 'SM1', firstName: 'Արամ', lastName: 'Խաչատրյան', email: 'aram.kh@example.com', status: 'Ակտիվ' },
  { id: 'SM2', firstName: 'Լուսինե', lastName: 'Պողոսյան', email: 'lusine.p@example.com', status: 'Ակտիվ' },
  { id: 'SM3', firstName: 'Դավիթ', lastName: 'Սարգսյան', email: 'david.s@example.com', status: 'Սառեցրած' },
];

export const INITIAL_SOURCING_ORDERS = [
  {
    id: 'REQ-2001',
    date: new Date().toISOString(),
    initiator: 'Տեսակի պատասխանատու (Չիպսեր)',
    items: [
      { itemId: 'A123', name: 'Արևածաղիկ', requestedQty: 500, unit: 'կգ', receivedQty: 0 },
      { itemId: 'B991', name: 'Աղ', requestedQty: 50, unit: 'կգ', receivedQty: 0 }
    ],
    status: 'Սպասում է', // 'Սպասում է' (Pending Chief), 'Նոր/Բաց' (Sent to Supplier), 'Մասնակի', 'Կատարված', 'Մերժված'
    managerId: null,
    rejectReason: ''
  },
  {
    id: 'REQ-2002',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    initiator: 'Տեսակի պատասխանատու (Տպագրական)',
    items: [
      { itemId: 'B002', name: 'Պիտակ', requestedQty: 10000, unit: 'հատ', receivedQty: 5000 }
    ],
    status: 'Մասնակի', 
    managerId: 'SM2',
    rejectReason: ''
  }
];

export const MOCK_USERS = [
  { id: 'U1', firstName: 'Ադմին', lastName: 'Ադմինյան', email: 'admin@logistic.am', phone: '091-11-11-11', role: 'Սուպերադմին', status: 'Ակտիվ' },
  { id: 'U2', firstName: 'Կարեն', lastName: 'Սարգսյան', email: 'karen@logistic.am', phone: '091-22-22-22', role: 'Գլխավոր պահեստապետ', status: 'Ակտիվ' },
  { id: 'U3', firstName: 'Աննա', lastName: 'Պողոսյան', email: 'anna@logistic.am', phone: '091-33-33-33', role: 'Տեսակի պատասխանատու', status: 'Ակտիվ' },
  { id: 'U4', firstName: 'Հայկ', lastName: 'Հակոբյան', email: 'hayk@logistic.am', phone: '091-44-44-44', role: 'Արտադրամասի պետ', status: 'Ակտիվ' },
  { id: 'U5', firstName: 'Սոնա', lastName: 'Մելքոնյան', email: 'sona@logistic.am', phone: '091-55-55-55', role: 'Արտահանման վաճառքի մենեջեր', status: 'Ակտիվ' },
];

export const PERMISSIONS_LIST = [
  { id: 'USER_VIEW', label: 'Տեսնել օգտատերերի ցանկը', category: 'Ա. Օգտատերերի Կառավարում' },
  { id: 'USER_MANAGE', label: 'Ավելացնել, խմբագրել կամ արգելափակել օգտատերերին', category: 'Ա. Օգտատերերի Կառավարում' },
  { id: 'ROLE_MANAGE', label: 'Ստեղծել և խմբագրել դերերն ու իրավասությունները', category: 'Ա. Օգտատերերի Կառավարում' },
  { id: 'CAT_VIEW', label: 'Դիտել տեսակների ցանկը', category: 'Բ. տեսակ և Ապրանքներ' },
  { id: 'CAT_MANAGE', label: 'Ստեղծել և խմբագրել տեսակ', category: 'Բ. տեսակ և Ապրանքներ' },
  { id: 'PRD_VIEW', label: 'Դիտել ապրանքների բազան', category: 'Բ. տեսակ և Ապրանքներ' },
  { id: 'PRD_CREATE', label: 'Ավելացնել նոր հումք կամ պրոդուկտ', category: 'Բ. տեսակ և Ապրանքներ' },
  { id: 'BOM_VIEW', label: 'Դիտել պրոդուկտների բաղադրությունը', category: 'Բ. տեսակ և Ապրանքներ' },
  { id: 'BOM_EDIT', label: 'Ստեղծել և փոփոխել պրոդուկտի բաղադրությունը', category: 'Բ. տեսակ և Ապրանքներ' },
  { id: 'STK_VIEW_ALL', label: 'Տեսնել բոլոր պահեստների մնացորդները', category: 'Գ. Պահեստ և Մնացորդներ' },
  { id: 'TRNS_CREATE', label: 'Ստեղծել տեղափոխման թիքեթ', category: 'Գ. Պահեստ և Մնացորդներ' },
  { id: 'SUP_REQ_CREATE', label: 'Ստեղծել հումքի գնման հարցում', category: 'Դ. Մատակարարում' },
  { id: 'PROD_ORDER_CREATE', label: 'Արտադրության պատվերի ստեղծում', category: 'Ե. Արտադրություն' },
  { id: 'PROD_START', label: 'Սկսել արտադրական պրոցեսը', category: 'Ե. Արտադրություն' },
  { id: 'SALE_ORDER_CREATE', label: 'Ձևակերպել արտահանման պատվեր', category: 'Զ. Վաճառք և Արտահանում' },
  { id: 'INV_START', label: 'Նախաձեռնել գույքագրման պրոցես', category: 'Է. Գույքագրում' },
];

