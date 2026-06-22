import { useState } from "react";

export function SmartImage({
  src,
  alt,
  emoji,
  hue = 270,
  className = "",
}: {
  src: string;
  alt: string;
  emoji: string;
  hue?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{
          background: `radial-gradient(circle at 30% 30%, oklch(0.9 0.12 ${hue}), oklch(0.75 0.18 ${hue}) 70%)`,
        }}
      >
        <span
          className="text-7xl"
          style={{ filter: `drop-shadow(0 10px 20px oklch(0.4 0.2 ${hue} / 0.4))` }}
        >
          {emoji}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
