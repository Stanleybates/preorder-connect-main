import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { getCurrentCustomer, restoreCustomerSession, deactivateAccount } from "@/lib/customer-auth-store";

export const Route = createFileRoute("/account/close")({
  head: () => ({ meta: [{ title: "Close Account" }] }),
  component: CloseAccount,
});

function CloseAccount() {
  const navigate = useNavigate();
  const [sessionChecked, setSessionChecked] = useState(!!getCurrentCustomer());
  const [password, setPassword] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (getCurrentCustomer()) return;
    restoreCustomerSession().then((restored) => {
      if (!restored) navigate({ to: "/login", replace: true });
      setSessionChecked(true);
    });
  }, [navigate]);

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!confirmed) {
      setError("Please confirm you understand this action.");
      return;
    }
    if (!password.trim()) {
      setError("Enter your password to confirm.");
      return;
    }
    setSubmitting(true);
    const result = await deactivateAccount(password);
    setSubmitting(false);
    if (result.success) {
      navigate({ to: "/", replace: true });
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-6 py-16">
        <Link to="/account" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to account
        </Link>

        <div className="rounded-3xl border border-red-200 bg-red-50 p-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h1 className="text-2xl font-display font-bold text-red-900">Close your account</h1>
          </div>
          <p className="text-sm text-red-800 mb-6">
            This deactivates your account immediately. You won't be able to log in or place orders until you contact support to reactivate. Your order history is kept for record-keeping.
          </p>

          <form onSubmit={onSubmit} className="space-y-4">
            <label className="flex items-start gap-3 text-sm text-red-900">
              <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5 h-4 w-4" />
              I understand this will deactivate my account.
            </label>

            <label className="block text-sm text-red-900">
              <span className="font-semibold">Confirm your password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-red-300 bg-white px-4 py-3 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
            </label>

            {error && <div className="rounded-2xl border border-red-300 bg-white px-4 py-3 text-sm text-red-700">{error}</div>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-60"
            >
              {submitting ? "Closing account..." : "Close my account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
