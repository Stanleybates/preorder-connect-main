import { FormEvent, useMemo, useState } from "react";
import { Search, Pencil, Trash2, Check, X, Plus, Tag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  PRODUCTS,
  CATEGORIES,
  formatPrice,
  updateProduct,
  removeProduct,
  addCategory,
  type Product,
  type StockStatus,
} from "@/lib/store-data";
import { AddProductForm } from "@/components/admin/AddProductForm";

type Props = {
  onChange: () => void;
  notify: (message: string, type: "success" | "error") => void;
};

export function ProductManager({ onChange, notify }: Props) {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | StockStatus>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Product | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);

  const [catName, setCatName] = useState("");
  const [catEmoji, setCatEmoji] = useState("🏷️");
  const [catDesc, setCatDesc] = useState("");

  const filtered = useMemo(() => {
    return PRODUCTS.filter(p => {
      const matchesQuery = p.name.toLowerCase().includes(query.trim().toLowerCase());
      const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesQuery && matchesCategory && matchesStatus;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, categoryFilter, statusFilter, PRODUCTS.length, editingId]);

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setDraft({ ...product });
    setConfirmDeleteId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const saveEdit = () => {
    if (!draft) return;
    if (!draft.name.trim() || !(Number(draft.price) > 0)) {
      notify("Product name and a valid price are required.", "error");
      return;
    }
    updateProduct({
      ...draft,
      name: draft.name.trim(),
      price: Number(draft.price),
      eta: draft.status === "pre-stock" ? draft.eta?.trim() || "Arrives soon" : undefined,
      tag: draft.tag?.trim() || undefined,
    });
    notify(`Product "${draft.name.trim()}" updated.`, "success");
    cancelEdit();
    onChange();
  };

  const confirmDelete = (id: string) => {
    const product = PRODUCTS.find(p => p.id === id);
    removeProduct(id);
    setConfirmDeleteId(null);
    notify(`Product "${product?.name ?? id}" removed.`, "success");
    onChange();
  };

  const onAddCategory = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!catName.trim()) {
      notify("Category name is required.", "error");
      return;
    }
    const id = catName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const result = addCategory({ id, name: catName.trim(), emoji: catEmoji.trim() || "🏷️", desc: catDesc.trim() });
    if (!result) {
      notify("A category with that name already exists.", "error");
      return;
    }
    notify(`Category "${result.name}" added.`, "success");
    setCatName("");
    setCatEmoji("🏷️");
    setCatDesc("");
    setShowAddCategory(false);
    onChange();
  };

  const inputClass =
    "w-full rounded-lg border border-border px-3 py-2 bg-background text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary";

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
        >
          <option value="all">All categories</option>
          {CATEGORIES.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as "all" | StockStatus)}
          className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
        >
          <option value="all">All status</option>
          <option value="in-stock">In stock</option>
          <option value="pre-stock">Pre-order</option>
        </select>
        <button
          type="button"
          onClick={() => setShowAddCategory(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted transition-colors"
        >
          <Tag className="h-4 w-4" /> Add Category
        </button>
        <button
          type="button"
          onClick={() => setShowAddProduct(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {PRODUCTS.length} products
      </p>

      {/* List */}
      <div className="grid gap-3">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No products match your filters.
          </div>
        )}

        {filtered.map(p => (
          <div key={p.id} className="rounded-2xl border border-border bg-card p-4 shadow-3d">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted text-xl">
                  {p.image ? <img src={p.image} alt={p.name} className="h-full w-full object-cover" /> : p.emoji}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-semibold">{p.name}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                      {CATEGORIES.find(c => c.id === p.category)?.name ?? p.category}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 font-medium ${
                        p.status === "in-stock"
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {p.status === "in-stock" ? "In stock" : "Pre-order"}
                    </span>
                    {p.tag && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
                        {p.tag}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:shrink-0">
                <span className="font-display font-bold">{formatPrice(p.price)}</span>
                <button
                  type="button"
                  onClick={() => startEdit(p)}
                  aria-label={`Edit ${p.name}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(p.id)}
                  aria-label={`Delete ${p.name}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {confirmDeleteId === p.id && (
              <div className="mt-4 flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-destructive">Delete this product permanently?</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => confirmDelete(p.id)}
                    className="rounded-lg bg-destructive px-3 py-1.5 text-sm font-semibold text-destructive-foreground"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(null)}
                    className="rounded-lg border border-border px-3 py-1.5 text-sm font-semibold hover:bg-muted"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit product modal */}
      <Dialog open={editingId !== null} onOpenChange={open => !open && cancelEdit()}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit product</DialogTitle>
            <DialogDescription>Update details, price, and image, then save.</DialogDescription>
          </DialogHeader>
          {draft && (
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1.5 text-sm md:col-span-2">
                <span className="font-medium">Name</span>
                <input
                  value={draft.name}
                  onChange={e => setDraft({ ...draft, name: e.target.value })}
                  className={inputClass}
                />
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="font-medium">Price</span>
                <input
                  type="number"
                  min="0"
                  value={String(draft.price)}
                  onChange={e => setDraft({ ...draft, price: Number(e.target.value) })}
                  className={inputClass}
                />
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="font-medium">Category</span>
                <select
                  value={draft.category}
                  onChange={e => setDraft({ ...draft, category: e.target.value })}
                  className={inputClass}
                >
                  {CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="font-medium">Status</span>
                <select
                  value={draft.status}
                  onChange={e => setDraft({ ...draft, status: e.target.value as StockStatus })}
                  className={inputClass}
                >
                  <option value="in-stock">In stock</option>
                  <option value="pre-stock">Pre-order</option>
                </select>
              </label>
              <label className="space-y-1.5 text-sm">
                <span className="font-medium">Tag (optional)</span>
                <input
                  value={draft.tag ?? ""}
                  onChange={e => setDraft({ ...draft, tag: e.target.value })}
                  className={inputClass}
                  placeholder="Bestseller"
                />
              </label>
              <label className="space-y-1.5 text-sm md:col-span-2">
                <span className="font-medium">Product image</span>
                <div className="flex items-center gap-3">
                  {draft.image && (
                    <img src={draft.image} alt={draft.name} className="h-16 w-16 rounded-xl border border-border object-cover" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === "string") {
                          setDraft({ ...draft, image: reader.result });
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="text-xs"
                  />
                </div>
              </label>
              {draft.status === "pre-stock" && (
                <label className="space-y-1.5 text-sm md:col-span-2">
                  <span className="font-medium">ETA</span>
                  <input
                    value={draft.eta ?? ""}
                    onChange={e => setDraft({ ...draft, eta: e.target.value })}
                    className={inputClass}
                    placeholder="Arrives in 7 days"
                  />
                </label>
              )}
              <div className="flex gap-2 md:col-span-2">
                <button
                  type="button"
                  onClick={saveEdit}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  <Check className="h-4 w-4" /> Save changes
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
                >
                  <X className="h-4 w-4" /> Cancel
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add product modal */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add new product</DialogTitle>
            <DialogDescription>Upload an image, set price, and choose stock status.</DialogDescription>
          </DialogHeader>
          <AddProductForm onChange={onChange} notify={notify} onDone={() => setShowAddProduct(false)} />
        </DialogContent>
      </Dialog>

      {/* Add category modal */}
      <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add category</DialogTitle>
            <DialogDescription>Create a new product category.</DialogDescription>
          </DialogHeader>
          <form className="grid gap-3" onSubmit={onAddCategory}>
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Category name</span>
              <input value={catName} onChange={e => setCatName(e.target.value)} className={inputClass} placeholder="e.g. Watches" />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Emoji</span>
              <input value={catEmoji} onChange={e => setCatEmoji(e.target.value)} className={inputClass} placeholder="⌚" />
            </label>
            <label className="space-y-1.5 text-sm">
              <span className="font-medium">Description</span>
              <input value={catDesc} onChange={e => setCatDesc(e.target.value)} className={inputClass} placeholder="Short description" />
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
            >
              <Plus className="h-4 w-4" /> Add category
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
