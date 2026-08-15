import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Package, ClipboardList, CheckCircle2, Truck, XCircle, Clock } from "lucide-react";
import { getCurrentCustomer, restoreCustomerSession } from "@/lib/customer-auth-store";
import { useMyOrders, type Order } from "@/lib/orders-api";
import { STORE } from "@/lib/store-data";

export const Route = createFileRoute("/account/orders")({
  head: () => ({
    meta: [
      { title: "Order History" },
      { name: "description", content: "View your past and current orders." },
    ],
  }),
  component: OrderHistory,
});

const STATUS_CONFIG: Record<Order["status"], { label: string; color: string; icon: typeof Clock }> = {
  processing: { label: "Processing", color: "bg-amber-50 text-amber-800 border-amber-200", icon: Clock },
  shipped: { label: "Shipped", color: "bg-blue-50 text-blue-800 border-blue-200", icon: Truck },
  delivered: { label: "Delivered", color: "bg-emerald-50 text-emerald-800 border-emerald-200", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-50 text-red-800 border-red-200", icon: XCircle },
};

function formatMoney(n: string | null) {
  if (!n) return "—";
  return `${STORE.currency} ${Number(n).toLocaleString()}`;
}

function OrderHistory() {
  const navigate = useNavigate();
  const [sessionChecked, setSessionChecked] = useState(!!getCurrentCustomer());

  useEffect(() => {
    if (getCurrentCustomer()) return;
    restoreCustomerSession().then((restored) => {
      if (!restored) {
        navigate({ to: "/login", replace: true });
      }
      setSessionChecked(true);
    });
  }, [navigate]);

  const { data: orders, isLoading, isError } = useMyOrders();

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <Link to="/account" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to account
        </Link>

        <div className="mb-10 flex flex-col gap-3">
          <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow w-fit">
            <ClipboardList className="w-4 h-4" /> Order History
          </div>
          <h1 className="text-4xl font-display font-bold">Your orders</h1>
          <p className="text-muted-foreground">Track the status of everything you've ordered.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
        ) : isError ? (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
            Couldn't load your orders right now. Pull to refresh or check back shortly.
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center">
            <Package className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">You haven't placed any orders yet.</p>
            <Link
              to="/"
              className="mt-4 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const config = STATUS_CONFIG[order.status];
              const StatusIcon = config.icon;
              const lineItems = order.items.length > 0
                ? order.items
                : order.product_name
                ? [{ id: 0, product: order.product, product_name: order.product_name, quantity: 1, price: order.amount || "0" }]
                : [];

              return (
                <div key={order.id} className="rounded-3xl border border-border bg-card p-6 shadow-elevated">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-semibold">
                        Order #{order.id}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(order.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${config.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" /> {config.label}
                    </span>
                  </div>

                  {lineItems.length > 0 && (
                    <div className="mt-4 space-y-2 border-t border-border pt-4">
                      {lineItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span>
                            {item.product_name} {item.quantity > 1 ? `× ${item.quantity}` : ""}
                          </span>
                          <span className="font-semibold">{formatMoney(item.price)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="text-lg font-display font-bold text-gradient">{formatMoney(order.amount)}</span>
                  </div>

                  {order.delivery_address && (
                    <p className="mt-3 text-xs text-muted-foreground">Delivering to: {order.delivery_address}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
