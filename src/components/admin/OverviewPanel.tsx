import { useEffect, useState } from "react";
import { getProducts, getCategories, type Product, type Category } from "@/lib/products-api";
import { getPayments, type Payment } from "@/lib/payments-api";
import { getPendingAdmins, type PendingAdmin } from "@/lib/auth-store";

type Props = {
  isSuperAdmin?: boolean;
};

const CHART_COLORS = ["#6366f1", "#06b6d4", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6", "#ec4899", "#84cc16"];

export function OverviewPanel({ isSuperAdmin }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pendingAdmins, setPendingAdmins] = useState<PendingAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [prods, cats, admins] = await Promise.all([
        getProducts(),
        getCategories(),
        isSuperAdmin ? getPendingAdmins() : Promise.resolve([]),
      ]);
      setProducts(prods);
      setCategories(cats);
      setPendingAdmins(admins);

      if (isSuperAdmin) {
        setPayments(await getPayments());
      }
      setLoading(false);
    };
    load();
  }, [isSuperAdmin]);

  if (loading) {
    return <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Loading overview…</div>;
  }

  const inStock = products.filter(p => p.status === "in-stock").length;
  const preStock = products.filter(p => p.status === "pre-stock").length;
  const stockTotal = Math.max(inStock + preStock, 1);

  const categoryBreakdown = categories
    .map(c => ({ name: c.name, count: products.filter(p => p.category === c.id).length }))
    .filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count);
  const categoryMax = Math.max(...categoryBreakdown.map(c => c.count), 1);

  const successfulPayments = payments.filter(p => p.status === "success");
  const days: { label: string; amount: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toISOString().slice(0, 10);
    const amount = successfulPayments
      .filter(p => p.created_at?.slice(0, 10) === label)
      .reduce((sum, p) => sum + Number(p.amount), 0);
    days.push({ label: label.slice(5), amount });
  }
  const salesMax = Math.max(...days.map(d => d.amount), 1);
  const totalRevenue = successfulPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingCount = pendingAdmins.filter(a => a.status === "pending").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Products</p>
          <p className="mt-1 text-2xl font-bold">{products.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Categories</p>
          <p className="mt-1 text-2xl font-bold">{categories.length}</p>
        </div>
        {isSuperAdmin && (
          <>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Revenue</p>
              <p className="mt-1 text-2xl font-bold">GH₵ {totalRevenue.toLocaleString()}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Sub-admin requests</p>
              <p className="mt-1 text-2xl font-bold">{pendingCount}</p>
            </div>
          </>
        )}
      </div>

      {isSuperAdmin && (
        <div className="rounded-3xl border border-border bg-card p-5">
          <p className="mb-4 text-sm font-semibold">Sales — last 7 days</p>
          <div className="flex h-32 items-end gap-2">
            {days.map(d => (
              <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-primary/70"
                  style={{ height: `${Math.max((d.amount / salesMax) * 100, 4)}%` }}
                />
                <span className="text-[10px] text-muted-foreground">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-5">
          <p className="mb-4 text-sm font-semibold">Stock status</p>
          <div className="space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>In stock</span>
                <span>{inStock}</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-success" style={{ width: `${(inStock / stockTotal) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                <span>Pre-order</span>
                <span>{preStock}</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-warning" style={{ width: `${(preStock / stockTotal) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-5">
          <p className="mb-4 text-sm font-semibold">Products by category</p>
          {categoryBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground">No products yet.</p>
          ) : (
            <div className="space-y-2.5">
              {categoryBreakdown.map((c, i) => (
                <div key={c.name}>
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>{c.name}</span>
                    <span>{c.count}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(c.count / categoryMax) * 100}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
