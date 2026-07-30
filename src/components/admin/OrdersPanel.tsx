export function OrdersPanel() {
  const orderRows = [
    { title: "Order #A1024", state: "Processing", note: "Awaiting dispatch" },
    { title: "Order #A1025", state: "Shipped", note: "Courier tracking active" },
    { title: "Order #A1026", state: "Delivered", note: "Delivery confirmed" },
  ];

  const preorders = [
    { title: "Pre-order: iPhone 17 Pro Max", eta: "Arrives in 10 days" },
    { title: "Pre-order: AirPods Pro 2", eta: "Arrives in 5 days" },
  ];

  const warnings = [
    "Low stock warning on iPhone 13 Pro 256GB",
    "Movement warning: 4 units pending warehouse update",
    "Refund warning: verify cancelled order A1018",
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        Placeholder view — wire this up to real order data when ready.
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {orderRows.map(order => (
          <div key={order.title} className="rounded-3xl border border-border bg-gradient-to-br from-sky-50 to-white p-4">
            <p className="text-sm font-semibold text-foreground">{order.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{order.state}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">{order.note}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-5">
          <p className="text-sm font-semibold">Pre-orders</p>
          <div className="mt-4 grid gap-3">
            {preorders.map(item => (
              <div key={item.title} className="rounded-2xl bg-muted/50 p-4">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.eta}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-900">Movement warnings</p>
          <div className="mt-4 grid gap-3">
            {warnings.map(item => (
              <div key={item} className="rounded-2xl bg-white/80 p-4 text-sm text-amber-900">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
