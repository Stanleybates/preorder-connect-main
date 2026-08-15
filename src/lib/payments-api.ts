import { API_BASE_URL } from "./api-config";
import { getAccessToken } from "./auth-store";

export const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string;

export type Payment = {
  id: number;
  product: number | null;
  product_name: string | null;
  reference: string;
  amount: string;
  provider: string;
  status: "pending" | "success" | "failed" | "refunded";
  payer_name: string;
  payer_email: string;
  note: string;
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

export async function getPayments(): Promise<Payment[]> {
  const res = await fetch(`${API_BASE_URL}/payments/`, { headers: authHeaders() });
  if (!res.ok) return [];
  return res.json();
}

export async function verifyPayment(
  reference: string,
  productId?: number
): Promise<{ success: boolean; message: string; payment?: Payment }> {
  const res = await fetch(`${API_BASE_URL}/verify-payment/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reference, product_id: productId }),
  });
  const body = await parseJsonSafe(res);
  if (!res.ok) {
    return { success: false, message: body?.detail || "Payment verification failed" };
  }
  return { success: true, message: "Payment verified", payment: body };
}
