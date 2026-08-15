import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2, Package } from "lucide-react";
import { API_BASE_URL } from "@/lib/api-config";

export const Route = createFileRoute("/admin/verify-unlock/$uidb64/$token")({
  component: VerifyUnlock,
});

function VerifyUnlock() {
  const { uidb64, token } = Route.useParams();
  const [status, setStatus] = useState<"checking" | "success" | "error">("checking");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${API_BASE_URL}/verify-unlock/${uidb64}/${token}/`)
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (res.ok) {
          setStatus("success");
          setMessage(data?.detail || "Account verified and unlocked.");
        } else {
          setStatus("error");
          setMessage(data?.detail || "Invalid or expired verification link.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Could not reach the server. Check your connection and try again.");
      });
  }, [uidb64, token]);

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{ backgroundImage: "url('/admin-login-bg.webp')" }}
    >
      <div className="absolute inset-0 bg-black/65" />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="rounded-[2.5rem] border border-white/10 bg-white/90 backdrop-blur-xl p-8 shadow-elevated text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-br from-primary to-accent shadow-glow mb-4">
              <Package className="w-6 h-6 text-primary-foreground" />
            </div>

            {status === "checking" && (
              <>
                <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin mb-4" />
                <h1 className="text-xl font-display font-bold text-slate-950">Verifying...</h1>
              </>
            )}

            {status === "success" && (
              <>
                <CheckCircle2 className="w-10 h-10 mx-auto text-success mb-4" />
                <h1 className="text-xl font-display font-bold text-slate-950">Account unlocked</h1>
                <p className="text-sm text-slate-600 mt-2">{message}</p>
                <Link
                  to="/admin"
                  className="mt-6 inline-flex items-center justify-center w-full rounded-3xl bg-gradient-to-r from-primary to-accent px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-neon transition-all"
                >
                  Go to login
                </Link>
              </>
            )}

            {status === "error" && (
              <>
                <XCircle className="w-10 h-10 mx-auto text-red-500 mb-4" />
                <h1 className="text-xl font-display font-bold text-slate-950">Verification failed</h1>
                <p className="text-sm text-slate-600 mt-2">{message}</p>
                <Link
                  to="/admin"
                  className="mt-6 inline-flex items-center justify-center w-full rounded-3xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-50 transition-all"
                >
                  Back to login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
