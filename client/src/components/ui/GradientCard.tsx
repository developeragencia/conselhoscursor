/**
 * 🎨 Gradient Card Component
 * Card moderno com gradiente e efeitos visuais
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GradientCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'mystic' | 'cosmic' | 'glass';
  hover?: boolean;
  glow?: boolean;
}

export default function GradientCard({
  children,
  className,
  variant = 'primary',
  hover = true,
  glow = false
}: GradientCardProps) {
  const variants = {
    primary: 'bg-gradient-to-br from-purple-600 to-purple-400',
    secondary: 'bg-gradient-to-br from-blue-600 to-purple-500',
    mystic: 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500',
    cosmic: 'bg-gradient-to-br from-indigo-700 to-blue-500',
    glass: 'bg-white/10 backdrop-blur-xl border border-white/20'
  };

  return (
    <div
      className={cn(
        'rounded-2xl p-6 transition-all duration-300',
        variants[variant],
        hover && 'hover:scale-105 hover:shadow-2xl cursor-pointer',
        glow && 'shadow-[0_0_40px_rgba(168,85,247,0.4)]',
        className
      )}
    >
      {children}
    </div>
  );
}

