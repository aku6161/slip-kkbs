import React from 'react';
import logoNavbar from '../logo-navbar.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '', showSubtitle = true }) => {
  const heightPx = size === 'sm' ? 40 : size === 'lg' ? 64 : 48;
  
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <img 
        src={logoNavbar} 
        alt="Logo SLIP" 
        style={{ height: `${heightPx}px`, width: `${heightPx}px` }} 
        className="object-contain rounded-xl shadow-xs shrink-0"
      />
      {showSubtitle && (
        <div className="flex flex-col text-left leading-tight">
          <span className="text-xs sm:text-sm font-black tracking-tight text-slate-900 uppercase font-sans">
            Sistem Latihan Industri Pelajar
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 tracking-wide uppercase font-sans">
            Kolej Komuniti Beaufort
          </span>
        </div>
      )}
    </div>
  );
};
