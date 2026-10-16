import {uid,today,validateTransaction,validateInvoice} from './domain.js';
const KEY='metrisolution.khata.demo.v1';
export function emptyState(name='MetriSolution') { return {version:1,company:{name,currency:'PKR',timezone:'Asia/Karachi'},accounts:[],transactions:[],reversals:[],invoices:[],employees:[],audit:[]}; }
export function demoState(){
  const s=emptyState();
  const month=today().slice(0,7), day=Number(today().slice(8));
  const date=d=>`${month}-${String(Math.min(d,day)).padStart(2,'0')}`;
  s.accounts=[{id:'bank',name:'Business bank',type:'Bank',openingPaisa:16000000},{id:'cash',name:'Petty cash',type:'Cash',openingPaisa:1250000},{id:'wallet',name:'Digital wallet',type:'Wallet',openingPaisa:0}];
  s.employees=[{id:'team-1',name:'Areeb Khan',role:'Full stack developer',salaryPaisa:4500000,email:'',joined:date(1)},{id:'team-2',name:'Hira Ahmed',role:'UI/UX designer',salaryPaisa:3500000,email:'',joined:date(1)},{id:'team-3',name:'Daniyal Ali',role:'Marketing associate',salaryPaisa:2500000,email:'',joined:date(1)}];
  s.invoices=[{id:'inv-1',number:'MS-SAMPLE-001',client:'Luma Commerce',email:'',title:'Storefront development',amountPaisa:10000000,paidPaisa:6500000,issued:date(1),due:date(12),revision:1},{id:'inv-2',number:'MS-SAMPLE-002',client:'Northstar Studio',email:'',title:'Website maintenance',amountPaisa:3200000,paidPaisa:3200000,issued:date(2),due:date(15),revision:1},{id:'inv-3',number:'MS-SAMPLE-003',client:'Orbit Creative',email:'',title:'Brand website · final milestone',amountPaisa:7500000,paidPaisa:0,issued:date(10),due:`${month}-25`,revision:0}];
  const add=(id,kind,amount,d,description,category,party,accountId='bank',extra={})=>s.transactions.push({id,kind,amountPaisa:amount*100,date:date(d),description,category,party,accountId,toAccountId:'',employeeId:'',invoiceId:'',createdAt:`${date(d)}T09:00:00.000Z`,createdBy:'demo-owner',...extra});
  add('sample-1','funding',50000,1,'Working capital contribution','Owner contribution','Sample owner');
  add('sample-2','expense',30000,2,'Office rent · current month','Office & rent','Office landlord');
  add('sample-3','income',45000,3,'Landing page milestone','Web development','Pixel Foundry');
  add('sample-4','expense',7000,4,'Design and development tools','Software & subscriptions','Software providers');
  add('sample-5','income',65000,5,'Storefront project · part payment','Invoice payment','Luma Commerce','bank',{invoiceId:'inv-1'});
  add('sample-6','expense',12000,6,'Campaign creative production','Marketing','Creative partner');
  add('sample-7','salary',45000,7,'Developer salary · current month','Salary payment','Areeb Khan','bank',{employeeId:'team-1'});
  add('sample-8','income',90000,8,'Business website delivery','Web development','Atlas Services');
  add('sample-9','transfer',8000,9,'Replenish petty cash','Account transfer','Internal','bank',{toAccountId:'cash'});
  add('sample-10','expense',4500,10,'Office internet and utilities','Utilities','Utility providers','cash');
  add('sample-11','drawing',10000,11,'Owner withdrawal','Owner withdrawal','Sample owner');
  add('sample-12','salary',18000,12,'Designer salary · partial payment','Salary payment','Hira Ahmed','bank',{employeeId:'team-2'});
  add('sample-13','expense',9800,13,'Office peripherals','Equipment','Equipment supplier');
  add('sample-14','income',32000,14,'Monthly maintenance payment','Invoice payment','Northstar Studio','bank',{invoiceId:'inv-2'});
  s.audit=[{id:'sample-audit',action:'Sample workspace loaded',detail:'Illustrative records only — these are not company accounts.',createdAt:new Date().toISOString(),createdBy:'demo-owner'}];
  return s;
}
export function loadDemo(){try{const raw=localStorage.getItem(KEY);if(raw){const s=JSON.parse(raw);if(s.version===1&&Array.isArray(s.accounts)&&Array.isArray(s.transactions))return s;}}catch{}return demoState();}
export class DemoStore {
  constructor(){this.mode='demo';this.role='owner';this.user={uid:'demo-owner',email:'Demo workspace'};this.state=loadDemo();this.listeners=new Set();}
  subscribe(fn){this.listeners.add(fn);fn(this.state);return()=>this.listeners.delete(fn);}
  async mutate(action,detail,change){const next=structuredClone(this.state);change(next);next.audit.unshift({id:uid(),action,detail,createdAt:new Date().toISOString(),createdBy:this.user.uid});try{localStorage.setItem(KEY,JSON.stringify(next));}catch{throw new Error('Browser storage is full or unavailable. Export a backup before continuing.');}this.state=next;this.listeners.forEach(f=>f(this.state));}
  async addAccount(a){if(!a.name?.trim()||a.name.length>80||!['Bank','Cash','Wallet'].includes(a.type)||!Number.isSafeInteger(a.openingPaisa)||a.openingPaisa<0)throw new Error('Check account name and opening balance.');return this.mutate('Account created',a.name,s=>s.accounts.push({...a,id:uid()}));}
  async addEmployee(e){if(!e.name?.trim()||e.name.length>120||!e.role?.trim()||e.role.length>120||!Number.isSafeInteger(e.salaryPaisa)||e.salaryPaisa<0)throw new Error('Check team member details.');return this.mutate('Team member added',e.name,s=>s.employees.push({...e,id:uid()}));}
  async addTransaction(t){validateTransaction(t,this.state);if(t.invoiceId)throw new Error('Use Record payment from the invoice.');return this.mutate('Transaction recorded',t.description,s=>s.transactions.push({...t,id:uid(),createdAt:new Date().toISOString(),createdBy:this.user.uid}));}
  async addInvoice(i){validateInvoice(i);return this.mutate('Invoice created',i.client,s=>s.invoices.push({...i,id:uid(),number:'MS-'+uid().slice(0,8).toUpperCase(),paidPaisa:0,revision:0}));}
  async payInvoice(id,payment){const inv=this.state.invoices.find(i=>i.id===id);if(!inv)throw new Error('Invoice not found.');const t={...payment,kind:'income',invoiceId:id,party:inv.client,category:'Invoice payment',description:`${inv.number} · ${inv.title}`,employeeId:'',toAccountId:''};validateTransaction(t,this.state);if(t.amountPaisa>inv.amountPaisa-inv.paidPaisa)throw new Error('Payment exceeds the outstanding amount.');return this.mutate('Invoice payment',inv.number,s=>{s.invoices.find(i=>i.id===id).paidPaisa+=t.amountPaisa;s.transactions.push({...t,id:uid(),createdAt:new Date().toISOString(),createdBy:this.user.uid});});}
  async reverseTransaction(id,reason){const t=this.state.transactions.find(t=>t.id===id);if(!t||this.state.reversals.some(r=>r.transactionId===id))throw new Error('Entry is already reversed or unavailable.');if(!reason?.trim()||reason.length>300)throw new Error('Add a reversal reason (1–300 characters).');return this.mutate('Transaction reversed',`${t.description}: ${reason}`,s=>{s.reversals.push({transactionId:id,reason,createdBy:this.user.uid,createdAt:new Date().toISOString()});if(t.invoiceId)s.invoices.find(i=>i.id===t.invoiceId).paidPaisa-=t.amountPaisa;});}
  async updateCompany(name){if(!name?.trim()||name.length>100)throw new Error('Enter a company name of 1–100 characters.');return this.mutate('Company updated',name,s=>s.company.name=name);}
  async reset(empty=false){const next=empty?emptyState():demoState();localStorage.setItem(KEY,JSON.stringify(next));this.state=next;this.listeners.forEach(f=>f(this.state));}
  destroy(){this.listeners.clear();}
}
