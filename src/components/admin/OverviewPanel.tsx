import { AdminStats } from "@/components/admin/AdminStats";
import { getAnalysisMetrics, SUB_ADMIN_REQUESTS } from "@/lib/store-data";

export function OverviewPanel() {
  const m = getAnalysisMetrics(7);
  const vals = m.paymentsByDay.map(p => p.amount);
  const max = Math.max(...vals, 1);
  const barWidth = 100 / m.paymentsByDay.length;

  return (
    <div className="space-y-6">
      <AdminStats />

      <div className="rounded-3xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Sales — last 7 days</p>
            <p className="text-xs text-muted-foreground">Completed: {m.completedPayments} · Pending: {m.pendingPayments}</p>
          </div>
        </div>
        <div className="flex h-32 items-end gap-2">
          {m.paymentsByDay.map(d => (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t-md bg-primary/70"
                style={{ height: `${Math.max((d.amount / max) * 100, 4)}%`, minWidth: `${barWidth}%` }}
              />
              <span className="text-[10px] text-muted-foreground">{d.date.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">Stock overview</p>
          <p className="mt-2 text-2xl font-bold">{m.totalProducts}</p>
          <p className="text-sm text-muted-foreground">In stock: {m.inStock} · Pre-order: {m.preStock}</p>
        </div>
        <div className="rounded-3xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">Sub-admin requests</p>
          <p className="mt-2 text-2xl font-bold">{m.subAdminPending}</p>
          <p className="text-sm text-muted-foreground">
            {SUB_ADMIN_REQUESTS.length === 0 ? "No requests yet" : "Pending approval"}
          </p>
        </div>
      </div>
    </div>
  );
}
