import { API_BASE_URL } from "./api-config";
import { getAccessToken } from "./auth-store";
import type { Product } from "./products-api";

export type Category = {
  id: string;
  name: string;
  emoji: string;
  desc: string;
};

export type FlyerStatus = "upcoming" | "ongoing" | "ended" | null;

export type Promotion = {
  id: number;
  title: string;
  products: Product[];
  discount_percent: number;
  active: boolean;
  created_at: string;
  flyer_image: string | null;
  link_type: "products" | "category";
  category: string | null;
  category_detail: Category | null;
  start_date: string | null;
  end_date: string | null;
  flyer_status: FlyerStatus;
  audience: "all" | "guests" | "customers";
};

export type PromoRequest = {
  id: number;
  title: string;
  reason: string;
  benefits: string;
  projected_profit: string;
  discount_percent: number;
  products: Product[];
  requested_by_username: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
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

export async function getPromotions(): Promise<Promotion[]> {
  const res = await fetch(`${API_BASE_URL}/promotions/`, { headers: authHeaders() });
  if (!res.ok) return [];
  return res.json();
}

export async function createPromotionApi(
  data: { title: string; discount_percent: number; product_ids: number[] }
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/promotions/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  const body = await parseJsonSafe(res);
  if (!res.ok) {
    return { success: false, message: body?.detail || "Failed to create promotion" };
  }
  return { success: true, message: "Promotion created" };
}

export async function togglePromotionApi(id: number): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/promotions/${id}/toggle/`, {
    method: "POST",
    headers: authHeaders(),
  });
  const body = await parseJsonSafe(res);
  if (!res.ok) {
    return { success: false, message: body?.detail || "Failed to toggle promotion" };
  }
  return { success: true, message: "Toggled" };
}

export async function deletePromotionApi(id: number): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/promotions/${id}/delete/`, {
    method: "POST",
    headers: authHeaders(),
  });
  const body = await parseJsonSafe(res);
  if (!res.ok) {
    return { success: false, message: body?.detail || "Failed to delete promotion" };
  }
  return { success: true, message: body?.detail || "Deleted" };
}

export async function getPromoRequests(): Promise<PromoRequest[]> {
  const res = await fetch(`${API_BASE_URL}/promo-requests/`, { headers: authHeaders() });
  if (!res.ok) return [];
  return res.json();
}

export async function createPromoRequestApi(
  data: {
    title: string;
    reason: string;
    benefits: string;
    projected_profit: string;
    discount_percent: number;
    product_ids: number[];
  }
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/promo-requests/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  const body = await parseJsonSafe(res);
  if (!res.ok) {
    const message = body?.detail || Object.values(body || {})?.[0]?.[0] || "Failed to submit request";
    return { success: false, message };
  }
  return { success: true, message: "Request submitted" };
}

export async function approvePromoRequestApi(id: number): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/promo-requests/${id}/approve/`, {
    method: "POST",
    headers: authHeaders(),
  });
  const body = await parseJsonSafe(res);
  if (!res.ok) {
    return { success: false, message: body?.detail || "Failed to approve" };
  }
  return { success: true, message: body?.detail || "Approved" };
}

export async function rejectPromoRequestApi(id: number): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/promo-requests/${id}/reject/`, {
    method: "POST",
    headers: authHeaders(),
  });
  const body = await parseJsonSafe(res);
  if (!res.ok) {
    return { success: false, message: body?.detail || "Failed to reject" };
  }
  return { success: true, message: body?.detail || "Rejected" };
}

// ---- Public flyers (storefront popup/banner) ----

export async function getPublicFlyers(): Promise<Promotion[]> {
  const res = await fetch(`${API_BASE_URL}/flyers/`);
  if (!res.ok) return [];
  return res.json();
}

// ---- Admin: flyer create/update (multipart, since it includes an image) ----

export type FlyerFormData = {
  title: string;
  discount_percent: number;
  product_ids: number[];
  link_type: "products" | "category";
  category: string | null;
  start_date: string | null;
  end_date: string | null;
  flyer_image: File | null;
  audience: "all" | "guests" | "customers";
};

function buildFlyerFormData(data: FlyerFormData): FormData {
  const fd = new FormData();
  fd.append("title", data.title);
  fd.append("discount_percent", String(data.discount_percent));
  fd.append("link_type", data.link_type);
  data.product_ids.forEach((id) => fd.append("product_ids", String(id)));
  if (data.category) fd.append("category", data.category);
  if (data.start_date) fd.append("start_date", data.start_date);
  if (data.end_date) fd.append("end_date", data.end_date);
  fd.append("audience", data.audience);
  if (data.flyer_image) fd.append("flyer_image", data.flyer_image);
  return fd;
}

export async function createFlyerApi(data: FlyerFormData): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/promotions/`, {
    method: "POST",
    headers: authHeaders(),
    body: buildFlyerFormData(data),
  });
  const body = await parseJsonSafe(res);
  if (!res.ok) {
    const message = body?.detail || Object.values(body || {})?.[0]?.[0] || "Failed to create flyer";
    return { success: false, message };
  }
  return { success: true, message: "Flyer created" };
}

export async function updateFlyerApi(
  id: number,
  data: Partial<FlyerFormData>
): Promise<{ success: boolean; message: string }> {
  const fd = new FormData();
  if (data.title !== undefined) fd.append("title", data.title);
  if (data.discount_percent !== undefined) fd.append("discount_percent", String(data.discount_percent));
  if (data.link_type !== undefined) fd.append("link_type", data.link_type);
  if (data.product_ids !== undefined) data.product_ids.forEach((id) => fd.append("product_ids", String(id)));
  if (data.category !== undefined && data.category) fd.append("category", data.category);
  if (data.start_date !== undefined && data.start_date) fd.append("start_date", data.start_date);
  if (data.end_date !== undefined && data.end_date) fd.append("end_date", data.end_date);
  if (data.flyer_image) fd.append("flyer_image", data.flyer_image);

  const res = await fetch(`${API_BASE_URL}/promotions/${id}/update/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: fd,
  });
  const body = await parseJsonSafe(res);
  if (!res.ok) {
    const message = body?.detail || Object.values(body || {})?.[0]?.[0] || "Failed to update flyer";
    return { success: false, message };
  }
  return { success: true, message: "Flyer updated" };
}

export async function getActivePromotions(): Promise<Promotion[]> {
  const res = await fetch(`${API_BASE_URL}/active-promotions/`);
  if (!res.ok) return [];
  return res.json();
}
