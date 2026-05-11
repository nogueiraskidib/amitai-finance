'use client';

import { useFilter } from '@/contexts/FilterContext';
import { Calendar, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function DateFilter() {
  const { filterType, setFilterType, startDate, endDate, setCustomDate } = useFilter();
  const [isOpen, setIsOpen] = useState(false);
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempStart(startDate);
    setTempEnd(endDate);
  }, [startDate, endDate]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApplyCustom = () => {
    if (tempStart && tempEnd) {
      setCustomDate(tempStart, tempEnd);
      setIsOpen(false);
    }
  };

  const getLabel = () => {
    switch (filterType) {
      case 'mes_atual': return 'Mês atual';
      case 'mes_anterior': return 'Mês anterior';
      case 'ultimos_3_meses': return 'Últimos 3 meses';
      case 'personalizado': 
        return `${new Date(startDate).toLocaleDateString('pt-BR')} até ${new Date(endDate).toLocaleDateString('pt-BR')}`;
    }
  };

  return (
    <div className="relative z-30" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-brand-card hover:bg-brand-card-hover border border-brand-border px-4 py-2 rounded-lg text-sm text-brand-text transition-colors"
      >
        <Calendar size={16} className="text-brand-primary" />
        <span className="font-medium">{getLabel()}</span>
        <ChevronDown size={16} className={`text-brand-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Mobile Overlay */}
          <div className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setIsOpen(false)} />
          
          <div className="fixed md:absolute bottom-28 left-4 right-4 md:bottom-auto md:left-auto md:right-0 md:top-full mt-2 z-[60] md:z-50 w-auto md:w-72 bg-brand-card border border-brand-border rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-10 md:slide-in-from-top-2 duration-300">
          <div className="p-2 flex flex-col gap-1">
            <button 
              onClick={() => { setFilterType('mes_atual'); setIsOpen(false); }}
              className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${filterType === 'mes_atual' ? 'bg-brand-primary-dim text-brand-primary font-medium' : 'text-brand-text hover:bg-brand-card-hover'}`}
            >
              Mês atual
            </button>
            <button 
              onClick={() => { setFilterType('mes_anterior'); setIsOpen(false); }}
              className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${filterType === 'mes_anterior' ? 'bg-brand-primary-dim text-brand-primary font-medium' : 'text-brand-text hover:bg-brand-card-hover'}`}
            >
              Mês anterior
            </button>
            <button 
              onClick={() => { setFilterType('ultimos_3_meses'); setIsOpen(false); }}
              className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${filterType === 'ultimos_3_meses' ? 'bg-brand-primary-dim text-brand-primary font-medium' : 'text-brand-text hover:bg-brand-card-hover'}`}
            >
              Últimos 3 meses
            </button>
          </div>

          <div className="border-t border-brand-border p-3">
            <p className="text-xs text-brand-muted mb-2 font-medium">PERÍODO PERSONALIZADO</p>
            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <input 
                  type="date" 
                  value={tempStart}
                  onChange={(e) => setTempStart(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border rounded p-1.5 text-xs text-white outline-none focus:border-brand-primary"
                />
              </div>
              <div className="flex-1">
                <input 
                  type="date" 
                  value={tempEnd}
                  onChange={(e) => setTempEnd(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border rounded p-1.5 text-xs text-white outline-none focus:border-brand-primary"
                />
              </div>
            </div>
            <button 
              onClick={handleApplyCustom}
              className="w-full bg-brand-primary text-brand-bg font-bold py-1.5 rounded text-sm hover:bg-brand-primary-hover transition-colors"
            >
              Aplicar Filtro
            </button>
          </div>
          </div>
        </>
      )}
    </div>
  );
}
