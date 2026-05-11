'use client';

import { DollarSign, TrendingUp, TrendingDown, Users, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useFilter } from '@/contexts/FilterContext';
import DateFilter from '@/components/DateFilter';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [totalEntradas, setTotalEntradas] = useState(0);
  const [totalGastos, setTotalGastos] = useState(0);
  const [lucroLiquido, setLucroLiquido] = useState(0);
  const [caixaEmpresa, setCaixaEmpresa] = useState(0);

  const [saldoNeto, setSaldoNeto] = useState(0);
  const [saldoGabriel, setSaldoGabriel] = useState(0);
  const [saldoManu, setSaldoManu] = useState(0);

  const { startDate, endDate } = useFilter();

  useEffect(() => {
    async function fetchData() {
      if (!startDate || !endDate) return;

      setLoading(true);
      try {
        const { data: receitas, error: errReceitas } = await supabase
          .from('receitas')
          .select('*')
          .gte('data', startDate)
          .lte('data', endDate);

        const { data: gastos, error: errGastos } = await supabase
          .from('gastos')
          .select('*')
          .gte('data', startDate)
          .lte('data', endDate);

        let sumEntradas = 0;
        let sumGastos = 0;
        let sumNeto = 0;
        let sumGabriel = 0;
        let sumManu = 0;
        let sumCaixa = 0;

        if (receitas) {
          receitas.forEach(r => {
            sumEntradas += r.valor || 0;
            sumNeto += r.neto_valor || 0;
            sumGabriel += r.gabriel_valor || 0;
            sumManu += r.manu_valor || 0;
            sumCaixa += r.empresa_valor || 0;
          });
        }

        if (gastos) {
          gastos.forEach(g => {
            sumGastos += g.valor || 0;
          });
        }

        setTotalEntradas(sumEntradas);
        setTotalGastos(sumGastos);
        setLucroLiquido(sumEntradas - sumGastos);
        setCaixaEmpresa(sumCaixa - sumGastos);

        setSaldoNeto(sumNeto);
        setSaldoGabriel(sumGabriel);
        setSaldoManu(sumManu);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    window.addEventListener('focus', fetchData);
    return () => window.removeEventListener('focus', fetchData);
  }, [startDate, endDate]);

  const partners = [
    { name: 'Neto', balance: `R$ ${saldoNeto.toFixed(2).replace('.', ',')}`, percentage: '30%', color: 'from-blue-500 to-indigo-600' },
    { name: 'Gabriel', balance: `R$ ${saldoGabriel.toFixed(2).replace('.', ',')}`, percentage: '30%', color: 'from-emerald-500 to-teal-600' },
    { name: 'Manu', balance: `R$ ${saldoManu.toFixed(2).replace('.', ',')}`, percentage: '30%', color: 'from-purple-500 to-fuchsia-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard Principal</h1>
          <p className="text-brand-muted mt-1">Bem-vindo ao Amitai Finance, acompanhe seus números.</p>
        </div>
        <DateFilter />
      </header>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 border-l-4 border-l-brand-primary">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-brand-muted text-sm font-medium">Caixa da Empresa (10% - Gastos)</p>
              <h3 className="text-3xl font-bold text-white mt-2">
                {loading ? '...' : `R$ ${caixaEmpresa.toFixed(2).replace('.', ',')}`}
              </h3>
            </div>
            <div className="p-3 bg-brand-primary-dim rounded-lg">
              <Wallet className="text-brand-primary" size={24} />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-brand-muted text-sm font-medium">Total Recebido</p>
              <h3 className="text-2xl font-bold text-white mt-2">
                {loading ? '...' : `R$ ${totalEntradas.toFixed(2).replace('.', ',')}`}
              </h3>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <TrendingUp className="text-blue-500" size={24} />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-brand-muted text-sm font-medium">Gastos</p>
              <h3 className="text-2xl font-bold text-white mt-2">
                {loading ? '...' : `R$ ${totalGastos.toFixed(2).replace('.', ',')}`}
              </h3>
            </div>
            <div className="p-3 bg-brand-danger-dim rounded-lg">
              <TrendingDown className="text-brand-danger" size={24} />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-brand-muted text-sm font-medium">Lucro Líquido</p>
              <h3 className="text-2xl font-bold text-white mt-2">
                {loading ? '...' : `R$ ${lucroLiquido.toFixed(2).replace('.', ',')}`}
              </h3>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg">
              <DollarSign className="text-emerald-500" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Partners Balances */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {partners.map((partner) => (
          <div key={partner.name} className="glass-card p-6 relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${partner.color} opacity-10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110`} />
            <div className="relative z-10 flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white">{partner.name}</h4>
              <span className="text-xs font-medium px-2 py-1 bg-brand-bg rounded-full border border-brand-border text-brand-muted">
                {partner.percentage}
              </span>
            </div>
            <div className="relative z-10">
              <p className="text-brand-muted text-sm mb-1">Saldo Atual</p>
              <p className="text-3xl font-bold text-white">
                {loading ? '...' : partner.balance}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
