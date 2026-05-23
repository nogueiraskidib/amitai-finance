'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Layers, 
  Search, 
  Plus, 
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
  User, 
  CheckSquare, 
  Activity, 
  HeartHandshake,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  FileCheck,
  PlusCircle,
  Info,
  UserCheck,
  ArrowUpRight
} from 'lucide-react';

// Type definitions
interface LogItem {
  timestamp: string;
  action: string;
  user: string;
}

interface ServiceTask {
  id: string;
  text: string;
  completed: boolean;
}

interface ClientService {
  id: string;
  name: string;
  responsible: string;
  status: 'Planejado' | 'Em andamento' | 'Crítico' | 'Concluído';
  progress: number;
  tasks: ServiceTask[];
  deadline: string;
  deliveries: string;
  observations: string;
  files: { id: string; name: string; url: string }[];
}

interface GeneralTask {
  id: string;
  text: string;
  completed: boolean;
}

interface Client {
  id: string;
  name: string;
  stageId: number;
  timeInStage: number;
  status: string;
  tasks: GeneralTask[];
  history: LogItem[];
  createdAt: string;
  lastUpdated: string;
  
  // TAB 1: PERFIL
  niche?: string;
  responsible?: string;
  servicesContracted?: string;
  contractDuration?: string;
  observations?: string;
  importantInfo?: string;

  // TAB 2: DOSSIÊ
  targetAudience?: string;
  pains?: string;
  objections?: string;
  differentials?: string;
  toneOfVoice?: string;
  positioning?: string;
  competitors?: string;
  objectives?: string;
  offers?: string;
  previousStrategies?: string;
  briefingComplete?: boolean;
  strategicObservations?: string;

  // TAB 3: SERVIÇOS
  servicesList: ClientService[];

  // TAB 4: OPERACIONAL
  internalResponsibles?: string;
  generalTasks: GeneralTask[];
  priority?: 'Baixa' | 'Média' | 'Alta';
  pendingIssues?: string;
  calendarDate?: string;
  operationalProgress?: string;
  internalObservations?: string;
}

const STAGES = [
  { id: 1, name: 'Resposta à Prospecção' },
  { id: 2, name: 'Fechar Reunião' },
  { id: 3, name: 'Fechar Cliente' },
  { id: 4, name: 'Fazer e Enviar Contrato' },
  { id: 5, name: 'Criar Ativos' },
  { id: 6, name: 'Estudo do Cliente' },
  { id: 7, name: 'Execução dos Serviços' },
  { id: 8, name: 'Suporte ao Cliente' },
  { id: 9, name: 'Entrega + Retenção' },
  { id: 10, name: 'Relatório Mensal' },
  { id: 11, name: 'Feedback de Cancelamento' },
  { id: 12, name: 'Renovação de Contrato' }
];

export default function Clientes() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [responsibleFilter, setResponsibleFilter] = useState('Todos');
  
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Modal active tab & sub-service configurations
  const [modalActiveTab, setModalActiveTab] = useState<'perfil' | 'dossie' | 'servicos' | 'operacional' | 'historico'>('perfil');
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);
  
  const [newServiceName, setNewServiceName] = useState('Tráfego pago');
  const [newServiceResponsible, setNewServiceResponsible] = useState('Neto');
  const [manualLogText, setManualLogText] = useState('');

  // Add Client Form State
  const [newClientName, setNewClientName] = useState('');
  const [newClientResponsible, setNewClientResponsible] = useState('Neto');
  const [newClientStatus, setNewClientStatus] = useState('Em andamento');

  // Load and save state
  useEffect(() => {
    const saved = localStorage.getItem('amitai-funil-v1');
    if (saved) {
      try {
        setClients(JSON.parse(saved));
      } catch (e) {
        setClients([]);
      }
    } else {
      setClients([]);
    }
  }, []);

  const saveState = (updatedClients: Client[]) => {
    setClients(updatedClients);
    localStorage.setItem('amitai-funil-v1', JSON.stringify(updatedClients));
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

        if (field === 'status' || field === 'responsible' || field === 'stageId') {
          const fieldNameMap: { [key: string]: string } = {
            status: 'Status Geral',
            responsible: 'Responsável',
            stageId: 'Etapa do Funil'
          };
          updatedObj.history = [
            { timestamp, action: `Campo "${fieldNameMap[String(field)] || String(field)}" atualizado para: ${value}`, user: c.responsible || 'Sistema' },
            ...c.history
          ];
        }

        return updatedObj;
      }
      return c;
    });

    saveState(updated);
    const syncClient = updated.find(c => c.id === id);
    if (syncClient) setSelectedClient(syncClient);
  };

  // Add Manual Timeline Log
  const handleAddManualLog = (clientId: string) => {
    if (!manualLogText.trim()) return;
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const timestamp = new Date().toLocaleString('pt-BR', { hour12: false }).replace(',', '');
    const newLog: LogItem = {
      timestamp,
      action: manualLogText,
      user: client.responsible || 'Sistema'
    };

    const updated = clients.map(c => {
      if (c.id === clientId) {
        return {
          ...c,
          history: [newLog, ...c.history],
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return c;
    });

    saveState(updated);
    const syncClient = updated.find(c => c.id === clientId);
    if (syncClient) setSelectedClient(syncClient);
    setManualLogText('');
  };

  // Delete Client
  const handleDeleteClient = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente permanentemente?')) {
      const updated = clients.filter(c => c.id !== id);
      saveState(updated);
      setIsModalOpen(false);
      setSelectedClient(null);
    }
  };

  // Add Client Form
  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const timestamp = new Date().toLocaleString('pt-BR', { hour12: false }).replace(',', '');

    const newClient: Client = {
      id: 'c_' + Date.now(),
      name: newClientName,
      stageId: 7, // Defaults directly to active "Execução dos Serviços" for clients list!
      timeInStage: 0,
      status: newClientStatus,
      responsible: newClientResponsible,
      tasks: [],
      generalTasks: [],
      servicesList: [],
      history: [
        { timestamp, action: `Cliente criado diretamente na aba de Clientes`, user: newClientResponsible }
      ],
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      niche: '',
      contractDuration: '',
      observations: '',
      importantInfo: '',
      priority: 'Média'
    };

    const updated = [newClient, ...clients];
    saveState(updated);

    setNewClientName('');
    setIsAddModalOpen(false);
    setSelectedClient(newClient);
    setIsModalOpen(true);
  };

  // RENEWAL PROCESS
  const handleRenewContract = (client: Client) => {
    const timestamp = new Date().toLocaleString('pt-BR', { hour12: false }).replace(',', '');
    const log1: LogItem = {
      timestamp,
      action: 'CONTRATO RENOVADO! Retornando o cliente para a Etapa 4 para novo ciclo contratual.',
      user: client.responsible || 'Sistema'
    };

    const updated = clients.map(c => {
      if (c.id === client.id) {
        return {
          ...c,
          stageId: 4,
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
    alert(`Contrato de "${client.name}" renovado com sucesso! O cliente retornou automaticamente para a Etapa 4.`);
    setIsModalOpen(false);
    setSelectedClient(null);
  };

  // --- SERVIÇOS TABS HELPER ACTIONS ---
  const handleAddService = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const newService: ClientService = {
      id: 'srv_' + Date.now(),
      name: newServiceName,
      responsible: newServiceResponsible,
      status: 'Planejado',
      progress: 0,
      tasks: [
        { id: 'st_1', text: 'Definição de escopo', completed: false },
        { id: 'st_2', text: 'Reunião de kickoff', completed: false }
      ],
      deadline: '',
      deliveries: '',
      observations: '',
      files: []
    };

    const updatedServices = [...(client.servicesList || []), newService];
    const namesSummary = updatedServices.map(s => s.name).join(', ');

    const updated = clients.map(c => {
      if (c.id === clientId) {
        return {
          ...c,
          servicesList: updatedServices,
          servicesContracted: namesSummary,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return c;
    });

    saveState(updated);
    const syncClient = updated.find(c => c.id === clientId);
    if (syncClient) setSelectedClient(syncClient);
    setExpandedServiceId(newService.id);
  };

  const handleDeleteService = (clientId: string, serviceId: string) => {
    if (!confirm('Deseja realmente remover este serviço?')) return;
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const updatedServices = client.servicesList.filter(s => s.id !== serviceId);
    const namesSummary = updatedServices.map(s => s.name).join(', ');

    const updated = clients.map(c => {
      if (c.id === clientId) {
        return {
          ...c,
          servicesList: updatedServices,
          servicesContracted: namesSummary,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return c;
    });

    saveState(updated);
    const syncClient = updated.find(c => c.id === clientId);
    if (syncClient) setSelectedClient(syncClient);
    setExpandedServiceId(null);
  };

  const handleUpdateServiceField = (clientId: string, serviceId: string, field: keyof ClientService, value: any) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const updatedServices = client.servicesList.map(s => {
      if (s.id === serviceId) {
        return { ...s, [field]: value };
      }
      return s;
    });

    const updated = clients.map(c => {
      if (c.id === clientId) {
        return {
          ...c,
          servicesList: updatedServices,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return c;
    });

    saveState(updated);
    const syncClient = updated.find(c => c.id === clientId);
    if (syncClient) setSelectedClient(syncClient);
  };

  const handleServiceTaskCheck = (clientId: string, serviceId: string, taskId: string, completed: boolean) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const service = client.servicesList.find(s => s.id === serviceId);
    if (!service) return;

    const updatedTasks = service.tasks.map(t => t.id === taskId ? { ...t, completed } : t);
    const completedCount = updatedTasks.filter(item => item.completed).length;
    const totalCount = updatedTasks.length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const updatedServices = client.servicesList.map(s => {
      if (s.id === serviceId) {
        return { ...s, tasks: updatedTasks, progress: progressPercent };
      }
      return s;
    });

    const updated = clients.map(c => {
      if (c.id === clientId) {
        return {
          ...c,
          servicesList: updatedServices,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return c;
    });

    saveState(updated);
    const syncClient = updated.find(c => c.id === clientId);
    if (syncClient) setSelectedClient(syncClient);
  };

  const handleAddServiceTask = (clientId: string, serviceId: string, taskText: string) => {
    if (!taskText.trim()) return;
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const service = client.servicesList.find(s => s.id === serviceId);
    if (!service) return;

    const updatedTasks = [...service.tasks, { id: 'st_' + Date.now(), text: taskText, completed: false }];
    const completedCount = updatedTasks.filter(item => item.completed).length;
    const totalCount = updatedTasks.length;
    const progressPercent = Math.round((completedCount / totalCount) * 100);

    const updatedServices = client.servicesList.map(s => {
      if (s.id === serviceId) {
        return { ...s, tasks: updatedTasks, progress: progressPercent };
      }
      return s;
    });

    const updated = clients.map(c => {
      if (c.id === clientId) {
        return {
          ...c,
          servicesList: updatedServices,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return c;
    });

    saveState(updated);
    const syncClient = updated.find(c => c.id === clientId);
    if (syncClient) setSelectedClient(syncClient);
  };

  const handleDeleteServiceTask = (clientId: string, serviceId: string, taskId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const service = client.servicesList.find(s => s.id === serviceId);
    if (!service) return;

    const updatedTasks = service.tasks.filter(t => t.id !== taskId);
    const completedCount = updatedTasks.filter(item => item.completed).length;
    const totalCount = updatedTasks.length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const updatedServices = client.servicesList.map(s => {
      if (s.id === serviceId) {
        return { ...s, tasks: updatedTasks, progress: progressPercent };
      }
      return s;
    });

    const updated = clients.map(c => {
      if (c.id === clientId) {
        return {
          ...c,
          servicesList: updatedServices,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return c;
    });

    saveState(updated);
    const syncClient = updated.find(c => c.id === clientId);
    if (syncClient) setSelectedClient(syncClient);
  };

  const handleAddServiceFile = (clientId: string, serviceId: string, fileName: string, fileUrl: string) => {
    if (!fileName.trim()) return;
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const service = client.servicesList.find(s => s.id === serviceId);
    if (!service) return;

    const updatedFiles = [...(service.files || []), { id: 'file_' + Date.now(), name: fileName, url: fileUrl || '#' }];

    const updatedServices = client.servicesList.map(s => {
      if (s.id === serviceId) {
        return { ...s, files: updatedFiles };
      }
      return s;
    });

    const updated = clients.map(c => {
      if (c.id === clientId) {
        return {
          ...c,
          servicesList: updatedServices,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return c;
    });

    saveState(updated);
    const syncClient = updated.find(c => c.id === clientId);
    if (syncClient) setSelectedClient(syncClient);
  };

  const handleDeleteServiceFile = (clientId: string, serviceId: string, fileId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const service = client.servicesList.find(s => s.id === serviceId);
    if (!service) return;

    const updatedFiles = service.files.filter(f => f.id !== fileId);

    const updatedServices = client.servicesList.map(s => {
      if (s.id === serviceId) {
        return { ...s, files: updatedFiles };
      }
      return s;
    });

    const updated = clients.map(c => {
      if (c.id === clientId) {
        return {
          ...c,
          servicesList: updatedServices,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      }
      return c;
    });

    saveState(updated);
    const syncClient = updated.find(c => c.id === clientId);
    if (syncClient) setSelectedClient(syncClient);
  };


  // --- OPERACIONAL CHECKS GENERAL ---
  const handleGeneralTaskToggle = (clientId: string, taskId: string, completed: boolean) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const updatedTasks = (client.generalTasks || []).map(t => t.id === taskId ? { ...t, completed } : t);
    updateClientField(clientId, 'generalTasks', updatedTasks);
  };

  const handleAddGeneralTask = (clientId: string, taskText: string) => {
    if (!taskText.trim()) return;
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const updatedTasks = [...(client.generalTasks || []), { id: 'gt_' + Date.now(), text: taskText, completed: false }];
    updateClientField(clientId, 'generalTasks', updatedTasks);
  };

  const handleDeleteGeneralTask = (clientId: string, taskId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const updatedTasks = (client.generalTasks || []).filter(t => t.id !== taskId);
    updateClientField(clientId, 'generalTasks', updatedTasks);
  };


  // Filter logic
  const filteredClientsList = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.niche?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'Todos' || c.status === statusFilter;
    const matchesResponsible = responsibleFilter === 'Todos' || c.responsible === responsibleFilter;
    
    return matchesSearch && matchesStatus && matchesResponsible;
  });

  // Calculate real indicators
  const totalCount = clients.length;
  const activeCount = clients.filter(c => c.stageId === 7 || c.stageId === 9 || c.stageId === 12).length;
  const onboardingCount = clients.filter(c => c.stageId === 4 || c.stageId === 5 || c.stageId === 6).length;
  const cancelCount = clients.filter(c => c.stageId === 11).length;

  return (
    <div className="w-full min-h-screen p-4 md:p-8 animate-page custom-scrollbar pb-16">
      
      {/* Header Section */}
      <header className="mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-brand-border/40 pb-6">
        <div>
          <div className="flex items-center gap-2 text-brand-primary mb-1">
            <Users className="animate-pulse" size={20} />
            <span className="text-sm font-semibold tracking-wider uppercase">Base Operacional</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Lista de Clientes</h1>
          <p className="text-brand-muted mt-1 max-w-xl">
            Acompanhe o andamento geral, contratos, dossiê estratégico e execução de todos os seus clientes em um painel único.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <Link
            href="/funil"
            className="w-full sm:w-auto bg-brand-card hover:bg-brand-card-hover border border-brand-border text-white font-bold py-2.5 px-5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-xs"
          >
            <Layers size={14} />
            Ir para o Funil
            <ArrowUpRight size={12} />
          </Link>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto bg-brand-primary hover:bg-brand-primary-hover text-brand-bg font-bold py-2.5 px-5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-xs shadow-md shadow-brand-primary/10 cursor-pointer"
          >
            <Plus size={16} />
            Adicionar Cliente
          </button>
        </div>
      </header>

      {/* Real KPIs counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="glass-card p-4">
          <span className="text-[10px] text-brand-muted uppercase font-bold tracking-wider">Total Cadastrado</span>
          <h3 className="text-2xl font-black text-white mt-1">{totalCount}</h3>
        </div>
        <div className="glass-card p-4 border-l-2 border-l-emerald-400">
          <span className="text-[10px] text-brand-muted uppercase font-bold tracking-wider">Clientes Ativos</span>
          <h3 className="text-2xl font-black text-emerald-400 mt-1">{activeCount}</h3>
        </div>
        <div className="glass-card p-4 border-l-2 border-l-indigo-400">
          <span className="text-[10px] text-brand-muted uppercase font-bold tracking-wider">Em Onboarding</span>
          <h3 className="text-2xl font-black text-indigo-400 mt-1">{onboardingCount}</h3>
        </div>
        <div className="glass-card p-4 border-l-2 border-l-red-400">
          <span className="text-[10px] text-brand-muted uppercase font-bold tracking-wider">Cancelados / Churn</span>
          <h3 className="text-2xl font-black text-red-400 mt-1">{cancelCount}</h3>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="mb-6 bg-brand-card/30 p-4 rounded-2xl border border-brand-border/60 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input 
            type="text" 
            placeholder="Buscar por cliente, nicho..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 pl-10 pr-4 text-white text-xs focus:outline-none focus:border-brand-primary"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-brand-muted">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-brand-bg border border-brand-border rounded-lg py-1.5 px-2.5 text-white"
            >
              <option value="Todos">Todos</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Concluído">Concluído</option>
              <option value="Pendente">Pendente</option>
              <option value="Crítico">Crítico</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-brand-muted">
            <span>Responsável:</span>
            <select
              value={responsibleFilter}
              onChange={(e) => setResponsibleFilter(e.target.value)}
              className="bg-brand-bg border border-brand-border rounded-lg py-1.5 px-2.5 text-white"
            >
              <option value="Todos">Todos</option>
              <option value="Neto">Neto</option>
              <option value="Gabriel">Gabriel</option>
              <option value="Manu">Manu</option>
            </select>
          </div>
        </div>

      </div>

      {/* Grid of Clients */}
      {filteredClientsList.length === 0 ? (
        <div className="text-center p-20 glass-card">
          <Users className="mx-auto text-brand-muted/40 mb-3" size={48} />
          <h3 className="text-lg font-bold text-white mb-1">Nenhum cliente encontrado</h3>
          <p className="text-xs text-brand-muted max-w-sm mx-auto mb-4">Adicione um novo cliente acima ou acerte os filtros da busca para listar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClientsList.map(client => {
            const activeServicesCount = client.servicesList ? client.servicesList.length : 0;
            const completedGeneral = (client.generalTasks || []).filter(t => t.completed).length;
            const totalGeneral = (client.generalTasks || []).length;
            
            return (
              <div 
                key={client.id}
                onClick={() => {
                  setSelectedClient(client);
                  setModalActiveTab('perfil');
                  setIsModalOpen(true);
                }}
                className="glass-card p-6 flex flex-col justify-between hover:-translate-y-1 transition-all duration-300 cursor-pointer border hover:border-brand-primary/20 relative group"
              >
                <div>
                  {/* Status Indicator */}
                  <div className="flex justify-between items-center mb-3">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase ${
                      client.status === 'Concluído' ? 'bg-emerald-500/10 text-emerald-400' :
                      client.status === 'Crítico' ? 'bg-red-500/10 text-red-400' :
                      client.status === 'Pendente' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-brand-primary-dim text-brand-primary'
                    }`}>
                      {client.status}
                    </span>
                    <span className="text-[10px] font-bold text-brand-muted">
                      Etapa {client.stageId}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-white text-md group-hover:text-brand-primary transition-colors">
                    {client.name}
                  </h3>
                  <p className="text-xs text-brand-muted mt-1 leading-normal">
                    {client.niche ? `${client.niche}` : 'Sem nicho preenchido'}
                  </p>

                  {/* Operational and services indicators inside card */}
                  <div className="my-4 pt-4 border-t border-brand-border/40 text-[11px] text-brand-muted space-y-2">
                    <div className="flex justify-between">
                      <span>Responsável Geral:</span>
                      <strong className="text-white">{client.responsible || 'Sem responsável'}</strong>
                    </div>

                    <div className="flex justify-between">
                      <span>Serviços Contratados:</span>
                      <strong className="text-brand-primary font-bold">{activeServicesCount} ativos</strong>
                    </div>

                    {client.contractDuration && (
                      <div className="flex justify-between">
                        <span>Tempo de Contrato:</span>
                        <strong className="text-white">{client.contractDuration}</strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-brand-border/40 flex justify-between items-center text-[10px] text-brand-muted">
                  <span className="flex items-center gap-1">
                    <CheckSquare size={12} className="text-brand-primary" />
                    {completedGeneral}/{totalGeneral} tarefas gerais
                  </span>

                  <span className="text-brand-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                    Perfil Completo <Eye size={12} className="ml-1" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RENDER MODAL: REDESIGNED WITH 5 TABS SYNCED IN REAL-TIME (PARITY TO FUNNEL PAGE) */}
      {isModalOpen && selectedClient && (
        <div className="fixed inset-0 bg-brand-bg/85 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-brand-card border border-brand-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-300">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-brand-border bg-brand-card/90 flex flex-col gap-4 sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-brand-primary-dim text-brand-primary">
                    <Users size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-brand-primary font-bold">Cliente: #{selectedClient.id}</span>
                      <span className="text-xs text-brand-muted">• Modificado em {selectedClient.lastUpdated.split('-').reverse().join('/')}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mt-0.5">{selectedClient.name}</h2>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedClient(null);
                  }}
                  className="text-brand-muted hover:text-white p-1.5 rounded-lg hover:bg-brand-card-hover transition-colors cursor-pointer"
                >
                  <X size={24} />
                </button>
              </div>

              {/* 5 INTERNAL TABS NAVIGATION */}
              <div className="flex overflow-x-auto gap-2 p-1 bg-brand-bg border border-brand-border/80 rounded-xl custom-scrollbar">
                {[
                  { id: 'perfil', name: 'Perfil do Cliente', icon: User },
                  { id: 'dossie', name: 'Dossiê Estratégico', icon: Briefcase },
                  { id: 'servicos', name: 'Serviços Ativos', icon: FolderPlus },
                  { id: 'operacional', name: 'Operacional', icon: Play },
                  { id: 'historico', name: 'Histórico & Timeline', icon: Activity }
                ].map(tab => {
                  const IconComponent = tab.icon;
                  const isActive = modalActiveTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setModalActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer ${
                        isActive 
                          ? 'bg-brand-primary-dim text-brand-primary shadow-inner border border-brand-primary/20' 
                          : 'text-brand-muted hover:text-white hover:bg-brand-card-hover border border-transparent'
                      }`}
                    >
                      <IconComponent size={14} />
                      {tab.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Content container depending on active tab */}
            <div className="p-6 space-y-6 flex-1">
              
              {/* TAB 1: PERFIL DO CLIENTE */}
              {modalActiveTab === 'perfil' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-brand-bg/40 p-4 rounded-xl border border-brand-border">
                    <div>
                      <label className="block text-xs font-semibold text-brand-muted uppercase mb-1.5">Nome da Empresa</label>
                      <input 
                        type="text" 
                        value={selectedClient.name} 
                        onChange={(e) => updateClientField(selectedClient.id, 'name', e.target.value)}
                        className="w-full bg-brand-card border border-brand-border rounded-xl py-2 px-3 text-white text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-brand-muted uppercase mb-1.5">Nicho de Mercado</label>
                      <input 
                        type="text" 
                        value={selectedClient.niche || ''} 
                        onChange={(e) => updateClientField(selectedClient.id, 'niche', e.target.value)}
                        placeholder="Ex: Clínicas, E-commerce, Logística"
                        className="w-full bg-brand-card border border-brand-border rounded-xl py-2 px-3 text-white text-sm focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-brand-muted uppercase mb-1.5">Responsável Principal</label>
                      <select 
                        value={selectedClient.responsible || 'Neto'} 
                        onChange={(e) => updateClientField(selectedClient.id, 'responsible', e.target.value)}
                        className="w-full bg-brand-card border border-brand-border rounded-xl py-2 px-3 text-white text-sm focus:outline-none"
                      >
                        <option value="Neto">Neto</option>
                        <option value="Gabriel">Gabriel</option>
                        <option value="Manu">Manu</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-brand-muted uppercase mb-1.5">Serviços Contratados (Resumo)</label>
                          <input 
                            type="text" 
                            value={selectedClient.servicesContracted || ''} 
                            onChange={(e) => updateClientField(selectedClient.id, 'servicesContracted', e.target.value)}
                            placeholder="Social Media, Branding, Tráfego"
                            className="w-full bg-brand-bg border border-brand-border rounded-xl py-2.5 px-3 text-white focus:outline-none text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-brand-muted uppercase mb-1.5">Tempo de Contrato</label>
                          <input 
                            type="text" 
                            value={selectedClient.contractDuration || ''} 
                            onChange={(e) => updateClientField(selectedClient.id, 'contractDuration', e.target.value)}
                            placeholder="Ex: 6 meses, Anual"
                            className="w-full bg-brand-bg border border-brand-border rounded-xl py-2.5 px-3 text-white focus:outline-none text-xs"
                          />
                        </div>
                      </div>

                      <div className="glass-card p-5">
                        <label className="block text-xs font-bold text-white uppercase mb-2 flex items-center gap-1.5">
                          <Info size={14} className="text-brand-primary" /> Informações Importantes
                        </label>
                        <textarea 
                          value={selectedClient.importantInfo || ''}
                          onChange={(e) => updateClientField(selectedClient.id, 'importantInfo', e.target.value)}
                          placeholder="Adicione restrições, observações comerciais críticas, ou dados urgentes..."
                          rows={4}
                          className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="glass-card p-5 flex flex-col justify-between">
                      <div>
                        <label className="block text-xs font-bold text-white uppercase mb-2">Observações Gerais</label>
                        <textarea 
                          value={selectedClient.observations || ''}
                          onChange={(e) => updateClientField(selectedClient.id, 'observations', e.target.value)}
                          placeholder="Notas operacionais gerais ou lembretes rápidos sobre o cliente..."
                          rows={8}
                          className="w-full bg-brand-bg border border-brand-border rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: DOSSIÊ (Estudo estratégico) */}
              {modalActiveTab === 'dossie' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    <div className="space-y-4 md:col-span-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-brand-muted uppercase mb-1.5">Público-Alvo</label>
                          <input 
                            type="text" 
                            value={selectedClient.targetAudience || ''} 
                            onChange={(e) => updateClientField(selectedClient.id, 'targetAudience', e.target.value)}
                            placeholder="Ex: Mulheres de 25-40 anos"
                            className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-brand-muted uppercase mb-1.5">Principais Concorrentes</label>
                          <input 
                            type="text" 
                            value={selectedClient.competitors || ''} 
                            onChange={(e) => updateClientField(selectedClient.id, 'competitors', e.target.value)}
                            className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-brand-muted uppercase mb-1.5">Tom de Voz</label>
                          <input 
                            type="text" 
                            value={selectedClient.toneOfVoice || ''} 
                            onChange={(e) => updateClientField(selectedClient.id, 'toneOfVoice', e.target.value)}
                            placeholder="Ex: Descontraído..."
                            className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-brand-muted uppercase mb-1.5">Posicionamento da Marca</label>
                          <input 
                            type="text" 
                            value={selectedClient.positioning || ''} 
                            onChange={(e) => updateClientField(selectedClient.id, 'positioning', e.target.value)}
                            className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-brand-muted uppercase mb-1.5">Dores do Cliente</label>
                          <textarea 
                            value={selectedClient.pains || ''} 
                            onChange={(e) => updateClientField(selectedClient.id, 'pains', e.target.value)}
                            rows={3}
                            className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-brand-muted uppercase mb-1.5">Objeções de Vendas</label>
                          <textarea 
                            value={selectedClient.objections || ''} 
                            onChange={(e) => updateClientField(selectedClient.id, 'objections', e.target.value)}
                            rows={3}
                            className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-brand-muted uppercase mb-1.5">Objetivos Principais</label>
                        <textarea 
                          value={selectedClient.objectives || ''} 
                          onChange={(e) => updateClientField(selectedClient.id, 'objectives', e.target.value)}
                          rows={4}
                          className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div className="glass-card p-4 space-y-4">
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox"
                            checked={selectedClient.briefingComplete || false}
                            onChange={(e) => updateClientField(selectedClient.id, 'briefingComplete', e.target.checked)}
                            className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary bg-brand-bg border-brand-border"
                          />
                          <span className="text-xs font-bold text-white">Briefing Concluído?</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 3: SERVIÇOS */}
              {modalActiveTab === 'servicos' && (
                <div className="space-y-6 animate-in fade-in duration-300 text-xs">
                  
                  <div className="bg-brand-bg/50 p-4 rounded-xl border border-brand-border flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="flex flex-col gap-1 w-full sm:w-48">
                        <label className="text-[10px] text-brand-muted uppercase font-bold">Serviço à Contratar</label>
                        <select
                          value={newServiceName}
                          onChange={(e) => setNewServiceName(e.target.value)}
                          className="bg-brand-card border border-brand-border rounded-lg py-1.5 px-2 text-white text-xs focus:outline-none"
                        >
                          <option value="Tráfego pago">Tráfego pago</option>
                          <option value="Criação de sites">Criação de sites</option>
                          <option value="Automação">Automação</option>
                          <option value="Captação de vídeo">Captação de vídeo</option>
                          <option value="Captação de foto">Captação de foto</option>
                          <option value="Social media">Social media</option>
                          <option value="Design gráfico">Design gráfico</option>
                          <option value="Palestras">Palestras</option>
                          <option value="Treinamentos">Treinamentos</option>
                          <option value="Mentorias">Mentorias</option>
                          <option value="Papelaria / marketing raiz">Papelaria / marketing raiz</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1 w-full sm:w-40">
                        <label className="text-[10px] text-brand-muted uppercase font-bold">Responsável</label>
                        <select
                          value={newServiceResponsible}
                          onChange={(e) => setNewServiceResponsible(e.target.value)}
                          className="bg-brand-card border border-brand-border rounded-lg py-1.5 px-2 text-white text-xs focus:outline-none"
                        >
                          <option value="Neto">Neto</option>
                          <option value="Gabriel">Gabriel</option>
                          <option value="Manu">Manu</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddService(selectedClient.id)}
                      className="w-full sm:w-auto bg-brand-primary hover:bg-brand-primary-hover text-brand-bg font-bold py-2 px-5 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <PlusCircle size={16} />
                      Contratar Serviço
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(!selectedClient.servicesList || selectedClient.servicesList.length === 0) ? (
                      <div className="text-center p-12 border border-dashed border-brand-border/40 rounded-xl">
                        <FolderPlus className="mx-auto text-brand-muted/40 mb-3" size={32} />
                        <p className="text-brand-muted italic">Nenhum serviço contratado no momento.</p>
                      </div>
                    ) : (
                      selectedClient.servicesList.map(service => {
                        const isExpanded = expandedServiceId === service.id;
                        
                        return (
                          <div 
                            key={service.id} 
                            className="bg-brand-card border border-brand-border rounded-xl transition-all duration-300"
                          >
                            <div 
                              onClick={() => setExpandedServiceId(isExpanded ? null : service.id)}
                              className="p-4 flex items-center justify-between cursor-pointer hover:bg-brand-card-hover transition-colors rounded-t-xl"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                                <span className={`w-3 h-3 rounded-full shrink-0 ${
                                  service.status === 'Concluído' ? 'bg-emerald-400' :
                                  service.status === 'Crítico' ? 'bg-red-400' :
                                  'bg-brand-primary'
                                }`}></span>
                                <h4 className="font-bold text-white text-sm truncate">{service.name}</h4>
                                <span className="text-[10px] text-brand-muted">• por {service.responsible}</span>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-brand-primary font-bold">{service.progress}%</span>
                                </div>
                                {isExpanded ? <ChevronUp size={16} className="text-brand-muted" /> : <ChevronDown size={16} className="text-brand-muted" />}
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="p-4 border-t border-brand-border/60 bg-brand-card/30 space-y-6 rounded-b-xl">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                                  <div>
                                    <label className="block text-[10px] font-semibold text-brand-muted uppercase mb-1">Responsável</label>
                                    <select
                                      value={service.responsible}
                                      onChange={(e) => handleUpdateServiceField(selectedClient.id, service.id, 'responsible', e.target.value)}
                                      className="w-full bg-brand-bg border border-brand-border rounded-lg py-1.5 px-2 text-white"
                                    >
                                      <option value="Neto">Neto</option>
                                      <option value="Gabriel">Gabriel</option>
                                      <option value="Manu">Manu</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-semibold text-brand-muted uppercase mb-1">Status da Execução</label>
                                    <select
                                      value={service.status}
                                      onChange={(e) => handleUpdateServiceField(selectedClient.id, service.id, 'status', e.target.value)}
                                      className="w-full bg-brand-bg border border-brand-border rounded-lg py-1.5 px-2 text-white"
                                    >
                                      <option value="Planejado">🟡 Planejado</option>
                                      <option value="Em andamento">🟢 Em andamento</option>
                                      <option value="Crítico">🔴 Crítico</option>
                                      <option value="Concluído">🔵 Concluído</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-semibold text-brand-muted uppercase mb-1">Prazo Final</label>
                                    <input
                                      type="date"
                                      value={service.deadline || ''}
                                      onChange={(e) => handleUpdateServiceField(selectedClient.id, service.id, 'deadline', e.target.value)}
                                      className="w-full bg-brand-bg border border-brand-border rounded-lg py-1.5 px-2 text-white"
                                    />
                                  </div>

                                  <div className="flex items-end">
                                    <button
                                      onClick={() => handleDeleteService(selectedClient.id, service.id)}
                                      className="w-full bg-brand-danger-dim hover:bg-brand-danger text-brand-danger hover:text-white py-1.5 px-3 rounded-lg font-bold transition-all border border-brand-danger/20 flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                      <Trash2 size={12} /> Remover Serviço
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-3">
                                    <label className="text-[10px] text-brand-muted uppercase font-bold block">Checklist Operacional</label>
                                    
                                    <div className="space-y-1.5 bg-brand-bg/50 p-3 rounded-xl border border-brand-border max-h-[140px] overflow-y-auto custom-scrollbar">
                                      {service.tasks.map(sTask => (
                                        <div key={sTask.id} className="flex items-center justify-between py-1 border-b border-brand-border/20 last:border-0">
                                          <div className="flex items-center gap-2">
                                            <input
                                              type="checkbox"
                                              checked={sTask.completed}
                                              onChange={(e) => handleServiceTaskCheck(selectedClient.id, service.id, sTask.id, e.target.checked)}
                                              className="w-3.5 h-3.5 rounded text-brand-primary focus:ring-brand-primary bg-brand-bg border-brand-border"
                                            />
                                            <span className={`${sTask.completed ? 'line-through text-brand-muted' : 'text-white'} text-[11px]`}>
                                              {sTask.text}
                                            </span>
                                          </div>
                                          <button
                                            onClick={() => handleDeleteServiceTask(selectedClient.id, service.id, sTask.id)}
                                            className="text-brand-danger/60 hover:text-brand-danger p-0.5"
                                          >
                                            <Trash2 size={10} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>

                                    <form onSubmit={(e) => {
                                      e.preventDefault();
                                      const input = (e.target as any).sTaskInput;
                                      handleAddServiceTask(selectedClient.id, service.id, input.value);
                                      input.value = '';
                                    }} className="flex gap-2">
                                      <input
                                        type="text"
                                        name="sTaskInput"
                                        placeholder="Nova tarefa..."
                                        className="flex-1 bg-brand-bg border border-brand-border rounded-lg py-1.5 px-3 text-[11px]"
                                      />
                                      <button type="submit" className="bg-brand-primary-dim hover:bg-brand-primary hover:text-brand-bg text-brand-primary text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                                        Criar
                                      </button>
                                    </form>
                                  </div>

                                  <div className="space-y-3">
                                    <label className="text-[10px] text-brand-muted uppercase font-bold block">Arquivos & Links</label>
                                    <div className="space-y-1.5 bg-brand-bg/50 p-3 rounded-xl border border-brand-border max-h-[140px] overflow-y-auto custom-scrollbar">
                                      {service.files?.map(sFile => (
                                        <div key={sFile.id} className="flex items-center justify-between py-1 border-b border-brand-border/20 last:border-0">
                                          <a href={sFile.url} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:text-brand-primary-hover flex items-center gap-1 text-[11px] truncate max-w-[180px]">
                                            <LinkIcon size={10} /> {sFile.name}
                                          </a>
                                          <button onClick={() => handleDeleteServiceFile(selectedClient.id, service.id, sFile.id)} className="text-brand-danger/60 hover:text-brand-danger p-0.5">
                                            <Trash2 size={10} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>

                                    <form onSubmit={(e) => {
                                      e.preventDefault();
                                      const nameInput = (e.target as any).fileNameInput;
                                      const urlInput = (e.target as any).fileUrlInput;
                                      handleAddServiceFile(selectedClient.id, service.id, nameInput.value, urlInput.value);
                                      nameInput.value = '';
                                      urlInput.value = '';
                                    }} className="flex gap-2">
                                      <input type="text" name="fileNameInput" required placeholder="Nome..." className="flex-1 bg-brand-bg border border-brand-border rounded-lg py-1.5 px-3 text-[11px]" />
                                      <input type="text" name="fileUrlInput" placeholder="Link..." className="flex-1 bg-brand-bg border border-brand-border rounded-lg py-1.5 px-3 text-[11px]" />
                                      <button type="submit" className="bg-brand-primary-dim hover:bg-brand-primary hover:text-brand-bg text-brand-primary text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer">Add</button>
                                    </form>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: OPERACIONAL */}
              {modalActiveTab === 'operacional' && (
                <div className="space-y-6 animate-in fade-in duration-300 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-brand-bg/40 p-4 rounded-xl border border-brand-border">
                    <div>
                      <label className="block text-[10px] font-bold text-brand-muted uppercase mb-1.5">Responsáveis Internos</label>
                      <input 
                        type="text" 
                        value={selectedClient.internalResponsibles || ''} 
                        onChange={(e) => updateClientField(selectedClient.id, 'internalResponsibles', e.target.value)}
                        className="w-full bg-brand-card border border-brand-border rounded-xl py-2 px-3 text-white text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-brand-muted uppercase mb-1.5">Prioridade Geral</label>
                      <select 
                        value={selectedClient.priority || 'Média'} 
                        onChange={(e: any) => updateClientField(selectedClient.id, 'priority', e.target.value)}
                        className="w-full bg-brand-card border border-brand-border rounded-xl py-2.5 px-3 text-white focus:outline-none"
                      >
                        <option value="Baixa">🟢 Baixa</option>
                        <option value="Média">🟡 Média</option>
                        <option value="Alta">🔴 Alta</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-brand-muted uppercase mb-1.5">Calendário (Data Limite)</label>
                      <input 
                        type="date" 
                        value={selectedClient.calendarDate || ''} 
                        onChange={(e) => updateClientField(selectedClient.id, 'calendarDate', e.target.value)}
                        className="w-full bg-brand-card border border-brand-border rounded-xl py-2 px-3 text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card p-5 flex flex-col justify-between min-h-[220px]">
                      <div>
                        <label className="block text-xs font-bold text-white uppercase mb-3 flex items-center gap-1.5">
                          <CheckSquare size={14} className="text-brand-primary" /> Tarefas Operacionais Gerais
                        </label>
                        
                        <div className="space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar pr-1 mb-4">
                          {selectedClient.generalTasks?.map(gTask => (
                            <div key={gTask.id} className="flex items-center justify-between p-2 rounded-lg bg-brand-bg/50 border border-brand-border/40">
                              <div className="flex items-center gap-2">
                                <input 
                                  type="checkbox"
                                  checked={gTask.completed}
                                  onChange={(e) => handleGeneralTaskToggle(selectedClient.id, gTask.id, e.target.checked)}
                                  className="w-3.5 h-3.5 rounded text-brand-primary focus:ring-brand-primary bg-brand-bg border-brand-border"
                                />
                                <span className={`text-[11px] ${gTask.completed ? 'line-through text-brand-muted' : 'text-white'}`}>
                                  {gTask.text}
                                </span>
                              </div>
                              <button onClick={() => handleDeleteGeneralTask(selectedClient.id, gTask.id)} className="text-brand-danger/60 hover:text-brand-danger p-0.5">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const input = (e.target as any).gTaskInput;
                        handleAddGeneralTask(selectedClient.id, input.value);
                        input.value = '';
                      }} className="flex gap-2">
                        <input type="text" name="gTaskInput" placeholder="Adicionar tarefa operativa..." className="flex-1 bg-brand-bg border border-brand-border rounded-lg py-1.5 px-3 text-xs text-white" />
                        <button type="submit" className="bg-brand-primary-dim hover:bg-brand-primary hover:text-brand-bg text-brand-primary py-1.5 px-4 rounded-lg text-xs font-bold transition-colors cursor-pointer">Criar</button>
                      </form>
                    </div>

                    <div className="glass-card p-5">
                      <label className="block text-xs font-bold text-white uppercase mb-2 flex items-center gap-1.5">
                        <ShieldAlert size={14} className="text-brand-danger" /> Pendências e Impedimentos
                      </label>
                      <textarea 
                        value={selectedClient.pendingIssues || ''}
                        onChange={(e) => updateClientField(selectedClient.id, 'pendingIssues', e.target.value)}
                        placeholder="Descreva pendências operacionais aqui..."
                        rows={6}
                        className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: HISTÓRICO & TIMELINE */}
              {modalActiveTab === 'historico' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="bg-brand-bg/50 p-4 rounded-xl border border-brand-border/60">
                    <label className="block text-xs font-bold text-brand-muted uppercase mb-2 flex items-center gap-1">
                      <PlusCircle size={14} className="text-brand-primary" /> Registrar Novo Evento na Timeline
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input 
                        type="text" 
                        value={manualLogText}
                        onChange={(e) => setManualLogText(e.target.value)}
                        placeholder="Ex: Reunião estratégica mensal feita..."
                        className="flex-1 bg-brand-card border border-brand-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddManualLog(selectedClient.id);
                        }}
                      />
                      <button onClick={() => handleAddManualLog(selectedClient.id)} className="bg-brand-primary hover:bg-brand-primary-hover text-brand-bg font-bold py-2 px-5 rounded-xl text-xs transition-colors cursor-pointer shrink-0">
                        Registrar
                      </button>
                    </div>
                  </div>

                  <div className="glass-card p-6">
                    <h3 className="font-bold text-white text-sm mb-6 flex items-center gap-1.5 border-b border-brand-border/40 pb-3">
                      <Activity size={16} className="text-brand-primary" /> Linha do Tempo Operacional & Comercial
                    </h3>
                    <div className="space-y-6 border-l border-brand-border pl-4 max-h-[350px] overflow-y-auto custom-scrollbar">
                      {selectedClient.history.map((log, idx) => (
                        <div key={idx} className="relative py-1">
                          <span className="absolute -left-[21px] top-2.5 w-2 h-2 rounded-full bg-brand-primary glow-primary"></span>
                          <div className="text-[10px] text-brand-muted">
                            {log.timestamp} • por <strong className="text-white">{log.user}</strong>
                          </div>
                          <div className="text-xs text-white font-medium mt-1 leading-relaxed bg-brand-bg/40 p-2.5 rounded-lg border border-brand-border/30 mt-1">
                            {log.action}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Special Qualify button on Etapa 12 */}
              {selectedClient.stageId === 12 && modalActiveTab !== 'historico' && (
                <div className="p-4 bg-brand-bg/50 border border-brand-primary/20 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                  <div>
                    <h4 className="font-bold text-brand-primary flex items-center gap-1.5 uppercase">
                      <RefreshCw size={14} className="animate-spin" /> O Cliente está qualificado para Renovação
                    </h4>
                    <p className="text-brand-muted mt-1">Clique para confirmar a renovação contratual.</p>
                  </div>
                  <button onClick={() => handleRenewContract(selectedClient)} className="bg-brand-primary hover:bg-brand-primary-hover text-brand-bg font-bold py-2.5 px-6 rounded-xl transition-all duration-300 flex items-center gap-1.5 cursor-pointer text-xs">
                    <RefreshCw size={12} /> Confirmar Renovação
                  </button>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-brand-border bg-brand-card/90 flex justify-between items-center">
              <button 
                onClick={() => handleDeleteClient(selectedClient.id)}
                className="bg-brand-danger-dim hover:bg-brand-danger text-brand-danger hover:text-white font-bold py-2 px-4 rounded-xl transition-all duration-300 flex items-center gap-1.5 text-xs cursor-pointer"
              >
                <Trash2 size={14} /> Excluir Cliente
              </button>
              
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedClient(null);
                }}
                className="bg-brand-primary hover:bg-brand-primary-hover text-brand-bg font-bold py-2.5 px-6 rounded-xl transition-all duration-300 text-xs shadow-md shadow-brand-primary/10 cursor-pointer"
              >
                Salvar e Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* RENDER MODAL: ADD CLIENT FORM */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-brand-bg/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-brand-card border border-brand-border rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            
            <div className="p-6 border-b border-brand-border flex justify-between items-center bg-brand-card/90 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Plus className="text-brand-primary" />
                <h2 className="text-xl font-bold text-white">Adicionar Novo Cliente Operacional</h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-brand-muted hover:text-white p-1 rounded-lg hover:bg-brand-card-hover transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddClient}>
              <div className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-brand-muted uppercase mb-1.5">Nome do Cliente / Empresa *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: Clínica Sorriso Premium"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-brand-muted uppercase mb-1.5">Responsável Principal</label>
                    <select 
                      value={newClientResponsible}
                      onChange={(e) => setNewClientResponsible(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-border rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none"
                    >
                      <option value="Neto">Neto</option>
                      <option value="Gabriel">Gabriel</option>
                      <option value="Manu">Manu</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-muted uppercase mb-1.5">Status Geral Inicial</label>
                    <select 
                      value={newClientStatus}
                      onChange={(e) => setNewClientStatus(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-border rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none"
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
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="bg-brand-card-hover border border-brand-border text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-colors">Cancelar</button>
                <button type="submit" className="bg-brand-primary hover:bg-brand-primary-hover text-brand-bg font-bold py-2.5 px-6 rounded-xl text-xs transition-all duration-300 shadow-md shadow-brand-primary/10 cursor-pointer">Adicionar Cliente</button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
