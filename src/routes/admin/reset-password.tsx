import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { resetPassword, isAuthenticated, getCurrentUser } from "@/lib/auth-store";
import { Package } from "lucide-react";

export const Route = createFileRoute("/admin/reset-password")({
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const authenticated = isAuthenticated();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Redirect if not logged in
  if (!authenticated || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You must be logged in to reset your password.</p>
          <a
            href="/admin/login"
            className="inline-block rounded-xl bg-primary text-primary-foreground font-semibold px-6 py-3 hover:shadow-glow transition-all"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validate
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setLoading(true);
    const result = resetPassword(currentUser.username, oldPassword, newPassword);

    if (result.success) {
      setSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        navigate({ to: "/admin" });
      }, 2000);
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent shadow-glow mb-4">
            <Package className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">Prime Imports</h1>
          <p className="text-sm text-muted-foreground mt-2">Reset Password</p>
        </div>

        {/* Reset Card */}
        <div className="rounded-3xl border border-border bg-card p-8 shadow-elevated">
          <h2 className="text-2xl font-display font-bold mb-2">Change Password</h2>
          <p className="text-sm text-muted-foreground mb-6">Logged in as <span className="font-semibold">{currentUser.username}</span></p>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="rounded-xl bg-green-50 border border-green-200 p-4 mb-6">
              <p className="text-sm text-green-700 font-medium">Password changed successfully! Redirecting...</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <label className="space-y-2 text-sm">
              <span className="font-medium text-foreground">Current Password</span>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-3 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Enter current password"
                disabled={loading || success}
                autoComplete="current-password"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-foreground">New Password</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-3 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Min. 6 characters"
                disabled={loading || success}
                autoComplete="new-password"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-foreground">Confirm New Password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-3 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Re-enter new password"
                disabled={loading || success}
                autoComplete="new-password"
              />
            </label>

            <button
              type="submit"
              disabled={loading || success || !oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold py-3 hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>

          <div className="mt-6 border-t border-border pt-6">
            <a
              href="/admin"
              className="block w-full rounded-xl border border-border bg-background text-foreground font-semibold py-3 hover:bg-muted transition-all text-center"
            >
              Back to Admin
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
