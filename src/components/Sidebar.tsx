'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, MinusCircle, History, CalendarCheck, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Registrar Entrada', href: '/registrar-entrada', icon: PlusCircle },
  { name: 'Registrar Gasto', href: '/registrar-gasto', icon: MinusCircle },
  { name: 'Histórico', href: '/historico', icon: History },
  { name: 'Fechamento', href: '/fechamento', icon: CalendarCheck },
];

export default function Sidebar() {
  const pathname = usePathname();

  if (pathname === '/login') return null;

  return (
    <aside className="w-64 bg-brand-card border-r border-brand-border h-screen sticky top-0 flex flex-col hidden md:flex">
      <div className="p-6 border-b border-brand-border">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          Amitai<span className="text-brand-primary">Finance</span>
        </h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-brand-primary-dim text-brand-primary font-medium' 
                  : 'text-brand-muted hover:text-white hover:bg-brand-card-hover'
              }`}
            >
              <item.icon size={20} className={isActive ? 'text-brand-primary' : 'text-brand-muted'} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-brand-border">
        <button 
          onClick={async () => await supabase.auth.signOut()}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-brand-danger hover:bg-brand-danger-dim rounded-xl transition-colors"
        >
          <LogOut size={20} />
          Sair
        </button>
      </div>
    </aside>
  );
}
