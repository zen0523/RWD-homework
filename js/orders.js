/* ===== Customer Order Lookup — Odoo Integration ===== */

// --- Odoo config (set these or leave blank to use demo data) ---
const ODOO_CONFIG = {
  url:      '',   // e.g. 'https://myshop.odoo.com'
  db:       '',   // database name
  login:    '',
  password: '',
};

// --- Demo orders (used when Odoo is not configured) ---
const DEMO_ORDERS = {
  'S00001': {
    name: 'S00001',
    date_order: '2024-03-15 10:30:00',
    partner_id: [1, '王小明'],
    user_id: [1, '業務小李'],
    amount_total: 125000,
    state: 'done',
    currency_id: [1, 'TWD'],
    order_line: [
      { product_id: [1, '筆記型電腦 Pro 15"'], product_uom_qty: 4, price_unit: 28000 },
      { product_id: [2, '無線滑鼠'], product_uom_qty: 4, price_unit: 1500 },
      { product_id: [3, '筆電保護套'], product_uom_qty: 4, price_unit: 500 },
    ],
  },
  'S00002': {
    name: 'S00002',
    date_order: '2024-03-20 14:15:00',
    partner_id: [2, '陳美惠'],
    user_id: [1, '業務小李'],
    amount_total: 48500,
    state: 'sale',
    currency_id: [1, 'TWD'],
    order_line: [
      { product_id: [4, '27吋 4K 顯示器'], product_uom_qty: 2, price_unit: 22000 },
      { product_id: [5, '機械式鍵盤'], product_uom_qty: 1, price_unit: 4500 },
    ],
  },
  'S00003': {
    name: 'S00003',
    date_order: '2024-03-28 09:00:00',
    partner_id: [3, '林大緯'],
    user_id: [2, '業務小陳'],
    amount_total: 15600,
    state: 'draft',
    currency_id: [1, 'TWD'],
    order_line: [
      { product_id: [6, '人體工學辦公椅'], product_uom_qty: 1, price_unit: 12000 },
      { product_id: [7, '桌面收納架'], product_uom_qty: 2, price_unit: 1800 },
    ],
  },
  'S00004': {
    name: 'S00004',
    date_order: '2024-03-10 16:45:00',
    partner_id: [4, '張志遠'],
    user_id: [1, '業務小李'],
    amount_total: 3200,
    state: 'cancel',
    currency_id: [1, 'TWD'],
    order_line: [
      { product_id: [8, 'USB-C Hub 7合1'], product_uom_qty: 2, price_unit: 1600 },
    ],
  },
};

// --- Status config ---
const STATUS = {
  draft:  { label: '待確認',  pillClass: 'pill-draft',  step: 0 },
  sent:   { label: '已報價',  pillClass: 'pill-sale',   step: 1 },
  sale:   { label: '確認中',  pillClass: 'pill-sale',   step: 2 },
  done:   { label: '已完成',  pillClass: 'pill-done',   step: 3 },
  cancel: { label: '已取消',  pillClass: 'pill-cancel', step: -1 },
};

// --- Timeline steps ---
const STEPS = [
  { name: '待確認', icon: '<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/>' },
  { name: '已確認', icon: '<polyline points="20 6 9 17 4 12"/>' },
  { name: '出貨中', icon: '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>' },
  { name: '已送達', icon: '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' },
];

// --- Odoo JSON-RPC helper ---
async function odooCall(endpoint, params) {
  const resp = await fetch(`${ODOO_CONFIG.url}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ jsonrpc: '2.0', method: 'call', id: Date.now(), params }),
  });
  const json = await resp.json();
  if (json.error) throw new Error(json.error.data?.message || json.error.message);
  return json.result;
}

async function fetchOrderFromOdoo(orderName) {
  // Authenticate if needed
  if (!window._odooUid) {
    const auth = await fetch(`${ODOO_CONFIG.url}/web/session/authenticate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        jsonrpc: '2.0', method: 'call', id: Date.now(),
        params: { db: ODOO_CONFIG.db, login: ODOO_CONFIG.login, password: ODOO_CONFIG.password },
      }),
    });
    const authJson = await auth.json();
    if (!authJson.result?.uid) throw new Error('Odoo 登入失敗');
    window._odooUid = authJson.result.uid;
  }

  const results = await odooCall('/web/dataset/call_kw', {
    model: 'sale.order',
    method: 'search_read',
    args: [[['name', '=', orderName]]],
    kwargs: {
      fields: ['name', 'date_order', 'partner_id', 'user_id',
               'amount_total', 'state', 'currency_id', 'order_line'],
      limit: 1,
    },
  });

  if (!results.length) return null;
  const order = results[0];

  // Fetch order lines detail
  if (order.order_line?.length) {
    const lines = await odooCall('/web/dataset/call_kw', {
      model: 'sale.order.line',
      method: 'read',
      args: [order.order_line],
      kwargs: { fields: ['product_id', 'product_uom_qty', 'price_unit', 'price_subtotal'] },
    });
    order.order_line = lines;
  }

  return order;
}

// --- Main lookup ---
async function lookupOrder(rawName) {
  const name = rawName.trim().toUpperCase();
  if (!name) {
    setError('請輸入訂單編號');
    return;
  }

  setError('');
  showLoading();

  try {
    let order;
    if (ODOO_CONFIG.url && ODOO_CONFIG.db) {
      order = await fetchOrderFromOdoo(name);
    } else {
      // Demo: slight delay for realism
      await new Promise(r => setTimeout(r, 500));
      order = DEMO_ORDERS[name] || null;
    }

    if (order) {
      renderOrder(order);
    } else {
      renderNotFound(name);
    }
  } catch (err) {
    renderError(err.message);
  }
}

// --- Render order card ---
function renderOrder(order) {
  const st = STATUS[order.state] || { label: order.state, pillClass: '', step: 0 };
  const isCancelled = order.state === 'cancel';

  // Timeline
  const timelineHTML = buildTimeline(st.step, isCancelled);

  // Info cells
  const customer = Array.isArray(order.partner_id) ? order.partner_id[1] : (order.partner_id || '—');
  const salesperson = Array.isArray(order.user_id) ? order.user_id[1] : (order.user_id || '—');

  // Lines
  const lines = (order.order_line || []).map(line => {
    const name = Array.isArray(line.product_id) ? line.product_id[1] : (line.product_id || '商品');
    const qty  = line.product_uom_qty || 0;
    const unit = line.price_unit || 0;
    const sub  = line.price_subtotal != null ? line.price_subtotal : qty * unit;
    return `
      <div class="order-line">
        <div class="line-icon">
          <svg viewBox="0 0 24 24"><path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
        </div>
        <div class="line-name">${escHtml(name)}</div>
        <div class="line-qty">x${qty}</div>
        <div class="line-amount">${fmtAmt(sub, order.currency_id)}</div>
      </div>`;
  }).join('');

  getResult().innerHTML = `
    <div class="order-card">
      <div class="card-header">
        <div class="order-meta">
          <h2>${escHtml(order.name)}</h2>
          <p class="order-date">建立日期：${fmtDate(order.date_order)}</p>
        </div>
        <span class="status-pill ${st.pillClass}">${st.label}</span>
      </div>

      <div class="progress-wrap">
        <p class="progress-label">訂單進度</p>
        ${timelineHTML}
      </div>

      <div class="info-grid">
        <div class="info-cell">
          <p class="cell-label">訂購人</p>
          <p class="cell-value">${escHtml(customer)}</p>
        </div>
        <div class="info-cell">
          <p class="cell-label">負責業務</p>
          <p class="cell-value">${escHtml(salesperson)}</p>
        </div>
      </div>

      <div class="lines-wrap">
        <p class="lines-title">訂購商品</p>
        ${lines || '<p style="color:var(--color-text-muted);font-size:14px;padding:16px 0">無商品資料</p>'}
        <div class="total-bar">
          <span class="total-label">訂單總金額</span>
          <span class="total-amount">${fmtAmt(order.amount_total, order.currency_id)}</span>
        </div>
      </div>
    </div>`;
}

function buildTimeline(activeStep, isCancelled) {
  if (isCancelled) {
    const stepsHtml = STEPS.map((s, i) => `
      <div class="step ${i === 0 ? 'cancelled' : ''}">
        <div class="step-dot">
          <svg viewBox="0 0 24 24">${i === 0
            ? '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'
            : s.icon}</svg>
        </div>
        <span class="step-name">${i === 0 ? '已取消' : s.name}</span>
      </div>`).join('');
    return `<div class="timeline"><div class="timeline-fill" style="width:0%"></div>${stepsHtml}</div>`;
  }

  const fillPct = activeStep === STEPS.length - 1 ? 100
    : (activeStep / (STEPS.length - 1)) * 100;

  const stepsHtml = STEPS.map((s, i) => {
    const cls = i < activeStep ? 'done' : i === activeStep ? 'active' : '';
    const icon = i <= activeStep
      ? (i < activeStep ? '<polyline points="20 6 9 17 4 12"/>' : s.icon)
      : s.icon;
    return `
      <div class="step ${cls}">
        <div class="step-dot"><svg viewBox="0 0 24 24">${icon}</svg></div>
        <span class="step-name">${s.name}</span>
      </div>`;
  }).join('');

  return `
    <div class="timeline">
      <div class="timeline-fill" style="width:calc(${fillPct}% - 28px)"></div>
      ${stepsHtml}
    </div>`;
}

function renderNotFound(name) {
  getResult().innerHTML = `
    <div class="not-found">
      <div class="not-found-icon">
        <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </div>
      <h3>找不到訂單「${escHtml(name)}」</h3>
      <p>請確認訂單編號是否正確，或聯繫客服人員</p>
    </div>`;
}

function renderError(msg) {
  getResult().innerHTML = `
    <div class="not-found">
      <div class="not-found-icon">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>
      <h3>查詢失敗</h3>
      <p>${escHtml(msg)}</p>
    </div>`;
}

function showLoading() {
  getResult().innerHTML = `
    <div class="loading-wrap">
      <div class="spinner"></div>
      <p>查詢中...</p>
    </div>`;
}

// --- Helpers ---
function getResult() { return document.getElementById('resultSection'); }
function setError(msg) { document.getElementById('searchError').textContent = msg; }

function fmtDate(str) {
  if (!str) return '—';
  const d = new Date(str);
  if (isNaN(d)) return str;
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
}

function fmtAmt(n, currency) {
  const sym = Array.isArray(currency) ? currency[1] : (currency || 'TWD');
  if (sym === 'TWD') return 'NT$' + (n || 0).toLocaleString('zh-TW', { maximumFractionDigits: 0 });
  return (n || 0).toLocaleString('zh-TW', { style: 'currency', currency: sym });
}

function escHtml(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// --- Init ---
document.getElementById('searchForm').addEventListener('submit', e => {
  e.preventDefault();
  lookupOrder(document.getElementById('orderInput').value);
});

// Auto-load if URL has ?order=S00001
const urlOrder = new URLSearchParams(location.search).get('order');
if (urlOrder) {
  document.getElementById('orderInput').value = urlOrder;
  lookupOrder(urlOrder);
}
