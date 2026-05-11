'use client';

import { ArrowDownRight, ArrowUpRight, Edit2, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useFilter } from '@/contexts/FilterContext';
import DateFilter from '@/components/DateFilter';

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

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<Transacao | null>(null);
  const [editValor, setEditValor] = useState('');
  const [editDescricao, setEditDescricao] = useState('');

  const { startDate, endDate } = useFilter();

  const fetchData = async () => {
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

      transacoes.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
      setHistorico(transacoes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    window.addEventListener('focus', fetchData);
    return () => window.removeEventListener('focus', fetchData);
  }, [startDate, endDate]);

  const handleDelete = async (idStr: string, tipo: 'entrada' | 'gasto') => {
    const confirm = window.confirm(`Tem certeza que deseja remover esta ${tipo}?`);
    if (!confirm) return;

    const realId = idStr.replace('rec_', '').replace('gas_', '');
    const table = tipo === 'entrada' ? 'receitas' : 'gastos';

    try {
      const { error } = await supabase.from(table).delete().eq('id', realId);
      if (error) {
        alert('Erro ao excluir: ' + error.message);
      } else {
        setHistorico(prev => prev.filter(item => item.id !== idStr));
        alert('Item removido com sucesso!');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditClick = (item: Transacao) => {
    setEditingItem(item);
    setEditValor(item.valor.toString());
    setEditDescricao(item.tipo === 'entrada' ? item.cliente || '' : item.descricao || '');
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    const realId = editingItem.id.replace('rec_', '').replace('gas_', '');
    const table = editingItem.tipo === 'entrada' ? 'receitas' : 'gastos';
    const numValor = parseFloat(editValor) || 0;

    const updates: any = { valor: numValor };
    
    if (editingItem.tipo === 'entrada') {
      updates.cliente = editDescricao;
      updates.neto_valor = numValor * 0.3;
      updates.gabriel_valor = numValor * 0.3;
      updates.manu_valor = numValor * 0.3;
      updates.empresa_valor = numValor * 0.1;
    } else {
      updates.descricao = editDescricao;
    }

    try {
      const { error } = await supabase.from(table).update(updates).eq('id', realId);
      if (error) {
        alert('Erro ao editar: ' + error.message);
      } else {
        setHistorico(prev => prev.map(h => {
          if (h.id === editingItem.id) {
            return {
              ...h,
              valor: numValor,
              cliente: editingItem.tipo === 'entrada' ? editDescricao : h.cliente,
              descricao: editingItem.tipo === 'gasto' ? editDescricao : h.descricao,
            };
          }
          return h;
        }));
        alert('Atualizado com sucesso!');
        setEditingItem(null);
      }
    } catch(e) {
      console.error(e);
      alert('Erro inesperado ao editar.');
    }
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Histórico de Transações</h1>
          <p className="text-brand-muted mt-1">Acompanhe todas as entradas e saídas da empresa.</p>
        </div>
        <DateFilter />
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
                <th className="p-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {loading ? (
                <tr><td colSpan={5} className="p-4 text-center text-brand-muted">Carregando dados...</td></tr>
              ) : historico.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-brand-muted">Nenhuma transação encontrada.</td></tr>
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
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => handleEditClick(item)}
                        className="text-brand-muted hover:text-brand-primary transition-colors"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id, item.tipo)}
                        className="text-brand-muted hover:text-brand-danger transition-colors"
                        title="Deletar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edição */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-brand-card border border-brand-border rounded-xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Editar {editingItem.tipo === 'entrada' ? 'Entrada' : 'Gasto'}</h3>
              <button onClick={() => setEditingItem(null)} className="text-brand-muted hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-brand-muted mb-1">
                  {editingItem.tipo === 'entrada' ? 'Cliente' : 'Descrição'}
                </label>
                <input 
                  type="text" 
                  value={editDescricao}
                  onChange={(e) => setEditDescricao(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border rounded-lg p-2 text-white outline-none focus:border-brand-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm text-brand-muted mb-1">Valor (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={editValor}
                  onChange={(e) => setEditValor(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border rounded-lg p-2 text-white outline-none focus:border-brand-primary"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setEditingItem(null)}
                  className="flex-1 bg-brand-bg border border-brand-border text-white py-2 rounded-lg hover:bg-brand-card-hover transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveEdit}
                  className="flex-1 bg-brand-primary text-brand-bg font-bold py-2 rounded-lg hover:bg-brand-primary-hover transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
