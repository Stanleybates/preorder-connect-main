import { type ReactNode, useState } from "react";
import { ArrowRight, CheckCircle2, Phone, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { STORE, type Product, formatPrice, whatsappLink } from "@/lib/store-data";
import { verifyPayment, PAYSTACK_PUBLIC_KEY } from "@/lib/payments-api";
import { recordProductView } from "@/lib/recently-viewed-api";

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        currency?: string;
        ref: string;
        callback: (response: { reference: string }) => void;
        onClose: () => void;
      }) => { openIframe: () => void };
    };
  }
}

export function OrderDialog({ product, children }: { product: Product; children: ReactNode }) {
  const [email, setEmail] = useState("");

  const onOpenChange = (open: boolean) => {
    if (open) {
      const productIdNum = Number(product.id);
      if (Number.isFinite(productIdNum)) recordProductView(productIdNum);
    }
  };
  const [paying, setPaying] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState("");

  const startPayment = () => {
    setError("");

    if (!email.trim() || !email.includes("@")) {
      setError("Enter a valid email to continue.");
      return;
    }

    if (!window.PaystackPop) {
      setError("Payment popup failed to load. Check your connection and try again.");
      return;
    }

    setPaying(true);
    const reference = `${Date.now()}-${product.id}`;

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: email.trim(),
      amount: Math.round(product.price * 100),
      currency: "GHS",
      ref: reference,
      callback: async (response) => {
        setVerifying(true);
        const productIdNum = Number(product.id.replace(/[^0-9]/g, ""));
        const result = await verifyPayment(response.reference, Number.isFinite(productIdNum) ? productIdNum : undefined);
        setVerifying(false);
        setPaying(false);
        if (result.success) {
          setPaid(true);
        } else {
          setError(result.message);
        }
      },
      onClose: () => {
        setPaying(false);
      },
    });

    handler.openIframe();
  };

  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-xl w-[95vw] p-6 overflow-hidden bg-background border border-border shadow-elevated">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display font-bold">Pay with {STORE.payment.provider}</DialogTitle>
          <DialogDescription>
            Complete payment via Paystack, then confirm your order on WhatsApp.
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

        {!paid ? (
          <div className="mt-6 rounded-3xl border border-border/70 bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground mb-4">
              <Phone className="w-4 h-4" /> Payment
            </div>

            <label className="block space-y-2 text-sm mb-4">
              <span className="font-medium">Your email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={paying || verifying}
                className="w-full rounded-xl border border-border px-4 py-3 bg-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </label>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            <button
              type="button"
              onClick={startPayment}
              disabled={paying || verifying}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-60"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying payment...
                </>
              ) : paying ? (
                "Waiting for payment..."
              ) : (
                `Pay ${formatPrice(product.price)} with Paystack`
              )}
            </button>
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-success/30 bg-success/10 p-5 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-success shrink-0" />
            <p className="text-sm text-success font-medium">
              Payment successful! Tap below to confirm your order and arrange delivery on WhatsApp.
            </p>
          </div>
        )}

        {paid && (
          <div className="mt-6 space-y-2">
            <a
              href={whatsappLink(product)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-4 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-neon transition-all"
            >
              Confirm on WhatsApp (optional) <ArrowRight className="w-4 h-4" />
            </a>
            <p className="text-center text-xs text-muted-foreground">
              Your order is already paid for — this just helps us coordinate delivery faster.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
