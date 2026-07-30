import { FormEvent, useState } from "react";
import { Plus, Trash2, Megaphone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PRODUCTS, PROMOTIONS, addPromotion, removePromotion, togglePromotion } from "@/lib/store-data";

type Props = {
  onChange: () => void;
  notify: (message: string, type: "success" | "error") => void;
};

export function PromotionsPanel({ onChange, notify }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [discount, setDiscount] = useState("10");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleProduct = (id: string) => {
    setSelectedIds(ids => (ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]));
  };

  const resetForm = () => {
    setTitle("");
    setDiscount("10");
    setSelectedIds([]);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || selectedIds.length === 0) {
      notify("Give the promo a title and select at least one product.", "error");
      return;
    }
    addPromotion({
      title: title.trim(),
      productIds: selectedIds,
      discountPercent: Number(discount) || 0,
      active: true,
    });
    notify(`Promotion "${title.trim()}" created.`, "success");
    resetForm();
    setShowAdd(false);
    onChange();
  };

  const inputClass =
    "w-full rounded-xl border border-border px-3 py-2 bg-background text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Create promo campaigns and pick which products they apply to.</p>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Promotion
        </button>
      </div>

      {PROMOTIONS.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No promotions yet. Create one to feature products at a discount.
        </div>
      ) : (
        <div className="grid gap-3">
          {PROMOTIONS.map(promo => (
            <div key={promo.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{promo.title}</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    {promo.discountPercent}% off
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      togglePromotion(promo.id);
                      onChange();
                    }}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      promo.active ? "bg-emerald-50 text-emerald-800" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {promo.active ? "Active" : "Paused"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      removePromotion(promo.id);
                      onChange();
                      notify(`Promotion "${promo.title}" removed.`, "success");
                    }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {promo.productIds.map(pid => {
                  const p = PRODUCTS.find(x => x.id === pid);
                  return p ? (
                    <span key={pid} className="rounded-full bg-muted px-2 py-1 text-xs">
                      {p.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Promotion</DialogTitle>
            <DialogDescription>Pick products and a discount for this campaign.</DialogDescription>
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
            <div className="space-y-1.5 text-sm">
              <span className="font-medium">Select products</span>
              <div className="max-h-64 overflow-y-auto rounded-xl border border-border">
                {PRODUCTS.map(p => (
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
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
            >
              <Plus className="h-4 w-4" /> Create promotion
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
