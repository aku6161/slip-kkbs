import React from 'react';
import logoNavbar from '../logo-navbar.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '', showSubtitle = true }) => {
  const heightPx = size === 'sm' ? 48 : size === 'lg' ? 96 : 64;
  
  return (
    <div className={`inline-flex flex-col items-center justify-center select-none ${className}`}>
      <img 
        src={logoNavbar} 
        alt="Logo SLIP" 
        style={{ height: `${heightPx}px` }} 
        className="w-auto object-contain"
      />
    </div>
  );
};
