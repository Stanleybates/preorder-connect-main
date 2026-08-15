import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Megaphone } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { OrderDialog } from "@/components/OrderDialog";
import { SmartImage } from "@/components/SmartImage";
import { getActivePromotions, type Promotion } from "@/lib/promotions-api";
import { formatPrice } from "@/lib/store-data";

export const Route = createFileRoute("/promos")({
  head: () => ({
    meta: [{ title: "Promotions" }],
  }),
  component: Promos,
});

function Promos() {
  const [promotions, setPromotions] = useState<Promotion[] | null>(null);

  useEffect(() => {
    getActivePromotions().then(setPromotions);
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24">
      <SiteHeader />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to shop
        </Link>

        <div className="mb-10 flex flex-col gap-3">
          <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow w-fit">
            <Megaphone className="w-4 h-4" /> Promotions
          </div>
          <h1 className="text-4xl font-display font-bold">Current deals</h1>
          <p className="text-muted-foreground">Everything on promotion right now.</p>
        </div>

        {promotions === null ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
        ) : promotions.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No active promotions right now. Check back soon.
          </div>
        ) : (
          <div className="space-y-10">
            {promotions.map((promo) => (
              <section key={promo.id}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-display font-bold">{promo.title}</h2>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {promo.discount_percent}% off
                  </span>
                </div>
                {promo.products.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Applies to {promo.category_detail?.name ?? "a category"} -- browse that category to see items.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {promo.products.map((p) => (
                      <OrderDialog
                        key={p.id}
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
                        <button type="button" className="group w-full rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/40 transition-all text-left">
                          <div className="aspect-square bg-muted overflow-hidden">
                            <SmartImage src={p.image || ""} alt={p.name} emoji={p.emoji} hue={p.hue} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          </div>
                          <div className="p-3">
                            <p className="text-sm font-semibold line-clamp-2 leading-tight min-h-[2.5rem]">{p.name}</p>
                            <p className="text-sm font-display font-bold text-gradient mt-1">{formatPrice(Number(p.price))}</p>
                          </div>
                        </button>
                      </OrderDialog>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
