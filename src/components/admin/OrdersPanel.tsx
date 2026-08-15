import { useEffect, useState } from "react";
import { Package, Truck, CheckCircle2, XCircle } from "lucide-react";
import { getOrders, updateOrderStatus, type Order } from "@/lib/orders-api";

type Props = {
  notify: (message: string, type: "success" | "error") => void;
};

const STATUS_OPTIONS: { value: Order["status"]; label: string; icon: React.ReactNode }[] = [
  { value: "processing", label: "Processing", icon: <Package className="h-3.5 w-3.5" /> },
  { value: "shipped", label: "Shipped", icon: <Truck className="h-3.5 w-3.5" /> },
  { value: "delivered", label: "Delivered", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  { value: "cancelled", label: "Cancelled", icon: <XCircle className="h-3.5 w-3.5" /> },
];

const statusStyle: Record<Order["status"], string> = {
  processing: "bg-warning/10 text-warning",
  shipped: "bg-primary/10 text-primary",
  delivered: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

export function OrdersPanel({ notify }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = async () => {
    const data = await getOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const onStatusChange = async (id: number, status: Order["status"]) => {
    setUpdatingId(id);
    const result = await updateOrderStatus(id, status);
    if (result.success) {
      setOrders(prev => prev.map(o => (o.id === id ? { ...o, status } : o)));
      notify(`Order #${id} marked ${status}.`, "success");
    } else {
      notify(result.message, "error");
    }
    setUpdatingId(null);
  };

  if (loading) {
    return <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Loading orders…</div>;
  }

  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No orders yet. Orders are created automatically once a payment succeeds.
        </div>
      ) : (
        <div className="grid gap-3">
          {orders.map(order => (
            <div key={order.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="truncate font-semibold">
                    {order.product_name ?? "Unknown product"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {order.customer_name || order.customer_email || "Unknown customer"} · {new Date(order.created_at).toLocaleDateString()}
                  </div>
                  {order.amount && (
                    <div className="mt-1 text-sm font-semibold">GH₵ {Number(order.amount).toLocaleString()}</div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusStyle[order.status]}`}>
                    {STATUS_OPTIONS.find(s => s.value === order.status)?.icon}
                    {order.status}
                  </span>
                  <select
                    value={order.status}
                    onChange={e => onStatusChange(order.id, e.target.value as Order["status"])}
                    disabled={updatingId === order.id}
                    className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:border-primary disabled:opacity-50"
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        Set: {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
