'use client';

import { Download, PieChart as PieChartIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Fechamento() {
  const [loading, setLoading] = useState(true);
  const [totalEntradas, setTotalEntradas] = useState(0);
  const [saldoNeto, setSaldoNeto] = useState(0);
  const [saldoGabriel, setSaldoGabriel] = useState(0);
  const [saldoManu, setSaldoManu] = useState(0);
  const [caixaBruto, setCaixaBruto] = useState(0);
  
  const [gastos, setGastos] = useState<any[]>([]);
  const [totalGastos, setTotalGastos] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: recData } = await supabase.from('receitas').select('*');
        const { data: gasData } = await supabase.from('gastos').select('*');

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
    }

    fetchData();

    window.addEventListener('focus', fetchData);
    return () => window.removeEventListener('focus', fetchData);
  }, []);

  const saldoFinalEmpresa = caixaBruto - totalGastos;

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Fechamento Mensal</h1>
          <p className="text-brand-muted mt-1">Resumo geral das finanças do mês atual.</p>
        </div>
        <button className="bg-brand-bg border border-brand-border hover:bg-brand-card-hover text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
          <Download size={18} />
          Exportar PDF
        </button>
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

      <div className="glass-card p-6 bg-gradient-to-r from-brand-card to-brand-bg border-brand-primary/30">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-lg font-medium text-brand-muted">Saldo Final da Empresa no Mês</h3>
            <p className="text-sm text-brand-muted mt-1">(Caixa 10% - Gastos Operacionais)</p>
          </div>
          <div className="text-right">
            <span className={`text-4xl font-bold ${saldoFinalEmpresa < 0 ? 'text-brand-danger' : 'text-brand-primary'}`}>
              R$ {saldoFinalEmpresa.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
