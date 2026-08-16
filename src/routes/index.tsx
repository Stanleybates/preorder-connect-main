import { createFileRoute, useSearch, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, MessageCircle, Package2, Sparkles, Truck, Boxes, ShoppingBag, Megaphone, Sparkle, Clock3 } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { PromoFlyers } from "@/components/PromoFlyers";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ProductCard } from "@/components/ProductCard";
import { BrowseDialog } from "@/components/BrowseDialog";
import { SmartImage } from "@/components/SmartImage";
import { Reveal } from "@/components/Reveal";
import { STORE } from "@/lib/store-data";
import type { Product } from "@/lib/store-data";
import { useProducts, useCategories } from "@/lib/catalog-api";
import { getCurrentCustomer } from "@/lib/customer-auth-store";
import { useRecentlyViewed } from "@/lib/recently-viewed-api";
import { useWishlist } from "@/lib/wishlist-api";
import { useMyOrders } from "@/lib/orders-api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${"Prime Imports"} | Imported Goods, Pay with Paystack` },
      { name: "description", content: "Shop imported iPhones, laptops, machines, clothes & more. Make payment via Paystack and confirm your order on WhatsApp." },
      { property: "og:title", content: "Prime Imports | Imported Goods" },
      { property: "og:description", content: "Tap order to see Paystack checkout and confirm on WhatsApp." },
    ],
  }),
  component: Index,
});

// Simple weighted category-affinity scoring -- no ML needed at this scale.
// A past purchase signals intent far more strongly than a passing view.
const WEIGHT_ORDER = 3;
const WEIGHT_WISHLIST = 2;
const WEIGHT_VIEWED = 1;

function sortByAffinity(products: Product[], scores: Record<string, number>): Product[] {
  return products
    .map((p, index) => ({ p, index, score: scores[p.category] ?? 0 }))
    .sort((a, b) => (b.score - a.score) || (a.index - b.index))
    .map((entry) => entry.p);
}

function Index() {
  const customer = getCurrentCustomer();
  const search = useSearch({ strict: false }) as { category?: string };
  const [activeCat, setActiveCat] = useState<string>(search.category || "all");
  const [sortMode, setSortMode] = useState<"for-you" | "newest">("newest");

  useEffect(() => {
    if (search.category) setActiveCat(search.category);
  }, [search.category]);

  const { data: PRODUCTS, isLoading: productsLoading, isError: productsError } = useProducts();
  const { data: CATEGORIES, isLoading: categoriesLoading } = useCategories();
  const { data: recentlyViewed } = useRecentlyViewed();
  const { data: wishlist } = useWishlist();
  const { data: orders } = useMyOrders();

  const products = PRODUCTS ?? [];
  const categories = CATEGORIES ?? [];
  const isLoading = productsLoading || categoriesLoading;

  const categoryScores = useMemo(() => {
    if (!customer) return {};
    const categoryById = new Map(products.map((p) => [Number(p.id), p.category]));
    const scores: Record<string, number> = {};

    const add = (productId: number | null | undefined, weight: number) => {
      if (!productId) return;
      const category = categoryById.get(productId);
      if (!category) return;
      scores[category] = (scores[category] ?? 0) + weight;
    };

    (orders ?? []).forEach((order) => {
      order.items.forEach((item) => add(item.product, WEIGHT_ORDER));
    });
    (wishlist ?? []).forEach((item) => add(item.product, WEIGHT_WISHLIST));
    (recentlyViewed ?? []).forEach((item) => add(item.product, WEIGHT_VIEWED));

    return scores;
  }, [customer, products, orders, wishlist, recentlyViewed]);

  const hasSignal = Object.keys(categoryScores).length > 0;

  // Default to personalized ordering once there's real signal to use.
  useEffect(() => {
    if (hasSignal) setSortMode("for-you");
  }, [hasSignal]);

  const pickCategory = (id: string) => {
    setActiveCat(id);
    setTimeout(() => {
      document.getElementById("in-stock")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  const inStock = useMemo(() => {
    const filtered = products.filter(p => p.status === "in-stock" && (activeCat === "all" || p.category === activeCat));
    if (activeCat === "all" && sortMode === "for-you" && hasSignal) {
      return sortByAffinity(filtered, categoryScores);
    }
    return filtered;
  }, [products, activeCat, sortMode, hasSignal, categoryScores]);

  const preStock = useMemo(() => {
    const filtered = products.filter(p => p.status === "pre-stock" && (activeCat === "all" || p.category === activeCat));
    if (activeCat === "all" && sortMode === "for-you" && hasSignal) {
      return sortByAffinity(filtered, categoryScores);
    }
    return filtered;
  }, [products, activeCat, sortMode, hasSignal, categoryScores]);

  const heroPhones = products.filter(p => p.category === "iphones").slice(0, 4);


  return (
    <div id="top" className="min-h-screen bg-background">
      <SiteHeader />
      <PromoFlyers />

      {/* HERO -- guests only. Returning customers skip straight to shopping. */}
      {!customer && (
      <section className="relative overflow-hidden bg-hero">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute top-20 -left-20 w-96 h-96 rounded-full bg-primary/30 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-10 right-0 w-[28rem] h-[28rem] rounded-full bg-accent/20 blur-3xl animate-pulse-glow" />
        <div className="absolute top-1/3 left-1/3 w-[24rem] h-[24rem] rounded-full bg-neon/20 blur-3xl animate-aurora" />

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-32 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-muted-foreground animate-bob">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              Direct imports • Best prices • WhatsApp orders
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold leading-[1.05] reveal is-visible">
              Imported goods,<br />
              <span className="text-gradient-anim">delivered with style.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl reveal is-visible" style={{ animationDelay: "120ms" }}>
              From iPhones to industrial machines — browse our inventory of in-stock and pre-order goods.
              Pay with Paystack and complete your first order fast.
            </p>
            <div className="flex flex-wrap gap-3 reveal is-visible" style={{ animationDelay: "220ms" }}>
              <BrowseDialog>
                <button className="shine px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold shadow-glow hover:shadow-neon hover:-translate-y-0.5 transition-all inline-flex items-center gap-2 group">
                  Browse more items <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </BrowseDialog>
              <a href="#pre-stock" className="px-6 py-3.5 rounded-xl glass font-semibold inline-flex items-center gap-2 hover:border-primary/40 hover:-translate-y-0.5 transition-all">
                <Truck className="w-4 h-4 text-accent" /> Pre-order incoming
              </a>
            </div>
            <div className="flex gap-8 pt-4 reveal is-visible" style={{ animationDelay: "320ms" }}>
              <Stat n={`${products.filter(p=>p.status==='in-stock').length}+`} label="In stock" />
              <Stat n={`${products.filter(p=>p.status==='pre-stock').length}+`} label="Pre-order" />
              <Stat n={`${categories.length}`} label="Categories" />
            </div>
          </div>

          {/* iPhone showcase */}
          <div className="relative hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              {heroPhones.map((p, i) => (
                <a
                  key={p.id}
                  href={`#in-stock`}
                  onClick={() => pickCategory("iphones")}
                  className={`group relative rounded-3xl overflow-hidden bg-card border border-border/60 shadow-elevated hover:shadow-glow hover:-translate-y-2 hover:border-primary/40 transition-all duration-500 reveal-scale is-visible ${
                    i % 2 === 0 ? "aspect-square mt-0" : "aspect-[4/5] mt-10"
                  }`}
                  style={{ animationDelay: `${200 + i * 120}ms` }}
                >
                  <SmartImage
                    src={p.image}
                    alt={p.name}
                    emoji={p.emoji}
                    hue={p.hue}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                    <div className="text-[10px] uppercase tracking-widest text-white/70 font-semibold">iPhone</div>
                    <div className="text-sm font-display font-bold text-white line-clamp-1">{p.name}</div>
                  </div>
                </a>
              ))}
            </div>
            <div className="absolute -top-4 -right-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-bold shadow-glow z-30 animate-bob">
              ✨ Latest iPhones
            </div>
          </div>

        </div>
      </section>
      )}

      {/* Compact welcome banner -- customers only */}
      {customer && (
        <section className="max-w-7xl mx-auto px-6 pt-10 pb-4">
          <div className="rounded-3xl bg-gradient-to-r from-primary to-accent p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-glow">
            <div className="flex items-center gap-3 text-primary-foreground">
              <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-lg font-display font-bold">Welcome back, {customer.name.split(" ")[0]}</p>
                <p className="text-sm text-primary-foreground/80">Pick up where you left off.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-fit">
              <a
                href="#in-stock"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/15 px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-white/25 transition-colors"
              >
                Shop now <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                to="/promos"
                aria-label="View promotions"
                className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-white/15 text-primary-foreground hover:bg-white/25 transition-colors"
              >
                <Megaphone className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CATEGORIES */}
      <section id="categories" className="max-w-7xl mx-auto px-6 py-20">
        <Reveal>
          <SectionHeader
            eyebrow="Browse"
            title="Shop by category"
            subtitle="Filter the inventory by what you're looking for."
          />
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mt-10">
          <Reveal variant="scale" delay={0}>
            <CategoryPill id="all" name="All" emoji="✨" active={activeCat==="all"} onClick={() => pickCategory("all")} />
          </Reveal>
          {categoriesLoading ? (
            <div className="col-span-full flex justify-center py-6">
              <div className="w-6 h-6 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            </div>
          ) : categories.map((c, i) => (
            <Reveal key={c.id} variant="scale" delay={(i + 1) * 60}>
              <CategoryPill
                id={c.id}
                name={c.name}
                emoji={c.emoji}
                active={activeCat === c.id}
                onClick={() => pickCategory(c.id)}
              />
            </Reveal>
          ))}
        </div>

      </section>

      {isLoading ? (
        <section className="max-w-7xl mx-auto px-6 py-24 flex justify-center">
          <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        </section>
      ) : productsError ? (
        <section className="max-w-7xl mx-auto px-6 py-24 text-center text-muted-foreground">
          Couldn't load products right now. Pull to refresh or check back shortly.
        </section>
      ) : (
      <>
      {/* IN STOCK */}
      <section id="in-stock" className="max-w-7xl mx-auto px-6 py-12">
        <Reveal>
          <SectionHeader
            eyebrow={<><Boxes className="w-3.5 h-3.5 inline mr-1.5" />Inventory</>}
            title={<>In Stock <span className="text-gradient">Goods</span></>}
            subtitle="Ready to ship today. Tap a price to claim it on WhatsApp."
            accent="success"
          />
        </Reveal>

        {customer && activeCat === "all" && hasSignal && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              type="button"
              onClick={() => setSortMode("for-you")}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide border transition-colors ${
                sortMode === "for-you"
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground border-transparent shadow-glow"
                  : "bg-background border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkle className="w-3.5 h-3.5" /> For You
            </button>
            <button
              type="button"
              onClick={() => setSortMode("newest")}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide border transition-colors ${
                sortMode === "newest"
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground border-transparent shadow-glow"
                  : "bg-background border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Clock3 className="w-3.5 h-3.5" /> Newest
            </button>
          </div>
        )}

        {inStock.length === 0 ? (
          <EmptyState text="No in-stock items in this category yet." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10">
            {inStock.map((p, i) => (
              <Reveal key={p.id} variant="scale" delay={(i % 4) * 90} className="h-full">
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* PRE STOCK */}
      <section id="pre-stock" className="max-w-7xl mx-auto px-6 py-20">
        <Reveal>
          <SectionHeader
            eyebrow={<><Truck className="w-3.5 h-3.5 inline mr-1.5" />Incoming</>}
            title={<>Pre-Stock <span className="text-neon">Goods</span></>}
            subtitle="Coming soon to our inventory. Pre-order now and lock your price."
            accent="warning"
          />
        </Reveal>
        {preStock.length === 0 ? (
          <EmptyState text="No pre-order items in this category yet." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-10">
            {preStock.map((p, i) => (
              <Reveal key={p.id} variant="scale" delay={(i % 4) * 90} className="h-full">
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      </>
      )}

      {/* HOW IT WORKS + CTA -- guests only, standard practice: returning customers don't need onboarding content repeated */}
      {!customer && (
      <>
      <section id="how" className="max-w-7xl mx-auto px-6 py-24">
        <Reveal>
          <SectionHeader
            eyebrow="How it works"
            title="From tap to delivery"
            subtitle="No card. No checkout. Just three steps."
          />
        </Reveal>
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Reveal delay={0} className="h-full">
            <Step n="01" icon={<Package2 className="w-6 h-6" />} title="Browse goods" text="Filter by category. See what's in stock vs. coming soon." />
          </Reveal>
          <Reveal delay={120} className="h-full">
            <Step n="02" icon={<MessageCircle className="w-6 h-6" />} title="Tap to order" text="See Paystack checkout and complete payment before confirming." />
          </Reveal>
          <Reveal delay={240} className="h-full">
            <Step n="03" icon={<Truck className="w-6 h-6" />} title="Confirm and ship" text="Send payment proof on WhatsApp and we prepare your delivery." />
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <Reveal variant="scale" className="block relative overflow-hidden rounded-3xl glass p-10 md:p-16 text-center shadow-elevated">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 animate-aurora" />
          <div className="relative space-y-5 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-display font-bold">
              Can't find something? <span className="text-gradient">We'll import it.</span>
            </h2>
            <p className="text-muted-foreground">
              Tell us what you need on WhatsApp. We source imports from across the globe.
            </p>
            <WhatsAppButton
              message="Hi! I'd like to request a custom import."
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold shadow-glow hover:shadow-neon transition-shadow"
            >
              <MessageCircle className="w-5 h-5" /> Request on WhatsApp
            </WhatsAppButton>
          </div>
        </Reveal>
      </section>
      </>
      )}

      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {STORE.name}. All imports reserved.</p>
          <p>Orders processed via WhatsApp · {STORE.whatsapp}</p>
        </div>
      </footer>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="text-3xl font-display font-bold text-gradient">{n}</div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function CategoryPill({ name, emoji, active, onClick }: { id: string; name: string; emoji: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`group w-full rounded-2xl p-4 text-center transition-all border ${
        active
          ? "bg-gradient-to-br from-primary to-accent text-primary-foreground border-transparent shadow-glow scale-105"
          : "bg-card hover:bg-muted border-border hover:border-primary/40 hover:-translate-y-0.5"
      }`}
    >
      <div className="text-3xl mb-1.5">{emoji}</div>
      <div className="text-xs font-bold tracking-wide">{name}</div>
    </button>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
  accent,
}: {
  eyebrow: React.ReactNode;
  title: React.ReactNode;
  subtitle?: string;
  accent?: "success" | "warning";
}) {
  const accentClass =
    accent === "success" ? "text-success border-success/40 bg-success/10"
    : accent === "warning" ? "text-warning border-warning/40 bg-warning/10"
    : "text-accent border-accent/40 bg-accent/10";
  return (
    <div className="text-center max-w-2xl mx-auto">
      <div className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider ${accentClass}`}>
        {eyebrow}
      </div>
      <h2 className="mt-4 text-4xl md:text-5xl font-display font-bold">{title}</h2>
      {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function Step({ n, icon, title, text }: { n: string; icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="card-3d card-3d-hover rounded-2xl p-7 relative">
      <div className="absolute -top-3 -right-3 text-6xl font-display font-bold opacity-10">{n}</div>
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground shadow-glow">
        {icon}
      </div>
      <h3 className="mt-5 text-xl font-display font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="mt-10 rounded-2xl glass p-12 text-center text-muted-foreground">
      {text}
    </div>
  );
}
