import { FormEvent, useEffect, useState } from "react";
import { Save, Store, UserCircle } from "lucide-react";
import { useSiteSettings, updateSiteSettingsApi } from "@/lib/catalog-api";
import { getAccessToken } from "@/lib/auth-store";
import { AccountPanel } from "@/components/admin/AccountPanel";

type InnerTab = "store" | "account";

type Props = {
  onChange: () => void;
  notify: (message: string, type: "success" | "error") => void;
  initialInnerTab?: InnerTab;
  isSuperAdmin?: boolean;
};

export function StoreSettings({ onChange, notify, initialInnerTab, isSuperAdmin }: Props) {
  const [innerTab, setInnerTab] = useState<InnerTab>(isSuperAdmin ? (initialInnerTab ?? "store") : "account");

  useEffect(() => {
    if (!isSuperAdmin) {
      setInnerTab("account");
    } else if (initialInnerTab) {
      setInnerTab(initialInnerTab);
    }
  }, [initialInnerTab, isSuperAdmin]);
  const { data: settings, isLoading: settingsLoading, refetch } = useSiteSettings();
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [currency, setCurrency] = useState("");
  const [provider, setProvider] = useState("");
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [currencyCode, setCurrencyCode] = useState("GHS");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setName(settings.name);
      setTagline(settings.tagline);
      setWhatsapp(settings.whatsapp);
      setCurrency(settings.currency);
      setCurrencyCode(settings.currency_code || "GHS");
      setProvider(settings.payment_provider);
      setCheckoutUrl(settings.checkout_url);
    }
  }, [settings]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !whatsapp.trim() || !currency.trim()) {
      notify("Store name, WhatsApp number, and currency are required.", "error");
      return;
    }
    const token = getAccessToken();
    if (!token) {
      notify("You must be logged in as super admin to save settings.", "error");
      return;
    }
    setSaving(true);
    try {
      await updateSiteSettingsApi(
        {
          name: name.trim(),
          tagline: tagline.trim(),
          whatsapp: whatsapp.trim(),
          currency: currency.trim(),
          currency_code: currencyCode,
          payment_provider: provider.trim(),
          checkout_url: checkoutUrl.trim(),
        },
        token
      );
      notify("Store settings saved.", "success");
      refetch();
      onChange();
    } catch (err) {
      notify(err instanceof Error ? err.message : "Failed to save settings.", "error");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-border px-3 py-2 bg-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary";

  const innerTabs: { id: InnerTab; label: string; icon: React.ReactNode }[] = isSuperAdmin
    ? [
        { id: "store", label: "Store", icon: <Store className="h-4 w-4" /> },
        { id: "account", label: "Account", icon: <UserCircle className="h-4 w-4" /> },
      ]
    : [{ id: "account", label: "Account", icon: <UserCircle className="h-4 w-4" /> }];

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
              <span className="font-medium">Checkout currency (Paystack)</span>
              <select value={currencyCode} onChange={e => setCurrencyCode(e.target.value)} className={inputClass}>
                <option value="GHS">Ghanaian Cedi (GHS)</option>
                <option value="NGN">Nigerian Naira (NGN)</option>
                <option value="ZAR">South African Rand (ZAR)</option>
                <option value="KES">Kenyan Shilling (KES)</option>
                <option value="USD">US Dollar (USD)</option>
              </select>
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
              disabled={saving || settingsLoading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-60"
            >
              <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save settings"}
            </button>
          </div>
        </form>
      )}

      {innerTab === "account" && <AccountPanel notify={notify} onChange={onChange} />}
    </div>
  );
}
