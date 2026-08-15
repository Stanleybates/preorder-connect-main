import { FormEvent, useEffect, useState } from "react";
import { Plus, Trash2, Megaphone, FileText, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getProducts, type Product } from "@/lib/products-api";
import { getCategories, type Category } from "@/lib/catalog-api";
import {
  getPromotions,
  getPromoRequests,
  createPromotionApi,
  createPromoRequestApi,
  createFlyerApi,
  togglePromotionApi,
  deletePromotionApi,
  approvePromoRequestApi,
  rejectPromoRequestApi,
  type Promotion,
  type PromoRequest,
} from "@/lib/promotions-api";
import { ImagePlus } from "lucide-react";

type Props = {
  onChange: () => void;
  notify: (message: string, type: "success" | "error") => void;
  isSuperAdmin?: boolean;
  currentUsername: string;
};

export function PromotionsPanel({ onChange, notify, isSuperAdmin, currentUsername }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [requests, setRequests] = useState<PromoRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [discount, setDiscount] = useState("10");
  const [reason, setReason] = useState("");
  const [benefits, setBenefits] = useState("");
  const [projectedProfit, setProjectedProfit] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Flyer fields -- optional; only super admins can attach a flyer to a promo
  const [categories, setCategories] = useState<Category[]>([]);
  const [addFlyer, setAddFlyer] = useState(false);
  const [flyerImage, setFlyerImage] = useState<File | null>(null);
  const [flyerPreview, setFlyerPreview] = useState("");
  const [linkType, setLinkType] = useState<"products" | "category">("products");
  const [flyerCategory, setFlyerCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [audience, setAudience] = useState<"all" | "guests" | "customers">("all");

  const load = async () => {
    const [prods, promos, reqs, cats] = await Promise.all([
      getProducts(), getPromotions(), getPromoRequests(), getCategories(),
    ]);
    setProducts(prods);
    setPromotions(promos);
    setRequests(reqs);
    setCategories(cats);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const reload = async () => {
    await load();
    onChange();
  };

  const toggleProduct = (id: number) => {
    setSelectedIds(ids => (ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]));
  };

  const resetForm = () => {
    setTitle("");
    setDiscount("10");
    setReason("");
    setBenefits("");
    setProjectedProfit("");
    setSelectedIds([]);
    setAddFlyer(false);
    setFlyerImage(null);
    setFlyerPreview("");
    setLinkType("products");
    setFlyerCategory("");
    setStartDate("");
    setEndDate("");
    setAudience("all");
  };

  const onFlyerFileChange = (file: File | null) => {
    setFlyerImage(file);
    if (!file) {
      setFlyerPreview("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setFlyerPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) {
      notify("Give the promo a title.", "error");
      return;
    }
    if (!(addFlyer && linkType === "category") && selectedIds.length === 0) {
      notify("Select at least one product.", "error");
      return;
    }
    if (addFlyer && linkType === "category" && !flyerCategory) {
      notify("Select a category for this flyer.", "error");
      return;
    }

    if (isSuperAdmin) {
      const result = addFlyer
        ? await createFlyerApi({
            title: title.trim(),
            discount_percent: Number(discount) || 0,
            product_ids: linkType === "products" ? selectedIds : [],
            link_type: linkType,
            category: linkType === "category" ? flyerCategory || null : null,
            start_date: startDate ? new Date(startDate).toISOString() : null,
            end_date: endDate ? new Date(endDate).toISOString() : null,
            audience,
            flyer_image: flyerImage,
          })
        : await createPromotionApi({
            title: title.trim(),
            discount_percent: Number(discount) || 0,
            product_ids: selectedIds,
          });
      if (result.success) {
        notify(`Promotion "${title.trim()}" created.`, "success");
      } else {
        notify(result.message, "error");
        return;
      }
    } else {
      if (!reason.trim() || !benefits.trim()) {
        notify("Please explain the reason and expected benefits for this promo.", "error");
        return;
      }
      const result = await createPromoRequestApi({
        title: title.trim(),
        reason: reason.trim(),
        benefits: benefits.trim(),
        projected_profit: projectedProfit.trim() || "Not specified",
        discount_percent: Number(discount) || 0,
        product_ids: selectedIds,
      });
      if (result.success) {
        notify("Promotion request submitted for super admin review.", "success");
      } else {
        notify(result.message, "error");
        return;
      }
    }

    resetForm();
    setShowAdd(false);
    reload();
  };

  const onApproveRequest = async (id: number, requestTitle: string) => {
    const result = await approvePromoRequestApi(id);
    if (result.success) {
      notify(`Promotion "${requestTitle}" approved and created.`, "success");
      reload();
    } else {
      notify(result.message, "error");
    }
  };

  const onRejectRequest = async (id: number, requestTitle: string) => {
    const result = await rejectPromoRequestApi(id);
    if (result.success) {
      notify(`Promotion request "${requestTitle}" rejected.`, "error");
      reload();
    } else {
      notify(result.message, "error");
    }
  };

  const onTogglePromo = async (id: number) => {
    const result = await togglePromotionApi(id);
    if (result.success) reload();
    else notify(result.message, "error");
  };

  const onDeletePromo = async (id: number, promoTitle: string) => {
    const result = await deletePromotionApi(id);
    if (result.success) {
      notify(`Promotion "${promoTitle}" removed.`, "success");
      reload();
    } else {
      notify(result.message, "error");
    }
  };

  const inputClass =
    "w-full rounded-xl border border-border px-3 py-2 bg-background text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary";

  const pendingRequests = requests.filter(r => r.status === "pending");

  if (loading) {
    return <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isSuperAdmin
            ? "Create promo campaigns and pick which products they apply to."
            : "Submit a promo request with your reasoning for super admin review."}
        </p>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> {isSuperAdmin ? "New Promotion" : "Request Promotion"}
        </button>
      </div>

      {isSuperAdmin && pendingRequests.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            <FileText className="h-4 w-4" /> Pending Promo Requests
          </h3>
          {pendingRequests.map(req => (
            <div key={req.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="font-semibold">{req.title}</div>
                  <div className="text-xs text-muted-foreground">
                    Requested by {req.requested_by_username ?? "unknown"} · {new Date(req.created_at).toLocaleDateString()} · {req.discount_percent}% off
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:shrink-0">
                  <button
                    onClick={() => onApproveRequest(req.id, req.title)}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white"
                  >
                    <Check className="h-3.5 w-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => onRejectRequest(req.id, req.title)}
                    className="inline-flex items-center gap-1 rounded-lg bg-red-500 px-3 py-1.5 text-sm font-semibold text-white"
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-sm">
                <p><span className="font-medium">Reason:</span> {req.reason}</p>
                <p><span className="font-medium">Benefits:</span> {req.benefits}</p>
                <p><span className="font-medium">Projected profit:</span> {req.projected_profit}</p>
                <div className="flex flex-wrap gap-1.5">
                  {req.products.map(p => (
                    <span key={p.id} className="rounded-full bg-white px-2 py-1 text-xs">{p.name}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isSuperAdmin && requests.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Your Requests</h3>
          {requests.map(req => (
            <div key={req.id} className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-semibold">{req.title}</div>
                <div className="text-xs text-muted-foreground">{new Date(req.created_at).toLocaleDateString()}</div>
              </div>
              <span
                className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                  req.status === "pending"
                    ? "bg-yellow-50 text-yellow-800"
                    : req.status === "approved"
                    ? "bg-emerald-50 text-emerald-800"
                    : "bg-red-50 text-red-800"
                }`}
              >
                {req.status}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Active Promotions</h3>
        {promotions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No promotions yet.
          </div>
        ) : (
          <div className="grid gap-3">
            {promotions.map(promo => (
              <div key={promo.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <Megaphone className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{promo.title}</span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      {promo.discount_percent}% off
                    </span>
                  </div>
                  {isSuperAdmin && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onTogglePromo(promo.id)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          promo.active ? "bg-emerald-50 text-emerald-800" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {promo.active ? "Active" : "Paused"}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeletePromo(promo.id, promo.title)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {promo.products.map(p => (
                    <span key={p.id} className="rounded-full bg-muted px-2 py-1 text-xs">
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isSuperAdmin ? "New Promotion" : "Request a Promotion"}</DialogTitle>
            <DialogDescription>
              {isSuperAdmin ? "Pick products and a discount for this campaign." : "Explain why this promo makes sense — your super admin will review it."}
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={onSubmit}>
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Promo title</span>
              <input value={title} onChange={e => setTitle(e.target.value)} className={inputClass} placeholder="e.g. Black Friday Deals" />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Discount %</span>
              <input type="number" min="0" max="100" value={discount} onChange={e => setDiscount(e.target.value)} className={inputClass} />
            </label>

            {!isSuperAdmin && (
              <>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Reason for this promo</span>
                  <textarea value={reason} onChange={e => setReason(e.target.value)} className={inputClass} rows={2} placeholder="Why should we run this?" />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Expected benefits</span>
                  <textarea value={benefits} onChange={e => setBenefits(e.target.value)} className={inputClass} rows={2} placeholder="What do we gain?" />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Projected profit</span>
                  <input value={projectedProfit} onChange={e => setProjectedProfit(e.target.value)} className={inputClass} placeholder="e.g. GH₵5,000 extra in 2 weeks" />
                </label>
              </>
            )}

            <div className="space-y-1.5 text-sm">
              <span className="font-medium">Select products</span>
              <div className="max-h-64 overflow-y-auto rounded-xl border border-border">
                {products.map(p => (
                  <label key={p.id} className="flex cursor-pointer items-center gap-3 border-b border-border px-3 py-2 last:border-b-0 hover:bg-muted/50">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(p.id)}
                      onChange={() => toggleProduct(p.id)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">{p.name}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{selectedIds.length} selected</p>
            </div>

            {isSuperAdmin && (
              <div className="rounded-2xl border border-border p-4 space-y-3">
                <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                  <input type="checkbox" checked={addFlyer} onChange={(e) => setAddFlyer(e.target.checked)} className="h-4 w-4" />
                  <ImagePlus className="h-4 w-4" /> Show this as a storefront flyer/popup
                </label>

                {addFlyer && (
                  <div className="space-y-3 pt-1">
                    <label className="space-y-1.5 text-sm block">
                      <span className="font-medium">Flyer image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => onFlyerFileChange(e.target.files?.[0] ?? null)}
                        className="w-full text-xs"
                      />
                    </label>
                    {flyerPreview && (
                      <img src={flyerPreview} alt="Flyer preview" className="w-full rounded-xl object-cover aspect-[3/4] max-h-48" />
                    )}

                    <label className="space-y-1.5 text-sm block">
                      <span className="font-medium">Links to</span>
                      <select value={linkType} onChange={(e) => setLinkType(e.target.value as "products" | "category")} className={inputClass}>
                        <option value="products">Selected products (above)</option>
                        <option value="category">A whole category</option>
                      </select>
                    </label>

                    {linkType === "category" && (
                      <label className="space-y-1.5 text-sm block">
                        <span className="font-medium">Category</span>
                        <select value={flyerCategory} onChange={(e) => setFlyerCategory(e.target.value)} className={inputClass}>
                          <option value="">Select a category</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                          ))}
                        </select>
                      </label>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <label className="space-y-1.5 text-sm block">
                        <span className="font-medium">Starts (optional)</span>
                        <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
                      </label>
                      <label className="space-y-1.5 text-sm block">
                        <span className="font-medium">Ends (optional)</span>
                        <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Leave dates blank for an always-on flyer. If a start date is in the future, it shows as "Coming soon" until then.
                    </p>

                    <label className="space-y-1.5 text-sm block">
                      <span className="font-medium">Who is this promo for?</span>
                      <select value={audience} onChange={(e) => setAudience(e.target.value as "all" | "guests" | "customers")} className={inputClass}>
                        <option value="all">Everyone</option>
                        <option value="guests">New visitors only (not logged in)</option>
                        <option value="customers">Logged-in customers only</option>
                      </select>
                      <p className="text-xs text-muted-foreground">
                        "New visitors" is great for first-purchase offers that nudge sign-up. "Logged-in customers" suits loyalty/repeat-buyer deals.
                      </p>
                    </label>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
            >
              <Plus className="h-4 w-4" /> {isSuperAdmin ? "Create promotion" : "Submit request"}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
