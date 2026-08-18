import {
  Check,
  Clock3,
  Heart,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useState, type MouseEvent } from "react";

import {
  formatPrice,
  type Product,
} from "@/lib/store-data";

import {
  isCustomerAuthenticated,
} from "@/lib/customer-auth-store";

import { useAddToCart } from "@/lib/cart-api";
import { useToggleWishlist } from "@/lib/wishlist-api";
import { OrderDialog } from "@/components/OrderDialog";
import { SmartImage } from "@/components/SmartImage";

export function ProductCard({
  product,
}: {
  product: Product;
}) {
  const navigate = useNavigate();

  const authenticated =
    isCustomerAuthenticated();

  const productIdNum = Number(product.id);

  const {
    isSaved,
    toggle: toggleWishlist,
    isPending: wishlistPending,
  } = useToggleWishlist(productIdNum);

  const addToCart = useAddToCart();

  const [justAdded, setJustAdded] =
    useState(false);

  const isInStock =
    product.status === "in-stock";

  /*
   * Do not show a second badge when the
   * product tag repeats the availability.
   *
   * Example:
   * PRE-ORDER + PREORDER
   */
  const normalizedTag =
    product.tag?.toLowerCase().trim();

  const showTag =
    Boolean(product.tag) &&
    normalizedTag !== "preorder" &&
    normalizedTag !== "pre-order" &&
    normalizedTag !== "in stock" &&
    normalizedTag !== "in-stock";

  const onAddToCart = () => {
    if (!authenticated) {
      navigate({
        to: "/login",
      });

      return;
    }

    if (!Number.isFinite(productIdNum)) {
      return;
    }

    addToCart.mutate(
      {
        productId: productIdNum,
      },
      {
        onSuccess: () => {
          setJustAdded(true);

          setTimeout(() => {
            setJustAdded(false);
          }, 1500);
        },
      },
    );
  };

  const onToggleWishlist = (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();

    if (!authenticated) {
      navigate({
        to: "/login",
      });

      return;
    }

    toggleWishlist();
  };

  const goToLogin = () => {
    navigate({
      to: "/login",
    });
  };

  return (
    <article className="group h-full overflow-hidden rounded-3xl border border-border/70 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_20px_50px_-24px_rgba(0,0,0,0.28)]">
      {/* PRODUCT IMAGE */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <SmartImage
          src={product.image}
          alt={product.name}
          emoji={product.emoji}
          hue={product.hue}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />

        {/* Subtle image overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />

        {/* STATUS */}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] shadow-sm ${
              isInStock
                ? "bg-emerald-600 text-white"
                : "bg-amber-500 text-white"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />

            {isInStock
              ? "In stock"
              : "Preorder"}
          </span>

          {showTag && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-primary-foreground shadow-sm">
              <Sparkles className="h-3 w-3" />

              {product.tag}
            </span>
          )}
        </div>

        {/* WISHLIST */}
        <button
          type="button"
          onClick={onToggleWishlist}
          disabled={wishlistPending}
          aria-label={
            isSaved
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/90 text-gray-700 shadow-sm backdrop-blur-sm transition hover:scale-105 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Heart
            className={`h-[18px] w-[18px] ${
              isSaved
                ? "fill-rose-500 text-rose-500"
                : "text-gray-700"
            }`}
          />
        </button>
      </div>

      {/* PRODUCT DETAILS */}
      <div className="flex h-full flex-col p-5">
        <div className="flex-1">
          {/* CATEGORY */}
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {formatCategory(
              product.category,
            )}
          </p>

          {/* NAME */}
          <h3 className="line-clamp-2 min-h-[48px] font-display text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
            {product.name}
          </h3>

          {/* ETA */}
          {!isInStock &&
            product.eta && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700">
                <Clock3 className="h-3.5 w-3.5" />

                {product.eta}
              </div>
            )}
        </div>

        {/* PRICE */}
        <div className="mt-5 border-t border-border/60 pt-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {isInStock
              ? "Price"
              : "Preorder price"}
          </p>

          <p className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground">
            {formatPrice(product.price)}
          </p>
        </div>

        {/* ACTIONS */}
        <div className="mt-4">
          {authenticated ? (
            <div className="flex gap-2">
              <OrderDialog
                product={product}
              >
                <button
                  type="button"
                  className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    isInStock
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "bg-amber-500 text-white hover:bg-amber-600"
                  }`}
                >
                  {isInStock
                    ? "Buy now"
                    : "Preorder now"}
                </button>
              </OrderDialog>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onAddToCart();
                }}
                disabled={
                  addToCart.isPending
                }
                aria-label="Add to cart"
                title="Add to cart"
                className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-xl border border-border bg-background transition hover:border-primary/40 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
              >
                {justAdded ? (
                  <Check className="h-5 w-5 text-emerald-600" />
                ) : (
                  <ShoppingCart className="h-5 w-5 text-foreground" />
                )}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={goToLogin}
              className="w-full rounded-xl bg-foreground px-4 py-3 text-center text-sm font-semibold text-background transition hover:opacity-90"
            >
              Sign in to order
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

/*
 * Converts:
 *
 * iphones      -> iPhones
 * electronics  -> Electronics
 * laptops      -> Laptops
 */
function formatCategory(
  category: string,
) {
  if (
    category.toLowerCase() ===
    "iphones"
  ) {
    return "iPhones";
  }

  return category
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}