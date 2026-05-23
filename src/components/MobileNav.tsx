'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PlusCircle, MinusCircle, History, CalendarCheck, LogOut, Workflow, Layers, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const navItems = [
  { name: 'Início', href: '/', icon: LayoutDashboard },
  { name: 'Entrada', href: '/registrar-entrada', icon: PlusCircle },
  { name: 'Gasto', href: '/registrar-gasto', icon: MinusCircle },
  { name: 'Histórico', href: '/historico', icon: History },
  { name: 'Fechamento', href: '/fechamento', icon: CalendarCheck },
  { name: 'Processos', href: '/processos', icon: Workflow },
  { name: 'Funil', href: '/funil', icon: Layers },
  { name: 'Clientes', href: '/clientes', icon: Users },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Top Header Mobile */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-brand-card border-b border-brand-border z-40 px-4 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold text-white flex items-center gap-1">
          Amitai<span className="text-gradient">Finance</span>
        </h1>
        <button 
          onClick={async () => await supabase.auth.signOut()}
          className="text-brand-danger bg-brand-danger-dim p-2 rounded-lg hover:bg-red-500/20 transition-colors"
          title="Sair"
        >
          <LogOut size={18} />
        </button>
      </header>

      {/* Bottom Tab Bar Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-brand-card/95 backdrop-blur-md border-t border-brand-border z-40 px-2 pt-2 pb-6 flex justify-around items-center shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-300 ${
                isActive 
                  ? 'text-brand-primary scale-110' 
                  : 'text-brand-muted hover:text-white'
              }`}
            >
              <item.icon size={20} className={isActive ? 'drop-shadow-[0_0_8px_rgba(20,241,149,0.5)]' : ''} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
