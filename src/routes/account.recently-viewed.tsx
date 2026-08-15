import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, History } from "lucide-react";
import { getCurrentCustomer, restoreCustomerSession } from "@/lib/customer-auth-store";
import { useRecentlyViewed } from "@/lib/recently-viewed-api";
import { formatPrice } from "@/lib/store-data";
import { SmartImage } from "@/components/SmartImage";
import { OrderDialog } from "@/components/OrderDialog";

export const Route = createFileRoute("/account/recently-viewed")({
  head: () => ({ meta: [{ title: "Recently Viewed" }] }),
  component: RecentlyViewedPage,
});

function RecentlyViewedPage() {
  const navigate = useNavigate();
  const [sessionChecked, setSessionChecked] = useState(!!getCurrentCustomer());

  useEffect(() => {
    if (getCurrentCustomer()) return;
    restoreCustomerSession().then((restored) => {
      if (!restored) navigate({ to: "/login", replace: true });
      setSessionChecked(true);
    });
  }, [navigate]);

  const { data: items, isLoading } = useRecentlyViewed();

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
        <Link to="/account" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to account
        </Link>

        <div className="mb-10 flex flex-col gap-3">
          <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow w-fit">
            <History className="w-4 h-4" /> Recently Viewed
          </div>
          <h1 className="text-4xl font-display font-bold">Your browsing history</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
        ) : !items || items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
            Nothing viewed yet. Tap "Buy now" on any product to see it here.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => {
              const p = item.product_detail;
              return (
                <OrderDialog
                  key={item.id}
                  product={{
                    id: String(p.id), name: p.name, category: p.category, price: Number(p.price),
                    status: p.status, emoji: p.emoji, image: p.image || "", hue: p.hue,
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
