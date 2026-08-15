import { API_BASE_URL } from "./api-config";

export type Customer = {
  id: number;
  email: string;
  name: string;
  phone: string;
  date_joined: string;
  avatar: string | null;
  address_line: string;
  city: string;
  region: string;
  notify_order_email: boolean;
  notify_order_whatsapp: boolean;
  notify_promo_email: boolean;
};

const ACCESS_KEY = "customer_access_token";
const REFRESH_KEY = "customer_refresh_token";

let CURRENT_CUSTOMER: Customer | null = null;

async function parseJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY);
}

function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

function setTokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export async function signupCustomer(
  name: string,
  email: string,
  phone: string,
  password: string
): Promise<{ success: boolean; message: string; customer?: Customer }> {
  if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
    return { success: false, message: "Name, email, phone, and password are required" };
  }

  const res = await fetch(`${API_BASE_URL}/customer-signup/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone, password }),
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    const message =
      data?.email?.[0] || data?.phone?.[0] || data?.name?.[0] || data?.password?.[0] || data?.detail || "Signup failed";
    return { success: false, message };
  }

  setTokens(data.access, data.refresh);
  CURRENT_CUSTOMER = data.customer;

  return { success: true, message: "Account created successfully", customer: data.customer };
}

export async function loginCustomer(
  email: string,
  password: string
): Promise<{ success: boolean; message: string; customer?: Customer }> {
  if (!email.trim() || !password.trim()) {
    return { success: false, message: "Email and password are required" };
  }

  const res = await fetch(`${API_BASE_URL}/customer-login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    return { success: false, message: data?.detail || "Invalid email or password" };
  }

  setTokens(data.access, data.refresh);
  CURRENT_CUSTOMER = data.customer;

  return { success: true, message: "Login successful", customer: data.customer };
}

export async function fetchCurrentCustomer(): Promise<Customer | null> {
  const token = getAccessToken();
  if (!token) return null;

  const res = await fetch(`${API_BASE_URL}/customer-me/`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    const refreshed = await refreshCustomerToken();
    if (!refreshed) return null;
    return fetchCurrentCustomer();
  }

  if (!res.ok) return null;

  const customer = await res.json();
  CURRENT_CUSTOMER = customer;
  return customer;
}

// Call once on app load to restore session from a stored token
export async function restoreCustomerSession(): Promise<Customer | null> {
  if (!getAccessToken()) return null;
  return fetchCurrentCustomer();
}

async function refreshCustomerToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;

  const res = await fetch(`${API_BASE_URL}/customer-refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    clearTokens();
    CURRENT_CUSTOMER = null;
    return false;
  }

  const data = await res.json();
  localStorage.setItem(ACCESS_KEY, data.access);
  if (data.refresh) {
    localStorage.setItem(REFRESH_KEY, data.refresh);
  }
  return true;
}

export async function logoutCustomer() {
  const refresh = getRefreshToken();
  const access = getAccessToken();

  if (refresh) {
    try {
      await fetch(`${API_BASE_URL}/customer-logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access}`,
        },
        body: JSON.stringify({ refresh }),
      });
    } catch {
      // ignore network errors on logout
    }
  }

  clearTokens();
  CURRENT_CUSTOMER = null;
}

export function isCustomerAuthenticated(): boolean {
  return CURRENT_CUSTOMER !== null && getAccessToken() !== null;
}

export function getCurrentCustomer(): Customer | null {
  return CURRENT_CUSTOMER;
}

export async function updateCustomerProfile(
  updates: { name?: string; phone?: string }
): Promise<{ success: boolean; message: string; customer?: Customer }> {
  const token = getAccessToken();
  if (!token) {
    return { success: false, message: "Not logged in" };
  }

  const res = await fetch(`${API_BASE_URL}/customer-me/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    const message = data?.name?.[0] || data?.phone?.[0] || data?.detail || "Failed to update profile";
    return { success: false, message };
  }

  CURRENT_CUSTOMER = data;
  return { success: true, message: "Profile updated successfully", customer: data };
}

export async function changeCustomerPassword(
  oldPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const token = getAccessToken();
  if (!token) {
    return { success: false, message: "Not logged in" };
  }

  const res = await fetch(`${API_BASE_URL}/customer-change-password/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    const message = Array.isArray(data?.detail) ? data.detail[0] : data?.detail || "Failed to change password";
    return { success: false, message };
  }

  return { success: true, message: "Password changed successfully" };
}

export { getAccessToken as getCustomerAccessToken };

export async function updateCustomerProfileMultipart(
  updates: { name?: string; phone?: string; address_line?: string; city?: string; region?: string; avatar?: File | null }
): Promise<{ success: boolean; message: string; customer?: Customer }> {
  const token = getAccessToken();
  if (!token) {
    return { success: false, message: "Not logged in" };
  }

  const fd = new FormData();
  if (updates.name !== undefined) fd.append("name", updates.name);
  if (updates.phone !== undefined) fd.append("phone", updates.phone);
  if (updates.address_line !== undefined) fd.append("address_line", updates.address_line);
  if (updates.city !== undefined) fd.append("city", updates.city);
  if (updates.region !== undefined) fd.append("region", updates.region);
  if (updates.avatar) fd.append("avatar", updates.avatar);

  const res = await fetch(`${API_BASE_URL}/customer-me/`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    const message = data?.name?.[0] || data?.phone?.[0] || data?.avatar?.[0] || data?.detail || "Failed to update profile";
    return { success: false, message };
  }

  CURRENT_CUSTOMER = data;
  return { success: true, message: "Profile updated successfully", customer: data };
}

export async function updateNotificationPrefs(
  prefs: { notify_order_email?: boolean; notify_order_whatsapp?: boolean; notify_promo_email?: boolean }
): Promise<{ success: boolean; message: string; customer?: Customer }> {
  const token = getAccessToken();
  if (!token) return { success: false, message: "Not logged in" };

  const res = await fetch(`${API_BASE_URL}/customer-me/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(prefs),
  });

  const data = await parseJsonSafe(res);
  if (!res.ok) {
    return { success: false, message: data?.detail || "Failed to update preferences" };
  }
  CURRENT_CUSTOMER = data;
  return { success: true, message: "Preferences updated", customer: data };
}

export async function deactivateAccount(password: string): Promise<{ success: boolean; message: string }> {
  const token = getAccessToken();
  if (!token) return { success: false, message: "Not logged in" };

  const res = await fetch(`${API_BASE_URL}/customer-deactivate/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ password }),
  });

  const data = await parseJsonSafe(res);
  if (!res.ok) {
    return { success: false, message: data?.detail || "Failed to deactivate account" };
  }

  clearTokens();
  CURRENT_CUSTOMER = null;
  return { success: true, message: data?.detail || "Account deactivated" };
}

export async function requestCustomerPasswordReset(
  email: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/customer-request-password-reset/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await parseJsonSafe(res);
  if (!res.ok) {
    return { success: false, message: data?.detail || "Failed to send reset link" };
  }
  return { success: true, message: data?.detail || "If that email is registered, a reset link has been sent." };
}

export async function confirmCustomerPasswordReset(
  uidb64: string,
  token: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/customer-reset-password-confirm/${uidb64}/${token}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ new_password: newPassword }),
  });

  const data = await parseJsonSafe(res);
  if (!res.ok) {
    return { success: false, message: data?.detail || "Invalid or expired reset link." };
  }
  return { success: true, message: data?.detail || "Password has been reset." };
}
