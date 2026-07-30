import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { confirmPasswordReset } from "@/lib/auth-store";
import { Package } from "lucide-react";

export const Route = createFileRoute("/admin/reset-password/$uidb64/$token")({
  component: ConfirmResetPassword,
});

function ConfirmResetPassword() {
  const { uidb64, token } = Route.useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const result = await confirmPasswordReset(uidb64, token, newPassword);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate({ to: "/admin/login" }), 2000);
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent shadow-glow mb-4">
            <Package className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">SG Imports</h1>
          <p className="text-sm text-muted-foreground mt-2">Set a New Password</p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-elevated">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {success ? (
            <div className="rounded-xl bg-green-50 border border-green-200 p-4">
              <p className="text-sm text-green-700 font-medium">Password reset. Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-foreground">New Password</span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-border px-4 py-3 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Min. 6 characters"
                  disabled={loading}
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
                  disabled={loading}
                  autoComplete="new-password"
                />
              </label>

              <button
                type="submit"
                disabled={loading || !newPassword.trim() || !confirmPassword.trim()}
                className="w-full rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold py-3 hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
