import { useEffect } from "react";
import confetti from "canvas-confetti";

const COLORS = ["#7C3AED", "#EC4899", "#F59E0B", "#10B981", "#3B82F6", "#EF4444"];

/**
 * Fires a one-shot confetti burst on mount using canvas-confetti.
 * Tuned for mobile: smaller particle count and tighter spread than desktop
 * defaults, since most traffic here is on phones with smaller viewports.
 */
export function ConfettiBurst() {
  useEffect(() => {
    const isMobile = window.innerWidth < 640;

    const fire = (opts: confetti.Options) => {
      confetti({
        colors: COLORS,
        disableForReducedMotion: true,
        ...opts,
      });
    };

    if (isMobile) {
      // Two smaller side bursts read better on narrow screens than one big
      // center burst, which tends to overflow off-screen on phones.
      fire({
        particleCount: 40,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.3 },
        scalar: 0.9,
      });
      fire({
        particleCount: 40,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.3 },
        scalar: 0.9,
      });
    } else {
      fire({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.3 },
      });
    }
  }, []);

  return null;
}
