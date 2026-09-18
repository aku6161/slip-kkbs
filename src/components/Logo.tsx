import React from 'react';
import logoNavbar from '../logo-navbar.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showSubtitle?: boolean;
  darkTheme?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  className = '', 
  showSubtitle = true,
  darkTheme = false
}) => {
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
          <span className={`text-xs sm:text-sm font-black tracking-tight uppercase font-sans ${darkTheme ? 'text-white' : 'text-slate-900'}`}>
            Sistem Latihan Industri Pelajar
          </span>
          <span className={`text-[10px] sm:text-[11px] font-bold tracking-wide uppercase font-sans ${darkTheme ? 'text-slate-300' : 'text-slate-500'}`}>
            Kolej Komuniti Beaufort
          </span>
        </div>
      )}
    </div>
  );
};
