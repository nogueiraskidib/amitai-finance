'use client';

import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Wallet, 
  BarChart3,
  Target,
  CheckSquare,
  MessageSquare,
  Calendar,
  Layers,
  FileCheck,
  CheckCircle,
  Clock,
  Zap,
  Activity,
  UserCheck,
  Edit2,
  Save,
  X
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend
} from 'recharts';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useFilter } from '@/contexts/FilterContext';
import DateFilter from '@/components/DateFilter';
import Link from 'next/link';

// Types
interface LogItem {
  timestamp: string;
  action: string;
  user: string;
}

interface Client {
  id: string;
  name: string;
  stageId: number;
  timeInStage: number;
  status: string;
  tasks: { id: string; text: string; completed: boolean }[];
  history: LogItem[];
  createdAt: string;
  lastUpdated: string;
  responsible?: string;
  contractValue?: string;
  assetsChecklist?: { id: string; text: string; completed: boolean }[];
  operationalChecklist?: { id: string; text: string; completed: boolean }[];
  progress?: number;
}

interface PartnerMeta {
  name: string;
  dailyProgress: number;
  dailyTarget: number;
}

interface GlobalMeta {
  weeklyProgress: number;
  weeklyTarget: number;
}

const DEFAULT_PARTNERS_METAS: PartnerMeta[] = [
  { name: 'Gabriel', dailyProgress: 0, dailyTarget: 5 },
  { name: 'Neto', dailyProgress: 0, dailyTarget: 5 },
  { name: 'Manu', dailyProgress: 0, dailyTarget: 5 }
];

const DEFAULT_GLOBAL_META: GlobalMeta = {
  weeklyProgress: 0,
  weeklyTarget: 25
};

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

  // Real clients array from localStorage
  const [funnelClients, setFunnelClients] = useState<Client[]>([]);

  // Metas State (Editable & Saved in localStorage)
  const [partnersMetas, setPartnersMetas] = useState<PartnerMeta[]>([]);
  const [globalMeta, setGlobalMeta] = useState<GlobalMeta>(DEFAULT_GLOBAL_META);
  const [isEditingMetas, setIsEditingMetas] = useState(false);

  // Temporary state for editing metas
  const [tempPartnersMetas, setTempPartnersMetas] = useState<PartnerMeta[]>([]);
  const [tempGlobalMeta, setTempGlobalMeta] = useState<GlobalMeta>(DEFAULT_GLOBAL_META);

  const { startDate, endDate } = useFilter();

  useEffect(() => {
    // 1. Load funnel clients from localStorage (Start with empty slate if not present)
    const savedClients = localStorage.getItem('amitai-funil-v1');
    if (savedClients) {
      try {
        setFunnelClients(JSON.parse(savedClients));
      } catch (e) {
        setFunnelClients([]);
      }
    } else {
      setFunnelClients([]);
    }

    // 2. Load metas from localStorage
    const savedPartnersMetas = localStorage.getItem('amitai-metas-socios-v1');
    const savedGlobalMeta = localStorage.getItem('amitai-metas-global-v1');
    
    if (savedPartnersMetas) {
      try {
        setPartnersMetas(JSON.parse(savedPartnersMetas));
      } catch (e) {
        setPartnersMetas(DEFAULT_PARTNERS_METAS);
      }
    } else {
      setPartnersMetas(DEFAULT_PARTNERS_METAS);
      localStorage.setItem('amitai-metas-socios-v1', JSON.stringify(DEFAULT_PARTNERS_METAS));
    }

    if (savedGlobalMeta) {
      try {
        setGlobalMeta(JSON.parse(savedGlobalMeta));
      } catch (e) {
        setGlobalMeta(DEFAULT_GLOBAL_META);
      }
    } else {
      setGlobalMeta(DEFAULT_GLOBAL_META);
      localStorage.setItem('amitai-metas-global-v1', JSON.stringify(DEFAULT_GLOBAL_META));
    }

    // 3. Fetch financials from Supabase
    async function fetchData() {
      if (!startDate || !endDate) return;

      setLoading(true);
      try {
        const { data: receitas } = await supabase
          .from('receitas')
          .select('*')
          .gte('data', startDate)
          .lte('data', endDate);

        const { data: gastos } = await supabase
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

        const dataMap: { [key: string]: { name: string, receitas: number, gastos: number, lucro: number } } = {};

        if (receitas) {
          receitas.forEach(r => {
            sumEntradas += r.valor || 0;
            sumNeto += r.neto_valor || 0;
            sumGabriel += r.gabriel_valor || 0;
            sumManu += r.manu_valor || 0;
            sumCaixa += r.empresa_valor || 0;

            const dateKey = r.data;
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

        const sortedData = Object.keys(dataMap)
          .sort()
          .map(key => {
            const item = dataMap[key];
            item.lucro = item.receitas - item.gastos;
            return item;
          });

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
            if (item.cliente !== undefined) {
              monthlyMap[monthKey].receitas += item.valor || 0;
            } else {
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

  // Compute targets edit toggle
  const startEditing = () => {
    setTempPartnersMetas(JSON.parse(JSON.stringify(partnersMetas)));
    setTempGlobalMeta({ ...globalMeta });
    setIsEditingMetas(true);
  };

  const cancelEditing = () => {
    setIsEditingMetas(false);
  };

  const saveMetas = () => {
    setPartnersMetas(tempPartnersMetas);
    setGlobalMeta(tempGlobalMeta);
    localStorage.setItem('amitai-metas-socios-v1', JSON.stringify(tempPartnersMetas));
    localStorage.setItem('amitai-metas-global-v1', JSON.stringify(tempGlobalMeta));
    setIsEditingMetas(false);
  };

  const handlePartnerMetaChange = (index: number, field: 'dailyProgress' | 'dailyTarget', value: number) => {
    const updated = [...tempPartnersMetas];
    updated[index] = {
      ...updated[index],
      [field]: Math.max(0, value)
    };
    setTempPartnersMetas(updated);
  };

  // Compute 100% REAL dynamic stats from local clients (Empty state if empty!)
  // COMMERCIAL metrics
  const newLeadsCount = funnelClients.filter(c => c.stageId === 1).length;
  const meetingsCount = funnelClients.filter(c => c.stageId === 2).length;
  const closingsCount = funnelClients.filter(c => c.stageId === 3).length;

  // CLIENTS metrics
  const activeClientsCount = funnelClients.filter(c => c.stageId === 7 || c.stageId === 9 || c.stageId === 12).length;
  const onboardingClientsCount = funnelClients.filter(c => c.stageId === 4 || c.stageId === 5 || c.stageId === 6).length;
  const lateClientsCount = funnelClients.filter(c => 
    c.stageId === 7 && (c.status === 'Crítico' || c.timeInStage > 10)
  ).length;

  // PROSPECTION ranking (Strictly counts REAL active leads by partner)
  const getPartnerLeadsCount = (name: string) => funnelClients.filter(c => c.responsible === name).length;
  const partnersRanking = [
    { name: 'Gabriel', count: getPartnerLeadsCount('Gabriel') },
    { name: 'Neto', count: getPartnerLeadsCount('Neto') },
    { name: 'Manu', count: getPartnerLeadsCount('Manu') }
  ].sort((a, b) => b.count - a.count);

  // OPERATION metrics
  const overdueTasksCount = funnelClients.reduce((acc, c) => acc + c.tasks.filter(t => !t.completed).length, 0);
  const problemCampaignsCount = funnelClients.filter(c => c.stageId === 7 && c.status === 'Crítico').length;
  const pendingDeliveriesCount = funnelClients.filter(c => c.stageId === 7 && c.progress !== undefined && c.progress < 100).length;

  // FINANCIAL PREVISÃO (Faturamento + Expected contract closures)
  const sumForecastValues = funnelClients.reduce((acc, c) => {
    if ((c.stageId === 3 || c.stageId === 4) && c.contractValue) {
      const numericValue = parseFloat(c.contractValue.replace(/[^\d]/g, '')) / 100;
      if (!isNaN(numericValue)) return acc + numericValue;
    }
    return acc;
  }, 0);
  const previsaoFaturamento = totalEntradas + sumForecastValues;

  const partners = [
    { name: 'Neto', balance: `R$ ${saldoNeto.toFixed(2).replace('.', ',')}`, percentage: '30%', color: 'from-blue-500 to-indigo-600' },
    { name: 'Gabriel', balance: `R$ ${saldoGabriel.toFixed(2).replace('.', ',')}`, percentage: '30%', color: 'from-emerald-500 to-teal-600' },
    { name: 'Manu', balance: `R$ ${saldoManu.toFixed(2).replace('.', ',')}`, percentage: '30%', color: 'from-purple-500 to-fuchsia-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 custom-scrollbar">
      
      {/* Dashboard Top Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Dashboard Principal</h1>
          <p className="text-brand-muted mt-1">Visão geral do faturamento, processos e performance real da Amitai.</p>
        </div>
        <DateFilter />
      </header>

      {/* FINANCEIRO RÁPIDO (4 Key Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/fechamento" className="glass-card p-6 border-l-4 border-l-brand-primary glow-primary block hover:scale-[1.02] transition-all cursor-pointer">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-brand-muted text-[11px] font-bold uppercase tracking-wider">Faturamento Mês</p>
              <h3 className="text-3xl font-black mt-2 text-gradient">
                {loading ? '...' : `R$ ${totalEntradas.toFixed(2).replace('.', ',')}`}
              </h3>
              <span className="text-[10px] text-brand-primary font-semibold mt-1 block">Total faturado</span>
            </div>
            <div className="p-3 bg-brand-primary-dim rounded-lg">
              <TrendingUp className="text-brand-primary" size={20} />
            </div>
          </div>
        </Link>

        <Link href="/fechamento" className="glass-card p-6 border-l-4 border-l-blue-500 block hover:scale-[1.02] transition-all cursor-pointer">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-brand-muted text-[11px] font-bold uppercase tracking-wider">Lucro Líquido</p>
              <h3 className="text-2xl font-black mt-2 text-white">
                {loading ? '...' : `R$ ${lucroLiquido.toFixed(2).replace('.', ',')}`}
              </h3>
              <span className="text-[10px] text-blue-400 font-semibold mt-1 block">Lucro real</span>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <DollarSign className="text-blue-500" size={20} />
            </div>
          </div>
        </Link>

        <Link href="/fechamento" className="glass-card p-6 border-l-4 border-l-red-500 block hover:scale-[1.02] transition-all cursor-pointer">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-brand-muted text-[11px] font-bold uppercase tracking-wider">Despesas / Gastos</p>
              <h3 className="text-2xl font-black mt-2 text-white">
                {loading ? '...' : `R$ ${totalGastos.toFixed(2).replace('.', ',')}`}
              </h3>
              <span className="text-[10px] text-brand-danger font-semibold mt-1 block">Total de gastos</span>
            </div>
            <div className="p-3 bg-brand-danger-dim rounded-lg">
              <TrendingDown className="text-brand-danger" size={20} />
            </div>
          </div>
        </Link>

        <Link href="/fechamento" className="glass-card p-6 border-l-4 border-l-purple-500 block hover:scale-[1.02] transition-all cursor-pointer">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-brand-muted text-[11px] font-bold uppercase tracking-wider">Previsão Financeira</p>
              <h3 className="text-2xl font-black mt-2 text-white">
                {loading ? '...' : `R$ ${previsaoFaturamento.toFixed(2).replace('.', ',')}`}
              </h3>
              <span className="text-[10px] text-purple-400 font-semibold mt-1 block">Previsão com novos contratos</span>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Wallet className="text-purple-500" size={20} />
            </div>
          </div>
        </Link>
      </div>

      {/* METRIC COLUMNS: COMERCIAL, CLIENTES, PROSPECÇÃO, OPERAÇÃO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* 1. COMERCIAL */}
        <Link href="/funil" className="glass-card p-5 space-y-4 block hover:scale-[1.02] transition-all cursor-pointer">
          <h4 className="font-bold text-white text-sm flex items-center gap-2 border-b border-brand-border/40 pb-3">
            <MessageSquare size={16} className="text-cyan-400" />
            Funil de Vendas
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-brand-muted font-medium">Leads Novos (Etapa 1)</span>
              <span className="text-sm font-bold text-white bg-brand-bg px-2.5 py-0.5 rounded-lg border border-brand-border">{newLeadsCount}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-brand-muted font-medium">Reuniões (Etapa 2)</span>
              <span className="text-sm font-bold text-white bg-brand-bg px-2.5 py-0.5 rounded-lg border border-brand-border">{meetingsCount}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-brand-muted font-medium">Fechamentos (Etapa 3)</span>
              <span className="text-sm font-bold text-brand-primary bg-brand-primary-dim px-2.5 py-0.5 rounded-lg border border-brand-primary/20">{closingsCount}</span>
            </div>
          </div>
        </Link>

        {/* 2. CLIENTES */}
        <Link href="/clientes" className="glass-card p-5 space-y-4 block hover:scale-[1.02] transition-all cursor-pointer">
          <h4 className="font-bold text-white text-sm flex items-center gap-2 border-b border-brand-border/40 pb-3">
            <Users size={16} className="text-indigo-400" />
            Clientes Ativos
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-brand-muted font-medium">Clientes Ativos</span>
              <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20">{activeClientsCount}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-brand-muted font-medium">Clientes Atrasados</span>
              <span className="text-sm font-bold text-brand-danger bg-brand-danger-dim px-2.5 py-0.5 rounded-lg border border-brand-danger/20">{lateClientsCount}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-brand-muted font-medium">Em Onboarding</span>
              <span className="text-sm font-bold text-white bg-brand-bg px-2.5 py-0.5 rounded-lg border border-brand-border">{onboardingClientsCount}</span>
            </div>
          </div>
        </Link>

        {/* 3. PROSPECÇÃO (SÓCIOS RANKING REAL) */}
        <div className="glass-card p-5 space-y-4">
          <h4 className="font-bold text-white text-sm flex items-center gap-2 border-b border-brand-border/40 pb-3">
            <Target size={16} className="text-purple-400" />
            Contatos por Sócio
          </h4>
          <div className="space-y-3">
            {partnersRanking.map((partner, idx) => (
              <Link 
                key={partner.name} 
                href={`/processos?tab=equipe&member=${partner.name.toLowerCase()}`}
                className="flex items-center justify-between py-1 text-xs hover:text-brand-primary transition-colors cursor-pointer group"
              >
                <span className="text-brand-muted group-hover:text-brand-primary flex items-center gap-1 font-medium">
                  <span className="text-[10px] bg-brand-bg border border-brand-border w-5 h-5 rounded-full flex items-center justify-center font-bold text-white group-hover:border-brand-primary">{idx + 1}</span>
                  {partner.name}
                </span>
                <span className="text-white font-bold group-hover:text-brand-primary">{partner.count} leads reais</span>
              </Link>
            ))}
          </div>
        </div>

        {/* 4. OPERAÇÃO */}
        <Link href="/processos?tab=interno" className="glass-card p-5 space-y-4 block hover:scale-[1.02] transition-all cursor-pointer">
          <h4 className="font-bold text-white text-sm flex items-center gap-2 border-b border-brand-border/40 pb-3">
            <CheckSquare size={16} className="text-pink-400" />
            Tarefas & Entregas
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-brand-muted font-medium">Tarefas Atrasadas</span>
              <span className="text-sm font-bold text-brand-danger bg-brand-danger-dim px-2.5 py-0.5 rounded-lg border border-brand-danger/20">{overdueTasksCount}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-brand-muted font-medium">Campanhas c/ Problema</span>
              <span className="text-sm font-bold text-brand-danger bg-brand-danger-dim px-2.5 py-0.5 rounded-lg border border-brand-danger/20">{problemCampaignsCount}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-brand-muted font-medium">Entregas Pendentes</span>
              <span className="text-sm font-bold text-white bg-brand-bg px-2.5 py-0.5 rounded-lg border border-brand-border">{pendingDeliveriesCount}</span>
            </div>
          </div>
        </Link>

      </div>

      {/* PROGRESSO DOS SÓCIOS PROSPECÇÃO (FULLY EDITABLE!) */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Partners Daily Progress Card */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-white text-md flex items-center gap-2">
                <Target className="text-brand-primary animate-pulse" />
                Contatos de Hoje
              </h3>
              
              {/* Edit Mode toggler */}
              {!isEditingMetas ? (
                <button 
                  onClick={startEditing}
                  className="text-xs text-brand-primary bg-brand-primary-dim hover:bg-brand-primary hover:text-brand-bg font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 size={12} /> Editar
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={saveMetas}
                    className="text-xs text-brand-bg bg-brand-primary hover:bg-brand-primary-hover font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Save size={12} /> Salvar
                  </button>
                  <button 
                    onClick={cancelEditing}
                    className="text-xs text-brand-muted bg-brand-border hover:bg-brand-card-hover font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <X size={12} /> Cancelar
                  </button>
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              {!isEditingMetas ? (
                // Display Mode
                partnersMetas.map((partner) => (
                  <div key={partner.name} className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-white flex items-center gap-1.5"><UserCheck size={14} className="text-brand-primary" /> {partner.name}</span>
                      <span className="text-brand-muted">Feitos: <strong className="text-white">{partner.dailyProgress}</strong></span>
                    </div>
                  </div>
                ))
              ) : (
                // Edit Mode
                tempPartnersMetas.map((partner, idx) => (
                  <div key={partner.name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-brand-bg/50 border border-brand-border rounded-xl">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5 shrink-0"><UserCheck size={14} className="text-brand-primary" /> {partner.name}</span>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-brand-muted">Feitos:</span>
                        <input 
                          type="number"
                          value={partner.dailyProgress}
                          onChange={(e) => handlePartnerMetaChange(idx, 'dailyProgress', Number(e.target.value))}
                          className="w-16 bg-brand-card border border-brand-border rounded-lg py-1 px-2 text-white text-center font-bold focus:outline-none focus:border-brand-primary"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Financial Performance Chart (Recharts) */}
      <div className="glass-card p-6 min-h-[400px] flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="text-brand-primary" size={20} />
          <h3 className="text-xl font-bold text-white">Entradas e Gastos do Mês</h3>
        </div>
        
        <div className="flex-1 w-full min-h-[300px]">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center text-brand-muted">
              Carregando gráfico...
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ dy: 10 }}
                />
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={10} 
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

      {/* Partners Payout Balances */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white">Saldos dos Sócios (Fechamento)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {partners.map((partner) => (
            <Link 
              key={partner.name} 
              href="/fechamento"
              className="glass-card p-6 relative overflow-hidden group block hover:scale-[1.02] transition-all cursor-pointer"
            >
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
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
