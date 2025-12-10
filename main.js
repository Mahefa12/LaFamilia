const STORAGE_KEY = 'lafamilia_cart';
const SALES_KEY = 'lafamilia_sold_units';

function injectGlobalTypography() {
  const style = document.createElement('style');
  style.textContent = `
    :root{--scale-h1:56px;--scale-h2:40px;--scale-h3:28px;--scale-body:18px;--lh-heading:1.4;--lh-body:1.7}
    body{font-size:var(--scale-body);line-height:var(--lh-body)!important}
    h1{font-size:var(--scale-h1)!important;line-height:var(--lh-heading)!important}
    h2{font-size:var(--scale-h2)!important;line-height:var(--lh-heading)!important}
    h3{font-size:var(--scale-h3)!important;line-height:var(--lh-heading)!important}
    section{padding-top:120px!important}
  `;
  document.head.appendChild(style);
}

function injectUXStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .cart-bubble{position:fixed;right:24px;bottom:24px;z-index:60;background:#0a0a0a;color:#fff;border-radius:9999px;box-shadow:0 18px 30px -16px rgba(0,0,0,0.35);display:flex;align-items:center;gap:.5rem;padding:.6rem .8rem;cursor:pointer}
    .cart-bubble .icon{width:20px;height:20px}
    .cart-bubble .count{min-width:22px;height:22px;border-radius:9999px;background:#d4af37;color:#000;font-weight:700;display:flex;align-items:center;justify-content:center;font-size:.75rem}
    .cart-bubble.bump{animation:cartBump 420ms ease}
    @keyframes cartBump{0%{transform:translateY(0) scale(1)}40%{transform:translateY(-2px) scale(1.06)}100%{transform:translateY(0) scale(1)}}
    body.page-enter{opacity:0}
    body.page-enter-active{opacity:1;transition:opacity 320ms ease}
    body.page-leave{opacity:1}
    body.page-leave-active{opacity:0;transition:opacity 280ms ease}
    .reveal{opacity:0;transform:translateY(8px)}
    .reveal.in-view{animation:fadeSubtle 480ms ease-out forwards}
    @keyframes fadeSubtle{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    a:focus-visible, button:focus-visible, input:focus-visible, textarea:focus-visible, select:focus-visible{outline:2px solid #d4af37; outline-offset:2px; border-radius:6px}
    .ripple{position:relative; overflow:hidden}
    .ripple-effect{position:absolute; border-radius:50%; transform:scale(0); animation:rippleAnim 520ms ease-out; background:rgba(212,175,55,0.35)}
    @keyframes rippleAnim{to{transform:scale(10); opacity:0}}
    #siteNav{transition:background-color 240ms ease, box-shadow 240ms ease}
  `;
  document.head.appendChild(style);
}

function loadCart() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function formatCurrency(n) {
  return `R${Number(n).toFixed(0)}`;
}

function updateCartCount() {
  const cart = loadCart();
  const countEl = document.querySelector('.cart-count');
  if (countEl) countEl.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
  const bubbleCount = document.getElementById('cartBubbleCount');
  if (bubbleCount) bubbleCount.textContent = countEl ? countEl.textContent : String(cart.reduce((sum, item) => sum + item.qty, 0));
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
      <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded" loading="lazy" decoding="async" sizes="64px"/>
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
  try {
    const sold = Number(localStorage.getItem(SALES_KEY) || '0');
    localStorage.setItem(SALES_KEY, String(sold + 1));
  } catch {}
  updateCartCount();
  renderCartSidebar();
  animateCartBubble();
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
  const closeBtn = document.getElementById('closeCart');
  const siteNav = document.getElementById('siteNav');
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  }
  document.querySelectorAll('#cartBtn, #cartBtnMobile').forEach(btn => {
    btn.addEventListener('click', openCart);
  });
  if (closeBtn) closeBtn.addEventListener('click', closeCart);
  if (siteNav) {
    const applyScrollState = () => {
      const scrolled = window.scrollY > 4;
      siteNav.classList.toggle('backdrop-blur-md', scrolled);
      siteNav.classList.toggle('bg-ivory/70', scrolled);
      siteNav.classList.toggle('bg-ivory/95', !scrolled);
      siteNav.classList.toggle('border-b', scrolled);
      siteNav.classList.toggle('border-gold/10', scrolled);
    };
    applyScrollState();
    window.addEventListener('scroll', applyScrollState, { passive: true });
  }
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

function initRipple(){
  document.addEventListener('click', (e) => {
    const target = e.target.closest('.ripple, .btn-primary, .btn-gold');
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const circle = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    circle.className = 'ripple-effect';
    circle.style.width = circle.style.height = `${size}px`;
    circle.style.left = `${(e.clientX - rect.left) - size/2}px`;
    circle.style.top = `${(e.clientY - rect.top) - size/2}px`;
    target.appendChild(circle);
    setTimeout(() => circle.remove(), 520);
  }, { passive: true });
}

function initFloatingCartBubble() {
  if (document.getElementById('cartBubble')) return;
  const bubble = document.createElement('button');
  bubble.id = 'cartBubble';
  bubble.className = 'cart-bubble';
  bubble.innerHTML = `
    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4"/><circle cx="9" cy="19" r="1"/><circle cx="17" cy="19" r="1"/></svg>
    <span id="cartBubbleCount" class="count">0</span>
  `;
  bubble.addEventListener('click', openCart);
  document.body.appendChild(bubble);
  updateCartCount();
}

function animateCartBubble() {
  const bubble = document.getElementById('cartBubble');
  if (!bubble) return;
  bubble.classList.remove('bump');
  // Force reflow to restart animation
  // eslint-disable-next-line no-unused-expressions
  bubble.offsetHeight;
  bubble.classList.add('bump');
}

function initPageTransitions() {
  document.body.classList.add('page-enter');
  requestAnimationFrame(() => {
    document.body.classList.add('page-enter-active');
    setTimeout(() => {
      document.body.classList.remove('page-enter');
      document.body.classList.remove('page-enter-active');
    }, 360);
  });
  document.querySelectorAll('a[href]')
    .forEach(a => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href') || '';
        const target = a.getAttribute('target');
        const isExternal = href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('#');
        if (isExternal || target === '_blank') return;
        e.preventDefault();
        document.body.classList.add('page-leave');
        requestAnimationFrame(() => {
          document.body.classList.add('page-leave-active');
          setTimeout(() => { window.location.href = href; }, 280);
        });
      }, { passive: false });
    });
}

function buildSrcSet(src){ return `${src} 800w, ${src} 1400w, ${src} 2000w`; }

function defineProductCard(){
  if (customElements.get('product-card')) return;
  class ProductCard extends HTMLElement{
    connectedCallback(){ this.render(); }
    static get observedAttributes(){ return ['id','name','price','image','href']; }
    attributeChangedCallback(){ this.render(); }
    render(){
      const id = this.getAttribute('id') || '';
      const name = this.getAttribute('name') || '';
      const price = Number(this.getAttribute('price') || '0');
      const image = this.getAttribute('image') || '';
      const href = this.getAttribute('href') || (id ? `product.html?id=${id}` : '#');
      this.className = 'product-card reveal bg-white rounded-xl overflow-hidden';
      this.innerHTML = `
        <div class="product-media relative h-[420px] md:h-[520px]" role="group" aria-label="${name}, price ${formatCurrency(price)}">
          <img src="${image}" alt="${name}" class="w-full h-full object-cover" loading="lazy" decoding="async" srcset="${buildSrcSet(image)}" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
          <div class="absolute bottom-0 left-0 right-0 p-4 text-white bg-gradient-to-t from-richblack/60 via-richblack/30 to-transparent flex items-center justify-between">
            <span class="text-sm" aria-label="Price">${formatCurrency(price)}</span>
            <a href="${href}" class="group inline-flex items-center gap-1 font-semibold ripple" aria-label="Shop ${name}">Shop <span class="transition-transform group-hover:translate-x-0.5">→</span></a>
          </div>
        </div>
        <div class="p-5">
          <h3 class="font-playfair uppercase tracking-[0.08em] text-lg">${name}</h3>
        </div>
      `;
    }
  }
  customElements.define('product-card', ProductCard);
}

function renderShopGrid() {
  const grid = document.getElementById('shopGrid');
  if (!grid) return;
  const products = loadProducts();
  grid.innerHTML = '';
  products.forEach(p => {
    const el = document.createElement('product-card');
    el.setAttribute('id', p.id);
    el.setAttribute('name', p.name);
    el.setAttribute('price', String(p.price));
    el.setAttribute('image', p.image);
    grid.appendChild(el);
  });
  initScrollReveal();
}

function initSplide() {
  if (window.Splide) {
    const hero = document.getElementById('heroSlider');
    if (hero) new Splide('#heroSlider', { type: 'fade', autoplay: true, interval: 4200, speed: 600, arrows: true, pagination: true, easing: 'ease' }).mount();
    const lookbook = document.getElementById('lookbookSlider');
    if (lookbook) new Splide('#lookbookSlider', { type: 'loop', autoplay: true, interval: 3600, speed: 520, arrows: true, pagination: true, gap: '1rem', easing: 'ease' }).mount();
  }
}

function initYear() {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
}

function initHeroLetters() {
  const el = document.getElementById('hero-title');
  if (el && window.Splitting) {
    Splitting();
  }
}

function initScrollReveal() {
  const elements = Array.from(document.querySelectorAll('.reveal'));
  if (!elements.length) return;
  if (typeof IntersectionObserver === 'undefined') {
    elements.forEach(el => el.classList.add('in-view'));
    return;
  }
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = elements.indexOf(entry.target);
        entry.target.style.animationDelay = `${Math.min(idx * 40, 200)}ms`;
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  elements.forEach(el => observer.observe(el));
  // Ensure items already in viewport are visible immediately
  elements.forEach(el => {
    const r = el.getBoundingClientRect();
    const inView = r.top < window.innerHeight && r.bottom > 0;
    if (inView) el.classList.add('in-view');
  });
}

function initParallax() {
  const hero = document.querySelector('.hero-section');
  const content = document.querySelector('.hero-content');
  if (!hero || !content) return;
  let ticking = false;
  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        const offset = Math.min(40, y * 0.15);
        content.style.transform = `translateY(${offset}px)`;
        hero.style.backgroundPosition = `center calc(50% + ${Math.min(60, y * 0.1)}px)`;
        ticking = false;
      });
      ticking = true;
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}
function getQueryParam(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

function renderProductDetail() {
  const container = document.getElementById('productDetail');
  if (!container) return;
  const id = getQueryParam('id');
  const p = (id && loadProducts().find(x => x.id === id)) || null;
  if (!p) {
    container.innerHTML = '<div class="text-center py-20">Product not found.</div>';
    return;
  }
  const images = Array.isArray(p.images) && p.images.length ? p.images : (p.image ? [p.image] : []);
  const main = document.getElementById('productMainImage');
  const thumbs = document.getElementById('productThumbs');
  const titleEl = document.getElementById('productTitle');
  const priceEl = document.getElementById('productPrice');
  const detailsEl = document.getElementById('productDetails');
  const materialsEl = document.getElementById('productMaterials');
  const shippingEl = document.getElementById('productShipping');
  const careEl = document.getElementById('productCare');
  const addBtn = document.getElementById('productAddBtn');
  if (titleEl) titleEl.textContent = p.name;
  if (priceEl) priceEl.textContent = formatCurrency(p.price);
  if (main) {
    const src = images[0] || '';
    main.src = src;
    main.srcset = `${src} 800w, ${src} 1400w, ${src} 2000w`;
    main.sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 50vw';
  }
  if (detailsEl) detailsEl.textContent = p.desc || 'An editorial overview of the piece.';
  if (materialsEl) materialsEl.textContent = 'Premium cotton blend with gold accent hardware.';
  if (shippingEl) shippingEl.textContent = shippingEl.textContent || 'Free standard shipping (3–5 business days). Express available at checkout.';
  if (careEl) careEl.textContent = careEl.textContent || 'Hand wash cold. Dry flat. Do not bleach. Iron on low if needed.';
  if (thumbs) {
    thumbs.innerHTML = '';
    images.forEach((src, idx) => {
      const t = document.createElement('button');
      t.className = 'thumb w-20 h-24 overflow-hidden rounded-lg border bg-white';
      t.innerHTML = `<img src="${src}" alt="${p.name} ${idx+1}" class="w-full h-full object-cover" loading="lazy" decoding="async" sizes="80px"/>`;
      t.addEventListener('click', () => switchMainImage(src));
      thumbs.appendChild(t);
    });
  }
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      addToCart({ id: p.id, name: p.name, price: p.price, image: p.image || images[0] || '' });
    });
  }
}

function switchMainImage(src) {
  const mainWrap = document.getElementById('productMainWrap');
  const img = document.getElementById('productMainImage');
  const lens = document.getElementById('zoomLens');
  if (!img) return;
  if (mainWrap) mainWrap.classList.add('fade');
  setTimeout(() => {
    img.src = src;
    img.srcset = `${src} 800w, ${src} 1400w, ${src} 2000w`;
    if (lens) {
      lens.style.backgroundImage = `url('${src}')`;
    }
    if (mainWrap) mainWrap.classList.remove('fade');
  }, 180);
}

function initProductZoom() {
  const img = document.getElementById('productMainImage');
  const wrap = document.getElementById('productMainWrap');
  const lens = document.getElementById('zoomLens');
  if (!img || !wrap || !lens) return;
  const setLensImage = () => {
    lens.style.backgroundImage = `url('${img.src}')`;
    lens.style.backgroundSize = '200% 200%';
  };
  setLensImage();
  const onMove = (e) => {
    const rect = wrap.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const lw = lens.offsetWidth;
    const lh = lens.offsetHeight;
    const left = Math.max(0, Math.min(x - lw / 2, rect.width - lw));
    const top = Math.max(0, Math.min(y - lh / 2, rect.height - lh));
    lens.style.left = `${left}px`;
    lens.style.top = `${top}px`;
    const xp = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const yp = Math.max(0, Math.min(100, (y / rect.height) * 100));
    lens.style.backgroundPosition = `${xp}% ${yp}%`;
  };
  wrap.addEventListener('mouseenter', () => { lens.style.display = 'block'; });
  wrap.addEventListener('mousemove', onMove, { passive: true });
  wrap.addEventListener('mouseleave', () => { lens.style.display = 'none'; });
}

// Admin
const ADMIN_KEY = 'lafamilia_admin';
const PRODUCTS_KEY = 'lafamilia_products';
const PRODUCTS_UPDATED_KEY = 'lafamilia_products_updated_at';

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
    { id: 'bag', name: 'Leather Bag', price: 249, image: 'Images/Bag.jpg', images: ['Images/Bag.jpg'], desc: 'Handcrafted bag with gold accents.', variants: [{size:'S',color:'Black',stock:3},{size:'M',color:'Black',stock:5}], collections: ['Bags'] },
    { id: 'sneaker', name: 'Urban Sneaker', price: 179, image: 'Images/sneaker.jpg', images: ['Images/sneaker.jpg'], desc: 'Premium sole with street-ready design.', variants: [{size:'M',color:'White',stock:8}], collections: ['Limited Editions'] },
    { id: 'jeans', name: 'Tailored Jeans', price: 139, image: 'Images/Jeans.jpg', images: ['Images/Jeans.jpg'], desc: 'Contemporary fit with classic durability.', variants: [{size:'L',color:'Indigo',stock:6}], collections: ['Accessories'] },
    { id: 'sweater', name: 'Luxury Sweater', price: 159, image: 'Images/sweater.jpg', images: ['Images/sweater.jpg'], desc: 'Soft-touch knit with gold accent detail.', variants: [{size:'M',color:'Gold',stock:2}], collections: ['Lookbook'] }
  ];
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(seed));
  return seed;
}

function saveProducts(products) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  localStorage.setItem(PRODUCTS_UPDATED_KEY, String(Date.now()));
}

function renderAdminProducts() {
  const container = document.getElementById('adminProducts');
  if (!container) return;
  const products = loadProducts();
  renderAdminStats(products);
  container.innerHTML = '';
  products.forEach(p => {
    const row = document.createElement('div');
    row.className = 'flex items-center gap-3 border rounded-lg p-3';
    row.setAttribute('data-id', p.id);
    row.innerHTML = `
      <img src="${p.image}" alt="${p.name}" class="w-14 h-14 object-cover rounded" />
      <div class="flex-1">
        <div class="font-semibold">${p.name}</div>
        <div class="text-sm text-gray-600">${formatCurrency(p.price)} • <span class="text-gray-500">${p.id}</span></div>
        <div class="mt-1 text-xs text-gray-500">${Array.isArray(p.collections) ? p.collections.join(' • ') : ''}</div>
        <div class="mt-1 text-xs text-gray-500">Variants: ${Array.isArray(p.variants) ? p.variants.length : 0}</div>
      </div>
      <div class="flex items-center gap-2">
        <button class="px-3 py-2 rounded border" data-edit="${p.id}">Edit</button>
        <button class="px-3 py-2 rounded border" data-dup="${p.id}">Duplicate</button>
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
  container.querySelectorAll('[data-dup]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-dup');
      duplicateProduct(id);
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
  initProductSorting();
}

function getProductsUpdatedAt() {
  const ts = Number(localStorage.getItem(PRODUCTS_UPDATED_KEY) || '0');
  return ts > 0 ? new Date(ts) : null;
}

function renderAdminStats(products) {
  const countEl = document.getElementById('statProductCount');
  const updatedEl = document.getElementById('statLastUpdated');
  const imagesEl = document.getElementById('statTotalImages');
  const stockEl = document.getElementById('statTotalStock');
  const soldEl = document.getElementById('statSoldUnits');
  const lowEl = document.getElementById('statLowStock');
  const count = Array.isArray(products) ? products.length : 0;
  const totalImages = Array.isArray(products) ? products.reduce((sum, p) => {
    const imgs = (p.images && p.images.length) ? p.images.length : (p.image ? 1 : 0);
    return sum + imgs;
  }, 0) : 0;
  const totalStock = Array.isArray(products) ? products.reduce((sum, p) => {
    const vs = Array.isArray(p.variants) ? p.variants : [];
    return sum + vs.reduce((s, v) => s + (Number(v.stock) || 0), 0);
  }, 0) : 0;
  const lowStock = Array.isArray(products) ? products.reduce((sum, p) => {
    const vs = Array.isArray(p.variants) ? p.variants : [];
    return sum + vs.filter(v => (Number(v.stock) || 0) <= 2).length;
  }, 0) : 0;
  const updatedAt = getProductsUpdatedAt();
  if (countEl) countEl.textContent = String(count);
  if (imagesEl) imagesEl.textContent = String(totalImages);
  if (stockEl) stockEl.textContent = String(totalStock);
  try {
    if (soldEl) soldEl.textContent = String(Number(localStorage.getItem(SALES_KEY) || '0'));
  } catch {}
  if (lowEl) lowEl.textContent = String(lowStock);
  if (updatedEl) {
    updatedEl.textContent = updatedAt ? updatedAt.toLocaleString() : '—';
  }
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
  const variantList = document.getElementById('variantList');
  const cols = getCollectionCheckboxes();
  if (idHidden) idHidden.value = p.id;
  if (idEl) idEl.value = p.id;
  if (nameEl) nameEl.value = p.name;
  if (priceEl) priceEl.value = p.price;
  if (descEl) descEl.value = p.desc || '';
  if (cols) setCollectionsToForm(cols, Array.isArray(p.collections) ? p.collections : []);
  if (variantList) {
    variantList.innerHTML = '';
    const variants = Array.isArray(p.variants) ? p.variants : [];
    if (variants.length === 0) addVariantRow();
    variants.forEach(v => addVariantRow(v));
  }
  if (preview) {
    preview.innerHTML = '';
    const imgs = p.images && p.images.length ? p.images : (p.image ? [p.image] : []);
    imgs.forEach(u => {
      const img = document.createElement('img');
      img.src = u;
      img.className = 'w-16 h-16 object-cover rounded border';
      img.loading = 'lazy';
      img.decoding = 'async';
      preview.appendChild(img);
    });
    initImagePreviewSorting();
  }
}

function resetProductForm() {
  const form = document.getElementById('productForm');
  const idHidden = document.getElementById('productIdHidden');
  if (idHidden) idHidden.value = '';
  if (form) form.reset();
  const preview = document.getElementById('imagePreview');
  if (preview) preview.innerHTML = '';
  const variantList = document.getElementById('variantList');
  if (variantList) variantList.innerHTML = '';
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
  const addVariantBtn = document.getElementById('addVariantBtn');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const products = loadProducts();
    const editingId = idHidden ? idHidden.value : '';
    const existing = editingId ? products.find(p => p.id === editingId) : null;
    const selectedImages = await readSelectedImages(imagesEl);
    const imagesFromPreview = readImagePreviewOrder();
    const variants = readVariantsFromForm();
    const collections = readCollectionsFromForm();
    const payload = {
      id: idEl ? idEl.value.trim() : '',
      name: nameEl ? nameEl.value.trim() : '',
      price: priceEl ? Number(priceEl.value) : 0,
      images: (selectedImages.length ? selectedImages : (imagesFromPreview.length ? imagesFromPreview : (existing && existing.images ? existing.images : (existing && existing.image ? [existing.image] : [])))),
      image: (selectedImages.length ? selectedImages[0] : (imagesFromPreview.length ? imagesFromPreview[0] : (existing && existing.image ? existing.image : ''))),
      desc: descEl ? descEl.value.trim() : ''
    };
    payload.variants = variants;
    payload.collections = collections;
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
          img.loading = 'lazy';
          img.decoding = 'async';
          preview.appendChild(img);
        });
        initImagePreviewSorting();
      }
    });
  }
  if (addVariantBtn) addVariantBtn.addEventListener('click', () => addVariantRow());
  // Initialize with one row
  addVariantRow();
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
      <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded" loading="lazy" decoding="async" sizes="80px" />
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
  injectGlobalTypography();
  injectUXStyles();
  defineProductCard();
  initNav();
  initButtons();
  initFloatingCartBubble();
  initPageTransitions();
  initSplide();
  initHeroLetters();
  initScrollReveal();
  initParallax();
  updateCartCount();
  renderCartSidebar();
  initYear();
  renderCartPage();
  initAdminLogin();
  initAdminGuard();
  initAdminLogout();
  initAdminDashboard();
  renderShopGrid();
  renderProductDetail();
  initProductAccordion();
  initProductZoom();
  initRipple();
});

function initProductAccordion() {
  document.querySelectorAll('.accordion-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = btn.nextElementSibling;
      const isOpen = panel && !panel.classList.contains('hidden');
      document.querySelectorAll('.accordion-panel').forEach(p => p.classList.add('hidden'));
      document.querySelectorAll('.accordion-trigger').forEach(b => b.classList.remove('open'));
      if (!isOpen && panel) {
        panel.classList.remove('hidden');
        btn.classList.add('open');
      }
    });
  });
}
function getCollectionCheckboxes() {
  return {
    bags: document.getElementById('colBags'),
    accessories: document.getElementById('colAccessories'),
    limited: document.getElementById('colLimited'),
    lookbook: document.getElementById('colLookbook'),
  };
}

function readCollectionsFromForm() {
  const c = getCollectionCheckboxes();
  const cols = [];
  if (c.bags && c.bags.checked) cols.push('Bags');
  if (c.accessories && c.accessories.checked) cols.push('Accessories');
  if (c.limited && c.limited.checked) cols.push('Limited Editions');
  if (c.lookbook && c.lookbook.checked) cols.push('Lookbook');
  return cols;
}

function setCollectionsToForm(c, values) {
  const v = Array.isArray(values) ? values : [];
  if (c.bags) c.bags.checked = v.includes('Bags');
  if (c.accessories) c.accessories.checked = v.includes('Accessories');
  if (c.limited) c.limited.checked = v.includes('Limited Editions');
  if (c.lookbook) c.lookbook.checked = v.includes('Lookbook');
}

function addVariantRow(v) {
  const list = document.getElementById('variantList');
  if (!list) return;
  const row = document.createElement('div');
  row.className = 'flex items-center gap-2';
  const sizeVal = v && v.size ? v.size : 'S';
  const colorVal = v && v.color ? v.color : '';
  const stockVal = v && v.stock != null ? v.stock : 0;
  row.innerHTML = `
    <select class="border rounded px-2 py-2 variant-size">
      <option ${sizeVal==='S'?'selected':''}>S</option>
      <option ${sizeVal==='M'?'selected':''}>M</option>
      <option ${sizeVal==='L'?'selected':''}>L</option>
    </select>
    <input type="text" class="border rounded px-2 py-2 flex-1 variant-color" placeholder="Color" value="${colorVal}"/>
    <input type="number" min="0" class="border rounded px-2 py-2 w-24 variant-stock" placeholder="Stock" value="${stockVal}"/>
    <button type="button" class="px-3 py-2 rounded border text-red-600 variant-remove">Remove</button>
  `;
  list.appendChild(row);
  row.querySelector('.variant-remove').addEventListener('click', () => {
    row.remove();
  });
}

function readVariantsFromForm() {
  const list = document.getElementById('variantList');
  if (!list) return [];
  const rows = Array.from(list.children);
  return rows.map(r => ({
    size: r.querySelector('.variant-size')?.value || 'S',
    color: r.querySelector('.variant-color')?.value || '',
    stock: Number(r.querySelector('.variant-stock')?.value || '0'),
  }));
}

function initProductSorting() {
  const container = document.getElementById('adminProducts');
  if (!container || !window.Sortable) return;
  new Sortable(container, {
    animation: 150,
    onEnd: () => saveNewOrder(),
  });
}

function saveNewOrder() {
  const container = document.getElementById('adminProducts');
  if (!container) return;
  const ids = Array.from(container.children).map(el => el.getAttribute('data-id')).filter(Boolean);
  const products = loadProducts();
  const byId = new Map(products.map(p => [p.id, p]));
  const reordered = ids.map(id => byId.get(id)).filter(Boolean);
  // Append any products not in the list just in case
  products.forEach(p => { if (!ids.includes(p.id)) reordered.push(p); });
  saveProducts(reordered);
  renderAdminProducts();
}

function duplicateProduct(id) {
  const products = loadProducts();
  const p = products.find(x => x.id === id);
  if (!p) return;
  let newId = prompt('Enter new ID for duplicate', `${id}-copy`);
  if (!newId) return;
  if (products.some(x => x.id === newId)) {
    alert('ID already exists. Choose a unique ID.');
    return;
  }
  const copy = { ...p, id: newId };
  products.push(copy);
  saveProducts(products);
  renderAdminProducts();
}

function initImagePreviewSorting() {
  const preview = document.getElementById('imagePreview');
  if (!preview || !window.Sortable) return;
  new Sortable(preview, { animation: 150 });
}

function readImagePreviewOrder() {
  const preview = document.getElementById('imagePreview');
  if (!preview) return [];
  return Array.from(preview.querySelectorAll('img')).map(img => img.src);
}
