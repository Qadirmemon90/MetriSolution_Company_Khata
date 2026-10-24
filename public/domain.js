export const KINDS = ['income', 'expense', 'funding', 'drawing', 'transfer', 'salary'];
export const CATEGORIES = {
  income: ['Web development', 'Shopify development', 'Digital marketing', 'Maintenance', 'AI & Media', 'Other income'],
  expense: ['Software & subscriptions', 'Office & rent', 'Marketing', 'Travel', 'Utilities', 'Equipment', 'Other expense'],
  funding: ['Owner contribution'], drawing: ['Owner withdrawal'], transfer: ['Account transfer'], salary: ['Salary payment']
};
export const today = () => new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Karachi',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export const uid = () => crypto.randomUUID();

export const DEFAULT_BANK_INFO = {
  bankName: 'United Bank Limited',
  accountTitle: 'AbdulQadir',
  accountNumber: '0891302212516',
  iban: 'PK98UNIL010900030221251',
  note: 'Please share a screenshot of the transaction or mention the Invoice Number (#0230) in the payment reference for quick verification.',
  terms: 'Payment is due within 15 days. A late fee of 1.5% per month will be applied to all overdue balances.'
};

export function toPaisa(value) {
  const s=String(value).trim();
  if (!/^\d+(\.\d{1,2})?$/.test(s)) throw new Error('Enter a positive amount with at most two decimal places.');
  const [whole, fraction=''] = s.split('.');
  const n=Number(whole)*100+Number(fraction.padEnd(2,'0'));
  if (!Number.isSafeInteger(n) || n<=0 || n>100000000000) throw new Error('Amount must be between PKR 0.01 and 1 billion.');
  return n;
}
export const money = (paisa, compact=false) => new Intl.NumberFormat('en-PK',{maximumFractionDigits:compact?1:2,minimumFractionDigits:0,...(compact?{notation:'compact'}:{})}).format((paisa||0)/100);
export const fullMoney = paisa => `PKR ${money(paisa)}`;
export const activeTransactions = state => state.transactions.filter(t=>!state.reversals.some(r=>r.transactionId===t.id));
export function balances(state) {
  const map=Object.fromEntries(state.accounts.map(a=>[a.id,a.openingPaisa]));
  for(const t of activeTransactions(state)) {
    const sign=['expense','drawing','salary','transfer'].includes(t.kind)?-1:1;
    map[t.accountId]=(map[t.accountId]||0)+sign*t.amountPaisa;
    if(t.kind==='transfer') map[t.toAccountId]=(map[t.toAccountId]||0)+t.amountPaisa;
  }
  return map;
}
export function inPeriod(t,period,reference=today()) {
  if(t.date>reference) return false;
  if(period==='all') return true;
  if(period==='month') return t.date.slice(0,7)===reference.slice(0,7);
  if(period==='year') return t.date.slice(0,4)===reference.slice(0,4);
  const end=new Date(reference+'T12:00:00Z'), start=new Date(end); start.setUTCDate(start.getUTCDate()-29);
  return t.date>=start.toISOString().slice(0,10);
}
export function summary(state,period='month',reference=today()) {
  const tx=activeTransactions(state).filter(t=>inPeriod(t,period,reference));
  const sum=kinds=>tx.filter(t=>kinds.includes(t.kind)).reduce((a,t)=>a+t.amountPaisa,0);
  const income=sum(['income']),expenses=sum(['expense','salary']);
  return {income,expenses,surplus:income-expenses,funding:sum(['funding']),drawings:sum(['drawing']),balance:Object.values(balances(state)).reduce((a,b)=>a+b,0),receivables:state.invoices.reduce((a,i)=>a+i.amountPaisa-i.paidPaisa,0),transactions:tx.length};
}
export function validateDate(date) {
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date+'T12:00:00Z')) || new Date(date+'T12:00:00Z').toISOString().slice(0,10)!==date) throw new Error('Choose a valid date.');
}
export function validateTransaction(t,state) {
  if(!KINDS.includes(t.kind)) throw new Error('Choose a transaction type.');
  if(!Number.isSafeInteger(t.amountPaisa)||t.amountPaisa<=0||t.amountPaisa>100000000000) throw new Error('Enter a valid amount.');
  validateDate(t.date);
  if(t.date>today()) throw new Error('Transactions cannot be future-dated. Use an invoice for money due later.');
  if(!state.accounts.some(a=>a.id===t.accountId)) throw new Error('Choose an account.');
  if(t.kind==='transfer' && (!state.accounts.some(a=>a.id===t.toAccountId)||t.toAccountId===t.accountId)) throw new Error('Choose a different destination account.');
  if(!t.description?.trim()||t.description.length>180) throw new Error('Add a description of 1–180 characters.');
  if(!t.category?.trim()||t.category.length>80) throw new Error('Choose a category.');
  if((t.party||'').length>120) throw new Error('Name must be 120 characters or fewer.');
  if(t.kind==='salary'&&!state.employees.some(e=>e.id===t.employeeId)) throw new Error('Choose a team member for this salary.');
  if(t.invoiceId && (!state.invoices.some(i=>i.id===t.invoiceId)||t.kind!=='income')) throw new Error('Invalid invoice receipt.');
  return t;
}
export function validateInvoice(i) {
  if(!i.client?.trim()||i.client.length>120||!i.title?.trim()||i.title.length>180) throw new Error('Add a client and invoice description.');
  if(!Number.isSafeInteger(i.amountPaisa)||i.amountPaisa<=0||i.amountPaisa>100000000000) throw new Error('Enter a valid invoice total.');
  validateDate(i.issued); validateDate(i.due);
  if(i.due<i.issued) throw new Error('Due date cannot be before issue date.');
  return i;
}
export function invoiceStatus(i,reference=today()) { return i.paidPaisa===i.amountPaisa?'Paid':i.due<reference?'Overdue':i.paidPaisa>0?'Partial':'Unpaid'; }
export function cashflow(state,period='month',reference=today()) {
  const tx=activeTransactions(state).filter(t=>inPeriod(t,period,reference));
  const monthly=period==='year'||period==='all';
  const keys=monthly ? [...new Set([reference.slice(0,7),...tx.map(t=>t.date.slice(0,7))])].sort().slice(-12) : [];
  if(!monthly){const end=new Date(reference+'T12:00:00Z');let count=period==='month'?Number(reference.slice(8)):30;for(let n=count-1;n>=0;n--){const d=new Date(end);d.setUTCDate(d.getUTCDate()-n);keys.push(d.toISOString().slice(0,10));}}
  return keys.map(key=>({key,label:monthly?new Intl.DateTimeFormat('en',{month:'short'}).format(new Date(key+'-15T12:00:00Z')):key.slice(8),income:tx.filter(t=>t.kind==='income'&&t.date.startsWith(key)).reduce((a,t)=>a+t.amountPaisa,0),expense:tx.filter(t=>['expense','salary'].includes(t.kind)&&t.date.startsWith(key)).reduce((a,t)=>a+t.amountPaisa,0)}));
}
export function csv(rows) {
  return rows.map(row=>row.map(value=>{let s=String(value??'');if(/^[\s]*[=+\-@]/.test(s)&&! /^-?\d+(\.\d+)?$/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}).join(',')).join('\r\n');
}
export function expenseGroups(state,period) {
  const out={};for(const t of activeTransactions(state).filter(t=>['expense','salary'].includes(t.kind)&&inPeriod(t,period)))out[t.category]=(out[t.category]||0)+t.amountPaisa;
  return Object.entries(out).sort((a,b)=>b[1]-a[1]);
}
