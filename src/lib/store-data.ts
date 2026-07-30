// Edit these to customize your store
export const STORE = {
  name: "Prime Imports",
  tagline: "Imported. Curated. Delivered.",
  whatsapp: "+233200000000", // <-- change to your WhatsApp number (with country code, no spaces)
  currency: "GH₵",
  payment: {
    provider: "Paystack",
    // A Paystack checkout URL or payment slug. Replace with your store's Paystack pay link.
    checkoutUrl: "https://paystack.com/pay/your_paystack_slug",
    name: "Prime Imports",
    note: "Complete payment using Paystack then confirm your order on WhatsApp.",
  },
};

export type PaymentRecord = {
  id: string;
  productId: string;
  amount: number;
  provider: string;
  status: string;
  date: string;
  note?: string;
  payerName?: string;
  payerEmail?: string;
};

export function updatePaymentStatus(id: string, status: string) {
  const p = PAYMENTS.find(x => x.id === id);
  if (p) p.status = status;
  return p;
}

export const PAYMENTS: PaymentRecord[] = [];

export function updateProductPrice(id: string, price: number) {
  const p = PRODUCTS.find(x => x.id === id);
  if (p) p.price = price;
  return p;
}

export function updateProduct(product: Product) {
  const idx = PRODUCTS.findIndex(x => x.id === product.id);
  if (idx >= 0) PRODUCTS[idx] = product;
  return PRODUCTS[idx];
}

export function addPayment(rec: PaymentRecord) {
  PAYMENTS.push(rec);
}

export function addProduct(product: Product) {
  // generate a simple unique id if missing
  if (!product.id) product.id = `p${Date.now()}`;
  PRODUCTS.push(product);
  return product;
}

export function removeProduct(id: string) {
  const idx = PRODUCTS.findIndex(p => p.id === id);
  if (idx >= 0) PRODUCTS.splice(idx, 1);
}

export type StoreSettings = {
  name: string;
  tagline: string;
  whatsapp: string;
  currency: string;
  paymentProvider: string;
  checkoutUrl: string;
};

export function updateStoreSettings(settings: StoreSettings) {
  STORE.name = settings.name;
  STORE.tagline = settings.tagline;
  STORE.whatsapp = settings.whatsapp;
  STORE.currency = settings.currency;
  STORE.payment.provider = settings.paymentProvider;
  STORE.payment.name = settings.name;
  (STORE.payment as { checkoutUrl: string }).checkoutUrl = settings.checkoutUrl;
}

export function getStoreStats() {
  const inStock = PRODUCTS.filter(p => p.status === "in-stock").length;
  const preStock = PRODUCTS.filter(p => p.status === "pre-stock").length;
  const inventoryValue = PRODUCTS.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
  const categoriesUsed = new Set(PRODUCTS.map(p => p.category)).size;
  const revenue = PAYMENTS.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  return {
    total: PRODUCTS.length,
    inStock,
    preStock,
    inventoryValue,
    categoriesUsed,
    payments: PAYMENTS.length,
    revenue,
  };
}

export type StockStatus = "in-stock" | "pre-stock";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  status: StockStatus;
  eta?: string;
  emoji: string;
  image: string;
  hue: number;
  tag?: string;
};

export const CATEGORIES = [
  { id: "iphones", name: "iPhones", emoji: "📱", desc: "Latest Apple devices" },
  { id: "laptops", name: "Laptops", emoji: "💻", desc: "Pro & ultra books" },
  { id: "shoes", name: "Shoes", emoji: "👟", desc: "Sneakers & more" },
  { id: "shirts", name: "Shirts", emoji: "👕", desc: "Tees, polos, designer" },
  { id: "machines", name: "Machines", emoji: "⚙️", desc: "Industrial & home" },
  { id: "kids", name: "Kids Items", emoji: "🧸", desc: "For the little ones" },
  { id: "grownup", name: "Grown-up Items", emoji: "🎁", desc: "Lifestyle goods" },
  { id: "accessories", name: "Accessories", emoji: "🎧", desc: "Gear & extras" },
];

// Using SVG data URIs with colors that will always work
const colors = ['FF6B6B', '4ECDC4', '45B7D1', 'FFA07A', '98D8C8', 'F7DC6F', 'BB8FCE', '85C1E2'];
const img = (id: string) => {
  const colorIndex = id.charCodeAt(0) % colors.length;
  const bgColor = colors[colorIndex];
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%23${bgColor}' width='800' height='600'/%3E%3C/svg%3E`;
};

export const PRODUCTS: Product[] = [
  // iPhones — verified Apple product shots
  { id: "p1", name: "iPhone 15 Pro Max 256GB", category: "iphones", price: 16500, status: "in-stock", emoji: "📱", hue: 280, tag: "Bestseller", image: img("photo-1695048133142-1a20484d2569") },
  { id: "p2", name: "iPhone 16 Pro 128GB", category: "iphones", price: 17500, status: "pre-stock", eta: "Arrives in 7 days", emoji: "📱", hue: 200, tag: "New", image: img("photo-1592286927505-1def25115558") },
  { id: "p3", name: "iPhone 14 Plus 128GB", category: "iphones", price: 9500, status: "in-stock", emoji: "📱", hue: 250, image: img("photo-1678685888221-cda773a3dcdb") },
  { id: "p30", name: "iPhone 13 Pro 256GB", category: "iphones", price: 8200, status: "in-stock", emoji: "📱", hue: 290, image: img("photo-1632661674596-df8be070a5c5") },
  { id: "p31", name: "iPhone 6s 64GB", category: "iphones", price: 1200, status: "in-stock", emoji: "📱", hue: 20, image: img("photo-1517336714731-489689fd1ca8") },
  { id: "p32", name: "iPhone 6s Plus 64GB", category: "iphones", price: 1350, status: "in-stock", emoji: "📱", hue: 30, image: img("photo-1526045612212-70caf35c14df") },
  { id: "p33", name: "iPhone 7 128GB", category: "iphones", price: 1700, status: "in-stock", emoji: "📱", hue: 40, image: img("photo-1512496015851-a90fb38ba796") },
  { id: "p34", name: "iPhone 7 Plus 128GB", category: "iphones", price: 1900, status: "in-stock", emoji: "📱", hue: 50, image: img("photo-1509395176047-4a66953fd231") },
  { id: "p35", name: "iPhone 8 64GB", category: "iphones", price: 2200, status: "in-stock", emoji: "📱", hue: 60, image: img("photo-1503602642458-232111445657") },
  { id: "p36", name: "iPhone 8 Plus 64GB", category: "iphones", price: 2400, status: "in-stock", emoji: "📱", hue: 70, image: img("photo-1516259762381-22954d7d3ad2") },
  { id: "p37", name: "iPhone X 64GB", category: "iphones", price: 3800, status: "in-stock", emoji: "📱", hue: 80, image: img("photo-1518770660439-4636190af475") },
  { id: "p38", name: "iPhone XR 128GB", category: "iphones", price: 4200, status: "in-stock", emoji: "📱", hue: 90, image: img("photo-1481277542470-605612bd2d61") },
  { id: "p39", name: "iPhone XS 256GB", category: "iphones", price: 6100, status: "in-stock", emoji: "📱", hue: 100, image: img("photo-1511707171634-5f897ff02aa9") },
  { id: "p40", name: "iPhone 11 128GB", category: "iphones", price: 7200, status: "in-stock", emoji: "📱", hue: 110, image: img("photo-1511707171634-5f897ff02aa9") },
  { id: "p41", name: "iPhone 12 128GB", category: "iphones", price: 8900, status: "in-stock", emoji: "📱", hue: 120, image: img("photo-1512496015851-a90fb38ba796") },
  { id: "p42", name: "iPhone 13 128GB", category: "iphones", price: 9800, status: "in-stock", emoji: "📱", hue: 130, image: img("photo-1509395176047-4a66953fd231") },
  { id: "p43", name: "iPhone 15 128GB", category: "iphones", price: 13800, status: "in-stock", emoji: "📱", hue: 140, image: img("photo-1503602642458-232111445657") },
  { id: "p44", name: "iPhone 15 Pro 256GB", category: "iphones", price: 15500, status: "in-stock", emoji: "📱", hue: 150, image: img("photo-1517336714731-489689fd1ca8") },
  { id: "p45", name: "iPhone 17 Pro Max 512GB", category: "iphones", price: 19800, status: "pre-stock", eta: "Arrives in 10 days", emoji: "📱", hue: 160, tag: "Pre-order", image: img("photo-1593642632559-0c6d3fc62b89") },

  // Laptops
  { id: "p4", name: "MacBook Pro M3 14\"", category: "laptops", price: 28500, status: "in-stock", emoji: "💻", hue: 260, tag: "Hot", image: img("photo-1517336714731-489689fd1ca8") },
  { id: "p5", name: "Dell XPS 15 OLED", category: "laptops", price: 21500, status: "pre-stock", eta: "Arrives in 14 days", emoji: "💻", hue: 220, image: img("photo-1593642632559-0c6d3fc62b89") },
  { id: "p6", name: "HP Spectre x360", category: "laptops", price: 16800, status: "in-stock", emoji: "💻", hue: 230, image: img("photo-1496181133206-80ce9b88a853") },

  // Shoes
  { id: "p7", name: "Nike Air Force 1", category: "shoes", price: 1200, status: "in-stock", emoji: "👟", hue: 200, tag: "Trending", image: img("photo-1542291026-7eec264c27ff") },
  { id: "p8", name: "Adidas Yeezy 350", category: "shoes", price: 2800, status: "in-stock", emoji: "👟", hue: 30, image: img("photo-1600185365926-3a2ce3cdb9eb") },
  { id: "p9", name: "Jordan 1 Retro High", category: "shoes", price: 2400, status: "pre-stock", eta: "Arrives in 10 days", emoji: "👟", hue: 0, image: img("photo-1556906781-9a412961c28c") },
  { id: "p10", name: "New Balance 550", category: "shoes", price: 1650, status: "in-stock", emoji: "👟", hue: 50, image: img("photo-1539185441755-769473a23570") },
  { id: "p11", name: "Timberland Boots", category: "shoes", price: 1900, status: "pre-stock", eta: "Arrives in 14 days", emoji: "🥾", hue: 40, image: img("photo-1542838132-92c53300491e") },

  // Shirts
  { id: "p12", name: "Designer Hoodie Premium", category: "shirts", price: 450, status: "in-stock", emoji: "🧥", hue: 320, image: img("photo-1556821840-3a63f95609a7") },
  { id: "p13", name: "Italian Leather Jacket", category: "shirts", price: 1850, status: "pre-stock", eta: "Arrives in 21 days", emoji: "🧥", hue: 10, image: img("photo-1551028719-00167b16eac5") },
  { id: "p14", name: "Polo Ralph Lauren Tee", category: "shirts", price: 320, status: "in-stock", emoji: "👕", hue: 180, image: img("photo-1521572163474-6864f9cf17ab") },
  { id: "p15", name: "Champion Sweatshirt", category: "shirts", price: 380, status: "in-stock", emoji: "👕", hue: 220, image: img("photo-1620799140408-edc6dcb6d633") },
  { id: "p16", name: "Tommy Hilfiger Shirt", category: "shirts", price: 420, status: "pre-stock", eta: "Arrives in 12 days", emoji: "👔", hue: 240, image: img("photo-1602810318383-e386cc2a3ccf") },

  // Machines
  { id: "p17", name: "Industrial Sewing Machine", category: "machines", price: 9500, status: "in-stock", emoji: "⚙️", hue: 30, image: img("photo-1581092335397-9583eb92d232") },
  { id: "p18", name: "Coffee Espresso Pro", category: "machines", price: 4800, status: "pre-stock", eta: "Arrives in 10 days", emoji: "☕", hue: 20, image: img("photo-1610889556528-9a770e32642f") },
  { id: "p19", name: "Stand Mixer Deluxe", category: "machines", price: 3200, status: "in-stock", emoji: "🍳", hue: 340, image: img("photo-1578643463396-0997cb5328c1") },

  // Kids
  { id: "p20", name: "Kids Smart Watch", category: "kids", price: 350, status: "in-stock", emoji: "⌚", hue: 180, image: img("photo-1544117519-31a4b719223d") },
  { id: "p21", name: "Educational Robot Toy", category: "kids", price: 680, status: "pre-stock", eta: "Arrives in 12 days", emoji: "🤖", hue: 150, image: img("photo-1535378917042-10a22c95931a") },
  { id: "p22", name: "LEGO Star Wars Set", category: "kids", price: 850, status: "in-stock", emoji: "🧱", hue: 60, image: img("photo-1587654780291-39c9404d746b") },

  // Grownup
  { id: "p23", name: "Premium Wallet Set", category: "grownup", price: 520, status: "in-stock", emoji: "👜", hue: 40, image: img("photo-1627123424574-724758594e93") },
  { id: "p24", name: "Luxury Fragrance Bundle", category: "grownup", price: 1250, status: "pre-stock", eta: "Arrives in 9 days", emoji: "🧴", hue: 340, image: img("photo-1541643600914-78b084683601") },
  { id: "p25", name: "Rolex-style Watch", category: "grownup", price: 2800, status: "in-stock", emoji: "⌚", hue: 50, image: img("photo-1523275335684-37898b6baf30") },

  // Accessories
  { id: "p26", name: "Sony WH-1000XM5", category: "accessories", price: 3850, status: "in-stock", emoji: "🎧", hue: 250, tag: "Trending", image: img("photo-1583394838336-acd977736f90") },
  { id: "p27", name: "AirPods Pro 2 USB-C", category: "accessories", price: 2800, status: "pre-stock", eta: "Arrives in 5 days", emoji: "🎧", hue: 290, image: img("photo-1606841837239-c5a1a4a07af7") },
  { id: "p28", name: "Apple Watch Ultra 2", category: "accessories", price: 8500, status: "in-stock", emoji: "⌚", hue: 20, image: img("photo-1546868871-7041f2a55e12") },
  { id: "p29", name: "Ray-Ban Aviators", category: "accessories", price: 950, status: "in-stock", emoji: "🕶️", hue: 60, image: img("photo-1572635196237-14b3f281503f") },
];

export function formatPrice(n: number) {
  return `${STORE.currency} ${n.toLocaleString()}`;
}

export function whatsappLink(p: Product) {
  const msg = `Hi ${STORE.name}! I'd like to order:%0A%0A*${p.name}*%0APrice: ${formatPrice(p.price)}%0AStatus: ${p.status === "in-stock" ? "In Stock" : "Pre-Order"}%0AID: ${p.id}%0A%0AIs it available?`;
  const phone = STORE.whatsapp.replace(/[^\d]/g, "");
  return `https://wa.me/${phone}?text=${msg}`;
}


// --- Categories ---
export function addCategory(cat: { id: string; name: string; emoji: string; desc: string }) {
  if (CATEGORIES.find(c => c.id === cat.id)) return null;
  CATEGORIES.push(cat);
  return cat;
}

// --- Sub-admin requests (mock, in-memory placeholder until wired to backend) ---
export type SubAdminRequest = {
  id: string;
  username: string;
  email: string;
  password: string;
  roleRequested: string;
  date: string;
  status: "pending" | "approved" | "rejected";
};

export const SUB_ADMIN_REQUESTS: SubAdminRequest[] = [];

export function createSubAdminRequest(input: Omit<SubAdminRequest, "id" | "status">) {
  const request: SubAdminRequest = {
    id: `req${Date.now()}`,
    status: "pending",
    ...input,
  };
  SUB_ADMIN_REQUESTS.push(request);
  return request;
}

export function approveSubAdmin(id: string) {
  const r = SUB_ADMIN_REQUESTS.find(x => x.id === id);
  if (r) r.status = "approved";
  return r;
}

export function rejectSubAdmin(id: string) {
  const r = SUB_ADMIN_REQUESTS.find(x => x.id === id);
  if (r) r.status = "rejected";
  return r;
}

// --- Promotions ---
export type Promotion = {
  id: string;
  title: string;
  productIds: string[];
  discountPercent: number;
  active: boolean;
};

export const PROMOTIONS: Promotion[] = [];

export function addPromotion(promo: Omit<Promotion, "id">) {
  const record: Promotion = { id: `promo${Date.now()}`, ...promo };
  PROMOTIONS.push(record);
  return record;
}

export function removePromotion(id: string) {
  const idx = PROMOTIONS.findIndex(p => p.id === id);
  if (idx >= 0) PROMOTIONS.splice(idx, 1);
}

export function togglePromotion(id: string) {
  const p = PROMOTIONS.find(x => x.id === id);
  if (p) p.active = !p.active;
  return p;
}

// --- Analysis metrics ---
export function getAnalysisMetrics(days: number) {
  const inStock = PRODUCTS.filter(p => p.status === "in-stock").length;
  const preStock = PRODUCTS.filter(p => p.status === "pre-stock").length;
  const completedPayments = PAYMENTS.filter(p => p.status === "completed" || p.status === "success").length;
  const pendingPayments = PAYMENTS.filter(p => p.status === "pending").length;

  const dayBuckets: { date: string; amount: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toISOString().slice(0, 10);
    const amount = PAYMENTS
      .filter(p => p.date?.slice(0, 10) === label)
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    dayBuckets.push({ date: label, amount });
  }

  return {
    totalProducts: PRODUCTS.length,
    inStock,
    preStock,
    totalPayments: PAYMENTS.length,
    completedPayments,
    pendingPayments,
    paymentsByDay: dayBuckets,
    subAdminPending: SUB_ADMIN_REQUESTS.filter(r => r.status === "pending").length,
  };
}
