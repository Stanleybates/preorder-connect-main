import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { confirmCustomerPasswordReset } from "@/lib/customer-auth-store";
import { Package, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/reset-password/$uidb64/$token")({
  head: () => ({ meta: [{ title: "Reset Password" }] }),
  component: ResetPasswordConfirm,
});

function ResetPasswordConfirm() {
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
      setError("Passwords must match.");
      return;
    }

    setLoading(true);
    const result = await confirmCustomerPasswordReset(uidb64, token, newPassword);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate({ to: "/login" }), 1500);
    } else {
      setError(result.message);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: "url('/admin-login-bg.webp')" }}
    >
      <div className="absolute inset-0 bg-black/65" />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="rounded-[2.5rem] border border-white/10 bg-white/90 backdrop-blur-xl p-8 shadow-elevated">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-br from-primary to-accent shadow-glow mb-4">
                <Package className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-display font-bold text-slate-950">Set new password</h1>
            </div>

            {success ? (
              <div className="text-center">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-3" />
                <p className="text-sm text-slate-700">Password reset. Redirecting you to login...</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5">
                <label className="block text-sm text-slate-700">
                  <span className="font-semibold">New password</span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/20"
                    disabled={loading}
                  />
                </label>
                <label className="block text-sm text-slate-700">
                  <span className="font-semibold">Confirm new password</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/20"
                    disabled={loading}
                  />
                </label>

                {error && (
                  <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading || !newPassword.trim() || !confirmPassword.trim()}
                  className="w-full rounded-3xl bg-gradient-to-r from-primary to-accent px-5 py-3 text-sm font-semibold uppercase text-primary-foreground transition hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Saving..." : "Reset password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
