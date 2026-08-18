import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "./api-config";
import type { Product, StockStatus } from "./store-data";

export type Category = {
  id: string;
  name: string;
  emoji: string;
  desc: string;
};

type RawProduct = {
  id: number;
  name: string;
  category: string;
  category_name: string;
  price: string;
  status: StockStatus;
  eta: string | null;
  emoji: string;
  image: string | null;
  hue: number;
  tag: string | null;
};

/*
|--------------------------------------------------------------------------
| LOCAL DEVELOPMENT MODE
|--------------------------------------------------------------------------
|
| When VITE_USE_LOCAL_DATA=true, the frontend uses the sample products
| below instead of calling the backend API.
|
| This allows us to work on the frontend independently.
|
*/

const USE_LOCAL_DATA =
  import.meta.env.VITE_USE_LOCAL_DATA === "true";

/*
|--------------------------------------------------------------------------
| LOCAL CATEGORIES
|--------------------------------------------------------------------------
*/

const LOCAL_CATEGORIES: Category[] = [
  {
    id: "iphones",
    name: "iPhones",
    emoji: "📱",
    desc: "Latest Apple iPhone models",
  },
  {
    id: "laptops",
    name: "Laptops",
    emoji: "💻",
    desc: "Laptops for work, school and gaming",
  },
  {
    id: "fashion",
    name: "Fashion",
    emoji: "👕",
    desc: "Clothing, sneakers and accessories",
  },
  {
    id: "electronics",
    name: "Electronics",
    emoji: "🎧",
    desc: "Headphones, gadgets and smart devices",
  },
  {
    id: "home",
    name: "Home",
    emoji: "🏠",
    desc: "Useful products for your home",
  },
];

/*
|--------------------------------------------------------------------------
| LOCAL PRODUCTS
|--------------------------------------------------------------------------
|
| These products are only for frontend development.
| Later the real backend products will replace them automatically.
|
*/

const LOCAL_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "iPhone 16 Pro Max",
    category: "iphones",
    price: 18900,
    status: "in-stock",
    emoji: "📱",
    image:
      "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&w=900&q=80",
    hue: 250,
    tag: "Popular",
  },
  {
    id: "2",
    name: "iPhone 16 Pro",
    category: "iphones",
    price: 16500,
    status: "pre-stock",
    eta: "Arrives in 2–3 weeks",
    emoji: "📱",
    image:
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=80",
    hue: 220,
    tag: "Preorder",
  },
  {
    id: "3",
    name: "MacBook Air M3",
    category: "laptops",
    price: 17500,
    status: "in-stock",
    emoji: "💻",
    image:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
    hue: 200,
    tag: "New",
  },
  {
    id: "4",
    name: "MacBook Pro 14",
    category: "laptops",
    price: 24500,
    status: "pre-stock",
    eta: "Arrives in 3–4 weeks",
    emoji: "💻",
    image:
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=900&q=80",
    hue: 210,
    tag: "Premium",
  },
  {
    id: "5",
    name: "AirPods Pro",
    category: "electronics",
    price: 3200,
    status: "in-stock",
    emoji: "🎧",
    image:
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=900&q=80",
    hue: 180,
    tag: "Best seller",
  },
  {
    id: "6",
    name: "Sony Wireless Headphones",
    category: "electronics",
    price: 4800,
    status: "pre-stock",
    eta: "Arrives in 2 weeks",
    emoji: "🎧",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    hue: 190,
    tag: "Preorder",
  },
  {
    id: "7",
    name: "Nike Air Sneakers",
    category: "fashion",
    price: 1850,
    status: "in-stock",
    emoji: "👟",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    hue: 350,
    tag: "Trending",
  },
  {
    id: "8",
    name: "Premium Hoodie",
    category: "fashion",
    price: 750,
    status: "pre-stock",
    eta: "Arrives in 2–3 weeks",
    emoji: "👕",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80",
    hue: 280,
    tag: "New",
  },
  {
    id: "9",
    name: "Smart LED Desk Lamp",
    category: "home",
    price: 650,
    status: "in-stock",
    emoji: "💡",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
    hue: 45,
    tag: "Useful",
  },
  {
    id: "10",
    name: "Portable Blender",
    category: "home",
    price: 520,
    status: "pre-stock",
    eta: "Arrives in 3 weeks",
    emoji: "🏠",
    image:
      "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=900&q=80",
    hue: 120,
    tag: "Preorder",
  },
];

/*
|--------------------------------------------------------------------------
| PLACEHOLDER IMAGES
|--------------------------------------------------------------------------
*/

const PLACEHOLDER_COLORS = [
  "FF6B6B",
  "4ECDC4",
  "45B7D1",
  "FFA07A",
  "98D8C8",
  "F7DC6F",
  "BB8FCE",
  "85C1E2",
];

function placeholderImage(seed: string) {
  const firstCharacter = seed.charCodeAt(0) || 0;

  const colorIndex =
    firstCharacter % PLACEHOLDER_COLORS.length;

  const bgColor =
    PLACEHOLDER_COLORS[colorIndex];

  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%23${bgColor}' width='800' height='600'/%3E%3C/svg%3E`;
}

/*
|--------------------------------------------------------------------------
| TRANSFORM BACKEND PRODUCT
|--------------------------------------------------------------------------
*/

function transformProduct(
  raw: RawProduct,
): Product {
  return {
    id: String(raw.id),
    name: raw.name,
    category: raw.category,
    price: Number(raw.price),
    status: raw.status,
    eta: raw.eta ?? undefined,
    emoji: raw.emoji,
    image:
      raw.image ||
      placeholderImage(
        raw.name || String(raw.id),
      ),
    hue: raw.hue,
    tag: raw.tag ?? undefined,
  };
}

/*
|--------------------------------------------------------------------------
| PRODUCTS
|--------------------------------------------------------------------------
*/

async function fetchProducts(): Promise<
  Product[]
> {
  // Frontend-only local development
  if (USE_LOCAL_DATA) {
    return LOCAL_PRODUCTS;
  }

  const res = await fetch(
    `${API_BASE_URL}/products/`,
  );

  if (!res.ok) {
    throw new Error(
      "Failed to load products",
    );
  }

  const data: RawProduct[] =
    await res.json();

  return data.map(transformProduct);
}

export function useProducts() {
  return useQuery({
    queryKey: [
      "catalog-products",
      USE_LOCAL_DATA ? "local" : "api",
    ],
    queryFn: fetchProducts,
    staleTime: 60_000,
  });
}

/*
|--------------------------------------------------------------------------
| CATEGORIES
|--------------------------------------------------------------------------
*/

async function fetchCategories(): Promise<
  Category[]
> {
  // Frontend-only local development
  if (USE_LOCAL_DATA) {
    return LOCAL_CATEGORIES;
  }

  const res = await fetch(
    `${API_BASE_URL}/categories/`,
  );

  if (!res.ok) {
    throw new Error(
      "Failed to load categories",
    );
  }

  return res.json();
}

export async function getCategories(): Promise<
  Category[]
> {
  return fetchCategories();
}

export function useCategories() {
  return useQuery({
    queryKey: [
      "catalog-categories",
      USE_LOCAL_DATA ? "local" : "api",
    ],
    queryFn: fetchCategories,
    staleTime: 60_000,
  });
}

/*
|--------------------------------------------------------------------------
| SITE SETTINGS
|--------------------------------------------------------------------------
*/

export type SiteSettings = {
  name: string;
  tagline: string;
  whatsapp: string;
  currency: string;
  currency_code: string;
  payment_provider: string;
  checkout_url: string;
};

const LOCAL_SITE_SETTINGS: SiteSettings = {
  name: "Prime Imports",
  tagline:
    "Imported products delivered with style.",
  whatsapp: "",
  currency: "GH₵",
  currency_code: "GHS",
  payment_provider: "Paystack",
  checkout_url: "",
};

export async function fetchSiteSettings(): Promise<
  SiteSettings
> {
  if (USE_LOCAL_DATA) {
    return LOCAL_SITE_SETTINGS;
  }

  const res = await fetch(
    `${API_BASE_URL}/site-settings/`,
  );

  if (!res.ok) {
    throw new Error(
      "Failed to load site settings",
    );
  }

  return res.json();
}

export function useSiteSettings() {
  return useQuery({
    queryKey: [
      "site-settings",
      USE_LOCAL_DATA ? "local" : "api",
    ],
    queryFn: fetchSiteSettings,
    staleTime: 60_000,
  });
}

/*
|--------------------------------------------------------------------------
| UPDATE SITE SETTINGS
|--------------------------------------------------------------------------
|
| This stays connected to the real backend.
| Admin updates should not change our local mock data.
|
*/

export async function updateSiteSettingsApi(
  updates: Partial<SiteSettings>,
  accessToken: string,
): Promise<SiteSettings> {
  const res = await fetch(
    `${API_BASE_URL}/site-settings/`,
    {
      method: "PATCH",
      headers: {
        "Content-Type":
          "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(updates),
    },
  );

  if (!res.ok) {
    const data = await res
      .json()
      .catch(() => null);

    throw new Error(
      data?.detail ||
        "Failed to update site settings",
    );
  }

  return res.json();
}

/*
|--------------------------------------------------------------------------
| ALSO BOUGHT
|--------------------------------------------------------------------------
*/

async function fetchAlsoBought(
  productId: number,
): Promise<Product[]> {
  if (USE_LOCAL_DATA) {
    return LOCAL_PRODUCTS.filter(
      (product) =>
        Number(product.id) !== productId,
    ).slice(0, 4);
  }

  const res = await fetch(
    `${API_BASE_URL}/products/${productId}/also-bought/`,
  );

  if (!res.ok) {
    return [];
  }

  const data: RawProduct[] =
    await res.json();

  return data.map(transformProduct);
}

export function useAlsoBought(
  productId: number,
) {
  return useQuery({
    queryKey: [
      "also-bought",
      productId,
      USE_LOCAL_DATA ? "local" : "api",
    ],
    queryFn: () =>
      fetchAlsoBought(productId),
    enabled: Number.isFinite(productId),
    staleTime: 5 * 60_000,
  });
}

/*
|--------------------------------------------------------------------------
| SIMILAR PRODUCTS
|--------------------------------------------------------------------------
*/

async function fetchSimilarProducts(
  productId: number,
): Promise<Product[]> {
  if (USE_LOCAL_DATA) {
    const currentProduct =
      LOCAL_PRODUCTS.find(
        (product) =>
          Number(product.id) === productId,
      );

    if (!currentProduct) {
      return [];
    }

    return LOCAL_PRODUCTS.filter(
      (product) =>
        product.category ===
          currentProduct.category &&
        Number(product.id) !== productId,
    ).slice(0, 4);
  }

  const res = await fetch(
    `${API_BASE_URL}/products/${productId}/similar/`,
  );

  if (!res.ok) {
    return [];
  }

  const data: RawProduct[] =
    await res.json();

  return data.map(transformProduct);
}

export function useSimilarProducts(
  productId: number,
) {
  return useQuery({
    queryKey: [
      "similar-products",
      productId,
      USE_LOCAL_DATA ? "local" : "api",
    ],
    queryFn: () =>
      fetchSimilarProducts(productId),
    enabled: Number.isFinite(productId),
    staleTime: 5 * 60_000,
  });
}