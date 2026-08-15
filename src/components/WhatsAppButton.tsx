import { useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { MessageCircle, Lock } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getCurrentCustomer } from "@/lib/customer-auth-store";
import { STORE } from "@/lib/store-data";

type Props = {
  message?: string;
  className?: string;
  children: ReactNode;
};

/**
 * Wraps WhatsApp ordering behind a login gate. Logged-in customers go straight
 * to WhatsApp; guests see a popup nudging them to log in first.
 */
export function WhatsAppButton({ message, className = "", children }: Props) {
  const navigate = useNavigate();
  const [showGate, setShowGate] = useState(false);
  const customer = getCurrentCustomer();

  const whatsappUrl = `https://wa.me/${STORE.whatsapp.replace(/[^\d]/g, "")}${
    message ? `?text=${encodeURIComponent(message)}` : ""
  }`;

  if (customer) {
    return (
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setShowGate(true)} className={className}>
        {children}
      </button>

      <Dialog open={showGate} onOpenChange={setShowGate}>
        <DialogContent className="max-w-sm w-[90vw] p-6 bg-background border border-border shadow-elevated rounded-3xl">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-lg font-display font-bold">Login to order on WhatsApp</h2>
            <p className="text-sm text-muted-foreground mt-2">
              WhatsApp ordering is available to signed-in customers. Log in or create an account to request items and place orders directly.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowGate(false);
                  navigate({ to: "/login" });
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-neon transition-all"
              >
                <MessageCircle className="w-4 h-4" /> Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowGate(false);
                  navigate({ to: "/signup" });
                }}
                className="w-full rounded-2xl border border-border px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-all"
              >
                Create an account
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
