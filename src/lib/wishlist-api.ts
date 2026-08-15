import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL } from "./api-config";
import { getCustomerAccessToken, isCustomerAuthenticated } from "./customer-auth-store";
import type { Product } from "./catalog-api";

export type SavedItem = {
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
  saved_at: string;
};

function authHeaders(): HeadersInit {
  const token = getCustomerAccessToken();
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

async function fetchWishlist(): Promise<SavedItem[]> {
  const res = await fetch(`${API_BASE_URL}/wishlist/`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to load wishlist");
  return res.json();
}

export function useWishlist() {
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: fetchWishlist,
    enabled: isCustomerAuthenticated(),
    staleTime: 15_000,
  });
}

export function useIsWishlisted(productId: number) {
  const { data } = useWishlist();
  return (data ?? []).some((item) => item.product === productId);
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: number) => {
      const res = await fetch(`${API_BASE_URL}/wishlist/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ product_id: productId }),
      });
      if (!res.ok) throw new Error("Failed to save item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: number) => {
      const res = await fetch(`${API_BASE_URL}/wishlist/${productId}/`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok && res.status !== 404) throw new Error("Failed to remove item");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
}

export function useToggleWishlist(productId: number) {
  const isSaved = useIsWishlisted(productId);
  const add = useAddToWishlist();
  const remove = useRemoveFromWishlist();

  const toggle = () => {
    if (isSaved) {
      remove.mutate(productId);
    } else {
      add.mutate(productId);
    }
  };

  return { isSaved, toggle, isPending: add.isPending || remove.isPending };
}
