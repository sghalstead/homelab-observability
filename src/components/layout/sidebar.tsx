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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-muted/40">
      <nav className="flex flex-col gap-2 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
