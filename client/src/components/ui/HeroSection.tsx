/**
 * 🦸 Hero Section Component
 * Seção hero moderna com animações e gradientes
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  title: string | ReactNode;
  subtitle?: string | ReactNode;
  description?: string | ReactNode;
  actions?: ReactNode;
  background?: 'gradient' | 'mystic' | 'cosmic' | 'dark';
  className?: string;
}

export default function HeroSection({
  title,
  subtitle,
  description,
  actions,
  background = 'gradient',
  className
}: HeroSectionProps) {
  const backgrounds = {
    gradient: 'bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500',
    mystic: 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500',
    cosmic: 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900',
    dark: 'bg-gray-900'
  };

  return (
    <section className={cn('relative overflow-hidden', backgrounds[background], className)}>
      {/* Partículas flutuantes de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Subtitle */}
          {subtitle && (
            <div className="mb-6 animate-fade-in-up">
              <span className="inline-block px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium">
                {subtitle}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {title}
          </h1>

          {/* Description */}
          {description && (
            <p className="text-xl sm:text-2xl text-white/90 mb-10 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {description}
            </p>
          )}

          {/* Actions */}
          {actions && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              {actions}
            </div>
          )}
        </div>
      </div>

      {/* Wave decoration */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="currentColor"
            className="text-gray-50 dark:text-gray-900"
          />
        </svg>
      </div>
    </section>
  );
}

