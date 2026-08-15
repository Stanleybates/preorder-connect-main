import { FormEvent, useEffect, useMemo, useState } from "react";
import { Search, Pencil, Trash2, Check, X, Plus, Tag, History, RotateCcw, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getCategories,
  getProducts,
  createCategory,
  updateProductApi,
  deleteProductApi,
  getDeletedProducts,
  restoreProductApi,
  permanentlyDeleteProductApi,
  type Category,
  type Product,
  type DeletedProductRecord,
} from "@/lib/products-api";
import { AddProductForm } from "@/components/admin/AddProductForm";

type Props = {
  onChange: () => void;
  notify: (message: string, type: "success" | "error") => void;
  isSuperAdmin?: boolean;
  currentUsername: string;
};

export function ProductManager({ onChange, notify, isSuperAdmin, currentUsername }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "in-stock" | "pre-stock">("all");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Product | null>(null);
  const [draftImageFile, setDraftImageFile] = useState<File | null>(null);

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleteReason, setDeleteReason] = useState("");

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showDeletedLog, setShowDeletedLog] = useState(false);
  const [deletedProducts, setDeletedProducts] = useState<DeletedProductRecord[]>([]);
  const [confirmPermanentId, setConfirmPermanentId] = useState<number | null>(null);

  const [catName, setCatName] = useState("");
  const [catEmoji, setCatEmoji] = useState("🏷️");
  const [catDesc, setCatDesc] = useState("");

  const load = async () => {
    const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
    setProducts(prods);
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

  const loadDeleted = async () => {
    const data = await getDeletedProducts();
    setDeletedProducts(data);
  };

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchesQuery = p.name.toLowerCase().includes(query.trim().toLowerCase());
      const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [products, query, categoryFilter, statusFilter]);

  const startEdit = (product: Product) => {
    setEditingId(product.id);
    setDraft({ ...product });
    setDraftImageFile(null);
    setConfirmDeleteId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
    setDraftImageFile(null);
  };

  const saveEdit = async () => {
    if (!draft) return;
    if (!draft.name.trim() || !(Number(draft.price) > 0)) {
      notify("Product name and a valid price are required.", "error");
      return;
    }
    const result = await updateProductApi(draft.id, {
      name: draft.name.trim(),
      category: draft.category,
      price: Number(draft.price),
      status: draft.status,
      eta: draft.status === "pre-stock" ? draft.eta?.trim() || "Arrives soon" : undefined,
      emoji: draft.emoji,
      hue: draft.hue,
      tag: draft.tag?.trim() || undefined,
      imageFile: draftImageFile,
    });

    if (result.success) {
      notify(`Product "${draft.name.trim()}" updated.`, "success");
      cancelEdit();
      reload();
    } else {
      notify(result.message, "error");
    }
  };

  const confirmDelete = async (id: number, name: string) => {
    if (!isSuperAdmin && !deleteReason.trim()) {
      notify("Please state a reason for deleting this product.", "error");
      return;
    }
    const result = await deleteProductApi(id, deleteReason);
    if (result.success) {
      setConfirmDeleteId(null);
      setDeleteReason("");
      notify(`Product "${name}" removed. Super admin will be notified.`, "success");
      reload();
    } else {
      notify(result.message, "error");
    }
  };

  const onRestore = async (id: number, name: string) => {
    const result = await restoreProductApi(id);
    if (result.success) {
      notify(`Product "${name}" restored.`, "success");
      await loadDeleted();
      reload();
    } else {
      notify(result.message, "error");
    }
  };

  const onPermanentDelete = async (id: number, name: string) => {
    const result = await permanentlyDeleteProductApi(id);
    if (result.success) {
      notify(`Product "${name}" permanently deleted.`, "success");
      setConfirmPermanentId(null);
      await loadDeleted();
    } else {
      notify(result.message, "error");
    }
  };

  const onAddCategory = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!catName.trim()) {
      notify("Category name is required.", "error");
      return;
    }
    const id = catName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const result = await createCategory({ id, name: catName.trim(), emoji: catEmoji.trim() || "🏷️", desc: catDesc.trim() });
    if (result.success) {
      notify(`Category "${catName.trim()}" added.`, "success");
      setCatName("");
      setCatEmoji("🏷️");
      setCatDesc("");
      setShowAddCategory(false);
      reload();
    } else {
      notify(result.message, "error");
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border px-3 py-2 bg-background text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary";

  if (loading) {
    return <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Loading products…</div>;
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
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
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as "all" | "in-stock" | "pre-stock")}
          className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
        >
          <option value="all">All status</option>
          <option value="in-stock">In stock</option>
          <option value="pre-stock">Pre-order</option>
        </select>
        {isSuperAdmin && (
          <>
            <button
              type="button"
              onClick={() => setShowAddCategory(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted transition-colors"
            >
              <Tag className="h-4 w-4" /> Add Category
            </button>
            <button
              type="button"
              onClick={() => { setShowDeletedLog(true); loadDeleted(); }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted transition-colors"
            >
              <History className="h-4 w-4" /> Deleted
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => setShowAddProduct(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {products.length} products
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
                      {p.category_name ?? p.category}
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
                <span className="font-display font-bold">GH₵ {Number(p.price).toLocaleString()}</span>
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
                  onClick={() => { setConfirmDeleteId(p.id); setDeleteReason(""); }}
                  aria-label={`Delete ${p.name}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {confirmDeleteId === p.id && (
              <div className="mt-4 grid gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3">
                <span className="text-sm text-destructive">
                  Delete this product? It will be logged and can be restored by the super admin.
                </span>
                <textarea
                  value={deleteReason}
                  onChange={e => setDeleteReason(e.target.value)}
                  placeholder={isSuperAdmin ? "Reason (optional)" : "Reason for deleting (required)"}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => confirmDelete(p.id, p.name)}
                    className="rounded-lg bg-destructive px-3 py-1.5 text-sm font-semibold text-destructive-foreground"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => { setConfirmDeleteId(null); setDeleteReason(""); }}
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
                  onChange={e => setDraft({ ...draft, price: e.target.value })}
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
                  {categories.map(c => (
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
                  onChange={e => setDraft({ ...draft, status: e.target.value as "in-stock" | "pre-stock" })}
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
                    onChange={e => setDraftImageFile(e.target.files?.[0] ?? null)}
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
          <AddProductForm onChange={reload} notify={notify} onDone={() => setShowAddProduct(false)} />
        </DialogContent>
      </Dialog>

      {isSuperAdmin && (
        <>
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

          {/* Deleted products log */}
          <Dialog open={showDeletedLog} onOpenChange={setShowDeletedLog}>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Deleted products</DialogTitle>
                <DialogDescription>Review deletions and restore products if needed.</DialogDescription>
              </DialogHeader>
              {deletedProducts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No deleted products.
                </div>
              ) : (
                <div className="grid gap-3">
                  {deletedProducts.map(record => (
                    <div key={record.id} className="rounded-xl border border-border bg-card p-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="truncate font-semibold">{record.product.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Deleted by {record.deleted_by_username ?? "unknown"} · {new Date(record.deleted_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 sm:shrink-0">
                          <button
                            type="button"
                            onClick={() => onRestore(record.product.id, record.product.name)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white"
                          >
                            <RotateCcw className="h-3.5 w-3.5" /> Restore
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmPermanentId(record.product.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-sm font-semibold text-destructive"
                          >
                            <AlertTriangle className="h-3.5 w-3.5" /> Delete permanently
                          </button>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">Reason:</span> {record.reason || "No reason given"}
                      </p>
                      {confirmPermanentId === record.product.id && (
                        <div className="mt-3 flex flex-col gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3">
                          <span className="text-sm text-destructive">
                            This permanently erases the product. This cannot be undone.
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => onPermanentDelete(record.product.id, record.product.name)}
                              className="rounded-lg bg-destructive px-3 py-1.5 text-sm font-semibold text-destructive-foreground"
                            >
                              Confirm delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmPermanentId(null)}
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
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
