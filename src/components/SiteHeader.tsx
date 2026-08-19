import {
  Package,
  LayoutGrid,
  ShoppingCart,
  User,
  LogOut,
  HelpCircle,
} from "lucide-react";

import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { STORE } from "@/lib/store-data";
import { useSiteSettings } from "@/lib/catalog-api";
import { useCart } from "@/lib/cart-api";

import { BrowseDialog } from "@/components/BrowseDialog";
import { CartDrawer } from "@/components/CartDrawer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { SearchBar } from "@/components/SearchBar";

import {
  getCurrentCustomer,
  logoutCustomer,
} from "@/lib/customer-auth-store";

export function SiteHeader() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(
    getCurrentCustomer(),
  );

  const { data: settings } =
    useSiteSettings();

  const { data: cart } = useCart();

  const storeName =
    settings?.name || STORE.name;

  const cartCount =
    cart?.item_count ?? 0;

  const firstName =
    customer?.name?.split(" ")[0];

  const onLogout = async () => {
    await logoutCustomer();

    setCustomer(null);

    navigate({
      to: "/",
    });
  };

  const scrollToSection = (
    sectionId: string,
  ) => {
    document
      .getElementById(sectionId)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        {/* LOGO */}
        <button
          type="button"
          onClick={() =>
            scrollToSection("top")
          }
          className="flex shrink-0 items-center gap-2.5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-glow">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>

          <span className="hidden max-w-[160px] truncate font-display text-lg font-bold tracking-tight sm:inline">
            {storeName}
          </span>
        </button>

        {/* SEARCH */}
        <SearchBar className="min-w-0 flex-1 md:max-w-sm lg:max-w-md" />

        {/* DESKTOP NAV */}
        <nav className="hidden shrink-0 items-center gap-1 lg:flex">
          <BrowseDialog>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LayoutGrid className="h-4 w-4" />

              Shop
            </button>
          </BrowseDialog>

          <button
            type="button"
            onClick={() =>
              scrollToSection("how")
            }
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <HelpCircle className="h-4 w-4" />

            How it works
          </button>

          <button
            type="button"
            onClick={() =>
              navigate({
                to: "/promos",
              })
            }
            className="rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Promos
          </button>
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="hidden shrink-0 items-center gap-1 md:flex">
          {/* ACCOUNT */}
          {customer ? (
            <button
              type="button"
              onClick={() =>
                navigate({
                  to: "/account",
                })
              }
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
              aria-label="My account"
            >
              <User className="h-5 w-5" />

              <span className="hidden xl:inline">
                {firstName}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                navigate({
                  to: "/login",
                })
              }
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
              aria-label="Login"
            >
              <User className="h-5 w-5" />

              <span className="hidden xl:inline">
                Sign in
              </span>
            </button>
          )}

          {/* CART */}
          <CartDrawer>
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-muted"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {cartCount > 99
                    ? "99+"
                    : cartCount}
                </span>
              )}
            </button>
          </CartDrawer>

          {/* WHATSAPP */}
          <WhatsAppButton className="ml-1 inline-flex items-center rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:bg-muted">
            WhatsApp
          </WhatsAppButton>

          {/* LOGOUT */}
          {customer && (
            <button
              type="button"
              onClick={onLogout}
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}