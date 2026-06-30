'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, PlusCircle, MinusCircle, History, 
  CalendarCheck, LogOut, Workflow, Layers, Users, ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, color: 'text-brand-primary' },
  { name: 'Funil de Vendas', href: '/funil', icon: Layers, color: 'text-brand-accent-blue' },
  { name: 'Clientes', href: '/clientes', icon: Users, color: 'text-brand-accent-purple' },
  { name: 'Processos', href: '/processos', icon: Workflow, color: 'text-brand-accent-amber' },
  { name: 'Fechamento', href: '/fechamento', icon: CalendarCheck, color: 'text-emerald-400' },
  { name: 'HistÃ³rico', href: '/historico', icon: History, color: 'text-brand-muted' },
  { name: 'Registrar Entrada', href: '/registrar-entrada', icon: PlusCircle, color: 'text-green-400' },
  { name: 'Registrar Gasto', href: '/registrar-gasto', icon: MinusCircle, color: 'text-brand-danger' },
];

export default function Sidebar() {
  const pathname = usePathname();

  if (pathname === '/login') return null;

  return (
    <aside className="w-64 h-screen sticky top-0 flex-col hidden md:flex overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #07101f 0%, #040c1c 100%)',
        borderRight: '1px solid rgba(21, 32, 53, 0.9)',
        boxShadow: '4px 0 30px rgba(0,0,0,0.5)'
      }}
    >
      {/* Logo */}
      <div className="px-6 py-7" style={{ borderBottom: '1px solid rgba(21, 32, 53, 0.8)' }}>
        <div className="flex items-center gap-3">
          {/* Brand Logo */}
          <div
            className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0"
            style={{ border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}
          >
            <img src="/logo.jpeg" alt="Amitai Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold leading-tight" style={{ color: '#e8f0fe' }}>
              Amitai<span className="text-gradient"> Finance</span>
            </h1>
            <p className="text-[10px]" style={{ color: '#4a6080' }}>ERP AgÃªncia</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto custom-scrollbar">
        <p className="text-[10px] font-bold tracking-widest uppercase px-3 mb-3" style={{ color: '#334d6e' }}>
          Menu Principal
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative ${
                isActive ? 'nav-active-glow' : ''
              }`}
              style={
                isActive
                  ? {
                      background: 'rgba(0, 255, 157, 0.07)',
                      border: '1px solid rgba(0, 255, 157, 0.12)',
                    }
                  : {
                      background: 'transparent',
                      border: '1px solid transparent',
                    }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.04)';
                  (e.currentTarget as HTMLAnchorElement).style.border = '1px solid rgba(255,255,255,0.06)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                  (e.currentTarget as HTMLAnchorElement).style.border = '1px solid transparent';
                }
              }}
            >
              <item.icon
                size={17}
                className={isActive ? item.color : 'text-brand-subtle group-hover:text-brand-muted'}
                style={{ transition: 'color 0.2s ease' }}
              />
              <span
                className={`text-[13px] font-${isActive ? '600' : '500'} flex-1 transition-colors duration-200`}
                style={{ color: isActive ? '#e8f0fe' : '#4a6080' }}
              >
                {item.name}
              </span>
              {isActive && (
                <ChevronRight size={13} className="text-brand-primary opacity-70" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-3" style={{ borderTop: '1px solid rgba(21, 32, 53, 0.8)' }}>
        <button
          onClick={async () => await supabase.auth.signOut()}
          className="group flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-xl transition-all duration-200"
          style={{ border: '1px solid transparent', color: '#4a6080' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(244, 63, 94, 0.06)';
            (e.currentTarget as HTMLButtonElement).style.border = '1px solid rgba(244, 63, 94, 0.12)';
            (e.currentTarget as HTMLButtonElement).style.color = '#f43f5e';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.border = '1px solid transparent';
            (e.currentTarget as HTMLButtonElement).style.color = '#4a6080';
          }}
        >
          <LogOut size={17} />
          <span className="text-[13px] font-500">Sair</span>
        </button>
      </div>
    </aside>
  );
}
