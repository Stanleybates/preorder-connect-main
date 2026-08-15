import { type ReactNode, useState } from "react";
import { Minus, Plus, ShoppingCart, Trash2, X, Loader2, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useCart, useUpdateCartItem, useRemoveCartItem, runCartCheckout } from "@/lib/cart-api";
import { SmartImage } from "@/components/SmartImage";
import { STORE } from "@/lib/store-data";

function formatMoney(n: number | string) {
  return `${STORE.currency} ${Number(n).toLocaleString()}`;
}

export function CartDrawer({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { data: cart, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const items = cart?.items ?? [];
  const isEmpty = items.length === 0;

  const onCheckout = async () => {
    setCheckoutError("");
    setCheckingOut(true);
    try {
      const result = await runCartCheckout();
      if (result.outcome === "success") {
        setCheckoutSuccess(true);
      } else if (result.outcome === "failed") {
        setCheckoutError(result.message);
      } else if (result.outcome === "pending") {
        setCheckoutError("Your payment is still processing. Check your account for order status shortly.");
      }
      // "cancelled" -- user closed the Paystack popup, just do nothing
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Checkout failed.");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (!next) setCheckoutSuccess(false); }}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="p-0 gap-0 overflow-hidden bg-background border-border w-full h-full max-w-full sm:max-w-md sm:h-auto sm:max-h-[85vh] sm:rounded-3xl rounded-none flex flex-col top-0 left-0 translate-x-0 translate-y-0 sm:top-[50%] sm:left-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] [&>button:last-child]:hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-display font-bold">Your Cart</h2>
          </div>
          <button onClick={() => setOpen(false)} className="p-1.5 rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {checkoutSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            <CheckCircle2 className="w-14 h-14 text-success" />
            <div>
              <h3 className="text-xl font-display font-bold">Order placed!</h3>
              <p className="text-sm text-muted-foreground mt-1">Your payment was confirmed and your order is being processed.</p>
            </div>
            <a
              href="/account"
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
            >
              View my orders
            </a>
          </div>
        ) : isLoading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
        ) : isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 py-20 text-center">
            <ShoppingCart className="w-12 h-12 text-muted-foreground/40" />
            <p className="text-muted-foreground">Your cart is empty.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4" style={{ maxHeight: "60vh" }}>
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 rounded-2xl border border-border/70 bg-card p-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0">
                    <SmartImage
                      src={item.product_image || ""}
                      alt={item.product_name}
                      emoji={item.product_emoji}
                      hue={item.product_hue}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold line-clamp-2 leading-snug">{item.product_name}</p>
                    <p className="text-sm font-display font-bold text-gradient mt-1">{formatMoney(item.subtotal)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => updateItem.mutate({ productId: item.product, quantity: item.quantity - 1 })}
                        disabled={updateItem.isPending}
                        className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateItem.mutate({ productId: item.product, quantity: item.quantity + 1 })}
                        disabled={updateItem.isPending}
                        className="w-7 h-7 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem.mutate(item.product)}
                        disabled={removeItem.isPending}
                        className="ml-auto w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border px-5 py-4 shrink-0 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">Total</span>
                <span className="text-xl font-display font-bold text-gradient">{formatMoney(cart?.total ?? 0)}</span>
              </div>

              {checkoutError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {checkoutError}
                </div>
              )}

              <button
                type="button"
                onClick={onCheckout}
                disabled={checkingOut}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-neon transition-all disabled:opacity-60"
              >
                {checkingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : (
                  `Checkout ${formatMoney(cart?.total ?? 0)}`
                )}
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
