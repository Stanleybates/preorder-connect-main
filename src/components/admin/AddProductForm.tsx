import { FormEvent, useEffect, useState } from "react";
import { UploadCloud, Plus } from "lucide-react";
import { getCategories, createProduct, type Category } from "@/lib/products-api";

type Props = {
  onChange: () => void;
  notify: (message: string, type: "success" | "error") => void;
  onDone?: () => void;
};

export function AddProductForm({ onChange, notify, onDone }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<"in-stock" | "pre-stock">("in-stock");
  const [eta, setEta] = useState("");
  const [tag, setTag] = useState("");
  const [emoji, setEmoji] = useState("📦");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCategories().then(cats => {
      setCategories(cats);
      if (cats.length > 0 && !category) setCategory(cats[0].id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setImagePreview(reader.result);
    };
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  const resetForm = () => {
    setName("");
    setPrice("");
    setStatus("in-stock");
    setEta("");
    setTag("");
    setEmoji("📦");
    setImageFile(null);
    setImagePreview("");
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !price.trim() || !category) {
      notify("Please fill in all required fields.", "error");
      return;
    }

    setSubmitting(true);
    const hue = categories.find(c => c.id === category)?.id.length ?? 220;
    const result = await createProduct({
      name: name.trim(),
      category,
      price: Number(price),
      status,
      eta: status === "pre-stock" ? eta.trim() || "Arrives soon" : undefined,
      emoji: emoji.trim() || "📦",
      hue: typeof hue === "number" ? hue : 220,
      tag: tag.trim() || undefined,
      imageFile,
    });
    setSubmitting(false);

    if (result.success) {
      notify(`Product "${result.product?.name}" added successfully!`, "success");
      resetForm();
      onChange();
      onDone?.();
    } else {
      notify(result.message, "error");
    }
  };

  const inputClass =
    "w-full rounded-xl border border-border px-3 py-2 bg-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary";

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-3d">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Add New Product</h2>
          <p className="text-sm text-muted-foreground">Upload an image, set price, and choose stock status.</p>
        </div>
      </div>

      <form className="grid gap-5" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="font-medium">Product name</span>
            <input value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="e.g. iPhone 15 Pro Max" />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium">Category</span>
            <select value={category} onChange={e => setCategory(e.target.value)} className={inputClass}>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium">Price</span>
            <input value={price} onChange={e => setPrice(e.target.value)} className={inputClass} type="number" min="0" placeholder="2500" />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium">Status</span>
            <select value={status} onChange={e => setStatus(e.target.value as "in-stock" | "pre-stock")} className={inputClass}>
              <option value="in-stock">In stock</option>
              <option value="pre-stock">Pre-order</option>
            </select>
          </label>
        </div>

        {status === "pre-stock" && (
          <label className="space-y-2 text-sm">
            <span className="font-medium">ETA</span>
            <input value={eta} onChange={e => setEta(e.target.value)} className={inputClass} placeholder="Arrives in 7 days" />
          </label>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-2 text-sm">
            <span className="font-medium">Emoji</span>
            <input value={emoji} onChange={e => setEmoji(e.target.value)} className={inputClass} placeholder="📱" />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium">Tag (optional)</span>
            <input value={tag} onChange={e => setTag(e.target.value)} className={inputClass} placeholder="Bestseller" />
          </label>

          <label className="space-y-2 text-sm">
            <span className="font-medium">Image from gallery</span>
            <div className="flex items-center gap-2 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 px-3 py-2.5 text-sm font-medium transition-colors hover:border-primary hover:bg-primary/10">
              <UploadCloud className="h-4 w-4 text-primary" />
              <input
                type="file"
                accept="image/*"
                onChange={e => setImageFile(e.target.files?.[0] ?? null)}
                className="w-full cursor-pointer text-xs file:hidden"
              />
            </div>
          </label>
        </div>

        {imagePreview && (
          <div className="overflow-hidden rounded-3xl border border-border bg-muted">
            <img src={imagePreview} alt="Preview of the product being added" className="w-full object-cover" style={{ aspectRatio: "4 / 3" }} />
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">Uploaded images are stored on the server.</p>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> {submitting ? "Adding..." : "Add product"}
          </button>
        </div>
      </form>
    </div>
  );
}
