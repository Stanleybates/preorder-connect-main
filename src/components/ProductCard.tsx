import { Clock, Zap } from "lucide-react";
import { formatPrice, whatsappLink, type Product } from "@/lib/store-data";
import { OrderDialog } from "@/components/OrderDialog";
import { SmartImage } from "@/components/SmartImage";

export function ProductCard({ product }: { product: Product }) {
  const isInStock = product.status === "in-stock";
  const accentBg = isInStock ? "group-hover:bg-primary" : "group-hover:bg-warning";
  const labelHover = isInStock ? "group-hover:text-primary-foreground/70" : "group-hover:text-white/80";
  const priceHover = isInStock ? "group-hover:text-primary-foreground" : "group-hover:text-white";

  return (
    <div className="group h-full bg-card rounded-3xl overflow-hidden border border-border/70 shadow-[0_4px_20px_-8px_rgb(0_0_0_/_0.08)] hover:shadow-[0_24px_60px_-20px_oklch(0.55_0.25_295_/_0.25)] hover:border-primary/30 hover:-translate-y-1.5 transition-all duration-500 flex flex-col">
      {/* Image */}
      <div className="shine relative aspect-[4/3] overflow-hidden bg-muted">
        <SmartImage
          src={product.image}
          alt={product.name}
          emoji={product.emoji}
          hue={product.hue}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span
            className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm ${
              isInStock ? "bg-success text-white" : "bg-warning text-white"
            }`}
          >
            {isInStock ? "● In Stock" : "◐ Pre-Order"}
          </span>
          {product.tag && (
            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground shadow-sm inline-flex items-center gap-1 w-fit">
              <Zap className="w-2.5 h-2.5" /> {product.tag}
            </span>
          )}
        </div>
      </div>

      {/* info */}
      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex-1">
          <h3 className="font-display font-bold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {!isInStock && product.eta && (
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-warning mt-2 uppercase tracking-wide">
              <Clock className="w-3 h-3" />
              {product.eta}
            </div>
          )}
        </div>

        <OrderDialog product={product}>
          <button
            type="button"
            className={`block w-full rounded-2xl border border-border bg-muted/50 ${accentBg} group-hover:border-transparent transition-all duration-300 text-left`}
          >
            <div className="px-4 py-3 flex items-center justify-between">
              <div>
                <div className={`text-[9px] font-bold uppercase tracking-widest text-muted-foreground transition-colors ${labelHover}`}>
                  Tap to order
                </div>
                <div className={`text-xl font-display font-bold text-foreground transition-colors ${priceHover}`}>
                  {formatPrice(product.price)}
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-card shadow-sm flex items-center justify-center text-success">
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884Z"/>
                </svg>
              </div>
            </div>
          </button>
        </OrderDialog>
      </div>
    </div>
  );
}
