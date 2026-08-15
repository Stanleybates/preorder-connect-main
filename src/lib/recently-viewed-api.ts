import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "./api-config";
import { getCustomerAccessToken, isCustomerAuthenticated } from "./customer-auth-store";

export type RecentlyViewedItem = {
  id: number;
  product: number;
  product_detail: {
    id: number;
    name: string;
    category: string;
    price: string;
    status: "in-stock" | "pre-stock";
    emoji: string;
    image: string | null;
    hue: number;
  };
  viewed_at: string;
};

function authHeaders(): HeadersInit {
  const token = getCustomerAccessToken();
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

export async function recordProductView(productId: number): Promise<void> {
  if (!isCustomerAuthenticated()) return;
  try {
    await fetch(`${API_BASE_URL}/recently-viewed/`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ product_id: productId }),
    });
  } catch {
    // best-effort, never block the UI on this
  }
}

async function fetchRecentlyViewed(): Promise<RecentlyViewedItem[]> {
  const res = await fetch(`${API_BASE_URL}/recently-viewed/`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to load recently viewed");
  return res.json();
}

export function useRecentlyViewed() {
  return useQuery({
    queryKey: ["recently-viewed"],
    queryFn: fetchRecentlyViewed,
    enabled: isCustomerAuthenticated(),
    staleTime: 30_000,
  });
}
