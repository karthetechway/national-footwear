// ============================================================
//  NATIONAL FOOTWEAR — Admin Portal Logic
//  Firebase Authentication + Firestore Integration
// ============================================================

// ===== SECURITY: HTML SANITIZER =====
// ===== SECURITY: HTML SANITIZER =====
function sanitize(str) {
  if (typeof str !== 'string' && typeof str !== 'number') return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\//g, '&#47;');
}
function safeText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val || '';
}

// ===== SESSION TIMEOUT (30 minutes) =====
let sessionSeconds = 30 * 60;
let sessionTimerInterval = null;
function startSessionTimer() {
  clearInterval(sessionTimerInterval);
  sessionSeconds = 30 * 60;
  updateSessionDisplay();
  sessionTimerInterval = setInterval(() => {
    sessionSeconds--;
    updateSessionDisplay();
    if (sessionSeconds <= 0) { clearInterval(sessionTimerInterval); handleLogout(); }
  }, 1000);
}
function resetSessionTimer() { sessionSeconds = 30 * 60; }
document.addEventListener('mousemove', resetSessionTimer);
document.addEventListener('keydown', resetSessionTimer);
function updateSessionDisplay() {
  const m = Math.floor(sessionSeconds / 60).toString().padStart(2,'0');
  const s = (sessionSeconds % 60).toString().padStart(2,'0');
  safeText('sessionTime', `${m}:${s}`);
  const timerEl = document.getElementById('sessionTimer');
  if (timerEl) timerEl.style.background = sessionSeconds < 300 ? '#FEE2E2' : '#FFF8E1';
}

// ===== FIREBASE INIT =====
let app, auth, db;
function initFirebase() {
  try {
    app = firebase.initializeApp(FIREBASE_CONFIG);
    auth = firebase.auth();
    db = firebase.firestore();
    return true;
  } catch (e) {
    console.warn('Firebase not configured. Running in offline demo mode.');
    return false;
  }
}

let firebaseReady = initFirebase();

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  safeText('loginBrandName', BRAND.name);
  safeText('sidebarBrand', BRAND.shortName || BRAND.name.split(' ')[0]);
  safeText('topbarDate', new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));

  if (firebaseReady) {
    auth.onAuthStateChanged(user => {
      if (user) {
        showDashboard(user);
      } else {
        showLogin();
      }
    });
  } else {
    // Demo mode: check sessionStorage
    const demoSession = sessionStorage.getItem('nf_admin_demo');
    if (demoSession) {
      showDashboard({ email: demoSession, displayName: 'Admin (Demo)' });
    } else {
      showLogin();
    }
  }
});

// ===== LOGIN =====
function showLogin() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('dashboard').style.display = 'none';
}
function showDashboard(user) {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('dashboard').style.display = 'flex';
  const email = user.email || '';
  const name = user.displayName || email.split('@')[0] || 'Admin';
  safeText('adminName', name);
  safeText('adminEmailDisplay', email);
  safeText('adminAvatar', name.charAt(0).toUpperCase());
  startSessionTimer();
  loadDashboardData();
}

async function handleLogin() {
  const email = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPassword').value;
  const errorEl = document.getElementById('loginError');
  const btn = document.getElementById('loginBtn');

  if (!email || !password) {
    showLoginError('Please enter your email and password.');
    return;
  }

  btn.disabled = true;
  safeText('loginBtnText', 'Signing in...');
  errorEl.style.display = 'none';

  if (firebaseReady) {
    try {
      await auth.signInWithEmailAndPassword(email, password);
      // onAuthStateChanged will fire and call showDashboard
    } catch (err) {
      let msg = 'Login failed. Please try again.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') msg = 'Invalid email or password.';
      else if (err.code === 'auth/too-many-requests') msg = 'Too many attempts. Please wait and try again.';
      else if (err.code === 'auth/network-request-failed') msg = 'Network error. Check your internet connection.';
      showLoginError(msg);
    }
  } else {
    // Demo mode fallback
    if (email.includes('@') && password.length >= 6) {
      sessionStorage.setItem('nf_admin_demo', email);
      showDashboard({ email, displayName: email.split('@')[0] });
    } else {
      showLoginError('Firebase not configured. In demo mode, use any valid email and 6+ char password.');
    }
  }
  btn.disabled = false;
  safeText('loginBtnText', 'Sign In');
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.getElementById('loginScreen').style.display !== 'none') handleLogin();
});

function showLoginError(msg) {
  const el = document.getElementById('loginError');
  el.textContent = msg;
  el.style.display = 'block';
}
function togglePasswordVisibility() {
  const inp = document.getElementById('adminPassword');
  inp.type = inp.type === 'password' ? 'text' : 'password';
}
async function handleLogout() {
  clearInterval(sessionTimerInterval);
  if (firebaseReady) {
    try { await auth.signOut(); } catch {}
  }
  sessionStorage.removeItem('nf_admin_demo');
  showLogin();
  showAdminToast('Logged out successfully');
}

// ===== TAB SWITCHING =====
function switchTab(tab) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`tab${cap(tab)}`).classList.add('active');
  document.getElementById(`nav${cap(tab)}`).classList.add('active');
  safeText('pageTitle', { overview: 'Overview', products: 'Products', orders: 'All Orders', wholesale: 'Wholesale Orders', reports: 'Reports' }[tab]);

  if (tab === 'overview') loadDashboardData();
  if (tab === 'products') renderProductsTable();
  if (tab === 'orders') renderOrdersTable();
  if (tab === 'wholesale') renderWholesaleTable();
  if (tab === 'reports') renderReports();
}
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const main = document.querySelector('.main-content');
  if (window.innerWidth <= 768) {
    sidebar.classList.toggle('mobile-open');
  } else {
    sidebar.classList.toggle('collapsed');
    main.classList.toggle('expanded');
  }
}

// ===== DATA HELPERS =====
function getLocalOrders() {
  try { return JSON.parse(localStorage.getItem('nf_orders')) || []; } catch { return []; }
}
function getLocalProducts() {
  // Start with PRODUCTS_DB, overlay any admin-added products
  try {
    const added = JSON.parse(localStorage.getItem('nf_admin_products')) || [];
    return [...PRODUCTS_DB, ...added];
  } catch { return [...PRODUCTS_DB]; }
}
function saveAdminProducts(products) {
  // Only save the non-PRODUCTS_DB ones
  const dbIds = PRODUCTS_DB.map(p => p.id);
  const extra = products.filter(p => !dbIds.includes(p.id));
  localStorage.setItem('nf_admin_products', JSON.stringify(extra));
}
function updateOrderStatus(orderId, newStatus) {
  const orders = getLocalOrders();
  const idx = orders.findIndex(o => o.orderId === orderId);
  if (idx !== -1) { orders[idx].status = newStatus; localStorage.setItem('nf_orders', JSON.stringify(orders)); }
}

// ===== LOAD DASHBOARD DATA =====
function loadDashboardData() {
  const orders = getLocalOrders();
  const products = getLocalProducts();
  const total = orders.length;
  const revenue = orders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const pending = orders.filter(o => o.status === 'pending').length;
  const wsOrders = orders.filter(o => o.type === 'wholesale').length;
  const rtOrders = orders.filter(o => o.type === 'retail').length;

  safeText('statTotalOrders', total);
  safeText('statRevenue', `₹${revenue.toLocaleString()}`);
  safeText('statPending', pending);
  safeText('statProducts', products.length);
  safeText('statWholesaleOrders', wsOrders);
  safeText('statRetailOrders', rtOrders);

  const badge = document.getElementById('pendingOrdersBadge');
  if (badge) { badge.textContent = pending; badge.className = 'nav-badge' + (pending > 0 ? ' show' : ''); }

  renderRecentOrders(orders.slice(0, 5));
  renderTopProducts(orders);
}

function renderRecentOrders(orders) {
  const el = document.getElementById('recentOrdersList');
  if (!el) return;
  if (!orders.length) { el.innerHTML = '<div class="empty-state">No orders yet.</div>'; return; }
  el.innerHTML = `<table class="data-table">
    <thead><tr><th>Order ID</th><th>Type</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
    <tbody>${orders.map(o => `
    <tr>
      <td><span class="sku-badge">${sanitize(o.orderId)}</span></td>
      <td><span class="type-${sanitize(o.type || 'retail')}">${(o.type || 'retail').toUpperCase()}</span></td>
      <td>${sanitize(o.customer?.name || '—')}</td>
      <td><strong>₹${(o.grandTotal || 0).toLocaleString()}</strong></td>
      <td><span class="status-badge status-${sanitize(o.status || 'pending')}">${sanitize(o.status || 'pending')}</span></td>
    </tr>`).join('')}</tbody>
  </table>`;
}

function renderTopProducts(orders) {
  const el = document.getElementById('topProductsList');
  if (!el) return;
  const skuCount = {};
  orders.forEach(o => (o.items || []).forEach(item => {
    skuCount[item.sku] = (skuCount[item.sku] || 0) + item.qty;
  }));
  const sorted = Object.entries(skuCount).sort((a,b) => b[1] - a[1]).slice(0, 6);
  if (!sorted.length) { el.innerHTML = '<div class="empty-state">No sales data yet.</div>'; return; }
  const max = sorted[0][1];
  el.innerHTML = sorted.map(([sku, count]) => `
    <div class="bar-wrap">
      <div class="bar-label"><span class="sku-badge">${sanitize(sku)}</span><span>${count} pairs sold</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${(count/max*100).toFixed(1)}%;background:var(--accent)"></div></div>
    </div>
  `).join('');
}

// ===== PRODUCTS TABLE =====
let adminProducts = [];
function renderProductsTable(filter = '') {
  adminProducts = getLocalProducts();
  const q = filter.toLowerCase();
  const filtered = q
    ? adminProducts.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
      )
    : adminProducts;
  const tbody = document.getElementById('productsTableBody');
  if (!tbody) return;
  tbody.innerHTML = filtered.map(p => {
    const sId = sanitize(p.id);
    const sSku = sanitize(p.sku);
    const sName = sanitize(p.name);
    const sBrand = sanitize(p.brand);
    const sType = sanitize(p.type);
    const sCat = sanitize(p.category);
    
    return `
      <tr>
        <td><span class="sku-badge">${sSku}</span></td>
        <td><strong>${sName}</strong><br><small style="color:var(--text3)">${sType}</small></td>
        <td>${sBrand}</td>
        <td><span class="type-${sCat}">${sCat}</span></td>
        <td><strong>₹${p.price.toLocaleString()}</strong></td>
        <td>₹${(p.wholesalePrice || 0).toLocaleString()}</td>
        <td>${p.moq || '—'}</td>
        <td>
          <button class="btn-stock-toggle ${p.inStock ? 'in-stock-yes' : 'in-stock-no'}"
            onclick="toggleStock('${sId}')"
            style="background:${p.inStock ? '#DCFCE7' : '#FEE2E2'}">
            ${p.inStock ? '✅ In Stock' : '❌ Out of Stock'}
          </button>
        </td>
        <td>
          <div class="td-actions">
            <button class="btn-edit" onclick="openEditProductModal('${sId}')" title="Edit">✏️</button>
            <button class="btn-delete" onclick="handleDeleteProduct('${sId}')" title="Delete">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}
function filterAdminProducts() {
  const q = document.getElementById('productSearch')?.value || '';
  renderProductsTable(q);
}
function toggleStock(id) {
  const all = getLocalProducts();
  const p = all.find(x => x.id === id);
  if (!p) return;
  p.inStock = !p.inStock;
  // Update PRODUCTS_DB in-place if it's there
  const dbP = PRODUCTS_DB.find(x => x.id === id);
  if (dbP) dbP.inStock = p.inStock;
  saveAdminProducts(all);
  renderProductsTable();
  showAdminToast(`${p.name} marked as ${p.inStock ? 'In Stock' : 'Out of Stock'}`);
}
function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  // Only delete from admin-added list (cannot delete PRODUCTS_DB items without JS edit)
  const adminAdded = JSON.parse(localStorage.getItem('nf_admin_products') || '[]');
  const idx = adminAdded.findIndex(p => p.id === id);
  if (idx !== -1) {
    adminAdded.splice(idx, 1);
    localStorage.setItem('nf_admin_products', JSON.stringify(adminAdded));
    renderProductsTable();
    showAdminToast('Product deleted');
  } else {
    showAdminToast('Built-in products can only be edited, not deleted from the admin panel. Edit products.js to remove them.', true);
  }
}

// ===== ADD / EDIT PRODUCT =====
let editingProductId = null;
function openAddProductModal() {
  editingProductId = null;
  safeText('productFormTitle', 'Add New Product');
  clearProductForm();
  document.getElementById('productFormModal').style.display = 'flex';
}
function editProduct(id) {
  const p = getLocalProducts().find(x => x.id === id);
  if (!p) return;
  editingProductId = id;
  safeText('productFormTitle', `Edit — ${p.name}`);
  document.getElementById('pSku').value = p.sku || '';
  document.getElementById('pBrand').value = p.brand || '';
  document.getElementById('pName').value = p.name || '';
  document.getElementById('pCategory').value = p.category || 'men';
  document.getElementById('pType').value = p.type || '';
  document.getElementById('pPrice').value = p.price || '';
  document.getElementById('pOrigPrice').value = p.originalPrice || '';
  document.getElementById('pWsPrice').value = p.wholesalePrice || '';
  document.getElementById('pMoq').value = p.moq || '';
  document.getElementById('pSizes').value = (p.sizes || []).join(',');
  document.getElementById('pUnavail').value = (p.unavailableSizes || []).join(',');
  document.getElementById('pBadge').value = p.badge || '';
  document.getElementById('pInStock').value = String(p.inStock !== false);
  document.getElementById('pImg1').value = p.colors?.[0]?.images?.[0] || '';
  document.getElementById('pFeatures').value = (p.features || []).join(',');
  document.getElementById('pDesc').value = p.description || '';
  document.getElementById('productFormModal').style.display = 'flex';
}
function clearProductForm() {
  ['pSku','pBrand','pName','pType','pPrice','pOrigPrice','pWsPrice','pMoq',
   'pSizes','pUnavail','pImg1','pFeatures','pDesc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const cat = document.getElementById('pCategory'); if (cat) cat.value = 'men';
  const badge = document.getElementById('pBadge'); if (badge) badge.value = '';
  const stock = document.getElementById('pInStock'); if (stock) stock.value = 'true';
}
function saveProduct() {
  const sku = document.getElementById('pSku').value.trim();
  const name = document.getElementById('pName').value.trim();
  const brand = document.getElementById('pBrand').value.trim();
  const price = parseFloat(document.getElementById('pPrice').value);
  const origPrice = parseFloat(document.getElementById('pOrigPrice').value);
  const wsPrice = parseFloat(document.getElementById('pWsPrice').value);
  const moq = parseInt(document.getElementById('pMoq').value) || 6;

  if (!sku || !name || !brand || !price || !origPrice) {
    showAdminToast('Please fill all required fields (SKU, Name, Brand, Prices)', true);
    return;
  }

  const sizesRaw = document.getElementById('pSizes').value.split(',').map(s => s.trim()).filter(Boolean);
  const sizes = sizesRaw.map(s => isNaN(Number(s)) ? s : Number(s));
  const unavailRaw = document.getElementById('pUnavail').value.split(',').map(s => s.trim()).filter(Boolean);
  const unavailableSizes = unavailRaw.map(s => isNaN(Number(s)) ? s : Number(s));
  const badge = document.getElementById('pBadge').value;
  const badgeLabels = { bestseller: 'Best Seller', new: 'New Arrival', sale: 'Sale' };
  const imgUrl = document.getElementById('pImg1').value.trim() || 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&q=80';
  const features = document.getElementById('pFeatures').value.split(',').map(f => f.trim()).filter(Boolean);
  const description = document.getElementById('pDesc').value.trim();
  const inStock = document.getElementById('pInStock').value === 'true';
  const discount = Math.round(((origPrice - price) / origPrice) * 100);
  const cat = document.getElementById('pCategory').value;

  const product = {
    id: editingProductId || `P${Date.now()}`,
    sku, brand, name, category: cat,
    type: document.getElementById('pType').value.trim(),
    price, originalPrice: origPrice, wholesalePrice: wsPrice || Math.round(price * 0.75),
    discount, moq, rating: 4.5, reviewCount: 0,
    badge: badge || null, badgeLabel: badgeLabels[badge] || null,
    colors: [{ name: 'Default', hex: '#C4956A', images: [imgUrl, imgUrl, imgUrl] }],
    sizes, unavailableSizes,
    description, features, inStock
  };

  const adminAdded = JSON.parse(localStorage.getItem('nf_admin_products') || '[]');
  if (editingProductId) {
    const dbIdx = PRODUCTS_DB.findIndex(p => p.id === editingProductId);
    if (dbIdx !== -1) {
      Object.assign(PRODUCTS_DB[dbIdx], product);
    } else {
      const aIdx = adminAdded.findIndex(p => p.id === editingProductId);
      if (aIdx !== -1) adminAdded[aIdx] = product;
    }
  } else {
    adminAdded.push(product);
    // Also push to PRODUCTS_DB for current session
    PRODUCTS_DB.push(product);
  }
  localStorage.setItem('nf_admin_products', JSON.stringify(adminAdded));
  closeProductModal();
  renderProductsTable();
  showAdminToast(editingProductId ? 'Product updated!' : 'New product added!');
}
function closeProductModal() {
  document.getElementById('productFormModal').style.display = 'none';
}

// ===== ORDERS TABLE =====
let allOrders = [];
function renderOrdersTable() {
  allOrders = getLocalOrders().filter(o => true); // all orders
  applyOrderFilters();
}
function filterAdminOrders() { applyOrderFilters(); }
function applyOrderFilters() {
  const q = (document.getElementById('orderSearch')?.value || '').toLowerCase();
  const status = document.getElementById('orderStatusFilter')?.value || 'all';
  const type = document.getElementById('orderTypeFilter')?.value || 'all';
  let filtered = allOrders;
  if (q) filtered = filtered.filter(o =>
    o.orderId?.toLowerCase().includes(q) ||
    o.customer?.name?.toLowerCase().includes(q) ||
    o.customer?.phone?.includes(q)
  );
  if (status !== 'all') filtered = filtered.filter(o => o.status === status);
  if (type !== 'all') filtered = filtered.filter(o => o.type === type);
  populateOrdersTable(filtered, 'ordersTableBody', 'ordersEmpty', false);
}
function renderWholesaleTable() {
  const wsOrders = getLocalOrders().filter(o => o.type === 'wholesale');
  populateOrdersTable(wsOrders, 'wholesaleTableBody', 'wholesaleEmpty', true);
}
function populateOrdersTable(orders, tbodyId, emptyId, isWholesaleTable) {
  const tbody = document.getElementById(tbodyId);
  const emptyEl = document.getElementById(emptyId);
  if (!tbody) return;
  if (!orders.length) {
    tbody.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';
  tbody.innerHTML = orders.map(o => {
    const items = (o.items || []).map(i => `${i.sku} ×${i.qty}`).join(', ');
    const date = o.placedAt ? new Date(o.placedAt).toLocaleDateString('en-IN') : '—';
    if (isWholesaleTable) return `
      <tr>
        <td><span class="sku-badge">${sanitize(o.orderId)}</span></td>
        <td>${sanitize(o.customer?.business || '—')}</td>
        <td>${sanitize(o.customer?.name || '—')}</td>
        <td><code>${sanitize(o.customer?.gst || '—')}</code></td>
        <td style="font-size:0.78rem">${sanitize(items)}</td>
        <td><strong>₹${(o.grandTotal || 0).toLocaleString()}</strong></td>
        <td><span class="status-badge status-${sanitize(o.status || 'pending')}">${sanitize(o.status || 'pending')}</span></td>
        <td>${date}</td>
        <td><button class="btn-view" onclick="viewOrder('${sanitize(o.orderId)}')">View</button></td>
      </tr>`;
    return `
      <tr>
        <td><span class="sku-badge">${sanitize(o.orderId)}</span></td>
        <td><span class="type-${sanitize(o.type || 'retail')}">${(o.type||'retail').toUpperCase()}</span></td>
        <td>${sanitize(o.customer?.name || '—')}</td>
        <td>${sanitize(o.customer?.phone || '—')}</td>
        <td style="font-size:0.78rem;max-width:180px">${sanitize(items)}</td>
        <td><strong>₹${(o.grandTotal || 0).toLocaleString()}</strong></td>
        <td><span style="text-transform:uppercase;font-size:0.78rem;font-weight:700">${sanitize(o.payment || '—')}</span></td>
        <td><span class="status-badge status-${sanitize(o.status || 'pending')}">${sanitize(o.status || 'pending')}</span></td>
        <td>${date}</td>
        <td><button class="btn-view" onclick="viewOrder('${sanitize(o.orderId)}')">View</button></td>
      </tr>`;
  }).join('');
}

// ===== ORDER DETAIL =====
function viewOrder(orderId) {
  const order = getLocalOrders().find(o => o.orderId === orderId);
  if (!order) return;
  const modal = document.getElementById('orderDetailModal');
  safeText('orderDetailTitle', `Order — ${order.orderId}`);
  const c = order.customer || {};
  document.getElementById('orderDetailBody').innerHTML = `
    <div class="order-detail-section">
      <h4>Customer Information</h4>
      <div class="order-detail-grid">
        <div class="order-detail-item"><label>Name</label><span>${sanitize(c.name || '—')}</span></div>
        <div class="order-detail-item"><label>Phone</label><span>${sanitize(c.phone || '—')} <a href="https://wa.me/91${sanitize(c.phone)}?text=Hello ${sanitize(c.name)}, this is from National Footwear regarding your order ${sanitize(order.orderId)}" target="_blank" style="margin-left:8px;text-decoration:none">💬 WhatsApp</a></span></div>
        <div class="order-detail-item"><label>Email</label><span>${sanitize(c.email || '—')}</span></div>
        <div class="order-detail-item"><label>Order Type</label><span class="type-${sanitize(order.type || 'retail')}">${(order.type||'retail').toUpperCase()}</span></div>
        <div class="order-detail-item" style="grid-column:1/-1"><label>Address</label><span>${sanitize(c.address || '')} ${sanitize(c.city || '')} ${sanitize(c.state || '')} — ${sanitize(c.pin || '')}</span></div>
        ${order.type === 'wholesale' ? `<div class="order-detail-item"><label>Business Name</label><span>${sanitize(c.business || '—')}</span></div><div class="order-detail-item"><label>GST</label><span>${sanitize(c.gst || '—')}</span></div>` : ''}
      </div>
    </div>
    <div class="order-detail-section">
      <h4>Items Ordered</h4>
      <div class="order-items-list">
        ${(order.items || []).map(item => `
          <div class="order-item-row">
            <div><span class="sku-badge">${sanitize(item.sku)}</span> ${sanitize(item.name)} — Size ${item.size} · ${sanitize(item.color)}</div>
            <div>×${item.qty} = <strong>₹${(item.total || 0).toLocaleString()}</strong></div>
          </div>
        `).join('')}
        <div class="order-total-row">
          <span>Grand Total</span>
          <span>₹${(order.grandTotal || 0).toLocaleString()}</span>
        </div>
      </div>
    </div>
    <div class="order-detail-section">
      <div class="order-detail-grid">
        <div class="order-detail-item"><label>Payment Method</label><span style="text-transform:uppercase;font-weight:700">${sanitize(order.payment || '—')}</span></div>
        <div class="order-detail-item"><label>Order Date</label><span>${order.placedAt ? new Date(order.placedAt).toLocaleString('en-IN') : '—'}</span></div>
      </div>
    </div>
    <div class="status-update-bar">
      <label style="font-weight:700;font-size:0.85rem;flex-shrink:0">Update Status:</label>
      <select id="statusUpdateSelect">
        ${['pending','confirmed','shipped','delivered','cancelled'].map(s =>
          `<option value="${s}" ${order.status === s ? 'selected' : ''}>${s.charAt(0).toUpperCase() + s.slice(1)}</option>`
        ).join('')}
      </select>
      <button onclick="updateStatus('${sanitize(order.orderId)}')">Update</button>
    </div>
  `;
  modal.style.display = 'flex';
}
function closeOrderDetailModal() {
  document.getElementById('orderDetailModal').style.display = 'none';
}
function updateStatus(orderId) {
  const newStatus = document.getElementById('statusUpdateSelect').value;
  updateOrderStatus(orderId, newStatus);
  closeOrderDetailModal();
  renderOrdersTable();
  renderWholesaleTable();
  loadDashboardData();
  showAdminToast(`Order ${orderId} updated to "${newStatus}"`);
}

// ===== EXPORT CSV =====
function exportOrdersCSV() {
  const orders = getLocalOrders();
  if (!orders.length) { showAdminToast('No orders to export', true); return; }
  const rows = [['Order ID','Type','Customer','Phone','Email','City','State','PIN','Amount','Payment','Status','Date']];
  orders.forEach(o => {
    const c = o.customer || {};
    rows.push([o.orderId, o.type, c.name, c.phone, c.email, c.city, c.state, c.pin, o.grandTotal, o.payment, o.status, o.placedAt]);
  });
  downloadCSV(rows, 'National_Footwear_Orders.csv');
}
function exportSKUReport() {
  const orders = getLocalOrders();
  const skuData = {};
  orders.forEach(o => (o.items || []).forEach(item => {
    if (!skuData[item.sku]) skuData[item.sku] = { sku: item.sku, name: item.name, brand: item.brand, qty: 0, revenue: 0 };
    skuData[item.sku].qty += item.qty;
    skuData[item.sku].revenue += item.total || 0;
  }));
  const rows = [['SKU','Product Name','Brand','Total Qty Sold','Total Revenue']];
  Object.values(skuData).sort((a,b) => b.qty - a.qty).forEach(r => rows.push([r.sku, r.name, r.brand, r.qty, r.revenue]));
  downloadCSV(rows, 'National_Footwear_SKU_Report.csv');
}
function downloadCSV(rows, filename) {
  const csv = rows.map(r => r.map(cel => `"${String(cel || '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  showAdminToast('Export downloaded!');
}

// ===== REPORTS =====
function renderReports() {
  const orders = getLocalOrders();
  const products = getLocalProducts();
  const totalRev = orders.reduce((s, o) => s + (o.grandTotal || 0), 0);
  const wsRev = orders.filter(o => o.type === 'wholesale').reduce((s, o) => s + (o.grandTotal || 0), 0);
  const rtRev = orders.filter(o => o.type === 'retail').reduce((s, o) => s + (o.grandTotal || 0), 0);
  document.getElementById('revenueBreakdown').innerHTML = `
    <div class="revenue-row"><span class="label">Total Revenue</span><span class="val">₹${totalRev.toLocaleString()}</span></div>
    <div class="revenue-row"><span class="label">Retail Revenue</span><span class="val" style="color:var(--blue)">₹${rtRev.toLocaleString()}</span></div>
    <div class="revenue-row"><span class="label">Wholesale Revenue</span><span class="val" style="color:var(--green)">₹${wsRev.toLocaleString()}</span></div>
    <div class="revenue-row"><span class="label">Total Orders</span><span class="val">${orders.length}</span></div>
    <div class="revenue-row"><span class="label">Avg Order Value</span><span class="val">₹${orders.length ? Math.round(totalRev/orders.length).toLocaleString() : 0}</span></div>
    <div class="revenue-row"><span class="label">Total Products</span><span class="val">${products.length}</span></div>
  `;
  const catCount = { men: 0, women: 0, kids: 0 };
  orders.forEach(o => (o.items || []).forEach(item => {
    const p = products.find(x => x.sku === item.sku);
    if (p) catCount[p.category] = (catCount[p.category] || 0) + item.qty;
  }));
  const maxCat = Math.max(...Object.values(catCount), 1);
  const catColors = { men: 'var(--blue)', women: '#EC4899', kids: 'var(--amber)' };
  document.getElementById('categoryBreakdown').innerHTML = Object.entries(catCount).map(([cat, cnt]) => `
    <div class="bar-wrap">
      <div class="bar-label"><span style="font-weight:700;text-transform:capitalize">${cat}</span><span>${cnt} pairs</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${(cnt/maxCat*100).toFixed(1)}%;background:${catColors[cat]}"></div></div>
    </div>
  `).join('');

  const skuData = {};
  orders.forEach(o => (o.items || []).forEach(item => {
    if (!skuData[item.sku]) skuData[item.sku] = { sku: item.sku, name: item.name, qty: 0, revenue: 0 };
    skuData[item.sku].qty += item.qty;
    skuData[item.sku].revenue += item.total || 0;
  }));
  const skuSorted = Object.values(skuData).sort((a,b) => b.revenue - a.revenue);
  document.getElementById('skuReport').innerHTML = skuSorted.length
    ? skuSorted.map(r => `
      <div class="sku-row">
        <span class="sku-badge">${sanitize(r.sku)}</span>
        <span style="flex:1;padding:0 12px;font-size:0.85rem">${sanitize(r.name)}</span>
        <span style="color:var(--text2);font-size:0.82rem">${r.qty} pairs</span>
        <span style="font-weight:800;color:var(--text);margin-left:12px">₹${r.revenue.toLocaleString()}</span>
      </div>`).join('')
    : '<div class="empty-state">No SKU sales data yet.</div>';
}

// ===== TOAST =====
function showAdminToast(msg, isError = false) {
  const t = document.getElementById('adminToast');
  t.textContent = msg;
  t.style.background = isError ? '#DC2626' : '#0D1B2A';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
}
