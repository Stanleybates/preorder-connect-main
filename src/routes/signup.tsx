import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FormEvent, useState } from "react";
import { signupCustomer } from "@/lib/customer-auth-store";
import { Package } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up | Prime Imports" },
      { name: "description", content: "Create a Prime Imports account so you can place orders and manage your profile." },
    ],
  }),
  component: CustomerSignup,
});

function CustomerSignup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const result = await signupCustomer(name, email, phone, password);
    setLoading(false);

    if (result.success) {
      setSuccess("Account created successfully.");
      setTimeout(() => navigate({ to: "/" }), 600);
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
              <h1 className="text-3xl font-display font-bold text-slate-950">Prime Imports</h1>
              <p className="text-sm text-slate-600 mt-2">Create your account to place orders.</p>
            </div>

            {error ? (
              <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 mb-6 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 mb-6 text-sm text-emerald-700">
                {success}
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="space-y-5">
              <label className="block text-sm text-slate-700">
                <span className="font-semibold">Full name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/20"
                  placeholder="Your full name"
                  disabled={loading}
                  autoComplete="name"
                />
              </label>
              <label className="block text-sm text-slate-700">
                <span className="font-semibold">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/20"
                  placeholder="you@example.com"
                  disabled={loading}
                  autoComplete="email"
                />
              </label>
              <label className="block text-sm text-slate-700">
                <span className="font-semibold">Phone number</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/20"
                  placeholder="080..."
                  disabled={loading}
                  autoComplete="tel"
                />
              </label>
              <label className="block text-sm text-slate-700">
                <span className="font-semibold">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/20"
                  placeholder="Create a strong password"
                  disabled={loading}
                  autoComplete="new-password"
                />
              </label>

              <button
                type="submit"
                disabled={loading || !name.trim() || !email.trim() || !phone.trim() || !password.trim()}
                className="w-full rounded-3xl bg-gradient-to-r from-primary to-accent px-5 py-3 text-sm font-semibold uppercase text-primary-foreground transition hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating account..." : "Sign up"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <a href="/login" className="font-semibold text-primary hover:underline">
                Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
