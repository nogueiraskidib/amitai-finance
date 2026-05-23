'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Layers, 
  TrendingUp, 
  Clock, 
  Plus, 
  Search, 
  Trash2, 
  Eye, 
  Calendar, 
  Link as LinkIcon, 
  DollarSign, 
  FileText, 
  CheckCircle, 
  FolderPlus, 
  Briefcase, 
  Play, 
  LifeBuoy, 
  Award, 
  BarChart, 
  AlertTriangle, 
  RefreshCw, 
  X, 
  ArrowRight, 
  User, 
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  FileCheck,
  CheckSquare,
  Activity,
  HeartHandshake
} from 'lucide-react';

// Type definitions
interface LogItem {
  timestamp: string;
  action: string;
  user: string;
}

interface Client {
  id: string;
  name: string;
  stageId: number; // 1 to 12
  timeInStage: number; // in days
  status: string; // e.g. "Em andamento", "Pendente", "Concluído", "Crítico"
  tasks: { id: string; text: string; completed: boolean }[];
  history: LogItem[];
  createdAt: string;
  lastUpdated: string;
  
  // Custom fields by stage
  // Stage 1
  origin?: string;
  responsible?: string;
  contactDate?: string;
  conversationStatus?: string;
  observations?: string;

  // Stage 2
  meetingDate?: string;
  meetingTime?: string;
  meetingLink?: string;
  bookingStatus?: string;

  // Stage 3
  proposalSent?: boolean;
  contractValue?: string;
  objections?: string;
  negotiationStatus?: string;
  forecastDate?: string;

  // Stage 4
  contractName?: string;
  signatureStatus?: string;
  sendDate?: string;

  // Stage 5
  assetsChecklist?: { id: string; text: string; completed: boolean }[];

  // Stage 6
  niche?: string;
  targetAudience?: string;
  pains?: string;
  competitors?: string;
  differentials?: string;
  toneOfVoice?: string;
  strategies?: string;
  briefingComplete?: boolean;

  // Stage 7
  activeServices?: string;
  operationalChecklist?: { id: string; text: string; completed: boolean }[];
  deadline?: string;
  progress?: number;

  // Stage 8
  requests?: string;
  priority?: 'Baixa' | 'Média' | 'Alta';

  // Stage 9
  deliveries?: string;
  results?: string;
  feedback?: string;
  retentionStrategy?: string;
  upsellPossibility?: string;

  // Stage 10
  reportName?: string;
  metrics?: string;
  improvements?: string;
  deliveryDate?: string;

  // Stage 11
  cancelReason?: string;
  cancelFeedback?: string;
  errorsIdentified?: string;
  improvementSuggestions?: string;
}

// Stage definitions
const STAGES = [
  { id: 1, name: 'Resposta à Prospecção', desc: 'Leads que responderam à abordagem inicial', color: 'border-l-4 border-emerald-400', badgeColor: 'bg-emerald-500/10 text-emerald-400', icon: MessageSquareIcon },
  { id: 2, name: 'Fechar Reunião', desc: 'Leads em processo de agendamento de reunião', color: 'border-l-4 border-cyan-400', badgeColor: 'bg-cyan-500/10 text-cyan-400', icon: Calendar },
  { id: 3, name: 'Fechar Cliente', desc: 'Negociações de contrato e propostas comerciais', color: 'border-l-4 border-blue-400', badgeColor: 'bg-blue-500/10 text-blue-400', icon: DollarSign },
  { id: 4, name: 'Fazer e Enviar Contrato', desc: 'Clientes fechados aguardando assinatura', color: 'border-l-4 border-indigo-400', badgeColor: 'bg-indigo-500/10 text-indigo-400', icon: FileCheck },
  { id: 5, name: 'Criar Ativos', desc: 'Configuração de contas, acessos e estruturas', color: 'border-l-4 border-purple-400', badgeColor: 'bg-purple-500/10 text-purple-400', icon: FolderPlus },
  { id: 6, name: 'Estudo do Cliente', desc: 'Briefing estratégico e dossiê do nicho', color: 'border-l-4 border-fuchsia-400', badgeColor: 'bg-fuchsia-500/10 text-fuchsia-400', icon: Briefcase },
  { id: 7, name: 'Execução dos Serviços', desc: 'Acompanhamento diário da entrega operacional', color: 'border-l-4 border-pink-400', badgeColor: 'bg-pink-500/10 text-pink-400', icon: Play },
  { id: 8, name: 'Suporte ao Cliente', desc: 'Demandas pontuais, prioridades e chamados', color: 'border-l-4 border-rose-400', badgeColor: 'bg-rose-500/10 text-rose-400', icon: LifeBuoy, optional: true },
  { id: 9, name: 'Entrega + Retenção', desc: 'Entrega final, fidelização e upsell', color: 'border-l-4 border-orange-400', badgeColor: 'bg-orange-500/10 text-orange-400', icon: Award },
  { id: 10, name: 'Relatório Mensal', desc: 'Geração e envio de métricas mensais', color: 'border-l-4 border-amber-400', badgeColor: 'bg-amber-500/10 text-amber-400', icon: BarChart, optional: true },
  { id: 11, name: 'Feedback de Cancelamento', desc: 'Dores identificadas e análise de churn', color: 'border-l-4 border-red-400', badgeColor: 'bg-red-500/10 text-red-400', icon: AlertTriangle },
  { id: 12, name: 'Renovação de Contrato', desc: 'Fim do ciclo contratual e preparo de renovação', color: 'border-l-4 border-teal-400', badgeColor: 'bg-teal-500/10 text-teal-400', icon: RefreshCw }
];

// Helper component for lucide MessageSquare
function MessageSquareIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

// Default Seed Data
const DEFAULT_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Tech Startups Ltda',
    stageId: 1,
    timeInStage: 2,
    status: 'Em andamento',
    origin: 'LinkedIn Prospecção',
    responsible: 'Gabriel',
    contactDate: '2026-05-22',
    conversationStatus: 'Super interessados',
    observations: 'Querem otimizar seus custos de infraestrutura e rodar anúncios.',
    tasks: [
      { id: 't1_1', text: 'Enviar portfólio de cases', completed: true },
      { id: 't1_2', text: 'Validar horário para call', completed: false }
    ],
    history: [
      { timestamp: '2026-05-22 14:00', action: 'Lead criado na primeira etapa', user: 'Gabriel' }
    ],
    createdAt: '2026-05-22',
    lastUpdated: '2026-05-22'
  },
  {
    id: 'c2',
    name: 'Clínica Sorriso Premium',
    stageId: 2,
    timeInStage: 1,
    status: 'Concluído',
    meetingDate: '2026-05-25',
    meetingTime: '14:00',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    bookingStatus: 'Confirmada',
    responsible: 'Manu',
    observations: 'Focados em prospecção via WhatsApp automatizado.',
    tasks: [
      { id: 't2_1', text: 'Preparar pitch de vendas de estética dental', completed: false }
    ],
    history: [
      { timestamp: '2026-05-22 16:30', action: 'Reunião agendada para segunda-feira', user: 'Manu' }
    ],
    createdAt: '2026-05-22',
    lastUpdated: '2026-05-22'
  },
  {
    id: 'c3',
    name: 'Varejo Express',
    stageId: 3,
    timeInStage: 4,
    status: 'Crítico',
    proposalSent: true,
    contractValue: 'R$ 5.500,00',
    objections: 'Acharam o setup inicial alto',
    negotiationStatus: 'Aguardando aprovação de desconto',
    forecastDate: '2026-05-28',
    responsible: 'Neto',
    observations: 'Querem fechar desenvolvimento de e-commerce + campanhas.',
    tasks: [
      { id: 't3_1', text: 'Conversar com equipe sobre setup', completed: false }
    ],
    history: [
      { timestamp: '2026-05-19 11:20', action: 'Proposta comercial enviada', user: 'Neto' }
    ],
    createdAt: '2026-05-19',
    lastUpdated: '2026-05-22'
  },
  {
    id: 'c4',
    name: 'Acme Importadora',
    stageId: 5,
    timeInStage: 5,
    status: 'Em andamento',
    responsible: 'Neto',
    observations: 'Estruturação de criativos e landing page de importados.',
    assetsChecklist: [
      { id: 'a1', text: 'Criação de Contas', completed: true },
      { id: 'a2', text: 'Acessos Compartilhados', completed: false },
      { id: 'a3', text: 'Estruturação de Contas', completed: false },
      { id: 'a4', text: 'Landing Pages', completed: false },
      { id: 'a5', text: 'Pixels de Rastreamento', completed: true },
      { id: 'a6', text: 'Instalação de Domínios', completed: true }
    ],
    tasks: [
      { id: 't5_1', text: 'Cobrar acessos do Facebook Business', completed: false }
    ],
    history: [
      { timestamp: '2026-05-18 09:00', action: 'Entrou na etapa de Criação de Ativos', user: 'Neto' }
    ],
    createdAt: '2026-05-18',
    lastUpdated: '2026-05-21'
  },
  {
    id: 'c5',
    name: 'Alpha Fitness Club',
    stageId: 7,
    timeInStage: 12,
    status: 'Em andamento',
    activeServices: 'Tráfego Pago & Social Media',
    responsible: 'Gabriel',
    deadline: '2026-05-30',
    progress: 66,
    operationalChecklist: [
      { id: 'op1', text: 'Subir campanhas de captação de leads', completed: true },
      { id: 'op2', text: 'Ajustar criativos do Canva', completed: true },
      { id: 'op3', text: 'Relatório da primeira semana de tráfego', completed: false }
    ],
    tasks: [
      { id: 't7_1', text: 'Reunião de alinhamento com o dono da academia', completed: false }
    ],
    history: [
      { timestamp: '2026-05-11 10:00', action: 'Campanhas de tráfego iniciadas', user: 'Gabriel' }
    ],
    createdAt: '2026-05-11',
    lastUpdated: '2026-05-22'
  },
  {
    id: 'c6',
    name: 'Beta Educação',
    stageId: 12,
    timeInStage: 3,
    status: 'Pendente',
    responsible: 'Neto',
    observations: 'Excelente resultado no último mês de conversão técnica e SEO.',
    tasks: [
      { id: 't12_1', text: 'Apresentar proposta de renovação anual', completed: false }
    ],
    history: [
      { timestamp: '2026-05-20 15:45', action: 'Reunião de encerramento do ciclo mensal', user: 'Neto' }
    ],
    createdAt: '2026-05-20',
    lastUpdated: '2026-05-20'
  }
];

export default function FunilVendas() {
  const [clients, setClients] = useState<Client[]>([]);
  const [activeTab, setActiveTab] = useState<'board' | 'cone'>('board');
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Add Lead Form State
  const [newClientName, setNewClientName] = useState('');
  const [newClientStage, setNewClientStage] = useState(1);
  const [newClientResponsible, setNewClientResponsible] = useState('Neto');
  const [newClientStatus, setNewClientStatus] = useState('Em andamento');

  // Load and save state from/to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('amitai-funil-v1');
    if (saved) {
      try {
        setClients(JSON.parse(saved));
      } catch (e) {
        setClients(DEFAULT_CLIENTS);
      }
    } else {
      setClients(DEFAULT_CLIENTS);
      localStorage.setItem('amitai-funil-v1', JSON.stringify(DEFAULT_CLIENTS));
    }
  }, []);

  const saveState = (updatedClients: Client[]) => {
    setClients(updatedClients);
    localStorage.setItem('amitai-funil-v1', JSON.stringify(updatedClients));
  };

  // Drag and Drop implementation
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStageId: number) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;

    const currentClient = clients.find(c => c.id === id);
    if (!currentClient || currentClient.stageId === targetStageId) return;

    // Log the move
    const timestamp = new Date().toLocaleString('pt-BR', { hour12: false }).replace(',', '');
    const sourceStage = STAGES.find(s => s.id === currentClient.stageId)?.name || 'Desconhecida';
    const targetStage = STAGES.find(s => s.id === targetStageId)?.name || 'Desconhecida';
    
    const newLog: LogItem = {
      timestamp,
      action: `Movido de "${sourceStage}" para "${targetStage}"`,
      user: currentClient.responsible || 'Sistema'
    };

    const updated = clients.map(c => {
      if (c.id === id) {
        return {
          ...c,
          stageId: targetStageId,
          timeInStage: 0, // Reset days when entering a new stage
          history: [newLog, ...c.history],
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return c;
    });

    saveState(updated);
  };

  // Add Client
  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const timestamp = new Date().toLocaleString('pt-BR', { hour12: false }).replace(',', '');
    const initialStageName = STAGES.find(s => s.id === newClientStage)?.name || 'Resposta à Prospecção';

    const newClient: Client = {
      id: 'c_' + Date.now(),
      name: newClientName,
      stageId: newClientStage,
      timeInStage: 0,
      status: newClientStatus,
      responsible: newClientResponsible,
      tasks: [],
      history: [
        { timestamp, action: `Cliente criado na etapa "${initialStageName}"`, user: newClientResponsible }
      ],
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      
      // Default checklists for relevant stages
      assetsChecklist: newClientStage === 5 ? [
        { id: 'a1', text: 'Criação de Contas', completed: false },
        { id: 'a2', text: 'Acessos Compartilhados', completed: false },
        { id: 'a3', text: 'Estruturação de Contas', completed: false },
        { id: 'a4', text: 'Landing Pages', completed: false },
        { id: 'a5', text: 'Pixels de Rastreamento', completed: false },
        { id: 'a6', text: 'Instalação de Domínios', completed: false }
      ] : undefined,
      operationalChecklist: newClientStage === 7 ? [
        { id: 'op1', text: 'Planejar primeiro mês', completed: false },
        { id: 'op2', text: 'Alinhamento com cliente', completed: false },
        { id: 'op3', text: 'Entregar primeiros criativos/anúncios', completed: false }
      ] : undefined
    };

    const updated = [newClient, ...clients];
    saveState(updated);

    // Reset Form
    setNewClientName('');
    setNewClientStage(1);
    setNewClientStatus('Em andamento');
    setIsAddModalOpen(false);
  };

  // Delete Client
  const handleDeleteClient = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este lead/cliente do funil?')) {
      const updated = clients.filter(c => c.id !== id);
      saveState(updated);
      setIsModalOpen(false);
      setSelectedClient(null);
    }
  };

  // Update Client Fields
  const updateClientField = (id: string, field: keyof Client, value: any) => {
    const updated = clients.map(c => {
      if (c.id === id) {
        const timestamp = new Date().toLocaleString('pt-BR', { hour12: false }).replace(',', '');
        const updatedObj = {
          ...c,
          [field]: value,
          lastUpdated: new Date().toISOString().split('T')[0]
        };

        // Add history log if modifying important field
        if (field === 'status' || field === 'responsible' || field === 'contractValue') {
          updatedObj.history = [
            { timestamp, action: `Campo "${String(field)}" atualizado para: ${value}`, user: c.responsible || 'Sistema' },
            ...c.history
          ];
        }

        return updatedObj;
      }
      return c;
    });

    saveState(updated);
    // Sync active client preview
    const syncClient = updated.find(c => c.id === id);
    if (syncClient) setSelectedClient(syncClient);
  };

  // Custom asset checklist change
  const handleAssetCheck = (clientId: string, assetId: string, completed: boolean) => {
    const client = clients.find(c => c.id === clientId);
    if (!client || !client.assetsChecklist) return;

    const newChecklist = client.assetsChecklist.map(a => a.id === assetId ? { ...a, completed } : a);
    updateClientField(clientId, 'assetsChecklist', newChecklist);
  };

  // Custom operational checklist change
  const handleOperationalCheck = (clientId: string, taskId: string, completed: boolean) => {
    const client = clients.find(c => c.id === clientId);
    if (!client || !client.operationalChecklist) return;

    const newChecklist = client.operationalChecklist.map(a => a.id === taskId ? { ...a, completed } : a);
    
    // Calculate new progress dynamically
    const completedCount = newChecklist.filter(item => item.completed).length;
    const totalCount = newChecklist.length;
    const progressPercentage = Math.round((completedCount / totalCount) * 100);

    const updated = clients.map(c => {
      if (c.id === clientId) {
        return {
          ...c,
          operationalChecklist: newChecklist,
          progress: progressPercentage,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return c;
    });
    saveState(updated);
    const syncClient = updated.find(c => c.id === clientId);
    if (syncClient) setSelectedClient(syncClient);
  };

  // Core task checklist management (General Tasks)
  const handleTaskToggle = (clientId: string, taskId: string, completed: boolean) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const newTasks = client.tasks.map(t => t.id === taskId ? { ...t, completed } : t);
    updateClientField(clientId, 'tasks', newTasks);
  };

  const handleAddTask = (clientId: string, taskText: string) => {
    if (!taskText.trim()) return;
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const newTasks = [...client.tasks, { id: 't_' + Date.now(), text: taskText, completed: false }];
    updateClientField(clientId, 'tasks', newTasks);
  };

  // RENEWAL PROCESS: Stage 12 -> Returns to Stage 4!
  const handleRenewContract = (client: Client) => {
    const timestamp = new Date().toLocaleString('pt-BR', { hour12: false }).replace(',', '');
    const log1: LogItem = {
      timestamp,
      action: 'CONTRATO RENOVADO! Reiniciando ciclo de assinatura.',
      user: client.responsible || 'Sistema'
    };

    const updated = clients.map(c => {
      if (c.id === client.id) {
        return {
          ...c,
          stageId: 4, // Returns to "Fazer e enviar contrato" (Etapa 4)
          timeInStage: 0,
          status: 'Em andamento',
          signatureStatus: 'Pendente Assinatura',
          proposalSent: false,
          history: [log1, ...c.history],
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return c;
    });

    saveState(updated);
    alert(`Contrato de "${client.name}" renovado com sucesso! O cliente retornou automaticamente para a Etapa 4 (Fazer e enviar contrato).`);
    setIsModalOpen(false);
    setSelectedClient(null);
  };

  // Filter clients by search query
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.responsible?.toLowerCase().includes(search.toLowerCase()) ||
    c.status.toLowerCase().includes(search.toLowerCase())
  );

  // Stats computation for Cone view
  const getStageStats = (stageId: number) => {
    const count = clients.filter(c => c.stageId === stageId).length;
    
    // Conversion rate based on the previous stage count
    let conversionRate = 100;
    if (stageId > 1) {
      const prevCount = clients.filter(c => c.stageId === stageId - 1).length;
      if (prevCount > 0) {
        conversionRate = Math.round((count / prevCount) * 100);
      } else {
        conversionRate = count > 0 ? 100 : 0;
      }
    }

    // List of responsibles in this stage
    const stageClients = clients.filter(c => c.stageId === stageId);
    const responsibles = Array.from(new Set(stageClients.map(c => c.responsible).filter(Boolean)));
    const avgTime = stageClients.length > 0
      ? Math.round(stageClients.reduce((acc, c) => acc + c.timeInStage, 0) / stageClients.length)
      : 0;

    return { count, conversionRate, responsibles, avgTime };
  };

  return (
    <div className="w-full min-h-screen p-4 md:p-8 animate-page custom-scrollbar">
      
      {/* Header section */}
      <header className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-brand-border/40 pb-6">
        <div>
          <div className="flex items-center gap-2 text-brand-primary mb-1">
            <Layers className="animate-pulse" size={20} />
            <span className="text-sm font-semibold tracking-wider uppercase">Operação Comercial</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Funil de Vendas</h1>
          <p className="text-brand-muted mt-1 max-w-xl">
            Acompanhe a jornada operacional e comercial dos clientes da Amitai, da primeira abordagem ao fechamento e retenção.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* View toggle tabs */}
          <div className="bg-brand-card p-1 rounded-xl border border-brand-border flex w-full sm:w-auto">
            <button 
              onClick={() => setActiveTab('board')}
              className={`flex-1 sm:flex-none py-2 px-4 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === 'board' 
                  ? 'bg-brand-primary-dim text-brand-primary font-semibold shadow-inner' 
                  : 'text-brand-muted hover:text-white'
              }`}
            >
              <Layers size={16} />
              Kanban
            </button>
            <button 
              onClick={() => setActiveTab('cone')}
              className={`flex-1 sm:flex-none py-2 px-4 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === 'cone' 
                  ? 'bg-brand-primary-dim text-brand-primary font-semibold shadow-inner' 
                  : 'text-brand-muted hover:text-white'
              }`}
            >
              <TrendingUp size={16} />
              Funil (Cone)
            </button>
          </div>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto bg-brand-primary hover:bg-brand-primary-hover text-brand-bg font-bold py-2.5 px-5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer transform active:scale-95 shadow-md shadow-brand-primary/10"
          >
            <Plus size={18} />
            Adicionar Lead
          </button>
        </div>
      </header>

      {/* Global Filter Bar */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between bg-brand-card/30 p-4 rounded-2xl border border-brand-border/60">
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input 
            type="text" 
            placeholder="Buscar por cliente, responsável..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-brand-primary/50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-4 text-xs text-brand-muted">
          <span className="flex items-center gap-1.5"><Users size={14} /> Total: <strong className="text-white">{clients.length}</strong></span>
          <span className="flex items-center gap-1.5"><CheckCircle size={14} /> Ativos: <strong className="text-brand-primary">{clients.filter(c => c.stageId >= 4 && c.stageId <= 10).length}</strong></span>
        </div>
      </div>

      {/* RENDER KANBAN BOARD */}
      {activeTab === 'board' && (
        <div className="flex gap-4 overflow-x-auto pb-6 pt-2 custom-scrollbar min-h-[600px] snap-x snap-mandatory">
          {STAGES.map(stage => {
            const stageClients = filteredClients.filter(c => c.stageId === stage.id);
            const stats = getStageStats(stage.id);

            return (
              <div 
                key={stage.id} 
                className="w-80 shrink-0 bg-brand-card/40 rounded-2xl border border-brand-border flex flex-col max-h-[700px] snap-start"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                {/* Stage Header */}
                <div className={`p-4 border-b border-brand-border rounded-t-2xl bg-brand-card/90 ${stage.color} flex flex-col gap-1`}>
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm tracking-wide truncate max-w-[200px]" title={stage.name}>
                      {stage.name}
                    </h3>
                    <span className="text-xs bg-brand-bg border border-brand-border text-brand-muted px-2 py-0.5 rounded-full font-bold">
                      {stageClients.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-brand-muted truncate" title={stage.desc}>
                    {stage.desc}
                  </p>
                  
                  {/* Minified metric values */}
                  {stageClients.length > 0 && (
                    <div className="flex items-center gap-3 text-[10px] text-brand-primary font-medium mt-1">
                      <span>Conversão: {stats.conversionRate}%</span>
                      {stats.avgTime > 0 && <span>Média: {stats.avgTime}d parado</span>}
                    </div>
                  )}
                </div>

                {/* Stage Body - Card list */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar min-h-[150px]">
                  {stageClients.length === 0 ? (
                    <div className="h-28 flex flex-col items-center justify-center border border-dashed border-brand-border/40 rounded-xl text-center p-4">
                      <p className="text-xs text-brand-muted/60">Arraste um lead ou clique em "Adicionar" para preencher esta etapa.</p>
                    </div>
                  ) : (
                    stageClients.map(client => {
                      const completedTasks = client.tasks.filter(t => t.completed).length;
                      const totalTasks = client.tasks.length;
                      
                      return (
                        <div 
                          key={client.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, client.id)}
                          onClick={() => {
                            setSelectedClient(client);
                            setIsModalOpen(true);
                          }}
                          className="bg-brand-card border border-brand-border hover:border-brand-primary/30 rounded-xl p-4 cursor-grab active:cursor-grabbing hover:-translate-y-0.5 transition-all duration-300 shadow-md group relative hover:shadow-brand-primary/5"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              client.status === 'Concluído' ? 'bg-emerald-500/10 text-emerald-400' :
                              client.status === 'Crítico' ? 'bg-red-500/10 text-red-400' :
                              client.status === 'Pendente' ? 'bg-amber-500/10 text-amber-400' :
                              'bg-brand-primary-dim text-brand-primary'
                            }`}>
                              {client.status}
                            </span>
                            
                            {client.timeInStage > 5 && (
                              <span className="flex items-center gap-1 text-[10px] text-brand-danger font-medium" title="Tempo parado longo!">
                                <Clock size={12} />
                                {client.timeInStage} dias
                              </span>
                            )}
                          </div>

                          <h4 className="font-semibold text-white text-sm group-hover:text-brand-primary transition-colors pr-6">
                            {client.name}
                          </h4>

                          {/* Quick context info inside the card based on Stage */}
                          <div className="mt-3 pt-3 border-t border-brand-border/40 text-[11px] text-brand-muted space-y-1">
                            {client.responsible && (
                              <div className="flex justify-between">
                                <span>Responsável:</span>
                                <span className="text-white font-medium">{client.responsible}</span>
                              </div>
                            )}
                            
                            {/* Prospecção orig */}
                            {client.stageId === 1 && client.origin && (
                              <div className="flex justify-between">
                                <span>Origem:</span>
                                <span className="text-white">{client.origin}</span>
                              </div>
                            )}

                            {/* Meeting details */}
                            {client.stageId === 2 && client.meetingDate && (
                              <div className="flex justify-between">
                                <span>Call:</span>
                                <span className="text-brand-primary font-medium">{client.meetingDate.split('-').reverse().join('/')} às {client.meetingTime}</span>
                              </div>
                            )}

                            {/* Negotiation value */}
                            {client.stageId === 3 && client.contractValue && (
                              <div className="flex justify-between">
                                <span>Valor:</span>
                                <span className="text-emerald-400 font-bold">{client.contractValue}</span>
                              </div>
                            )}

                            {/* Active execution progress */}
                            {client.stageId === 7 && client.progress !== undefined && (
                              <div className="mt-2">
                                <div className="flex justify-between text-[10px] mb-1">
                                  <span>Progresso operacional:</span>
                                  <span className="text-brand-primary font-semibold">{client.progress}%</span>
                                </div>
                                <div className="w-full bg-brand-bg h-1.5 rounded-full overflow-hidden border border-brand-border">
                                  <div className="bg-brand-primary h-full transition-all duration-500" style={{ width: `${client.progress}%` }}></div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Details Trigger */}
                          <div className="mt-3 flex justify-between items-center text-[10px] text-brand-muted">
                            <span className="flex items-center gap-1">
                              <CheckSquare size={12} />
                              {completedTasks}/{totalTasks} tarefas
                            </span>
                            <span className="text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-bold">
                              Ver Detalhes <Eye size={10} />
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Quick Add at bottom */}
                <div className="p-3 border-t border-brand-border/40 bg-brand-card/20 rounded-b-2xl">
                  <button 
                    onClick={() => {
                      setNewClientStage(stage.id);
                      setIsAddModalOpen(true);
                    }}
                    className="w-full py-1.5 border border-dashed border-brand-border hover:border-brand-primary/40 hover:bg-brand-card/40 rounded-xl text-xs text-brand-muted hover:text-white transition-all flex items-center justify-center gap-1"
                  >
                    <Plus size={14} />
                    Novo nesta Etapa
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RENDER CONE/FUNNEL VISUALIZATION */}
      {activeTab === 'cone' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* The cone structure */}
          <div className="xl:col-span-2 glass-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="text-brand-primary" />
                <h2 className="text-xl font-bold text-white">Visualização de Funil Estrutural (Cone)</h2>
              </div>
              <p className="text-xs text-brand-muted mb-8">
                As etapas comerciais e operacionais afunilam conforme os clientes progridem. As primeiras etapas representam maior volume de leads abordados, enquanto as últimas refletem o fechamento qualificado e operacionalizado.
              </p>
              
              {/* Cone visual segments stacked */}
              <div className="space-y-2 select-none">
                {STAGES.map((stage, idx) => {
                  const stats = getStageStats(stage.id);
                  // Calculate dynamic width. Etapa 1 is 100%, and each drops.
                  // For a nice cone curve, we compute the percentage based on stage rank
                  const baseWidth = 100 - (idx * 6.5); // Etapa 1 = 100%, Etapa 12 = 28%
                  const widthPercent = Math.max(baseWidth, 30);
                  
                  return (
                    <div 
                      key={stage.id} 
                      className="flex items-center justify-between group cursor-pointer"
                      onClick={() => {
                        // Filter by this stage
                        setSearch(stage.name);
                        setActiveTab('board');
                      }}
                    >
                      {/* Name of stage on the left */}
                      <span className="w-48 text-xs font-semibold text-brand-muted group-hover:text-brand-primary transition-colors truncate pr-2">
                        {stage.id}ª. {stage.name}
                      </span>
                      
                      {/* Funnel Segment representation */}
                      <div className="flex-1 flex justify-center">
                        <div 
                          className={`py-2.5 px-4 bg-brand-card hover:bg-brand-card-hover border border-brand-border rounded-xl transition-all duration-300 relative group-hover:border-brand-primary/30 flex justify-between items-center text-xs font-medium`}
                          style={{ width: `${widthPercent}%` }}
                        >
                          {/* Segment line background highlight */}
                          <div className={`absolute top-0 left-0 bottom-0 w-1 ${stage.color.split(' ')[0]} rounded-l-xl`}></div>
                          
                          <span className="text-white font-semibold flex items-center gap-1.5">
                            {stage.optional && <span className="text-[9px] bg-brand-border text-brand-muted px-1.5 py-0.5 rounded uppercase font-bold">Opcional</span>}
                            <span>{stats.count} {stats.count === 1 ? 'cliente' : 'clientes'}</span>
                          </span>
                          
                          {/* Conversion metric on funnel segment */}
                          <span className="text-[10px] text-brand-primary font-bold">
                            {idx > 0 ? `▲ ${stats.conversionRate}%` : 'Entrada'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar stats & indicators */}
          <div className="space-y-6">
            
            {/* Quick Metrics */}
            <div className="glass-card p-6">
              <h3 className="font-bold text-white text-md mb-4 flex items-center gap-2">
                <Activity className="text-brand-primary" />
                Métricas Rápidas do Funil
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-brand-bg rounded-xl border border-brand-border flex justify-between items-center">
                  <div>
                    <span className="text-[11px] text-brand-muted block uppercase font-semibold">Prospecção Ativa (Etapas 1-3)</span>
                    <span className="text-2xl font-black text-white">{clients.filter(c => c.stageId <= 3).length} Leads</span>
                  </div>
                  <Users className="text-cyan-400 opacity-60" size={28} />
                </div>

                <div className="p-4 bg-brand-bg rounded-xl border border-brand-border flex justify-between items-center">
                  <div>
                    <span className="text-[11px] text-brand-muted block uppercase font-semibold">Em Onboarding & Setup (Etapas 4-6)</span>
                    <span className="text-2xl font-black text-white">{clients.filter(c => c.stageId >= 4 && c.stageId <= 6).length} Clientes</span>
                  </div>
                  <FileText className="text-indigo-400 opacity-60" size={28} />
                </div>

                <div className="p-4 bg-brand-bg rounded-xl border border-brand-border flex justify-between items-center">
                  <div>
                    <span className="text-[11px] text-brand-muted block uppercase font-semibold">Em Execução & Retenção (Etapas 7-12)</span>
                    <span className="text-2xl font-black text-white">{clients.filter(c => c.stageId >= 7).length} Clientes</span>
                  </div>
                  <HeartHandshake className="text-emerald-400 opacity-60" size={28} />
                </div>
              </div>
            </div>

            {/* Stage Quick Help list */}
            <div className="glass-card p-6 max-h-[400px] overflow-y-auto custom-scrollbar">
              <h3 className="font-bold text-white text-md mb-4 flex items-center gap-2">
                <Layers className="text-brand-primary" />
                Descrição das Etapas
              </h3>
              <div className="space-y-4 text-xs">
                {STAGES.map(s => (
                  <div key={s.id} className="border-b border-brand-border/40 pb-3">
                    <h4 className="font-bold text-white flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${s.color.split(' ')[0]}`}></span>
                      {s.id}. {s.name}
                    </h4>
                    <p className="text-brand-muted mt-1 leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* RENDER MODAL: EDIT LEAD DETAILS */}
      {isModalOpen && selectedClient && (
        <div className="fixed inset-0 bg-brand-bg/85 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-brand-card border border-brand-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-300">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-brand-border bg-brand-card/90 flex justify-between items-center sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-brand-primary-dim text-brand-primary`}>
                  <Users size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-brand-primary font-bold">Cliente ID: #{selectedClient.id}</span>
                    <span className="text-xs text-brand-muted">• Criado em {selectedClient.createdAt.split('-').reverse().join('/')}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mt-0.5">{selectedClient.name}</h2>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedClient(null);
                }}
                className="text-brand-muted hover:text-white p-1 rounded-lg hover:bg-brand-card-hover transition-colors cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-8 flex-1">
              
              {/* Top Controls Grid: Stage and Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-brand-bg/50 p-4 rounded-xl border border-brand-border/60">
                <div>
                  <label className="block text-xs font-semibold text-brand-muted uppercase mb-1.5">Etapa do Funil</label>
                  <select 
                    value={selectedClient.stageId}
                    onChange={(e) => {
                      const targetStageId = Number(e.target.value);
                      const currentClient = selectedClient;
                      const sourceStage = STAGES.find(s => s.id === currentClient.stageId)?.name || 'Desconhecida';
                      const targetStage = STAGES.find(s => s.id === targetStageId)?.name || 'Desconhecida';
                      const timestamp = new Date().toLocaleString('pt-BR', { hour12: false }).replace(',', '');
                      const newLog = {
                        timestamp,
                        action: `Etapa alterada manualmente no painel para "${targetStage}"`,
                        user: currentClient.responsible || 'Sistema'
                      };
                      
                      const updated = clients.map(c => {
                        if (c.id === currentClient.id) {
                          return {
                            ...c,
                            stageId: targetStageId,
                            timeInStage: 0,
                            history: [newLog, ...c.history],
                            lastUpdated: new Date().toISOString().split('T')[0]
                          };
                        }
                        return c;
                      });
                      saveState(updated);
                      const sync = updated.find(c => c.id === currentClient.id);
                      if (sync) setSelectedClient(sync);
                    }}
                    className="w-full bg-brand-card border border-brand-border rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:border-brand-primary"
                  >
                    {STAGES.map(s => (
                      <option key={s.id} value={s.id}>{s.id}. {s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-muted uppercase mb-1.5">Status Geral</label>
                  <select 
                    value={selectedClient.status}
                    onChange={(e) => updateClientField(selectedClient.id, 'status', e.target.value)}
                    className="w-full bg-brand-card border border-brand-border rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:border-brand-primary"
                  >
                    <option value="Em andamento">🟢 Em andamento</option>
                    <option value="Concluído">🔵 Concluído</option>
                    <option value="Pendente">🟡 Pendente</option>
                    <option value="Crítico">🔴 Crítico</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-muted uppercase mb-1.5">Responsável Principal</label>
                  <select 
                    value={selectedClient.responsible || 'Neto'}
                    onChange={(e) => updateClientField(selectedClient.id, 'responsible', e.target.value)}
                    className="w-full bg-brand-card border border-brand-border rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:border-brand-primary"
                  >
                    <option value="Neto">Neto (Tecnologia/Infra)</option>
                    <option value="Gabriel">Gabriel (Prospecção/LinkedIn)</option>
                    <option value="Manu">Manu (Prospecção/Whats/Suporte)</option>
                  </select>
                </div>
              </div>

              {/* RENDER STAGE-SPECIFIC CUSTOM FIELDS */}
              <div className="glass-card p-6 bg-brand-card/60 relative">
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-brand-primary rounded-l-xl"></div>
                <h3 className="font-extrabold text-white text-md mb-6 uppercase tracking-wider flex items-center gap-2">
                  <Activity size={18} className="text-brand-primary" />
                  Informações da Etapa Atual: {STAGES.find(s => s.id === selectedClient.stageId)?.name}
                </h3>
                
                {/* 1ª ETAPA — RESPOSTA À PROSPECÇÃO */}
                {selectedClient.stageId === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                      <label className="block text-xs font-medium text-brand-muted mb-1.5">Origem da Prospecção</label>
                      <input 
                        type="text" 
                        value={selectedClient.origin || ''} 
                        onChange={(e) => updateClientField(selectedClient.id, 'origin', e.target.value)}
                        placeholder="Ex: WhatsApp, LinkedIn, Instagram..."
                        className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-brand-muted mb-1.5">Data do Primeiro Contato</label>
                      <input 
                        type="date" 
                        value={selectedClient.contactDate || ''} 
                        onChange={(e) => updateClientField(selectedClient.id, 'contactDate', e.target.value)}
                        className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-brand-muted mb-1.5">Status da Conversa</label>
                      <input 
                        type="text" 
                        value={selectedClient.conversationStatus || ''} 
                        onChange={(e) => updateClientField(selectedClient.id, 'conversationStatus', e.target.value)}
                        placeholder="Ex: Respondeu positivamente, solicitou portfólio comercial..."
                        className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                  </div>
                )}

                {/* 2ª ETAPA — FECHAR REUNIÃO */}
                {selectedClient.stageId === 2 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div>
                      <label className="block text-xs font-medium text-brand-muted mb-1.5">Data da Reunião</label>
                      <input 
                        type="date" 
                        value={selectedClient.meetingDate || ''} 
                        onChange={(e) => updateClientField(selectedClient.id, 'meetingDate', e.target.value)}
                        className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-brand-muted mb-1.5">Horário da Call</label>
                      <input 
                        type="time" 
                        value={selectedClient.meetingTime || ''} 
                        onChange={(e) => updateClientField(selectedClient.id, 'meetingTime', e.target.value)}
                        className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-brand-muted mb-1.5">Status do Agendamento</label>
                      <select 
                        value={selectedClient.bookingStatus || 'Aguardando confirmação'} 
                        onChange={(e) => updateClientField(selectedClient.id, 'bookingStatus', e.target.value)}
                        className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-primary"
                      >
                        <option value="Aguardando confirmação">Aguardando confirmação</option>
                        <option value="Confirmada">Confirmada no Calendário</option>
                        <option value="Cancelada/Reagendar">Cancelada / Reagendar</option>
                      </select>
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-xs font-medium text-brand-muted mb-1.5">Link da Reunião (Google Meet / Zoom)</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={selectedClient.meetingLink || ''} 
                          onChange={(e) => updateClientField(selectedClient.id, 'meetingLink', e.target.value)}
                          placeholder="https://meet.google.com/..."
                          className="flex-1 bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-primary text-xs"
                        />
                        {selectedClient.meetingLink && (
                          <a 
                            href={selectedClient.meetingLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-brand-primary hover:bg-brand-primary-hover text-brand-bg py-2 px-4 rounded-xl flex items-center justify-center font-bold text-xs"
                          >
                            <LinkIcon size={14} /> Abrir Call
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3ª ETAPA — FECHAR CLIENTE */}
                {selectedClient.stageId === 3 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                      <label className="block text-xs font-medium text-brand-muted mb-1.5">Valor Proposto do Contrato (Mensal)</label>
                      <div className="relative">
                        <DollarSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
                        <input 
                          type="text" 
                          value={selectedClient.contractValue || ''} 
                          onChange={(e) => updateClientField(selectedClient.id, 'contractValue', e.target.value)}
                          placeholder="R$ 5.000,00"
                          className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 pl-9 pr-3 text-white focus:outline-none focus:border-brand-primary"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-brand-muted mb-1.5">Previsão de Fechamento</label>
                      <input 
                        type="date" 
                        value={selectedClient.forecastDate || ''} 
                        onChange={(e) => updateClientField(selectedClient.id, 'forecastDate', e.target.value)}
                        className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-brand-muted mb-1.5">Proposta Enviada?</label>
                      <select 
                        value={selectedClient.proposalSent ? 'Sim' : 'Não'} 
                        onChange={(e) => updateClientField(selectedClient.id, 'proposalSent', e.target.value === 'Sim')}
                        className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-primary"
                      >
                        <option value="Não">Não</option>
                        <option value="Sim">Sim, proposta em PDF enviada</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-brand-muted mb-1.5">Objeções Levantadas pelo Lead</label>
                      <input 
                        type="text" 
                        value={selectedClient.objections || ''} 
                        onChange={(e) => updateClientField(selectedClient.id, 'objections', e.target.value)}
                        placeholder="Ex: Acharam caro, pediram desconto no setup..."
                        className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                  </div>
                )}

                {/* 4ª ETAPA — FAZER E ENVIAR CONTRATO */}
                {selectedClient.stageId === 4 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                      <label className="block text-xs font-medium text-brand-muted mb-1.5">Nome do Contrato / Documento</label>
                      <input 
                        type="text" 
                        value={selectedClient.contractName || ''} 
                        onChange={(e) => updateClientField(selectedClient.id, 'contractName', e.target.value)}
                        placeholder="Ex: Contrato de Prestação de Serviços Amitai - 6 meses"
                        className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-brand-muted mb-1.5">Status da Assinatura</label>
                      <select 
                        value={selectedClient.signatureStatus || 'Aguardando Assinatura'} 
                        onChange={(e) => updateClientField(selectedClient.id, 'signatureStatus', e.target.value)}
                        className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-primary"
                      >
                        <option value="Pendente Preparação">Pendente Preparação</option>
                        <option value="Aguardando Assinatura">Aguardando Assinatura</option>
                        <option value="Assinado">Assinado e Arquivado</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-brand-muted mb-1.5">Data de Envio do Contrato</label>
                      <input 
                        type="date" 
                        value={selectedClient.sendDate || ''} 
                        onChange={(e) => updateClientField(selectedClient.id, 'sendDate', e.target.value)}
                        className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                  </div>
                )}

                {/* 5ª ETAPA — CRIAR ATIVOS */}
                {selectedClient.stageId === 5 && (
                  <div className="space-y-4 text-sm">
                    <label className="block text-xs font-bold text-brand-muted uppercase">Checklist de Ativos Obrigatórios</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-brand-bg/40 p-4 rounded-xl border border-brand-border">
                      {selectedClient.assetsChecklist?.map(asset => (
                        <div key={asset.id} className="flex items-center gap-3 py-1">
                          <input 
                            type="checkbox"
                            checked={asset.completed}
                            onChange={(e) => handleAssetCheck(selectedClient.id, asset.id, e.target.checked)}
                            className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary bg-brand-bg border-brand-border"
                          />
                          <span className={`${asset.completed ? 'line-through text-brand-muted' : 'text-white'} text-xs font-medium`}>
                            {asset.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6ª ETAPA — ESTUDO DO CLIENTE */}
                {selectedClient.stageId === 6 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                      <label className="block text-xs font-medium text-brand-muted mb-1.5">Nicho de Mercado</label>
                      <input 
                        type="text" 
                        value={selectedClient.niche || ''} 
                        onChange={(e) => updateClientField(selectedClient.id, 'niche', e.target.value)}
                        placeholder="Ex: Odontologia Estética, E-commerce de Jóias"
                        className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-brand-muted mb-1.5">Público-Alvo</label>
                      <input 
                        type="text" 
                        value={selectedClient.targetAudience || ''} 
                        onChange={(e) => updateClientField(selectedClient.id, 'targetAudience', e.target.value)}
                        placeholder="Mulheres de 25-45 anos interessadas em autocuidado"
                        className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-brand-muted mb-1.5">Concorrentes Principais</label>
                      <input 
                        type="text" 
                        value={selectedClient.competitors || ''} 
                        onChange={(e) => updateClientField(selectedClient.id, 'competitors', e.target.value)}
                        placeholder="Empresa X, Marca Y"
                        className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-brand-muted mb-1.5">Diferenciais Operacionais</label>
                      <input 
                        type="text" 
                        value={selectedClient.differentials || ''} 
                        onChange={(e) => updateClientField(selectedClient.id, 'differentials', e.target.value)}
                        placeholder="Suporte humanizado rápido, atendimento premium"
                        className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-brand-muted mb-1.5">Dores principais do cliente</label>
                      <input 
                        type="text" 
                        value={selectedClient.pains || ''} 
                        onChange={(e) => updateClientField(selectedClient.id, 'pains', e.target.value)}
                        placeholder="Falta de constância no WhatsApp, leads desqualificados"
                        className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-brand-muted mb-1.5">Breve Planejamento de Estratégia de Mkt</label>
                      <textarea 
                        value={selectedClient.strategies || ''} 
                        onChange={(e) => updateClientField(selectedClient.id, 'strategies', e.target.value)}
                        placeholder="Subir funil de anúncios segmentados focando nas dores, automatizar respostas no direct..."
                        rows={3}
                        className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-primary text-xs"
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-3">
                      <input 
                        type="checkbox"
                        checked={selectedClient.briefingComplete || false}
                        onChange={(e) => updateClientField(selectedClient.id, 'briefingComplete', e.target.checked)}
                        className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary bg-brand-bg border-brand-border"
                      />
                      <span className="text-xs font-semibold text-white">Dossiê e Briefing estratégico concluído?</span>
                    </div>
                  </div>
                )}

                {/* 7ª ETAPA — EXECUÇÃO DOS SERVIÇOS */}
                {selectedClient.stageId === 7 && (
                  <div className="space-y-6 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-medium text-brand-muted mb-1.5">Serviços Ativos Contratados</label>
                        <input 
                          type="text" 
                          value={selectedClient.activeServices || ''} 
                          onChange={(e) => updateClientField(selectedClient.id, 'activeServices', e.target.value)}
                          placeholder="Ex: Tráfego Pago, Gestão de Instagram..."
                          className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-brand-muted mb-1.5">Prazo de Entrega do Ciclo Operacional</label>
                        <input 
                          type="date" 
                          value={selectedClient.deadline || ''} 
                          onChange={(e) => updateClientField(selectedClient.id, 'deadline', e.target.value)}
                          className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-brand-muted uppercase">Checklist Operacional de Atividades</label>
                        <span className="text-xs text-brand-primary font-bold">{selectedClient.progress || 0}% Concluído</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-brand-bg/40 p-4 rounded-xl border border-brand-border mb-3">
                        {selectedClient.operationalChecklist?.map(opItem => (
                          <div key={opItem.id} className="flex items-center gap-3 py-1">
                            <input 
                              type="checkbox"
                              checked={opItem.completed}
                              onChange={(e) => handleOperationalCheck(selectedClient.id, opItem.id, e.target.checked)}
                              className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary bg-brand-bg border-brand-border"
                            />
                            <span className={`${opItem.completed ? 'line-through text-brand-muted font-normal' : 'text-white font-medium'} text-xs`}>
                              {opItem.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 8ª ETAPA — SUPORTE AO CLIENTE */}
                {selectedClient.stageId === 8 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                      <label className="block text-xs font-medium text-brand-muted mb-1.5">Solicitação Pendente do Cliente</label>
                      <input 
                        type="text" 
                        value={selectedClient.requests || ''} 
                        onChange={(e) => updateClientField(selectedClient.id, 'requests', e.target.value)}
                        placeholder="Ex: Precisa de alteração na landing page urgente"
                        className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-brand-muted mb-1.5">Prioridade do Chamado</label>
                      <select 
                        value={selectedClient.priority || 'Média'} 
                        onChange={(e: any) => updateClientField(selectedClient.id, 'priority', e.target.value)}
                        className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-primary"
                      >
                        <option value="Baixa">🟢 Baixa</option>
                        <option value="Média">🟡 Média</option>
                        <option value="Alta">🔴 Alta</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 9ª ETAPA — ENTREGA DOS SERVIÇOS + RETENÇÃO */}
                {selectedClient.stageId === 9 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                      <label className="block text-xs font-medium text-brand-muted mb-1.5">Entregas Realizadas no Ciclo</label>
                      <input 
                        type="text" 
                        value={selectedClient.deliveries || ''} 
                        onChange={(e) => updateClientField(selectedClient.id, 'deliveries', e.target.value)}
                        placeholder="Ex: Landing Page concluída, 15 criativos publicados..."
                        className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-brand-muted mb-1.5">Principais Resultados Gerados</label>
                      <input 
                        type="text" 
                        value={selectedClient.results || ''} 
                        onChange={(e) => updateClientField(selectedClient.id, 'results', e.target.value)}
                        placeholder="Ex: ROI 3.5, +120 leads qualificados no mês..."
                        className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-brand-muted mb-1.5">Feedback Geral do Cliente</label>
                      <input 
                        type="text" 
                        value={selectedClient.feedback || ''} 
                        onChange={(e) => updateClientField(selectedClient.id, 'feedback', e.target.value)}
                        placeholder="Ex: Cliente satisfeito, solicitou aumento de investimento em anúncios"
                        className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                  </div>
                )}

                {/* 10ª ETAPA — ENTREGA DO RELATÓRIO MENSAL */}
                {selectedClient.stageId === 10 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                      <label className="block text-xs font-medium text-brand-muted mb-1.5">Nome/Link do Relatório Mensal</label>
                      <input 
                        type="text" 
                        value={selectedClient.reportName || ''} 
                        onChange={(e) => updateClientField(selectedClient.id, 'reportName', e.target.value)}
                        placeholder="Ex: Relatório Mensal Maio/2026 PDF"
                        className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-brand-muted mb-1.5">Data Limite de Entrega</label>
                      <input 
                        type="date" 
                        value={selectedClient.deliveryDate || ''} 
                        onChange={(e) => updateClientField(selectedClient.id, 'deliveryDate', e.target.value)}
                        className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-brand-muted mb-1.5">Métricas Principais Destacadas</label>
                      <input 
                        type="text" 
                        value={selectedClient.metrics || ''} 
                        onChange={(e) => updateClientField(selectedClient.id, 'metrics', e.target.value)}
                        placeholder="CPA: R$ 8.50, Cliques: 4500, Conversão: 4.2%"
                        className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-primary text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* 11ª ETAPA — FEEDBACK DE CANCELAMENTO */}
                {selectedClient.stageId === 11 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                      <label className="block text-xs font-medium text-brand-muted mb-1.5">Motivo Principal do Cancelamento (Churn)</label>
                      <input 
                        type="text" 
                        value={selectedClient.cancelReason || ''} 
                        onChange={(e) => updateClientField(selectedClient.id, 'cancelReason', e.target.value)}
                        placeholder="Ex: Problema financeiro da empresa, desalinhamento..."
                        className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-primary animate-pulse text-brand-danger border-brand-danger/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-brand-muted mb-1.5">Erros Identificados pela Equipe Amitai</label>
                      <input 
                        type="text" 
                        value={selectedClient.errorsIdentified || ''} 
                        onChange={(e) => updateClientField(selectedClient.id, 'errorsIdentified', e.target.value)}
                        placeholder="Ex: Demora de resposta na criação dos ativos"
                        className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-brand-muted mb-1.5">Feedback Direto do Cliente</label>
                      <textarea 
                        value={selectedClient.cancelFeedback || ''} 
                        onChange={(e) => updateClientField(selectedClient.id, 'cancelFeedback', e.target.value)}
                        placeholder="O que o cliente alegou para sair..."
                        rows={2}
                        className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-white focus:outline-none focus:border-brand-primary text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* 12ª ETAPA — RENOVAÇÃO DE CONTRATO (MANDATORY OPERATIONAL FEATURE!) */}
                {selectedClient.stageId === 12 && (
                  <div className="p-4 bg-brand-bg/50 border border-brand-primary/20 rounded-xl text-center space-y-4">
                    <p className="text-xs text-brand-muted max-w-lg mx-auto">
                      O cliente concluiu com sucesso o seu ciclo operacional na Amitai e está qualificado para a renovação. 
                    </p>
                    <div className="border-t border-brand-border/40 my-4"></div>
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                      <button 
                        onClick={() => handleRenewContract(selectedClient)}
                        className="bg-brand-primary hover:bg-brand-primary-hover text-brand-bg font-bold py-2.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer transform active:scale-95 text-xs shadow-md shadow-brand-primary/10"
                      >
                        <RefreshCw size={14} className="animate-spin" />
                        Confirmar Renovação de Contrato
                      </button>
                    </div>
                    <p className="text-[10px] text-brand-muted italic mt-2">
                      💡 Ao confirmar a renovação, o sistema mudará o cliente automaticamente para a **Etapa 4: Fazer e enviar contrato** para início de um novo ciclo comercial.
                    </p>
                  </div>
                )}

              </div>

              {/* SHARED GENERAL FIELDS: OBSERVATIONS AND MANUAL TASKS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* General Observations */}
                <div className="glass-card p-6">
                  <h4 className="font-bold text-white text-sm mb-3">Observações Gerais</h4>
                  <textarea 
                    value={selectedClient.observations || ''}
                    onChange={(e) => updateClientField(selectedClient.id, 'observations', e.target.value)}
                    placeholder="Adicione observações de comportamento, informações pontuais..."
                    rows={6}
                    className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-brand-primary"
                  />
                </div>

                {/* Specific Pending Stage Tasks */}
                <div className="glass-card p-6 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-1.5">
                      <CheckSquare size={16} className="text-brand-primary" />
                      Tarefas Pendentes
                    </h4>
                    
                    <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-1 mb-4">
                      {selectedClient.tasks.length === 0 ? (
                        <p className="text-xs text-brand-muted italic">Nenhuma tarefa cadastrada.</p>
                      ) : (
                        selectedClient.tasks.map(t => (
                          <div key={t.id} className="flex items-center justify-between bg-brand-bg/50 p-2 rounded-lg border border-brand-border/40">
                            <div className="flex items-center gap-2">
                              <input 
                                type="checkbox"
                                checked={t.completed}
                                onChange={(e) => handleTaskToggle(selectedClient.id, t.id, e.target.checked)}
                                className="w-3.5 h-3.5 rounded text-brand-primary focus:ring-brand-primary bg-brand-bg border-brand-border"
                              />
                              <span className={`text-xs ${t.completed ? 'line-through text-brand-muted' : 'text-white'}`}>
                                {t.text}
                              </span>
                            </div>
                            
                            <button 
                              onClick={() => {
                                const newTasks = selectedClient.tasks.filter(item => item.id !== t.id);
                                updateClientField(selectedClient.id, 'tasks', newTasks);
                              }}
                              className="text-brand-danger/60 hover:text-brand-danger p-0.5"
                              title="Deletar tarefa"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Add Task input */}
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const input = (e.target as any).taskInput;
                    handleAddTask(selectedClient.id, input.value);
                    input.value = '';
                  }} className="flex gap-2">
                    <input 
                      type="text"
                      name="taskInput"
                      placeholder="Nova tarefa operacional..."
                      className="flex-1 bg-brand-bg border border-brand-border rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none focus:border-brand-primary"
                    />
                    <button 
                      type="submit"
                      className="bg-brand-primary-dim hover:bg-brand-primary hover:text-brand-bg text-brand-primary py-1.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Criar
                    </button>
                  </form>
                </div>

              </div>

              {/* TIMELINE HISTORY LOGS */}
              <div className="glass-card p-6">
                <h4 className="font-bold text-white text-sm mb-4 flex items-center gap-1.5">
                  <Activity size={16} className="text-brand-primary" />
                  Histórico de Alterações do Lead
                </h4>
                
                <div className="space-y-4 border-l border-brand-border pl-4 max-h-[220px] overflow-y-auto custom-scrollbar">
                  {selectedClient.history.map((log, idx) => (
                    <div key={idx} className="relative py-1">
                      {/* Timeline dot */}
                      <span className="absolute -left-[21px] top-2.5 w-2 h-2 rounded-full bg-brand-primary glow-primary"></span>
                      
                      <div className="text-[10px] text-brand-muted">
                        {log.timestamp} • por <strong className="text-white">{log.user}</strong>
                      </div>
                      <div className="text-xs text-white font-medium mt-0.5">
                        {log.action}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-brand-border bg-brand-card/90 flex justify-between items-center">
              <button 
                onClick={() => handleDeleteClient(selectedClient.id)}
                className="bg-brand-danger-dim hover:bg-brand-danger text-brand-danger hover:text-white font-bold py-2 px-4 rounded-xl transition-all duration-300 flex items-center gap-1.5 text-xs cursor-pointer"
              >
                <Trash2 size={14} />
                Excluir Lead
              </button>
              
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedClient(null);
                }}
                className="bg-brand-primary hover:bg-brand-primary-hover text-brand-bg font-bold py-2.5 px-6 rounded-xl transition-all duration-300 text-xs shadow-md shadow-brand-primary/10"
              >
                Salvar e Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* RENDER MODAL: ADD NEW LEAD / CLIENT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-brand-bg/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-brand-card border border-brand-border rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            
            <div className="p-6 border-b border-brand-border flex justify-between items-center bg-brand-card/90 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Plus className="text-brand-primary" />
                <h2 className="text-xl font-bold text-white">Adicionar Novo Lead ao Funil</h2>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-brand-muted hover:text-white p-1 rounded-lg hover:bg-brand-card-hover transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddClient}>
              <div className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-brand-muted uppercase mb-1.5">Nome do Lead / Empresa *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: Indústria Beta S/A"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-brand-muted uppercase mb-1.5">Etapa Inicial no Funil</label>
                  <select 
                    value={newClientStage}
                    onChange={(e) => setNewClientStage(Number(e.target.value))}
                    className="w-full bg-brand-bg border border-brand-border rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-brand-primary"
                  >
                    {STAGES.map(s => (
                      <option key={s.id} value={s.id}>{s.id}ª Etapa — {s.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-brand-muted uppercase mb-1.5">Responsável</label>
                    <select 
                      value={newClientResponsible}
                      onChange={(e) => setNewClientResponsible(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-border rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-brand-primary"
                    >
                      <option value="Neto">Neto</option>
                      <option value="Gabriel">Gabriel</option>
                      <option value="Manu">Manu</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-muted uppercase mb-1.5">Status Inicial</label>
                    <select 
                      value={newClientStatus}
                      onChange={(e) => setNewClientStatus(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-border rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-brand-primary"
                    >
                      <option value="Em andamento">🟢 Em andamento</option>
                      <option value="Concluído">🔵 Concluído</option>
                      <option value="Pendente">🟡 Pendente</option>
                      <option value="Crítico">🔴 Crítico</option>
                    </select>
                  </div>
                </div>

              </div>

              <div className="p-6 border-t border-brand-border bg-brand-card/90 flex justify-end gap-3 rounded-b-2xl">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-brand-card-hover border border-brand-border text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="bg-brand-primary hover:bg-brand-primary-hover text-brand-bg font-bold py-2.5 px-6 rounded-xl text-xs transition-all duration-300 shadow-md shadow-brand-primary/10 cursor-pointer"
                >
                  Adicionar Lead
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
