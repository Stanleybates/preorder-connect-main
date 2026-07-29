import { createFileRoute, useNavigate, useLocation, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { isAuthenticated, getCurrentUser, logout } from "@/lib/auth-store";
import { SiteHeader } from "@/components/SiteHeader";
import { AdminStats } from "@/components/admin/AdminStats";
import { ProductManager } from "@/components/admin/ProductManager";
import { AddProductForm } from "@/components/admin/AddProductForm";
import { PaymentsPanel } from "@/components/admin/PaymentsPanel";
import { StoreSettings } from "@/components/admin/StoreSettings";
import { LogOut, KeyRound, LayoutDashboard, Package, PlusCircle, CreditCard, Settings } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: Admin,
});

type Tab = "products" | "add" | "payments" | "settings";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "products", label: "Products", icon: <Package className="h-4 w-4" /> },
  { id: "add", label: "Add Product", icon: <PlusCircle className="h-4 w-4" /> },
  { id: "payments", label: "Payments", icon: <CreditCard className="h-4 w-4" /> },
  { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
];

function Admin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>("products");
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

  if (!isAuthenticated()) {
    return location.pathname === "/admin" ? null : <Outlet />;
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

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
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
            </div>
            <h1 className="mt-1 text-2xl font-display font-bold sm:text-3xl">Manage your store</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Signed in as <span className="font-semibold text-foreground">{currentUser.username}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/admin/reset-password"
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-muted transition-colors"
            >
              <KeyRound className="h-4 w-4" /> Password
            </a>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/20 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <AdminStats />
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-border">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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

        {/* Content */}
        {activeTab === "products" && <ProductManager onChange={refresh} notify={notify} />}
        {activeTab === "add" && <AddProductForm onChange={refresh} notify={notify} />}
        {activeTab === "payments" && <PaymentsPanel />}
        {activeTab === "settings" && <StoreSettings onChange={refresh} notify={notify} />}
      </div>
    </div>
  );
}
