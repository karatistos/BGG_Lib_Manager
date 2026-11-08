import React from 'react';
import { WeightBracket } from '../types/bgg';

interface ProceduralCoverProps {
  id: number;
  name: string;
  weightBracket: WeightBracket;
  thumbnailUrl?: string;
  className?: string;
}

export const ProceduralCover: React.FC<ProceduralCoverProps> = ({
  id,
  name,
  weightBracket,
  thumbnailUrl,
  className = '',
}) => {
  const [imgError, setImgError] = React.useState(false);

  // If we have an external thumbnail and it hasn't errored, display it
  if (thumbnailUrl && !imgError) {
    return (
      <div className={`relative overflow-hidden bg-slate-950 flex items-center justify-center ${className}`}>
        {/* Subtle blurred background fill */}
        <div
          className="absolute inset-0 bg-cover bg-center blur-lg opacity-30 scale-125 pointer-events-none"
          style={{ backgroundImage: `url(${thumbnailUrl})` }}
        />
        {/* Clean, uncropped foreground box cover */}
        <img
          src={thumbnailUrl}
          alt={name}
          className="relative z-10 w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105 drop-shadow-lg"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Derive initials (e.g. "7 Wonders" -> "7W", "51st State" -> "51")
  const words = name.replace(/[^\w\s]/g, '').trim().split(/\s+/).filter(Boolean);
  const initials = words.length === 1
    ? words[0].slice(0, 2).toUpperCase()
    : (words[0][0] + words[1][0]).toUpperCase();

  // Color schemes based on complexity
  const gradientMap: Record<WeightBracket, string> = {
    light: 'from-emerald-950 via-teal-900 to-slate-950 text-emerald-400 border-emerald-500/20',
    'medium-light': 'from-sky-950 via-cyan-900 to-slate-950 text-sky-400 border-sky-500/20',
    'medium-heavy': 'from-amber-950 via-orange-900 to-slate-950 text-amber-400 border-amber-500/20',
    heavy: 'from-rose-950 via-red-900 to-slate-950 text-rose-400 border-rose-500/20',
  };

  const gradientClass = gradientMap[weightBracket] || gradientMap['medium-light'];

  // Deterministic angle & shape from game id
  const angle = (id * 47) % 360;

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${gradientClass} border flex items-center justify-center select-none ${className}`}
      style={{
        backgroundImage: `linear-gradient(${angle}deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.4))`,
      }}
    >
      {/* Subtle geometric watermark */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, currentColor 1.5px, transparent 1.5px)`,
          backgroundSize: '16px 16px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center p-2 text-center">
        <span className="font-extrabold text-2xl tracking-tighter opacity-90 font-mono drop-shadow-md">
          {initials}
        </span>
        <span className="text-[10px] text-slate-400 font-medium truncate max-w-[90%] px-1 mt-0.5 opacity-80">
          {name}
        </span>
      </div>
    </div>
  );
};

