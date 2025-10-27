/**
 * 📊 Stat Card Component
 * Card de estatísticas com ícone e animação
 */

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'primary' | 'success' | 'warning' | 'error';
  className?: string;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendValue,
  variant = 'primary',
  className
}: StatCardProps) {
  const variants = {
    primary: {
      bg: 'from-purple-500/10 to-purple-600/10',
      icon: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-500/20'
    },
    success: {
      bg: 'from-green-500/10 to-green-600/10',
      icon: 'text-green-600 dark:text-green-400',
      border: 'border-green-500/20'
    },
    warning: {
      bg: 'from-amber-500/10 to-amber-600/10',
      icon: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/20'
    },
    error: {
      bg: 'from-red-500/10 to-red-600/10',
      icon: 'text-red-600 dark:text-red-400',
      border: 'border-red-500/20'
    }
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl p-6',
        'bg-gradient-to-br',
        variants[variant].bg,
        'border',
        variants[variant].border,
        'hover:scale-105 transition-transform duration-300',
        className
      )}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }} />
      </div>

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          </div>
          
          {Icon && (
            <div className={cn(
              'p-3 rounded-lg bg-white/50 dark:bg-gray-800/50',
              variants[variant].icon
            )}>
              <Icon className="w-6 h-6" />
            </div>
          )}
        </div>

        {trend && trendValue && (
          <div className="flex items-center gap-2">
            <span className={cn('text-sm font-medium', trendColors[trend])}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
            </span>
            <span className="text-xs text-gray-500">vs último mês</span>
          </div>
        )}
      </div>
    </div>
  );
}

