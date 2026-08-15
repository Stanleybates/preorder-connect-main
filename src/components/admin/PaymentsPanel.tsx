import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import { getPayments, type Payment } from "@/lib/payments-api";
import { STORE } from "@/lib/store-data";

export function PaymentsPanel() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPayments().then(data => {
      setPayments(data);
      setLoading(false);
    });
  }, []);

  const totalRevenue = payments
    .filter(p => p.status === "success")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  if (loading) {
    return <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Loading payments…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-3d">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Provider</div>
          <div className="mt-1 font-display font-bold">Paystack</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-3d">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Transactions</div>
          <div className="mt-1 font-display font-bold">{payments.length}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-3d">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Total revenue</div>
          <div className="mt-1 font-display font-bold">{STORE.currency} {totalRevenue.toLocaleString()}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-3d">
        <div className="mb-3 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Recent payments</h3>
        </div>
        {payments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No payments recorded yet.
          </div>
        ) : (
          <div className="grid gap-2">
            {payments.map(pay => (
              <div key={pay.id} className="flex flex-col gap-2 rounded-xl bg-background p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{pay.product_name ?? "Unknown product"}</div>
                  <div className="text-xs text-muted-foreground">
                    {pay.payer_name || pay.payer_email || "Unknown payer"} · {new Date(pay.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{STORE.currency} {Number(pay.amount).toLocaleString()}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      pay.status === "success"
                        ? "bg-success/10 text-success"
                        : pay.status === "refunded"
                        ? "bg-muted text-muted-foreground"
                        : "bg-warning/10 text-warning"
                    }`}
                  >
                    {pay.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
