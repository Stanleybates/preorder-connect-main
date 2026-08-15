import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import {
  getCurrentCustomer,
  restoreCustomerSession,
  getSavedItems,
  changeCustomerPassword,
  updateCustomerProfileMultipart,
  logoutCustomer,
  type Customer,
} from "@/lib/customer-auth-store";
import {
  Package, Heart, Lock, User, MapPin, Camera, ClipboardList,
  History, Bell, ShieldCheck, LogOut, ChevronRight,
} from "lucide-react";
import { PRODUCTS, type Product, formatPrice } from "@/lib/store-data";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account" },
      { name: "description", content: "Manage your profile, address, saved items, and password." },
    ],
  }),
  component: Account,
});

function MenuLink({ to, icon, label, danger }: { to: string; icon: React.ReactNode; label: string; danger?: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center justify-between gap-3 px-6 py-4 text-sm font-semibold border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors ${
        danger ? "text-red-600" : "text-foreground"
      }`}
    >
      <span className="flex items-center gap-3">
        {icon} {label}
      </span>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </Link>
  );
}

function Account() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(getCurrentCustomer());
  const [checkingSession, setCheckingSession] = useState(!customer);

  useEffect(() => {
    if (customer) return;
    restoreCustomerSession().then((restored) => {
      if (restored) {
        setCustomer(restored);
      } else {
        navigate({ to: "/login", replace: true });
      }
      setCheckingSession(false);
    });
  }, [customer, navigate]);

  const savedItems = getSavedItems();

  // Profile fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileStatus, setProfileStatus] = useState("");
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    if (!customer) return;
    setName(customer.name);
    setPhone(customer.phone);
    setAddressLine(customer.address_line || "");
    setCity(customer.city || "");
    setRegion(customer.region || "");
    setAvatarPreview(customer.avatar || null);
  }, [customer]);

  // Password fields
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("");
  const [passwordError, setPasswordError] = useState("");

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  const savedProducts: Product[] = PRODUCTS.filter((product) => savedItems.includes(product.id));

  const onAvatarChange = (file: File | null) => {
    setAvatarFile(file);
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const onProfileSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileError("");
    setProfileStatus("");

    if (!name.trim() || !phone.trim()) {
      setProfileError("Name and phone are required.");
      return;
    }

    setProfileSaving(true);
    const result = await updateCustomerProfileMultipart({
      name: name.trim(),
      phone: phone.trim(),
      address_line: addressLine.trim(),
      city: city.trim(),
      region: region.trim(),
      avatar: avatarFile,
    });
    setProfileSaving(false);

    if (result.success && result.customer) {
      setCustomer(result.customer);
      setAvatarFile(null);
      setProfileStatus("Profile updated successfully.");
    } else {
      setProfileError(result.message);
    }
  };

  const onPasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordStatus("");
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords must match.");
      return;
    }
    const result = await changeCustomerPassword(password, newPassword);
    if (result.success) {
      setPasswordStatus(result.message);
      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setPasswordError(result.message);
    }
  };

  const inputClass =
    "mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary/20";

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-10 flex flex-col gap-3">
          <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow w-fit">
            <Package className="w-4 h-4" /> Account
          </div>
          <h1 className="text-4xl font-display font-bold">Welcome back, {customer.name.split(" ")[0]}.</h1>
          <p className="max-w-2xl text-muted-foreground">Manage your profile, address, saved items, and password.</p>
        </div>

        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8">
          <div className="space-y-8">
            {/* Profile */}
            <section className="rounded-3xl border border-border bg-card p-8 shadow-elevated">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Profile</p>
                  <h2 className="mt-2 text-2xl font-semibold">Your details</h2>
                </div>
                <User className="w-8 h-8 text-primary" />
              </div>

              <form onSubmit={onProfileSubmit} className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden bg-muted border border-border shrink-0">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                        {customer.name.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <label className="inline-flex items-center gap-2 rounded-2xl border border-border px-4 py-2.5 text-sm font-semibold cursor-pointer hover:bg-muted transition-colors">
                    <Camera className="w-4 h-4" /> Change photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => onAvatarChange(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>

                <label className="block text-sm">
                  <span className="font-semibold">Full name</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} disabled={profileSaving} />
                </label>

                <label className="block text-sm">
                  <span className="font-semibold">Email</span>
                  <input value={customer.email} disabled className={`${inputClass} opacity-60 cursor-not-allowed`} />
                </label>

                <label className="block text-sm">
                  <span className="font-semibold">Phone</span>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} disabled={profileSaving} />
                </label>

                {profileError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{profileError}</div>
                )}
                {profileStatus && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{profileStatus}</div>
                )}

                <button
                  type="submit"
                  disabled={profileSaving}
                  className="w-full rounded-2xl bg-gradient-to-r from-primary to-accent px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:shadow-glow disabled:opacity-60"
                >
                  {profileSaving ? "Saving..." : "Save profile"}
                </button>
              </form>
            </section>

            {/* Address */}
            <section className="rounded-3xl border border-border bg-card p-8 shadow-elevated">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Delivery</p>
                  <h2 className="mt-2 text-2xl font-semibold">Address</h2>
                </div>
                <MapPin className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">Saved as part of your profile above -- update and hit "Save profile" together.</p>
              <div className="space-y-4">
                <label className="block text-sm">
                  <span className="font-semibold">Street address</span>
                  <input value={addressLine} onChange={(e) => setAddressLine(e.target.value)} className={inputClass} placeholder="House number, street" />
                </label>
                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block text-sm">
                    <span className="font-semibold">City</span>
                    <input value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
                  </label>
                  <label className="block text-sm">
                    <span className="font-semibold">Region</span>
                    <input value={region} onChange={(e) => setRegion(e.target.value)} className={inputClass} />
                  </label>
                </div>
              </div>
            </section>

            {/* Saved items */}
            <section className="rounded-3xl border border-border bg-card p-8 shadow-elevated">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Saved items</p>
                  <h2 className="mt-2 text-2xl font-semibold">Saved for later</h2>
                </div>
                <Heart className="w-8 h-8 text-pink-500" />
              </div>
              {savedProducts.length === 0 ? (
                <div className="mt-8 rounded-3xl border border-dashed border-border/70 bg-background/80 p-8 text-center text-sm text-muted-foreground">
                  You haven't saved any items yet. Tap a product to save it for later.
                </div>
              ) : (
                <div className="mt-8 grid gap-4">
                  {savedProducts.map((product) => (
                    <div key={product.id} className="rounded-3xl border border-border bg-background p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{formatPrice(product.price)}</p>
                      </div>
                      <span className="rounded-2xl bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary">Saved</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-8">
            <section className="rounded-3xl border border-border bg-card shadow-elevated overflow-hidden">
              <MenuLink to="/account/orders" icon={<ClipboardList className="w-4.5 h-4.5" />} label="Order history" />
              <MenuLink to="/wishlist" icon={<Heart className="w-4.5 h-4.5" />} label="Wishlist" />
              <MenuLink to="/account/recently-viewed" icon={<History className="w-4.5 h-4.5" />} label="Recently viewed" />
              <MenuLink to="/account/notifications" icon={<Bell className="w-4.5 h-4.5" />} label="Notification preferences" />
              <MenuLink to="/privacy-policy" icon={<ShieldCheck className="w-4.5 h-4.5" />} label="Privacy policy" />
              <MenuLink to="/account/close" icon={<User className="w-4.5 h-4.5" />} label="Close account" danger />
              <button
                type="button"
                onClick={async () => {
                  await logoutCustomer();
                  navigate({ to: "/" });
                }}
                className="w-full flex items-center gap-3 px-6 py-4 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4.5 h-4.5" /> Logout
              </button>
            </section>

            <section className="rounded-3xl border border-border bg-card p-8 shadow-elevated">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Account</p>
                  <h2 className="mt-2 text-2xl font-semibold">Change password</h2>
                </div>
                <Lock className="w-8 h-8 text-slate-600" />
              </div>
              <form onSubmit={onPasswordSubmit} className="mt-8 space-y-5">
                <label className="block text-sm">
                  <span className="font-semibold">Current password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-semibold">New password</span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-semibold">Confirm new password</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClass}
                  />
                </label>
                {passwordError && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{passwordError}</div>}
                {passwordStatus && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{passwordStatus}</div>}
                <button type="submit" className="w-full rounded-2xl bg-gradient-to-r from-primary to-accent px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:shadow-glow">
                  Change password
                </button>
              </form>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
