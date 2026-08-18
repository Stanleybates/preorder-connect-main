import { createFileRoute, useSearch, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  MessageCircle,
  Package2,
  Sparkles,
  Truck,
  ShoppingBag,
  Megaphone,
  SlidersHorizontal,
  PackageCheck,
  Clock3,
} from "lucide-react";

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
      {
        title: "Prime Imports | Shop & Preorder Imported Products",
      },
      {
        name: "description",
        content:
          "Browse imported products, shop available items and preorder incoming products securely.",
      },
      {
        property: "og:title",
        content: "Prime Imports | Shop Imported Products",
      },
      {
        property: "og:description",
        content:
          "Browse in-stock and preorder products from Prime Imports.",
      },
    ],
  }),
  component: Index,
});

const WEIGHT_ORDER = 3;
const WEIGHT_WISHLIST = 2;
const WEIGHT_VIEWED = 1;

type AvailabilityFilter = "all" | "in-stock" | "pre-stock";

type SortMode =
  | "for-you"
  | "newest"
  | "price-low"
  | "price-high";

function sortByAffinity(
  products: Product[],
  scores: Record<string, number>,
): Product[] {
  return products
    .map((product, index) => ({
      product,
      index,
      score: scores[product.category] ?? 0,
    }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.index - b.index,
    )
    .map((entry) => entry.product);
}

function Index() {
  const customer = getCurrentCustomer();

  const search = useSearch({
    strict: false,
  }) as {
    category?: string;
  };

  const [activeCat, setActiveCat] = useState<string>(
    search.category || "all",
  );

  const [availability, setAvailability] =
    useState<AvailabilityFilter>("all");

  const [sortMode, setSortMode] =
    useState<SortMode>("newest");

  useEffect(() => {
    if (search.category) {
      setActiveCat(search.category);
    }
  }, [search.category]);

  const {
    data: PRODUCTS,
    isLoading: productsLoading,
    isError: productsError,
  } = useProducts();

  const {
    data: CATEGORIES,
    isLoading: categoriesLoading,
  } = useCategories();

  const { data: recentlyViewed } =
    useRecentlyViewed();

  const { data: wishlist } =
    useWishlist();

  const { data: orders } =
    useMyOrders();

  const products = PRODUCTS ?? [];
  const categories = CATEGORIES ?? [];

  const isLoading =
    productsLoading || categoriesLoading;

  const categoryScores = useMemo(() => {
    if (!customer) return {};

    const categoryById = new Map(
      products.map((product) => [
        Number(product.id),
        product.category,
      ]),
    );

    const scores: Record<string, number> = {};

    const add = (
      productId: number | null | undefined,
      weight: number,
    ) => {
      if (!productId) return;

      const category =
        categoryById.get(productId);

      if (!category) return;

      scores[category] =
        (scores[category] ?? 0) + weight;
    };

    (orders ?? []).forEach((order) => {
      order.items.forEach((item) =>
        add(item.product, WEIGHT_ORDER),
      );
    });

    (wishlist ?? []).forEach((item) =>
      add(item.product, WEIGHT_WISHLIST),
    );

    (recentlyViewed ?? []).forEach((item) =>
      add(item.product, WEIGHT_VIEWED),
    );

    return scores;
  }, [
    customer,
    products,
    orders,
    wishlist,
    recentlyViewed,
  ]);

  const hasSignal =
    Object.keys(categoryScores).length > 0;

  useEffect(() => {
    if (hasSignal) {
      setSortMode("for-you");
    }
  }, [hasSignal]);

  const pickCategory = (id: string) => {
    setActiveCat(id);

    setTimeout(() => {
      document
        .getElementById("products")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 60);
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (activeCat !== "all") {
      result = result.filter(
        (product) =>
          product.category === activeCat,
      );
    }

    // Availability filter
    if (availability !== "all") {
      result = result.filter(
        (product) =>
          product.status === availability,
      );
    }

    // Sorting
    if (
      sortMode === "for-you" &&
      hasSignal
    ) {
      return sortByAffinity(
        result,
        categoryScores,
      );
    }

    if (sortMode === "price-low") {
      return result.sort(
        (a, b) =>
          Number(a.price) - Number(b.price),
      );
    }

    if (sortMode === "price-high") {
      return result.sort(
        (a, b) =>
          Number(b.price) - Number(a.price),
      );
    }

    return result;
  }, [
    products,
    activeCat,
    availability,
    sortMode,
    hasSignal,
    categoryScores,
  ]);

  const heroPhones = products
    .filter(
      (product) =>
        product.category === "iphones",
    )
    .slice(0, 4);

  const selectedCategory =
    activeCat === "all"
      ? "All products"
      : categories.find(
          (category) =>
            category.id === activeCat,
        )?.name || "Products";

  return (
    <div
      id="top"
      className="min-h-screen bg-background"
    >
      <SiteHeader />
      <PromoFlyers />

      {/* HERO */}
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

                Imported products • Secure ordering • Easy tracking
              </div>

              <h1 className="text-5xl md:text-7xl font-display font-bold leading-[1.05] reveal is-visible">
                Imported goods,
                <br />

                <span className="text-gradient-anim">
                  delivered with style.
                </span>
              </h1>

              <p
                className="text-lg text-muted-foreground max-w-xl reveal is-visible"
                style={{
                  animationDelay: "120ms",
                }}
              >
                Discover imported products,
                shop available stock and preorder
                incoming items from one simple
                marketplace.
              </p>

              <div
                className="flex flex-wrap gap-3 reveal is-visible"
                style={{
                  animationDelay: "220ms",
                }}
              >
                <BrowseDialog>
                  <button className="shine px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold shadow-glow hover:shadow-neon hover:-translate-y-0.5 transition-all inline-flex items-center gap-2 group">
                    Browse products

                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </BrowseDialog>

                <button
                  type="button"
                  onClick={() => {
                    setAvailability("pre-stock");

                    document
                      .getElementById("products")
                      ?.scrollIntoView({
                        behavior: "smooth",
                      });
                  }}
                  className="px-6 py-3.5 rounded-xl glass font-semibold inline-flex items-center gap-2 hover:border-primary/40 hover:-translate-y-0.5 transition-all"
                >
                  <Truck className="w-4 h-4 text-accent" />

                  View preorders
                </button>
              </div>

              <div
                className="flex gap-8 pt-4 reveal is-visible"
                style={{
                  animationDelay: "320ms",
                }}
              >
                <Stat
                  n={`${
                    products.filter(
                      (product) =>
                        product.status ===
                        "in-stock",
                    ).length
                  }+`}
                  label="In stock"
                />

                <Stat
                  n={`${
                    products.filter(
                      (product) =>
                        product.status ===
                        "pre-stock",
                    ).length
                  }+`}
                  label="Preorder"
                />

                <Stat
                  n={`${categories.length}`}
                  label="Categories"
                />
              </div>
            </div>

            {/* HERO PRODUCTS */}
            <div className="relative hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                {heroPhones.map(
                  (product, index) => (
                    <button
                      type="button"
                      key={product.id}
                      onClick={() =>
                        pickCategory(
                          "iphones",
                        )
                      }
                      className={`text-left group relative rounded-3xl overflow-hidden bg-card border border-border/60 shadow-elevated hover:shadow-glow hover:-translate-y-2 hover:border-primary/40 transition-all duration-500 reveal-scale is-visible ${
                        index % 2 === 0
                          ? "aspect-square mt-0"
                          : "aspect-[4/5] mt-10"
                      }`}
                      style={{
                        animationDelay: `${
                          200 +
                          index * 120
                        }ms`,
                      }}
                    >
                      <SmartImage
                        src={product.image}
                        alt={product.name}
                        emoji={product.emoji}
                        hue={product.hue}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />

                      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                        <div className="text-[10px] uppercase tracking-widest text-white/70 font-semibold">
                          iPhone
                        </div>

                        <div className="text-sm font-display font-bold text-white line-clamp-1">
                          {product.name}
                        </div>
                      </div>
                    </button>
                  ),
                )}
              </div>

              <div className="absolute -top-4 -right-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-bold shadow-glow z-30 animate-bob">
                ✨ Latest iPhones
              </div>
            </div>
          </div>
        </section>
      )}

      {/* RETURNING CUSTOMER */}
      {customer && (
        <section className="max-w-7xl mx-auto px-6 pt-10 pb-4">
          <div className="rounded-3xl bg-gradient-to-r from-primary to-accent p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-glow">
            <div className="flex items-center gap-3 text-primary-foreground">
              <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>

              <div>
                <p className="text-lg font-display font-bold">
                  Welcome back,{" "}
                  {
                    customer.name.split(
                      " ",
                    )[0]
                  }
                </p>

                <p className="text-sm text-primary-foreground/80">
                  Discover what's new in the
                  store.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-fit">
              <a
                href="#products"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/15 px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-white/25 transition-colors"
              >
                Shop now

                <ArrowRight className="w-4 h-4" />
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

      {/* SHOP / FILTER AREA */}
      <section
        id="products"
        className="max-w-7xl mx-auto px-4 sm:px-6 py-16 scroll-mt-24"
      >
        <Reveal>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-primary">
                <ShoppingBag className="w-4 h-4" />

                Shop
              </div>

              <h2 className="mt-3 text-3xl md:text-5xl font-display font-bold">
                Find your next product
              </h2>

              <p className="mt-3 text-muted-foreground max-w-xl">
                Browse all products or narrow
                the store by category,
                availability and price.
              </p>
            </div>

            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                {filteredProducts.length}
              </span>{" "}
              {filteredProducts.length === 1
                ? "product"
                : "products"}{" "}
              found
            </div>
          </div>
        </Reveal>

        {/* CATEGORY FILTERS */}
        <div className="mt-8">
          <div className="flex items-center justify-between gap-4 mb-3">
            <p className="text-sm font-semibold">
              Categories
            </p>

            {activeCat !== "all" && (
              <button
                type="button"
                onClick={() =>
                  setActiveCat("all")
                }
                className="text-xs font-semibold text-primary hover:underline"
              >
                Clear category
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <CategoryFilter
              name="All"
              emoji="✨"
              active={activeCat === "all"}
              onClick={() =>
                pickCategory("all")
              }
            />

            {categoriesLoading ? (
              <div className="w-5 h-5 m-3 rounded-full border-2 border-primary/20 border-t-primary animate-spin shrink-0" />
            ) : (
              categories.map(
                (category) => (
                  <CategoryFilter
                    key={category.id}
                    name={category.name}
                    emoji={category.emoji}
                    active={
                      activeCat ===
                      category.id
                    }
                    onClick={() =>
                      pickCategory(
                        category.id,
                      )
                    }
                  />
                ),
              )
            )}
          </div>
        </div>

        {/* FILTER TOOLBAR */}
        <div className="mt-5 rounded-2xl border border-border bg-card/70 backdrop-blur-sm p-3 sm:p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
              <span className="hidden sm:inline-flex items-center gap-2 mr-1 text-sm font-medium text-muted-foreground">
                <SlidersHorizontal className="w-4 h-4" />

                Availability
              </span>

              <FilterButton
                active={
                  availability === "all"
                }
                onClick={() =>
                  setAvailability("all")
                }
              >
                All products
              </FilterButton>

              <FilterButton
                active={
                  availability ===
                  "in-stock"
                }
                onClick={() =>
                  setAvailability(
                    "in-stock",
                  )
                }
              >
                <PackageCheck className="w-3.5 h-3.5" />

                In stock
              </FilterButton>

              <FilterButton
                active={
                  availability ===
                  "pre-stock"
                }
                onClick={() =>
                  setAvailability(
                    "pre-stock",
                  )
                }
              >
                <Clock3 className="w-3.5 h-3.5" />

                Preorder
              </FilterButton>
            </div>

            <div className="flex items-center gap-3">
              <label
                htmlFor="product-sort"
                className="text-sm text-muted-foreground whitespace-nowrap"
              >
                Sort by
              </label>

              <select
                id="product-sort"
                value={sortMode}
                onChange={(event) =>
                  setSortMode(
                    event.target
                      .value as SortMode,
                  )
                }
                className="w-full md:w-auto min-w-[170px] rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary"
              >
                {customer &&
                  hasSignal && (
                    <option value="for-you">
                      For you
                    </option>
                  )}

                <option value="newest">
                  Newest
                </option>

                <option value="price-low">
                  Price: low to high
                </option>

                <option value="price-high">
                  Price: high to low
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* ACTIVE FILTER SUMMARY */}
        {(activeCat !== "all" ||
          availability !== "all") && (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">
              Active filters:
            </span>

            {activeCat !== "all" && (
              <ActiveFilter
                label={selectedCategory}
                onRemove={() =>
                  setActiveCat("all")
                }
              />
            )}

            {availability !== "all" && (
              <ActiveFilter
                label={
                  availability ===
                  "in-stock"
                    ? "In stock"
                    : "Preorder"
                }
                onRemove={() =>
                  setAvailability("all")
                }
              />
            )}

            <button
              type="button"
              onClick={() => {
                setActiveCat("all");
                setAvailability("all");
              }}
              className="ml-1 text-xs font-semibold text-primary hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* PRODUCTS */}
        {isLoading ? (
          <div className="py-24 flex justify-center">
            <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
        ) : productsError ? (
          <div className="py-24 text-center text-muted-foreground">
            Couldn't load products right
            now. Please refresh and try
            again.
          </div>
        ) : filteredProducts.length ===
          0 ? (
          <EmptyState
            title="No products found"
            text="Try changing the category or availability filter."
            onClear={() => {
              setActiveCat("all");
              setAvailability("all");
            }}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {filteredProducts.map(
              (product, index) => (
                <Reveal
                  key={product.id}
                  variant="scale"
                  delay={
                    (index % 4) * 70
                  }
                  className="h-full"
                >
                  <ProductCard
                    product={product}
                  />
                </Reveal>
              ),
            )}
          </div>
        )}
      </section>

      {/* HOW IT WORKS */}
      {!customer && (
        <>
          <section
            id="how"
            className="max-w-7xl mx-auto px-6 py-24"
          >
            <Reveal>
              <SectionHeader
                eyebrow="How it works"
                title="From browsing to delivery"
                subtitle="Choose your product, place your order and follow the process through delivery."
              />
            </Reveal>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <Reveal
                delay={0}
                className="h-full"
              >
                <Step
                  n="01"
                  icon={
                    <Package2 className="w-6 h-6" />
                  }
                  title="Browse products"
                  text="Explore available and incoming products, then use filters to find what you need."
                />
              </Reveal>

              <Reveal
                delay={120}
                className="h-full"
              >
                <Step
                  n="02"
                  icon={
                    <ShoppingBag className="w-6 h-6" />
                  }
                  title="Place your order"
                  text="Choose your product, review the details and continue through the ordering process."
                />
              </Reveal>

              <Reveal
                delay={240}
                className="h-full"
              >
                <Step
                  n="03"
                  icon={
                    <Truck className="w-6 h-6" />
                  }
                  title="Receive your order"
                  text="Your order is prepared and processed for delivery once confirmed."
                />
              </Reveal>
            </div>
          </section>

          {/* CUSTOM IMPORT CTA */}
          <section className="max-w-7xl mx-auto px-6 pb-24">
            <Reveal
              variant="scale"
              className="block relative overflow-hidden rounded-3xl glass p-10 md:p-16 text-center shadow-elevated"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 animate-aurora" />

              <div className="relative space-y-5 max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-display font-bold">
                  Can't find something?{" "}
                  <span className="text-gradient">
                    We'll help you source it.
                  </span>
                </h2>

                <p className="text-muted-foreground">
                  Tell us what you're looking
                  for and we'll help you with
                  your custom import request.
                </p>

                <WhatsAppButton
                  message="Hi! I'd like to request a custom import."
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold shadow-glow hover:shadow-neon transition-shadow"
                >
                  <MessageCircle className="w-5 h-5" />

                  Request on WhatsApp
                </WhatsAppButton>
              </div>
            </Reveal>
          </section>
        </>
      )}

      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()}{" "}
            {STORE.name}. All rights reserved.
          </p>

          <p>
            Shop imported products with a
            simple and secure ordering
            experience.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Stat({
  n,
  label,
}: {
  n: string;
  label: string;
}) {
  return (
    <div>
      <div className="text-3xl font-display font-bold text-gradient">
        {n}
      </div>

      <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">
        {label}
      </div>
    </div>
  );
}

function CategoryFilter({
  name,
  emoji,
  active,
  onClick,
}: {
  name: string;
  emoji: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all ${
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-muted"
      }`}
    >
      <span
        aria-hidden="true"
        className="text-base"
      >
        {emoji}
      </span>

      {name}
    </button>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium border transition-colors ${
        active
          ? "bg-foreground text-background border-foreground"
          : "bg-background text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
      }`}
    >
      {children}
    </button>
  );
}

function ActiveFilter({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/70 transition-colors"
      title={`Remove ${label} filter`}
    >
      {label}

      <span
        aria-hidden="true"
        className="text-muted-foreground"
      >
        ×
      </span>
    </button>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: React.ReactNode;
  title: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <div className="inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider text-accent border-accent/40 bg-accent/10">
        {eyebrow}
      </div>

      <h2 className="mt-4 text-4xl md:text-5xl font-display font-bold">
        {title}
      </h2>

      {subtitle && (
        <p className="mt-3 text-muted-foreground">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function Step({
  n,
  icon,
  title,
  text,
}: {
  n: string;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="card-3d card-3d-hover rounded-2xl p-7 relative h-full">
      <div className="absolute -top-3 -right-3 text-6xl font-display font-bold opacity-10">
        {n}
      </div>

      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground shadow-glow">
        {icon}
      </div>

      <h3 className="mt-5 text-xl font-display font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm text-muted-foreground">
        {text}
      </p>
    </div>
  );
}

function EmptyState({
  title,
  text,
  onClear,
}: {
  title: string;
  text: string;
  onClear?: () => void;
}) {
  return (
    <div className="mt-10 rounded-2xl border border-border bg-card p-10 md:p-14 text-center">
      <div className="mx-auto w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
        <ShoppingBag className="w-5 h-5 text-muted-foreground" />
      </div>

      <h3 className="mt-4 text-lg font-display font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm text-muted-foreground">
        {text}
      </p>

      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 text-sm font-semibold text-primary hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}