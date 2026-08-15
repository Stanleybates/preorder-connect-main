import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LayoutGrid, ShoppingCart, Heart, User } from "lucide-react";
import { useCart } from "@/lib/cart-api";
import { CartDrawer } from "@/components/CartDrawer";
import { getCurrentCustomer } from "@/lib/customer-auth-store";

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: cart } = useCart();
  const cartCount = cart?.item_count ?? 0;
  const customer = getCurrentCustomer();

  if (pathname.startsWith("/admin")) return null;

  const isActive = (path: string) => (path === "/" ? pathname === "/" : pathname.startsWith(path));

  const tabClass = (active: boolean) =>
    `flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] font-semibold transition-colors ${
      active ? "text-primary" : "text-muted-foreground"
    }`;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 h-16 bg-background/95 backdrop-blur-xl border-t border-border flex items-stretch pb-[env(safe-area-inset-bottom)]">
      <Link to="/" className={tabClass(isActive("/"))}>
        <Home className="w-5 h-5" />
        Home
      </Link>

      <Link to="/categories" className={tabClass(isActive("/categories"))}>
        <LayoutGrid className="w-5 h-5" />
        Categories
      </Link>

      <CartDrawer>
        <button className={tabClass(false) + " relative"}>
          <ShoppingCart className="w-5 h-5" />
          Cart
          {cartCount > 0 && (
            <span className="absolute top-0.5 right-[calc(50%-16px)] min-w-[16px] h-[16px] px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </button>
      </CartDrawer>

      <Link to="/wishlist" className={tabClass(isActive("/wishlist"))}>
        <Heart className="w-5 h-5" />
        Wishlist
      </Link>

      <Link to={customer ? "/account" : "/login"} className={tabClass(isActive("/account") || isActive("/login"))}>
        <User className="w-5 h-5" />
        Account
      </Link>
    </nav>
  );
}
