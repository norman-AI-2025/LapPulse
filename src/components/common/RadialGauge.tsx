import React from 'react';

export interface RadialGaugeProps {
  value: number; // 0 to 100
  size?: number; // Outer diameter in px (default 80)
  strokeWidth?: number; // Thickness of ring (default 10)
  color?: string; // Color of the active ring stroke (default: '#0284c7')
  trackColor?: string; // Color of the background ring (default: '#F1F5F9')
  label?: string; // Optional venue or hardware name
  sublabel?: string; // Optional capacity or metric text
  badgeText?: string; // Optional badge pill text
  badgeClass?: string; // Optional badge pill styling
  className?: string;
  onClick?: () => void;
}

export const RadialGauge: React.FC<RadialGaugeProps> = ({
  value,
  size = 80,
  strokeWidth = 10,
  color = '#0284c7',
  trackColor = '#F1F5F9',
  label,
  sublabel,
  badgeText,
  badgeClass = 'bg-blue-50 text-blue-800 border-blue-200',
  className = '',
  onClick
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Offset calculated so the arc fills clockwise starting from the 12 o'clock position
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  return (
    <div
      onClick={onClick}
      className={`flex flex-col items-center justify-center ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      {/* Circular Gauge Ring Container */}
      <div
        className="relative inline-flex items-center justify-center flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Subtle Background Track Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />

          {/* Active Radial Arc (Flat ends matching uploaded reference) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="butt"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
          <span className="font-bold font-mono text-slate-900 tracking-tight text-sm sm:text-base leading-none">
            {Math.round(clampedValue)}%
          </span>
        </div>
      </div>

      {/* Optional Metadata Labels */}
      {label && (
        <span className="mt-2 text-xs font-bold text-slate-900 text-center truncate max-w-full">
          {label}
        </span>
      )}
      {sublabel && (
        <span className="text-[10px] text-slate-400 font-medium text-center truncate max-w-full mt-0.5">
          {sublabel}
        </span>
      )}
      {badgeText && (
        <span
          className={`mt-2 text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${badgeClass}`}
        >
          {badgeText}
        </span>
      )}
    </div>
  );
};

