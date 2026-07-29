import { Boxes, CheckCircle2, Clock, Wallet, Tags, CreditCard } from "lucide-react";
import { getStoreStats, formatPrice } from "@/lib/store-data";

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-3d">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent}`}>{icon}</span>
      </div>
      <div className="mt-3 text-2xl font-display font-bold">{value}</div>
    </div>
  );
}

export function AdminStats() {
  const stats = getStoreStats();

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      <StatCard
        label="Products"
        value={String(stats.total)}
        icon={<Boxes className="h-4 w-4" />}
        accent="bg-primary/10 text-primary"
      />
      <StatCard
        label="In Stock"
        value={String(stats.inStock)}
        icon={<CheckCircle2 className="h-4 w-4" />}
        accent="bg-success/10 text-success"
      />
      <StatCard
        label="Pre-Order"
        value={String(stats.preStock)}
        icon={<Clock className="h-4 w-4" />}
        accent="bg-warning/10 text-warning"
      />
      <StatCard
        label="Categories"
        value={String(stats.categoriesUsed)}
        icon={<Tags className="h-4 w-4" />}
        accent="bg-accent/10 text-accent"
      />
      <StatCard
        label="Inventory"
        value={formatPrice(stats.inventoryValue)}
        icon={<Wallet className="h-4 w-4" />}
        accent="bg-primary/10 text-primary"
      />
      <StatCard
        label="Payments"
        value={String(stats.payments)}
        icon={<CreditCard className="h-4 w-4" />}
        accent="bg-accent/10 text-accent"
      />
    </div>
  );
}
