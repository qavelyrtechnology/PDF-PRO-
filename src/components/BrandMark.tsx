import React from 'react';

interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-9 h-9',
  lg: 'w-14 h-14',
};

export const BrandMark: React.FC<BrandMarkProps> = ({ size = 'md', className = '' }) => {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={`${sizeClasses[size]} shrink-0 ${className}`}
    >
      <defs>
        <linearGradient id="fps-brand-bg" x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
        <linearGradient id="fps-crimson" x1="18" y1="12" x2="48" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#BE123C" />
        </linearGradient>
      </defs>

      {/* Architectural Dark Slate Frame */}
      <rect width="64" height="64" rx="16" fill="url(#fps-brand-bg)" />
      <rect
        x="1"
        y="1"
        width="62"
        height="62"
        rx="15"
        stroke="#FFFFFF"
        strokeOpacity="0.1"
        strokeWidth="1.5"
      />

      {/* Crimson Accent Backing Sheet (Offset Architectural Layer) */}
      <rect x="20" y="15" width="28" height="36" rx="4.5" fill="url(#fps-crimson)" />

      {/* Crisp White Primary Document with Folded Corner */}
      <path
        d="M16 14C16 12.3431 17.3431 11 19 11H34L44 21V46C44 47.6569 42.6569 49 41 49H19C17.3431 49 16 47.6569 16 46V14Z"
        fill="#FFFFFF"
      />

      {/* Precision Folded Corner */}
      <path d="M34 11V19C34 20.1046 34.8954 21 36 21H44L34 11Z" fill="#FECDD3" />

      {/* Precision Typographic Bars & Crimson Studio Seal */}
      <rect x="21" y="26" width="16" height="3.2" rx="1.6" fill="#0F172A" />
      <rect x="21" y="32.5" width="12" height="2.6" rx="1.3" fill="#94A3B8" />
      <rect x="21" y="38.5" width="18" height="4.2" rx="2.1" fill="#E11D48" />
    </svg>
  );
};
