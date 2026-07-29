import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, MessageCircle, Package2, Sparkles, Truck, Boxes } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { ProductCard } from "@/components/ProductCard";
import { BrowseDialog } from "@/components/BrowseDialog";
import { SmartImage } from "@/components/SmartImage";
import { Reveal } from "@/components/Reveal";
import { CATEGORIES, PRODUCTS, STORE } from "@/lib/store-data";

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

function Index() {
  const [activeCat, setActiveCat] = useState<string>("all");

  const pickCategory = (id: string) => {
    setActiveCat(id);
    // jump to inventory after filtering
    setTimeout(() => {
      document.getElementById("in-stock")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  const inStock = useMemo(
    () => PRODUCTS.filter(p => p.status === "in-stock" && (activeCat === "all" || p.category === activeCat)),
    [activeCat]
  );
  const preStock = useMemo(
    () => PRODUCTS.filter(p => p.status === "pre-stock" && (activeCat === "all" || p.category === activeCat)),
    [activeCat]
  );

  const heroPhones = PRODUCTS.filter(p => p.category === "iphones").slice(0, 4);


  return (
    <div id="top" className="min-h-screen bg-background">
      <SiteHeader />

      {/* HERO */}
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
              <Stat n={`${PRODUCTS.filter(p=>p.status==='in-stock').length}+`} label="In stock" />
              <Stat n={`${PRODUCTS.filter(p=>p.status==='pre-stock').length}+`} label="Pre-order" />
              <Stat n={`${CATEGORIES.length}`} label="Categories" />
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
          {CATEGORIES.map((c, i) => (
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

      {/* HOW IT WORKS */}
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
            <a
              href={`https://wa.me/${STORE.whatsapp.replace(/[^\d]/g, "")}?text=${encodeURIComponent("Hi! I'd like to request a custom import.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold shadow-glow hover:shadow-neon transition-shadow"
            >
              <MessageCircle className="w-5 h-5" /> Request on WhatsApp
            </a>
          </div>
        </Reveal>
      </section>

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
