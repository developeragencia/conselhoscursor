/**
 * 🎈 Floating Card Component
 * Card flutuante com animação e efeitos 3D
 */

import { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

interface FloatingCardProps {
  children: ReactNode;
  className?: string;
  tiltEffect?: boolean;
}

export default function FloatingCard({
  children,
  className,
  tiltEffect = true
}: FloatingCardProps) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tiltEffect) return;

    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  return (
    <div
      className={cn(
        'relative rounded-2xl bg-white dark:bg-gray-800',
        'shadow-xl hover:shadow-2xl',
        'transition-all duration-300',
        'transform hover:-translate-y-2',
        className
      )}
      style={{
        transform: tiltEffect
          ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
          : undefined,
        transition: 'transform 0.2s ease-out'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Borda gradiente animada */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10" />
      
      {children}
    </div>
  );
}

