# MetriSolution Company Khata — System & Implementation Guide

Prepared 16 October 2026. Stack: HTML5, CSS3, vanilla JavaScript ES modules, Firebase Authentication and Cloud Firestore. Brand assets: supplied MetriSolution logo.

## 1. Software ka purpose

Company owner ko aik jaga par yeh nazar aaye: kitna paisa company ke paas hai, kitni income receive hui, kis cheez par expense hua, kis client se payment leni hai, aur employee/owner ko kitna diya gaya. Screens ko daily financial work ke around design kiya gaya hai.

Main workflow:

1. Owner company workspace create kare.
2. Bank, cash aur wallet ke opening balances enter kare.
3. Client invoice create kare. Is stage par cash income change nahi hoti.
4. Payment receive hone par invoice se receipt record kare; account aur receivable dono update hon.
5. Expense, salary, owner contribution/withdrawal ya transfer record kare.
6. Dashboard/reports se cash position dekhe aur exports nikale.
7. Ghalat financial entry ko delete karne ke bajaye reason ke saath reverse kare; corrected entry alag add kare.

## 2. Current modules

| Module | Implemented behaviour | Financial treatment |
| --- | --- | --- |
| Dashboard | KPIs, cash-flow chart, expense breakdown, recent ledger, balances | Derived from actual stored entries |
| Transactions | Search, date period, type and account filters, CSV, detail and reversal | Immutable original entries |
| Accounts | Bank/cash/wallet and opening balance | Current balance = opening + movements |
| Invoices | Client invoice, due date, partial/full payment, print | Only receipts create cash income |
| Team & payroll | Team roster, monthly targets, paid/remaining, salary payments | Salary paid is operating expense |
| Owner movements | Co-founder contribution and withdrawal through ledger | Cash movement, excluded from operating surplus |
| Reports | Income, expenses, surplus, owner movements, receivables, exports | Cash-basis management report |
| Settings | Company name, theme, cloud connection, backup, activity | Owner-only profile changes in cloud |

PKR is the only implemented currency. The business timezone is Asia/Karachi. Changing either requires a deliberate migration; a currency label must never reinterpret existing balances.

## 3. Theme & UI design

| Token | Value | Use |
| --- | --- | --- |
| Primary purple | `#7138CF` | Main actions, selected navigation, income chart |
| Orange | `#FB9548` | Expense accents and chart |
| Blue | `#2894ED` | Wallet/account information |
| Sidebar | `#211538` | Company navigation |
| Page canvas | `#F7F8FC` | Light application background |
| Surface | `#FFFFFF` | Tables, cards and dialogs |
| Main text | `#202334` | Titles and figures |
| Muted text | `#838496` | Secondary labels |
| Border | `#EDEEF4` | Quiet separation |
| Positive | `#2EAA80` | Cash receipts and settled indicators |
| Negative | `#D86474` | Outflows and error details |

Typography uses Manrope for headings/figures and DM Sans for body text, with system font fallbacks. The UI uses a compact company sidebar, neutral cards, clear financial numbers, restrained colors and 8–16 px corner radii. The supplied original logo remains in `assets/metrisolution-logo.png`; `metrisolution-mark.png` is a crop of its symbol for navigation.

Desktop uses a permanent sidebar. Tablets stack the chart panels. Phones use an accessible drawer, two KPI columns and horizontally scrollable ledger tables. Form inputs become 16 px on mobile. Dark theme and print styles are included. Reduced-motion preferences are respected.

## 4. Architecture

There is no separate Node.js backend in this implementation. Browser UI calls the Firebase modular Web SDK; Firestore Security Rules enforce data access and validation on the server side.

| Layer | Responsibility |
| --- | --- |
| `index.html`, `styles.css` | Semantic shell, responsive layouts and brand styling |
| `app.js` | Screen rendering, navigation, user input, dialogs and exports |
| `domain.js` | Money conversion, validation, balances, report calculations |
| `data.js` | Browser-only demonstration store with isolated sample data |
| `firebase-service.js` | Auth, listeners, batched writes and transactions |
| Firestore Security Rules | Membership, role authorization, schema checks and immutable records |

The storage adapter keeps the same UI usable in demo and cloud mode. Firebase is loaded only when connecting or restoring a cloud session. Demo data is never treated as a live company database. A connection error does not silently write real entries into a local demo.

The provided Hosting configuration declares security headers, including a Content Security Policy permitting the Firebase SDK and the selected font providers. Those headers apply when deployed through `firebase.json`; third-party hosts must configure equivalent headers separately.

## 5. Database schema

Every operational collection is nested under the company. Do not use a global collection query that mixes companies.

| Path | Main fields | Lifecycle |
| --- | --- | --- |
| `companies/{companyId}` | name, currency, timezone, ownerUid, createdAt | Create with owner membership; owner may rename |
| `companies/{companyId}/members/{uid}` | role, email, createdAt | Initial owner bootstrap; other members via trusted administrator |
| `…/accounts/{id}` | id, name, type, openingPaisa, createdAt, createdBy | Create; opening fixed |
| `…/transactions/{id}` | id, kind, amountPaisa, date, description, category, party, accountId, toAccountId, employeeId, invoiceId, createdAt, createdBy | Create; immutable |
| `…/reversals/{transactionId}` | transactionId, reason, createdAt, createdBy | At most one reversal per transaction |
| `…/invoices/{id}` | id, number, client, email, title, amountPaisa, paidPaisa, issued, due, revision, lastTxId, lastAction, createdAt, createdBy | Create; only guarded payment fields change |
| `…/employees/{id}` | id, name, role, salaryPaisa, email, joined, createdAt, createdBy | Create payroll roster record |
| `…/audit/{id}` | id, action, detail, createdAt, createdBy | Append-only activity events |

`createdAt` and `createdBy` use server timestamps and the authenticated UID in cloud mode. `date`, `issued`, `due` and `joined` use `YYYY-MM-DD` business dates. Money uses integer paisa; PKR 1,234.56 is stored as `123456`. The UI limits a single financial amount to PKR 1 billion.

Types of transaction:

| Kind | Source account | Destination account | Operating surplus |
| --- | --- | --- | --- |
| income | Increases | — | Increases |
| expense | Decreases | — | Decreases |
| salary | Decreases | — | Decreases |
| funding | Increases | — | No effect |
| drawing | Decreases | — | No effect |
| transfer | Decreases | Increases | No effect |

## 6. Calculation rules

- Active entries are transactions without a matching reversal.
- Account balance = opening balance + active receipts/funding − active expenses/salaries/drawings − outgoing transfers + incoming transfers.
- Available company balance = sum of all account balances.
- Period income = active `income` transactions in the selected period.
- Period expenses = active `expense` + `salary` transactions in the selected period.
- Operating surplus = period income − period expenses.
- Receivables = sum of invoice total − invoice paid amount.
- Team paid this month = active salary payments for that employee using payment date in the Karachi business month.
- Team remaining = maximum of zero and monthly target − paid this month. The salary target itself does not create an expense.

Dashboard balance and receivables are always all-time/current totals. Income, expenses, charts and report movements follow the selected period. Future-dated cash entries are rejected by the application; future due dates belong on invoices.

Example: opening bank PKR 100,000 + owner contribution 50,000 + received client payment 30,000 − expense 10,000 − salary 20,000 = cash PKR 150,000. Operating surplus is zero: 30,000 − 10,000 − 20,000. Owner capital is not sales.

## 7. Consistency and reversals

Balances are derived from immutable movements, avoiding conflicting updates to a stored account balance. A transfer is one document containing both accounts.

An invoice receipt uses a Firestore transaction: read the current invoice, validate the outstanding amount, create the receipt, increment invoice paid/revision fields and append an activity event. Concurrent invoice changes cause a retry against the current balance. Rules require the paired invoice/transaction changes and reject overpayment.

A reversal has the original transaction ID as its document ID. A second reversal therefore cannot be created. For an invoice receipt, reversal and the paid-balance reduction happen in one Firestore transaction. Original financial records cannot be updated or deleted by client code. Correct a mistake by reversing it and entering the replacement with a clear description.

Activity records are append-only client-visible events attributed to the authenticated user. They are not a cryptographic audit trail and do not cover Firebase administrators using privileged server credentials. Company profile changes are owner-controlled; the app records their activity, but an authorized direct metadata update is not paired by rules with an audit event.

## 8. Firebase setup — exact sequence

1. Open the Firebase console, create/select the intended project and register a Web App.
2. Copy its Web configuration. Do not copy an Admin SDK service-account key.
3. Enable Authentication → Email/Password. Configure the project's password policy and verify deployment domains under Authorized Domains.
4. Create a Cloud Firestore Standard database in production mode. Choose its region deliberately before adding company records.
5. Deploy this package's `firestore.rules` and `firestore.indexes.json` using the Firebase CLI, or paste the complete rules into the Rules editor and publish them. Do not leave the database open while setting up.
6. Set `firebaseConfig` in `dist/firebase-config.js`, or paste an equivalent JSON object in Settings. Required keys: apiKey, authDomain, projectId and appId. Other Firebase web config fields may be retained.
7. Serve over HTTP locally or HTTPS when hosted. Open the app and choose Settings → Create workspace.
8. Enter a unique workspace ID such as `metrisolution`, company name, email and a password of at least 12 characters. Root company and owner membership are created atomically. An existing email can authenticate to create a new workspace with an unused ID.
9. Add actual opening balances before entering subsequent payments. Do not enter both an historical balance and the historical transactions it already includes.
10. Create a small real test invoice/payment and confirm from a second signed-in session that the change appears. Reverse the test entry with its reason if it was only a test.

Example config:

```js
export const firebaseConfig = {
  apiKey: "YOUR_WEB_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  appId: "YOUR_WEB_APP_ID"
};
```

When using the Settings JSON field, paste only the object, using double quotes around keys/values. Do not include `const`, `export`, comments or a trailing semicolon.

Sessions use Firebase browser session persistence. Passwords are not saved by this app. Only web configuration and workspace ID are saved locally to restore a valid session on reload. Signing out opens the clearly labelled browser demo.

## 9. Team login access

The owner is the company creator. Other users need both a Firebase Authentication account and membership in the intended company. A trusted project administrator performs this setup:

1. Create the user in Firebase Authentication and obtain their UID.
2. Create `companies/{workspaceId}/members/{uid}` with `role` set to `accountant` or `viewer`, their `email` string and a `createdAt` timestamp.
3. Give the user the same workspace ID and ask them to sign in with their own credentials. Use an appropriate secure password handoff/reset process.
4. Revoke access by removing the membership through a trusted administration path. Client rules never permit changing memberships.

The current UI does not send invitations, emails or WhatsApp messages. A team member payroll record is not a security role. Viewer accounts can read/export the entire company's financial workspace, including payroll; do not assign this role to people who should only see their own payslip.

## 10. Deployment

From the project root, with Firebase CLI installed and authenticated:

```bash
firebase login
firebase use --add
firebase deploy --only firestore:rules,firestore:indexes,hosting
```

`dist/` is the deployable frontend. No frontend dependency install or build step is needed. Firebase JavaScript SDK modules load from Google's official CDN. The main navigation uses URL hashes, so it does not require server route rewrites.

Add/check the deployed hostname in Firebase Authentication's Authorized Domains. Test actual response headers after deployment. Use your Firebase console's current pricing, usage and billing settings for cost decisions; no paid plan or project resource was configured in this build.

## 11. Verification and launch criteria

Automated tests cover money precision, transfer conservation, owner movement separation, reversals, unpaid invoice treatment, input checks, salary employee validation, invoice states, CSV safety, partial payments, overpayment protection, persistence failure handling and consistency of sample receipts.

Before using real company books, verify against your configured Firebase environment:

| Scenario | Expected result |
| --- | --- |
| Unauthenticated collection read/write | Denied |
| User from company A reads company B | Denied |
| Viewer tries to add/update a financial record | Denied |
| Accountant tries to rename company or edit membership | Denied |
| Original transaction is changed/deleted | Denied |
| Receipt created without paired invoice change | Denied |
| Invoice paid amount changed without paired receipt/reversal | Denied |
| Two simultaneous payments exceed amount due | At most the valid payment commits |
| Duplicate reversal | Denied |
| Logout then refresh | Company records unavailable; labelled demo opens |
| Network failure during a write | Error shown; user does not see a success confirmation |
| Mobile 360/390 px, tablet 768 px and desktop | Navigation, forms and exports usable |

Use the Firebase Emulator Suite and `@firebase/rules-unit-testing` for automated permission tests before production. These rules were not exercised by the emulator in this environment. The current Firebase project was not connected, and browser visual QA was unavailable. See `VERIFICATION.md` for the exact distinction between completed checks and pending integration checks.

## 12. Production expansion roadmap

| Phase | Additions | Acceptance condition |
| --- | --- | --- |
| 1 — Live workspace | Real Firebase config, deployed rules, member setup and device QA | Login, cross-device sync, rule-denial cases and backup export verified |
| 2 — Daily operations | Employee/profile editing with effective salary history, account archiving, invoice drafts/void/credit notes and client/vendor directory | Past records remain reproducible after profile changes |
| 3 — Documents | Receipt attachment uploads with Storage rules, payslips and company invoice contact fields | Authorized users can upload/download only their company files |
| 4 — Automation | Scheduled invoices, salary reminders, server-side backup/restore and notifications | Retry-safe jobs, no duplicate payments/messages, approved delivery channels |
| 5 — Scale | Date-window queries, paginated ledger, materialized server aggregates and monitoring | Reports reconcile with immutable journal; read costs stay bounded |
| 6 — Accounting | Chart of accounts, balanced journal, receivables/payables, period closing and reconciliation | Debit/credit totals balance and accountant validates output |

The present implementation subscribes to all records in a small company's workspace for correct complete totals. It is not a large-ledger paging solution. Add date-window reads plus trusted server aggregates before growing to substantial record counts. JSON export is a manual snapshot, not an automatic recovery system; no in-app JSON restore is implemented. Current account/employee/invoice identity records are create-only, and tax calculations are not implemented.

## 13. Primary research sources

Firebase's own documentation was checked for this implementation:

- [Add Firebase to a JavaScript project](https://firebase.google.com/docs/web/setup) — modular SDK and Web App configuration; documented browser-module version 13.0.0 at review time.
- [Password-based authentication](https://firebase.google.com/docs/auth/web/password-auth) — email/password sign-in.
- [Firestore rule conditions](https://firebase.google.com/docs/firestore/security/rules-conditions) — authentication, document access and `getAfter()`.
- [Firestore transactions and batched writes](https://firebase.google.com/docs/firestore/manage-data/transactions) — atomic commits and concurrency behaviour.
- [Test Firestore Security Rules](https://firebase.google.com/docs/firestore/security/test-rules-emulator) — Emulator Suite verification.

These sources support the platform choices. The module scope, UI theme and company workflow are implementation decisions for this product.
