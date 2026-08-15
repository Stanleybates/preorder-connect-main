import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { login } from "@/lib/auth-store";
import { API_BASE_URL } from "@/lib/api-config";
import { Package } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [failureLimit, setFailureLimit] = useState<number | null>(null);
  const [cooloffHours, setCooloffHours] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/security-config/`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setFailureLimit(data.failure_limit);
          setCooloffHours(data.cooloff_hours);
        }
      })
      .catch(() => {
        // Silently fall back to generic copy below if this fails
      });
  }, []);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(username, password);

    if (result.success) {
      navigate({ to: "/admin" });
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

        {/* Login Card */}
        <div className="rounded-3xl border border-border bg-card p-8 shadow-elevated">
          <h2 className="text-2xl font-display font-bold mb-6">Login</h2>

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
                placeholder="Enter username"
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
                placeholder="Enter password"
                disabled={loading}
                autoComplete="current-password"
              />
            </label>

            <button
              type="submit"
              disabled={loading || !username.trim() || !password.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold py-3 hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 border-t border-border pt-6">
            <p className="text-sm text-muted-foreground text-center mb-4">Don't have an account?</p>
            <a
              href="/admin/signup"
              className="block w-full rounded-xl border border-border bg-background text-foreground font-semibold py-3 hover:bg-muted transition-all text-center"
            >
              Sign Up
            </a>
          </div>

          <div className="mt-6 text-center">
            <a href="/admin/reset-password" className="text-sm text-primary hover:underline">
              Forgot password?
            </a>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-8 rounded-2xl bg-blue-50 border border-blue-200 p-4">
          <p className="text-xs text-blue-700">
            <strong>Security:</strong>{" "}
            {failureLimit !== null && cooloffHours !== null
              ? `Your account will be locked after ${failureLimit} failed login attempts. It will automatically unlock after ${cooloffHours} hours.`
              : "Repeated failed login attempts will temporarily lock your account for security."}
          </p>
        </div>
      </div>
    </div>
  );
}
