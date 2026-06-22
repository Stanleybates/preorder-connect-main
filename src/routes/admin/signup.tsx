import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { signup } from "@/lib/auth-store";
import { Package } from "lucide-react";

export const Route = createFileRoute("/admin/signup")({
  component: AdminSignup,
});

function AdminSignup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Validate
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const result = signup(username, password);

    if (result.success) {
      navigate({ to: "/admin/login" });
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
          <p className="text-sm text-muted-foreground mt-2">Admin Panel</p>
        </div>

        {/* Signup Card */}
        <div className="rounded-3xl border border-border bg-card p-8 shadow-elevated">
          <h2 className="text-2xl font-display font-bold mb-6">Create Account</h2>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <label className="space-y-2 text-sm">
              <span className="font-medium text-foreground">Username</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-3 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Min. 3 characters"
                disabled={loading}
                autoComplete="username"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-foreground">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-3 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Min. 6 characters"
                disabled={loading}
                autoComplete="new-password"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-foreground">Confirm Password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-3 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Re-enter password"
                disabled={loading}
                autoComplete="new-password"
              />
            </label>

            <button
              type="submit"
              disabled={loading || !username.trim() || !password.trim() || !confirmPassword.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold py-3 hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 border-t border-border pt-6">
            <p className="text-sm text-muted-foreground text-center mb-4">Already have an account?</p>
            <a
              href="/admin/login"
              className="block w-full rounded-xl border border-border bg-background text-foreground font-semibold py-3 hover:bg-muted transition-all text-center"
            >
              Login
            </a>
          </div>
        </div>

        {/* Requirements */}
        <div className="mt-8 rounded-2xl bg-blue-50 border border-blue-200 p-4 space-y-2">
          <p className="text-xs font-semibold text-blue-900">Account Requirements:</p>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Username: minimum 3 characters</li>
            <li>• Password: minimum 6 characters</li>
            <li>• Locked after 3 failed login attempts</li>
            <li>• Auto-unlock after 24 hours</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
