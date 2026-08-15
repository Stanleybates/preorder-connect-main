import { Clock, Zap, ShoppingCart, Check, Heart } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { formatPrice, whatsappLink, type Product } from "@/lib/store-data";
import { isCustomerAuthenticated } from "@/lib/customer-auth-store";
import { useAddToCart } from "@/lib/cart-api";
import { useToggleWishlist } from "@/lib/wishlist-api";
import { OrderDialog } from "@/components/OrderDialog";
import { SmartImage } from "@/components/SmartImage";

export function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigate();
  const authenticated = isCustomerAuthenticated();
  const productIdNum = Number(product.id);
  const { isSaved, toggle: toggleWishlist, isPending: wishlistPending } = useToggleWishlist(productIdNum);
  const isInStock = product.status === "in-stock";
  const accentBg = isInStock ? "group-hover:bg-primary" : "group-hover:bg-warning";
  const labelHover = isInStock ? "group-hover:text-primary-foreground/70" : "group-hover:text-white/80";
  const priceHover = isInStock ? "group-hover:text-primary-foreground" : "group-hover:text-white";

  const addToCart = useAddToCart();
  const [justAdded, setJustAdded] = useState(false);

  const onAddToCart = () => {
    if (!authenticated) {
      navigate({ to: "/login" });
      return;
    }
    if (!Number.isFinite(productIdNum)) return;
    addToCart.mutate(
      { productId: productIdNum },
      {
        onSuccess: () => {
          setJustAdded(true);
          setTimeout(() => setJustAdded(false), 1500);
        },
      }
    );
  };

  const onToggleWishlist = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!authenticated) {
      navigate({ to: "/login" });
      return;
    }
    toggleWishlist();
  };

  return (
    <div className="group bg-card rounded-3xl overflow-hidden border border-border/70 shadow-[0_4px_20px_-8px_rgb(0_0_0_/_0.08)] hover:shadow-[0_24px_60px_-20px_oklch(0.55_0.25_295_/_0.25)] hover:border-primary/30 transition-all duration-500 flex flex-col">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <SmartImage
          src={product.image}
          alt={product.name}
          emoji={product.emoji}
          hue={product.hue}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm ${
              isInStock ? "bg-success text-white" : "bg-warning text-white"
            }`}
          >
            {isInStock ? "● In Stock" : "◐ Pre-Order"}
          </span>
          {product.tag && (
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground shadow-sm inline-flex items-center gap-1 w-fit">
              <Zap className="w-2.5 h-2.5" /> {product.tag}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onToggleWishlist}
          disabled={wishlistPending}
          aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center hover:bg-white transition-colors disabled:opacity-60"
        >
          <Heart className={`w-4.5 h-4.5 ${isSaved ? "fill-pink-500 text-pink-500" : "text-gray-600"}`} />
        </button>
      </div>

      {/* info */}
      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex-1">
          <h3 className="font-display font-bold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {!isInStock && product.eta && (
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-warning mt-2 uppercase tracking-wide">
              <Clock className="w-3 h-3" />
              {product.eta}
            </div>
          )}
          {!authenticated ? (
            <div className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-800">
              Sign in to place an order
            </div>
          ) : null}
        </div>

        {authenticated ? (
          <div className="flex items-center gap-2">
            <OrderDialog product={product}>
              <button
                type="button"
                className={`flex-1 rounded-2xl border border-border bg-muted/50 ${accentBg} group-hover:border-transparent transition-all duration-300 text-left`}
              >
                <div className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <div className={`text-[9px] font-bold uppercase tracking-widest text-muted-foreground transition-colors ${labelHover}`}>
                      Buy now
                    </div>
                    <div className={`text-lg font-display font-bold text-foreground transition-colors ${priceHover}`}>
                      {formatPrice(product.price)}
                    </div>
                  </div>
                </div>
              </button>
            </OrderDialog>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onAddToCart();
              }}
              disabled={addToCart.isPending}
              aria-label="Add to cart"
              className="shrink-0 w-[52px] h-[52px] rounded-2xl border border-border bg-background flex items-center justify-center hover:bg-muted hover:border-primary/40 transition-all disabled:opacity-60"
            >
              {justAdded ? (
                <Check className="w-5 h-5 text-success" />
              ) : (
                <ShoppingCart className="w-5 h-5 text-foreground" />
              )}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => navigate({ to: "/login" })}
            className={`block w-full rounded-2xl border border-border bg-muted/50 ${accentBg} group-hover:border-transparent transition-all duration-300 text-left`}
          >
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <div className={`text-[9px] font-bold uppercase tracking-widest text-muted-foreground transition-colors ${labelHover}`}>
                  Login or sign up to order
                </div>
                <div className={`text-xl font-display font-bold text-foreground transition-colors ${priceHover}`}>
                  {formatPrice(product.price)}
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-card shadow-sm flex items-center justify-center text-warning">
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm2.25 13.25H9.75a.75.75 0 0 1-.75-.75v-.5c0-1.5 3-1.5 3 0v.5a.75.75 0 0 1-.75.75Zm2.12-5.22a.75.75 0 0 1-.15 1.05c-.47.3-.88.5-1.18.63-.28.12-.4.2-.44.3a.78.78 0 0 0-.05.27v.12a.75.75 0 0 1-1.5 0v-.12c0-.62.23-1.05.54-1.3.33-.28.97-.54 1.64-.84.7-.3 1.22-.7 1.22-1.58a.75.75 0 0 1 1.5 0c0 1.4-.87 1.95-1.8 2.2Z"/>
                </svg>
              </div>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
