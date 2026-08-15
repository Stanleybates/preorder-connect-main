import { API_BASE_URL } from "./api-config";
import { getAccessToken } from "./auth-store";

export type Category = {
  id: string;
  name: string;
  emoji: string;
  desc: string;
};

export type Product = {
  id: number;
  name: string;
  category: string;
  category_name?: string;
  price: string;
  status: "in-stock" | "pre-stock";
  eta?: string | null;
  emoji: string;
  image?: string | null;
  hue: number;
  tag?: string | null;
  created_by_username?: string;
  created_at?: string;
  updated_at?: string;
};

export type DeletedProductRecord = {
  id: number;
  product: Product;
  reason: string;
  deleted_by_username: string | null;
  deleted_at: string;
  restored_at: string | null;
};

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

// --- Categories ---
export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE_URL}/categories/`, { headers: authHeaders() });
  if (!res.ok) return [];
  return res.json();
}

export async function createCategory(
  data: { id: string; name: string; emoji: string; desc: string }
): Promise<{ success: boolean; message: string; category?: Category }> {
  const res = await fetch(`${API_BASE_URL}/categories/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  const body = await parseJsonSafe(res);
  if (!res.ok) {
    const message = body?.id?.[0] || body?.name?.[0] || body?.detail || "Failed to add category";
    return { success: false, message };
  }
  return { success: true, message: "Category added", category: body };
}

// --- Products ---
export async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE_URL}/products/`, { headers: authHeaders() });
  if (!res.ok) return [];
  return res.json();
}

export type ProductInput = {
  name: string;
  category: string;
  price: number;
  status: "in-stock" | "pre-stock";
  eta?: string;
  emoji: string;
  hue: number;
  tag?: string;
  imageFile?: File | null;
};

function buildProductFormData(input: ProductInput): FormData {
  const fd = new FormData();
  fd.append("name", input.name);
  fd.append("category", input.category);
  fd.append("price", String(input.price));
  fd.append("status", input.status);
  fd.append("emoji", input.emoji);
  fd.append("hue", String(input.hue));
  if (input.eta) fd.append("eta", input.eta);
  if (input.tag) fd.append("tag", input.tag);
  if (input.imageFile) fd.append("image", input.imageFile);
  return fd;
}

export async function createProduct(
  input: ProductInput
): Promise<{ success: boolean; message: string; product?: Product }> {
  const res = await fetch(`${API_BASE_URL}/products/`, {
    method: "POST",
    headers: authHeaders(),
    body: buildProductFormData(input),
  });
  const body = await parseJsonSafe(res);
  if (!res.ok) {
    const message = body?.detail || Object.values(body || {})?.[0]?.[0] || "Failed to add product";
    return { success: false, message };
  }
  return { success: true, message: "Product added", product: body };
}

export async function updateProductApi(
  id: number,
  input: ProductInput
): Promise<{ success: boolean; message: string; product?: Product }> {
  const res = await fetch(`${API_BASE_URL}/products/${id}/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: buildProductFormData(input),
  });
  const body = await parseJsonSafe(res);
  if (!res.ok) {
    const message = body?.detail || Object.values(body || {})?.[0]?.[0] || "Failed to update product";
    return { success: false, message };
  }
  return { success: true, message: "Product updated", product: body };
}

export async function deleteProductApi(
  id: number,
  reason: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/products/${id}/delete/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({ reason }),
  });
  const body = await parseJsonSafe(res);
  if (!res.ok) {
    return { success: false, message: body?.detail || "Failed to delete product" };
  }
  return { success: true, message: body?.detail || "Deleted" };
}

export async function getDeletedProducts(): Promise<DeletedProductRecord[]> {
  const res = await fetch(`${API_BASE_URL}/products/deleted/`, { headers: authHeaders() });
  if (!res.ok) return [];
  return res.json();
}

export async function restoreProductApi(id: number): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/products/${id}/restore/`, {
    method: "POST",
    headers: authHeaders(),
  });
  const body = await parseJsonSafe(res);
  if (!res.ok) {
    return { success: false, message: body?.detail || "Failed to restore product" };
  }
  return { success: true, message: body?.detail || "Restored" };
}

export async function permanentlyDeleteProductApi(id: number): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/products/${id}/permanent-delete/`, {
    method: "POST",
    headers: authHeaders(),
  });
  const body = await parseJsonSafe(res);
  if (!res.ok) {
    return { success: false, message: body?.detail || "Failed to permanently delete product" };
  }
  return { success: true, message: body?.detail || "Permanently deleted" };
}
