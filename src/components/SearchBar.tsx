import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useProducts, useCategories } from "@/lib/catalog-api";
import { formatPrice, type Product } from "@/lib/store-data";
import { OrderDialog } from "@/components/OrderDialog";
import { SmartImage } from "@/components/SmartImage";

export function SearchBar({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const { data: products } = useProducts();
  const { data: categories } = useCategories();

  const results = useMemo(() => {
    if (!products || q.trim() === "") return [];
    const query = q.toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(query) || categories?.find((c) => c.id === p.category)?.name.toLowerCase().includes(query)
    );
  }, [products, categories, q]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-2.5 text-sm text-muted-foreground hover:border-primary/40 transition-colors ${className}`}
      >
        <Search className="w-4 h-4 shrink-0" />
        <span className="truncate">Search products...</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[85vh] p-0 overflow-hidden bg-background border-border">
          <div className="px-5 pt-5 pb-3 border-b border-border">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products, categories..."
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-border bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              {q && (
                <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto p-5" style={{ maxHeight: "60vh" }}>
            {q.trim() === "" ? (
              <p className="text-center text-sm text-muted-foreground py-12">Start typing to search products.</p>
            ) : results.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-12">No products match "{q}".</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {results.map((p) => (
                  <SearchResultCard key={p.id} product={p} onNavigate={() => setOpen(false)} />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SearchResultCard({ product, onNavigate }: { product: Product; onNavigate: () => void }) {
  return (
    <OrderDialog product={product}>
      <button type="button" onClick={onNavigate} className="group w-full rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-all text-left">
        <div className="aspect-square overflow-hidden bg-muted">
          <SmartImage src={product.image} alt={product.name} emoji={product.emoji} hue={product.hue} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        </div>
        <div className="p-3">
          <p className="text-sm font-semibold line-clamp-2 leading-tight min-h-[2.5rem]">{product.name}</p>
          <p className="text-sm font-display font-bold text-gradient mt-1">{formatPrice(product.price)}</p>
        </div>
      </button>
    </OrderDialog>
  );
}
