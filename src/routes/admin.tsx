import { createFileRoute, useNavigate, useLocation, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { isAuthenticated, getCurrentUser, getProfilePhoto, logout } from "@/lib/auth-store";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { OverviewPanel } from "@/components/admin/OverviewPanel";
import { ProductManager } from "@/components/admin/ProductManager";
import { OrdersPanel } from "@/components/admin/OrdersPanel";
import { PromotionsPanel } from "@/components/admin/PromotionsPanel";
import { SubAdminPanel } from "@/components/admin/SubAdminPanel";
import { PaymentsPanel } from "@/components/admin/PaymentsPanel";
import { StoreSettings } from "@/components/admin/StoreSettings";
import {
  LayoutDashboard,
  Package,
  Truck,
  Megaphone,
  Users,
  CreditCard,
  Settings,
  Menu,
  X,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: Admin,
});

type Tab = "overview" | "products" | "orders" | "promotions" | "urm" | "payments" | "settings";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "products", label: "Products", icon: <Package className="h-4 w-4" /> },
  { id: "orders", label: "Orders", icon: <Truck className="h-4 w-4" /> },
  { id: "promotions", label: "Promotions", icon: <Megaphone className="h-4 w-4" /> },
  { id: "urm", label: "Sub-admin Approvals", icon: <Users className="h-4 w-4" /> },
  { id: "payments", label: "Payments", icon: <CreditCard className="h-4 w-4" /> },
  { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
];

function Admin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [settingsInnerTab, setSettingsInnerTab] = useState<"store" | "account">("store");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!isAuthenticated() && location.pathname === "/admin") {
      navigate({ to: "/admin/login", replace: true });
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const refresh = () => setTick(t => t + 1);
  const notify = (message: string, type: "success" | "error") => setToast({ message, type });
  const handleLogout = () => {
    logout();
    navigate({ to: "/admin/login", replace: true });
  };

  const goToAccount = () => {
    setSettingsInnerTab("account");
    setActiveTab("settings");
  };

  const selectTab = (id: Tab) => {
    setActiveTab(id);
    setMobileNavOpen(false);
  };

  if (!isAuthenticated()) {
    return location.pathname === "/admin" ? null : <Outlet />;
  }

  if (!currentUser) {
    return null;
  }

  const activeTabInfo = TABS.find(t => t.id === activeTab);

  return (
    <div className="relative min-h-screen bg-hero">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      <div className="relative">
      <AdminHeader username={currentUser.username} profilePhoto={getProfilePhoto()} onLogout={handleLogout} onProfileClick={goToAccount} />

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className={`fixed right-4 top-20 z-50 rounded-xl border px-4 py-3 text-sm font-medium shadow-elevated ${
            toast.type === "success"
              ? "border-success/30 bg-success/10 text-success"
              : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
          </div>
          <h1 className="mt-1 text-2xl font-display font-bold sm:text-3xl">Manage your store</h1>
        </div>

        {/* Tabs — desktop row */}
        <div className="mb-6 hidden flex-wrap gap-2 border-b border-border md:flex">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => selectTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tabs — mobile hamburger */}
        <div className="relative mb-6 md:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen(open => !open)}
            className="inline-flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold"
          >
            <span className="inline-flex items-center gap-2">
              {activeTabInfo?.icon} {activeTabInfo?.label}
            </span>
            {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>

          {mobileNavOpen && (
            <div className="absolute left-0 right-0 top-full z-30 mt-2 grid gap-1 rounded-xl border border-border bg-card p-2 shadow-elevated">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => selectTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                    activeTab === tab.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        {activeTab === "overview" && <OverviewPanel />}
        {activeTab === "products" && <ProductManager onChange={refresh} notify={notify} />}
        {activeTab === "orders" && <OrdersPanel />}
        {activeTab === "promotions" && <PromotionsPanel onChange={refresh} notify={notify} />}
        {activeTab === "urm" && <SubAdminPanel onChange={refresh} notify={notify} />}
        {activeTab === "payments" && <PaymentsPanel />}
        {activeTab === "settings" && <StoreSettings onChange={refresh} notify={notify} initialInnerTab={settingsInnerTab} />}
      </div>
      </div>
    </div>
  );
}
