'use client';

import { Download, PieChart as PieChartIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useFilter } from '@/contexts/FilterContext';
import DateFilter from '@/components/DateFilter';

export default function Fechamento() {
  const [loading, setLoading] = useState(true);
  const [totalEntradas, setTotalEntradas] = useState(0);
  const [saldoNeto, setSaldoNeto] = useState(0);
  const [saldoGabriel, setSaldoGabriel] = useState(0);
  const [saldoManu, setSaldoManu] = useState(0);
  const [caixaBruto, setCaixaBruto] = useState(0);
  
  const [gastos, setGastos] = useState<any[]>([]);
  const [totalGastos, setTotalGastos] = useState(0);

  const { startDate, endDate } = useFilter();

  const fetchData = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);

    try {
      const { data: recData } = await supabase
        .from('receitas')
        .select('*')
        .gte('data', startDate)
        .lte('data', endDate);

      const { data: gasData } = await supabase
        .from('gastos')
        .select('*')
        .gte('data', startDate)
        .lte('data', endDate);

      let sumEntradas = 0;
      let sumNeto = 0;
      let sumGabriel = 0;
      let sumManu = 0;
      let sumCaixa = 0;

      if (recData) {
        recData.forEach(r => {
          sumEntradas += r.valor || 0;
          sumNeto += r.neto_valor || 0;
          sumGabriel += r.gabriel_valor || 0;
          sumManu += r.manu_valor || 0;
          sumCaixa += r.empresa_valor || 0;
        });
      }

      let sumGastos = 0;
      if (gasData) {
        gasData.forEach(g => {
          sumGastos += g.valor || 0;
        });
        setGastos(gasData);
      }

      setTotalEntradas(sumEntradas);
      setSaldoNeto(sumNeto);
      setSaldoGabriel(sumGabriel);
      setSaldoManu(sumManu);
      setCaixaBruto(sumCaixa);
      setTotalGastos(sumGastos);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    window.addEventListener('focus', fetchData);
    return () => window.removeEventListener('focus', fetchData);
  }, [startDate, endDate]);

  const saldoFinalEmpresa = caixaBruto - totalGastos;

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Fechamento Geral</h1>
          <p className="text-brand-muted mt-1">Resumo completo das finanças no período selecionado.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <DateFilter />
          <button className="w-full sm:w-auto bg-brand-bg border border-brand-border hover:bg-brand-card-hover text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
            <Download size={18} />
            Exportar PDF
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <PieChartIcon className="text-brand-primary" />
            Resumo do Mês
          </h3>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center p-4 bg-brand-bg rounded-lg border border-brand-border">
              <span className="text-brand-muted">Total Recebido (100%)</span>
              <span className="text-xl font-bold text-white">R$ {totalEntradas.toFixed(2).replace('.', ',')}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-brand-bg rounded-lg border border-brand-border">
                <span className="text-brand-muted block text-sm mb-1">Parte Neto (30%)</span>
                <span className="text-lg font-bold text-white">R$ {saldoNeto.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="p-4 bg-brand-bg rounded-lg border border-brand-border">
                <span className="text-brand-muted block text-sm mb-1">Parte Gabriel (30%)</span>
                <span className="text-lg font-bold text-white">R$ {saldoGabriel.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="p-4 bg-brand-bg rounded-lg border border-brand-border">
                <span className="text-brand-muted block text-sm mb-1">Parte Manu (30%)</span>
                <span className="text-lg font-bold text-white">R$ {saldoManu.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="p-4 bg-brand-primary-dim rounded-lg border border-brand-primary/20">
                <span className="text-brand-primary block text-sm mb-1 font-medium">Caixa Empresa Bruto (10%)</span>
                <span className="text-lg font-bold text-brand-primary">R$ {caixaBruto.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Gastos Operacionais</h3>
            <div className="space-y-4">
              {gastos.length === 0 && <span className="text-brand-muted">Nenhum gasto registrado.</span>}
              {gastos.map((g, i) => (
                <div key={i} className="flex justify-between items-center border-b border-brand-border pb-2">
                  <span className="text-brand-muted">{g.descricao}</span>
                  <span className="text-white">R$ {g.valor?.toFixed(2).replace('.', ',')}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 pt-4 border-t border-brand-border">
            <span className="text-brand-muted block mb-1">Total de Gastos</span>
            <span className="text-2xl font-bold text-brand-danger">- R$ {totalGastos.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 bg-gradient-to-br from-brand-card to-brand-bg border-brand-primary/30 glow-primary">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 text-center sm:text-left">
          <div>
            <h3 className="text-lg font-medium text-brand-muted">Saldo Final da Empresa</h3>
            <p className="text-sm text-brand-muted mt-1">(Caixa 10% - Gastos Operacionais)</p>
          </div>
          <div className="sm:text-right">
            <span className={`text-4xl sm:text-5xl font-extrabold tracking-tight ${saldoFinalEmpresa < 0 ? 'text-brand-danger' : 'text-gradient'}`}>
              R$ {saldoFinalEmpresa.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
