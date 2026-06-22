import { Package, LayoutGrid } from "lucide-react";
import { STORE } from "@/lib/store-data";
import { BrowseDialog } from "@/components/BrowseDialog";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent shadow-glow flex items-center justify-center">
            <Package className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">{STORE.name}</span>
        </a>
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <BrowseDialog>
            <button className="hover:text-foreground transition-colors inline-flex items-center gap-1.5">
              <LayoutGrid className="w-4 h-4" /> Browse goods
            </button>
          </BrowseDialog>
          <a href="#in-stock" className="hover:text-foreground transition-colors">In Stock</a>
          <a href="#pre-stock" className="hover:text-foreground transition-colors">Pre-Stock</a>
          <a href="#how" className="hover:text-foreground transition-colors">How it works</a>
          <a href="/admin" className="hover:text-foreground transition-colors font-semibold">Admin</a>
        </nav>
        <div className="flex items-center gap-2">
          <BrowseDialog>
            <button className="md:hidden px-3 py-2 rounded-full border border-border text-sm font-semibold inline-flex items-center gap-1.5">
              <LayoutGrid className="w-4 h-4" /> Browse
            </button>
          </BrowseDialog>
          <a
            href={`https://wa.me/${STORE.whatsapp.replace(/[^\d]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-semibold shadow-glow hover:shadow-neon transition-shadow"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}
