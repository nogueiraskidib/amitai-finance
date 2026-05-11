'use client';

import { useState } from 'react';
import { Save, Tag, DollarSign, Calendar, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function RegistrarGasto() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');
  const [categoria, setCategoria] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao || !valor || !data || !categoria) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('gastos')
        .insert([
          { 
            descricao, 
            valor: parseFloat(valor), 
            data, 
            categoria 
          }
        ]);

      if (error) {
        console.error('Erro detalhado:', error);
        alert(`Erro do Supabase: ${error.message}`);
      } else {
        alert('Gasto registrado com sucesso!');
        setDescricao('');
        setValor('');
        setData('');
        setCategoria('');
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      alert('Erro inesperado ao salvar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Registrar Gasto</h1>
        <p className="text-brand-muted mt-1">Adicione uma despesa. O valor será descontado do caixa da empresa.</p>
      </header>

      <div className="glass-card p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-muted">Descrição</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FileText className="h-5 w-5 text-brand-muted" />
              </div>
              <input
                type="text"
                required
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="w-full bg-brand-bg border border-brand-border text-white rounded-lg pl-10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                placeholder="Ex: Pagamento de Software"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-muted">Valor</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-brand-muted" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border text-white rounded-lg pl-10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-muted">Data</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-brand-muted" />
                </div>
                <input
                  type="date"
                  required
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border text-white rounded-lg pl-10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-muted">Categoria</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Tag className="h-5 w-5 text-brand-muted" />
              </div>
              <select
                required
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full bg-brand-bg border border-brand-border text-white rounded-lg pl-10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all appearance-none"
              >
                <option value="" disabled>Selecione uma categoria</option>
                <option value="software">Softwares e Ferramentas</option>
                <option value="impostos">Impostos</option>
                <option value="marketing">Marketing/Anúncios</option>
                <option value="outros">Outros</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-danger hover:bg-red-500 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mt-6 disabled:opacity-70"
          >
            {loading ? 'Salvando...' : (
              <>
                <Save size={20} />
                Registrar Gasto
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
