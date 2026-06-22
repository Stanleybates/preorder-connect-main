import { useMemo, useState } from "react";
import { Search, ShoppingBag, X } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CATEGORIES, PRODUCTS, formatPrice, type Product } from "@/lib/store-data";
import { OrderDialog } from "@/components/OrderDialog";
import { SmartImage } from "@/components/SmartImage";


export function BrowseDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState<string>("all");
  const [q, setQ] = useState("");

  const items = useMemo(() => {
    return PRODUCTS.filter(p => {
      const matchCat = cat === "all" || p.category === cat;
      const matchQ = q.trim() === "" || p.name.toLowerCase().includes(q.toLowerCase());
      return matchCat && matchQ;
    });
  }, [cat, q]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] p-0 overflow-hidden bg-background border-border">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-display font-bold">Browse more items</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Tap any item to view Paystack payment details and order.</p>
            </div>
          </div>
          <div className="mt-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search shirts, shoes, laptops…"
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-border bg-muted/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            {q && (
              <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            <Chip active={cat === "all"} onClick={() => setCat("all")} label="✨ All" />
            {CATEGORIES.map(c => (
              <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)} label={`${c.emoji} ${c.name}`} />
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="overflow-y-auto p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4" style={{ maxHeight: "60vh" }}>
          {items.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground py-12">No items match your search.</div>
          ) : (
            items.map(p => <MiniCard key={p.id} p={p} />)
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
        active
          ? "bg-gradient-to-r from-primary to-accent text-primary-foreground border-transparent shadow-glow"
          : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
      }`}
    >
      {label}
    </button>
  );
}

function MiniCard({ p }: { p: Product }) {
  const isInStock = p.status === "in-stock";
  return (
    <OrderDialog product={p}>
      <button
        type="button"
        className="group w-full rounded-2xl border border-border bg-card overflow-hidden hover:shadow-elevated hover:border-primary/40 transition-all text-left"
      >
        <div className="relative aspect-square overflow-hidden bg-muted">
          <SmartImage
            src={p.image}
            alt={p.name}
            emoji={p.emoji}
            hue={p.hue}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <span
            className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-md ${
              isInStock ? "bg-success/90 text-white" : "bg-warning/90 text-white"
            }`}
          >
            {isInStock ? "In Stock" : "Pre-Order"}
          </span>
        </div>
        <div className="p-3 space-y-1.5">
          <div className="text-sm font-semibold leading-tight line-clamp-2 min-h-[2.5rem]">{p.name}</div>
          <div className="flex items-center justify-between pt-1">
            <div className="text-base font-display font-bold text-gradient">{formatPrice(p.price)}</div>
            <ShoppingBag className="w-4 h-4 text-accent" />
          </div>
        </div>
      </button>
    </OrderDialog>
  );
}
