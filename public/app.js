import {DemoStore, DEFAULT_SERVICES, DEFAULT_CLIENTS} from './data.js';
import {money,fullMoney,toPaisa,toPaisaOrZero,today,uid,addDays,formatInvoiceNote,formatWhatsAppNumber,formatMonthYear,amountInWords,validateSalarySlip,balances,summary,activeTransactions,inPeriod,cashflow,expenseGroups,csv,invoiceStatus,CATEGORIES,DEFAULT_BANK_INFO} from './domain.js';
import {firebaseConfig} from './firebase-config.js';

const $=s=>document.querySelector(s), app=$('#app');
const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const paths={
  grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  transactions:'<path d="M4 7h15m-4-4 4 4-4 4M20 17H5m4-4-4 4 4 4"/>',
  wallet:'<path d="M20 7V5a2 2 0 0 0-2-2H6a3 3 0 0 0 0 6h14v11H6a3 3 0 0 1-3-3V6"/><path d="M20 11h-5v5h5M17 13.5h.01"/>',
  invoice:'<path d="M6 3h10l3 3v15l-3-2-3 2-3-2-3 2-2-2V4a1 1 0 0 1 1-1Z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  team:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a5 5 0 0 1 10 0v3m4-18a3 3 0 0 1 0 6m0 5a5 5 0 0 1 4 5v2"/>',
  report:'<path d="M4 21h17M7 17V9m5 8V4m5 13v-6"/>',
  settings:'<path d="m9 3-1 3-3 1-2 4 2 2v4l4 2 2 2 4-2 3-1 2-4-2-2V8l-4-2-2-3Z"/><circle cx="12" cy="12" r="3"/>',
  layers:'<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  camera:'<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  code:'<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  whatsapp:'<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.05 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>',
  palette:'<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',
  tool:'<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  megaphone:'<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
  cart:'<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
  mobile:'<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
  chevron:'<path d="m9 5 7 7-7 7"/>',
  down:'<path d="m6 9 6 6 6-6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  export:'<path d="M12 3v12m-4-4 4 4 4-4M5 16v5h14v-5"/>',
  download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  arrowup:'<path d="m7 17 10-10M7 7h10v10"/>',
  arrowdown:'<path d="M17 7 7 17M7 7v10h10"/>',
  arrow:'<path d="M4 12h16m-5-5 5 5-5 5"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8M10 21h4"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/>',
  moon:'<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  close:'<path d="m6 6 12 12M6 18 18 6"/>',
  bank:'<path d="m3 8 9-5 9 5H3Zm2 12h14M7 10v7m5-7v7m5-7v7M3 22h18"/>',
  cash:'<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M5 9h.01M19 15h.01"/>',
  spark:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  shield:'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
  print:'<path d="M6 9V3h12v6M6 18H3V9h18v9h-3M6 14h12v7H6Z"/><path d="M17 11h.01"/>',
  undo:'<path d="M3 11h11a6 6 0 0 1 0 12M3 11l5-5M3 11l5 5"/>',
  link:'<path d="m10 14 4-4M9 16l-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m0 10a4 4 0 0 0 6 0l5-5a4 4 0 0 0-6-6l-2 2"/>',
  logout:'<path d="M9 4H4v16h5M10 12h11m-4-4 4 4-4 4"/>',
  check:'<path d="m4 12 5 5L20 6"/>',
  dots:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  lock:'<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  login:'<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>',
  eye:'<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff:'<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20"/>',
  user:'<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  repeat:'<path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>',
  building:'<rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
  trash:'<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  slip:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>'
};

const icon=(name,cls='')=>`<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${paths[name]||paths.grid}</svg>`;
const pageNames={
  overview:'Financial overview',
  transactions:'Transactions',
  accounts:'Company accounts',
  invoices:'Invoices &amp; receivables',
  clients:'Clients &amp; Retainers',
  services:'Services &amp; Packages',
  team:'Team &amp; payroll',
  reports:'Business reports',
  settings:'Workspace settings',
  login:'Workspace Login'
};
const kindNames={income:'Income',expense:'Expense',funding:'Owner funding',drawing:'Owner withdrawal',transfer:'Transfer',salary:'Salary'};
const colors=['#7038db','#f59e0b','#3b82f6','#a855f7','#10b981','#6366f1','#ec4899'];

function createWorkspaceStore(){
  const s=new DemoStore();
  s.mode='firebase';
  s.role='owner';
  s.id='metrisolution';
  s.user={email:'metrisolution.team@gmail.com',uid:'company-owner'};
  return s;
}

let store=createWorkspaceStore(), state=store.state, unsubscribe, period='month', query='', kindFilter='all', accountFilter='all', showReversed=false, menuOpen=false, toastTimer, lastFocus;
let authTab='login', previousAuth={}, showPassword=false, showConfigDrawer=false, serviceFilter='all', clientFilter='all';

function safeStorage(key,value){
  try{
    if(value===undefined)return localStorage.getItem(key);
    localStorage.setItem(key,value);
  }catch{}
  return null;
}

if(safeStorage('metri.theme')==='dark') document.body.classList.add('theme-dark');

/* Gated Portal Authentication Logic */
function isAuthenticated(){
  return safeStorage('metri.session')==='authenticated';
}

function getPage(){
  const hash=location.hash.slice(1);
  if(!isAuthenticated()) return 'login';
  if(hash==='login') return 'login';
  return pageNames[hash]?hash:'overview';
}

function canWrite(){ return ['owner','accountant'].includes(store.role); }

function bindStore(next){
  unsubscribe?.();
  store=next;
  store.onError=err=>toast('Cloud sync error: '+friendlyError(err),true);
  unsubscribe=store.subscribe(s=>{
    state=s;
    render();
  });
}

function friendlyError(err){
  const codes={
    'auth/invalid-credential':'Email ya password sahi nahi hai. Check workspace and login details.',
    'auth/invalid-email':'Please enter a valid email address.',
    'auth/weak-password':'Use a stronger password (at least 12 characters).',
    'auth/email-already-in-use':'This email already has an account. Use Sign in.',
    'auth/operation-not-allowed':'Enable Email/Password sign-in in Firebase Authentication.',
    'permission-denied':'Access denied. Check workspace membership and deployed Firestore rules.',
    'auth/network-request-failed':'Firebase could not be reached. Check your internet connection.',
    'auth/unauthorized-domain':'Add this website domain in Firebase Authentication authorized domains.'
  };
  return codes[err?.code]||err?.message||'Something went wrong. Please try again.';
}

function toast(message,error=false){
  clearTimeout(toastTimer);
  $('#toast-root').innerHTML=`<div class="toast ${error?'error':''}">${icon(error?'close':'check')}${e(message)}</div>`;
  toastTimer=setTimeout(()=>$('#toast-root').innerHTML='',4500);
}

function dateLabel(date){
  return new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short'}).format(new Date(date+'T12:00:00Z'));
}

function longDate(){
  return new Intl.DateTimeFormat('en-GB',{weekday:'long',day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Karachi'}).format(new Date());
}

function accountName(id){
  return state.accounts.find(a=>a.id===id)?.name||'Account';
}

function initial(name){
  return name.split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase()||'MS';
}

const empty=(label,ico='transactions')=>`<div class="empty">${icon(ico)}<p>${e(label)}</p></div>`;

function primary(action,label,ico='plus'){
  return canWrite()?`<button class="btn primary" data-action="${action}">${icon(ico)}${e(label)}</button>`:'';
}

function intro(title,subtitle,actions=''){
  return `<div class="page-intro"><div><div class="eyebrow">${e(longDate())}</div><h1>${title}</h1><p class="subtitle">${e(subtitle)}</p></div><div class="intro-actions">${actions}</div></div>`;
}

function periodTabs(){
  return `<div class="period-control" aria-label="Report period">${[['month','This month'],['30days','30 days'],['year','This year'],['all','All time']].map(([p,l])=>`<button class="${period===p?'active':''}" data-period="${p}" aria-pressed="${period===p}">${l}</button>`).join('')}</div>`;
}

function statusStrip(tabs=true){
  return `<div class="status-strip"><span class="status-label"><i class="status-dot live"></i>Cloud workspace · ${e(store.role)} access${!navigator.onLine?' · Offline':''}</span>${tabs?periodTabs():''}</div>`;
}

function getSavedConfig(){
  try{
    return JSON.parse(safeStorage('metri.firebase')||'null');
  }catch{
    return null;
  }
}

/* ==========================================================================
   RENDER DISPATCHER
   ========================================================================== */
function render(){
  const page=getPage();
  if(!isAuthenticated() || page==='login'){
    renderLoginPage();
    return;
  }
  renderDashboard(page);
}

/* ==========================================================================
   DEDICATED SEPARATE LOGIN SCREEN (PORTAL GATE)
   ========================================================================== */
function renderLoginPage(){
  const saved=getSavedConfig();
  const configStr=previousAuth.config||JSON.stringify(saved?.config||firebaseConfig||{apiKey:'',authDomain:'',projectId:'',appId:''},null,2);
  const isCreate=authTab==='create';

  if(isAuthenticated() && store.mode==='firebase'){
    app.innerHTML=`<div class="login-view">
      <div class="login-container" style="max-width:540px;display:block">
        <div class="login-form-panel" style="text-align:center;padding:48px 36px">
          <img src="./assets/metrisolution-mark.png" alt="MetriSolution" style="height:56px;margin:0 auto 16px;border-radius:12px;background:#fff;padding:4px;box-shadow:var(--shadow)">
          <div class="pill" style="margin:0 auto 16px;background:var(--green-soft);color:var(--green)">${icon('shield')} Connected to Cloud Workspace</div>
          <h1 style="font-size:24px;margin-bottom:8px">${e(state.company.name)}</h1>
          <p class="muted small" style="margin-bottom:24px">Signed in as <strong>${e(store.user.email)}</strong> (${e(store.role)} in <code>${e(store.id)}</code>)</p>
          <div style="display:flex;flex-direction:column;gap:10px">
            <a href="#overview" class="btn primary" style="justify-content:center">${icon('grid')} Open Company Dashboard</a>
            <button class="btn" data-action="logout" style="justify-content:center">${icon('logout')} Sign out of this account</button>
          </div>
        </div>
      </div>
    </div>`;
    return;
  }

  app.innerHTML=`<div class="login-view">
    <div class="login-container">
      <aside class="login-hero">
        <div class="login-hero-top">
          <img class="login-hero-logo" src="./assets/metrisolution-mark.png" alt="MetriSolution">
          <h1>MetriSolution<br><span style="color:#d8c2fa;font-weight:700">Company Khata</span></h1>
          <p>Modern company cashbook, multi-bank management, automated invoice tracking, and employee payroll in one clear system.</p>
        </div>
        <div class="login-features">
          <div class="login-feature-item">
            <span class="login-feature-icon">${icon('shield')}</span>
            <span>Real-time Cloud Sync with Firestore Security Rules</span>
          </div>
          <div class="login-feature-item">
            <span class="login-feature-icon">${icon('invoice')}</span>
            <span>Professional Invoicing System &amp; PDF Generation</span>
          </div>
          <div class="login-feature-item">
            <span class="login-feature-icon">${icon('layers')}</span>
            <span>Standardized Agency Services &amp; Packages Catalog</span>
          </div>
          <div class="login-feature-item">
            <span class="login-feature-icon">${icon('wallet')}</span>
            <span>Accurate multi-account bank &amp; petty cash ledgers</span>
          </div>
        </div>
        <div class="login-hero-footer">
          <span>${icon('lock')} MetriSolution Secure Cloud Portal</span>
          <span style="margin-left:auto">Authentication Required</span>
        </div>
      </aside>

      <main class="login-form-panel">
        <div class="login-tabs" role="tablist">
          <button type="button" class="login-tab-btn ${!isCreate?'active':''}" data-action="auth-tab-login" role="tab" aria-selected="${!isCreate}">Sign In</button>
          <button type="button" class="login-tab-btn ${isCreate?'active':''}" data-action="auth-tab-create" role="tab" aria-selected="${isCreate}">Create Workspace</button>
        </div>

        <h2 class="login-form-title">${isCreate?'Create company workspace':'Sign in to your company'}</h2>
        <p class="login-form-sub">${isCreate?'Register your business and establish your owner account.':'Enter your company workspace ID and credentials.'}</p>

        <form id="standalone-login-form">
          <div class="field">
            <label for="page-workspace-id">Workspace ID</label>
            <input id="page-workspace-id" name="workspaceId" type="text" value="${e(previousAuth.workspaceId||saved?.workspaceId||'metrisolution')}" required pattern="[a-zA-Z0-9_\-]{3,100}" maxlength="100" placeholder="e.g. metrisolution">
            <span class="help">Your unique company identifier (3–100 characters).</span>
          </div>

          ${isCreate?`<div class="field">
            <label for="page-company-name">Company Name</label>
            <input id="page-company-name" name="companyName" type="text" value="${e(previousAuth.companyName||'MetriSolution Pvt LTD')}" required maxlength="100" placeholder="e.g. MetriSolution Pvt LTD">
          </div>`:''}

          <div class="field">
            <label for="page-email">Email Address</label>
            <input id="page-email" name="email" type="email" value="${e(previousAuth.email||'')}" required autocomplete="username" placeholder="owner@metrisolution.com">
          </div>

          <div class="field">
            <label for="page-password">Password</label>
            <div class="password-wrap">
              <input id="page-password" name="password" type="${showPassword?'text':'password'}" required autocomplete="${isCreate?'new-password':'current-password'}" minlength="${isCreate?12:6}" placeholder="${isCreate?'At least 12 characters':'Your password'}">
              <button type="button" class="toggle-password" data-action="toggle-pwd" aria-label="${showPassword?'Hide password':'Show password'}">${icon(showPassword?'eyeoff':'eye')}</button>
            </div>
          </div>

          <div>
            <button type="button" class="config-toggle" data-action="toggle-config">${icon('settings')} Advanced: Firebase Configuration ${icon(showConfigDrawer?'chevron':'down')}</button>
            <div class="config-drawer ${showConfigDrawer?'open':''}">
              <div class="field" style="margin-top:6px">
                <label for="page-config">Firebase Web Configuration · JSON</label>
                <textarea id="page-config" name="config" rows="5" spellcheck="false" style="font-family:monospace;font-size:11px">${e(configStr)}</textarea>
                <span class="help">Pre-configured with MetriSolution project. Custom projects can override this JSON.</span>
              </div>
            </div>
          </div>

          <div class="form-error" role="alert"></div>

          <button class="btn primary full" type="submit" style="height:44px;font-size:14px;margin-top:10px">${icon(isCreate?'plus':'login')}${isCreate?'Create Workspace &amp; Sign in':'Sign in to Workspace'}</button>

          <div class="login-secure-notice" style="margin-top:20px;padding:12px;background:var(--surface-alt);border:1px solid var(--line);border-radius:8px;text-align:center">
            <span class="muted small" style="font-size:12px;display:flex;align-items:center;justify-content:center;gap:6px">
              ${icon('shield')} Secured with Firebase Authentication &amp; Firestore Security Rules.
            </span>
          </div>
        </form>
      </main>
    </div>
  </div>`;
}

/* ==========================================================================
   MAIN DASHBOARD SHELL
   ========================================================================== */
function renderDashboard(page){
  const s=summary(state,period);
  const pendingInvoices=state.invoices.filter(i=>i.paidPaisa<i.amountPaisa).length;

  app.innerHTML=`<div class="layout">
    <aside class="sidebar ${menuOpen?'open':''}" aria-label="Main navigation">
      <a class="brand" href="#overview">
        <img src="./assets/metrisolution-mark.png" alt="MetriSolution logo">
        <div>
          <div class="brand-name">MetriSolution</div>
          <div class="brand-sub">Company Khata</div>
        </div>
      </a>

      <div class="workspace-selector">
        <div class="workspace-square">${icon('building')}</div>
        <div>
          <strong>${e(state.company.name)}</strong>
          <small><i class="status-dot live"></i>Company workspace</small>
        </div>
      </div>

      <p class="nav-label">Workspace</p>
      <nav class="nav">
        ${[
          ['overview','grid','Financial overview'],
          ['invoices','invoice','Invoices &amp; receivables'],
          ['clients','user','Clients &amp; Retainers'],
          ['services','layers','Services &amp; Packages'],
          ['transactions','transactions','Transactions'],
          ['accounts','wallet','Company accounts'],
          ['team','team','Team &amp; payroll'],
          ['reports','report','Business reports']
        ].map(([p,i,label])=>`
          <a href="#${p}" class="${page===p?'active':''}" ${page===p?'aria-current="page"':''}>
            ${icon(i)}${label}
            ${p==='invoices'&&pendingInvoices?`<span class="nav-badge">${pendingInvoices}</span>`:''}
          </a>
        `).join('')}
      </nav>

      <hr class="sidebar-divider">
      <p class="nav-label">Manage</p>
      <nav class="nav">
        <a href="#settings" class="${page==='settings'?'active':''}">${icon('settings')}Workspace settings</a>
      </nav>

      <div class="sidebar-bottom">
        <div class="sidebar-note">
          <span class="mini-icon">${icon('shield')}</span>
          <strong>Cloud synced</strong>
          <p>Your company books sync in real-time with Firebase Firestore.</p>
          <button data-action="audit">${icon('clock')}Activity Log</button>
        </div>

        <div class="profile">
          <span class="avatar">${initial(store.user?.email||'MS')}</span>
          <div>
            <strong>${e(store.user?.email?.split('@')[0]||'MetriSolution')}</strong>
            <small>${e(store.role+' · '+store.id)}</small>
          </div>
          <button class="icon-button" data-action="logout" title="Sign out / Lock portal" aria-label="Sign out" style="margin-left:auto;color:var(--sidebar-muted)">
            ${icon('logout')}
          </button>
        </div>
      </div>
    </aside>

    <button class="mobile-scrim" data-action="menu" aria-label="Close navigation"></button>

    <main class="main">
      <header class="topbar">
        <button class="icon-button menu-toggle" data-action="menu" aria-label="Open navigation" aria-expanded="${menuOpen}">${icon('menu')}</button>
        <div class="breadcrumb">
          <span>Workspace</span>
          ${icon('chevron')}
          <span>${pageNames[page]||'Overview'}</span>
        </div>

        <div class="top-actions">
          <label class="search-box">
            ${icon('search')}
            <input id="global-search" placeholder="Search transactions…" aria-label="Search transactions">
            <span class="shortcut">⌘ K</span>
          </label>

          <span class="top-status-pill live">
            <span class="status-dot"></span>${e(store.id)}
          </span>

          <div class="top-separator"></div>

          <button class="icon-button" data-action="theme" aria-label="Toggle dark theme" title="Switch Theme">
            ${icon(document.body.classList.contains('theme-dark')?'sun':'moon')}
          </button>

          <button class="icon-button ${pendingInvoices?'unread':''}" data-action="due" aria-label="View unpaid invoices" title="${pendingInvoices} unpaid invoices">
            ${icon('bell')}
          </button>

          <button class="icon-button" data-action="logout" title="Sign out" aria-label="Sign out">
            ${icon('logout')}
          </button>
        </div>
      </header>

      <div class="content">
        <p class="print-heading">${e(state.company.name)} · Company Khata · ${longDate()}</p>
        ${renderPage(page)}
        <footer class="page-footer">
          <span>© ${new Date().getFullYear()} <strong>MetriSolution Pvt LTD</strong> · Your business, in balance.</span>
          <span><i class="footer-dot"></i>Firebase workspace &nbsp; · &nbsp; PKR</span>
        </footer>
      </div>
    </main>
  </div>`;
}

function renderPage(page){
  return ({
    overview,
    transactions: transactionsPage,
    accounts: accountsPage,
    invoices: invoicesPage,
    clients: clientsPage,
    services: servicesPage,
    team: teamPage,
    reports: reportsPage,
    settings: settingsPage
  }[page]||overview)();
}

/* ==========================================================================
   OVERVIEW PAGE
   ========================================================================== */
function metric(title,value,ico,tone,note,featured=false){
  return `<section class="card metric ${featured?'featured':''}">
    <div class="metric-title">
      <span>${title}</span>
      <span class="metric-icon ${tone}">${icon(ico)}</span>
    </div>
    <div class="metric-value" title="${fullMoney(value)}">
      <span class="currency">PKR</span>${money(value).length>10?money(value,true):money(value)}
    </div>
    <div class="metric-bottom">
      ${featured?`<span class="tiny-tag">${state.accounts.length} accounts</span>`:''}
      ${e(note)}
    </div>
  </section>`;
}

function overview(){
  const s=summary(state,period);
  return `${intro('Financial overview','A clear picture of what comes in, goes out, and stays.',`
    <a class="btn" href="#services">${icon('layers')}Services &amp; Packages</a>
    <button class="btn" data-action="export">${icon('export')}Export report</button>
    ${primary('add-transaction','Add transaction')}
  `)}
  ${statusStrip()}
  <div class="metric-grid">
    ${metric('Available balance',s.balance,'wallet','','Across all accounts · all time',true)}
    ${metric('Total income',s.income,'arrowdown','green',`${s.transactions} entries in selected period`)}
    ${metric('Total expenses',s.expenses,'arrowup','orange','Includes recorded salary payments')}
    ${metric('Unpaid invoices',s.receivables,'invoice','blue',`${state.invoices.filter(i=>i.paidPaisa<i.amountPaisa).length} invoices · all time`)}
  </div>
  <div class="middle-grid">
    ${cashflowCard()}
    ${expenseCard()}
  </div>
  <div class="bottom-grid">
    <section class="card table-card">
      <div class="card-header">
        <div>
          <h2>Recent transactions</h2>
          <p class="card-subtitle">Your latest company activity</p>
        </div>
        <a class="link-button" href="#transactions">View all ${icon('arrow')}</a>
      </div>
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>TRANSACTION</th>
              <th>DATE</th>
              <th>AMOUNT</th>
              <th>TYPE</th>
            </tr>
          </thead>
          <tbody>
            ${transactionRows(activeTransactions(state).sort(sortTx).slice(0,5),false)}
          </tbody>
        </table>
      </div>
      ${!state.transactions.length?empty('Your first transaction starts the story.'):''}
      <div class="table-footer">
        <span>Cash basis · recorded payments only</span>
        <span>PKR</span>
      </div>
    </section>
    ${accountsCompact()}
  </div>`;
}

function cashflowCard(){
  const s=summary(state,period), rows=cashflow(state,period);
  let a=0, b=0;
  const points=rows.map(r=>({...r,income:(a+=r.income),expense:(b+=r.expense)}));
  const max=Math.max(a,b,10000)*1.15, W=600, H=178, left=42, right=18, top=15, bottom=27;
  const pw=W-left-right, ph=H-top-bottom;
  const xy=(value,i)=>[left+(points.length<=1?pw:i*pw/(points.length-1)),top+ph-value/max*ph];
  const line=key=>points.map((p,i)=>`${i?'L':'M'}${xy(p[key],i).join(',')}`).join(' ');
  const area=key=>`${line(key)} L${W-right},${H-bottom} L${left},${H-bottom}Z`;

  return `<section class="card">
    <div class="card-header">
      <div>
        <h2>Cash flow</h2>
        <p class="card-subtitle">Cumulative income and expenses</p>
      </div>
      <div class="legend">
        <span class="legend-item"><i class="legend-dot"></i>Income</span>
        <span class="legend-item"><i class="legend-dot orange"></i>Expenses</span>
      </div>
    </div>
    <div class="chart-summary">
      <div><small>Money in</small><strong>PKR ${money(s.income)}</strong></div>
      <div class="divide"></div>
      <div><small>Money out</small><strong>PKR ${money(s.expenses)}</strong></div>
      <span class="pill" style="margin-left:auto">${s.surplus>=0?'+':''}${money(s.surplus,true)} surplus</span>
    </div>
    <div class="chart-area">
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Cumulative cash flow. Income ${fullMoney(a)}, expenses ${fullMoney(b)}.">
        <defs>
          <linearGradient id="income-fill" x1="0" y1="0" x2="0" y2="1">
            <stop stop-color="#7038db" stop-opacity=".18"/>
            <stop offset="1" stop-color="#7038db" stop-opacity="0"/>
          </linearGradient>
          <linearGradient id="expense-fill" x1="0" y1="0" x2="0" y2="1">
            <stop stop-color="#f59e0b" stop-opacity=".12"/>
            <stop offset="1" stop-color="#f59e0b" stop-opacity="0"/>
          </linearGradient>
        </defs>
        ${[0,.25,.5,.75,1].map(f=>`
          <line class="chart-grid" x1="${left}" x2="${W-right}" y1="${top+ph-f*ph}" y2="${top+ph-f*ph}"/>
          <text class="chart-text" x="${left-9}" y="${top+ph-f*ph+3}" text-anchor="end">${money(Math.round(max*f),true)}</text>
        `).join('')}
        ${points.length?`
          <path d="${area('income')}" fill="url(#income-fill)"/>
          <path d="${area('expense')}" fill="url(#expense-fill)"/>
          <path d="${line('income')}" stroke="#7038db" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="${line('expense')}" stroke="#f59e0b" stroke-width="2.3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        `:''}
        ${points.filter((_,i)=>i===0||i===points.length-1||i%Math.max(1,Math.ceil(points.length/7))===0).map(p=>`
          <text class="chart-text" text-anchor="middle" x="${xy(0,points.indexOf(p))[0]}" y="${H-5}">${p.label}</text>
        `).join('')}
      </svg>
    </div>
    <p class="chart-caption">Owner funding, withdrawals and internal transfers are excluded.${period==='all'?' Chart shows the last 12 active months.':''}</p>
  </section>`;
}

function expenseCard(){
  const groups=expenseGroups(state,period), total=groups.reduce((a,[,v])=>a+v,0);
  let offset=0;
  const shown=groups.slice(0,4);
  if(groups.length>4) shown.push(['Other',groups.slice(4).reduce((a,[,v])=>a+v,0)]);

  return `<section class="card">
    <div class="card-header">
      <div>
        <h2>Expense breakdown</h2>
        <p class="card-subtitle">Know where your money goes</p>
      </div>
      <span class="pill">${groups.length} categories</span>
    </div>
    <div class="expense-body">
      <div class="donut-area">
        <div class="donut-wrap">
          <svg viewBox="0 0 140 140" role="img" aria-label="Expense breakdown: ${shown.map(([l,n])=>e(l)+' '+fullMoney(n)).join(', ')}">
            <circle cx="70" cy="70" r="54" fill="none" stroke="var(--line)" stroke-width="16"/>
            ${shown.map(([,v],i)=>{
              const pct=v/(total||1)*100, el=`<circle cx="70" cy="70" r="54" fill="none" stroke="${colors[i%colors.length]}" stroke-width="16" pathLength="100" stroke-dasharray="${Math.max(0,pct-.7)} ${100-Math.max(0,pct-.7)}" stroke-dashoffset="${-offset}" transform="rotate(-90 70 70)"/>`;
              offset+=pct;
              return el;
            }).join('')}
          </svg>
          <div class="donut-center">
            <small>Total spent</small>
            <strong>${money(total,true)}</strong>
            <span class="donut-label">PKR</span>
          </div>
        </div>
        <div class="expense-legend">
          ${shown.length?shown.map(([l,n],i)=>`
            <div class="expense-legend-item">
              <i class="legend-dot" style="background:${colors[i%colors.length]}"></i>
              <span title="${e(l)}">${e(l)}</span>
              <strong>${Math.round(n/(total||1)*100)}%</strong>
            </div>
          `).join(''):'<span class="muted small">No expenses in this period.</span>'}
        </div>
      </div>
      <div class="insight">
        ${icon('spark')}
        <span>${groups.length?`${e(groups[0][0])} is your largest expense this period.`:'Add an expense to see your spending mix.'}</span>
      </div>
    </div>
  </section>`;
}

function accountsCompact(){
  const b=balances(state);
  return `<section class="card">
    <div class="card-header">
      <div>
        <h2>Your accounts</h2>
        <p class="card-subtitle">Every rupee, accounted for</p>
      </div>
      <a class="link-button" href="#accounts">Manage ${icon('arrow')}</a>
    </div>
    <div class="account-list">
      ${state.accounts.slice(0,3).map(a=>`
        <div class="account-item">
          <span class="account-logo ${a.type.toLowerCase()}">${icon(a.type==='Bank'?'bank':a.type==='Cash'?'cash':'wallet')}</span>
          <div>
            <strong>${e(a.name)}</strong>
            <small>${e(a.type)} account</small>
          </div>
          <span class="account-balance">${money(b[a.id])}</span>
        </div>
      `).join('')||empty('Add your first bank or cash account.','wallet')}
    </div>
    <div class="account-footer">
      ${icon('shield')}
      <span>Balances calculated from your ledger · PKR</span>
    </div>
  </section>`;
}

function sortTx(a,b){
  return b.date.localeCompare(a.date)||(b.createdAt||'').localeCompare(a.createdAt||'')||b.id.localeCompare(a.id);
}

function transactionRows(rows,detail=true){
  return rows.map(t=>{
    const reversed=state.reversals.some(r=>r.transactionId===t.id), isIn=['income','funding'].includes(t.kind), neutral=t.kind==='transfer';
    return `<tr class="${reversed?'reversal-row':''}">
      <td>
        <div class="transaction-description">
          <span class="tx-symbol ${neutral?'neutral':isIn?'':'out'}">${icon(neutral?'transactions':isIn?'arrowdown':'arrowup')}</span>
          <div>
            <strong>${e(t.description)}</strong>
            <small>${e(t.party||t.category)}</small>
          </div>
        </div>
      </td>
      <td class="muted">${dateLabel(t.date)}</td>
      <td class="amount ${neutral?'':isIn?'in':'out'}">${neutral?'':isIn?'+':'−'}${money(t.amountPaisa)}</td>
      <td><span class="badge ${reversed?'reversed':t.kind}">${reversed?'Reversed':kindNames[t.kind]}</span></td>
      ${detail?`
        <td class="muted">${e(accountName(t.accountId))}${neutral?' → '+e(accountName(t.toAccountId)):''}</td>
        <td>
          <button class="icon-button" data-action="view-transaction" data-id="${e(t.id)}" aria-label="View ${e(t.description)}">${icon('dots')}</button>
        </td>
      `:''}
    </tr>`;
  }).join('');
}

function filteredTx(){
  return state.transactions.filter(t=>
    (showReversed||!state.reversals.some(r=>r.transactionId===t.id))&&
    inPeriod(t,period)&&
    (kindFilter==='all'||t.kind===kindFilter)&&
    (accountFilter==='all'||t.accountId===accountFilter||t.toAccountId===accountFilter)&&
    (!query||[t.description,t.party,t.category,accountName(t.accountId),t.date].some(v=>String(v).toLowerCase().includes(query.toLowerCase())))
  ).sort(sortTx);
}

/* ==========================================================================
   SERVICES & PACKAGES PAGE (NEW SECTION)
   ========================================================================== */
function servicesPage(){
  const services = state.services || DEFAULT_SERVICES;
  const categories = ['all', 'AI & Media', 'Web Development', 'Design & Branding', 'Digital Marketing', 'Software & Apps'];
  const filtered = serviceFilter==='all' ? services : services.filter(s=>s.category===serviceFilter);

  return `${intro('Services &amp; Packages','Standardized digital solutions, scope of work, and official company packages.',`
    <button class="btn" data-action="add-service">${icon('plus')}Add Custom Service</button>
    <button class="btn primary" data-action="create-invoice">${icon('invoice')}Create New Invoice</button>
  `)}
  ${statusStrip(false)}

  <div class="segmented-filter">
    ${categories.map(c=>`
      <button class="${serviceFilter===c?'active':''}" data-action="filter-service" data-category="${e(c)}">
        ${c==='all'?'All Services ('+services.length+')':c}
      </button>
    `).join('')}
  </div>

  <div class="services-grid">
    ${filtered.map(srv=>`
      <div class="service-card">
        <div class="service-card-top">
          <div class="service-icon-box">${icon(srv.icon||'layers')}</div>
          <span class="pill">${e(srv.category)}</span>
        </div>
        <h2>${e(srv.name)}</h2>
        <p class="service-desc">${e(srv.description)}</p>

        <ul class="service-features-list">
          ${(srv.features||[]).map(f=>`
            <li>${icon('check')} <span>${e(f)}</span></li>
          `).join('')}
        </ul>

        <div class="service-packages-container">
          ${(srv.packages||[]).map(pkg=>`
            <div class="package-item">
              <div class="package-header">
                <strong>${e(pkg.name)}</strong>
                <span class="package-billing">${e(pkg.billing||'Package')}</span>
              </div>
              <p class="package-desc">${e(pkg.description)}</p>
              <div class="package-footer">
                <span class="package-price">${fullMoney(pkg.pricePaisa)}</span>
                <button class="package-btn" data-action="invoice-with-package" data-desc="${e(srv.name+' · '+pkg.name)}" data-rate="${pkg.pricePaisa/100}">
                  ${icon('invoice')}Bill this ${icon('arrow')}
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')}
  </div>`;
}

/* ==========================================================================
   INVOICES & RECEIVABLES PAGE
   ========================================================================== */
function getInvoiceWhatsAppUrl(i){
  let clientPhone = i.phone || '';
  if(!clientPhone && i.clientId){
    const cl = (state.clients||[]).find(c=>c.id===i.clientId);
    if(cl && cl.phone) clientPhone = cl.phone;
  }
  if(!clientPhone && i.client){
    const cl = (state.clients||[]).find(c=>c.name && c.name.trim().toLowerCase()===i.client.trim().toLowerCase());
    if(cl && cl.phone) clientPhone = cl.phone;
  }
  const cleanPhone = formatWhatsAppNumber(clientPhone);
  const companyName = state.company?.name || 'MetriSolution';
  const balancePaisa = Math.max(0, i.amountPaisa - (i.paidPaisa||0));
  const bank = i.bankInfo || state.company.bankInfo || DEFAULT_BANK_INFO;

  const msg = `*INVOICE: ${i.number}*\n` +
    `Hello *${i.client}*,\n\n` +
    `Here is your invoice summary from *${companyName}*:\n\n` +
    `📄 *Invoice #:* ${i.number}\n` +
    `📅 *Issue Date:* ${dateLabel(i.issued)}\n` +
    `⏰ *Due Date:* ${dateLabel(i.due)}\n` +
    `💰 *Total Amount:* PKR ${money(i.amountPaisa)}\n` +
    (balancePaisa > 0 ? `⚠️ *Balance Due:* PKR ${money(balancePaisa)}\n` : `✅ *Status:* Fully Paid\n`) +
    `\n🏦 *Bank Transfer Details:*\n` +
    `Bank Name: *${bank.bankName || 'United Bank Limited'}*\n` +
    `Account Title: *${bank.accountTitle || 'AbdulQadir'}*\n` +
    `Account #: *${bank.accountNumber || '0891302212516'}*\n` +
    `IBAN: *${bank.iban || 'PK98UNIL010900030221251'}*\n\n` +
    `_Please share payment confirmation / screenshot after transfer for quick verification._\n` +
    `Thank you!`;

  return cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
    : `https://wa.me/?text=${encodeURIComponent(msg)}`;
}

function invoicesPage(){
  const invoiced=state.invoices.reduce((a,i)=>a+i.amountPaisa,0);
  const received=state.invoices.reduce((a,i)=>a+i.paidPaisa,0);
  const outstanding=state.invoices.reduce((a,i)=>a+i.amountPaisa-i.paidPaisa,0);

  return `${intro('Invoices &amp; receivables','Keep track of client balances, payment terms and official PDF invoices.',`
    <a class="btn" href="#clients">${icon('user')}Clients &amp; Retainers</a>
    <a class="btn" href="#services">${icon('layers')}Services &amp; Packages</a>
    ${primary('create-invoice','Create Invoice (Generator)','plus')}
  `)}
  ${statusStrip(false)}
  <div class="report-stats">
    ${[
      ['Invoiced',invoiced,'blue'],
      ['Received',received,'green'],
      ['Outstanding',outstanding,'orange']
    ].map(([l,n,c])=>`
      <section class="card settings-card" style="border-top:3px solid var(--${c})">
        <p class="muted small">${l} · all time</p>
        <div class="report-number">${fullMoney(n)}</div>
      </section>
    `).join('')}
  </div>
  <section class="card table-card">
    <div class="card-header">
      <div>
        <h2>Client invoices</h2>
        <p class="card-subtitle">Generate, record partial payments and export professional PDF invoices</p>
      </div>
      <div style="display:flex;gap:10px;align-items:center">
        <button class="btn" data-action="run-monthly-invoicing" style="font-size:11px">${icon('spark')}Run AI Monthly Invoicing</button>
        <span class="pill">${state.invoices.length} total</span>
      </div>
    </div>
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>INVOICE / CLIENT</th>
            <th>DUE DATE (AUTO 15D)</th>
            <th>TOTAL · PKR</th>
            <th>OUTSTANDING</th>
            <th>STATUS</th>
            <th>ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          ${[...state.invoices].sort((a,b)=>b.issued.localeCompare(a.issued)).map(i=>`
            <tr>
              <td>
                <button class="link-button invoice-number" data-action="view-invoice" data-id="${i.id}"># ${e(i.number)}</button>
                <div class="muted small">${e(i.client)} ${i.isMonthlyRecurring?`<span class="pill" style="font-size:10px;background:var(--purple-subtle);color:var(--purple);margin-left:4px">Monthly Retainer</span>`:''}</div>
                ${i.discountPaisa>0?`<div class="muted small" style="color:#e11d48">Discount: PKR ${money(i.discountPaisa)}</div>`:''}
              </td>
              <td class="muted">${dateLabel(i.due)}</td>
              <td class="amount">${money(i.amountPaisa)}</td>
              <td class="amount ${i.paidPaisa<i.amountPaisa?'out':''}">${money(i.amountPaisa-i.paidPaisa)}</td>
              <td><span class="badge ${invoiceStatus(i)}">${invoiceStatus(i)}</span></td>
              <td>
                <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
                  <button class="link-button" data-action="view-invoice" data-id="${i.id}">
                    ${icon('print')} View / PDF
                  </button>
                  <a href="${getInvoiceWhatsAppUrl(i)}" target="_blank" rel="noopener" class="link-button" style="color:#16a34a;display:inline-flex;align-items:center;gap:4px;font-weight:600" title="Send invoice breakdown via WhatsApp">
                    ${icon('whatsapp')} WhatsApp
                  </a>
                  ${i.paidPaisa<i.amountPaisa&&canWrite()?`
                    <button class="link-button" data-action="pay-invoice" data-id="${i.id}">
                      Record payment ${icon('arrow')}
                    </button>
                  `:''}
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ${!state.invoices.length?empty('Create your first client invoice.','invoice'):''}
  </section>`;
}

/* ==========================================================================
   CLIENTS & MONTHLY RETAINERS PAGE
   ========================================================================== */
function clientsPage(){
  const allClients = state.clients || [];
  const monthlyClients = allClients.filter(c => c.type === 'monthly');
  const projectClients = allClients.filter(c => c.type === 'one-time');
  const mrrPaisa = monthlyClients.filter(c => c.status === 'active').reduce((a, c) => a + (c.monthlyRatePaisa || 0), 0);

  const displayedClients = clientFilter === 'monthly' ? monthlyClients :
    clientFilter === 'one-time' ? projectClients : allClients;

  return `${intro('Clients &amp; Monthly Retainers', 'Manage client profiles, monthly recurring service retainers and automated 1st-of-month AI invoicing.', `
    <button class="btn" data-action="run-monthly-invoicing">${icon('spark')}Run AI Monthly Invoicing</button>
    ${primary('add-client', 'Add New Client', 'plus')}
  `)}
  ${statusStrip(false)}

  <div class="report-stats">
    <section class="card settings-card" style="border-top:3px solid var(--purple)">
      <p class="muted small">Monthly Recurring Revenue (MRR)</p>
      <div class="report-number">${fullMoney(mrrPaisa)}<span style="font-size:13px;font-weight:500;color:var(--muted)"> / month</span></div>
    </section>
    <section class="card settings-card" style="border-top:3px solid var(--blue)">
      <p class="muted small">Active Monthly Retainers</p>
      <div class="report-number">${monthlyClients.filter(c=>c.status==='active').length} <span style="font-size:13px;font-weight:500;color:var(--muted)">clients</span></div>
    </section>
    <section class="card settings-card" style="border-top:3px solid var(--emerald)">
      <p class="muted small">Total Registered Clients</p>
      <div class="report-number">${allClients.length} <span style="font-size:13px;font-weight:500;color:var(--muted)">companies</span></div>
    </section>
  </div>

  <div class="segmented-filter">
    <button class="${clientFilter==='all'?'active':''}" data-action="filter-clients" data-filter="all">
      All Clients (${allClients.length})
    </button>
    <button class="${clientFilter==='monthly'?'active':''}" data-action="filter-clients" data-filter="monthly">
      ${icon('repeat')} Monthly Retainers (${monthlyClients.length})
    </button>
    <button class="${clientFilter==='one-time'?'active':''}" data-action="filter-clients" data-filter="one-time">
      ${icon('layers')} One-Time Projects (${projectClients.length})
    </button>
  </div>

  <section class="card table-card">
    <div class="card-header">
      <div>
        <h2>${clientFilter==='monthly'?'Monthly Retainer Clients (Recurring Services)':clientFilter==='one-time'?'One-Time Project Clients':'All Client Accounts'}</h2>
        <p class="card-subtitle">${clientFilter==='monthly'?'Clients billed automatically on the 1st of each month with 15-day payment terms':'Complete client profiles with contact details, billing engagement and service packages'}</p>
      </div>
      <div style="display:flex;gap:8px">
        <a class="btn" href="#invoices">${icon('invoice')}View All Invoices</a>
      </div>
    </div>

    ${displayedClients.length ? `
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>CLIENT / COMPANY</th>
              <th>CONTACT &amp; WHATSAPP</th>
              <th>SERVICE / PACKAGE</th>
              <th>BILLING MODEL</th>
              <th>RATE / MRR</th>
              <th>STATUS / 1ST OF MONTH</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            ${displayedClients.map(c => {
              const clientInvoices = (state.invoices||[]).filter(i => i.clientId === c.id || (i.client && i.client.trim().toLowerCase() === c.name.trim().toLowerCase()));
              const cleanPhone = formatWhatsAppNumber(c.phone);
              return `<tr>
                <td>
                  <strong style="font-size:14px;color:var(--ink)">${e(c.name)}</strong>
                  <div class="muted small">${e(c.city || 'Pakistan')} · ${clientInvoices.length} invoices</div>
                </td>
                <td>
                  <div><strong style="color:var(--ink)">${e(c.contactPerson || 'Direct Contact')}</strong></div>
                  ${c.phone ? `<div style="font-size:12px;color:var(--ink);font-weight:600;margin-top:2px">${e(c.phone)}</div>` : ''}
                  <div style="display:flex;gap:6px;align-items:center;margin-top:4px;flex-wrap:wrap">
                    ${c.email ? `<span class="muted small">${e(c.email)}</span>` : ''}
                    ${cleanPhone ? `
                      <a href="https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(c.name)}" target="_blank" rel="noopener" class="pill" style="font-size:11px;text-decoration:none;background:#25d36620;color:#16a34a;border:1px solid #25d36660;display:inline-flex;align-items:center;gap:4px;font-weight:600">
                        ${icon('whatsapp')} Chat
                      </a>
                    ` : `<span class="muted small" style="color:var(--muted)">No WhatsApp</span>`}
                  </div>
                </td>
                <td>
                  <strong>${e(c.serviceName || (c.type==='monthly'?'Monthly Retainer':'Custom Project'))}</strong>
                  ${c.monthlyDiscountPaisa > 0 ? `<div class="muted small" style="color:#e11d48">Discount: PKR ${money(c.monthlyDiscountPaisa)}/mo</div>` : ''}
                </td>
                <td>
                  ${c.type==='monthly' ? `
                    <span class="pill" style="background:var(--purple-subtle);color:var(--purple);border:1px solid var(--purple-border);font-weight:600">
                      ${icon('repeat')}Monthly (1st)
                    </span>
                  ` : `
                    <span class="pill">One-Time</span>
                  `}
                </td>
                <td class="amount">
                  ${c.type==='monthly' ? `<strong>PKR ${money(c.monthlyRatePaisa)}</strong><span class="muted small">/mo</span>` : '<span class="muted">Per Milestone</span>'}
                </td>
                <td>
                  <div style="display:flex;flex-direction:column;gap:4px">
                    <span class="badge ${c.status==='active'?'Paid':'Unpaid'}">${c.status==='active'?'Active':'Paused'}</span>
                    ${c.type==='monthly' ? `<span class="muted small" style="font-size:10px">Auto 15d Due</span>` : ''}
                  </div>
                </td>
                <td>
                  <div style="display:flex;gap:8px;align-items:center">
                    <button class="btn" style="padding:4px 8px;font-size:11px" data-action="create-client-invoice" data-id="${c.id}" title="Generate invoice for this client">
                      ${icon('invoice')}Invoice
                    </button>
                    <button class="icon-button" data-action="edit-client" data-id="${c.id}" title="Edit client profile">
                      ${icon('settings')}
                    </button>
                    <button class="icon-button" data-action="delete-client" data-id="${c.id}" title="Delete client">
                      ${icon('trash')}
                    </button>
                  </div>
                </td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    ` : empty('No clients found in this view. Click "Add New Client" to register one.', 'user')}
  </section>`;
}

function showAddClient(clientId = null){
  if(!canWrite()) return;
  const client = clientId ? (state.clients||[]).find(c=>c.id===clientId) : null;
  const services = state.services || DEFAULT_SERVICES;

  const flatPackages = [];
  services.forEach(s=>{
    (s.packages||[]).forEach(p=>{
      flatPackages.push({
        label: `${s.name} · ${p.name} (PKR ${money(p.pricePaisa)} / ${p.billing||'Billing'})`,
        name: `${s.name} - ${p.name}`,
        rate: (p.pricePaisa/100).toFixed(2)
      });
    });
  });

  const formBody = `<form id="client-form">
    <div class="form-grid">
      ${field('Business / Client Name','name','text',client?.name||'','required maxlength="120" placeholder="e.g. Yelo Beta"')}
      ${field('Contact Person','contactPerson','text',client?.contactPerson||'','placeholder="e.g. Hamza Farooq"')}
      ${field('Client Email','email','email',client?.email||'','placeholder="finance@yelobeta.com"')}
      ${field('Phone / WhatsApp','phone','text',client?.phone||'','placeholder="+92 300 1234567"')}
    </div>

    <div class="field" style="margin-top:10px">
      <label for="f-client-city">City / Address</label>
      <input id="f-client-city" name="city" value="${e(client?.city||'Karachi, Pakistan')}" placeholder="e.g. Karachi, Pakistan">
    </div>

    <div class="form-grid" style="margin-top:10px">
      <div class="field">
        <label for="f-client-type">Billing Engagement Model</label>
        <select id="f-client-type" name="type" required>
          <option value="monthly" ${client?.type!=='one-time'?'selected':''}>Monthly Retainer (Recurring Service)</option>
          <option value="one-time" ${client?.type==='one-time'?'selected':''}>One-Time Project</option>
        </select>
      </div>
      <div class="field">
        <label for="f-client-status">Subscription Status</label>
        <select id="f-client-status" name="status">
          <option value="active" ${client?.status!=='paused'?'selected':''}>Active</option>
          <option value="paused" ${client?.status==='paused'?'selected':''}>Paused</option>
        </select>
      </div>
    </div>

    <div id="monthly-options-box" style="margin-top:14px;background:var(--surface-alt);border:1px solid var(--purple-border);border-radius:10px;padding:16px;${client?.type==='one-time'?'display:none':''}">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
        <span style="color:var(--purple)">${icon('repeat')}</span>
        <strong style="font-size:13px;color:var(--ink)">Monthly Retainer Configuration</strong>
        <span class="pill" style="font-size:10px;background:var(--purple-subtle);color:var(--purple);margin-left:auto">Auto 1st of Month</span>
      </div>

      <div class="field" style="margin-bottom:10px">
        <label for="f-pkg-quick">Select Monthly Service Package</label>
        <select id="f-pkg-quick" style="height:36px;font-size:12px">
          <option value="">+ Choose from MetriSolution 9 Services…</option>
          ${flatPackages.map((p,idx)=>`<option value="${idx}">${e(p.label)}</option>`).join('')}
        </select>
      </div>

      <div class="field" style="margin-bottom:10px">
        <label for="f-service-name">Service / Retainer Description</label>
        <input id="f-service-name" name="serviceName" value="${e(client?.serviceName||'Digital Marketing Package MetGrow')}" placeholder="e.g. Social Media Marketing or Website Maintenance">
      </div>

      <div class="form-grid">
        <div class="field">
          <label for="f-monthly-rate">Monthly Fee (PKR)</label>
          <input id="f-monthly-rate" name="monthlyRate" type="number" min="1" step="0.01" value="${client?.monthlyRatePaisa?(client.monthlyRatePaisa/100).toFixed(2):'25000.00'}" required>
        </div>
        <div class="field">
          <label for="f-monthly-discount">Monthly Discount (PKR)</label>
          <input id="f-monthly-discount" name="monthlyDiscount" type="number" min="0" step="0.01" value="${client?.monthlyDiscountPaisa?(client.monthlyDiscountPaisa/100).toFixed(2):'0.00'}">
        </div>
      </div>

      <div class="form-grid" style="margin-top:10px">
        <div class="field">
          <label for="f-billing-day">Billing Cycle Day</label>
          <input id="f-billing-day" name="billingDay" value="1" readonly style="background:var(--surface);cursor:not-allowed">
          <small class="muted">Generated on the 1st of each month</small>
        </div>
        <div class="field">
          <label for="f-payment-terms">Payment Terms</label>
          <input id="f-payment-terms" name="paymentTerms" value="${e(client?.paymentTerms||'Net 15')}" placeholder="Net 15">
          <small class="muted">Auto 15 days due date</small>
        </div>
      </div>

      <label style="display:flex;align-items:center;gap:8px;margin-top:12px;font-size:12px;color:var(--ink);cursor:pointer">
        <input type="checkbox" name="autoInvoice" ${client?.autoInvoice!==false?'checked':''}>
        <strong>Auto-generate invoice by AI on the 1st of each month</strong>
      </label>
    </div>

    <div class="field" style="margin-top:14px">
      <label for="f-client-notes">Notes &amp; Project Requirements</label>
      <input id="f-client-notes" name="notes" value="${e(client?.notes||'')}" placeholder="Internal notes or specific deliverables...">
    </div>

    ${formEnd(client?'Update Client':'Save Client Profile')}
  </form>`;

  modal(client ? 'Edit Client Profile' : 'New Client & Retainer Profile', 'Set up client contact, monthly recurring service retainers and automated 1st-of-month invoicing.', formBody, {
    wide: true,
    submit: async d => {
      const type = d.get('type');
      const rateVal = d.get('monthlyRate');
      const discVal = d.get('monthlyDiscount');
      const monthlyRatePaisa = (type === 'monthly' && rateVal) ? toPaisa(rateVal) : 0;
      const monthlyDiscountPaisa = (type === 'monthly' && discVal && Number(discVal) > 0) ? toPaisa(discVal) : 0;

      const clientData = {
        name: d.get('name').trim(),
        contactPerson: d.get('contactPerson')?.trim() || '',
        email: d.get('email')?.trim() || '',
        phone: d.get('phone')?.trim() || '',
        city: d.get('city')?.trim() || 'Karachi, Pakistan',
        type: type,
        status: d.get('status') || 'active',
        serviceName: d.get('serviceName')?.trim() || '',
        monthlyRatePaisa: monthlyRatePaisa,
        monthlyDiscountPaisa: monthlyDiscountPaisa,
        billingDay: 1,
        paymentTerms: d.get('paymentTerms')?.trim() || 'Net 15',
        autoInvoice: d.get('autoInvoice') === 'on',
        notes: d.get('notes')?.trim() || ''
      };

      if(client){
        await store.updateClient(client.id, clientData);
        toast(`Client profile for "${clientData.name}" updated.`);
      }else{
        await store.addClient(clientData);
        toast(`New client "${clientData.name}" added successfully.`);
      }
      closeModal();
      render();
    }
  });

  $('#f-client-type')?.addEventListener('change', ev => {
    const box = $('#monthly-options-box');
    if(box) box.style.display = ev.target.value === 'monthly' ? 'block' : 'none';
  });

  $('#f-pkg-quick')?.addEventListener('change', ev => {
    const idx = ev.target.value;
    if(idx !== ''){
      const pkg = flatPackages[Number(idx)];
      if(pkg){
        const srvInp = $('#f-service-name');
        const rateInp = $('#f-monthly-rate');
        if(srvInp) srvInp.value = pkg.name;
        if(rateInp) rateInp.value = pkg.rate;
      }
    }
  });
}

/* ==========================================================================
   TRANSACTIONS PAGE
   ========================================================================== */
function transactionsPage(){
  const rows=filteredTx();
  return `${intro('Transactions','A complete trail of your company’s money movements.',`
    <button class="btn" data-action="export-ledger">${icon('export')}Export CSV</button>
    ${primary('add-transaction','Add transaction')}
  `)}
  ${statusStrip()}
  <div class="toolbar">
    <input id="tx-search" aria-label="Search ledger" placeholder="Search description, person or category…" value="${e(query)}">
    <select id="kind-filter" aria-label="Transaction type">
      <option value="all">All types</option>
      ${Object.entries(kindNames).map(([v,l])=>`<option value="${v}" ${kindFilter===v?'selected':''}>${l}</option>`).join('')}
    </select>
    <select id="account-filter" aria-label="Account">
      <option value="all">All accounts</option>
      ${state.accounts.map(a=>`<option value="${e(a.id)}" ${accountFilter===a.id?'selected':''}>${e(a.name)}</option>`).join('')}
    </select>
    <label class="small muted" style="display:inline-flex;align-items:center;gap:6px;cursor:pointer">
      <input type="checkbox" id="show-reversed" ${showReversed?'checked':''}> Show reversed
    </label>
  </div>
  <section class="card table-card">
    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>TRANSACTION</th>
            <th>DATE</th>
            <th>AMOUNT · PKR</th>
            <th>TYPE</th>
            <th>ACCOUNT</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="tx-body">${transactionRows(rows)}</tbody>
      </table>
    </div>
    <div id="tx-empty">${!rows.length?empty('No transactions match these filters.'):''}</div>
    <div class="table-footer">
      <span id="tx-count">${rows.length} entries</span>
      <span>Original entries are preserved when reversed</span>
    </div>
  </section>`;
}

function updateTxSearch(){
  const rows=filteredTx();
  $('#tx-body').innerHTML=transactionRows(rows);
  $('#tx-count').textContent=`${rows.length} entries`;
  $('#tx-empty').innerHTML=rows.length?'':empty('No transactions match these filters.');
}

/* ==========================================================================
   ACCOUNTS PAGE
   ========================================================================== */
function accountsPage(){
  const b=balances(state);
  return `${intro('Company accounts','Bank, cash and digital wallets. One reliable balance.',`
    ${primary('transfer','Transfer money','transactions')}
    ${primary('add-account','Add account')}
  `)}
  ${statusStrip(false)}
  <div class="page-grid">
    ${state.accounts.map(a=>`
      <section class="card account-card">
        <div class="account-top">
          <span class="account-logo ${a.type.toLowerCase()}">${icon(a.type==='Bank'?'bank':a.type==='Cash'?'cash':'wallet')}</span>
          <span class="pill">${e(a.type)}</span>
        </div>
        <h2>${e(a.name)}</h2>
        <p class="muted small">Current account balance</p>
        <div class="big-balance"><span class="muted small" style="font-size:14px">PKR</span> ${money(b[a.id])}</div>
        <div class="account-breakdown">
          <span>Opening balance</span>
          <strong>${fullMoney(a.openingPaisa)}</strong>
        </div>
        <div class="account-breakdown" style="margin-top:10px">
          <span>Net movement</span>
          <strong class="${b[a.id]-a.openingPaisa>=0?'positive':'negative'}">${fullMoney(b[a.id]-a.openingPaisa)}</strong>
        </div>
      </section>
    `).join('')}
  </div>
  ${!state.accounts.length?`<section class="card">${empty('Add your first account with its opening balance.','wallet')}</section>`:''}
  <div class="note">Account balances include all recorded dates. Transfers move money between accounts without changing company income or expenses. Opening balances are fixed; use a documented transaction for later corrections.</div>`;
}

/* ==========================================================================
   TEAM & PAYROLL PAGE
   ========================================================================== */
function teamPage(){
  const tx=activeTransactions(state).filter(t=>t.kind==='salary'&&inPeriod(t,'month'));
  const slips=[...(state.salarySlips||[])].sort((a,b)=>(b.issueDate||'').localeCompare(a.issueDate||''));

  return `${intro('Team & payroll','People behind the work. Payments with a clear record.',`
    <button class="btn" data-action="create-salary-slip" style="background:var(--purple-soft);color:var(--purple);border:1px solid var(--purple-border)">
      ${icon('slip')}Create salary slip
    </button>
    ${canWrite()?primary('add-employee','Add team member'):''}
  `)}
  ${statusStrip(false)}
  <div class="inline-alert">${icon('clock')} Monthly payroll tracks actual salary payments. Team records are separate from login access.</div>
  <div class="page-grid">
    ${state.employees.map(emp=>{
      const paid=tx.filter(t=>t.employeeId===emp.id).reduce((a,t)=>a+t.amountPaisa,0), due=Math.max(0,emp.salaryPaisa-paid);
      return `<section class="card employee-card">
        <div class="employee-top">
          <span class="avatar">${e(initial(emp.name))}</span>
          <div>
            <h2>${e(emp.name)}</h2>
            <p class="muted small">${e(emp.role)}</p>
          </div>
        </div>
        <div class="salary-row">
          <span>Monthly salary</span>
          <strong>${fullMoney(emp.salaryPaisa)}</strong>
        </div>
        <div class="salary-row">
          <span>Paid this month</span>
          <strong class="positive">${fullMoney(paid)}</strong>
        </div>
        <div class="salary-progress">
          <span style="width:${emp.salaryPaisa?Math.min(100,paid/emp.salaryPaisa*100):0}%"></span>
        </div>
        <div class="salary-row">
          <span>Remaining this month</span>
          <strong>${fullMoney(due)}</strong>
        </div>
        <div style="display:flex;gap:8px;margin-top:10px;">
          ${canWrite()?`
            <button class="btn ${due?'primary':''}" style="flex:1" data-action="pay-salary" data-id="${emp.id}" ${!due?'disabled':''}>
              ${icon(due?'wallet':'check')}${due?'Record payment':'Settled'}
            </button>
          `:''}
          <button class="btn" style="flex:1" data-action="create-salary-slip" data-id="${emp.id}" title="Generate digital salary slip">
            ${icon('slip')}Salary slip
          </button>
        </div>
      </section>`;
    }).join('')}
  </div>
  ${!state.employees.length?`<section class="card">${empty('Add your team to track monthly salary payments.','team')}</section>`:''}

  <!-- Digital Salary Slips Management Section -->
  <section class="card table-card" style="margin-top:28px">
    <div class="table-header" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;padding:16px 20px;border-bottom:1px solid var(--line)">
      <div>
        <h2 style="font-size:17px;font-weight:750;margin:0 0 2px;color:var(--ink)">Digital Salary Slips</h2>
        <p class="muted small" style="margin:0">Official company payslips with PDF download, print, WhatsApp sharing, and optional cashbook deduction.</p>
      </div>
      <button class="btn primary small" data-action="create-salary-slip">
        ${icon('plus')}New salary slip
      </button>
    </div>
    ${slips.length ? `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Slip #</th>
              <th>Employee</th>
              <th>Pay Period</th>
              <th>Issue Date</th>
              <th style="text-align:right">Net Salary</th>
              <th>Cashbook Status</th>
              <th style="text-align:right">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${slips.map(s => `
              <tr>
                <td>
                  <a href="#" data-action="view-salary-slip" data-id="${s.id}" style="font-weight:700;color:var(--purple);text-decoration:none">
                    #${e(s.slipNumber)}
                  </a>
                </td>
                <td>
                  <div style="font-weight:650">${e(s.employeeName)}</div>
                  <div class="muted small">${e(s.role || '')}</div>
                </td>
                <td>
                  <span class="pill" style="font-size:11px;font-weight:600">${e(s.periodLabel || s.month)}</span>
                </td>
                <td>${new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric'}).format(new Date(s.issueDate+'T12:00:00Z'))}</td>
                <td style="text-align:right;font-weight:700;color:var(--ink)">
                  ${fullMoney(s.netSalaryPaisa)}
                </td>
                <td>
                  ${s.deductFromAccount ? `
                    <span class="badge" style="background:var(--green-soft);color:var(--green);border:1px solid var(--green-border);font-size:11px">
                      ${icon('check')} Deducted (${e(s.accountName || 'Account')})
                    </span>
                  ` : `
                    <span class="badge" style="background:var(--blue-soft);color:var(--blue);border:1px solid var(--blue-border);font-size:11px">
                      Standalone / Historical
                    </span>
                  `}
                </td>
                <td style="text-align:right">
                  <div style="display:inline-flex;gap:4px">
                    <button class="icon-button" data-action="view-salary-slip" data-id="${s.id}" title="View salary slip">
                      ${icon('eye')}
                    </button>
                    <button class="icon-button" data-action="download-salary-slip-pdf" data-id="${s.id}" title="Download PDF">
                      ${icon('download')}
                    </button>
                    <button class="icon-button" data-action="print-salary-slip" data-id="${s.id}" title="Print / System PDF">
                      ${icon('print')}
                    </button>
                    <a href="${getSalarySlipWhatsAppUrl(s)}" target="_blank" rel="noopener" class="icon-button" title="Send on WhatsApp">
                      ${icon('whatsapp')}
                    </a>
                    ${canWrite()?`
                      <button class="icon-button" style="color:var(--red)" data-action="delete-salary-slip" data-id="${s.id}" title="Delete slip">
                        ${icon('trash')}
                      </button>
                    `:''}
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : `
      <div style="padding:32px 20px;text-align:center">
        <p class="muted" style="margin-bottom:12px">No salary slips created yet.</p>
        <button class="btn" data-action="create-salary-slip">
          ${icon('plus')}Create your first salary slip
        </button>
      </div>
    `}
  </section>

  <p class="note" style="margin-top:16px">A salary payment is an expense. The monthly salary is a target and does not reduce cash until a payment is recorded. Salary paid is grouped by payment date.</p>`;
}

/* ==========================================================================
   REPORTS PAGE
   ========================================================================== */
function reportsPage(){
  const s=summary(state,period), tx=activeTransactions(state).filter(t=>inPeriod(t,period));
  return `${intro('Business reports','The numbers that help you make your next decision.',`
    <button class="btn" data-action="print">${icon('print')}Print / PDF</button>
    <button class="btn primary" data-action="export">${icon('export')}Export report</button>
  `)}
  ${statusStrip()}
  <div class="report-stats">
    ${[['Operating income',s.income],['Operating expenses',s.expenses],['Operating surplus',s.surplus]].map(([l,n])=>`
      <section class="card settings-card">
        <span class="muted small">${l}</span>
        <div class="report-number ${l.includes('surplus')?(n>=0?'positive':'negative'):''}">${fullMoney(n)}</div>
      </section>
    `).join('')}
  </div>
  <div class="middle-grid">
    ${cashflowCard()}
    ${expenseCard()}
  </div>
  <section class="card table-card">
    <div class="card-header">
      <h2>Cash movement summary</h2>
      <span class="pill">${tx.length} entries</span>
    </div>
    <table>
      <thead>
        <tr>
          <th>MOVEMENT</th>
          <th style="text-align:right">AMOUNT · PKR</th>
        </tr>
      </thead>
      <tbody>
        ${[
          ['Income received',s.income],
          ['Expenses & salary payments',-s.expenses],
          ['Owner contributions',s.funding],
          ['Owner withdrawals',-s.drawings],
          ['Net cash movement',s.income-s.expenses+s.funding-s.drawings],
          ['Current total cash · all dates',s.balance],
          ['Outstanding invoices · all dates',s.receivables]
        ].map(([l,n])=>`
          <tr>
            <td>${l}</td>
            <td class="amount" style="text-align:right">${money(n)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </section>
  <p class="note">Cash-basis management report. Unpaid invoices are shown separately; opening balances, owner contributions, withdrawals and internal transfers are excluded from operating surplus. This is a company cashbook, not statutory double-entry accounting.</p>`;
}

/* ==========================================================================
   SETTINGS PAGE
   ========================================================================== */
function settingsPage(){
  const bank = state.company.bankInfo || DEFAULT_BANK_INFO;
  return `${intro('Workspace settings','Make this workspace feel like your company and configure your bank details.')}
  ${statusStrip(false)}
  <div class="settings-grid">
    <section class="card settings-card">
      <h2>Company &amp; Bank Profile</h2>
      <p class="muted small">These details appear on your generated invoices and official receipts.</p>
      <form id="company-form">
        <div class="field">
          <label for="company-name">Company name</label>
          <input id="company-name" name="name" value="${e(state.company.name)}" required maxlength="100" ${store.role!=='owner'?'disabled':''}>
        </div>
        <div class="form-grid">
          <div class="field">
            <label for="bank-name">Bank Name</label>
            <input id="bank-name" name="bankName" value="${e(bank.bankName)}" placeholder="e.g. United Bank Limited">
          </div>
          <div class="field">
            <label for="account-title">Account Title</label>
            <input id="account-title" name="accountTitle" value="${e(bank.accountTitle)}" placeholder="e.g. AbdulQadir">
          </div>
          <div class="field">
            <label for="account-number">Account Number</label>
            <input id="account-number" name="accountNumber" value="${e(bank.accountNumber)}" placeholder="e.g. 0891302212516">
          </div>
          <div class="field">
            <label for="iban-number">IBAN Number</label>
            <input id="iban-number" name="iban" value="${e(bank.iban)}" placeholder="e.g. PK98UNIL010900030221251">
          </div>
        </div>
        <button class="btn primary" ${store.role!=='owner'?'disabled':''}>${icon('check')}Save profile &amp; bank details</button>
        <div class="form-error" role="alert"></div>
      </form>
    </section>

    <section class="card settings-card">
      <div class="settings-header">
        <span class="avatar" style="background:var(--green-soft);color:var(--green)">${icon('shield')}</span>
        <div>
          <h2>Firebase connected</h2>
          <p class="muted small">Authenticated company workspace protected by Cloud Firestore Security Rules.</p>
        </div>
      </div>
      <div class="detail-list" style="margin-top:14px">
        <div><dt>Data mode</dt><dd>Cloud Firestore</dd></div>
        <div><dt>Workspace ID</dt><dd><code>${e(store.id||'metrisolution')}</code></dd></div>
        <div><dt>Account</dt><dd>${e(store.user?.email||'metrisolution.team@gmail.com')}</dd></div>
        <div><dt>Your role</dt><dd><span class="badge" style="background:var(--purple-soft);color:var(--purple)">${e(store.role||'owner')}</span></dd></div>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px">
        <a class="btn primary" href="#login">${icon('login')}Switch Account / Sign In</a>
        <button class="btn" data-action="logout">${icon('logout')}Sign out &amp; Lock Portal</button>
        <button class="btn" data-action="audit">${icon('clock')}Activity log</button>
      </div>
    </section>

    <section class="card settings-card">
      <h2>Your brand theme</h2>
      <p class="muted small">Vibrant fintech styling with MetriSolution purple, expense amber, and account blue.</p>
      <div class="token-grid">
        ${[['Purple','#7038DB'],['Amber','#F59E0B'],['Blue','#3B82F6'],['Canvas','#F8FAFC'],['Sidebar','#0D121F']].map(([n,c])=>`
          <div class="color-token"><i style="background:${c};border:1px solid #ddd2"></i>${n}<br>${c}</div>
        `).join('')}
      </div>
      <button class="btn" data-action="theme">${icon('sun')}Switch light / dark theme</button>
    </section>

    <section class="card settings-card">
      <h2>Records &amp; backups</h2>
      <p class="muted small">Export the full workspace as JSON for record keeping, or use CSV exports for your spreadsheet workflow.</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn" data-action="backup">${icon('export')}Download backup</button>
        <button class="btn" data-action="audit">${icon('clock')}Activity log</button>
      </div>
    </section>
  </div>`;
}

/* ==========================================================================
   MODAL ENGINE
   ========================================================================== */
function modal(title,subtitle,body,{wide=false,submit}={}){
  lastFocus=document.activeElement;
  document.body.style.overflow='hidden';
  $('#modal-root').innerHTML=`<div class="modal-overlay">
    <section class="modal ${wide?'wide':''}" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div class="modal-header">
        <div>
          <h2 id="modal-title">${e(title)}</h2>
          ${subtitle?`<p>${e(subtitle)}</p>`:''}
        </div>
        <button class="icon-button" data-action="close-modal" aria-label="Close dialog">${icon('close')}</button>
      </div>
      <div class="modal-body">${body}</div>
    </section>
  </div>`;

  const form=$('#modal-root form');
  if(form&&submit){
    form.addEventListener('submit',async ev=>{
      ev.preventDefault();
      const error=form.querySelector('.form-error'), button=form.querySelector('button[type="submit"]');
      if(error){
        error.textContent='';
        error.classList.remove('visible');
      }
      if(button) button.disabled=true;
      try{
        await submit(new FormData(form),form);
      }catch(err){
        if(error){
          error.textContent=friendlyError(err);
          error.classList.add('visible');
        }else{
          toast(friendlyError(err),true);
        }
      }finally{
        if(button) button.disabled=false;
      }
    });
  }
  requestAnimationFrame(()=>$('#modal-root input:not([disabled]), #modal-root select, #modal-root textarea, #modal-root button')?.focus());
}

function closeModal(){
  const old=$('#modal-root');
  old.innerHTML='';
  document.body.style.overflow='';
  lastFocus?.focus?.();
}

function field(label,name,type='text',value='',extra=''){
  return `<div class="field"><label for="f-${name}">${label}</label><input id="f-${name}" name="${name}" type="${type}" value="${e(value)}" ${extra}></div>`;
}

function select(label,name,options,selected=''){
  return `<div class="field"><label for="f-${name}">${label}</label><select id="f-${name}" name="${name}">${options.map(([v,l])=>`<option value="${e(v)}" ${v===selected?'selected':''}>${e(l)}</option>`).join('')}</select></div>`;
}

const formEnd=(label='Save record')=>`<div class="form-error" role="alert"></div><div class="modal-actions"><button class="btn" type="button" data-action="close-modal">Cancel</button><button class="btn primary" type="submit">${icon('check')}${label}</button></div>`;

function ensureAccounts(){
  if(!state.accounts.length){
    toast('Add a company account first.');
    showAddAccount();
    return false;
  }
  return true;
}

/* ==========================================================================
   INVOICE GENERATOR & PREVIEW SYSTEM (EXACT INVOICE-GENERATOR.COM STYLE)
   ========================================================================== */
function showInvoiceCreator(defaultItemDesc='', defaultRate='', defaultClientId=''){
  if(!canWrite()) return;
  const bank = state.company.bankInfo || DEFAULT_BANK_INFO;
  const services = state.services || DEFAULT_SERVICES;
  const nextNum = '0' + (state.invoices.length + 231);
  const defaultDueDate = addDays(today(), 15);

  const flatPackages = [];
  services.forEach(s=>{
    (s.packages||[]).forEach(p=>{
      flatPackages.push({
        label: `${s.name} · ${p.name} (PKR ${money(p.pricePaisa)})`,
        desc: `${s.name} - ${p.name}`,
        rate: (p.pricePaisa/100).toFixed(2)
      });
    });
  });

  const formBody = `<form id="invoice-builder-form">
    <div style="margin-bottom:14px;background:var(--surface-alt);border:1px solid var(--purple-border);border-radius:8px;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
      <div>
        <strong style="font-size:12px;color:var(--ink)">Client Profile Quick-Select:</strong>
        <div class="muted small">Quick-fill registered clients and monthly retainers</div>
      </div>
      <select id="quick-client-picker" style="height:32px;font-size:12px;padding:4px 10px;border-radius:6px;border:1px solid var(--line);background:var(--surface)">
        <option value="">+ Manual / Custom Client</option>
        ${(state.clients||[]).map(c=>`<option value="${c.id}" ${defaultClientId===c.id?'selected':''}>${e(c.name)} (${c.type==='monthly'?'Monthly Retainer':'One-Time Project'})</option>`).join('')}
      </select>
    </div>

    <div class="form-grid">
      ${field('Invoice #','number','text',nextNum,'required')}
      ${field('Issue Date','issued','date',today(),'required')}
      ${field('Due Date (Auto 15 Days)','due','date',defaultDueDate,'required')}
      ${field('Payment Terms','paymentTerms','text','Net 15','placeholder="e.g. Net 15 or 1872"')}
    </div>

    <div class="form-grid" style="margin-top:10px">
      ${field('Bill To (Client / Company)','client','text','','required maxlength="120" placeholder="e.g. FaToyz or Yelo Beta"')}
      ${field('Client Email','email','email','','placeholder="client@company.com"')}
      ${field('Client Phone / WhatsApp','phone','text','','placeholder="+92 300 1234567 or 03001234567"')}
      ${field('Billing Model / Service','billingNote','text','','placeholder="e.g. Monthly Retainer"')}
    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;margin:18px 0 8px">
      <h3 style="font-size:14px;color:var(--ink)">Line Items</h3>
      <div style="display:flex;gap:8px">
        <select id="quick-package-picker" style="height:32px;font-size:11px;padding:4px 8px;border-radius:6px;border:1px solid var(--line);background:var(--surface)">
          <option value="">+ Add from Services &amp; Packages…</option>
          ${flatPackages.map((p,idx)=>`<option value="${idx}">${e(p.label)}</option>`).join('')}
        </select>
        <button type="button" class="btn" id="btn-add-line-item" style="font-size:11px;padding:4px 10px">${icon('plus')}Add Item</button>
      </div>
    </div>

    <div class="table-scroll" style="margin-bottom:12px">
      <table class="creator-line-items-table">
        <thead>
          <tr>
            <th style="width:50%">ITEM / DESCRIPTION</th>
            <th style="width:15%">QTY</th>
            <th style="width:20%">RATE (PKR)</th>
            <th style="width:15%">AMOUNT</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="line-items-body">
          <tr class="line-item-row">
            <td><input class="item-desc" name="itemDesc[]" required placeholder="Description of service or product" value="${e(defaultItemDesc||'Digital Marketing Package MetGrow')}"></td>
            <td><input class="item-qty" name="itemQty[]" type="number" min="1" step="1" value="1" required style="text-align:center"></td>
            <td><input class="item-rate" name="itemRate[]" type="number" min="0.01" step="0.01" value="${e(defaultRate||'25000.00')}" required style="text-align:right"></td>
            <td class="item-amount" style="font-weight:750;text-align:right">PKR 25,000.00</td>
            <td style="text-align:center"><button type="button" class="icon-button btn-remove-line" aria-label="Remove">${icon('trash')}</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="creator-subtotal-panel">
      <div class="creator-subtotal-box">
        <div class="line-sum">
          <span>Subtotal:</span>
          <strong id="calc-subtotal">PKR 25,000.00</strong>
        </div>
        <div class="line-sum" style="align-items:center">
          <label style="font-size:12px;color:var(--muted)">Discount (PKR):</label>
          <input id="calc-discount-input" name="discountAmount" type="number" min="0" step="0.01" value="0.00" style="width:110px;height:28px;text-align:right;font-size:12px">
        </div>
        <div class="line-sum total-line">
          <span>Total:</span>
          <strong id="calc-total">PKR 25,000.00</strong>
        </div>
        <div class="line-sum">
          <label style="font-size:12px;color:var(--muted)">Amount Paid:</label>
          <input id="calc-paid-input" name="paidAmount" type="number" min="0" step="0.01" value="0.00" style="width:110px;height:28px;text-align:right;font-size:12px">
        </div>
        <div class="line-sum due-line">
          <span>Balance Due:</span>
          <strong id="calc-balance-due">PKR 25,000.00</strong>
        </div>
      </div>
    </div>

    <h3 style="font-size:13px;color:var(--ink);margin:14px 0 6px">Bank Transfer Information</h3>
    <div class="form-grid">
      ${field('Bank Name','bankName','text',bank.bankName||'United Bank Limited')}
      ${field('Account Title','accountTitle','text',bank.accountTitle||'AbdulQadir')}
      ${field('Account Number','accountNumber','text',bank.accountNumber||'0891302212516')}
      ${field('IBAN Number','iban','text',bank.iban||'PK98UNIL010900030221251')}
    </div>

    <div class="field">
      <label for="f-note">Verification Note</label>
      <input id="f-note" name="note" value="${e(bank.note||'Please share a screenshot of the transaction or mention the Invoice Number in the payment reference for quick verification.')}">
    </div>

    <div class="field">
      <label for="f-terms">Terms &amp; Conditions</label>
      <input id="f-terms" name="terms" value="${e(bank.terms||'Payment is due within 15 days. A late fee of 1.5% per month will be applied to all overdue balances.')}">
    </div>

    ${formEnd('Generate &amp; Save Invoice')}
  </form>`;

  modal('Invoice Generator','Create multi-item client invoices with bank details and instant PDF generation.',formBody,{
    wide: true,
    submit: async d => {
      const descs = [...$('#modal-root').querySelectorAll('.item-desc')].map(x=>x.value.trim());
      const qtys = [...$('#modal-root').querySelectorAll('.item-qty')].map(x=>Number(x.value)||1);
      const rates = [...$('#modal-root').querySelectorAll('.item-rate')].map(x=>toPaisa(x.value));

      if(!descs.length || !descs[0]) throw new Error('Add at least one line item.');

      let totalPaisa = 0;
      const items = descs.map((desc, idx)=>{
        const itemAmt = qtys[idx] * rates[idx];
        totalPaisa += itemAmt;
        return {
          description: desc,
          quantity: qtys[idx],
          ratePaisa: rates[idx],
          amountPaisa: itemAmt
        };
      });

      const rawDiscount = d.get('discountAmount')?.trim();
      const discountPaisa = (!rawDiscount || Number(rawDiscount)===0) ? 0 : toPaisa(rawDiscount);
      if(discountPaisa > totalPaisa) throw new Error('Discount cannot exceed subtotal amount.');
      const netTotalPaisa = Math.max(0, totalPaisa - discountPaisa);

      const rawPaid = d.get('paidAmount')?.trim();
      const paidPaisa = (!rawPaid || Number(rawPaid)===0) ? 0 : toPaisa(rawPaid);
      if(paidPaisa > netTotalPaisa) throw new Error('Amount paid cannot exceed net invoice total.');

      const pickedClientId = $('#quick-client-picker')?.value || '';
      const invoiceData = {
        number: d.get('number').trim() || ('MS-' + uid().slice(0, 8).toUpperCase()),
        clientId: pickedClientId,
        client: d.get('client').trim(),
        email: d.get('email').trim(),
        phone: d.get('phone')?.trim() || '',
        billingNote: d.get('billingNote')?.trim() || '',
        title: descs[0] + (descs.length>1 ? ` (+${descs.length-1} more)` : ''),
        subtotalPaisa: totalPaisa,
        discountPaisa: discountPaisa,
        amountPaisa: netTotalPaisa,
        paidPaisa: paidPaisa,
        issued: d.get('issued'),
        due: d.get('due'),
        paymentTerms: d.get('paymentTerms')?.trim() || 'Net 15',
        items: items,
        bankInfo: {
          bankName: d.get('bankName')?.trim(),
          accountTitle: d.get('accountTitle')?.trim(),
          accountNumber: d.get('accountNumber')?.trim(),
          iban: d.get('iban')?.trim(),
          note: d.get('note')?.trim(),
          terms: d.get('terms')?.trim()
        }
      };

      await store.addInvoice(invoiceData);
      closeModal();
      toast('Invoice #' + invoiceData.number + ' created successfully.');
      viewInvoice(state.invoices[state.invoices.length-1].id);
    }
  });

  /* Line items calculation bindings */
  const recalc = () => {
    let subtotal = 0;
    const rows = $('#modal-root').querySelectorAll('.line-item-row');
    rows.forEach(r => {
      const q = Number(r.querySelector('.item-qty')?.value)||1;
      const rateVal = Number(r.querySelector('.item-rate')?.value)||0;
      const amt = q * rateVal;
      subtotal += amt;
      const amtEl = r.querySelector('.item-amount');
      if(amtEl) amtEl.textContent = 'PKR ' + new Intl.NumberFormat('en-PK',{minimumFractionDigits:2,maximumFractionDigits:2}).format(amt);
    });

    const rawDiscount = Number($('#calc-discount-input')?.value)||0;
    const discountVal = Math.max(0, Math.min(rawDiscount, subtotal));
    const netTotal = Math.max(0, subtotal - discountVal);
    const rawPaid = Number($('#calc-paid-input')?.value)||0;
    const paidVal = Math.min(rawPaid, netTotal);
    const dueVal = Math.max(0, netTotal - paidVal);

    if($('#calc-subtotal')) $('#calc-subtotal').textContent = 'PKR ' + new Intl.NumberFormat('en-PK',{minimumFractionDigits:2,maximumFractionDigits:2}).format(subtotal);
    if($('#calc-total')) $('#calc-total').textContent = 'PKR ' + new Intl.NumberFormat('en-PK',{minimumFractionDigits:2,maximumFractionDigits:2}).format(netTotal);
    if($('#calc-balance-due')) $('#calc-balance-due').textContent = 'PKR ' + new Intl.NumberFormat('en-PK',{minimumFractionDigits:2,maximumFractionDigits:2}).format(dueVal);
  };

  $('#modal-root').addEventListener('input', ev => {
    if(ev.target.matches('.item-qty, .item-rate, #calc-paid-input, #calc-discount-input')) recalc();
  });

  /* Auto 15 Days Due Date on Issue Date Change */
  const issuedInput = $('#modal-root input[name="issued"]');
  const dueInput = $('#modal-root input[name="due"]');
  issuedInput?.addEventListener('change', ev => {
    const val = ev.target.value;
    if(val && /^\d{4}-\d{2}-\d{2}$/.test(val) && dueInput){
      dueInput.value = addDays(val, 15);
    }
  });

  /* Client Profile Picker Binding */
  $('#quick-client-picker')?.addEventListener('change', ev => {
    const cid = ev.target.value;
    if(!cid) return;
    const cl = (state.clients||[]).find(c=>c.id===cid);
    if(cl){
      const nameInp = $('#modal-root input[name="client"]');
      const emailInp = $('#modal-root input[name="email"]');
      const phoneInp = $('#modal-root input[name="phone"]');
      const noteInp = $('#modal-root input[name="billingNote"]');
      if(nameInp) nameInp.value = cl.name;
      if(emailInp) emailInp.value = cl.email || '';
      if(phoneInp) phoneInp.value = cl.phone || '';
      if(noteInp) noteInp.value = cl.serviceName || (cl.type==='monthly'?'Monthly Retainer':'One-Time Project');
      if(cl.paymentTerms){
        const termsInp = $('#modal-root input[name="paymentTerms"]');
        if(termsInp) termsInp.value = cl.paymentTerms;
      }
      if(cl.type==='monthly' && cl.serviceName){
        const firstDesc = $('#modal-root .line-item-row .item-desc');
        const firstRate = $('#modal-root .line-item-row .item-rate');
        const discInp = $('#calc-discount-input');
        if(firstDesc) firstDesc.value = cl.serviceName + ' · Monthly Retainer';
        if(firstRate) firstRate.value = (cl.monthlyRatePaisa/100).toFixed(2);
        if(discInp && cl.monthlyDiscountPaisa) discInp.value = (cl.monthlyDiscountPaisa/100).toFixed(2);
        recalc();
      }
    }
  });

  /* If a defaultClientId was passed, trigger client selection */
  if(defaultClientId){
    const picker = $('#quick-client-picker');
    if(picker){
      picker.value = defaultClientId;
      picker.dispatchEvent(new Event('change'));
    }
  }

  $('#btn-add-line-item')?.addEventListener('click', ()=>{
    const tr = document.createElement('tr');
    tr.className = 'line-item-row';
    tr.innerHTML = `<td><input class="item-desc" name="itemDesc[]" required placeholder="Description of service"></td>
      <td><input class="item-qty" name="itemQty[]" type="number" min="1" step="1" value="1" required style="text-align:center"></td>
      <td><input class="item-rate" name="itemRate[]" type="number" min="0.01" step="0.01" value="0.00" required style="text-align:right"></td>
      <td class="item-amount" style="font-weight:750;text-align:right">PKR 0.00</td>
      <td style="text-align:center"><button type="button" class="icon-button btn-remove-line" aria-label="Remove">${icon('trash')}</button></td>`;
    $('#line-items-body')?.appendChild(tr);
    recalc();
  });

  $('#modal-root').addEventListener('click', ev=>{
    const btn = ev.target.closest('.btn-remove-line');
    if(btn){
      const rows = $('#modal-root').querySelectorAll('.line-item-row');
      if(rows.length > 1){
        btn.closest('tr').remove();
        recalc();
      }else{
        toast('Invoice needs at least one line item.');
      }
    }
  });

  $('#quick-package-picker')?.addEventListener('change', ev=>{
    const val = ev.target.value;
    if(val !== ''){
      const selectedPkg = flatPackages[Number(val)];
      if(selectedPkg){
        const tr = document.createElement('tr');
        tr.className = 'line-item-row';
        tr.innerHTML = `<td><input class="item-desc" name="itemDesc[]" required value="${e(selectedPkg.desc)}"></td>
          <td><input class="item-qty" name="itemQty[]" type="number" min="1" step="1" value="1" required style="text-align:center"></td>
          <td><input class="item-rate" name="itemRate[]" type="number" min="0.01" step="0.01" value="${selectedPkg.rate}" required style="text-align:right"></td>
          <td class="item-amount" style="font-weight:750;text-align:right">PKR ${selectedPkg.rate}</td>
          <td style="text-align:center"><button type="button" class="icon-button btn-remove-line" aria-label="Remove">${icon('trash')}</button></td>`;
        $('#line-items-body')?.appendChild(tr);
        recalc();
        ev.target.value = '';
      }
    }
  });

  recalc();
}

/* ==========================================================================
   OFFICIAL INVOICE PREVIEW (MATCHING USER'S UPLOADED SCREENSHOT)
   ========================================================================== */
function officialInvoiceMarkup(i){
  const bank = i.bankInfo || state.company.bankInfo || DEFAULT_BANK_INFO;
  const items = i.items && i.items.length ? i.items : [
    { description: i.title, quantity: 1, ratePaisa: i.amountPaisa + (i.discountPaisa||0), amountPaisa: i.amountPaisa + (i.discountPaisa||0) }
  ];
  const subtotalPaisa = i.subtotalPaisa || (i.amountPaisa + (i.discountPaisa || 0));
  const discountPaisa = i.discountPaisa || 0;
  const balanceDue = Math.max(0, i.amountPaisa - i.paidPaisa);
  const noteText = formatInvoiceNote(bank.note, i.number);

  return `<div class="invoice-sheet-wrap">
    <div class="inv-top-row">
      <div class="inv-brand-box">
        <img src="./assets/metrisolution-mark.png" alt="MetriSolution">
        <span class="inv-brand-tagline">"Innovating Your Digital Future"</span>
        <div class="inv-brand-company">${e(state.company.name)}</div>
      </div>

      <div class="inv-meta-right">
        <h1>INVOICE</h1>
        <div class="inv-number-label"># ${e(i.number)}</div>

        <table class="inv-meta-table">
          <tr>
            <td>Date:</td>
            <td><strong>${dateLabel(i.issued)}</strong></td>
          </tr>
          <tr>
            <td>Payment Terms:</td>
            <td><strong>${e(i.paymentTerms||'Net 15')}</strong></td>
          </tr>
          <tr>
            <td>Due Date:</td>
            <td><strong>${dateLabel(i.due)}</strong></td>
          </tr>
        </table>

        <div class="inv-balance-banner">
          <span>Balance Due:</span>
          <strong>PKR ${money(balanceDue)}</strong>
        </div>
      </div>
    </div>

    <div class="inv-bill-to">
      <small>Bill To:</small>
      <strong>${e(i.client)}</strong>
      ${i.email?`<div class="muted small">${e(i.email)}</div>`:''}
      ${i.phone?`<div class="muted small" style="color:#555">Phone: ${e(i.phone)}</div>`:''}
    </div>

    <table class="inv-items-table">
      <thead>
        <tr>
          <th style="width:50%">Item</th>
          <th style="width:15%;text-align:center">Quantity</th>
          <th style="width:17%;text-align:right">Rate</th>
          <th style="width:18%;text-align:right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(it=>`
          <tr>
            <td style="font-weight:600">${e(it.description)}</td>
            <td style="text-align:center">${it.quantity||1}</td>
            <td style="text-align:right">PKR ${money(it.ratePaisa||it.amountPaisa)}</td>
            <td style="text-align:right;font-weight:700">PKR ${money(it.amountPaisa)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="inv-summary-block">
      <div class="inv-summary-row">
        <span>Subtotal:</span>
        <strong>PKR ${money(subtotalPaisa)}</strong>
      </div>
      ${discountPaisa > 0 ? `
        <div class="inv-summary-row discount-row" style="color:#e11d48">
          <span>Discount:</span>
          <strong>- PKR ${money(discountPaisa)}</strong>
        </div>
      ` : ''}
      <div class="inv-summary-row total-row" style="border-top:1px solid #e5e7eb;padding-top:6px">
        <span>Total:</span>
        <strong style="font-size:15px;color:#111">PKR ${money(i.amountPaisa)}</strong>
      </div>
      <div class="inv-summary-row">
        <span>Amount Paid:</span>
        <strong>PKR ${money(i.paidPaisa)}</strong>
      </div>
    </div>

    <div class="inv-bank-box">
      <strong class="box-title">Bank Account ::</strong>
      <div><strong>Bank Account Information for Transfer:</strong></div>
      <div>Bank Name: <strong>${e(bank.bankName||'United Bank Limited')}</strong></div>
      <div>Account Title: <strong>${e(bank.accountTitle||'AbdulQadir')}</strong></div>
      <div>Account Number: <strong>${e(bank.accountNumber||'0891302212516')}</strong></div>
      <div>IBAN Number : <strong>${e(bank.iban||'PK98UNIL010900030221251')}</strong></div>
    </div>

    <div class="inv-notes-block">
      <strong>Note:</strong> ${e(noteText)}
    </div>

    <div class="inv-terms-block">
      <strong>Terms:</strong> ${e(bank.terms||'Payment is due within 15 days. A late fee of 1.5% per month will be applied to all overdue balances.')}
    </div>
  </div>`;
}

function viewInvoice(id){
  const i=state.invoices.find(i=>i.id===id);
  if(!i) return;
  modal(`Invoice #${i.number}`, i.client, `
    ${officialInvoiceMarkup(i)}
    <div class="modal-actions" style="justify-content:space-between;flex-wrap:wrap;gap:10px">
      <div style="display:flex;gap:8px;align-items:center">
        <span class="badge ${invoiceStatus(i)}">${invoiceStatus(i)}</span>
        ${i.isMonthlyRecurring?`<span class="pill" style="font-size:11px;background:var(--purple-subtle);color:var(--purple);border:1px solid var(--purple-border)">Monthly Retainer</span>`:''}
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn primary" data-action="download-invoice-pdf" data-id="${i.id}">${icon('download')}Download PDF</button>
        <button class="btn" style="background:var(--purple-soft);color:var(--purple);border:1px solid var(--purple-border)" data-action="print-invoice" data-id="${i.id}">${icon('print')}Print / System PDF</button>
        <a href="${getInvoiceWhatsAppUrl(i)}" target="_blank" rel="noopener" class="btn btn-whatsapp">${icon('whatsapp')}Send on WhatsApp</a>
        <button class="btn" data-action="download-invoice-html" data-id="${i.id}">${icon('code')}HTML</button>
        ${i.paidPaisa<i.amountPaisa&&canWrite()?`<button class="btn" style="background:var(--emerald);color:#fff" data-action="pay-invoice" data-id="${i.id}">Record payment</button>`:''}
      </div>
    </div>
  `, { wide: true });
}

function getInvoiceFullHtml(i){
  return `<!doctype html><html><head><meta charset="utf-8"><title>Invoice_${e(i.number)}_${e(i.client)}</title>
  <style>
    @page{size:A4;margin:12mm 15mm}
    body{font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif;margin:20px auto;max-width:820px;padding:20px;color:#111;background:#fff}
    .invoice-sheet-wrap{padding:0}
    .inv-top-row{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px}
    .inv-brand-box img{height:54px;display:block}
    .inv-brand-tagline{font-size:10px;color:#666;font-style:italic}
    .inv-brand-company{font-size:15px;font-weight:700;margin-top:12px}
    .inv-meta-right{text-align:right}
    .inv-meta-right h1{font-size:32px;margin:0 0 4px;font-weight:900}
    .inv-number-label{font-size:16px;color:#555;margin-bottom:12px;font-weight:600}
    .inv-meta-table{font-size:12px;margin-bottom:10px;margin-left:auto}
    .inv-meta-table td{padding:2px 6px;text-align:right}
    .inv-meta-table td:first-child{color:#666}
    .inv-balance-banner{background:#f1f3f5;border-radius:6px;padding:8px 14px;font-size:14px;font-weight:700;margin-top:6px;display:inline-block}
    .inv-bill-to{margin-bottom:24px}
    .inv-bill-to small{display:block;font-size:11px;color:#666}
    .inv-bill-to strong{font-size:15px}
    .inv-items-table{width:100%;border-collapse:collapse;margin-bottom:24px}
    .inv-items-table th{background:#23272e;color:#fff;font-size:11px;font-weight:700;padding:10px 12px;text-transform:uppercase}
    .inv-items-table td{padding:12px;border-bottom:1px solid #e5e7eb;font-size:13px}
    .inv-summary-block{margin-left:auto;width:300px;margin-bottom:28px}
    .inv-summary-row{display:flex;justify-content:space-between;padding:4px 0;font-size:13px}
    .inv-summary-row.discount-row strong{color:#e11d48}
    .inv-bank-box{background:#fafafa;border:1px dashed #ccc;border-radius:6px;padding:14px 18px;margin-bottom:20px;font-size:12px;line-height:1.6}
    .inv-notes-block,.inv-terms-block{font-size:11px;color:#555;line-height:1.6;margin-bottom:10px}
    @media print{body{margin:0;padding:0}.no-print{display:none !important}}
  </style></head><body>
    ${officialInvoiceMarkup(i)}
  </body></html>`;
}

function printInvoice(id){
  const i=state.invoices.find(i=>i.id===id);
  if(!i) return;

  let iframe=document.getElementById('inv-print-frame');
  if(!iframe){
    iframe=document.createElement('iframe');
    iframe.id='inv-print-frame';
    iframe.style.position='fixed';
    iframe.style.top='-9999px';
    iframe.style.left='-9999px';
    iframe.style.width='1px';
    iframe.style.height='1px';
    iframe.style.border='0';
    iframe.style.opacity='0';
    document.body.appendChild(iframe);
  }

  const doc=iframe.contentWindow?.document||iframe.contentDocument;
  if(!doc){
    window.print();
    return;
  }

  doc.open();
  doc.write(getInvoiceFullHtml(i));
  doc.close();

  toast('Opening print dialog…');
  setTimeout(()=>{
    try{
      const win=iframe.contentWindow||iframe;
      win.focus();
      win.print();
    }catch(err){
      console.warn('Iframe print fallback:', err);
      window.print();
    }
  }, 400);
}

async function downloadInvoicePdf(id){
  const i=state.invoices.find(i=>i.id===id);
  if(!i) return;
  toast('Preparing PDF download…');

  const container=document.createElement('div');
  container.style.cssText='position:fixed;top:-9999px;left:-9999px;width:760px;background:#fff;padding:24px 30px;color:#111;font-family:system-ui,-apple-system,sans-serif;box-sizing:border-box;';
  container.innerHTML=officialInvoiceMarkup(i);
  document.body.appendChild(container);

  if(window.html2pdf){
    const opt={
      margin:[8,10,8,10],
      filename:`Invoice_${e(i.number)}_${e(i.client).replace(/\s+/g,'_')}.pdf`,
      image:{type:'jpeg',quality:0.98},
      html2canvas:{scale:2,useCORS:true,logging:false},
      jsPDF:{unit:'mm',format:'a4',orientation:'portrait'}
    };
    try{
      await window.html2pdf().set(opt).from(container).save();
      toast('PDF saved successfully!');
    }catch(err){
      console.warn('html2pdf generation error:', err);
      printInvoice(id);
    }finally{
      container.remove();
    }
  }else{
    container.remove();
    printInvoice(id);
  }
}

function downloadInvoice(id){
  const i=state.invoices.find(i=>i.id===id);
  if(!i) return;
  const markup=getInvoiceFullHtml(i);
  const blob=new Blob([markup],{type:'text/html;charset=utf-8'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`Invoice_${e(i.number)}_${e(i.client).replace(/\s+/g,'_')}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  toast('HTML invoice downloaded.');
}

/* ==========================================================================
   DIGITAL SALARY SLIP SYSTEM
   ========================================================================== */
function officialSalarySlipMarkup(slip){
  const companyName = state.company.name || 'MetriSolution Pvt LTD';
  const period = slip.periodLabel || formatMonthYear(slip.month);

  return `<div class="salary-slip-sheet-wrap" id="salary-slip-sheet-${slip.id}">
    <div class="slip-header">
      <div class="slip-brand">
        <div style="display:flex;align-items:center;gap:12px">
          <img src="./assets/metrisolution-mark.png" alt="MetriSolution" class="slip-brand-logo">
          <div>
            <div class="slip-company-name">${e(companyName)}</div>
            <div class="slip-tagline">"Innovating Your Digital Future" · Technology &amp; Business Solutions</div>
            <div class="slip-company-meta">Official Digital Payroll System · Verified &amp; Authorized</div>
          </div>
        </div>
      </div>
      <div class="slip-title-box">
        <div class="slip-doc-badge">CONFIDENTIAL PAYSLIP</div>
        <h1 class="slip-title">SALARY SLIP</h1>
        <div class="slip-ref-no">Slip Ref: <strong>#${e(slip.slipNumber)}</strong></div>
        <div class="slip-period-badge">${e(period)}</div>
      </div>
    </div>

    <div class="slip-divider"></div>

    <div class="slip-info-grid">
      <div class="slip-info-item">
        <span class="slip-info-label">EMPLOYEE NAME</span>
        <span class="slip-info-val highlight">${e(slip.employeeName)}</span>
      </div>
      <div class="slip-info-item">
        <span class="slip-info-label">DESIGNATION / ROLE</span>
        <span class="slip-info-val">${e(slip.role || 'Team Member')}</span>
      </div>
      <div class="slip-info-item">
        <span class="slip-info-label">PAY PERIOD</span>
        <span class="slip-info-val">${e(period)}</span>
      </div>
      <div class="slip-info-item">
        <span class="slip-info-label">ISSUE DATE</span>
        <span class="slip-info-val">${new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric'}).format(new Date(slip.issueDate+'T12:00:00Z'))}</span>
      </div>
      <div class="slip-info-item">
        <span class="slip-info-label">PAYMENT MODE</span>
        <span class="slip-info-val">${e(slip.paymentMode || 'Bank Transfer')}</span>
      </div>
      <div class="slip-info-item">
        <span class="slip-info-label">ACCOUNT / RECORD</span>
        <span class="slip-info-val">${slip.deductFromAccount ? `${e(slip.accountName || 'Bank')} (Deducted)` : 'Historical / Standalone Record'}</span>
      </div>
    </div>

    <div class="slip-breakdown-wrap">
      <div class="slip-col slip-earnings-col">
        <div class="slip-col-header">
          <span>EARNINGS</span>
          <span>AMOUNT (PKR)</span>
        </div>
        <table class="slip-table">
          <tbody>
            <tr>
              <td>Basic Salary</td>
              <td class="num">${money(slip.basicPaisa)}</td>
            </tr>
            ${slip.medicalPaisa ? `<tr><td>Medical Allowance</td><td class="num">${money(slip.medicalPaisa)}</td></tr>` : ''}
            ${slip.conveyancePaisa ? `<tr><td>Conveyance / Fuel Allowance</td><td class="num">${money(slip.conveyancePaisa)}</td></tr>` : ''}
            ${slip.bonusPaisa ? `<tr><td>Performance Bonus / Incentive</td><td class="num">${money(slip.bonusPaisa)}</td></tr>` : ''}
            ${slip.otherAllowancePaisa ? `<tr><td>Other Allowances</td><td class="num">${money(slip.otherAllowancePaisa)}</td></tr>` : ''}
          </tbody>
          <tfoot>
            <tr class="slip-subtotal-row">
              <td><strong>Gross Earnings</strong></td>
              <td class="num"><strong>PKR ${money(slip.grossPaisa)}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div class="slip-col slip-deductions-col">
        <div class="slip-col-header">
          <span>DEDUCTIONS</span>
          <span>AMOUNT (PKR)</span>
        </div>
        <table class="slip-table">
          <tbody>
            ${slip.taxPaisa ? `<tr><td>Income Tax / Withholding</td><td class="num negative">- ${money(slip.taxPaisa)}</td></tr>` : ''}
            ${slip.advancePaisa ? `<tr><td>Salary Advance / Loan Recovery</td><td class="num negative">- ${money(slip.advancePaisa)}</td></tr>` : ''}
            ${slip.leavesPaisa ? `<tr><td>Unpaid Leaves / LOP</td><td class="num negative">- ${money(slip.leavesPaisa)}</td></tr>` : ''}
            ${slip.otherDeductionPaisa ? `<tr><td>Other Deductions</td><td class="num negative">- ${money(slip.otherDeductionPaisa)}</td></tr>` : ''}
            ${(!slip.taxPaisa && !slip.advancePaisa && !slip.leavesPaisa && !slip.otherDeductionPaisa) ? `<tr><td style="color:#888;font-style:italic">No Deductions Applicable</td><td class="num">0.00</td></tr>` : ''}
          </tbody>
          <tfoot>
            <tr class="slip-subtotal-row">
              <td><strong>Total Deductions</strong></td>
              <td class="num"><strong>PKR ${money(slip.totalDeductionsPaisa || 0)}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <div class="slip-net-banner">
      <div class="slip-net-left">
        <div class="slip-net-label">NET TAKE-HOME SALARY</div>
        <div class="slip-words">${e(amountInWords(slip.netSalaryPaisa))}</div>
        ${slip.notes ? `<div class="slip-note-text"><strong>Note:</strong> ${e(slip.notes)}</div>` : ''}
      </div>
      <div class="slip-net-right">
        <div class="slip-net-amount">PKR ${money(slip.netSalaryPaisa)}</div>
        <div class="slip-paid-stamp">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="m9 16.17 9.83-9.83 1.41 1.41L9 19 3.59 13.59 5 12.17l4 4Z"/></svg>
          PAID &amp; SETTLED
        </div>
      </div>
    </div>

    <div class="slip-footer">
      <div class="slip-sig-box">
        <div class="slip-sig-line"></div>
        <div class="slip-sig-text">Employee Signature</div>
        <div class="slip-sig-sub">${e(slip.employeeName)}</div>
      </div>
      <div class="slip-seal-box">
        <div class="slip-stamp-circle">
          <span>METRISOLUTION</span>
          <strong>VERIFIED</strong>
          <small>PAYROLL SEAL</small>
        </div>
        <div class="slip-digital-text">Electronically Generated Digital Slip</div>
      </div>
      <div class="slip-sig-box right">
        <div class="slip-sig-line"></div>
        <div class="slip-sig-text">Authorized Signatory</div>
        <div class="slip-sig-sub">Finance &amp; HR Department · ${e(companyName)}</div>
      </div>
    </div>

    <div class="slip-legal-disclaimer">
      This is a confidential, computer-generated digital salary slip issued by ${e(companyName)}. If electronically verified with company payroll ledger, no physical signature is required. Generated on ${new Date().toLocaleDateString('en-GB')}.
    </div>
  </div>`;
}

function getSalarySlipFullHtml(slip){
  return `<!doctype html><html><head><meta charset="utf-8">
  <title>SalarySlip_${e(slip.employeeName)}_${e(slip.month)}</title>
  <style>
    @page { size: A4 portrait; margin: 10mm 12mm; }
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 20px auto; max-width: 820px; padding: 20px; color: #111; background: #fff; line-height: 1.45; }
    .salary-slip-sheet-wrap { border: 1px solid #d1d5db; border-radius: 8px; padding: 24px; background: #fff; }
    .slip-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
    .slip-brand-logo { height: 48px; width: auto; }
    .slip-company-name { font-size: 18px; font-weight: 800; color: #111827; }
    .slip-tagline { font-size: 11px; color: #4b5563; }
    .slip-company-meta { font-size: 10px; color: #6b7280; margin-top: 2px; }
    .slip-title-box { text-align: right; }
    .slip-doc-badge { display: inline-block; font-size: 10px; font-weight: 700; background: #ede9fe; color: #6d28d9; padding: 3px 8px; border-radius: 4px; letter-spacing: 0.5px; }
    .slip-title { font-size: 24px; font-weight: 900; margin: 4px 0 2px; color: #1f2937; letter-spacing: 0.5px; }
    .slip-ref-no { font-size: 13px; color: #4b5563; }
    .slip-period-badge { font-size: 12px; font-weight: 700; color: #111827; margin-top: 4px; }
    .slip-divider { height: 2px; background: #e5e7eb; margin: 16px 0; }
    .slip-info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; background: #f9fafb; padding: 14px 16px; border-radius: 6px; border: 1px solid #e5e7eb; margin-bottom: 20px; font-size: 12px; }
    .slip-info-label { display: block; font-size: 10px; font-weight: 700; color: #6b7280; text-transform: uppercase; margin-bottom: 2px; }
    .slip-info-val { font-size: 13px; font-weight: 600; color: #111827; }
    .slip-info-val.highlight { color: #6d28d9; font-weight: 700; }
    .slip-breakdown-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    .slip-col { border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; }
    .slip-col-header { display: flex; justify-content: space-between; padding: 8px 12px; background: #1f2937; color: #fff; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .slip-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .slip-table td { padding: 8px 12px; border-bottom: 1px solid #f3f4f6; }
    .slip-table td.num { text-align: right; font-weight: 600; }
    .slip-table td.num.negative { color: #dc2626; }
    .slip-subtotal-row td { background: #f9fafb; font-weight: 700; border-top: 2px solid #e5e7eb; border-bottom: none; }
    .slip-net-banner { display: flex; justify-content: space-between; align-items: center; background: #f5f3ff; border: 2px solid #ddd6fe; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px; }
    .slip-net-label { font-size: 12px; font-weight: 800; color: #5b21b6; text-transform: uppercase; letter-spacing: 0.5px; }
    .slip-words { font-size: 12px; color: #374151; font-style: italic; margin-top: 4px; }
    .slip-note-text { font-size: 11px; color: #4b5563; margin-top: 6px; }
    .slip-net-amount { font-size: 24px; font-weight: 900; color: #4c1d95; text-align: right; }
    .slip-paid-stamp { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 800; background: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; padding: 3px 8px; border-radius: 4px; margin-top: 4px; }
    .slip-footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 36px; margin-bottom: 16px; padding: 0 10px; }
    .slip-sig-box { width: 200px; text-align: center; }
    .slip-sig-box.right { text-align: center; }
    .slip-sig-line { border-bottom: 1px dashed #9ca3af; margin-bottom: 8px; height: 35px; }
    .slip-sig-text { font-size: 12px; font-weight: 700; color: #1f2937; }
    .slip-sig-sub { font-size: 10px; color: #6b7280; }
    .slip-seal-box { text-align: center; }
    .slip-stamp-circle { display: inline-flex; flex-direction: column; align-items: center; justify-content: center; width: 84px; height: 84px; border: 2px dashed #6d28d9; border-radius: 50%; color: #6d28d9; padding: 6px; transform: rotate(-5deg); }
    .slip-stamp-circle span { font-size: 8px; font-weight: 800; letter-spacing: 0.5px; }
    .slip-stamp-circle strong { font-size: 11px; font-weight: 900; margin: 1px 0; }
    .slip-stamp-circle small { font-size: 7px; font-weight: 750; }
    .slip-digital-text { font-size: 9px; color: #6b7280; margin-top: 4px; font-weight: 500; }
    .slip-legal-disclaimer { border-top: 1px solid #e5e7eb; padding-top: 10px; font-size: 9px; color: #9ca3af; text-align: center; line-height: 1.4; }
    @media print {
      body { margin: 0; padding: 0; background: #fff; }
      .salary-slip-sheet-wrap { border: none; padding: 0; }
    }
  </style></head><body>
    ${officialSalarySlipMarkup(slip)}
  </body></html>`;
}

function printSalarySlip(id){
  const slip = (state.salarySlips || []).find(s => s.id === id);
  if(!slip) return;

  let iframe = document.getElementById('slip-print-frame');
  if(!iframe){
    iframe = document.createElement('iframe');
    iframe.id = 'slip-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
  }

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if(!doc){
    window.print();
    return;
  }

  doc.open();
  doc.write(getSalarySlipFullHtml(slip));
  doc.close();

  toast('Opening print dialog…');
  setTimeout(()=>{
    try{
      const win = iframe.contentWindow || iframe;
      win.focus();
      win.print();
    }catch(err){
      console.warn('Iframe print fallback:', err);
      window.print();
    }
  }, 400);
}

async function downloadSalarySlipPdf(id){
  const slip = (state.salarySlips || []).find(s => s.id === id);
  if(!slip) return;
  toast('Preparing PDF download…');

  const container = document.createElement('div');
  container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:760px;background:#fff;padding:24px 30px;color:#111;font-family:system-ui,-apple-system,sans-serif;box-sizing:border-box;';
  container.innerHTML = officialSalarySlipMarkup(slip);
  document.body.appendChild(container);

  if(window.html2pdf){
    const opt = {
      margin: [8, 10, 8, 10],
      filename: `SalarySlip_${e(slip.employeeName).replace(/\s+/g, '_')}_${e(slip.month || 'slip')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    try {
      await window.html2pdf().set(opt).from(container).save();
      toast('Salary Slip PDF downloaded.');
    } catch(err) {
      console.error(err);
      printSalarySlip(id);
    } finally {
      container.remove();
    }
  } else {
    container.remove();
    printSalarySlip(id);
  }
}

function getSalarySlipWhatsAppUrl(slip){
  const emp = (state.employees || []).find(e => e.id === slip.employeeId);
  const phone = formatWhatsAppNumber(emp?.phone || emp?.email || '');
  const monthName = slip.periodLabel || formatMonthYear(slip.month);
  const net = money(slip.netSalaryPaisa);
  const basic = money(slip.basicPaisa);
  const gross = money(slip.grossPaisa);
  const deductions = money(slip.totalDeductionsPaisa || 0);
  const company = state.company.name || 'MetriSolution Pvt LTD';

  const text = `*${company} · Digital Salary Slip*\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 *Employee:* ${slip.employeeName}\n` +
    `💼 *Role:* ${slip.role || 'Team Member'}\n` +
    `📅 *Pay Period:* ${monthName}\n` +
    `🧾 *Slip Ref:* #${slip.slipNumber}\n` +
    `💰 *Basic Salary:* PKR ${basic}\n` +
    (slip.grossPaisa !== slip.basicPaisa ? `📈 *Gross Earnings:* PKR ${gross}\n` : '') +
    (deductions !== '0.00' && deductions !== '0' ? `📉 *Deductions:* PKR ${deductions}\n` : '') +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `✅ *NET TAKE-HOME:* PKR ${net}\n` +
    `🏛️ *Payment Status:* PAID & SETTLED\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `_This is an official computer-generated digital payslip issued by ${company}._`;

  if(phone){
    return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;
  }
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

function viewSalarySlip(id){
  const slip = (state.salarySlips || []).find(s => s.id === id);
  if(!slip) return;
  modal(`Salary Slip #${slip.slipNumber}`, `${slip.employeeName} · ${slip.periodLabel || slip.month}`, `
    ${officialSalarySlipMarkup(slip)}
    <div class="modal-actions" style="justify-content:space-between;flex-wrap:wrap;gap:10px;margin-top:16px">
      <div style="display:flex;gap:8px;align-items:center">
        <span class="badge" style="background:var(--green-soft);color:var(--green);border:1px solid var(--green-border)">Paid</span>
        ${slip.deductFromAccount ? `<span class="pill" style="font-size:11px;background:var(--purple-soft);color:var(--purple);border:1px solid var(--purple-border)">Account Deducted: ${e(slip.accountName||'Bank')}</span>` : `<span class="pill" style="font-size:11px;background:var(--blue-soft);color:var(--blue);border:1px solid var(--blue-border)">Standalone / Historical</span>`}
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn primary" data-action="download-salary-slip-pdf" data-id="${slip.id}">${icon('download')}Download PDF</button>
        <button class="btn" style="background:var(--purple-soft);color:var(--purple);border:1px solid var(--purple-border)" data-action="print-salary-slip" data-id="${slip.id}">${icon('print')}Print / System PDF</button>
        <a href="${getSalarySlipWhatsAppUrl(slip)}" target="_blank" rel="noopener" class="btn btn-whatsapp">${icon('whatsapp')}Send on WhatsApp</a>
        ${canWrite()?`<button class="btn" style="color:var(--red);border:1px solid var(--red-border)" data-action="delete-salary-slip" data-id="${slip.id}">${icon('trash')}Delete</button>`:''}
      </div>
    </div>
  `, { wide: true });
}

function showCreateSalarySlip(employeeId = '', prefill = {}){
  if(!state.employees.length){
    toast('Add a team member first.');
    showAddEmployee();
    return;
  }
  const defaultEmp = state.employees.find(x => x.id === employeeId) || state.employees[0];
  const curMonth = today().slice(0, 7);
  const selectedMonth = prefill.month || curMonth;
  const count = (state.salarySlips || []).length + 1;
  const defaultSlipNumber = prefill.slipNumber || ('MS-PAY-' + selectedMonth.replace('-', '') + '-' + String(count).padStart(3, '0'));

  modal('Generate Digital Salary Slip', 'Official company payslip for team members with optional cashbook deduction.', `
    <form id="salary-slip-form">
      <div class="form-grid">
        ${select('Team member', 'employeeId', state.employees.map(x => [x.id, `${x.name} (${x.role})`]), defaultEmp.id)}
        ${field('Slip reference #', 'slipNumber', 'text', defaultSlipNumber, 'required maxlength="50"')}
        ${field('Pay month / period', 'month', 'month', selectedMonth, 'required')}
        ${field('Issue date', 'issueDate', 'date', prefill.issueDate || today(), 'required')}
        ${select('Payment mode (shown on slip)', 'paymentMode', [['Bank Transfer','Bank Transfer'],['Cash','Cash'],['Cheque','Cheque'],['Digital Wallet','Digital Wallet'],['Online Transfer','Online Transfer']], prefill.paymentMode || 'Bank Transfer')}
        ${select('Deduct from account', 'accountId', state.accounts.map(a => [a.id, a.name]), state.accounts[0]?.id)}
      </div>

      <div style="margin: 16px 0 12px; font-weight: 700; font-size: 13px; color: var(--ink); display: flex; align-items: center; gap: 8px;">
        ${icon('wallet')} Earnings &amp; Allowances (PKR)
      </div>
      <div class="form-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
        ${field('Basic Salary', 'basic', 'number', String((defaultEmp.salaryPaisa || 0) / 100), 'required min="0" step="0.01" placeholder="0.00"')}
        ${field('Medical Allowance', 'medical', 'number', '0.00', 'min="0" step="0.01" placeholder="0.00"')}
        ${field('Conveyance / Fuel', 'conveyance', 'number', '0.00', 'min="0" step="0.01" placeholder="0.00"')}
        ${field('Performance Bonus', 'bonus', 'number', '0.00', 'min="0" step="0.01" placeholder="0.00"')}
        ${field('Other Allowance', 'otherAllowance', 'number', '0.00', 'min="0" step="0.01" placeholder="0.00"')}
      </div>

      <div style="margin: 16px 0 12px; font-weight: 700; font-size: 13px; color: var(--ink); display: flex; align-items: center; gap: 8px;">
        ${icon('undo')} Deductions (PKR)
      </div>
      <div class="form-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
        ${field('Income Tax / Withholding', 'tax', 'number', '0.00', 'min="0" step="0.01" placeholder="0.00"')}
        ${field('Advance / Loan Recovery', 'advance', 'number', '0.00', 'min="0" step="0.01" placeholder="0.00"')}
        ${field('Unpaid Leaves / LOP', 'leaves', 'number', '0.00', 'min="0" step="0.01" placeholder="0.00"')}
        ${field('Other Deductions', 'otherDeduction', 'number', '0.00', 'min="0" step="0.01" placeholder="0.00"')}
      </div>

      <!-- Account Deduction Control Box -->
      <div class="card" style="padding: 14px 16px; margin: 16px 0 8px; background: var(--surface-alt); border: 1.5px solid var(--line); border-radius: 8px;">
        <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; font-weight: 700; font-size: 13.5px; color: var(--ink);">
          <input type="checkbox" id="f-deduct-account" name="deductFromAccount" ${selectedMonth === curMonth ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--purple); cursor: pointer;">
          <span>Deduct from company account (Record as Salary Expense in Cashbook)</span>
        </label>
        <div id="deduct-notice" style="margin-top: 8px; font-size: 12px; color: var(--muted); line-height: 1.5;">
          ${selectedMonth === curMonth ? 'A salary expense transaction will be recorded in the selected account and deducted from your cash balance.' : 'No cashbook transaction will be created. Balance will remain unaffected (Ideal for old/historical slips, documentation & digital proof).'}
        </div>
      </div>

      <!-- Realtime Net Summary Banner -->
      <div id="slip-calc-summary" class="card" style="padding: 16px 20px; background: var(--purple-soft); border: 1.5px solid var(--purple-border); border-radius: 8px; margin: 16px 0 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="font-size: 11px; font-weight: 800; color: var(--purple); text-transform: uppercase; letter-spacing: 0.05em;">Calculated Net Pay</div>
            <div id="slip-calc-net" style="font-size: 24px; font-weight: 900; color: var(--purple);">${fullMoney(defaultEmp.salaryPaisa || 0)}</div>
            <div id="slip-calc-words" style="font-size: 12px; font-style: italic; color: var(--ink-secondary); margin-top: 2px;">${amountInWords(defaultEmp.salaryPaisa || 0)}</div>
          </div>
          <div style="text-align: right; font-size: 12px; color: var(--muted);">
            <div>Gross Earnings: <strong id="slip-calc-gross" style="color:var(--ink)">${fullMoney(defaultEmp.salaryPaisa || 0)}</strong></div>
            <div>Total Deductions: <strong id="slip-calc-deductions" style="color:var(--red)">PKR 0.00</strong></div>
          </div>
        </div>
      </div>

      <div class="field full-width">
        <label for="f-slip-notes">Notes / Remarks (Optional)</label>
        <input id="f-slip-notes" name="notes" maxlength="200" placeholder="e.g. Monthly salary credited via online transfer" value="Monthly salary disbursement">
      </div>

      ${formEnd('Generate &amp; Preview Salary Slip')}
    </form>
  `, {
    wide: true,
    submit: async data => {
      const emp = state.employees.find(x => x.id === data.get('employeeId'));
      if(!emp) throw new Error('Selected employee not found.');

      const month = data.get('month');
      const basicPaisa = toPaisaOrZero(data.get('basic'));
      const medicalPaisa = toPaisaOrZero(data.get('medical'));
      const conveyancePaisa = toPaisaOrZero(data.get('conveyance'));
      const bonusPaisa = toPaisaOrZero(data.get('bonus'));
      const otherAllowancePaisa = toPaisaOrZero(data.get('otherAllowance'));

      const taxPaisa = toPaisaOrZero(data.get('tax'));
      const advancePaisa = toPaisaOrZero(data.get('advance'));
      const leavesPaisa = toPaisaOrZero(data.get('leaves'));
      const otherDeductionPaisa = toPaisaOrZero(data.get('otherDeduction'));

      const grossPaisa = basicPaisa + medicalPaisa + conveyancePaisa + bonusPaisa + otherAllowancePaisa;
      const totalDeductionsPaisa = taxPaisa + advancePaisa + leavesPaisa + otherDeductionPaisa;
      const netSalaryPaisa = Math.max(0, grossPaisa - totalDeductionsPaisa);

      const deductFromAccount = data.get('deductFromAccount') === 'on';
      const accountId = deductFromAccount ? data.get('accountId') : '';
      const acc = state.accounts.find(a => a.id === accountId);

      const slip = {
        slipNumber: data.get('slipNumber').trim(),
        employeeId: emp.id,
        employeeName: emp.name,
        role: emp.role,
        email: emp.email || '',
        month,
        periodLabel: formatMonthYear(month),
        issueDate: data.get('issueDate'),
        paymentDate: data.get('issueDate'),
        paymentMode: data.get('paymentMode'),
        deductFromAccount,
        accountId: deductFromAccount ? accountId : '',
        accountName: acc ? acc.name : '',
        basicPaisa,
        medicalPaisa,
        conveyancePaisa,
        bonusPaisa,
        otherAllowancePaisa,
        grossPaisa,
        taxPaisa,
        advancePaisa,
        leavesPaisa,
        otherDeductionPaisa,
        totalDeductionsPaisa,
        netSalaryPaisa,
        notes: data.get('notes')?.trim() || ''
      };

      await store.addSalarySlip(slip);
      closeModal();
      toast(`Salary Slip #${slip.slipNumber} generated.`);
      const created = (store.state.salarySlips || []).find(s => s.slipNumber === slip.slipNumber);
      if(created) viewSalarySlip(created.id);
    }
  });

  const form = $('#salary-slip-form');
  if(!form) return;

  const empSelect = form.querySelector('[name="employeeId"]');
  const basicInput = form.querySelector('[name="basic"]');
  const monthInput = form.querySelector('[name="month"]');
  const slipNumberInput = form.querySelector('[name="slipNumber"]');
  const deductCheckbox = form.querySelector('#f-deduct-account');
  const deductNotice = form.querySelector('#deduct-notice');
  const accountSelectWrapper = form.querySelector('[name="accountId"]')?.closest('.field');

  function updateRecalculations(){
    const b = Number(form.querySelector('[name="basic"]')?.value || 0);
    const m = Number(form.querySelector('[name="medical"]')?.value || 0);
    const c = Number(form.querySelector('[name="conveyance"]')?.value || 0);
    const bn = Number(form.querySelector('[name="bonus"]')?.value || 0);
    const oa = Number(form.querySelector('[name="otherAllowance"]')?.value || 0);

    const tx = Number(form.querySelector('[name="tax"]')?.value || 0);
    const ad = Number(form.querySelector('[name="advance"]')?.value || 0);
    const lv = Number(form.querySelector('[name="leaves"]')?.value || 0);
    const od = Number(form.querySelector('[name="otherDeduction"]')?.value || 0);

    const gross = Math.max(0, b + m + c + bn + oa);
    const deductions = Math.max(0, tx + ad + lv + od);
    const net = Math.max(0, gross - deductions);

    const grossPaisa = Math.round(gross * 100);
    const dedPaisa = Math.round(deductions * 100);
    const netPaisa = Math.round(net * 100);

    const netEl = $('#slip-calc-net');
    const grossEl = $('#slip-calc-gross');
    const dedEl = $('#slip-calc-deductions');
    const wordsEl = $('#slip-calc-words');

    if(netEl) netEl.textContent = fullMoney(netPaisa);
    if(grossEl) grossEl.textContent = fullMoney(grossPaisa);
    if(dedEl) dedEl.textContent = fullMoney(dedPaisa);
    if(wordsEl) wordsEl.textContent = amountInWords(netPaisa);
  }

  form.addEventListener('input', updateRecalculations);

  if(empSelect){
    empSelect.addEventListener('change', () => {
      const e = state.employees.find(x => x.id === empSelect.value);
      if(e && basicInput){
        basicInput.value = String((e.salaryPaisa || 0) / 100);
        updateRecalculations();
      }
    });
  }

  function handleDeductToggle(){
    const isChecked = deductCheckbox.checked;
    if(accountSelectWrapper){
      accountSelectWrapper.style.opacity = isChecked ? '1' : '0.4';
      accountSelectWrapper.style.pointerEvents = isChecked ? 'auto' : 'none';
    }
    if(deductNotice){
      deductNotice.textContent = isChecked
        ? 'A salary expense transaction will be recorded in the selected account and deducted from your cash balance.'
        : 'No cashbook transaction will be created. Balance will remain unaffected (Ideal for old/historical slips, documentation & digital proof).';
      deductNotice.style.color = isChecked ? 'var(--purple)' : 'var(--muted)';
    }
  }

  if(deductCheckbox){
    deductCheckbox.addEventListener('change', handleDeductToggle);
    handleDeductToggle();
  }

  if(monthInput){
    monthInput.addEventListener('change', () => {
      const isPast = monthInput.value < curMonth;
      if(isPast && deductCheckbox.checked){
        deductCheckbox.checked = false;
        handleDeductToggle();
        toast('Past month selected: Account deduction turned off for historical slip.');
      }
      if(slipNumberInput && !slipNumberInput.dataset.manual){
        slipNumberInput.value = 'MS-PAY-' + monthInput.value.replace('-', '') + '-' + String(count).padStart(3, '0');
      }
    });
  }

  if(slipNumberInput){
    slipNumberInput.addEventListener('input', () => {
      slipNumberInput.dataset.manual = 'true';
    });
  }
}

/* ==========================================================================
   OTHER DIALOGS (TRANSACTION, ACCOUNT, EMPLOYEE, PAYMENT)
   ========================================================================== */
function showTransaction(kind='income',employeeId=''){
  if(!canWrite()||!ensureAccounts()) return;
  if(kind==='transfer'&&state.accounts.length<2){
    toast('A transfer needs at least two accounts.');
    return;
  }
  if(kind==='salary'&&!state.employees.length){
    toast('Add a team member first.');
    showAddEmployee();
    return;
  }

  const emp=state.employees.find(x=>x.id===employeeId);
  const paid=emp?activeTransactions(state).filter(t=>t.employeeId===emp.id&&t.kind==='salary'&&inPeriod(t,'month')).reduce((a,t)=>a+t.amountPaisa,0):0;

  modal(kind==='transfer'?'Transfer money':kind==='salary'?'Record salary payment':'Add transaction','Every entry keeps your company balance up to date.',`
    <form id="transaction-form">
      <div class="form-grid">
        ${select('Transaction type','kind',Object.entries(kindNames),kind)}
        ${field('Amount · PKR','amount','number',emp?String(Math.max(0,emp.salaryPaisa-paid)/100):'','required min="0.01" step="0.01" max="1000000000" placeholder="0.00"')}
        ${field('Payment date','date','date',today(),`required max="${today()}"`)}
        ${select(kind==='transfer'?'From account':'Account','accountId',state.accounts.map(a=>[a.id,a.name]))}
        <div class="field full-width">
          <label for="f-description">Description</label>
          <input id="f-description" name="description" required maxlength="180" placeholder="What was this payment for?" value="${emp?e(emp.name+' · salary payment'):''}">
        </div>
        <div id="tx-dynamic" class="full-width" style="grid-column:1/-1"></div>
      </div>
      <div class="note">Income and expenses affect operating surplus. Funding, withdrawals and transfers affect cash balances only.</div>
      ${formEnd('Record transaction')}
    </form>
  `,{
    submit:async data=>{
      const kind=data.get('kind'), emp=state.employees.find(x=>x.id===data.get('employeeId'));
      const t={
        kind,
        amountPaisa:toPaisa(data.get('amount')),
        date:data.get('date'),
        description:data.get('description').trim(),
        accountId:data.get('accountId'),
        toAccountId:kind==='transfer'?data.get('toAccountId'):'',
        category:data.get('category')||CATEGORIES[kind][0],
        party:kind==='salary'?emp?.name||'':data.get('party')?.trim()||'',
        employeeId:kind==='salary'?data.get('employeeId'):'',
        invoiceId:''
      };
      await store.addTransaction(t);
      closeModal();
      toast('Transaction recorded.');
      if(kind==='salary'&&emp&&data.get('generateSlip')==='on'){
        showCreateSalarySlip(emp.id,{
          issueDate:t.date,
          month:t.date.slice(0,7),
          paymentMode:'Bank Transfer'
        });
      }
    }
  });

  const dynamic=()=>{
    const k=$('#f-kind').value;
    $('#tx-dynamic').innerHTML=`<div class="form-grid">
      ${k==='transfer'?select('To account','toAccountId',state.accounts.map(a=>[a.id,a.name]),state.accounts[1]?.id):select('Category','category',CATEGORIES[k].map(c=>[c,c]))}
      ${k==='salary'?select('Team member','employeeId',state.employees.map(x=>[x.id,x.name]),employeeId):k==='transfer'?field('Reference / note','party','text','Internal','maxlength="120"'):field(k==='funding'||k==='drawing'?'Owner / co-founder':'Client / paid to','party','text','','maxlength="120" placeholder="Optional name"')}
      ${k==='salary'?`
        <div style="grid-column:1/-1;margin-top:6px">
          <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer">
            <input type="checkbox" name="generateSlip" checked style="accent-color:var(--purple);cursor:pointer">
            <span>Also create digital salary slip for this payment</span>
          </label>
        </div>
      `:''}
    </div>`;
  };
  dynamic();

  $('#f-kind').addEventListener('change',()=>{
    if($('#f-kind').value==='salary'&&!state.employees.length){
      toast('Add a team member first.');
      $('#f-kind').value='expense';
    }
    if($('#f-kind').value==='transfer'&&state.accounts.length<2){
      toast('Add a second account first.');
      $('#f-kind').value='expense';
    }
    dynamic();
  });
}

function showAddAccount(){
  if(!canWrite()) return;
  modal('Add company account','Set the balance before your first recorded transaction.',`
    <form>
      ${field('Account name','name','text','','required maxlength="80" placeholder="e.g. Business bank"')}
      <div class="form-grid">
        ${select('Account type','type',[['Bank','Bank'],['Cash','Cash'],['Wallet','Digital wallet']])}
        ${field('Opening balance · PKR','opening','number','0','required min="0" step="0.01" max="1000000000"')}
      </div>
      ${formEnd('Create account')}
    </form>
  `,{
    submit:async d=>{
      const opening=/^0(\.0{1,2})?$/.test(d.get('opening').trim())?0:toPaisa(d.get('opening'));
      await store.addAccount({name:d.get('name').trim(),type:d.get('type'),openingPaisa:opening});
      closeModal();
      toast('Account created.');
    }
  });
}

function showAddEmployee(){
  if(!canWrite()) return;
  modal('Add team member','Build your company’s payroll roster.',`
    <form>
      <div class="form-grid">
        ${field('Full name','name','text','','required maxlength="120"')}
        ${field('Role / position','role','text','','required maxlength="120"')}${field('Monthly salary · PKR','salary','number','','required min="0.01" step="0.01" max="1000000000"')}${field('Joining date','joined','date',today(),'required')}${field('Email · optional','email','email','','maxlength="254"')}
      </div>
      <div class="note">This adds a payroll record. It does not create a user account or grant login access.</div>
      ${formEnd('Add team member')}
    </form>
  `,{
    submit:async d=>{
      await store.addEmployee({
        name:d.get('name').trim(),
        role:d.get('role').trim(),
        salaryPaisa:toPaisa(d.get('salary')),
        joined:d.get('joined'),
        email:d.get('email').trim()
      });
      closeModal();
      toast('Team member added.');
    }
  });
}

function showPayment(id){
  const i=state.invoices.find(i=>i.id===id);
  if(!i||!canWrite()||!ensureAccounts()) return;
  modal('Record invoice payment',`# ${i.number} · ${i.client}`,`
    <div class="note" style="margin:0 0 20px">Outstanding balance: <strong>${fullMoney(i.amountPaisa-i.paidPaisa)}</strong></div>
    <form>
      <div class="form-grid">
        ${field('Amount received · PKR','amount','number',String((i.amountPaisa-i.paidPaisa)/100),`required min="0.01" step="0.01" max="${(i.amountPaisa-i.paidPaisa)/100}"`)}
        ${select('Received in','accountId',state.accounts.map(a=>[a.id,a.name]))}
        ${field('Payment date','date','date',today(),`required max="${today()}"`)}
      </div>
      ${formEnd('Record payment')}
    </form>
  `,{
    submit:async d=>{
      await store.payInvoice(id,{amountPaisa:toPaisa(d.get('amount')),accountId:d.get('accountId'),date:d.get('date')});
      closeModal();
      toast('Payment received and invoice balance updated.');
    }
  });
}

function showTransactionDetail(id){
  const t=state.transactions.find(t=>t.id===id);
  if(!t) return;
  const reversal=state.reversals.find(r=>r.transactionId===id);
  modal('Transaction detail',t.description,`
    <dl class="detail-list">
      ${[
        ['Type',kindNames[t.kind]],
        ['Amount',fullMoney(t.amountPaisa)],
        ['Date',t.date],
        ['Account',accountName(t.accountId)],
        ...(t.toAccountId?[['To account',accountName(t.toAccountId)]]:[]),
        ['Category',t.category],
        ['Person / company',t.party||'—'],
        ['Reference',t.id],
        ['Status',reversal?'Reversed':'Recorded']
      ].map(([l,v])=>`<div><dt>${e(l)}</dt><dd>${e(v)}</dd></div>`).join('')}
    </dl>
    ${reversal?`
      <div class="note">Reversal reason: ${e(reversal.reason)}</div>
    `:canWrite()?`
      <div class="note">The original entry will remain in your records. Reversing removes its effect on balances${t.invoiceId?' and restores the invoice amount due':''}.</div>
      <form style="margin-top:20px">
        ${field('Reason for reversal','reason','text','','required maxlength="300" placeholder="Explain the correction"')}
        ${formEnd('Reverse entry')}
      </form>
    `:''}
  `,{
    submit:async d=>{
      await store.reverseTransaction(id,d.get('reason').trim());
      closeModal();
      toast('Entry reversed. Original record preserved.');
    }
  });
}

function showAddCustomService(){
  if(!canWrite()) return;
  modal('Add Custom Service','Define a new solution or package tier for MetriSolution.',`
    <form id="add-service-form">
      <div class="form-grid">
        ${field('Service Name','name','text','','required maxlength="100" placeholder="e.g. AI Workflow Automation"')}
        ${select('Category','category',[['AI & Media','AI & Media'],['Web Development','Web Development'],['Design & Branding','Design & Branding'],['Digital Marketing','Digital Marketing'],['Software & Apps','Software & Apps']])}
      </div>
      <div class="field">
        <label for="f-desc">Description</label>
        <textarea id="f-desc" name="description" rows="2" required placeholder="What does this service deliver?"></textarea>
      </div>
      <div class="form-grid">
        ${field('Package Tier Name','packageName','text','Starter','required')}
        ${field('Package Price · PKR','packagePrice','number','','required min="0.01" step="0.01" placeholder="25000.00"')}
        ${select('Billing Model','billing',[['One-time','One-time'],['Monthly','Monthly Retainer']])}
        ${field('Key Feature / Bullet','feature','text','','placeholder="e.g. 24/7 monitoring"')}
      </div>
      ${formEnd('Save Service')}
    </form>
  `,{
    submit:async d=>{
      await store.addService({
        name: d.get('name').trim(),
        category: d.get('category').trim(),
        description: d.get('description').trim(),
        icon: 'spark',
        features: [d.get('feature')?.trim()||'Full professional delivery'],
        packages: [{
          name: d.get('packageName').trim(),
          description: d.get('description').trim(),
          pricePaisa: toPaisa(d.get('packagePrice')),
          billing: d.get('billing')
        }]
      });
      closeModal();
      toast('New service & package added.');
    }
  });
}

function showConnect(tab='login',previous={}){
  authTab=tab;
  previousAuth=previous;
  const saved=getSavedConfig();
  const config=previous.config||JSON.stringify(saved?.config||firebaseConfig||{apiKey:'',authDomain:'',projectId:'',appId:''},null,2);

  modal('Your company workspace','Sign in securely with Firebase Authentication.',`
    <div class="auth-tabs">
      <button type="button" data-action="auth-login" class="${tab==='login'?'active':''}">Sign in</button>
      <button type="button" data-action="auth-create" class="${tab==='create'?'active':''}">Create workspace</button>
    </div>
    <form id="connect-form">
      <div class="form-grid">
        ${field('Workspace ID','workspaceId','text',previous.workspaceId||saved?.workspaceId||'metrisolution','required pattern="[a-zA-Z0-9_\\-]{3,100}" maxlength="100"')}
        ${tab==='create'?field('Company name','companyName','text',previous.companyName||'MetriSolution Pvt LTD','required maxlength="100"'):''}
        ${field('Email address','email','email',previous.email||'','required autocomplete="username"')}
        ${field('Password','password','password','',`required autocomplete="${tab==='create'?'new-password':'current-password'}" minlength="${tab==='create'?12:6}"`)}
      </div>
      <div class="field">
        <label for="f-config">Firebase web configuration · JSON</label>
        <textarea id="f-config" name="config" required rows="4" spellcheck="false" style="font-family:monospace;font-size:10px">${e(config)}</textarea>
        <span class="help">Pre-configured with MetriSolution project.</span>
      </div>
      ${tab==='create'?'<div class="note">Creates a new company workspace and owner account.</div>':''}
      ${formEnd(tab==='create'?'Create workspace':'Sign in')}
    </form>
  `,{
    wide:true,
    submit:async d=>{
      let parsedConfig;
      try{
        parsedConfig=JSON.parse(d.get('config'));
      }catch{
        throw new Error('Configuration must be valid JSON.');
      }
      const {connectFirebase}=await import('./firebase-service.js');
      const next=await connectFirebase(parsedConfig,{
        email:d.get('email').trim(),
        password:d.get('password'),
        workspaceId:d.get('workspaceId').trim(),
        create:tab==='create',
        companyName:d.get('companyName')?.trim()||'MetriSolution Pvt LTD'
      });
      safeStorage('metri.firebase',JSON.stringify({config:parsedConfig,workspaceId:d.get('workspaceId').trim()}));
      safeStorage('metri.session','authenticated');
      store.destroy();
      bindStore(next);
      closeModal();
      location.hash='#overview';
      toast('Connected to company workspace.');
    }
  });
}

function showAudit(){
  modal('Workspace activity','A history of recorded actions.',`
    <div class="detail-list">
      ${state.audit.slice(0,60).map(a=>`
        <div style="align-items:flex-start;border-bottom:1px solid var(--line);padding-bottom:12px">
          <div style="display:block;min-width:0">
            <strong style="font-size:12px">${e(a.action)}</strong>
            <p class="muted small" style="margin-top:4px;overflow-wrap:anywhere">${e(a.detail)}</p>
          </div>
          <span class="small muted nowrap" style="font-size:10px;margin-left:12px">${e(a.createdAt?.slice(0,10)||'Now')}</span>
        </div>
      `).join('')||empty('No activity yet.','clock')}
    </div>
    ${state.audit.length>60?'<p class="muted small" style="margin-top:12px">Showing the latest 60 actions. A JSON backup contains the full log.</p>':''}
  `);
}


function download(name,data,type='text/csv;charset=utf-8'){
  const a=document.createElement('a'), url=URL.createObjectURL(new Blob([data],{type}));
  a.href=url;
  a.download=name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function exportLedger(){
  const rows=getPage()==='transactions'?filteredTx():activeTransactions(state).filter(t=>inPeriod(t,period)).sort(sortTx);
  download(`MetriSolution_Ledger_${today()}.csv`,'\ufeff'+csv([
    ['Company',state.company.name],
    ['Data mode',store.mode],
    ['Period',period],
    [],
    ['Date','Type','Description','Party','Category','From account','To account','Amount PKR','Status','Reference'],
    ...rows.map(t=>[
      t.date,
      kindNames[t.kind],
      t.description,
      t.party,
      t.category,
      accountName(t.accountId),
      t.toAccountId?accountName(t.toAccountId):'',
      (t.amountPaisa/100).toFixed(2),
      state.reversals.some(r=>r.transactionId===t.id)?'Reversed':'Recorded',
      t.id
    ])
  ]));
  toast('Ledger CSV downloaded.');
}

function exportReport(){
  const s=summary(state,period);
  download(`MetriSolution_Report_${today()}.csv`,'\ufeff'+csv([
    ['Company',state.company.name],
    ['Data mode',store.mode],
    ['Period',period],
    ['Generated',today()],
    [],
    ['Metric','Amount PKR'],
    ...Object.entries({
      'Operating income':s.income,
      'Operating expenses':s.expenses,
      'Operating surplus':s.surplus,
      'Owner funding':s.funding,
      'Owner withdrawals':s.drawings,
      'Cash balance (all time)':s.balance,
      'Receivables (all time)':s.receivables
    }).map(([k,v])=>[k,(v/100).toFixed(2)]),
    [],
    ['Expense category','Amount PKR'],
    ...expenseGroups(state,period).map(([k,v])=>[k,(v/100).toFixed(2)])
  ]));
  toast('Report CSV downloaded.');
}

/* ==========================================================================
   EVENT DELEGATION
   ========================================================================== */
document.addEventListener('click',async ev=>{
  const button=ev.target.closest('[data-action]'), p=ev.target.closest('[data-period]');
  if(p){
    period=p.dataset.period;
    render();
    return;
  }
  if(!button) return;

  const action=button.dataset.action, id=button.dataset.id;
  try{
    switch(action){
      case 'menu':
        menuOpen=!menuOpen;
        render();
        break;
      case 'close-modal':
        closeModal();
        break;
      case 'theme':
        document.body.classList.toggle('theme-dark');
        safeStorage('metri.theme',document.body.classList.contains('theme-dark')?'dark':'light');
        render();
        break;
      case 'add-transaction':
        showTransaction();
        break;
      case 'transfer':
        showTransaction('transfer');
        break;
      case 'add-account':
        showAddAccount();
        break;
      case 'add-employee':
        showAddEmployee();
        break;
      case 'pay-salary':
        showTransaction('salary',id);
        break;
      case 'create-invoice':
      case 'add-invoice':
        showInvoiceCreator();
        break;
      case 'invoice-with-package':
        showInvoiceCreator(button.dataset.desc, button.dataset.rate);
        break;
      case 'add-service':
        showAddCustomService();
        break;
      case 'filter-service':
        serviceFilter=button.dataset.category;
        render();
        break;
      case 'add-client':
        showAddClient();
        break;
      case 'edit-client':
        showAddClient(id);
        break;
      case 'delete-client':
        await store.deleteClient(id);
        toast('Client removed.');
        render();
        break;
      case 'filter-clients':
        clientFilter=button.dataset.filter||'all';
        render();
        break;
      case 'create-client-invoice':
        showInvoiceCreator('', '', id);
        break;
      case 'download-invoice':
        downloadInvoice(id);
        break;
      case 'run-monthly-invoicing':{
        const gen=await store.runMonthlyInvoicing();
        if(gen&&gen.length){
          toast(`✨ AI Engine: Automatically generated ${gen.length} monthly recurring invoice(s)!`);
          render();
        }else{
          toast('All active monthly retainer invoices are up to date for this month.');
        }
        break;
      }
      case 'pay-invoice':
        showPayment(id);
        break;
      case 'view-transaction':
        showTransactionDetail(id);
        break;
      case 'view-invoice':
        viewInvoice(id);
        break;
      case 'print-invoice':
        printInvoice(id);
        break;
      case 'download-pdf':
      case 'download-invoice-pdf':
        downloadInvoicePdf(id);
        break;
      case 'download-invoice':
      case 'download-invoice-html':
        downloadInvoice(id);
        break;
      case 'create-salary-slip':
        showCreateSalarySlip(id);
        break;
      case 'view-salary-slip':
        viewSalarySlip(id);
        break;
      case 'download-salary-slip-pdf':
        downloadSalarySlipPdf(id);
        break;
      case 'print-salary-slip':
        printSalarySlip(id);
        break;
      case 'share-salary-slip-whatsapp':{
        const slip = (state.salarySlips||[]).find(s=>s.id===id);
        if(slip) window.open(getSalarySlipWhatsAppUrl(slip), '_blank');
        break;
      }
      case 'delete-salary-slip':{
        const slip = (state.salarySlips||[]).find(s=>s.id===id);
        if(!slip) return;
        modal('Delete salary slip', `Remove salary slip #${slip.slipNumber} for ${slip.employeeName}?`, `
          <p>Are you sure you want to delete this salary slip? ${slip.transactionId ? 'Its linked accounting transaction will be reversed.' : 'No cashbook balances will be altered.'}</p>
          <div class="modal-actions" style="margin-top:16px">
            <button class="btn" data-action="close-modal">Cancel</button>
            <button class="btn" style="background:var(--red);color:#fff" id="confirm-delete-slip">Yes, delete slip</button>
          </div>
        `);
        $('#confirm-delete-slip')?.addEventListener('click', async () => {
          await store.deleteSalarySlip(id);
          closeModal();
          toast('Salary slip deleted.');
          render();
        });
        break;
      }
      case 'connect':
        showConnect();
        break;
      case 'auth-login':
      case 'auth-create':{
        const f=$('#connect-form'), d=f?Object.fromEntries(new FormData(f)):previousAuth;
        showConnect(action==='auth-login'?'login':'create',d);
        break;
      }
      case 'auth-tab-login':
        authTab='login';
        render();
        break;
      case 'auth-tab-create':
        authTab='create';
        render();
        break;
      case 'toggle-pwd':
        showPassword=!showPassword;
        render();
        break;
      case 'toggle-config':
        showConfigDrawer=!showConfigDrawer;
        render();
        break;
      case 'logout':
        if(store.mode==='firebase'&&store.signOut) await store.signOut().catch(()=>{});
        safeStorage('metri.session','');
        safeStorage('metri.firebase','');
        bindStore(createWorkspaceStore());
        location.hash='#login';
        render();
        toast('Signed out. Portal locked.');
        break;
      case 'export':
        exportReport();
        break;
      case 'export-ledger':
        exportLedger();
        break;
      case 'backup':
        download(`MetriSolution_Backup_${today()}.json`,JSON.stringify({exportedAt:new Date().toISOString(),dataMode:store.mode,workspace:state},null,2),'application/json');
        toast('Workspace backup downloaded.');
        break;
      case 'print':
        window.print();
        break;
      case 'audit':
        showAudit();
        break;
      case 'due':
        location.hash='invoices';
        break;
    }
  }catch(err){
    toast(friendlyError(err),true);
  }
});

document.addEventListener('input',ev=>{
  if(ev.target.id==='tx-search'){
    query=ev.target.value;
    updateTxSearch();
  }
});

document.addEventListener('change',ev=>{
  if(ev.target.id==='kind-filter'){
    kindFilter=ev.target.value;
    render();
  }
  if(ev.target.id==='account-filter'){
    accountFilter=ev.target.value;
    render();
  }
  if(ev.target.id==='show-reversed'){
    showReversed=ev.target.checked;
    render();
  }
});

document.addEventListener('submit',async ev=>{
  if(ev.target.id==='standalone-login-form'){
    ev.preventDefault();
    const form=ev.target, button=form.querySelector('button[type="submit"]'), error=form.querySelector('.form-error');
    if(error){
      error.textContent='';
      error.classList.remove('visible');
    }
    if(button) button.disabled=true;
    try{
      const data=new FormData(form);
      let parsedConfig;
      try{
        parsedConfig=JSON.parse(data.get('config')||JSON.stringify(firebaseConfig));
      }catch{
        throw new Error('Firebase configuration must be valid JSON.');
      }
      const {connectFirebase}=await import('./firebase-service.js');
      const next=await connectFirebase(parsedConfig,{
        email:data.get('email').trim(),
        password:data.get('password'),
        workspaceId:data.get('workspaceId').trim(),
        create:authTab==='create',
        companyName:data.get('companyName')?.trim()||'MetriSolution Pvt LTD'
      });
      safeStorage('metri.firebase',JSON.stringify({config:parsedConfig,workspaceId:data.get('workspaceId').trim()}));
      safeStorage('metri.session','authenticated');
      store.destroy();
      bindStore(next);
      location.hash='#overview';
      toast('Welcome to your company workspace!');
    }catch(err){
      if(error){
        error.textContent=friendlyError(err);
        error.classList.add('visible');
      }else{
        toast(friendlyError(err),true);
      }
    }finally{
      if(button) button.disabled=false;
    }
    return;
  }

  if(ev.target.id==='company-form'){
    ev.preventDefault();
    const form=ev.target, button=form.querySelector('button'), error=form.querySelector('.form-error');
    button.disabled=true;
    try{
      const d = new FormData(form);
      await store.updateCompany(d.get('name').trim(), {
        bankName: d.get('bankName')?.trim(),
        accountTitle: d.get('accountTitle')?.trim(),
        accountNumber: d.get('accountNumber')?.trim(),
        iban: d.get('iban')?.trim()
      });
      toast('Company profile & bank details updated.');
    }catch(err){
      error.textContent=friendlyError(err);
      error.classList.add('visible');
    }finally{
      button.disabled=false;
    }
  }
});

document.addEventListener('keydown',ev=>{
  if((ev.metaKey||ev.ctrlKey)&&ev.key.toLowerCase()==='k'){
    ev.preventDefault();
    $('#global-search')?.focus();
  }
  if(ev.target.id==='global-search'&&ev.key==='Enter'){
    query=ev.target.value;
    kindFilter='all';
    accountFilter='all';
    if(getPage()==='transactions') render();
    else location.hash='transactions';
  }
  if(ev.key==='Escape'){
    if($('#modal-root').children.length) closeModal();
    else if(menuOpen){
      menuOpen=false;
      render();
    }
  }
  if(ev.key==='Tab'&&$('#modal-root').children.length){
    const focusable=[...$('#modal-root').querySelectorAll('input:not([disabled]),select:not([disabled]),textarea:not([disabled]),button:not([disabled]),a[href]')];
    const first=focusable[0], last=focusable.at(-1);
    if(ev.shiftKey&&document.activeElement===first){
      ev.preventDefault();
      last?.focus();
    }else if(!ev.shiftKey&&document.activeElement===last){
      ev.preventDefault();
      first?.focus();
    }
  }
});

window.addEventListener('hashchange',()=>{
  menuOpen=false;
  render();
  window.scrollTo(0,0);
});

window.addEventListener('online',()=>{
  render();
  toast('Connection restored.');
});

window.addEventListener('offline',()=>{
  render();
  toast('Offline. Reconnect before recording company data.');
});

bindStore(store);

async function checkMonthlyInvoicing(){
  if(isAuthenticated()){
    try{
      const generated=await store.runMonthlyInvoicing();
      if(generated&&generated.length){
        toast(`✨ AI Engine: Automatically generated ${generated.length} monthly recurring invoice(s)!`);
        render();
      }
    }catch{}
  }
}
setTimeout(checkMonthlyInvoicing,1200);

const savedConnection=getSavedConfig();
const effectiveConfig=savedConnection?.config||(firebaseConfig?.apiKey?firebaseConfig:null);
const effectiveWorkspaceId=savedConnection?.workspaceId||'metrisolution';

if(effectiveConfig&&effectiveWorkspaceId&&!globalThis.process?.versions?.node){
  import('./firebase-service.js')
    .then(({resumeFirebase})=>resumeFirebase(effectiveConfig,effectiveWorkspaceId))
    .then(next=>{
      if(next){
        store.destroy?.();
        bindStore(next);
        safeStorage('metri.session','authenticated');
        safeStorage('metri.firebase',JSON.stringify({config:effectiveConfig,workspaceId:effectiveWorkspaceId}));
        render();
        toast('Company workspace connected.');
      }
    })
    .catch(err=>{
      console.warn('Firebase session restore error:', err);
      if(!isAuthenticated()){
        location.hash='#login';
        render();
      }
    });
}
