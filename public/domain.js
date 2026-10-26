export const KINDS = ['income', 'expense', 'funding', 'drawing', 'transfer', 'salary'];
export const CATEGORIES = {
  income: ['Web development', 'Shopify development', 'Digital marketing', 'Maintenance', 'AI & Media', 'Other income'],
  expense: ['Software & subscriptions', 'Office & rent', 'Marketing', 'Travel', 'Utilities', 'Equipment', 'Other expense'],
  funding: ['Owner contribution'], drawing: ['Owner withdrawal'], transfer: ['Account transfer'], salary: ['Salary payment']
};
export const today = () => new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Karachi',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export const addDays = (dateStr, days = 15) => {
  const d = new Date(dateStr + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};
export const uid = () => crypto.randomUUID();

export const DEFAULT_BANK_INFO = {
  bankName: 'United Bank Limited',
  accountTitle: 'AbdulQadir',
  accountNumber: '0891302212516',
  iban: 'PK98UNIL010900030221251',
  note: 'Please share a screenshot of the transaction or mention the Invoice Number (#0230) in the payment reference for quick verification.',
  terms: 'Payment is due within 15 days. A late fee of 1.5% per month will be applied to all overdue balances.'
};

export function formatInvoiceNote(noteTemplate, invoiceNumber) {
  const numStr = invoiceNumber ? `#${invoiceNumber}` : '#0230';
  if (!noteTemplate) return `Please share a screenshot of the transaction or mention the Invoice Number (${numStr}) in the payment reference for quick verification.`;
  if (/#([A-Za-z0-9_-]+)/.test(noteTemplate)) {
    return noteTemplate.replace(/#([A-Za-z0-9_-]+)/g, numStr);
  }
  if (noteTemplate.includes('Invoice Number')) {
    return noteTemplate.replace('Invoice Number', `Invoice Number (${numStr})`);
  }
  return `${noteTemplate} (${numStr})`;
}

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
export function formatWhatsAppNumber(phone) {
  if (!phone) return '';
  let cleaned = String(phone).replace(/[^0-9]/g, '');
  if (!cleaned) return '';
  if (cleaned.startsWith('00')) cleaned = cleaned.slice(2);
  if (cleaned.startsWith('03') && cleaned.length === 11) {
    cleaned = '92' + cleaned.slice(1);
  } else if (cleaned.startsWith('3') && cleaned.length === 10) {
    cleaned = '92' + cleaned;
  }
  return cleaned;
}

export function validateInvoice(i) {
  if(!i.client?.trim()||i.client.length>120||!i.title?.trim()||i.title.length>180) throw new Error('Add a client and invoice description.');
  if(!Number.isSafeInteger(i.amountPaisa)||i.amountPaisa<=0||i.amountPaisa>100000000000) throw new Error('Enter a valid invoice total.');
  if(i.discountPaisa !== undefined && (!Number.isSafeInteger(i.discountPaisa) || i.discountPaisa < 0)) throw new Error('Enter a valid discount amount.');
  validateDate(i.issued); validateDate(i.due);
  if(i.due<i.issued) throw new Error('Due date cannot be before issue date.');
  return i;
}
export function validateClient(c) {
  if(!c.name?.trim()||c.name.length>120) throw new Error('Enter a client name (1–120 characters).');
  if(!['monthly','one-time'].includes(c.type)) throw new Error('Choose engagement type: Monthly Retainer or One-Time Project.');
  if(c.type==='monthly'){
    if(!Number.isSafeInteger(c.monthlyRatePaisa)||c.monthlyRatePaisa<=0||c.monthlyRatePaisa>100000000000) throw new Error('Enter a valid monthly fee.');
  }
  return c;
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

export function toPaisaOrZero(value) {
  if (value === undefined || value === null || value === '' || Number(value) === 0) return 0;
  return toPaisa(value);
}

export function formatMonthYear(monthStr) {
  if (!monthStr || !/^\d{4}-\d{2}$/.test(monthStr)) return monthStr || '';
  const [y, m] = monthStr.split('-');
  const d = new Date(Date.UTC(Number(y), Number(m) - 1, 1, 12, 0, 0));
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(d);
}

export function amountInWords(paisa) {
  const amount = Math.floor((paisa || 0) / 100);
  if (amount === 0) return 'Zero Rupees Only';
  if (amount < 0) return 'Negative Amount';

  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertSection(num) {
    let str = '';
    if (num >= 100) {
      str += units[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }
    if (num >= 20) {
      str += tens[Math.floor(num / 10)] + (num % 10 !== 0 ? '-' + units[num % 10] : '') + ' ';
    } else if (num > 0) {
      str += units[num] + ' ';
    }
    return str.trim();
  }

  let remaining = amount;
  const parts = [];

  const billions = Math.floor(remaining / 1000000000);
  if (billions > 0) {
    parts.push(convertSection(billions) + ' Billion');
    remaining %= 1000000000;
  }

  const millions = Math.floor(remaining / 1000000);
  if (millions > 0) {
    parts.push(convertSection(millions) + ' Million');
    remaining %= 1000000;
  }

  const thousands = Math.floor(remaining / 1000);
  if (thousands > 0) {
    parts.push(convertSection(thousands) + ' Thousand');
    remaining %= 1000;
  }

  if (remaining > 0) {
    parts.push(convertSection(remaining));
  }

  return parts.join(' ').trim() + ' Pakistani Rupees Only';
}

export function validateSalarySlip(slip, state) {
  if (!slip.employeeId || !state.employees.some(e => e.id === slip.employeeId)) {
    throw new Error('Choose an existing team member.');
  }
  if (!slip.month || !/^\d{4}-\d{2}$/.test(slip.month)) {
    throw new Error('Select a valid pay period (YYYY-MM).');
  }
  if (slip.issueDate) validateDate(slip.issueDate);
  if (!Number.isSafeInteger(slip.basicPaisa) || slip.basicPaisa < 0) {
    throw new Error('Basic salary must be a non-negative amount.');
  }
  if (slip.netSalaryPaisa !== undefined && (!Number.isSafeInteger(slip.netSalaryPaisa) || slip.netSalaryPaisa < 0)) {
    throw new Error('Net payable salary must be a non-negative amount.');
  }
  if (slip.deductFromAccount) {
    if (!slip.accountId || !state.accounts.some(a => a.id === slip.accountId)) {
      throw new Error('Choose an account to deduct this salary from.');
    }
    if (!slip.netSalaryPaisa || slip.netSalaryPaisa <= 0) {
      throw new Error('Net payable salary must be greater than 0 to deduct from account.');
    }
    if (slip.issueDate && slip.issueDate > today()) {
      throw new Error('Transactions cannot be future-dated.');
    }
  }
  return slip;
}
