import { CreditCard, ExternalLink } from "lucide-react";
import { PAYMENTS, STORE, PRODUCTS, formatPrice, getStoreStats } from "@/lib/store-data";

export function PaymentsPanel() {
  const stats = getStoreStats();
  const checkoutUrl = (STORE.payment as { checkoutUrl?: string }).checkoutUrl ?? "";
  const productName = (id: string) => PRODUCTS.find(p => p.id === id)?.name ?? id;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-3d">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Provider</div>
          <div className="mt-1 font-display font-bold">{STORE.payment.provider}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-3d">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Transactions</div>
          <div className="mt-1 font-display font-bold">{stats.payments}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-3d">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">Total revenue</div>
          <div className="mt-1 font-display font-bold">{formatPrice(stats.revenue)}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-3d">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">Checkout URL</div>
        <a
          href={checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-1.5 break-all text-sm font-medium text-primary hover:underline"
        >
          {checkoutUrl} <ExternalLink className="h-3.5 w-3.5 shrink-0" />
        </a>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-3d">
        <div className="mb-3 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">Recent payments</h3>
        </div>
        {PAYMENTS.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No payments recorded yet.
          </div>
        ) : (
          <div className="grid gap-2">
            {PAYMENTS.map(pay => (
              <div key={pay.id} className="flex items-center justify-between rounded-xl bg-background p-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{productName(pay.productId)}</div>
                  <div className="text-xs text-muted-foreground">{pay.date}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{formatPrice(pay.amount)}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      pay.status === "success" || pay.status === "paid"
                        ? "bg-success/10 text-success"
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
