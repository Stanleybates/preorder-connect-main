import { FormEvent, useEffect, useState } from "react";
import { Save, Store, UserCircle } from "lucide-react";
import { STORE, updateStoreSettings } from "@/lib/store-data";
import { AccountPanel } from "@/components/admin/AccountPanel";

type InnerTab = "store" | "account";

type Props = {
  onChange: () => void;
  notify: (message: string, type: "success" | "error") => void;
  initialInnerTab?: InnerTab;
};

export function StoreSettings({ onChange, notify, initialInnerTab }: Props) {
  const [innerTab, setInnerTab] = useState<InnerTab>(initialInnerTab ?? "store");

  useEffect(() => {
    if (initialInnerTab) setInnerTab(initialInnerTab);
  }, [initialInnerTab]);
  const [name, setName] = useState(STORE.name);
  const [tagline, setTagline] = useState(STORE.tagline);
  const [whatsapp, setWhatsapp] = useState(STORE.whatsapp);
  const [currency, setCurrency] = useState(STORE.currency);
  const [provider, setProvider] = useState(STORE.payment.provider);
  const [checkoutUrl, setCheckoutUrl] = useState((STORE.payment as { checkoutUrl?: string }).checkoutUrl ?? "");

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !whatsapp.trim() || !currency.trim()) {
      notify("Store name, WhatsApp number, and currency are required.", "error");
      return;
    }
    updateStoreSettings({
      name: name.trim(),
      tagline: tagline.trim(),
      whatsapp: whatsapp.trim(),
      currency: currency.trim(),
      paymentProvider: provider.trim(),
      checkoutUrl: checkoutUrl.trim(),
    });
    notify("Store settings saved.", "success");
    onChange();
  };

  const inputClass =
    "w-full rounded-xl border border-border px-3 py-2 bg-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary";

  const innerTabs: { id: InnerTab; label: string; icon: React.ReactNode }[] = [
    { id: "store", label: "Store", icon: <Store className="h-4 w-4" /> },
    { id: "account", label: "Account", icon: <UserCircle className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-border">
        {innerTabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setInnerTab(tab.id)}
            className={`inline-flex items-center gap-2 rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
              innerTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {innerTab === "store" && (
        <form onSubmit={onSubmit} className="rounded-3xl border border-border bg-card p-6 shadow-3d">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Store Settings</h2>
            <p className="text-sm text-muted-foreground">Manage your storefront branding and payment details.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-medium">Store name</span>
              <input value={name} onChange={e => setName(e.target.value)} className={inputClass} />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium">Tagline</span>
              <input value={tagline} onChange={e => setTagline(e.target.value)} className={inputClass} />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium">WhatsApp number</span>
              <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className={inputClass} placeholder="+233200000000" />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium">Currency symbol</span>
              <input value={currency} onChange={e => setCurrency(e.target.value)} className={inputClass} placeholder="GH₵" />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium">Payment provider</span>
              <input value={provider} onChange={e => setProvider(e.target.value)} className={inputClass} placeholder="Paystack" />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium">Checkout URL</span>
              <input value={checkoutUrl} onChange={e => setCheckoutUrl(e.target.value)} className={inputClass} placeholder="https://paystack.com/pay/…" />
            </label>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
            >
              <Save className="h-4 w-4" /> Save settings
            </button>
          </div>
        </form>
      )}

      {innerTab === "account" && <AccountPanel notify={notify} onChange={onChange} />}
    </div>
  );
}
