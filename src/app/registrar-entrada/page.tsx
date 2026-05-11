'use client';

import { useState } from 'react';
import { Save, User, DollarSign, Calendar, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function RegistrarEntrada() {
  const [loading, setLoading] = useState(false);
  const [cliente, setCliente] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');
  const [observacao, setObservacao] = useState('');

  const numValor = parseFloat(valor) || 0;
  const netoValor = numValor * 0.3;
  const gabrielValor = numValor * 0.3;
  const manuValor = numValor * 0.3;
  const empresaValor = numValor * 0.1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente || !valor || !data) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('receitas')
        .insert([
          { 
            cliente, 
            valor: numValor, 
            data, 
            neto_valor: netoValor, 
            gabriel_valor: gabrielValor, 
            manu_valor: manuValor, 
            empresa_valor: empresaValor, 
            observacao 
          }
        ]);

      if (error) {
        console.error(error);
        alert('Erro ao salvar no banco de dados. Verifique se a tabela "receitas" existe com a coluna "neto_valor" (não joao_valor).');
      } else {
        alert('Entrada registrada com sucesso!');
        setCliente('');
        setValor('');
        setData('');
        setObservacao('');
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
        <h1 className="text-3xl font-bold text-white">Registrar Entrada</h1>
        <p className="text-brand-muted mt-1">Adicione uma nova receita e o sistema dividirá automaticamente.</p>
      </header>

      <div className="glass-card p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-brand-muted">Nome do Cliente</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-brand-muted" />
              </div>
              <input
                type="text"
                required
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                className="w-full bg-brand-bg border border-brand-border text-white rounded-lg pl-10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                placeholder="Ex: Agência XYZ"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-brand-muted">Valor Recebido</label>
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
            <label className="text-sm font-medium text-brand-muted">Observação (Opcional)</label>
            <div className="relative">
              <div className="absolute top-3 left-3 pointer-events-none">
                <FileText className="h-5 w-5 text-brand-muted" />
              </div>
              <textarea
                rows={3}
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                className="w-full bg-brand-bg border border-brand-border text-white rounded-lg pl-10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all"
                placeholder="Detalhes adicionais sobre esta entrada..."
              />
            </div>
          </div>

          {/* Divisão Automática Preview */}
          <div className="bg-brand-bg p-4 rounded-lg border border-brand-border mt-6">
            <h4 className="text-sm font-semibold text-brand-primary mb-3">Preview da Divisão (Automático)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-brand-muted block">Neto (30%)</span>
                <span className="text-white font-medium">R$ {netoValor.toFixed(2).replace('.', ',')}</span>
              </div>
              <div>
                <span className="text-brand-muted block">Gabriel (30%)</span>
                <span className="text-white font-medium">R$ {gabrielValor.toFixed(2).replace('.', ',')}</span>
              </div>
              <div>
                <span className="text-brand-muted block">Manu (30%)</span>
                <span className="text-white font-medium">R$ {manuValor.toFixed(2).replace('.', ',')}</span>
              </div>
              <div>
                <span className="text-brand-muted block">Caixa (10%)</span>
                <span className="text-brand-primary font-medium">R$ {empresaValor.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-primary hover:bg-brand-primary-hover text-[#060b19] font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mt-6 disabled:opacity-70"
          >
            {loading ? 'Salvando...' : (
              <>
                <Save size={20} />
                Registrar Entrada
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
