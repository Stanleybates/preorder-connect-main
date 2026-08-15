import { Package, LayoutGrid, ShoppingCart, User } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { STORE } from "@/lib/store-data";
import { useSiteSettings } from "@/lib/catalog-api";
import { useCart } from "@/lib/cart-api";
import { BrowseDialog } from "@/components/BrowseDialog";
import { CartDrawer } from "@/components/CartDrawer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { SearchBar } from "@/components/SearchBar";
import { getCurrentCustomer, logoutCustomer } from "@/lib/customer-auth-store";

export function SiteHeader() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(getCurrentCustomer());
  const { data: settings } = useSiteSettings();
  const { data: cart } = useCart();
  const storeName = settings?.name || STORE.name;
  const cartCount = cart?.item_count ?? 0;

  const onLogout = async () => {
    await logoutCustomer();
    setCustomer(null);
    navigate({ to: "/" });
  };

  const CartButton = ({ className = "" }: { className?: string }) => (
    <CartDrawer>
      <button className={`relative p-2 rounded-full hover:bg-muted transition-colors ${className}`} aria-label="Cart">
        <ShoppingCart className="w-5 h-5" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        )}
      </button>
    </CartDrawer>
  );

  const AccountButton = ({ className = "" }: { className?: string }) => (
    <button
      onClick={() => navigate({ to: customer ? "/account" : "/login" })}
      className={`p-2 rounded-full hover:bg-muted transition-colors ${className}`}
      aria-label={customer ? "My account" : "Login"}
    >
      <User className="w-5 h-5" />
    </button>
  );

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <a href="#top" className="flex items-center gap-2.5 min-w-0 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent shadow-glow flex items-center justify-center shrink-0">
            <Package className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="hidden sm:inline font-display font-bold text-lg tracking-tight truncate">{storeName}</span>
        </a>

        {/* Search -- visible on all screen sizes, takes remaining space */}
        <SearchBar className="flex-1 min-w-0 max-w-md" />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground shrink-0">
          <BrowseDialog>
            <button className="hover:text-foreground transition-colors inline-flex items-center gap-1.5">
              <LayoutGrid className="w-4 h-4" /> Browse goods
            </button>
          </BrowseDialog>
          <a href="#in-stock" className="hover:text-foreground transition-colors">In Stock</a>
          <a href="#pre-stock" className="hover:text-foreground transition-colors">Pre-Stock</a>
          {customer ? (
            <>
              <a href="/account" className="hover:text-foreground transition-colors">
                {customer.name.split(" ")[0]}
              </a>
              <button onClick={onLogout} className="hover:text-foreground transition-colors">
                Logout
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="hover:text-foreground transition-colors">Login</a>
              <a href="/signup" className="hover:text-foreground transition-colors">Sign Up</a>
            </>
          )}
        </nav>

        {/* Right side icons -- account/cart hidden on mobile since BottomNav covers them */}
        <div className="hidden md:flex items-center gap-1 sm:gap-2 shrink-0">
          <AccountButton />
          <CartButton />
          <WhatsAppButton className="inline-flex px-4 py-2 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-semibold shadow-glow hover:shadow-neon transition-shadow">
            WhatsApp
          </WhatsAppButton>
        </div>
      </div>
    </header>
  );
}
