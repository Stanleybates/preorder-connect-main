import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "./api-config";
import { getCustomerAccessToken, isCustomerAuthenticated } from "./customer-auth-store";
import { PAYSTACK_PUBLIC_KEY } from "./payments-api";
import { fetchSiteSettings } from "./catalog-api";

export type CartItem = {
  id: number;
  product: number;
  product_name: string;
  product_price: string;
  product_image: string | null;
  product_emoji: string;
  product_hue: number;
  product_status: "in-stock" | "pre-stock";
  quantity: number;
  subtotal: string;
  added_at: string;
};

export type Cart = {
  id: number;
  items: CartItem[];
  total: string;
  item_count: number;
  updated_at: string;
};

function authHeaders(): HeadersInit {
  const token = getCustomerAccessToken();
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

async function parseJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchCart(): Promise<Cart> {
  const res = await fetch(`${API_BASE_URL}/cart/`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to load cart");
  return res.json();
}

export function useCart() {
  return useQuery({
    queryKey: ["cart"],
    queryFn: fetchCart,
    enabled: isCustomerAuthenticated(),
    staleTime: 10_000,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: number; quantity?: number }) => {
      const res = await fetch(`${API_BASE_URL}/cart/add/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ product_id: productId, quantity }),
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) throw new Error(data?.detail || "Failed to add to cart");
      return data as Cart;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["cart"], data);
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      const res = await fetch(`${API_BASE_URL}/cart/items/${productId}/`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ quantity }),
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) throw new Error(data?.detail || "Failed to update cart item");
      return data as Cart;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["cart"], data);
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: number) => {
      const res = await fetch(`${API_BASE_URL}/cart/items/${productId}/`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) throw new Error(data?.detail || "Failed to remove item");
      return data as Cart;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["cart"], data);
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE_URL}/cart/clear/`, {
        method: "POST",
        headers: authHeaders(),
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) throw new Error(data?.detail || "Failed to clear cart");
      return data as Cart;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["cart"], data);
    },
  });
}

type InitCheckoutResponse = {
  reference: string;
  amount: number;
  email: string;
};

async function initCheckout(): Promise<InitCheckoutResponse> {
  const res = await fetch(`${API_BASE_URL}/checkout/init/`, {
    method: "POST",
    headers: authHeaders(),
  });
  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data?.detail || "Failed to start checkout");
  return data;
}

type CheckoutStatus = {
  status: "pending" | "success" | "failed" | "refunded";
  order_id: number | null;
};

async function getCheckoutStatus(reference: string): Promise<CheckoutStatus> {
  const res = await fetch(`${API_BASE_URL}/checkout/status/${reference}/`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to check payment status");
  return res.json();
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Polls the webhook-driven status endpoint after the Paystack popup closes.
// The webhook (server-to-server) is the source of truth -- this just waits for it to land.
async function pollCheckoutStatus(reference: string, maxAttempts = 15, intervalMs = 2000): Promise<CheckoutStatus> {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await getCheckoutStatus(reference);
    if (result.status === "success" || result.status === "failed") {
      return result;
    }
    await sleep(intervalMs);
  }
  return { status: "pending", order_id: null };
}

export type CheckoutResult =
  | { outcome: "success"; orderId: number | null }
  | { outcome: "failed"; message: string }
  | { outcome: "pending" }
  | { outcome: "cancelled" };

export async function runCartCheckout(): Promise<CheckoutResult> {
  const [init, settings] = await Promise.all([initCheckout(), fetchSiteSettings()]);

  if (!window.PaystackPop) {
    throw new Error("Payment popup failed to load. Check your connection and try again.");
  }

  return new Promise((resolve, reject) => {
    const handler = window.PaystackPop!.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: init.email,
      amount: Math.round(init.amount * 100),
      currency: settings.currency_code || "GHS",
      ref: init.reference,
      callback: async () => {
        try {
          const result = await pollCheckoutStatus(init.reference);
          if (result.status === "success") {
            resolve({ outcome: "success", orderId: result.order_id });
          } else if (result.status === "failed") {
            resolve({ outcome: "failed", message: "Payment could not be confirmed." });
          } else {
            resolve({ outcome: "pending" });
          }
        } catch (err) {
          reject(err);
        }
      },
      onClose: () => {
        resolve({ outcome: "cancelled" });
      },
    });

    handler.openIframe();
  });
}
