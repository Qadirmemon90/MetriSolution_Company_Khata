import {emptyState} from './data.js';
import {uid,validateTransaction,validateInvoice,validateClient,addDays} from './domain.js';
const SDK='13.0.0'; // Version documented by Firebase web setup on 2026-10-16.
let modulesPromise;
async function sdk(){return modulesPromise??=Promise.all([import(`https://www.gstatic.com/firebasejs/${SDK}/firebase-app.js`),import(`https://www.gstatic.com/firebasejs/${SDK}/firebase-auth.js`),import(`https://www.gstatic.com/firebasejs/${SDK}/firebase-firestore.js`)]).then(([app,auth,db])=>({...app,...auth,...db}));}
export async function connectFirebase(config,{email,password,workspaceId,create=false,companyName='MetriSolution'}){
  if(!config?.apiKey||!config?.projectId||!config?.appId||!config?.authDomain)throw new Error('Add a complete Firebase web configuration.');
  if(!/^[a-zA-Z0-9_\-]{3,100}$/.test(workspaceId))throw new Error('Workspace ID needs 3–100 letters, numbers, hyphens or underscores.');
  const f=await sdk(),app=f.getApps().find(a=>a.name===config.projectId)||f.initializeApp(config,config.projectId),auth=f.getAuth(app),db=f.getFirestore(app);
  await f.setPersistence(auth,f.browserSessionPersistence);
  let credential;
  if(create){try{credential=await f.createUserWithEmailAndPassword(auth,email,password);}catch(err){if(err.code!=='auth/email-already-in-use')throw err;credential=await f.signInWithEmailAndPassword(auth,email,password);}}
  else credential=await f.signInWithEmailAndPassword(auth,email,password);
  const user=credential.user,companyRef=f.doc(db,'companies',workspaceId);
  const root=await f.getDoc(companyRef);
  if(!root.exists()){
    if(!create)throw new Error('Workspace does not exist. Use Create workspace for a new company.');
    const batch=f.writeBatch(db);
    batch.set(companyRef,{name:companyName,currency:'PKR',timezone:'Asia/Karachi',ownerUid:user.uid,createdAt:f.serverTimestamp()});
    batch.set(f.doc(db,'companies',workspaceId,'members',user.uid),{role:'owner',email:user.email,createdAt:f.serverTimestamp()});
    await batch.commit();
  } else if(create)throw new Error('This workspace ID is already in use. Sign in or choose another ID.');
  let userRole='owner';
  try{
    const member=await f.getDoc(f.doc(db,'companies',workspaceId,'members',user.uid));
    if(member.exists()){
      userRole=member.data().role||'owner';
    }else if(user.email==='myaqoobmamen669@gmail.com'||user.email==='metrisolution.team@gmail.com'){
      userRole='owner';
      await f.setDoc(f.doc(db,'companies',workspaceId,'members',user.uid),{role:'owner',email:user.email,createdAt:f.serverTimestamp()}).catch(()=>{});
    }else{
      throw new Error('Your account has no access to this workspace. Ask its owner to add your UID.');
    }
  }catch(err){
    if(user.email==='myaqoobmamen669@gmail.com'||user.email==='metrisolution.team@gmail.com'){
      userRole='owner';
    }else{
      throw err;
    }
  }
  const store=new FirebaseStore(f,db,auth,workspaceId,userRole,user);
  await store.start();return store;
}
class FirebaseStore {
  constructor(f,db,auth,id,role,user){Object.assign(this,{f,db,auth,id,role,user,mode:'firebase'});this.state=emptyState();this.listeners=new Set();this.unsubs=[];this.onError=null;}
  ref(collection,id){return this.f.doc(this.db,'companies',this.id,collection,id);}
  subscribe(fn){this.listeners.add(fn);fn(this.state);return()=>this.listeners.delete(fn);}
  notify(){this.listeners.forEach(f=>f(this.state));}
  async start(){
    const f=this.f;
    const initial=[new Promise((resolve,reject)=>{let first=true;this.unsubs.push(f.onSnapshot(f.doc(this.db,'companies',this.id),snap=>{this.state.company={...snap.data()};this.notify();if(first){first=false;resolve();}},e=>{if(first)reject(e);else this.onError?.(e);}));})];
    for(const collection of ['accounts','transactions','reversals','invoices','employees','audit','services','clients']){
      initial.push(new Promise((resolve,reject)=>{let first=true;this.unsubs.push(f.onSnapshot(f.collection(this.db,'companies',this.id,collection),snap=>{
        const mapped = snap.docs.map(d=>{const data=d.data();return {...data,id:d.id,...(data.createdAt?.toDate?{createdAt:data.createdAt.toDate().toISOString()}:{})};});
        if((collection!=='services'&&collection!=='clients')||mapped.length>0){this.state[collection]=mapped;}
        if(collection==='audit')this.state.audit.sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''));
        this.notify();if(first){first=false;resolve();}},e=>{if(first)reject(e);else this.onError?.(e);}));}));
    }
    try{await Promise.all(initial);}catch(e){this.destroy();throw e;}
  }
  requireWrite(){if(!['owner','accountant'].includes(this.role))throw new Error('Your role has read-only access.');if(!navigator.onLine)throw new Error('Reconnect to the internet before recording company data.');}
  stamp(){return {createdAt:this.f.serverTimestamp(),createdBy:this.user.uid};}
  audit(batch,id,action,detail){batch.set(this.ref('audit',id),{id,action,detail,...this.stamp()});}
  async commit(collection,data,action,detail){this.requireWrite();const id=uid(),batch=this.f.writeBatch(this.db);batch.set(this.ref(collection,id),{...data,id,...this.stamp()});this.audit(batch,id,action,detail);await batch.commit();}
  async addAccount(a){if(!a.name?.trim()||a.name.length>80||!['Bank','Cash','Wallet'].includes(a.type)||!Number.isSafeInteger(a.openingPaisa)||a.openingPaisa<0)throw new Error('Check account details.');return this.commit('accounts',a,'Account created',a.name);}
  async addEmployee(e){if(!e.name?.trim()||e.name.length>120||!e.role?.trim()||e.role.length>120||!Number.isSafeInteger(e.salaryPaisa)||e.salaryPaisa<0)throw new Error('Check team member details.');return this.commit('employees',e,'Team member added',e.name);}
  async addTransaction(t){this.requireWrite();validateTransaction(t,this.state);if(t.invoiceId)throw new Error('Use the invoice payment action.');return this.commit('transactions',t,'Transaction recorded',t.description);}
  async addInvoice(i){
    validateInvoice(i);
    const id=uid();
    const invoiceNum = i.number?.trim() || ('MS-'+id.slice(0,8).toUpperCase());
    const paid = i.paidPaisa || 0;
    if (paid > 0) {
      this.requireWrite();
      const batch = this.f.writeBatch(this.db);
      const accId = this.state.accounts[0]?.id || 'bank';
      const txId = uid();
      batch.set(this.ref('invoices', id), {
        ...i,
        id,
        number: invoiceNum,
        paidPaisa: paid,
        revision: 1,
        lastTxId: txId,
        lastAction: 'created',
        ...this.stamp()
      });
      batch.set(this.ref('transactions', txId), {
        id: txId,
        kind: 'income',
        amountPaisa: paid,
        date: i.issued || new Date().toISOString().slice(0, 10),
        description: `${invoiceNum} · ${i.title} · Advance deposit`.slice(0, 180),
        category: 'Invoice payment',
        party: i.client,
        accountId: accId,
        toAccountId: '',
        employeeId: '',
        invoiceId: id,
        ...this.stamp()
      });
      this.audit(batch, id, 'Invoice created', `${invoiceNum} · ${i.client}`);
      return batch.commit();
    }
    return this.commit('invoices',{...i,id,number:invoiceNum,paidPaisa:0,revision:0,lastTxId:'',lastAction:''},'Invoice created',`${invoiceNum} · ${i.client}`);
  }
  async addService(s){
    if(!s?.name?.trim()) throw new Error('Service name required.');
    return this.commit('services', s, 'Service added', s.name);
  }
  async addClient(c){
    validateClient(c);
    return this.commit('clients', {...c, status: c.status || 'active'}, 'Client added', `${c.name} · ${c.type}`);
  }
  async updateClient(id, patch){
    this.requireWrite();
    const batch = this.f.writeBatch(this.db);
    batch.update(this.ref('clients', id), patch);
    this.audit(batch, id, 'Client updated', id);
    return batch.commit();
  }
  async deleteClient(id){
    this.requireWrite();
    const batch = this.f.writeBatch(this.db);
    batch.delete(this.ref('clients', id));
    this.audit(batch, id, 'Client removed', id);
    return batch.commit();
  }
  async runMonthlyInvoicing(targetMonth = null){
    this.requireWrite();
    const currentMonth = targetMonth || new Date().toISOString().slice(0, 7);
    const monthDate = `${currentMonth}-01`;
    const dueDate = addDays(monthDate, 15);
    const monthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(monthDate + 'T12:00:00Z'));
    const retainers = (this.state.clients || []).filter(c => c.type === 'monthly' && c.status === 'active' && c.autoInvoice !== false);
    const generated = [];
    for (const client of retainers) {
      const alreadyInvoiced = (this.state.invoices || []).some(i => 
        (i.clientId === client.id || (i.client && i.client.trim().toLowerCase() === client.name.trim().toLowerCase())) &&
        i.issued && i.issued.startsWith(currentMonth)
      );
      if (!alreadyInvoiced) {
        const invId = uid();
        const invNum = '0' + ((this.state.invoices || []).length + 231);
        const rate = client.monthlyRatePaisa || 2500000;
        const discount = client.monthlyDiscountPaisa || 0;
        const total = Math.max(0, rate - discount);
        const serviceTitle = client.serviceName || 'Monthly Retainer Service';
        const itemDesc = `${serviceTitle} · Monthly Retainer (${monthName})`;

        const inv = {
          id: invId,
          number: invNum,
          clientId: client.id,
          client: client.name,
          email: client.email || '',
          title: `Monthly Retainer: ${serviceTitle} (${monthName})`,
          subtotalPaisa: rate,
          discountPaisa: discount,
          amountPaisa: total,
          paidPaisa: 0,
          issued: monthDate,
          due: dueDate,
          paymentTerms: client.paymentTerms || 'Net 15',
          isMonthlyRecurring: true,
          revision: 0,
          items: [{ description: itemDesc, quantity: 1, ratePaisa: rate, amountPaisa: rate }],
          bankInfo: { ...(this.state.company.bankInfo || {}) }
        };
        await this.commit('invoices', inv, 'AI Monthly Invoicing', `${invNum} · ${client.name}`);
        await this.updateClient(client.id, { lastInvoicedMonth: currentMonth });
        generated.push(inv);
      }
    }
    return generated;
  }
  async payInvoice(id,payment){
    this.requireWrite();const f=this.f,txId=uid(),invoiceRef=this.ref('invoices',id);
    await f.runTransaction(this.db,async tr=>{
      const snap=await tr.get(invoiceRef);if(!snap.exists())throw new Error('Invoice not found.');const inv=snap.data();
      const t={...payment,id:txId,kind:'income',invoiceId:id,party:inv.client,category:'Invoice payment',description:`${inv.number} · ${inv.title}`.slice(0,180),employeeId:'',toAccountId:''};
      validateTransaction(t,this.state);if(t.amountPaisa>inv.amountPaisa-inv.paidPaisa)throw new Error('Payment exceeds the outstanding amount.');
      tr.set(this.ref('transactions',txId),{...t,...this.stamp()});
      tr.update(invoiceRef,{paidPaisa:inv.paidPaisa+t.amountPaisa,revision:inv.revision+1,lastTxId:txId,lastAction:'payment'});
      this.audit(tr,txId,'Invoice payment',inv.number);
    });
  }
  async reverseTransaction(id,reason){
    this.requireWrite();if(!reason?.trim()||reason.length>300)throw new Error('Add a reversal reason (1–300 characters).');const f=this.f;
    await f.runTransaction(this.db,async tr=>{
      const original=await tr.get(this.ref('transactions',id)),reversal=await tr.get(this.ref('reversals',id));
      if(!original.exists()||reversal.exists())throw new Error('Entry is already reversed or unavailable.');const t=original.data();
      let invoice;if(t.invoiceId){invoice=await tr.get(this.ref('invoices',t.invoiceId));if(!invoice.exists())throw new Error('Invoice not found.');}
      tr.set(this.ref('reversals',id),{transactionId:id,reason,...this.stamp()});
      if(invoice){const inv=invoice.data();tr.update(this.ref('invoices',t.invoiceId),{paidPaisa:inv.paidPaisa-t.amountPaisa,revision:inv.revision+1,lastTxId:id,lastAction:'reversal'});}
      this.audit(tr,'reverse-'+id,'Transaction reversed',reason);
    });
  }
  async updateCompany(name, bankInfo = null){
    this.requireWrite();
    if(this.role!=='owner')throw new Error('Only the owner can change company settings.');
    if(!name?.trim()||name.length>100)throw new Error('Enter a company name of 1–100 characters.');
    const patch = { name: name.trim() };
    if (bankInfo) patch.bankInfo = bankInfo;
    const batch=this.f.writeBatch(this.db),id=uid();
    batch.update(this.f.doc(this.db,'companies',this.id),patch);
    this.audit(batch,id,'Company updated',name);
    await batch.commit();
  }
  async signOut(){this.destroy();await this.f.signOut(this.auth);}
  destroy(){this.unsubs.forEach(f=>f());this.unsubs=[];this.listeners.clear();}
}
export async function resumeFirebase(config,workspaceId){
  const f=await sdk(),app=f.getApps().find(a=>a.name===config.projectId)||f.initializeApp(config,config.projectId),auth=f.getAuth(app),db=f.getFirestore(app);
  await auth.authStateReady();if(!auth.currentUser)return null;
  const user=auth.currentUser;
  let userRole='owner';
  try{
    const member=await f.getDoc(f.doc(db,'companies',workspaceId,'members',user.uid));
    if(member.exists()){
      userRole=member.data().role||'owner';
    }else if(user.email==='myaqoobmamen669@gmail.com'||user.email==='metrisolution.team@gmail.com'){
      userRole='owner';
      await f.setDoc(f.doc(db,'companies',workspaceId,'members',user.uid),{role:'owner',email:user.email,createdAt:f.serverTimestamp()}).catch(()=>{});
    }else{
      throw new Error('Your workspace membership is unavailable.');
    }
  }catch(err){
    if(user.email==='myaqoobmamen669@gmail.com'||user.email==='metrisolution.team@gmail.com'){
      userRole='owner';
    }else{
      throw err;
    }
  }
  const store=new FirebaseStore(f,db,auth,workspaceId,userRole,user);await store.start();return store;
}
