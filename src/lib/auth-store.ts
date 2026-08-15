import { API_BASE_URL } from "./api-config";

export type User = {
  id: number;
  username: string;
  email?: string;
  date_joined: string;
  role?: "super_admin" | "sub_admin";
  status?: "pending" | "approved" | "rejected";
  is_approved?: boolean;
};

// In-memory only — resets on page refresh by design
let ACCESS_TOKEN: string | null = null;
let REFRESH_TOKEN: string | null = null;
let CURRENT_USER: User | null = null;

const SAVED_ITEM_IDS: string[] = [];

export type PaymentMethod = {
  type: "card" | "bank" | "mobile";
  label: string;
  last4: string;
  expires: string;
  provider?: string;
};

let PAYMENT_METHOD: PaymentMethod | null = null;

async function parseJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function signup(
  username: string,
  email: string,
  password: string
): Promise<{ success: boolean; message: string }> {
  if (!username.trim() || !email.trim() || !password.trim()) {
    return { success: false, message: "Username, email, and password are required" };
  }

  const res = await fetch(`${API_BASE_URL}/signup/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    const message =
      data?.username?.[0] || data?.email?.[0] || data?.password?.[0] || data?.detail || "Signup failed";
    return { success: false, message };
  }

  return { success: true, message: "Account created successfully" };
}

export async function login(
  username: string,
  password: string
): Promise<{ success: boolean; message: string; user?: User }> {
  const res = await fetch(`${API_BASE_URL}/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    return { success: false, message: data?.detail || "Invalid username or password" };
  }

  ACCESS_TOKEN = data.access;
  REFRESH_TOKEN = data.refresh;

  const user = await fetchCurrentUser();
  if (!user) {
    return { success: false, message: "Login succeeded but failed to load user" };
  }

  CURRENT_USER = user;
  return { success: true, message: "Login successful", user };
}

export async function fetchCurrentUser(): Promise<User | null> {
  if (!ACCESS_TOKEN) return null;

  const res = await fetch(`${API_BASE_URL}/me/`, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  });

  if (!res.ok) return null;
  return res.json();
}

export async function logout() {
  if (REFRESH_TOKEN) {
    try {
      await fetch(`${API_BASE_URL}/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
        body: JSON.stringify({ refresh: REFRESH_TOKEN }),
      });
    } catch {
      // ignore network errors on logout
    }
  }

  ACCESS_TOKEN = null;
  REFRESH_TOKEN = null;
  CURRENT_USER = null;
}

export function isAuthenticated(): boolean {
  return CURRENT_USER !== null && ACCESS_TOKEN !== null;
}

export function getCurrentUser(): User | null {
  return CURRENT_USER;
}

// Change password while logged in (old + new password)
export async function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  if (!ACCESS_TOKEN) {
    return { success: false, message: "Not logged in" };
  }

  const res = await fetch(`${API_BASE_URL}/change-password/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    return { success: false, message: data?.detail || "Failed to change password" };
  }

  return { success: true, message: "Password changed successfully" };
}

// Forgot password: request a reset link via email (no login required)
export async function requestPasswordReset(
  email: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/request-password-reset/`, {
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

// Forgot password: confirm the new password using the emailed token
export async function confirmPasswordReset(
  uidb64: string,
  token: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE_URL}/reset-password-confirm/${uidb64}/${token}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ new_password: newPassword }),
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    return { success: false, message: data?.detail || "Invalid or expired reset link" };
  }

  return { success: true, message: data?.detail || "Password has been reset." };
}

// Profile photo — in-memory only, resets on page refresh by design
let PROFILE_PHOTO: string | null = null;

export function getProfilePhoto(): string | null {
  return PROFILE_PHOTO;
}

export function setProfilePhoto(dataUrl: string | null) {
  PROFILE_PHOTO = dataUrl;
}

export function getSavedItems() {
  return [...SAVED_ITEM_IDS];
}

export function isItemSaved(productId: string) {
  return SAVED_ITEM_IDS.includes(productId);
}

export function toggleSavedItem(productId: string) {
  const index = SAVED_ITEM_IDS.indexOf(productId);
  if (index >= 0) {
    SAVED_ITEM_IDS.splice(index, 1);
  } else {
    SAVED_ITEM_IDS.push(productId);
  }
  return [...SAVED_ITEM_IDS];
}

export function getPaymentMethod(): PaymentMethod | null {
  return PAYMENT_METHOD;
}

export function savePaymentMethod(method: PaymentMethod) {
  PAYMENT_METHOD = method;
  return PAYMENT_METHOD;
}

// Change username while logged in
export async function changeUsername(
  newUsername: string
): Promise<{ success: boolean; message: string; user?: User }> {
  if (!ACCESS_TOKEN) {
    return { success: false, message: "Not logged in" };
  }

  const res = await fetch(`${API_BASE_URL}/me/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ username: newUsername }),
  });

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    return { success: false, message: data?.detail || "Failed to change username" };
  }

  CURRENT_USER = data;
  return { success: true, message: "Username updated successfully", user: data };
}

// Sub-admin approvals (super admin only)
export type PendingAdmin = {
  id: number;
  username: string;
  email?: string;
  date_joined: string;
  role: string;
  status: "pending" | "approved" | "rejected";
};

export async function getPendingAdmins(): Promise<PendingAdmin[]> {
  if (!ACCESS_TOKEN) return [];

  const res = await fetch(`${API_BASE_URL}/pending-admins/`, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  });

  if (!res.ok) return [];
  return res.json();
}

export async function approveAdmin(userId: number): Promise<{ success: boolean; message: string }> {
  if (!ACCESS_TOKEN) return { success: false, message: "Not logged in" };

  const res = await fetch(`${API_BASE_URL}/approve-admin/${userId}/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  });

  const data = await parseJsonSafe(res);
  if (!res.ok) {
    return { success: false, message: data?.detail || "Failed to approve" };
  }
  return { success: true, message: data?.detail || "Approved" };
}

export async function rejectAdmin(userId: number): Promise<{ success: boolean; message: string }> {
  if (!ACCESS_TOKEN) return { success: false, message: "Not logged in" };

  const res = await fetch(`${API_BASE_URL}/reject-admin/${userId}/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  });

  const data = await parseJsonSafe(res);
  if (!res.ok) {
    return { success: false, message: data?.detail || "Failed to reject" };
  }
  return { success: true, message: data?.detail || "Rejected" };
}

export function getAccessToken(): string | null {
  return ACCESS_TOKEN;
}
