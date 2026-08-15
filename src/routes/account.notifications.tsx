import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Bell } from "lucide-react";
import { getCurrentCustomer, restoreCustomerSession, updateNotificationPrefs, type Customer } from "@/lib/customer-auth-store";

export const Route = createFileRoute("/account/notifications")({
  head: () => ({ meta: [{ title: "Notification Preferences" }] }),
  component: NotificationPreferences,
});

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={`relative w-12 h-7 rounded-full transition-colors shrink-0 disabled:opacity-50 ${checked ? "bg-primary" : "bg-muted"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
    </button>
  );
}

function NotificationPreferences() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(getCurrentCustomer());
  const [sessionChecked, setSessionChecked] = useState(!!customer);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (customer) return;
    restoreCustomerSession().then((restored) => {
      if (restored) setCustomer(restored);
      else navigate({ to: "/login", replace: true });
      setSessionChecked(true);
    });
  }, [customer, navigate]);

  if (!sessionChecked || !customer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  const onToggle = async (key: "notify_order_email" | "notify_order_whatsapp" | "notify_promo_email") => {
    setSaving(true);
    setStatus("");
    const result = await updateNotificationPrefs({ [key]: !customer[key] });
    setSaving(false);
    if (result.success && result.customer) {
      setCustomer(result.customer);
      setStatus("Saved");
      setTimeout(() => setStatus(""), 1500);
    }
  };

  const rows: { key: "notify_order_email" | "notify_order_whatsapp" | "notify_promo_email"; title: string; desc: string }[] = [
    { key: "notify_order_email", title: "Order updates by email", desc: "Get notified when your order status changes." },
    { key: "notify_order_whatsapp", title: "Order updates by WhatsApp", desc: "Receive delivery updates on WhatsApp." },
    { key: "notify_promo_email", title: "Promotions by email", desc: "Hear about sales and new arrivals." },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link to="/account" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to account
        </Link>

        <div className="mb-10 flex flex-col gap-3">
          <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow w-fit">
            <Bell className="w-4 h-4" /> Notifications
          </div>
          <h1 className="text-4xl font-display font-bold">Notification preferences</h1>
        </div>

        <div className="rounded-3xl border border-border bg-card divide-y divide-border shadow-elevated">
          {rows.map((row) => (
            <div key={row.key} className="flex items-center justify-between gap-4 p-6">
              <div>
                <p className="font-semibold">{row.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{row.desc}</p>
              </div>
              <Toggle checked={customer[row.key]} onChange={() => onToggle(row.key)} disabled={saving} />
            </div>
          ))}
        </div>
        {status && <p className="mt-4 text-sm text-emerald-600 font-medium">{status}</p>}
      </div>
    </div>
  );
}
