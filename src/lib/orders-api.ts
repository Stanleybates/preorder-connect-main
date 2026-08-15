import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "./api-config";
import { getCustomerAccessToken } from "./customer-auth-store";

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
