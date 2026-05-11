'use client';

import { DollarSign, TrendingUp, TrendingDown, Users, Wallet, ArrowUpRight, ArrowDownRight, BarChart3 } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend,
  Cell
} from 'recharts';
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
  const [chartData, setChartData] = useState<any[]>([]);

  const { startDate, endDate, filterType } = useFilter();

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

        // Processamento para o gráfico
        const dataMap: { [key: string]: { name: string, receitas: number, gastos: number, lucro: number } } = {};

        if (receitas) {
          receitas.forEach(r => {
            sumEntradas += r.valor || 0;
            sumNeto += r.neto_valor || 0;
            sumGabriel += r.gabriel_valor || 0;
            sumManu += r.manu_valor || 0;
            sumCaixa += r.empresa_valor || 0;

            // Agrupamento por data
            const dateKey = r.data; // YYYY-MM-DD
            if (!dataMap[dateKey]) {
              dataMap[dateKey] = { name: new Date(dateKey).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), receitas: 0, gastos: 0, lucro: 0 };
            }
            dataMap[dateKey].receitas += r.valor || 0;
          });
        }

        if (gastos) {
          gastos.forEach(g => {
            sumGastos += g.valor || 0;

            const dateKey = g.data;
            if (!dataMap[dateKey]) {
              dataMap[dateKey] = { name: new Date(dateKey).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), receitas: 0, gastos: 0, lucro: 0 };
            }
            dataMap[dateKey].gastos += g.valor || 0;
          });
        }

        // Converter mapa para array ordenado
        const sortedData = Object.keys(dataMap)
          .sort()
          .map(key => {
            const item = dataMap[key];
            item.lucro = item.receitas - item.gastos;
            return item;
          });

        // Se o período for longo (mais de 35 dias), agrupar por mês em vez de dia para melhor visualização
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 35) {
          const monthlyMap: { [key: string]: any } = {};
          [...(receitas || []), ...(gastos || [])].forEach(item => {
            const date = new Date(item.data);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!monthlyMap[monthKey]) {
              monthlyMap[monthKey] = { 
                name: date.toLocaleDateString('pt-BR', { month: 'long' }), 
                receitas: 0, 
                gastos: 0, 
                lucro: 0 
              };
            }
            if (item.cliente !== undefined) { // É receita (cliente existe)
              monthlyMap[monthKey].receitas += item.valor || 0;
            } else { // É gasto
              monthlyMap[monthKey].gastos += item.valor || 0;
            }
          });
          
          const monthlyData = Object.keys(monthlyMap)
            .sort()
            .map(key => {
              const item = monthlyMap[key];
              item.lucro = item.receitas - item.gastos;
              return item;
            });
          setChartData(monthlyData);
        } else {
          setChartData(sortedData);
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

      {/* Chart Section */}
      <div className="glass-card p-6 min-h-[400px] flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="text-brand-primary" size={20} />
          <h3 className="text-xl font-bold text-white">Análise de Desempenho</h3>
        </div>
        
        <div className="flex-1 w-full min-h-[300px]">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center text-brand-muted">
              Carregando gráfico...
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `R$ ${value}`}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ 
                    backgroundColor: '#111827', 
                    borderColor: '#374151', 
                    borderRadius: '8px',
                    color: '#fff' 
                  }}
                  itemStyle={{ fontSize: '12px' }}
                  formatter={(value: any) => [`R$ ${parseFloat(value).toFixed(2)}`, '']}
                />
                <Legend iconType="circle" />
                <Bar name="Receitas" dataKey="receitas" fill="#14f195" radius={[4, 4, 0, 0]} />
                <Bar name="Gastos" dataKey="gastos" fill="#ff4d4d" radius={[4, 4, 0, 0]} />
                <Bar name="Lucro" dataKey="lucro" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-brand-muted">
              Sem dados para exibir no período selecionado.
            </div>
          )}
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
