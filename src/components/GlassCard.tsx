import { HTMLAttributes, MouseEvent, ReactNode } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  as?: 'div' | 'section' | 'article';
  spot?: boolean;
}

export function GlassCard({
  children,
  className = '',
  as: Tag = 'section',
  spot = true,
  onMouseMove,
  ...rest
}: GlassCardProps) {
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (spot) {
      const rect = e.currentTarget.getBoundingClientRect();
      e.currentTarget.style.setProperty('--gx', `${e.clientX - rect.left}px`);
      e.currentTarget.style.setProperty('--gy', `${e.clientY - rect.top}px`);
    }
    onMouseMove?.(e);
  };

  return (
    <Tag
      onMouseMove={handleMouseMove}
      className={`glass ${spot ? 'glass-spot' : ''} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
