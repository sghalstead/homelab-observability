'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Activity, Box, Cpu, Layers, Bot } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Overview', icon: Activity },
  { href: '/system', label: 'System', icon: Cpu },
  { href: '/docker', label: 'Docker', icon: Box },
  { href: '/services', label: 'Services', icon: Layers },
  { href: '/ollama', label: 'Ollama', icon: Bot },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t bg-background">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 p-2 text-xs',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
