import { createFileRoute, useNavigate, useLocation, Outlet } from "@tanstack/react-router";
import { FormEvent, useEffect, useState } from "react";
import { PRODUCTS, STORE, PAYMENTS, CATEGORIES, addProduct, updateProductPrice } from "@/lib/store-data";
import { isAuthenticated, getCurrentUser, logout } from "@/lib/auth-store";
import { SiteHeader } from "@/components/SiteHeader";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: Admin,
});

function Admin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [, setTick] = useState(0);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("iphones");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<"in-stock" | "pre-stock">("in-stock");
  const [eta, setEta] = useState("");
  const [tag, setTag] = useState("");
  const [emoji, setEmoji] = useState("📦");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [statusType, setStatusType] = useState<"success" | "error">("success");

  const currentUser = getCurrentUser();

  // Redirect anonymous visitors from the admin root to login.
  useEffect(() => {
    if (!isAuthenticated() && location.pathname === "/admin") {
      navigate({ to: "/admin/login", replace: true });
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImagePreview(reader.result);
      }
    };
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  const forceRerender = () => setTick(t => t + 1);

  const onPriceChange = (id: string, v: string) => {
    const n = Number(v || 0);
    updateProductPrice(id, n);
    forceRerender();
  };

  const onUpdateProduct = (id: string) => {
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) {
      setStatusType("error");
      setStatusMessage("Unable to update the product. Please try again.");
      return;
    }

    setStatusType("success");
    setStatusMessage(`Product "${product.name}" updated successfully.`);
    forceRerender();
  };

  const resetForm = () => {
    setName("");
    setCategory("iphones");
    setPrice("");
    setStatus("in-stock");
    setEta("");
    setTag("");
    setEmoji("📦");
    setImageFile(null);
    setImagePreview("");
  };

  const onAddProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage("");

    if (!name.trim() || !price.trim() || !imagePreview) {
      setStatusType("error");
      setStatusMessage("Please fill in all required fields and upload an image.");
      return;
    }

    const hue = CATEGORIES.find(cat => cat.id === category)?.id.length ?? 220;
    const newProduct = addProduct({
      id: "",
      name: name.trim(),
      category,
      price: Number(price),
      status,
      eta: status === "pre-stock" ? (eta.trim() || "Arrives soon") : undefined,
      emoji: emoji.trim() || "📦",
      image: imagePreview,
      hue: typeof hue === "number" ? hue : 220,
      tag: tag.trim() || undefined,
    });

    if (newProduct) {
      setStatusType("success");
      setStatusMessage(`Product "${newProduct.name}" added successfully!`);
      resetForm();
      forceRerender();
    } else {
      setStatusType("error");
      setStatusMessage("Failed to add product. Try again.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate({ to: "/admin/login", replace: true });
  };

  if (!isAuthenticated()) {
    return location.pathname === "/admin" ? null : <Outlet />;
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-display font-bold">Admin — Products & Payments</h1>
            <p className="text-sm text-muted-foreground mt-1">Logged in as <span className="font-semibold">{currentUser.username}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/admin/reset-password"
              className="px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-all"
            >
              Change Password
            </a>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 text-sm font-semibold inline-flex items-center gap-2 transition-all"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Products</h2>
          <div className="grid gap-3">
            {PRODUCTS.map(p => (
                <div key={p.id} className="flex flex-col gap-3 p-4 rounded-2xl border bg-card sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center text-xl">{p.emoji}</div>
                    <div>
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-sm text-muted-foreground">{p.category} • {p.status}</div>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center w-full sm:w-auto">
                    <input
                      value={String(p.price)}
                      onChange={(e) => onPriceChange(p.id, e.target.value)}
                      className="w-full rounded-md border px-3 py-2 bg-background"
                    />
                    <button
                      type="button"
                      onClick={() => onUpdateProduct(p.id)}
                      className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
                    >
                      Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-10 rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold">Add New Product</h2>
              <p className="text-sm text-muted-foreground">Upload an image, set price, and choose stock status.</p>
            </div>
            <div className="rounded-full bg-muted px-3 py-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">In-memory only</div>
          </div>

          <form className="grid gap-5" onSubmit={onAddProduct}>
            {statusMessage && (
              <div className={`rounded-xl p-4 text-sm ${statusType === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
                {statusMessage}
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium">Product name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border px-3 py-2 bg-background"
                  placeholder="e.g. iPhone 15 Pro Max"
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-medium">Category</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-border px-3 py-2 bg-background"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-medium">Price</span>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full rounded-xl border border-border px-3 py-2 bg-background"
                  type="number"
                  min="0"
                  placeholder="2500"
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-medium">Status</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "in-stock" | "pre-stock")}
                  className="w-full rounded-xl border border-border px-3 py-2 bg-background"
                >
                  <option value="in-stock">In stock</option>
                  <option value="pre-stock">Pre-order</option>
                </select>
              </label>
            </div>

            {status === "pre-stock" && (
              <label className="space-y-2 text-sm">
                <span className="font-medium">ETA</span>
                <input
                  value={eta}
                  onChange={(e) => setEta(e.target.value)}
                  className="w-full rounded-xl border border-border px-3 py-2 bg-background"
                  placeholder="Arrives in 7 days"
                />
              </label>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              <label className="space-y-2 text-sm">
                <span className="font-medium">Emoji</span>
                <input
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  className="w-full rounded-xl border border-border px-3 py-2 bg-background"
                  placeholder="📱"
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-medium">Tag (optional)</span>
                <input
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full rounded-xl border border-border px-3 py-2 bg-background"
                  placeholder="Bestseller"
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-medium">Image from gallery</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-green-500/50 bg-green-50/30 hover:bg-green-50/50 hover:border-green-500 text-sm font-medium text-foreground transition-all cursor-pointer"
                />
              </label>
            </div>

            {imagePreview && (
              <div className="rounded-3xl overflow-hidden border border-border bg-black/5">
                <img src={imagePreview} alt="Preview" className="w-full object-cover" style={{ aspectRatio: "4 / 3" }} />
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Uploaded images appear instantly in the product list. Changes are stored in memory for this session.
              </p>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
              >
                Add product
              </button>
            </div>
          </form>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">Payments</h2>
          <div className="rounded-2xl border p-4 bg-card">
            <div className="text-sm text-muted-foreground mb-2">Provider</div>
            <div className="font-semibold mb-4">{STORE.payment.provider}</div>
            <div className="text-sm text-muted-foreground mb-2">Checkout URL</div>
            <div className="break-all mb-4">{(STORE.payment as any).checkoutUrl}</div>
            <div className="text-sm text-muted-foreground mb-2">Recent payments (in-memory)</div>
            {PAYMENTS.length === 0 ? (
              <div className="text-sm text-muted-foreground">No payments yet.</div>
            ) : (
              <div className="mt-2 grid gap-2">
                {PAYMENTS.map(pay => (
                  <div key={pay.id} className="rounded-md p-2 bg-background flex items-center justify-between">
                    <div className="text-sm">{pay.productId} • {STORE.currency} {pay.amount}</div>
                    <div className="text-xs text-muted-foreground">{pay.status} • {pay.date}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
