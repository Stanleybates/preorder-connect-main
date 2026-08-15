import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutGrid } from "lucide-react";
import { useCategories } from "@/lib/catalog-api";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [{ title: "Categories" }],
  }),
  component: Categories,
});

function Categories() {
  const { data: categories, isLoading } = useCategories();

  return (
    <div className="min-h-screen bg-background pb-24">
      <SiteHeader />
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8 flex flex-col gap-3">
          <div className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow w-fit">
            <LayoutGrid className="w-4 h-4" /> Categories
          </div>
          <h1 className="text-4xl font-display font-bold">Shop by category</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {(categories ?? []).map((c) => (
              <Link
                key={c.id}
                to="/"
                search={{ category: c.id }}
                hash="in-stock"
                className="rounded-3xl border border-border bg-card p-6 text-center hover:border-primary/40 hover:-translate-y-0.5 transition-all shadow-elevated"
              >
                <div className="text-4xl mb-2">{c.emoji}</div>
                <div className="font-semibold">{c.name}</div>
                {c.desc && <div className="text-xs text-muted-foreground mt-1">{c.desc}</div>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
