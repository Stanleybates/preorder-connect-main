import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "./api-config";
import { getCustomerAccessToken } from "./customer-auth-store";
import { getAccessToken } from "./auth-store";

export type OrderItem = {
  id: number;
  product: number | null;
  product_name: string;
  quantity: number;
  price: string;
};

export type Order = {
  id: number;
  product: number | null;
  product_name: string | null;
  items: OrderItem[];
  customer_name: string;
  customer_email: string;
  delivery_address: string;
  status: "processing" | "shipped" | "delivered" | "cancelled";
  note: string;
  amount: string | null;
  created_at: string;
  updated_at: string;
};

function authHeaders(): HeadersInit {
  const token = getCustomerAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchMyOrders(): Promise<Order[]> {
  const res = await fetch(`${API_BASE_URL}/my-orders/`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to load orders");
  return res.json();
}

export function useMyOrders() {
  return useQuery({
    queryKey: ["my-orders"],
    queryFn: fetchMyOrders,
    staleTime: 30_000,
  });
}

// ---- Admin: all orders + status updates (uses admin auth token, not customer) ----

function adminAuthHeaders(): HeadersInit {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

export async function getOrders(): Promise<Order[]> {
  const res = await fetch(`${API_BASE_URL}/orders/`, { headers: adminAuthHeaders() });
  if (!res.ok) return [];
  return res.json();
}

export async function updateOrderStatus(
  id: number,
  status: Order["status"]
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/orders/${id}/status/`, {
    method: "POST",
    headers: adminAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    return { success: false, message: body?.detail || "Failed to update order status" };
  }
  return { success: true, message: "Order status updated" };
}
