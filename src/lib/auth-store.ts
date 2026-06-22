import { type ReactNode } from "react";

export type User = {
  id: string;
  username: string;
  password: string; // in production, this should be hashed
  createdAt: Date;
};

export type LoginAttempt = {
  username: string;
  timestamp: Date;
  success: boolean;
};

// In-memory storage
export const USERS: User[] = [];
export const LOGIN_ATTEMPTS: LoginAttempt[] = [];
export let CURRENT_USER: User | null = null;

const ATTEMPTS_LIMIT = 3;
const LOCKOUT_HOURS = 24;

export function signup(username: string, password: string): { success: boolean; message: string; user?: User } {
  // Validate inputs
  if (!username.trim() || !password.trim()) {
    return { success: false, message: "Username and password are required" };
  }

  if (username.length < 3) {
    return { success: false, message: "Username must be at least 3 characters" };
  }

  if (password.length < 6) {
    return { success: false, message: "Password must be at least 6 characters" };
  }

  // Check if user already exists
  if (USERS.find(u => u.username === username)) {
    return { success: false, message: "Username already exists" };
  }

  // Create new user
  const newUser: User = {
    id: `u${Date.now()}`,
    username,
    password, // in production, hash this!
    createdAt: new Date(),
  };

  USERS.push(newUser);
  return { success: true, message: "Account created successfully", user: newUser };
}

export function login(username: string, password: string): { success: boolean; message: string; user?: User } {
  // Check if account is locked
  const lockStatus = getAccountLockStatus(username);
  if (lockStatus.locked) {
    return {
      success: false,
      message: `Account is locked. Try again at ${lockStatus.unlocksAt?.toLocaleTimeString() || "tomorrow"}`,
    };
  }

  // Find user
  const user = USERS.find(u => u.username === username);

  if (!user) {
    recordLoginAttempt(username, false);
    return { success: false, message: "Invalid username or password" };
  }

  // Check password
  if (user.password !== password) {
    recordLoginAttempt(username, false);
    const attemptsLeft = ATTEMPTS_LIMIT - getFailedAttemptCount(username);
    if (attemptsLeft <= 0) {
      return { success: false, message: "Account locked due to too many failed attempts. Try again tomorrow." };
    }
    return { success: false, message: `Invalid username or password. ${attemptsLeft} attempts left.` };
  }

  // Successful login
  recordLoginAttempt(username, true);
  CURRENT_USER = user;
  return { success: true, message: "Login successful", user };
}

export function logout() {
  CURRENT_USER = null;
}

export function resetPassword(
  username: string,
  oldPassword: string,
  newPassword: string
): { success: boolean; message: string } {
  if (!CURRENT_USER) {
    return { success: false, message: "Not logged in" };
  }

  if (CURRENT_USER.username !== username) {
    return { success: false, message: "Unauthorized" };
  }

  if (CURRENT_USER.password !== oldPassword) {
    return { success: false, message: "Current password is incorrect" };
  }

  if (newPassword.length < 6) {
    return { success: false, message: "New password must be at least 6 characters" };
  }

  CURRENT_USER.password = newPassword;
  return { success: true, message: "Password changed successfully" };
}

export function recordLoginAttempt(username: string, success: boolean) {
  LOGIN_ATTEMPTS.push({
    username,
    timestamp: new Date(),
    success,
  });
}

export function getFailedAttemptCount(username: string): number {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - LOCKOUT_HOURS * 60 * 60 * 1000);

  return LOGIN_ATTEMPTS.filter(
    att => att.username === username && !att.success && att.timestamp >= oneDayAgo
  ).length;
}

export function getAccountLockStatus(username: string): { locked: boolean; unlocksAt?: Date } {
  const failedCount = getFailedAttemptCount(username);

  if (failedCount < ATTEMPTS_LIMIT) {
    return { locked: false };
  }

  // Find the oldest failed attempt
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - LOCKOUT_HOURS * 60 * 60 * 1000);

  const oldestFailedAttempt = LOGIN_ATTEMPTS.filter(
    att => att.username === username && !att.success && att.timestamp >= oneDayAgo
  ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())[0];

  if (!oldestFailedAttempt) {
    return { locked: false };
  }

  const unlocksAt = new Date(oldestFailedAttempt.timestamp.getTime() + LOCKOUT_HOURS * 60 * 60 * 1000);

  return {
    locked: unlocksAt > now,
    unlocksAt,
  };
}

export function isAuthenticated(): boolean {
  return CURRENT_USER !== null;
}

export function getCurrentUser(): User | null {
  return CURRENT_USER;
}
