const STORAGE_KEY = 'lafamilia_cart';

function loadCart() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function formatCurrency(n) {
  return `$${Number(n).toFixed(0)}`;
}

function updateCartCount() {
  const cart = loadCart();
  const countEl = document.querySelector('.cart-count');
  if (countEl) countEl.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
}

function renderCartSidebar() {
  const cart = loadCart();
  const list = document.getElementById('cartItems');
  const totalEl = document.querySelector('.cart-total');
  if (!list) return;
  list.innerHTML = '';
  let total = 0;
  cart.forEach((item, idx) => {
    total += item.price * item.qty;
    const row = document.createElement('div');
    row.className = 'flex items-center gap-3';
    row.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded"/>
      <div class="flex-1">
        <div class="font-semibold">${item.name}</div>
        <div class="text-sm text-gray-600">${formatCurrency(item.price)} × ${item.qty}</div>
      </div>
      <button class="p-2 text-red-600" data-remove="${idx}" aria-label="Remove">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    `;
    list.appendChild(row);
  });
  if (totalEl) totalEl.textContent = formatCurrency(total);
  list.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-remove'));
      const c = loadCart();
      c.splice(idx, 1);
      saveCart(c);
      updateCartCount();
      renderCartSidebar();
    });
  });
}

function addToCart(item) {
  const cart = loadCart();
  const existing = cart.find(i => i.id === item.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  saveCart(cart);
  updateCartCount();
  renderCartSidebar();
  openCart();
}

function openCart() {
  const sidebar = document.getElementById('cartSidebar');
  if (sidebar) sidebar.classList.add('open');
}

function closeCart() {
  const sidebar = document.getElementById('cartSidebar');
  if (sidebar) sidebar.classList.remove('open');
}

function initNav() {
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const cartBtn = document.getElementById('cartBtn');
  const closeBtn = document.getElementById('closeCart');
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  }
  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (closeBtn) closeBtn.addEventListener('click', closeCart);
}

function initButtons() {
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = {
        id: btn.getAttribute('data-id'),
        name: btn.getAttribute('data-name'),
        price: Number(btn.getAttribute('data-price')),
        image: btn.getAttribute('data-image')
      };
      addToCart(item);
    });
  });
}

function renderShopGrid() {
  const grid = document.getElementById('shopGrid');
  if (!grid) return;
  const products = loadProducts();
  grid.innerHTML = '';
  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card bg-gray-50 rounded-xl overflow-hidden shadow-sm';
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" class="w-full h-64 object-cover" />
      <div class="p-4">
        <h3 class="text-lg font-semibold">${p.name}</h3>
        <p class="text-sm text-gray-600 line-clamp-2">${p.desc || ''}</p>
        <div class="flex items-center justify-between mt-4">
          <span class="text-black font-semibold">${formatCurrency(p.price)}</span>
          <button class="btn-gold px-4 py-2 rounded-lg font-semibold add-to-cart" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}" data-image="${p.image}">Add to Cart</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
  initButtons();
}

function initSplide() {
  if (window.Splide) {
    const hero = document.getElementById('heroSlider');
    if (hero) new Splide('#heroSlider', { type: 'loop', autoplay: true, interval: 4000, arrows: true, pagination: false }).mount();
    const lookbook = document.getElementById('lookbookSlider');
    if (lookbook) new Splide('#lookbookSlider', { type: 'loop', autoplay: true, interval: 3500, arrows: true, pagination: true, gap: '1rem' }).mount();
  }
}

function initYear() {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
}

function initTyped() {
  const el = document.getElementById('typed-text');
  if (el && window.Typed) {
    new Typed('#typed-text', {
      strings: ['Luxury Streetwear', 'Bold Fashion', 'La Familia'],
      typeSpeed: 70,
      backSpeed: 40,
      backDelay: 1500,
      loop: true,
      smartBackspace: true,
      showCursor: true
    });
  }
}

// Admin
const ADMIN_KEY = 'lafamilia_admin';
const PRODUCTS_KEY = 'lafamilia_products';

function isAdmin() {
  return localStorage.getItem(ADMIN_KEY) === 'true';
}

function initAdminLogin() {
  const form = document.getElementById('adminLoginForm');
  const userEl = document.getElementById('adminUser');
  const passEl = document.getElementById('adminPass');
  const errEl = document.getElementById('adminLoginError');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const u = userEl ? userEl.value.trim() : '';
    const p = passEl ? passEl.value : '';
    if (u === 'admin' && p === 'admin123') {
      localStorage.setItem(ADMIN_KEY, 'true');
      if (errEl) errEl.classList.add('hidden');
      window.location.href = 'admin.html';
    } else {
      if (errEl) errEl.classList.remove('hidden');
    }
  });
}

function initAdminGuard() {
  const adminForm = document.getElementById('productForm');
  if (adminForm && !isAdmin()) {
    window.location.href = 'admin-login.html';
  }
}

function initAdminLogout() {
  const btn = document.getElementById('adminLogout');
  if (!btn) return;
  btn.addEventListener('click', () => {
    localStorage.removeItem(ADMIN_KEY);
    window.location.href = 'admin-login.html';
  });
}

function loadProducts() {
  try {
    const p = JSON.parse(localStorage.getItem(PRODUCTS_KEY));
    if (Array.isArray(p)) return p;
  } catch {}
  const seed = [
    { id: 'bag', name: 'Leather Bag', price: 249, image: 'Images/Bag.jpg', images: ['Images/Bag.jpg'], desc: 'Handcrafted bag with gold accents.' },
    { id: 'sneaker', name: 'Urban Sneaker', price: 179, image: 'Images/sneaker.jpg', images: ['Images/sneaker.jpg'], desc: 'Premium sole with street-ready design.' },
    { id: 'jeans', name: 'Tailored Jeans', price: 139, image: 'Images/Jeans.jpg', images: ['Images/Jeans.jpg'], desc: 'Contemporary fit with classic durability.' },
    { id: 'sweater', name: 'Luxury Sweater', price: 159, image: 'Images/sweater.jpg', images: ['Images/sweater.jpg'], desc: 'Soft-touch knit with gold accent detail.' }
  ];
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(seed));
  return seed;
}

function saveProducts(products) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

function renderAdminProducts() {
  const container = document.getElementById('adminProducts');
  if (!container) return;
  const products = loadProducts();
  container.innerHTML = '';
  products.forEach(p => {
    const row = document.createElement('div');
    row.className = 'flex items-center gap-3 border rounded-lg p-3';
    row.innerHTML = `
      <img src="${p.image}" alt="${p.name}" class="w-14 h-14 object-cover rounded" />
      <div class="flex-1">
        <div class="font-semibold">${p.name}</div>
        <div class="text-sm text-gray-600">${formatCurrency(p.price)} • <span class="text-gray-500">${p.id}</span></div>
      </div>
      <div class="flex items-center gap-2">
        <button class="px-3 py-2 rounded border" data-edit="${p.id}">Edit</button>
        <button class="px-3 py-2 rounded border text-red-600" data-delete="${p.id}">Delete</button>
      </div>
    `;
    container.appendChild(row);
  });
  container.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-edit');
      fillProductForm(id);
    });
  });
  container.querySelectorAll('[data-delete]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-delete');
      const products = loadProducts();
      const idx = products.findIndex(p => p.id === id);
      if (idx !== -1) {
        products.splice(idx, 1);
        saveProducts(products);
        renderAdminProducts();
      }
    });
  });
}

function fillProductForm(id) {
  const products = loadProducts();
  const p = products.find(pr => pr.id === id);
  if (!p) return;
  const idHidden = document.getElementById('productIdHidden');
  const idEl = document.getElementById('productId');
  const nameEl = document.getElementById('productName');
  const priceEl = document.getElementById('productPrice');
  const descEl = document.getElementById('productDesc');
  const preview = document.getElementById('imagePreview');
  if (idHidden) idHidden.value = p.id;
  if (idEl) idEl.value = p.id;
  if (nameEl) nameEl.value = p.name;
  if (priceEl) priceEl.value = p.price;
  if (descEl) descEl.value = p.desc || '';
  if (preview) {
    preview.innerHTML = '';
    const imgs = p.images && p.images.length ? p.images : (p.image ? [p.image] : []);
    imgs.forEach(u => {
      const img = document.createElement('img');
      img.src = u;
      img.className = 'w-16 h-16 object-cover rounded border';
      preview.appendChild(img);
    });
  }
}

function resetProductForm() {
  const form = document.getElementById('productForm');
  const idHidden = document.getElementById('productIdHidden');
  if (idHidden) idHidden.value = '';
  if (form) form.reset();
  const preview = document.getElementById('imagePreview');
  if (preview) preview.innerHTML = '';
}

function readSelectedImages(inputEl) {
  return new Promise(resolve => {
    const files = inputEl && inputEl.files ? Array.from(inputEl.files) : [];
    if (!files.length) return resolve([]);
    const results = [];
    let remaining = files.length;
    files.forEach(file => {
      const r = new FileReader();
      r.onload = e => {
        results.push(e.target.result);
        remaining -= 1;
        if (remaining === 0) resolve(results);
      };
      r.readAsDataURL(file);
    });
  });
}

function initProductForm() {
  const form = document.getElementById('productForm');
  const idHidden = document.getElementById('productIdHidden');
  const idEl = document.getElementById('productId');
  const nameEl = document.getElementById('productName');
  const priceEl = document.getElementById('productPrice');
  const imagesEl = document.getElementById('productImages');
  const descEl = document.getElementById('productDesc');
  const resetBtn = document.getElementById('productReset');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const products = loadProducts();
    const editingId = idHidden ? idHidden.value : '';
    const existing = editingId ? products.find(p => p.id === editingId) : null;
    const selectedImages = await readSelectedImages(imagesEl);
    const payload = {
      id: idEl ? idEl.value.trim() : '',
      name: nameEl ? nameEl.value.trim() : '',
      price: priceEl ? Number(priceEl.value) : 0,
      images: selectedImages.length ? selectedImages : (existing && existing.images ? existing.images : (existing && existing.image ? [existing.image] : [])),
      image: selectedImages.length ? selectedImages[0] : (existing && existing.image ? existing.image : ''),
      desc: descEl ? descEl.value.trim() : ''
    };
    if (editingId) {
      const idx = products.findIndex(p => p.id === editingId);
      if (idx !== -1) {
        products[idx] = payload;
      }
    } else {
      const exists = products.some(p => p.id === payload.id);
      if (exists) {
        alert('ID already exists. Choose a unique ID.');
        return;
      }
      products.push(payload);
    }
    saveProducts(products);
    renderAdminProducts();
    resetProductForm();
  });
  if (resetBtn) resetBtn.addEventListener('click', resetProductForm);
  if (imagesEl) {
    imagesEl.addEventListener('change', async () => {
      const urls = await readSelectedImages(imagesEl);
      const preview = document.getElementById('imagePreview');
      if (preview) {
        preview.innerHTML = '';
        urls.forEach(u => {
          const img = document.createElement('img');
          img.src = u;
          img.className = 'w-16 h-16 object-cover rounded border';
          preview.appendChild(img);
        });
      }
    });
  }
}

function initAdminDashboard() {
  const adminForm = document.getElementById('productForm');
  if (!adminForm) return;
  if (!isAdmin()) {
    window.location.href = 'admin-login.html';
    return;
  }
  initProductForm();
  renderAdminProducts();
}

function renderCartPage() {
  const container = document.getElementById('cartPageItems');
  const totalEl = document.getElementById('cartPageTotal');
  if (!container) return;
  const cart = loadCart();
  container.innerHTML = '';
  let total = 0;
  cart.forEach((item, idx) => {
    total += item.price * item.qty;
    const row = document.createElement('div');
    row.className = 'bg-white p-4 rounded-xl shadow-sm flex items-center gap-4';
    row.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded" />
      <div class="flex-1">
        <div class="font-semibold">${item.name}</div>
        <div class="text-sm text-gray-600">${formatCurrency(item.price)}</div>
      </div>
      <div class="flex items-center gap-2">
        <button class="px-2 py-1 border rounded" data-dec="${idx}">-</button>
        <span class="min-w-[2ch] text-center">${item.qty}</span>
        <button class="px-2 py-1 border rounded" data-inc="${idx}">+</button>
      </div>
      <div class="w-24 text-right font-semibold">${formatCurrency(item.price * item.qty)}</div>
      <button class="p-2 text-red-600" data-remove="${idx}" aria-label="Remove">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    `;
    container.appendChild(row);
  });
  if (totalEl) totalEl.textContent = formatCurrency(total);

  container.querySelectorAll('[data-inc]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-inc'));
      const c = loadCart();
      c[idx].qty += 1;
      saveCart(c);
      updateCartCount();
      renderCartPage();
      renderCartSidebar();
    });
  });
  container.querySelectorAll('[data-dec]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-dec'));
      const c = loadCart();
      c[idx].qty = Math.max(1, c[idx].qty - 1);
      saveCart(c);
      updateCartCount();
      renderCartPage();
      renderCartSidebar();
    });
  });
  container.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-remove'));
      const c = loadCart();
      c.splice(idx, 1);
      saveCart(c);
      updateCartCount();
      renderCartPage();
      renderCartSidebar();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initButtons();
  initSplide();
  initTyped();
  updateCartCount();
  renderCartSidebar();
  initYear();
  renderCartPage();
  initAdminLogin();
  initAdminGuard();
  initAdminLogout();
  initAdminDashboard();
  renderShopGrid();
});
