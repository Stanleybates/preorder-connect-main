import { type ReactNode } from "react";
import { ArrowRight, Phone, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { STORE, type Product, formatPrice, whatsappLink } from "@/lib/store-data";

export function OrderDialog({ product, children }: { product: Product; children: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xl w-[95vw] p-6 overflow-hidden bg-background border border-border shadow-elevated">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display font-bold">Pay with {STORE.payment.provider}</DialogTitle>
          <DialogDescription>
            Complete payment via Paystack, then confirm your order on WhatsApp. Your item details are ready below.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 rounded-3xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground font-semibold">Product</div>
              <div className="mt-2 text-lg font-semibold">{product.name}</div>
            </div>
            <div className="text-right">
              <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground font-semibold">Price</div>
              <div className="mt-2 text-xl font-display font-bold text-gradient">{formatPrice(product.price)}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground mb-4">
            <Phone className="w-4 h-4" /> Payment
          </div>
          <div className="grid gap-3 text-sm">
            <div className="rounded-2xl bg-background/80 p-3">
              <div className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Provider</div>
              <div className="mt-1 font-semibold">{STORE.payment.provider}</div>
            </div>
            <div className="rounded-2xl bg-background/80 p-3 flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">Checkout</div>
                <div className="mt-1 font-semibold break-all">{STORE.payment.checkoutUrl || "—"}</div>
              </div>
              {STORE.payment.checkoutUrl ? (
                <a
                  href={`${STORE.payment.checkoutUrl}${STORE.payment.checkoutUrl.includes("?") ? "&" : "?"}product=${product.id}&amount=${product.price}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
                >
                  Pay with {STORE.payment.provider}
                </a>
              ) : null}
            </div>
            {STORE.payment.note && (
              <div className="rounded-2xl border border-border/70 bg-muted/40 p-3 text-sm text-muted-foreground">
                {STORE.payment.note}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-3xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 p-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            After payment, please send your payment proof and order confirmation to our WhatsApp. Tap the button below to continue the order from your phone.
          </p>
        </div>

        <a
          href={whatsappLink(product)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-neon transition-all"
        >
          Confirm on WhatsApp <ArrowRight className="w-4 h-4" />
        </a>
      </DialogContent>
    </Dialog>
  );
}
