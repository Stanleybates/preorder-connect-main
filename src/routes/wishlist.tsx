import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, ArrowLeft } from "lucide-react";
import { getCurrentCustomer, restoreCustomerSession } from "@/lib/customer-auth-store";
import { useWishlist, useRemoveFromWishlist } from "@/lib/wishlist-api";
import { formatPrice } from "@/lib/store-data";
import { SmartImage } from "@/components/SmartImage";
import { OrderDialog } from "@/components/OrderDialog";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist" },
      { name: "description", content: "Items you've saved for later." },
    ],
  }),
  component: Wishlist,
});

function Wishlist() {
  const navigate = useNavigate();
  const [sessionChecked, setSessionChecked] = useState(!!getCurrentCustomer());

  useEffect(() => {
    if (getCurrentCustomer()) return;
    restoreCustomerSession().then((restored) => {
      if (!restored) navigate({ to: "/login", replace: true });
      setSessionChecked(true);
    });
  }, [navigate]);

  const { data: items, isLoading } = useWishlist();
  const removeItem = useRemoveFromWishlist();

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to shop
        </Link>

        <div className="mb-10 flex flex-col gap-3">
          <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow w-fit">
            <Heart className="w-4 h-4" /> Wishlist
          </div>
          <h1 className="text-4xl font-display font-bold">Saved for later</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
        ) : !items || items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center">
            <Heart className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground">Nothing saved yet. Tap the heart on any product to add it here.</p>
            <Link
              to="/"
              className="mt-4 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => {
              const p = item.product_detail;
              return (
                <div key={item.id} className="rounded-3xl border border-border bg-card overflow-hidden shadow-elevated">
                  <div className="relative aspect-[4/3] bg-muted">
                    <SmartImage src={p.image || ""} alt={p.name} emoji={p.emoji} hue={p.hue} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeItem.mutate(item.product)}
                      disabled={removeItem.isPending}
                      aria-label="Remove from wishlist"
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center hover:bg-white transition-colors disabled:opacity-60"
                    >
                      <Heart className="w-4.5 h-4.5 fill-pink-500 text-pink-500" />
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    <h3 className="font-semibold text-sm leading-snug line-clamp-2">{p.name}</h3>
                    <p className="text-lg font-display font-bold text-gradient">{formatPrice(Number(p.price))}</p>
                    <OrderDialog
                      product={{
                        id: String(p.id),
                        name: p.name,
                        category: p.category,
                        price: Number(p.price),
                        status: p.status,
                        emoji: p.emoji,
                        image: p.image || "",
                        hue: p.hue,
                      }}
                    >
                      <button
                        type="button"
                        className="w-full rounded-2xl bg-gradient-to-r from-primary to-accent px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:shadow-glow transition-all"
                      >
                        Buy now
                      </button>
                    </OrderDialog>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
