/* ===== Odoo Order Display ===== */

// --- State ---
const state = {
  orders: [],
  filtered: [],
  currentFilter: 'all',
  currentPage: 1,
  pageSize: 10,
  searchQuery: '',
  sortBy: 'date_order desc',
  connected: false,
  odoo: { url: '', db: '', uid: null, password: '' },
};

// --- Demo Data ---
const DEMO_ORDERS = [
  { id: 1,  name: 'S00001', date_order: '2024-03-15', partner_id: [1, '台灣科技股份有限公司'], user_id: [1, '王小明'], amount_total: 125000, state: 'done',   currency_id: [1,'TWD'], order_line: [{product_id:[1,'筆記型電腦'], product_uom_qty:5, price_unit:25000}] },
  { id: 2,  name: 'S00002', date_order: '2024-03-16', partner_id: [2, '創新設計有限公司'],     user_id: [2, '李美華'], amount_total: 48500,  state: 'sale',   currency_id: [1,'TWD'], order_line: [{product_id:[2,'顯示器'], product_uom_qty:2, price_unit:18000},{product_id:[3,'鍵盤'], product_uom_qty:5, price_unit:2500}] },
  { id: 3,  name: 'S00003', date_order: '2024-03-17', partner_id: [3, '數位行銷顧問公司'],     user_id: [1, '王小明'], amount_total: 32000,  state: 'draft',  currency_id: [1,'TWD'], order_line: [{product_id:[4,'辦公椅'], product_uom_qty:4, price_unit:8000}] },
  { id: 4,  name: 'S00004', date_order: '2024-03-18', partner_id: [4, '綠能科技企業社'],       user_id: [3, '張志遠'], amount_total: 89000,  state: 'done',   currency_id: [1,'TWD'], order_line: [{product_id:[5,'伺服器'], product_uom_qty:1, price_unit:89000}] },
  { id: 5,  name: 'S00005', date_order: '2024-03-19', partner_id: [5, '優質食品股份有限公司'], user_id: [2, '李美華'], amount_total: 15600,  state: 'cancel', currency_id: [1,'TWD'], order_line: [{product_id:[6,'掃描器'], product_uom_qty:2, price_unit:7800}] },
  { id: 6,  name: 'S00006', date_order: '2024-03-20', partner_id: [6, '藍天房地產開發'],       user_id: [1, '王小明'], amount_total: 210000, state: 'sale',   currency_id: [1,'TWD'], order_line: [{product_id:[7,'工作站'], product_uom_qty:3, price_unit:70000}] },
  { id: 7,  name: 'S00007', date_order: '2024-03-21', partner_id: [7, '海洋物流股份公司'],     user_id: [3, '張志遠'], amount_total: 67500,  state: 'done',   currency_id: [1,'TWD'], order_line: [{product_id:[8,'印表機'], product_uom_qty:5, price_unit:13500}] },
  { id: 8,  name: 'S00008', date_order: '2024-03-22', partner_id: [8, '宇宙電子商務'],         user_id: [2, '李美華'], amount_total: 9800,   state: 'draft',  currency_id: [1,'TWD'], order_line: [{product_id:[9,'滑鼠'], product_uom_qty:14, price_unit:700}] },
  { id: 9,  name: 'S00009', date_order: '2024-03-23', partner_id: [1, '台灣科技股份有限公司'], user_id: [1, '王小明'], amount_total: 45000,  state: 'sale',   currency_id: [1,'TWD'], order_line: [{product_id:[10,'平板電腦'], product_uom_qty:3, price_unit:15000}] },
  { id: 10, name: 'S00010', date_order: '2024-03-24', partner_id: [3, '數位行銷顧問公司'],     user_id: [3, '張志遠'], amount_total: 128000, state: 'done',   currency_id: [1,'TWD'], order_line: [{product_id:[1,'筆記型電腦'], product_uom_qty:4, price_unit:25000},{product_id:[3,'鍵盤'], product_uom_qty:8, price_unit:2500}] },
  { id: 11, name: 'S00011', date_order: '2024-03-25', partner_id: [5, '優質食品股份有限公司'], user_id: [2, '李美華'], amount_total: 37800,  state: 'sale',   currency_id: [1,'TWD'], order_line: [{product_id:[4,'辦公椅'], product_uom_qty:3, price_unit:8000},{product_id:[3,'鍵盤'], product_uom_qty:6, price_unit:2800}] },
  { id: 12, name: 'S00012', date_order: '2024-03-26', partner_id: [2, '創新設計有限公司'],     user_id: [1, '王小明'], amount_total: 5600,   state: 'cancel', currency_id: [1,'TWD'], order_line: [{product_id:[9,'滑鼠'], product_uom_qty:8, price_unit:700}] },
  { id: 13, name: 'S00013', date_order: '2024-03-27', partner_id: [6, '藍天房地產開發'],       user_id: [3, '張志遠'], amount_total: 155000, state: 'draft',  currency_id: [1,'TWD'], order_line: [{product_id:[7,'工作站'], product_uom_qty:2, price_unit:70000},{product_id:[10,'平板電腦'], product_uom_qty:1, price_unit:15000}] },
  { id: 14, name: 'S00014', date_order: '2024-03-28', partner_id: [7, '海洋物流股份公司'],     user_id: [2, '李美華'], amount_total: 22400,  state: 'sale',   currency_id: [1,'TWD'], order_line: [{product_id:[8,'印表機'], product_uom_qty:1, price_unit:13500},{product_id:[9,'滑鼠'], product_uom_qty:12, price_unit:740}] },
  { id: 15, name: 'S00015', date_order: '2024-03-29', partner_id: [4, '綠能科技企業社'],       user_id: [1, '王小明'], amount_total: 61000,  state: 'done',   currency_id: [1,'TWD'], order_line: [{product_id:[2,'顯示器'], product_uom_qty:3, price_unit:18000},{product_id:[6,'掃描器'], product_uom_qty:1, price_unit:7000}] },
];

// --- Status Config ---
const STATUS_LABEL = { draft: '待確認', sent: '已報價', sale: '確認中', done: '已完成', cancel: '已取消' };
const STATUS_CLASS = { draft: 'status-draft', sent: 'status-sent', sale: 'status-sale', done: 'status-done', cancel: 'status-cancel' };

// --- Odoo JSON-RPC ---
async function odooRpc(endpoint, params) {
  const { url, db, uid, password } = state.odoo;
  const payload = { jsonrpc: '2.0', method: 'call', id: Date.now(), params };
  const res = await fetch(`${url}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.data?.message || json.error.message);
  return json.result;
}

async function odooAuthenticate(url, db, user, password) {
  const result = await fetch(`${url}/web/session/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      jsonrpc: '2.0', method: 'call', id: Date.now(),
      params: { db, login: user, password },
    }),
  });
  const json = await result.json();
  if (json.error) throw new Error(json.error.data?.message || json.error.message);
  if (!json.result?.uid) throw new Error('登入失敗，請確認帳號密碼');
  return json.result.uid;
}

async function fetchOdooOrders() {
  const { url, db, uid, password } = state.odoo;
  const result = await odooRpc('/web/dataset/call_kw', {
    model: 'sale.order',
    method: 'search_read',
    args: [[]],
    kwargs: {
      fields: ['name', 'date_order', 'partner_id', 'user_id', 'amount_total', 'state', 'currency_id', 'order_line'],
      limit: 200,
      order: state.sortBy,
    },
  });
  return result;
}

// --- Data ---
async function loadOrders() {
  showLoading();
  try {
    let orders;
    if (state.connected) {
      orders = await fetchOdooOrders();
    } else {
      orders = DEMO_ORDERS;
    }
    state.orders = orders;
    applyFilters();
    updateStats();
  } catch (err) {
    showError(err.message);
  }
}

function applyFilters() {
  let list = [...state.orders];

  // Filter by status
  if (state.currentFilter !== 'all') {
    list = list.filter(o => o.state === state.currentFilter);
  }

  // Search
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    list = list.filter(o =>
      o.name.toLowerCase().includes(q) ||
      (o.partner_id[1] || '').toLowerCase().includes(q)
    );
  }

  // Sort (for demo data, sort client-side)
  if (!state.connected) {
    const [field, dir] = state.sortBy.split(' ');
    list.sort((a, b) => {
      let av = a[field], bv = b[field];
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      return dir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }

  state.filtered = list;
  state.currentPage = 1;
  renderTable();
  renderPagination();
}

function updateStats() {
  const all = state.orders;
  document.getElementById('statTotal').textContent = all.length;
  document.getElementById('statDraft').textContent  = all.filter(o => o.state === 'draft').length;
  document.getElementById('statSale').textContent   = all.filter(o => o.state === 'sale').length;
  document.getElementById('statDone').textContent   = all.filter(o => o.state === 'done').length;
  document.getElementById('pendingBadge').textContent = all.filter(o => o.state === 'draft').length;
}

// --- Render ---
function renderTable() {
  const tbody = document.getElementById('orderTableBody');
  const start = (state.currentPage - 1) * state.pageSize;
  const page  = state.filtered.slice(start, start + state.pageSize);

  document.getElementById('resultCount').textContent = state.filtered.length;

  if (page.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="7">
        <div class="empty-state">
          <svg viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4"/></svg>
          <p>沒有符合條件的訂單</p>
        </div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = page.map(order => `
    <tr data-id="${order.id}">
      <td><span class="order-number">${escHtml(order.name)}</span></td>
      <td>${formatDate(order.date_order)}</td>
      <td>
        <div class="customer-cell">
          <div class="customer-avatar">${getInitial(order.partner_id[1])}</div>
          ${escHtml(order.partner_id[1] || '—')}
        </div>
      </td>
      <td>${escHtml(order.user_id ? order.user_id[1] : '—')}</td>
      <td><span class="amount">${formatAmount(order.amount_total, order.currency_id)}</span></td>
      <td><span class="status-badge ${STATUS_CLASS[order.state] || ''}">${STATUS_LABEL[order.state] || order.state}</span></td>
      <td><button class="action-btn view-btn">查看</button></td>
    </tr>
  `).join('');

  // Row click → drawer
  tbody.querySelectorAll('tr[data-id]').forEach(tr => {
    const openDrawer = () => {
      const id = parseInt(tr.dataset.id);
      const order = state.orders.find(o => o.id === id);
      if (order) showDrawer(order);
    };
    tr.querySelector('.view-btn').addEventListener('click', e => { e.stopPropagation(); openDrawer(); });
    tr.addEventListener('click', openDrawer);
  });
}

function renderPagination() {
  const total = Math.ceil(state.filtered.length / state.pageSize);
  const pg = document.getElementById('pagination');
  if (total <= 1) { pg.innerHTML = ''; return; }

  const cur = state.currentPage;
  let pages = [];

  // Always show first, last, current ±1
  const show = new Set([1, total, cur, cur - 1, cur + 1].filter(p => p >= 1 && p <= total));
  const sorted = [...show].sort((a, b) => a - b);

  pages.push(`<button class="page-btn" data-page="${cur - 1}" ${cur === 1 ? 'disabled' : ''}>‹</button>`);
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) pages.push(`<span style="padding:0 4px;color:var(--color-text-secondary)">…</span>`);
    pages.push(`<button class="page-btn ${p === cur ? 'active' : ''}" data-page="${p}">${p}</button>`);
    prev = p;
  }
  pages.push(`<button class="page-btn" data-page="${cur + 1}" ${cur === total ? 'disabled' : ''}>›</button>`);

  pg.innerHTML = pages.join('');
  pg.querySelectorAll('.page-btn[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.currentPage = parseInt(btn.dataset.page);
      renderTable();
      renderPagination();
    });
  });
}

// --- Drawer ---
function showDrawer(order) {
  const title = document.getElementById('drawerTitle');
  const body  = document.getElementById('drawerBody');

  title.textContent = `訂單 ${order.name}`;

  const lines = (order.order_line || []).map(line => {
    const name = Array.isArray(line.product_id) ? line.product_id[1] : (line.product_id || '—');
    const qty  = line.product_uom_qty || 0;
    const unit = line.price_unit || 0;
    const sub  = qty * unit;
    return `<tr>
      <td>${escHtml(name)}</td>
      <td style="text-align:center">${qty}</td>
      <td style="text-align:right">${formatCurrency(unit)}</td>
      <td style="text-align:right;font-weight:600">${formatCurrency(sub)}</td>
    </tr>`;
  }).join('');

  body.innerHTML = `
    <div class="detail-section">
      <div class="detail-section-title">基本資訊</div>
      <div class="detail-grid">
        <div class="detail-item">
          <span class="label">訂單編號</span>
          <span class="value" style="color:var(--color-primary);font-family:monospace">${escHtml(order.name)}</span>
        </div>
        <div class="detail-item">
          <span class="label">狀態</span>
          <span class="value"><span class="status-badge ${STATUS_CLASS[order.state] || ''}">${STATUS_LABEL[order.state] || order.state}</span></span>
        </div>
        <div class="detail-item">
          <span class="label">建立日期</span>
          <span class="value">${formatDate(order.date_order)}</span>
        </div>
        <div class="detail-item">
          <span class="label">銷售人員</span>
          <span class="value">${escHtml(order.user_id ? order.user_id[1] : '—')}</span>
        </div>
      </div>
    </div>
    <hr class="detail-divider"/>
    <div class="detail-section">
      <div class="detail-section-title">客戶資訊</div>
      <div class="detail-grid">
        <div class="detail-item" style="grid-column:1/-1">
          <span class="label">公司名稱</span>
          <span class="value">${escHtml(order.partner_id[1] || '—')}</span>
        </div>
      </div>
    </div>
    <hr class="detail-divider"/>
    <div class="detail-section">
      <div class="detail-section-title">訂單項目</div>
      ${lines ? `
        <table class="order-lines-table">
          <thead><tr><th>產品</th><th style="text-align:center">數量</th><th style="text-align:right">單價</th><th style="text-align:right">小計</th></tr></thead>
          <tbody>${lines}</tbody>
        </table>
        <div class="total-row">
          <span>總計</span>
          <span>${formatAmount(order.amount_total, order.currency_id)}</span>
        </div>
      ` : '<p style="color:var(--color-text-secondary);font-size:13px">無訂單項目</p>'}
    </div>
  `;

  document.getElementById('drawerOverlay').classList.add('open');
  document.getElementById('orderDrawer').classList.add('open');
}

function closeDrawer() {
  document.getElementById('drawerOverlay').classList.remove('open');
  document.getElementById('orderDrawer').classList.remove('open');
}

// --- Modal ---
function openModal() {
  document.getElementById('connectModal').classList.add('open');
  document.getElementById('connectError').style.display = 'none';
}

function closeModal() {
  document.getElementById('connectModal').classList.remove('open');
}

// --- Loading / Error ---
function showLoading() {
  document.getElementById('orderTableBody').innerHTML = `
    <tr class="loading-row"><td colspan="7">
      <div class="loading-state"><div class="spinner"></div><span>載入訂單中...</span></div>
    </td></tr>`;
}

function showError(msg) {
  document.getElementById('orderTableBody').innerHTML = `
    <tr><td colspan="7">
      <div class="empty-state">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <p>載入失敗：${escHtml(msg)}</p>
      </div>
    </td></tr>`;
}

// --- Helpers ---
function formatDate(str) {
  if (!str) return '—';
  const d = new Date(str);
  if (isNaN(d)) return str;
  return d.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function formatCurrency(n) {
  return 'NT$' + (n || 0).toLocaleString('zh-TW', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatAmount(n, currency) {
  const sym = (Array.isArray(currency) ? currency[1] : currency) || 'TWD';
  if (sym === 'TWD') return formatCurrency(n);
  return (n || 0).toLocaleString('zh-TW', { style: 'currency', currency: sym });
}

function getInitial(name) {
  if (!name) return '?';
  return name.trim().charAt(0).toUpperCase();
}

function escHtml(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// --- Sidebar toggle ---
function initSidebar() {
  const sidebar  = document.getElementById('sidebar');
  const menuBtn  = document.getElementById('menuBtn');
  const overlay  = document.createElement('div');
  overlay.className = 'drawer-overlay';
  document.body.appendChild(overlay);

  const toggle = () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
  };

  menuBtn.addEventListener('click', toggle);
  overlay.addEventListener('click', toggle);
}

// --- Event Listeners ---
function initEvents() {
  // Connect modal
  document.getElementById('connectBtn').addEventListener('click', openModal);
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('useDemoBtn').addEventListener('click', () => {
    state.connected = false;
    closeModal();
    loadOrders();
  });

  document.getElementById('connectSubmitBtn').addEventListener('click', async () => {
    const url  = document.getElementById('odooUrl').value.trim().replace(/\/$/, '');
    const db   = document.getElementById('odooDb').value.trim();
    const user = document.getElementById('odooUser').value.trim();
    const pass = document.getElementById('odooPass').value;
    const errEl = document.getElementById('connectError');

    if (!url || !db || !user || !pass) {
      errEl.textContent = '請填寫所有欄位';
      errEl.style.display = 'flex';
      return;
    }

    const btn = document.getElementById('connectSubmitBtn');
    btn.textContent = '連接中...';
    btn.disabled = true;
    errEl.style.display = 'none';

    try {
      const uid = await odooAuthenticate(url, db, user, pass);
      state.odoo = { url, db, uid, password: pass };
      state.connected = true;
      closeModal();
      loadOrders();
    } catch (err) {
      errEl.innerHTML = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> ${escHtml(err.message)}`;
      errEl.style.display = 'flex';
    } finally {
      btn.textContent = '連接';
      btn.disabled = false;
    }
  });

  // Refresh
  document.getElementById('refreshBtn').addEventListener('click', loadOrders);

  // Filter tabs
  document.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentFilter = btn.dataset.filter;
      applyFilters();
    });
  });

  // Search
  let searchTimer;
  document.getElementById('searchInput').addEventListener('input', e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.searchQuery = e.target.value;
      applyFilters();
    }, 250);
  });

  // Sort
  document.getElementById('sortSelect').addEventListener('change', e => {
    state.sortBy = e.target.value;
    if (state.connected) {
      loadOrders();
    } else {
      applyFilters();
    }
  });

  // Drawer close
  document.getElementById('drawerClose').addEventListener('click', closeDrawer);
  document.getElementById('drawerOverlay').addEventListener('click', closeDrawer);

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeDrawer();
      closeModal();
    }
  });
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initEvents();
  loadOrders();
});
