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

const PLACEHOLDER_COLORS = ["FF6B6B", "4ECDC4", "45B7D1", "FFA07A", "98D8C8", "F7DC6F", "BB8FCE", "85C1E2"];

function placeholderImage(seed: string) {
  const colorIndex = seed.charCodeAt(0) % PLACEHOLDER_COLORS.length;
  const bgColor = PLACEHOLDER_COLORS[colorIndex];
  return `data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'800\' height=\'600\'%3E%3Crect fill=\'%23${bgColor}\' width=\'800\' height=\'600\'/%3E%3C/svg%3E`;
}

function transformProduct(raw: RawProduct): Product {
  return {
    id: String(raw.id),
    name: raw.name,
    category: raw.category,
    price: Number(raw.price),
    status: raw.status,
    eta: raw.eta ?? undefined,
    emoji: raw.emoji,
    image: raw.image || placeholderImage(raw.name || String(raw.id)),
    hue: raw.hue,
    tag: raw.tag ?? undefined,
  };
}

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE_URL}/products/`);
  if (!res.ok) {
    throw new Error("Failed to load products");
  }
  const data: RawProduct[] = await res.json();
  return data.map(transformProduct);
}

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE_URL}/categories/`);
  if (!res.ok) {
    throw new Error("Failed to load categories");
  }
  return res.json();
}

export function useProducts() {
  return useQuery({
    queryKey: ["catalog-products"],
    queryFn: fetchProducts,
    staleTime: 60_000,
  });
}

export async function getCategories(): Promise<Category[]> {
  return fetchCategories();
}

export function useCategories() {
  return useQuery({
    queryKey: ["catalog-categories"],
    queryFn: fetchCategories,
    staleTime: 60_000,
  });
}

export type SiteSettings = {
  name: string;
  tagline: string;
  whatsapp: string;
  currency: string;
  currency_code: string;
  payment_provider: string;
  checkout_url: string;
};

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const res = await fetch(`${API_BASE_URL}/site-settings/`);
  if (!res.ok) {
    throw new Error("Failed to load site settings");
  }
  return res.json();
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: fetchSiteSettings,
    staleTime: 60_000,
  });
}

export async function updateSiteSettingsApi(
  updates: Partial<SiteSettings>,
  accessToken: string
): Promise<SiteSettings> {
  const res = await fetch(`${API_BASE_URL}/site-settings/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || "Failed to update site settings");
  }
  return res.json();
}

async function fetchAlsoBought(productId: number): Promise<Product[]> {
  const res = await fetch(`${API_BASE_URL}/products/${productId}/also-bought/`);
  if (!res.ok) return [];
  const data: RawProduct[] = await res.json();
  return data.map(transformProduct);
}

async function fetchSimilarProducts(productId: number): Promise<Product[]> {
  const res = await fetch(`${API_BASE_URL}/products/${productId}/similar/`);
  if (!res.ok) return [];
  const data: RawProduct[] = await res.json();
  return data.map(transformProduct);
}

export function useAlsoBought(productId: number) {
  return useQuery({
    queryKey: ["also-bought", productId],
    queryFn: () => fetchAlsoBought(productId),
    enabled: Number.isFinite(productId),
    staleTime: 5 * 60_000,
  });
}

export function useSimilarProducts(productId: number) {
  return useQuery({
    queryKey: ["similar-products", productId],
    queryFn: () => fetchSimilarProducts(productId),
    enabled: Number.isFinite(productId),
    staleTime: 5 * 60_000,
  });
}
