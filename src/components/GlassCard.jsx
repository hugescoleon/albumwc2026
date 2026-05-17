import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const GlassCard = ({ children, className, variant = 'default' }) => {
  const variants = {
    default: 'bg-white/5 border-white/10',
    gold: 'bg-gold/10 border-gold/30',
    green: 'bg-green/10 border-green/30',
  };

  return (
    <div className={twMerge(
      'backdrop-blur-lg border shadow-xl rounded-2xl overflow-hidden transition-all duration-300',
      variants[variant],
      className
    )}>
      {children}
    </div>
  );
};
