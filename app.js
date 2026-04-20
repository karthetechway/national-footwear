// ============================================================
//  NATIONAL FOOTWEAR — Main App Logic
//  Security: Input sanitization, XSS prevention, validation
// ============================================================

// ===== SECURITY: HTML SANITIZER =====
function sanitize(str) {
  if (typeof str !== 'string' && typeof str !== 'number') return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ===== CLOUD IMAGE RESOLVER =====
function resolveImagePath(path) {
  if (!path) return '';
  // If it's already a full URL (Firebase/Cloud), return as is
  if (path.startsWith('http')) return path;
  
  // Normalize Windows backslashes to Web forward slashes
  let cleanPath = path.replace(/\\/g, '/');
  
  // Ensure the path matches the 'Images' (Capital I) structure if that's how it was uploaded
  if (cleanPath.toLowerCase().startsWith('images/')) {
    cleanPath = 'Images' + cleanPath.substring(6);
  }

  // Convert to Firebase Storage URL
  // Format: https://firebasestorage.googleapis.com/v0/b/[BUCKET]/o/[PATH]?alt=media
  const bucket = FIREBASE_CONFIG.storageBucket;
  const encodedPath = encodeURIComponent(cleanPath);
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media`;
}

function escapeJS(str) {
  if (typeof str !== 'string') return '';
  return String(str).replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// ===== APP STATE =====
let cart = [];
let wishlist = [];
let currentFilter = 'all';
let currentBrandFilter = 'all';
let currentProduct = null;
let selectedColor = 0;
let selectedSize = null;
let qty = 1;
let selectedPayment = 'upi';
let orderNumber = null;
let isWholesaleMode = false;

// ===== SAFE LOCALSTORAGE =====
function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed;
  } catch { return fallback; }
}
function saveToStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ===== DATA HELPERS =====
function getActiveProducts() {
  // Merges PRODUCTS_DB with any admin-added/modified products in localStorage
  try {
    const adminAdded = JSON.parse(localStorage.getItem('nf_admin_products')) || [];
    // If a product exists in both, admin version wins (allows editing)
    const adminIds = adminAdded.map(p => p.id);
    const base = PRODUCTS_DB.filter(p => !adminIds.includes(p.id));
    return [...base, ...adminAdded];
  } catch { return [...PRODUCTS_DB]; }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  cart = loadFromStorage('nf_cart', []);
  wishlist = loadFromStorage('nf_wishlist', []);
  isWholesaleMode = sessionStorage.getItem('nf_wholesale') === 'true';

  const products = getActiveProducts();
  applyBrandConfig();
  renderBrandBanner();
  renderBrandFilterPills();
  populateBrandFilter();
  renderProducts(products);
  updateCartUI();
  updateWishlistUI();
  setupHeader();
  setupCardNumberFormatter();
  setupSearch();
  setupKeyListeners();

  if (isWholesaleMode) activateWholesaleUI();
  document.getElementById('codPanel').style.display = 'none';
});

// ===== APPLY BRAND CONFIG =====
function applyBrandConfig() {
  document.title = `${BRAND.name} — ${BRAND.subTagline}`;
  safeSetText('logoText', BRAND.name);
  safeSetText('logoSub', 'Multi-Brand Footwear Store');
  safeSetText('footerTagline', 'Multi-Brand Footwear Store');
  safeSetText('footerDesc', `India's leading multi-brand footwear store. Providing premium quality and unmatched comfort since 1995.`);
  safeSetText('heroTitle', null); // Handled by HTML
  safeSetText('footerEmail', BRAND.email);
  safeSetText('footerPhone', BRAND.phone);
  safeSetText('footerAddress', BRAND.address);
  safeSetText('footerGST', `GST: ${BRAND.gst}`);
  const footerCopyrightEl = document.getElementById('footerCopyright');
  if (footerCopyrightEl) {
    footerCopyrightEl.textContent = `© ${new Date().getFullYear()} ${BRAND.name}`;
  }
  safeSetText('offerCode', BRAND.name.replace(/\s+/g,'').toUpperCase().slice(0,8) + '15');

  // Wholesale button label
  if (isWholesaleMode) safeSetText('wholesaleNavLabel', '🏭 Wholesale Active');
}
function safeSetText(id, val) {
  const el = document.getElementById(id);
  if (el && val) el.textContent = val;
}

// ===== HEADER SCROLL =====
function setupHeader() {
  const header = document.getElementById('header');
  const hamburger = document.getElementById('hamburger');
  window.addEventListener('scroll', () => {
    // Premium transition: adds/removes .scrolled class for the Glassmorphism upgrade
    header.classList.toggle('scrolled', window.scrollY > 20);
  });
  hamburger.addEventListener('click', () => {
    const nav = document.getElementById('mobileNav');
    nav.classList.toggle('open');
    // Premium: Lock body scroll when menu is open
    document.body.classList.toggle('no-scroll', nav.classList.contains('open'));
  });
}
function closeMobileNav() {
  document.getElementById('mobileNav').classList.remove('open');
  document.body.classList.remove('no-scroll');
}

// ===== BRAND BANNER =====
function renderBrandBanner() {
  const track = document.getElementById('brandsTrack');
  if (!track) return;
  // Double the brands for seamless infinite loop
  const allBrands = [...FEATURED_BRANDS, ...FEATURED_BRANDS];
  track.innerHTML = allBrands.map(b => `
    <div class="brand-logo-card" onclick="filterByBrand('${sanitize(b.name)}')" title="Shop ${sanitize(b.name)}">
      <img src="${resolveImagePath(b.logo)}" alt="${sanitize(b.name)}" class="brand-logo-img">
    </div>
  `).join('');
}

function renderBrandFilterPills() {
  const pills = document.getElementById('brandFilterPills');
  if (!pills) return;
  pills.innerHTML = `<button class="brand-pill active" id="pill_all" onclick="filterByBrand('all')">All Brands</button>` +
    FEATURED_BRANDS.map(b => `
      <button class="brand-pill" id="pill_${sanitize(b.abbr)}" onclick="filterByBrand('${sanitize(b.name)}')">${sanitize(b.name)}</button>
    `).join('');
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const headerOffset = document.getElementById('header').offsetHeight;
  const elementPosition = el.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth"
  });
}

function filterByBrand(brandName) {
  currentBrandFilter = brandName === 'all' ? 'all' : brandName;
  document.querySelectorAll('.brand-pill').forEach(p => p.classList.remove('active'));
  const pillId = brandName === 'all' ? 'pill_all' : `pill_${FEATURED_BRANDS.find(b=>b.name===brandName)?.abbr}`;
  const activePill = document.getElementById(pillId);
  if (activePill) activePill.classList.add('active');

  // Sync to dropdown
  syncFilters('brand', brandName);
  scrollToSection('products');
}

function populateBrandFilter() {
  const sel = document.getElementById('brandFilter');
  const mobSel = document.getElementById('mobileBrandFilter');
  if (!sel) return;
  const brands = [...new Set(PRODUCTS_DB.map(p => p.brand))].sort();
  const optionsHtml = `<option value="all">All Brands</option>` +
    brands.map(b => `<option value="${sanitize(b)}">${sanitize(b)}</option>`).join('');
  
  sel.innerHTML = optionsHtml;
  if (mobSel) mobSel.innerHTML = optionsHtml;
}

// ===== RENDER PRODUCTS =====
function renderProducts(products) {
  const grid = document.getElementById('productsGrid');
  if (!products.length) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text2)">No products found. Try a different filter.</div>';
    return;
  }
  grid.innerHTML = products.map(p => {
    // Intelligent Thumbnail Selection: Prioritize Right View (appealing side profile)
    const allImgs = p.colors[0].images;
    const preferred = allImgs.find(img => img.includes('right.jpg')) || 
                        allImgs.find(img => img.includes('side.jpg')) || 
                        allImgs.find(img => img.includes('left.jpg')) || 
                        allImgs[0];
    const mainImg = preferred;
    const isWished = wishlist.includes(p.id);
    const stars = renderStars(p.rating);
    const sizesPreview = p.sizes.slice(0, 4).map(s => `<span class="size-chip">${s}</span>`).join('');
    const moreFlag = p.sizes.length > 4 ? `<span class="size-chip">+${p.sizes.length - 4}</span>` : '';
    const badgeHtml = p.badge ? `<div class="product-badge ${sanitize(p.badge)}">${sanitize(p.badgeLabel)}</div>` : '';
    const displayPrice = isWholesaleMode ? p.wholesalePrice : p.price;
    const wholesalePriceTag = isWholesaleMode
      ? `<span class="price-wholesale">WS: ₹${p.wholesalePrice.toLocaleString()}</span>`
      : '';
    const moqBadge = isWholesaleMode
      ? `<div class="moq-badge">MOQ: ${p.moq} pairs</div>`
      : '';

    return `
    <div class="product-card" onclick="openProductModal('${sanitize(p.id)}')">
      <div class="product-img-wrap">
        <img src="${resolveImagePath(mainImg)}" alt="${sanitize(p.name)}" loading="lazy">
        ${badgeHtml}
        <div class="product-brand-tag">${sanitize(p.brand)}</div>
        <button class="wishlist-btn ${isWished ? 'active' : ''}"
          onclick="toggleWishlist(event,'${sanitize(p.id)}')" title="Wishlist">
          ${isWished ? '❤️' : '🤍'}
        </button>
      </div>
      <div class="product-info">
        <div class="product-sku">${sanitize(p.sku)}</div>
        <div class="product-category">${sanitize(p.type)}</div>
        <div class="product-name">${sanitize(p.name)}</div>
        <div class="product-rating">
          <span class="stars">${stars}</span>
          <span class="rating-count">(${p.reviewCount.toLocaleString()})</span>
        </div>
        <div class="product-sizes">${sizesPreview}${moreFlag}</div>
        <div class="product-footer">
          <div class="product-price">
            <span class="price-current">₹${displayPrice.toLocaleString()}</span>
            <span class="price-original">₹${p.originalPrice.toLocaleString()}</span>
            <span class="price-discount">${p.discount}% OFF</span>
            ${wholesalePriceTag}
          </div>
          <button class="add-to-cart" onclick="quickAddToCart(event,'${sanitize(p.id)}')" title="Add to cart">+</button>
        </div>
        ${moqBadge}
      </div>
    </div>`;
  }).join('');
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  
  let html = '<span style="color:#fbbf24">★</span>'.repeat(full);
  if (half) html += '<span class="star-half">★</span>';
  if (empty > 0) html += '<span style="color:#e5e7eb">★</span>'.repeat(empty);
  return html;
}

// ===== FILTER & SORT =====
function filterProducts(category) {
  currentFilter = category;
  applyFiltersAndSort();
}
function sortProducts() { applyFiltersAndSort(); }

function syncFilters(type, value) {
  if (type === 'brand') {
    document.getElementById('brandFilter').value = value;
    document.getElementById('mobileBrandFilter').value = value;
  } else if (type === 'sort') {
    document.getElementById('sortSelect').value = value;
    document.getElementById('mobileSortSelect').value = value;
  }
  applyFiltersAndSort();
}

function applyFiltersAndSort() {
  const products = getActiveProducts();
  let filtered = [...products];

  // Category filter
  if (currentFilter !== 'all') {
    if (currentFilter === 'kids') {
      filtered = filtered.filter(p => p.category === 'boys' || p.category === 'girls' || p.category === 'school');
    } else {
      filtered = filtered.filter(p => p.category === currentFilter);
    }
  }

  // Brand filter
  const brandVal = document.getElementById('brandFilter')?.value || 'all';
  if (brandVal !== 'all') filtered = filtered.filter(p => p.brand === brandVal);

  // Sorting
  const sort = document.getElementById('sortSelect')?.value || 'default';
  if (sort === 'price-low') filtered.sort((a, b) => (isWholesaleMode ? a.wholesalePrice - b.wholesalePrice : a.price - b.price));
  else if (sort === 'price-high') filtered.sort((a, b) => (isWholesaleMode ? b.wholesalePrice - a.wholesalePrice : b.price - a.price));
  else if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);

  renderProducts(filtered);
}

// ===== PRODUCT MODAL =====
function openProductModal(id) {
  const p = PRODUCTS_DB.find(x => x.id === id);
  if (!p) return;
  currentProduct = p;
  selectedColor = 0;
  selectedSize = null;
  qty = 1;
  renderModalImages(p, selectedColor);
  renderModalInfo(p);
  document.getElementById('productModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function renderModalImages(p, colorIdx) {
  const imgs = p.colors[colorIdx].images;
  const thumbsHtml = imgs.length > 1 ? `
    <div class="modal-thumbs">
      ${imgs.map((img, i) => `
        <div class="modal-thumb-item ${i === 0 ? 'active' : ''}"
          onclick="changeModalImg(${i}, this)">
          <img src="${resolveImagePath(img)}" alt="View ${i+1}" class="modal-thumb-img">
        </div>
      `).join('')}
    </div>
  ` : '';

  document.getElementById('modalImages').innerHTML = `
    <div class="modal-img-main-wrap">
      <img src="${resolveImagePath(imgs[0])}" alt="${sanitize(p.name)}"
        class="modal-main-img" id="mainModalImg">
    </div>
    ${thumbsHtml}
  `;
}
function changeModalImg(idx, el) {
  const mainImg = document.getElementById('mainModalImg');
  if (!mainImg || !currentProduct) return;
  
  const imgs = currentProduct.colors[selectedColor].images;
  if (!imgs[idx]) return;

  mainImg.src = resolveImagePath(imgs[idx]); 
  
  document.querySelectorAll('.modal-thumb-item').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
}
function renderModalInfo(p) {
  const colorSwatches = p.colors.map((c, i) => `
    <div class="color-swatch ${i === selectedColor ? 'active' : ''}"
      style="background:${sanitize(c.hex)};"
      onclick="selectColor(${i})" title="${sanitize(c.name)}"></div>
  `).join('');
  const sizeOptions = p.sizes.map(s => {
    const unavailArr = p.unavailableSizes || [];
    const unavail = unavailArr.includes(s);
    return `<div class="size-option ${unavail ? 'unavailable' : ''} ${selectedSize === s ? 'active' : ''}"
      onclick="${unavail ? '' : `selectSize(${s})`}">${s}</div>`;
  }).join('');
  const features = p.features.map(f => `<span class="feature-tag">${sanitize(f)}</span>`).join('');
  const displayPrice = isWholesaleMode ? p.wholesalePrice : p.price;
  const wholesaleRow = isWholesaleMode ? `
    <div class="modal-wholesale-price">🏭 Wholesale: ₹${p.wholesalePrice.toLocaleString()} per pair</div>
    <div class="modal-moq">Minimum Order: ${p.moq} pairs (₹${(p.wholesalePrice * p.moq).toLocaleString()} total)</div>
  ` : '';

  document.getElementById('modalInfo').innerHTML = `
    <div class="modal-category">${sanitize(p.brand.toUpperCase())} · ${sanitize(p.category.toUpperCase())} · ${sanitize(p.type)}</div>
    <div class="modal-sku">${sanitize(p.sku)}</div>
    <div class="modal-name">${sanitize(p.name)}</div>
    <div class="modal-price">
      <span class="modal-price-current">₹${displayPrice.toLocaleString()}</span>
      <span class="modal-price-original">₹${p.originalPrice.toLocaleString()}</span>
      <span class="modal-price-discount">${p.discount}% OFF</span>
    </div>
    ${wholesaleRow}
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px">${features}</div>
    <div class="modal-section">
      <h4>Colour — <span style="color:var(--primary);font-weight:700">${sanitize(p.colors[selectedColor].name)}</span></h4>
      <div class="color-swatches">${colorSwatches}</div>
    </div>
    <div class="modal-section">
      <h4>Size (Indian)</h4>
      <div class="size-guide-note">📏 Indian sizes. <a href="#" style="color:var(--accent-dark)" onclick="showSizeGuide();return false;">View Size Guide</a></div>
      <div class="size-options">${sizeOptions}</div>
    </div>
    <div class="modal-section">
      <h4>Quantity</h4>
      <div class="qty-control">
        <button class="qty-btn" onclick="changeQty(-1)">−</button>
        <span id="qtyDisplay">1</span>
        <button class="qty-btn" onclick="changeQty(1)">+</button>
      </div>
    </div>
    <p class="modal-desc">${sanitize(p.description)}</p>
    <div class="modal-actions">
      <button class="btn-primary" onclick="addToCartFromModal()">🛒 Add to Cart</button>
      <button class="btn-ghost" onclick="buyNow()">Buy Now</button>
    </div>
  `;
}
function selectColor(idx) { selectedColor = idx; renderModalImages(currentProduct, idx); renderModalInfo(currentProduct); }
function selectSize(s) { selectedSize = s; renderModalInfo(currentProduct); }
function changeQty(delta) {
  const minQty = (isWholesaleMode && currentProduct) ? currentProduct.moq : 1;
  const maxQty = 99;
  qty = Math.max(minQty, Math.min(maxQty, qty + delta));
  const el = document.getElementById('qtyDisplay');
  if (el) el.textContent = qty;
}
function closeModal() {
  document.getElementById('productModal').classList.remove('open');
  document.body.style.overflow = '';
  currentProduct = null;
}

// ===== WISHLIST =====
function toggleWishlist(e, id) {
  if (e) e.stopPropagation();
  wishlist = wishlist.includes(id) ? wishlist.filter(x => x !== id) : [...wishlist, id];
  saveToStorage('nf_wishlist', wishlist);
  
  if (wishlist.includes(id)) {
    showToast('Item saved to your Wishlist ❤️');
    updateWishlistIcon(id, true);
  } else {
    showToast('Removed from Wishlist');
    updateWishlistIcon(id, false);
  }
  
  updateWishlistUI();
  applyFiltersAndSort();
  if (document.getElementById('wishlistSidebar').classList.contains('open')) {
    renderWishlistItems();
  }
}

function updateWishlistIcon(id, active) {
  const btns = document.querySelectorAll(`.wishlist-btn[onclick*="${id}"]`);
  btns.forEach(btn => {
    btn.classList.toggle('active', active);
    btn.innerHTML = active ? '❤️' : '🤍';
  });
}
function updateWishlistUI() {
  const el = document.getElementById('wishlistCount');
  if (!el) return;
  el.textContent = wishlist.length;
  el.style.display = wishlist.length ? 'flex' : 'none';
}

function openWishlist() {
  renderWishlistItems();
  document.getElementById('wishlistSidebar').classList.add('open');
  document.getElementById('wishlistOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeWishlist() {
  document.getElementById('wishlistSidebar').classList.remove('open');
  document.getElementById('wishlistOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function renderWishlistItems() {
  const el = document.getElementById('wishlistItems');
  if (!el) return;
  
  if (!wishlist.length) {
    el.innerHTML = `
      <div class="empty-cart">
        <span class="empty-cart-icon">❤️</span>
        <p>Your wishlist is empty</p>
        <button class="btn-primary shop-now-btn" onclick="closeWishlist(); scrollToSection('products')">Browse Products</button>
      </div>`;
    return;
  }
  
  const items = wishlist.map(id => PRODUCTS_DB.find(p => p.id === id)).filter(Boolean);
  
  el.innerHTML = items.map(p => `
    <div class="cart-item">
      <img src="${sanitize(p.colors[0].images[0])}" class="cart-item-img" alt="${sanitize(p.name)}">
      <div class="cart-item-info">
        <div class="order-detail-item"><label>Phone</label><span>${sanitize(c.phone || '—')} <a href="https://wa.me/91${sanitize(c.phone)}?text=Hello ${sanitize(c.name)}, this is from National Footwear regarding your order ${sanitize(order.orderId)}" target="_blank" style="margin-left:8px;text-decoration:none">💬 WhatsApp</a></span></div>
        <div class="order-detail-item"><label>Email</label><span>${sanitize(c.email || '—')}</span></div>tize(p.name)}</div>
        <div class="cart-item-footer">
          <span class="cart-item-price">₹${(isWholesaleMode ? p.wholesalePrice : p.price).toLocaleString()}</span>
          <button class="cart-item-remove" onclick="toggleWishlist(event, '${sanitize(p.id)}')">Remove</button>
        </div>
        <button class="btn-ghost" style="width:100%;margin-top:10px;padding:8px;font-size:12px" 
          onclick="closeWishlist(); openProductModal('${sanitize(p.id)}')">View Details</button>
      </div>
    </div>
  `).join('');
}

// ===== CART =====
function quickAddToCart(e, id) {
  e.stopPropagation();
  const p = PRODUCTS_DB.find(x => x.id === id);
  if (!p) return;
  const defaultSize = p.sizes.find(s => !p.unavailableSizes.includes(s));
  const quantity = isWholesaleMode ? p.moq : 1;
  addItemToCart(p, defaultSize, p.colors[0], quantity);
  showToast(`${sanitize(p.name)} added to cart 🛒`);
}
function addToCartFromModal() {
  if (!selectedSize) { showToast('Please select a size'); return; }
  if (isWholesaleMode && qty < currentProduct.moq) {
    showToast(`Minimum order is ${currentProduct.moq} pairs for wholesale`);
    return;
  }
  addItemToCart(currentProduct, selectedSize, currentProduct.colors[selectedColor], qty);
  showToast(`${sanitize(currentProduct.name)} added to cart 🛒`);
  closeModal();
  openCart();
}
function buyNow() {
  if (!selectedSize) { showToast('Please select a size'); return; }
  addItemToCart(currentProduct, selectedSize, currentProduct.colors[selectedColor], qty);
  closeModal();
  openCheckout();
}
function addItemToCart(product, size, color, quantity) {
  const key = `${product.id}_${size}_${color.name}`;
  const existing = cart.find(i => i.key === key);
  const price = isWholesaleMode ? product.wholesalePrice : product.price;
  if (existing) {
    existing.qty += quantity;
  } else {
    cart.push({
      key, id: product.id, sku: product.sku,
      name: product.name, brand: product.brand,
      price, size, colorName: color.name, colorHex: color.hex,
      image: color.images[0], qty: quantity, type: product.type,
      isWholesale: isWholesaleMode, moq: product.moq
    });
  }
  saveCart();
  updateCartUI();
}
function removeFromCart(key) {
  cart = cart.filter(i => i.key !== key);
  saveCart();
  updateCartUI();
  renderCartItems();
}
function saveCart() { saveToStorage('nf_cart', cart); }
function updateCartUI() {
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const countEl = document.getElementById('cartCount');
  const floatCountEl = document.getElementById('floatingCartCount');
  
  if (countEl) {
    countEl.textContent = totalQty;
    countEl.style.display = totalQty > 0 ? 'flex' : 'none';
  }
  if (floatCountEl) {
    floatCountEl.textContent = totalQty;
    // Keep floating cart always visible if it has items, or as a subtle bubble
    floatCountEl.style.display = totalQty > 0 ? 'flex' : 'none';
  }

  renderCartItems();
  saveToStorage('nf_cart', cart);
}
function renderCartItems() {
  const el = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
  if (!cart.length) {
    el.innerHTML = `
      <div class="empty-cart">
        <span class="empty-cart-icon">🛒</span>
        <p>Your cart is empty</p>
        <button class="btn-primary shop-now-btn" onclick="closeCart(); scrollToSection('products')">Shop Now</button>
      </div>`;
    footer.style.display = 'none';
    return;
  }
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  el.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${sanitize(item.image)}" class="cart-item-img" alt="${sanitize(item.name)}">
      <div class="cart-item-info">
        <div class="cart-item-sku">${sanitize(item.sku)}</div>
        <div class="cart-item-name">${sanitize(item.brand)} — ${sanitize(item.name)}</div>
        <div class="cart-item-meta">Size: ${item.size} · ${sanitize(item.colorName)} · ×${item.qty}</div>
        <div class="cart-item-footer">
          <span class="cart-item-price">₹${(item.price * item.qty).toLocaleString()}</span>
          <button class="cart-item-remove" onclick="removeFromCart('${sanitize(item.key)}')">Remove</button>
        </div>
      </div>
    </div>
  `).join('');
  document.getElementById('cartTotal').textContent = `₹${total.toLocaleString()}`;
  footer.style.display = 'block';

  // Wholesale min order check
  const minOrderEl = document.getElementById('wholesaleMinOrder');
  const minTextEl = document.getElementById('minOrderText');
  if (isWholesaleMode && total < BRAND.wholesale.minOrderValue) {
    minOrderEl.style.display = 'block';
    minTextEl.textContent = `⚠️ Add ₹${(BRAND.wholesale.minOrderValue - total).toLocaleString()} more to meet minimum wholesale order of ₹${BRAND.wholesale.minOrderValue.toLocaleString()}`;
  } else {
    if (minOrderEl) minOrderEl.style.display = 'none';
  }

  // Update cart mode badge
  const badge = document.getElementById('cartModeBadge');
  if (badge) {
    badge.textContent = isWholesaleMode ? 'Wholesale' : 'Retail';
    badge.className = 'cart-mode-badge' + (isWholesaleMode ? ' wholesale' : '');
  }
}
function openCart() {
  renderCartItems();
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
document.getElementById('cartBtn').addEventListener('click', openCart);

// ===== CHECKOUT =====
function openCheckout() {
  closeCart();
  // Show wholesale fields if applicable
  const wsFields = document.getElementById('wholesaleOrderFields');
  if (wsFields) wsFields.style.display = isWholesaleMode ? 'block' : 'none';

  document.getElementById('checkoutOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderCheckoutSummary();
  setStep(1);
}
function closeCheckout() {
  document.getElementById('checkoutOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
function setStep(n) {
  [1,2,3].forEach(i => {
    document.getElementById(`step${i}`).className = 'step' + (i === n ? ' active' : i < n ? ' done' : '');
    document.getElementById(`panel${i}`).className = 'checkout-panel' + (i === n ? ' active' : '');
  });
}

// ===== VALIDATION =====
function validatePhone(phone) { return /^[6-9]\d{9}$/.test(phone); }
function validateEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function validatePin(pin) { return /^\d{6}$/.test(pin); }
function validateName(name) { return name.trim().length >= 2 && name.trim().length <= 80; }

function goToPayment() {
  const name = document.getElementById('cName').value.trim();
  const phone = document.getElementById('cPhone').value.trim();
  const email = document.getElementById('cEmail').value.trim();
  const addr = document.getElementById('cAddr1').value.trim();
  const city = document.getElementById('cCity').value.trim();
  const pin = document.getElementById('cPin').value.trim();

  if (!validateName(name)) { showToast('Please enter a valid name'); markError('cName'); return; }
  if (!validatePhone(phone)) { showToast('Please enter a valid 10-digit mobile number'); markError('cPhone'); return; }
  if (email && !validateEmail(email)) { showToast('Please enter a valid email address'); markError('cEmail'); return; }
  if (!addr) { showToast('Please enter your address'); markError('cAddr1'); return; }
  if (!city) { showToast('Please enter your city'); markError('cCity'); return; }
  if (!validatePin(pin)) { showToast('Please enter a valid 6-digit PIN code'); markError('cPin'); return; }

  setStep(2);
  renderCheckoutSummary();
}
function markError(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('error');
  el.addEventListener('input', () => el.classList.remove('error'), { once: true });
}
function goToDelivery() { setStep(1); }
function renderCheckoutSummary() {
  const el = document.getElementById('checkoutSummary');
  if (!el) return;
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping = total >= BRAND.freeDeliveryAbove ? 0 : 49;
  const grandTotal = total + shipping;
  el.innerHTML = `
    <div style="font-size:13px;color:var(--text2);margin-bottom:10px">${cart.map(i => `${sanitize(i.name)} (Size ${i.size}) ×${i.qty}`).join('<br>')}</div>
    <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:4px"><span>Subtotal</span><span>₹${total.toLocaleString()}</span></div>
    <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:4px"><span>Shipping</span><span>${shipping === 0 ? '<span style="color:#2E7D32">FREE</span>' : '₹' + shipping}</span></div>
    <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:800;border-top:1px solid var(--border);padding-top:10px;margin-top:8px"><span>Total</span><span style="color:var(--accent-dark)">₹${grandTotal.toLocaleString()}</span></div>
    ${isWholesaleMode ? '<div style="margin-top:8px;font-size:12px;color:var(--wholesale-clr);font-weight:700">🏭 Wholesale Order</div>' : ''}
  `;
}
function selectPayment(type) {
  selectedPayment = type;
  ['upi','card','netbanking'].forEach(t => {
    const el = document.getElementById(`pay${t.charAt(0).toUpperCase() + t.slice(1)}`);
    if (el) el.classList.remove('active');
  });
  const activeEl = document.getElementById(`pay${type.charAt(0).toUpperCase() + type.slice(1)}`);
  if (activeEl) activeEl.classList.add('active');
  document.getElementById('upiPanel').style.display = type === 'upi' ? 'block' : 'none';
  document.getElementById('cardPanel').style.display = type === 'card' ? 'block' : 'none';
  document.getElementById('netPanel').style.display = type === 'netbanking' ? 'block' : 'none';
  renderCheckoutSummary();
}

function confirmOrder() {
  if (selectedPayment === 'upi') {
    const upiVal = document.getElementById('upiId').value.trim();
    if (!upiVal || !upiVal.includes('@')) { showToast('Please enter a valid UPI ID (e.g. name@upi)'); return; }
  }
  
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping = total >= BRAND.freeDeliveryAbove ? 0 : 49;
  const cod = selectedPayment === 'cod' ? 49 : 0;
  const grandTotal = total + shipping + cod;

  if (selectedPayment === 'cod') {
    finishOrder(null);
  } else {
    payWithRazorpay(grandTotal);
  }
}

function payWithRazorpay(amount) {
  if (typeof Razorpay === 'undefined') {
    showToast('Payment gateway is loading. Please try again in a moment.');
    return;
  }

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: amount * 100, // Amount in paise
    currency: "INR",
    name: BRAND.name,
    description: "Purchase from National Footwear",
    image: "images/logo-dark.png", 
    handler: function (response) {
      finishOrder(response.razorpay_payment_id);
    },
    prefill: {
      name: document.getElementById('cName').value.trim(),
      email: document.getElementById('cEmail').value.trim(),
      contact: document.getElementById('cPhone').value.trim()
    },
    notes: {
      order_id: `NF-${Date.now()}`
    },
    theme: {
      color: "#0D1B2A"
    }
  };

  const rzp1 = new Razorpay(options);
  rzp1.on('payment.failed', function (response){
    showToast(`Payment failed: ${response.error.description}`);
  });
  rzp1.open();
}

function finishOrder(paymentId) {
  const prefix = isWholesaleMode ? 'NF-WS' : 'NF-RT';
  orderNumber = `${prefix}-${Date.now().toString().slice(-8)}`;
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping = total >= BRAND.freeDeliveryAbove ? 0 : 49;
  const cod = selectedPayment === 'cod' ? 49 : 0;

  // Build order record
  const orderData = {
    orderId: orderNumber,
    type: isWholesaleMode ? 'wholesale' : 'retail',
    customer: {
      name: sanitize(document.getElementById('cName').value.trim()),
      phone: document.getElementById('cPhone').value.trim(),
      email: document.getElementById('cEmail').value.trim(),
      address: sanitize(document.getElementById('cAddr1').value.trim()),
      city: sanitize(document.getElementById('cCity').value.trim()),
      state: sanitize(document.getElementById('cState').value.trim()),
      pin: document.getElementById('cPin').value.trim(),
      business: isWholesaleMode ? sanitize(document.getElementById('cBusiness')?.value?.trim() || '') : '',
      gst: isWholesaleMode ? sanitize(document.getElementById('cGST')?.value?.trim() || '') : ''
    },
    items: cart.map(i => ({
      sku: i.sku, name: i.name, brand: i.brand,
      size: i.size, color: i.colorName, qty: i.qty,
      price: i.price, total: i.price * i.qty
    })),
    payment: selectedPayment,
    paymentId: paymentId || 'COD',
    subtotal: total,
    shipping, cod,
    grandTotal: total + shipping + cod,
    status: paymentId ? 'confirmed' : 'pending',
    placedAt: new Date().toISOString()
  };

  // Save to localStorage (in production, send to Firebase)
  const orders = loadFromStorage('nf_orders', []);
  orders.unshift(orderData);
  saveToStorage('nf_orders', orders);

  const grandTotal = total + shipping + cod;

  document.getElementById('orderIdText').textContent = `Order ID: ${orderNumber}`;
  document.getElementById('successDetails').innerHTML = `
    <div class="success-billing-card">
      <div class="sbc-header">
        <span class="sbc-icon">📦</span>
        <strong>${cart.length} item(s) ordered</strong>
      </div>
      <div class="sbc-body">
        <p>💰 Total Payable: <strong>₹${grandTotal.toLocaleString()}</strong></p>
        <p>🚚 Expected Delivery: <strong>${getDeliveryDate()}</strong></p>
        <p>💳 Payment Mode: <strong>${selectedPayment.toUpperCase()}</strong></p>
        ${paymentId ? `<p>🔗 Transaction ID: <code style="font-size:12px">${paymentId}</code></p>` : ''}
      </div>
      <div class="sbc-action">
        <button class="btn-whatsapp-order" onclick="openWhatsAppBill('${orderNumber}')">
          <svg viewBox="0 0 24 24" fill="white" width="20" height="20"><path d="M17.472 6.527C15.825 4.88 13.635 3.97 11.317 3.97c-4.468 0-8.103 3.635-8.103 8.103 0 1.428.372 2.825 1.08 4.053L2.27 21.03l4.982-1.307c1.17.638 2.49 1.004 3.856 1.004h.01c4.467 0 8.102-3.635 8.102-8.102 0-2.318-.91-4.508-2.557-6.155zM11.317 19.34c-1.284 0-2.544-.345-3.642-.996l-.261-.157-2.705.71.722-2.637-.17-.266c-.713-1.116-1.09-2.408-1.09-3.725 0-3.79 3.08-6.87 6.87-6.87 1.836 0 3.563.715 4.858 2.012 1.295 1.295 2.01 3.022 2.01 4.858 0 3.79-3.08 6.87-6.87 6.87z"/></svg>
          Finalize via WhatsApp
        </button>
        <p class="sbc-hint">Click above to send order details to the shop owner.</p>
      </div>
    </div>
  `;
  setStep(3);
  cart = [];
  saveCart();
  updateCartUI();
}

function openWhatsAppBill(orderId) {
  const orders = loadFromStorage('nf_orders', []);
  const order = orders.find(o => o.orderId === orderId);
  if (!order) return;

  const msg = `👑 *ORDER FROM ${BRAND.name}*\n\n` +
    `📌 *Order ID:* ${order.orderId}\n` +
    `👤 *Customer:* ${order.customer.name}\n` +
    `📞 *Phone:* ${order.customer.phone}\n` +
    `📍 *Address:* ${order.customer.address}, ${order.customer.city} - ${order.customer.pin}\n\n` +
    `📦 *Items:*\n` +
    order.items.map(i => `• ${i.brand} ${i.name} (S:${i.size}) x${i.qty} - ₹${i.total.toLocaleString()}`).join('\n') +
    `\n\n` +
    `💰 *Grand Total:* ₹${order.grandTotal.toLocaleString()}\n` +
    `💳 *Payment:* ${order.payment.toUpperCase()}\n\n` +
    `🌟 _Thank you for shopping with National Footwear!_`;

  const encoded = encodeURIComponent(msg);
  window.open(`https://wa.me/${BRAND.whatsapp}?text=${encoded}`, '_blank');
}
function getDeliveryDate() {
  const d = new Date();
  d.setDate(d.getDate() + BRAND.deliveryDays);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ===== WHOLESALE =====
function openWholesaleModal() {
  if (isWholesaleMode) { exitWholesale(); return; }
  // Bypassing passcode gate for friction-free access
  sessionStorage.setItem('nf_wholesale', 'true');
  isWholesaleMode = true;
  activateWholesaleUI();
  showToast('🏭 Wholesale mode activated!');
  applyFiltersAndSort();
}
function closeWholesaleModal() {
  document.getElementById('wholesaleModal').classList.remove('open');
  document.body.style.overflow = '';
  document.getElementById('wholesalePasswordInput').value = '';
  document.getElementById('wholesaleError').style.display = 'none';
}
function submitWholesaleLogin() {
  const input = document.getElementById('wholesalePasswordInput').value.trim();
  if (input === BRAND.wholesale.password) {
    sessionStorage.setItem('nf_wholesale', 'true');
    isWholesaleMode = true;
    closeWholesaleModal();
    activateWholesaleUI();
    showToast('🏭 Wholesale mode activated!');
    applyFiltersAndSort();
  } else {
    document.getElementById('wholesaleError').style.display = 'block';
    document.getElementById('wholesalePasswordInput').value = '';
  }
}
document.getElementById('wholesalePasswordInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') submitWholesaleLogin();
});
function activateWholesaleUI() {
  const bar = document.getElementById('wholesaleTopBar');
  if (bar) bar.style.display = 'block';
  const hint = document.getElementById('wholesaleModeHint');
  if (hint) hint.style.display = 'block';
  safeSetText('wholesaleNavLabel', '🏭 Active');
}
function exitWholesale() {
  sessionStorage.removeItem('nf_wholesale');
  isWholesaleMode = false;
  const bar = document.getElementById('wholesaleTopBar');
  if (bar) bar.style.display = 'none';
  const hint = document.getElementById('wholesaleModeHint');
  if (hint) hint.style.display = 'none';
  safeSetText('wholesaleNavLabel', 'Wholesale');
  cart = [];
  saveCart();
  updateCartUI();
  applyFiltersAndSort();
  showToast('Exited wholesale mode');
}

// ===== SEARCH =====
function setupSearch() {
  document.getElementById('searchBtn').addEventListener('click', () => {
    document.getElementById('searchOverlay').classList.add('open');
    setTimeout(() => document.getElementById('searchInput').focus(), 100);
  });
  document.getElementById('searchInput').addEventListener('keyup', (e) => {
    if (e.key === 'Escape') { closeSearch(); return; }
    if (e.key === 'Enter') {
      const q = e.target.value.trim().toLowerCase();
      if (!q) return;
      closeSearch();
      const filtered = PRODUCTS_DB.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
      document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => renderProducts(filtered), 400);
    }
  });
}
function closeSearch() {
  document.getElementById('searchOverlay').classList.remove('open');
  document.getElementById('searchInput').value = '';
}

// ===== KEY LISTENERS =====
function setupKeyListeners() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeModal(); closeSearch(); closeCheckout(); closeWholesaleModal(); }
  });
  document.getElementById('productModal').addEventListener('click', function(e) { if (e.target === this) closeModal(); });
  document.getElementById('checkoutOverlay').addEventListener('click', function(e) { if (e.target === this) closeCheckout(); });
  document.getElementById('searchOverlay').addEventListener('click', function(e) { if (e.target === this) closeSearch(); });
  document.getElementById('wholesaleModal').addEventListener('click', function(e) { if (e.target === this) closeWholesaleModal(); });
}

// ===== CARD FORMATTER =====
function setupCardNumberFormatter() {
  const cardNum = document.getElementById('cardNum');
  if (cardNum) {
    cardNum.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g,'').slice(0,16);
      e.target.value = v.replace(/(.{4})/g,'$1 ').trim();
    });
  }
  const cardExp = document.getElementById('cardExp');
  if (cardExp) {
    cardExp.addEventListener('input', (e) => {
      let v = e.target.value.replace(/\D/g,'');
      if (v.length > 2) v = v.slice(0,2) + '/' + v.slice(2,4);
      e.target.value = v;
    });
  }
  // Phone - only digits
  const phone = document.getElementById('cPhone');
  if (phone) {
    phone.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g,'').slice(0,10);
    });
  }
  // Pin - only digits
  const pin = document.getElementById('cPin');
  if (pin) {
    pin.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g,'').slice(0,6);
    });
  }
}

// ===== SIZE GUIDE =====
function showSizeGuide() {
  showToast('Size Guide: IND 6 = UK 5 = EU 39 | IND 7 = UK 6 = EU 40 | IND 8 = UK 7 = EU 41');
}

// ===== NEWSLETTER =====
function subscribeNewsletter() {
  const emailEl = document.getElementById('newsletterEmail');
  if (!emailEl) return;
  const email = emailEl.value.trim();
  if (!validateEmail(email)) { showToast('Please enter a valid email address'); return; }
  emailEl.value = '';
  showToast('Thank you for subscribing! 🎉');
}

// ===== POLICY MODALS =====
const POLICIES = {
  privacy: {
    title: "Privacy Policy",
    content: "At National Footwear, we value your privacy. Your personal information is used exclusively for order processing and account management. We do not sell your data to third parties. All transactions are secured with industry-standard encryption."
  },
  shipping: {
    title: "Shipping Policy",
    content: "We offer professional door-to-door delivery across India. Orders are typically processed within 24-48 hours and delivered within 5-7 business days. Tracking details are sent via SMS and Email once dispatched."
  },
  returns: {
    title: "Returns & Exchanges",
    content: "We take pride in our quality and only source 100% original products. If you have any issues with size or quality, please contact our support team through your dashboard to initiate an exchange request."
  },
  terms: {
    title: "Terms of Service",
    content: "By using our website, you agree to our terms. Prices are subject to change without notice. Wholesale orders must meet a minimum value of ₹5,000 to qualify for discounted pricing."
  },
  about: {
    title: "Heritage & Quality",
    content: "Founded on a vision of unmatched craftsmanship, **National Footwear** has been a cornerstone of quality since its inception. What started as a small boutique has grown into India's premier multi-brand destination, curated for those who never compromise on comfort or style. We pride ourselves on sourcing 100% original products directly from global and home-grown brands."
  }
};

function showPolicy(type) {
  const p = POLICIES[type];
  if (!p) return;
  const modal = document.getElementById('policyModal');
  const title = document.getElementById('policyTitle');
  const content = document.getElementById('policyContent');
  if (!modal || !title || !content) return;

  title.textContent = p.title;
  content.innerHTML = `<p style="line-height:1.8; color:var(--text2)">${p.content}</p>`;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePolicy() {
  document.getElementById('policyModal').classList.remove('open');
  document.body.style.overflow = '';
}

// ===== NAVIGATION HELPERS =====
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    const offset = 80; // Header height
    const bodyRect = document.body.getBoundingClientRect().top;
    const elementRect = el.getBoundingClientRect().top;
    const elementPosition = elementRect - bodyRect;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
}

// ===== TOAST =====
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

