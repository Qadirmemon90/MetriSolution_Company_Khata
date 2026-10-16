import test from 'node:test';
import assert from 'node:assert/strict';

// No browser automation: this is a Node-only check that each screen can render
// from real application state without throwing or emitting broken numeric values.
test('all seven screens and basic record dialogs render with sample state',async()=>{
  const nodes=new Map(['#app','#modal-root','#toast-root'].map(k=>[k,{innerHTML:''}]));
  const docListeners={},winListeners={},data=new Map(),classes=new Set();
  globalThis.localStorage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
  globalThis.document={querySelector:s=>nodes.get(s)||null,body:{style:{},classList:{add:c=>classes.add(c),contains:c=>classes.has(c),toggle:c=>classes.has(c)?classes.delete(c):classes.add(c)}},addEventListener:(n,fn)=>docListeners[n]=fn,activeElement:null};
  Object.defineProperty(globalThis,'navigator',{value:{onLine:true},configurable:true});
  globalThis.location={hash:''};globalThis.window={addEventListener:(n,fn)=>winListeners[n]=fn,scrollTo:()=>{}};
  globalThis.requestAnimationFrame=fn=>fn();
  await import('../dist/app.js');
  for(const [route,title] of [['overview','Financial overview'],['transactions','Transactions'],['accounts','Company accounts'],['invoices','Invoices &amp; receivables'],['team','Team &amp; payroll'],['reports','Business reports'],['settings','Workspace settings']]){
    location.hash='#'+route;winListeners.hashchange();const html=nodes.get('#app').innerHTML;assert.ok(html.includes(title),route);assert.ok(html.includes('Demo workspace'),route);assert.ok(!html.includes('NaN'),route);assert.ok(!html.includes('PKR undefined'),route);
  }
  for(const action of ['add-account','add-invoice','add-employee','connect','audit']){
    await docListeners.click({target:{closest:s=>s==='[data-action]'?{dataset:{action}}:null}});
    assert.ok(nodes.get('#modal-root').innerHTML.includes('role="dialog"'),action);
  }
});
