import { Header } from './header';
import { Sidebar } from './sidebar';
import { MobileNav } from './mobile-nav';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
