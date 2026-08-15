import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { STORE } from "@/lib/store-data";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({ meta: [{ title: "Privacy Policy" }] }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to shop
        </Link>

        <div className="mb-8 flex flex-col gap-3">
          <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow w-fit">
            <ShieldCheck className="w-4 h-4" /> Privacy Policy
          </div>
          <h1 className="text-4xl font-display font-bold">Your privacy</h1>
          <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose prose-sm max-w-none space-y-6 text-sm leading-relaxed text-foreground">
          <section>
            <h2 className="text-lg font-display font-bold mb-2">What we collect</h2>
            <p className="text-muted-foreground">
              When you create an account with {STORE.name}, we collect your name, email, phone number, and any delivery address you provide. We also record your order and payment history to fulfill and track your purchases.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-display font-bold mb-2">How we use it</h2>
            <p className="text-muted-foreground">
              Your information is used to process orders, communicate delivery updates, and -- if you've opted in -- send you promotional offers. Payment is processed securely through Paystack; we do not store your card details.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-display font-bold mb-2">WhatsApp communication</h2>
            <p className="text-muted-foreground">
              If you contact us or place orders via WhatsApp, your phone number and messages are used solely to coordinate your order and delivery.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-display font-bold mb-2">Your choices</h2>
            <p className="text-muted-foreground">
              You can update your notification preferences or close your account at any time from your account settings. Closing your account deactivates access but retains order records as required for business and legal purposes.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-display font-bold mb-2">Contact</h2>
            <p className="text-muted-foreground">
              Questions about this policy? Reach us on WhatsApp at {STORE.whatsapp}.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
