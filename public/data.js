import {uid,today,validateTransaction,validateInvoice,DEFAULT_BANK_INFO} from './domain.js';
const KEY='metrisolution.khata.demo.v2';

export const DEFAULT_SERVICES = [
  {
    id: 'srv-ai-media',
    name: 'AI Product Image & Video Shoot',
    category: 'AI & Media',
    icon: 'camera',
    description: 'Create professional AI-powered product images and promotional videos for your e-commerce store, social media ads, and brand campaigns with clean backgrounds, premium styling, and high-converting visuals.',
    features: ['AI Product Photography', 'Product Video Creation', 'E-commerce Product Images', 'Shopify Ready Visuals'],
    packages: [
      { name: 'Starter Pack', description: '10 AI Product Photos + 2 Short Video Reels', pricePaisa: 2500000, billing: 'One-time' },
      { name: 'Pro E-Commerce', description: '30 High-res Photos + 5 Promotional Video Reels + Shopify Optimization', pricePaisa: 5500000, billing: 'One-time' },
      { name: 'Enterprise Brand Shoot', description: 'Unlimited Variations + 15 Video Reels + AI Model Retouching', pricePaisa: 12000000, billing: 'One-time' }
    ]
  },
  {
    id: 'srv-web-dev',
    name: 'Website Design & Development',
    category: 'Web Development',
    icon: 'code',
    description: 'Custom, responsive and conversion-focused websites for businesses of all sizes.',
    features: ['Responsive design', 'SEO-friendly code', 'CMS-ready pages', 'Performance optimization'],
    packages: [
      { name: 'Business Landing Page', description: 'Single high-converting landing page with contact form & animations', pricePaisa: 3500000, billing: 'One-time' },
      { name: 'Corporate Multi-Page', description: '5–8 Custom pages, CMS setup, blog, on-page SEO & speed boost', pricePaisa: 7500000, billing: 'One-time' },
      { name: 'Custom Dynamic Portal', description: 'Full-stack dynamic web app, custom database & API integration', pricePaisa: 15000000, billing: 'One-time' }
    ]
  },
  {
    id: 'srv-graphic-design',
    name: 'Graphic Designing',
    category: 'Design & Branding',
    icon: 'palette',
    description: 'Branding, social media visuals, pitch decks and marketing creatives.',
    features: ['Logo concepts', 'Brand style guide', 'Social media posts', 'Marketing collateral'],
    packages: [
      { name: 'Brand Identity Suite', description: 'Primary logo, color system, typography rules & stationery kit', pricePaisa: 2800000, billing: 'One-time' },
      { name: 'Social Media Monthly Pack', description: '20 Custom feed & story designs with brand guidelines', pricePaisa: 3500000, billing: 'Monthly' },
      { name: 'Executive Pitch Deck & Collateral', description: 'Investor pitch deck (15-20 slides) + brochures & marketing kit', pricePaisa: 6500000, billing: 'One-time' }
    ]
  },
  {
    id: 'srv-web-maintenance',
    name: 'Website Maintenance Service',
    category: 'Web Development',
    icon: 'tool',
    description: 'Ongoing updates, backups, security checks and technical support.',
    features: ['Monthly updates', 'Bug fixing', 'Security monitoring', 'Backup checks'],
    packages: [
      { name: 'Essential Care', description: 'Weekly off-site backups, security monitoring & core updates', pricePaisa: 1500000, billing: 'Monthly' },
      { name: 'Pro Care & Optimization', description: 'Daily backups, malware scans, speed audits + 5 dev hours', pricePaisa: 3000000, billing: 'Monthly' },
      { name: 'Enterprise 24/7 Support', description: 'Instant response, 15 dev hours, uptime guarantee & staging server', pricePaisa: 6000000, billing: 'Monthly' }
    ]
  },
  {
    id: 'srv-smm',
    name: 'Social Media Marketing',
    category: 'Digital Marketing',
    icon: 'megaphone',
    description: 'Campaign planning and social media growth for lead generation.',
    features: ['Content calendar', 'Ad campaign support', 'Creative posts', 'Performance reports'],
    packages: [
      { name: 'MetGrow Starter', description: '12 Curated posts, caption copywriting & initial ad setup', pricePaisa: 2500000, billing: 'Monthly' },
      { name: 'MetGrow Pro Scale', description: '24 Posts, 4 short video reels, Meta ad management & bi-weekly reports', pricePaisa: 5000000, billing: 'Monthly' },
      { name: 'MetGrow Dominance', description: 'Daily posting, video production, TikTok + Meta ads & influencer outreach', pricePaisa: 9500000, billing: 'Monthly' }
    ]
  },
  {
    id: 'srv-ecommerce',
    name: 'E-Commerce Website Development',
    category: 'Web Development',
    icon: 'cart',
    description: 'Online stores with product catalogs, checkout flows and admin controls.',
    features: ['Product catalog', 'Cart and checkout', 'Inventory workflow', 'Payment gateway ready'],
    packages: [
      { name: 'Shopify / WooCommerce Standard', description: 'Turnkey online store with 50 products, payment gateways & cart', pricePaisa: 6000000, billing: 'One-time' },
      { name: 'Custom E-Commerce Store', description: 'Custom product builder, multi-currency, advanced shipping & inventory', pricePaisa: 9500000, billing: 'One-time' },
      { name: 'Enterprise Headless / Multi-Vendor', description: 'Next.js storefront, ERP sync, vendor portal & high-volume scaling', pricePaisa: 22000000, billing: 'One-time' }
    ]
  },
  {
    id: 'srv-seo',
    name: 'Search Engine Optimization',
    category: 'Digital Marketing',
    icon: 'search',
    description: 'Technical SEO, on-page improvements and content optimization.',
    features: ['Technical audit', 'Keyword mapping', 'On-page SEO', 'Monthly reporting'],
    packages: [
      { name: 'Local SEO & Technical Fixes', description: 'Google My Business setup, local citations & site speed/error fixes', pricePaisa: 3000000, billing: 'Monthly' },
      { name: 'Organic Growth Campaign', description: 'In-depth keyword targeting, 4 optimized articles & authority backlinks', pricePaisa: 5500000, billing: 'Monthly' },
      { name: 'National Market Domination', description: 'High-intent search capture, PR links, competitor conquesting & reports', pricePaisa: 11000000, billing: 'Monthly' }
    ]
  },
  {
    id: 'srv-mobile-app',
    name: 'Mobile App Development',
    category: 'Software & Apps',
    icon: 'mobile',
    description: 'Android and iOS applications with clean UX and scalable architecture.',
    features: ['React Native ready', 'API integration', 'Push notification ready', 'User-friendly UI'],
    packages: [
      { name: 'Mobile MVP Package', description: 'iOS & Android cross-platform prototype with 5 screens & mock backend', pricePaisa: 14000000, billing: 'One-time' },
      { name: 'Production Mobile App', description: 'Full auth, cloud database, push alerts, in-app payments & store launch', pricePaisa: 28000000, billing: 'One-time' },
      { name: 'Enterprise App Ecosystem', description: 'Real-time WebSocket sync, offline mode, custom backend & admin portal', pricePaisa: 45000000, billing: 'One-time' }
    ]
  },
  {
    id: 'srv-custom-software',
    name: 'Custom Business Software',
    category: 'Software & Apps',
    icon: 'layers',
    description: 'Tailored dashboards, CRM, inventory, ERP and workflow systems.',
    features: ['Admin dashboards', 'Role-based access', 'Reports', 'Cloud database'],
    packages: [
      { name: 'Business Workflow Portal', description: 'Custom internal database, user management & automated email alerts', pricePaisa: 12000000, billing: 'One-time' },
      { name: 'Full Custom Khata & CRM', description: 'Multi-account finance, customer billing, team tracking & reporting', pricePaisa: 25000000, billing: 'One-time' },
      { name: 'Enterprise ERP Suite', description: 'End-to-end business operations, inventory, payroll, multi-branch & API', pricePaisa: 55000000, billing: 'One-time' }
    ]
  }
];

export function emptyState(name='MetriSolution Pvt LTD') {
  return {
    version: 2,
    company: {
      name,
      currency: 'PKR',
      timezone: 'Asia/Karachi',
      bankInfo: { ...DEFAULT_BANK_INFO }
    },
    accounts: [],
    transactions: [],
    reversals: [],
    invoices: [],
    employees: [],
    services: structuredClone(DEFAULT_SERVICES),
    audit: []
  };
}

export function demoState() {
  const s = emptyState();
  const month = today().slice(0, 7), day = Number(today().slice(8));
  const date = d => `${month}-${String(Math.min(d, day)).padStart(2, '0')}`;

  s.accounts = [
    { id: 'bank', name: 'United Bank Limited', type: 'Bank', openingPaisa: 16000000 },
    { id: 'cash', name: 'Petty cash', type: 'Cash', openingPaisa: 1250000 },
    { id: 'wallet', name: 'Digital wallet', type: 'Wallet', openingPaisa: 0 }
  ];

  s.employees = [
    { id: 'team-1', name: 'Areeb Khan', role: 'Full stack developer', salaryPaisa: 4500000, email: '', joined: date(1) },
    { id: 'team-2', name: 'Hira Ahmed', role: 'UI/UX designer', salaryPaisa: 3500000, email: '', joined: date(1) },
    { id: 'team-3', name: 'Daniyal Ali', role: 'Marketing associate', salaryPaisa: 2500000, email: '', joined: date(1) }
  ];

  s.invoices = [
    {
      id: 'inv-0230',
      number: '0230',
      client: 'Yelo Beta',
      email: 'finance@yelobeta.com',
      title: 'Digital Marketing Package MetGrow',
      amountPaisa: 2500000,
      paidPaisa: 1250000,
      issued: date(1),
      due: date(28),
      paymentTerms: '1872',
      revision: 1,
      items: [
        { description: 'Digital Marketing Package MetGrow', quantity: 1, ratePaisa: 2500000, amountPaisa: 2500000 }
      ],
      bankInfo: { ...DEFAULT_BANK_INFO }
    },
    {
      id: 'inv-1',
      number: 'MS-SAMPLE-001',
      client: 'Luma Commerce',
      email: 'accounts@lumacommerce.com',
      title: 'Storefront development',
      amountPaisa: 10000000,
      paidPaisa: 6500000,
      issued: date(1),
      due: date(12),
      paymentTerms: 'Net 15',
      revision: 1,
      items: [
        { description: 'E-Commerce Website Development · Custom Store', quantity: 1, ratePaisa: 10000000, amountPaisa: 10000000 }
      ]
    },
    {
      id: 'inv-2',
      number: 'MS-SAMPLE-002',
      client: 'Northstar Studio',
      email: '',
      title: 'Website maintenance',
      amountPaisa: 3200000,
      paidPaisa: 3200000,
      issued: date(2),
      due: date(15),
      paymentTerms: 'Net 15',
      revision: 1,
      items: [
        { description: 'Pro Care & Optimization Monthly Maintenance', quantity: 1, ratePaisa: 3200000, amountPaisa: 3200000 }
      ]
    },
    {
      id: 'inv-3',
      number: 'MS-SAMPLE-003',
      client: 'Orbit Creative',
      email: '',
      title: 'Brand website · final milestone',
      amountPaisa: 7500000,
      paidPaisa: 0,
      issued: date(10),
      due: `${month}-25`,
      paymentTerms: 'Net 30',
      revision: 0,
      items: [
        { description: 'Corporate Multi-Page Website Design & Development', quantity: 1, ratePaisa: 7500000, amountPaisa: 7500000 }
      ]
    }
  ];

  const add = (id, kind, amount, d, description, category, party, accountId = 'bank', extra = {}) =>
    s.transactions.push({
      id,
      kind,
      amountPaisa: amount * 100,
      date: date(d),
      description,
      category,
      party,
      accountId,
      toAccountId: '',
      employeeId: '',
      invoiceId: '',
      createdAt: `${date(d)}T09:00:00.000Z`,
      createdBy: 'demo-owner',
      ...extra
    });

  add('sample-1', 'funding', 50000, 1, 'Working capital contribution', 'Owner contribution', 'Sample owner');
  add('sample-2', 'expense', 30000, 2, 'Office rent · current month', 'Office & rent', 'Office landlord');
  add('sample-3', 'income', 45000, 3, 'Landing page milestone', 'Web development', 'Pixel Foundry');
  add('sample-4', 'expense', 7000, 4, 'Design and development tools', 'Software & subscriptions', 'Software providers');
  add('sample-5', 'income', 65000, 5, 'Storefront project · part payment', 'Invoice payment', 'Luma Commerce', 'bank', { invoiceId: 'inv-1' });
  add('sample-6', 'expense', 12000, 6, 'Campaign creative production', 'Marketing', 'Creative partner');
  add('sample-7', 'salary', 45000, 7, 'Developer salary · current month', 'Salary payment', 'Areeb Khan', 'bank', { employeeId: 'team-1' });
  add('sample-8', 'income', 90000, 8, 'Business website delivery', 'Web development', 'Atlas Services');
  add('sample-9', 'transfer', 8000, 9, 'Replenish petty cash', 'Account transfer', 'Internal', 'bank', { toAccountId: 'cash' });
  add('sample-10', 'expense', 4500, 10, 'Office internet and utilities', 'Utilities', 'Utility providers', 'cash');
  add('sample-11', 'drawing', 10000, 11, 'Owner withdrawal', 'Owner withdrawal', 'Sample owner');
  add('sample-12', 'salary', 18000, 12, 'Designer salary · partial payment', 'Salary payment', 'Hira Ahmed', 'bank', { employeeId: 'team-2' });
  add('sample-13', 'expense', 9800, 13, 'Office peripherals', 'Equipment', 'Equipment supplier');
  add('sample-14', 'income', 32000, 14, 'Monthly maintenance payment', 'Invoice payment', 'Northstar Studio', 'bank', { invoiceId: 'inv-2' });
  add('sample-15', 'income', 12500, 15, 'Digital Marketing Package MetGrow · part payment', 'Invoice payment', 'Yelo Beta', 'bank', { invoiceId: 'inv-0230' });

  s.audit = [{
    id: 'sample-audit',
    action: 'Sample workspace loaded',
    detail: 'MetriSolution Company Khata loaded with official services, packages, and sample accounts.',
    createdAt: new Date().toISOString(),
    createdBy: 'demo-owner'
  }];

  return s;
}

export function loadDemo() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s.version === 2 && Array.isArray(s.accounts) && Array.isArray(s.transactions)) {
        if (!s.services || !s.services.length) s.services = structuredClone(DEFAULT_SERVICES);
        return s;
      }
    }
  } catch {}
  return demoState();
}

export class DemoStore {
  constructor() {
    this.mode = 'demo';
    this.role = 'owner';
    this.user = { uid: 'demo-owner', email: 'Demo workspace' };
    this.state = loadDemo();
    this.listeners = new Set();
  }

  subscribe(fn) {
    this.listeners.add(fn);
    fn(this.state);
    return () => this.listeners.delete(fn);
  }

  async mutate(action, detail, change) {
    const next = structuredClone(this.state);
    change(next);
    next.audit.unshift({
      id: uid(),
      action,
      detail,
      createdAt: new Date().toISOString(),
      createdBy: this.user.uid
    });
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      throw new Error('Browser storage is full or unavailable. Export a backup before continuing.');
    }
    this.state = next;
    this.listeners.forEach(f => f(this.state));
  }

  async addAccount(a) {
    if (!a.name?.trim() || a.name.length > 80 || !['Bank', 'Cash', 'Wallet'].includes(a.type) || !Number.isSafeInteger(a.openingPaisa) || a.openingPaisa < 0) {
      throw new Error('Check account name and opening balance.');
    }
    return this.mutate('Account created', a.name, s => s.accounts.push({ ...a, id: uid() }));
  }

  async addEmployee(e) {
    if (!e.name?.trim() || e.name.length > 120 || !e.role?.trim() || e.role.length > 120 || !Number.isSafeInteger(e.salaryPaisa) || e.salaryPaisa < 0) {
      throw new Error('Check team member details.');
    }
    return this.mutate('Team member added', e.name, s => s.employees.push({ ...e, id: uid() }));
  }

  async addTransaction(t) {
    validateTransaction(t, this.state);
    if (t.invoiceId) throw new Error('Use Record payment from the invoice.');
    return this.mutate('Transaction recorded', t.description, s => s.transactions.push({
      ...t,
      id: uid(),
      createdAt: new Date().toISOString(),
      createdBy: this.user.uid
    }));
  }

  async addInvoice(i) {
    validateInvoice(i);
    const invoiceNum = i.number?.trim() || ('MS-' + uid().slice(0, 8).toUpperCase());
    return this.mutate('Invoice created', `${invoiceNum} · ${i.client}`, s => s.invoices.push({
      ...i,
      id: uid(),
      number: invoiceNum,
      paidPaisa: i.paidPaisa || 0,
      revision: 0
    }));
  }

  async payInvoice(id, payment) {
    const inv = this.state.invoices.find(i => i.id === id);
    if (!inv) throw new Error('Invoice not found.');
    const t = {
      ...payment,
      kind: 'income',
      invoiceId: id,
      party: inv.client,
      category: 'Invoice payment',
      description: `${inv.number} · ${inv.title}`,
      employeeId: '',
      toAccountId: ''
    };
    validateTransaction(t, this.state);
    if (t.amountPaisa > inv.amountPaisa - inv.paidPaisa) throw new Error('Payment exceeds the outstanding amount.');
    return this.mutate('Invoice payment', inv.number, s => {
      s.invoices.find(i => i.id === id).paidPaisa += t.amountPaisa;
      s.transactions.push({
        ...t,
        id: uid(),
        createdAt: new Date().toISOString(),
        createdBy: this.user.uid
      });
    });
  }

  async reverseTransaction(id, reason) {
    const t = this.state.transactions.find(t => t.id === id);
    if (!t || this.state.reversals.some(r => r.transactionId === id)) throw new Error('Entry is already reversed or unavailable.');
    if (!reason?.trim() || reason.length > 300) throw new Error('Add a reversal reason (1–300 characters).');
    return this.mutate('Transaction reversed', `${t.description}: ${reason}`, s => {
      s.reversals.push({ transactionId: id, reason, createdBy: this.user.uid, createdAt: new Date().toISOString() });
      if (t.invoiceId) s.invoices.find(i => i.id === t.invoiceId).paidPaisa -= t.amountPaisa;
    });
  }

  async addService(service) {
    if (!service.name?.trim() || !service.category?.trim()) throw new Error('Service name and category are required.');
    return this.mutate('Service added', service.name, s => {
      s.services = s.services || structuredClone(DEFAULT_SERVICES);
      s.services.push({ ...service, id: 'srv-' + uid().slice(0, 8) });
    });
  }

  async updateCompany(name, bankInfo = null) {
    if (!name?.trim() || name.length > 100) throw new Error('Enter a company name of 1–100 characters.');
    return this.mutate('Company updated', name, s => {
      s.company.name = name;
      if (bankInfo) s.company.bankInfo = { ...(s.company.bankInfo || DEFAULT_BANK_INFO), ...bankInfo };
    });
  }

  async reset(empty = false) {
    const next = empty ? emptyState() : demoState();
    localStorage.setItem(KEY, JSON.stringify(next));
    this.state = next;
    this.listeners.forEach(f => f(this.state));
  }

  destroy() {
    this.listeners.clear();
  }
}
