'use client';

import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Transacao {
  id: string;
  tipo: 'entrada' | 'gasto';
  cliente?: string;
  descricao?: string;
  valor: number;
  data: string;
  categoria?: string;
}

export default function Historico() {
  const [historico, setHistorico] = useState<Transacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: receitas, error: errReceitas } = await supabase.from('receitas').select('*');
        const { data: gastos, error: errGastos } = await supabase.from('gastos').select('*');

        if (errReceitas) console.error(errReceitas);
        if (errGastos) console.error(errGastos);

        const transacoes: Transacao[] = [];

        if (receitas) {
          receitas.forEach(r => {
            transacoes.push({
              id: `rec_${r.id}`,
              tipo: 'entrada',
              cliente: r.cliente,
              valor: r.valor,
              data: r.data
            });
          });
        }

        if (gastos) {
          gastos.forEach(g => {
            transacoes.push({
              id: `gas_${g.id}`,
              tipo: 'gasto',
              descricao: g.descricao,
              valor: g.valor,
              data: g.data,
              categoria: g.categoria
            });
          });
        }

        // Ordenar por data decrescente
        transacoes.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
        setHistorico(transacoes);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Histórico de Transações</h1>
        <p className="text-brand-muted mt-1">Acompanhe todas as entradas e saídas da empresa.</p>
      </header>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-bg/50 border-b border-brand-border text-brand-muted text-sm uppercase tracking-wider">
                <th className="p-4 font-medium">Data</th>
                <th className="p-4 font-medium">Tipo</th>
                <th className="p-4 font-medium">Descrição / Cliente</th>
                <th className="p-4 font-medium">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {loading ? (
                <tr><td colSpan={4} className="p-4 text-center text-brand-muted">Carregando dados...</td></tr>
              ) : historico.length === 0 ? (
                <tr><td colSpan={4} className="p-4 text-center text-brand-muted">Nenhuma transação encontrada.</td></tr>
              ) : historico.map((item) => (
                <tr key={item.id} className="hover:bg-brand-card-hover transition-colors">
                  <td className="p-4 text-brand-text">
                    {new Date(item.data).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.tipo === 'entrada' 
                        ? 'bg-brand-primary-dim text-brand-primary' 
                        : 'bg-brand-danger-dim text-brand-danger'
                    }`}>
                      {item.tipo === 'entrada' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {item.tipo === 'entrada' ? 'Entrada' : 'Gasto'}
                    </span>
                  </td>
                  <td className="p-4 text-brand-text">
                    {item.tipo === 'entrada' ? item.cliente : item.descricao}
                    {item.categoria && <span className="text-brand-muted text-xs ml-2">({item.categoria})</span>}
                  </td>
                  <td className={`p-4 font-semibold ${item.tipo === 'entrada' ? 'text-brand-primary' : 'text-brand-danger'}`}>
                    {item.tipo === 'entrada' ? '+' : '-'} R$ {item.valor.toFixed(2).replace('.', ',')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
