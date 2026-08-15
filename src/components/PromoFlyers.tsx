import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { X, Megaphone, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { getPublicFlyers, type Promotion } from "@/lib/promotions-api";
import { isCustomerAuthenticated } from "@/lib/customer-auth-store";

const SESSION_KEY = "promo_popup_dismissed";

export function PromoFlyers() {
  const navigate = useNavigate();
  const [flyers, setFlyers] = useState<Promotion[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getPublicFlyers().then((data) => {
      const loggedIn = isCustomerAuthenticated();
      const relevant = data.filter((promo) => {
        if (promo.audience === "guests") return !loggedIn;
        if (promo.audience === "customers") return loggedIn;
        return true;
      });
      if (relevant.length === 0) return;
      setFlyers(relevant);

      const dismissed = sessionStorage.getItem(SESSION_KEY);
      if (dismissed) {
        setShowBanner(true);
      } else {
        setShowPopup(true);
      }
    });
  }, []);

  // Auto-scroll the popup carousel
  useEffect(() => {
    if (!showPopup || flyers.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((i) => {
        const next = (i + 1) % flyers.length;
        scrollRef.current?.scrollTo({ left: next * scrollRef.current.clientWidth, behavior: "smooth" });
        return next;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [showPopup, flyers.length]);

  const dismissPopup = () => {
    setShowPopup(false);
    setShowBanner(true);
    sessionStorage.setItem(SESSION_KEY, "1");
  };

  const dismissBanner = () => {
    setShowBanner(false);
  };

  const onFlyerClick = (promo: Promotion) => {
    if (promo.flyer_status !== "ongoing") return;

    setShowPopup(false);

    if (promo.link_type === "category" && promo.category) {
      navigate({ to: "/", hash: "in-stock" });
      // Category filtering on the homepage is click-driven via CategoryPill state,
      // so we land on the section; a query param based deep-filter can be added
      // later if needed.
    } else {
      navigate({ to: "/", hash: "in-stock" });
    }
  };

  if (flyers.length === 0) return null;

  return (
    <>
      {showPopup && (
        <div className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center px-4">
          <div className="relative w-full max-w-md">
            <button
              onClick={dismissPopup}
              aria-label="Close"
              className="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-900" />
            </button>

            <div
              ref={scrollRef}
              className="flex overflow-x-auto snap-x snap-mandatory rounded-3xl scrollbar-none"
              style={{ scrollbarWidth: "none" }}
              onScroll={(e) => {
                const el = e.currentTarget;
                const idx = Math.round(el.scrollLeft / el.clientWidth);
                setActiveIndex(idx);
              }}
            >
              {flyers.map((promo) => (
                <button
                  key={promo.id}
                  type="button"
                  onClick={() => onFlyerClick(promo)}
                  className="w-full shrink-0 snap-center relative aspect-[3/4] bg-gray-900 text-left"
                  disabled={promo.flyer_status !== "ongoing"}
                >
                  {promo.flyer_image && (
                    <img src={promo.flyer_image} alt={promo.title} className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    {promo.flyer_status === "upcoming" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gray-900 mb-2">
                        <Clock className="w-3 h-3" /> Coming soon
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-white mb-2">
                        <Megaphone className="w-3 h-3" /> {promo.discount_percent}% off
                      </span>
                    )}
                    <h3 className="text-white text-xl font-display font-bold leading-snug">{promo.title}</h3>
                    {promo.flyer_status === "ongoing" && (
                      <p className="text-white/80 text-sm mt-1">Tap to shop this promo</p>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {flyers.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-4">
                {flyers.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === activeIndex ? "w-6 bg-white" : "w-1.5 bg-white/40"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showBanner && !showPopup && (
        <div className="sticky top-16 z-40 bg-gradient-to-r from-primary to-accent text-white">
          <button
            type="button"
            onClick={() => onFlyerClick(flyers[0])}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold text-left"
          >
            <Megaphone className="w-4 h-4 shrink-0" />
            <span className="truncate flex-1">
              {flyers[0].title}
              {flyers[0].flyer_status === "ongoing" ? ` — ${flyers[0].discount_percent}% off` : " — Coming soon"}
            </span>
            {flyers.length > 1 && (
              <span className="text-xs bg-white/20 rounded-full px-2 py-0.5 shrink-0">+{flyers.length - 1} more</span>
            )}
          </button>
          <button
            onClick={dismissBanner}
            aria-label="Close banner"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </>
  );
}
