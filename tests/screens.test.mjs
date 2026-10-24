import test from 'node:test';
import assert from 'node:assert/strict';

test('all screens, services, invoice generator and portal authentication lock render correctly', async () => {
  const nodes = new Map(['#app', '#modal-root', '#toast-root'].map(k => [k, { innerHTML: '' }]));
  const docListeners = {}, winListeners = {}, data = new Map(), classes = new Set();
  data.set('metri.session', 'authenticated');
  globalThis.localStorage = { getItem: k => data.get(k) || null, setItem: (k, v) => data.set(k, v) };
  globalThis.document = {
    querySelector: s => nodes.get(s) || null,
    body: {
      style: {},
      classList: {
        add: c => classes.add(c),
        contains: c => classes.has(c),
        toggle: c => classes.has(c) ? classes.delete(c) : classes.add(c)
      }
    },
    addEventListener: (n, fn) => docListeners[n] = fn,
    activeElement: null
  };
  Object.defineProperty(globalThis, 'navigator', { value: { onLine: true }, configurable: true });
  globalThis.location = { hash: '' };
  globalThis.window = { addEventListener: (n, fn) => winListeners[n] = fn, scrollTo: () => {} };
  globalThis.requestAnimationFrame = fn => fn();

  await import('../dist/app.js');

  const routes = [
    ['overview', 'Financial overview'],
    ['transactions', 'Transactions'],
    ['accounts', 'Company accounts'],
    ['invoices', 'Invoices &amp; receivables'],
    ['services', 'Services &amp; Packages'],
    ['team', 'Team &amp; payroll'],
    ['reports', 'Business reports'],
    ['settings', 'Workspace settings']
  ];

  for (const [route, title] of routes) {
    location.hash = '#' + route;
    winListeners.hashchange();
    const html = nodes.get('#app').innerHTML;
    assert.ok(html.includes(title), route);
    assert.ok(html.includes('Demo workspace'), route);
    assert.ok(!html.includes('NaN'), route);
    assert.ok(!html.includes('PKR undefined'), route);
  }

  // Verify Services & Packages content
  location.hash = '#services';
  winListeners.hashchange();
  const servicesHtml = nodes.get('#app').innerHTML;
  assert.ok(servicesHtml.includes('AI Product Image &amp; Video Shoot'), 'AI Product service present');
  assert.ok(servicesHtml.includes('Website Design &amp; Development'), 'Website design service present');
  assert.ok(servicesHtml.includes('E-Commerce Website Development'), 'Ecommerce service present');
  assert.ok(servicesHtml.includes('Social Media Marketing'), 'SMM service present');

  // Verify Dialogs
  for (const action of ['add-account', 'add-employee', 'connect', 'audit', 'create-invoice', 'add-service']) {
    await docListeners.click({ target: { closest: s => s === '[data-action]' ? { dataset: { action } } : null } });
    assert.ok(nodes.get('#modal-root').innerHTML.includes('role="dialog"'), action);
  }

  // Verify Portal Lock (Without login, portal cannot be accessed)
  data.delete('metri.session');
  location.hash = '#overview';
  winListeners.hashchange();
  const lockedHtml = nodes.get('#app').innerHTML;
  assert.ok(lockedHtml.includes('standalone-login-form'), 'portal is locked when unauthenticated');
  assert.ok(lockedHtml.includes('Sign in to your company'), 'shows sign in screen when unauthenticated');
  assert.ok(lockedHtml.includes('Sign In with Demo Account'), 'authorized demo access button present');
});
