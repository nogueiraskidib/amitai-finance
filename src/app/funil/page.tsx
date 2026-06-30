'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Users, 
  Layers, 
  TrendingUp, 
  Clock, 
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
  MoreHorizontal,
  CheckSquare,
  Activity,
  HeartHandshake,
  Search,
  ChevronDown,
  ChevronUp,
  FileCheck,
  PlusCircle,
  ShieldAlert,
  Sparkles,
  Info
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
  name: string; // e.g. "Gestão de tráfego", "Criação de site", "Social media", "Branding", "Automações"
  responsible: string;
  status: 'Planejado' | 'Em andamento' | 'Crítico' | 'Concluído';
  progress: number; // 0 to 100
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
  stageId: number; // 1 to 12
  timeInStage: number; // in days
  status: string; // e.g. "Em andamento", "Pendente", "Concluído", "Crítico"
  tasks: GeneralTask[];
  history: LogItem[];
  createdAt: string;
  lastUpdated: string;
  
  // TAB 1: PERFIL DO CLIENTE
  niche?: string;
  responsible?: string;
  servicesContracted?: string; // Quick text summary of contracted services
  contractDuration?: string; // Tempo de contrato
  observations?: string; // Observações gerais
  importantInfo?: string; // Informações importantes

  // TAB 2: DOSSIÊ (Estudo estratégico)
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

  // TAB 3: SERVIÇOS ATIVOS
  servicesList: ClientService[];

  // TAB 4: OPERACIONAL
  internalResponsibles?: string; // Responsáveis internos (Neto, Gabriel, Manu)
  generalTasks: GeneralTask[];
  priority?: 'Baixa' | 'Média' | 'Alta';
  pendingIssues?: string; // Pendências
  calendarDate?: string; // Calendário
  operationalProgress?: string; // Andamento operacional
  internalObservations?: string; // Observações internas

  // Legacy field support for stage conversion
  origin?: string;
  contactDate?: string;
  conversationStatus?: string;
  meetingDate?: string;
  meetingTime?: string;
  meetingLink?: string;
  bookingStatus?: string;
  proposalSent?: boolean;
  contractValue?: string;
  forecastDate?: string;
  contractName?: string;
  signatureStatus?: string;
  sendDate?: string;
  progress?: number;
  requests?: string;
  priorityLevel?: string;

  assetsChecklist?: any[];
  operationalChecklist?: any[];
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

// Helper icon
function MessageSquareIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

const DEFAULT_CLIENTS: Client[] = [];

export default function FunilVendas() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Tab selected inside Client Details Modal (perfil, dossie, servicos, operacional, historico)
  const [modalActiveTab, setModalActiveTab] = useState<'perfil' | 'dossie' | 'servicos' | 'operacional' | 'historico'>('perfil');

  // Service expand/collapse inside Serviços tab
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);

  // Form State inside Serviços tab (adding a new service)
  const [newServiceName, setNewServiceName] = useState('Tráfego pago');
  const [newServiceResponsible, setNewServiceResponsible] = useState('Neto');
  
  // Form State for manual Timeline logs
  const [manualLogText, setManualLogText] = useState('');

  // Add Lead Form State
  const [newClientName, setNewClientName] = useState('');
  const [newClientStage, setNewClientStage] = useState(1);
  const [newClientResponsible, setNewClientResponsible] = useState('Neto');
  const [newClientStatus, setNewClientStatus] = useState('Em andamento');

  // Load and save state
  useEffect(() => {
    async function fetchClients() {
      const { data } = await supabase.from('clientes').select('*');
      if (data && data.length > 0) {
        setClients(data as Client[]);
      } else {
        setClients(DEFAULT_CLIENTS);
      }
    }
    fetchClients();
  }, []);

  const saveState = async (updatedClients: Client[]) => {
    setClients(updatedClients);
    // Upsert to Supabase
    for (const c of updatedClients) {
      await supabase.from('clientes').upsert({
        id: c.id,
        name: c.name,
        stageId: c.stageId,
        timeInStage: c.timeInStage,
        status: c.status,
        tasks: c.tasks,
        history: c.history,
        createdAt: c.createdAt,
        lastUpdated: c.lastUpdated,
        responsible: c.responsible,
        contractValue: c.contractValue,
        assetsChecklist: c.assetsChecklist,
        operationalChecklist: c.operationalChecklist,
        progress: c.progress
      });
    }
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
      generalTasks: [],
      servicesList: [],
      history: [
        { timestamp, action: `Cliente criado na etapa "${initialStageName}"`, user: newClientResponsible }
      ],
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      
      // Default empty profiles
      niche: '',
      contractDuration: '',
      observations: '',
      importantInfo: '',
      priority: 'Média'
    };

    const updated = [newClient, ...clients];
    saveState(updated);

    // Reset Form
    setNewClientName('');
    setNewClientStage(1);
    setNewClientStatus('Em andamento');
    setIsAddModalOpen(false);
    setSelectedClient(newClient);
    setIsModalOpen(true);
  };

  // Delete Client
  const handleDeleteClient = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este lead/cliente permanentemente do funil?')) {
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

  // Add Manual Log to Timeline History
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

  // RENEWAL PROCESS: Stage 12 -> Returns to Stage 4!
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
    alert(`Contrato de "${client.name}" renovado! O cliente retornou automaticamente para a Etapa 4.`);
    setIsModalOpen(false);
    setSelectedClient(null);
  };

  // --- SERVIÇOS ACTIVE TAB HELPER FUNCTIONS ---
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
    
    // Auto-update quick summary tags
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
    if (!confirm('Deseja realmente remover este serviço contratado?')) return;
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
        return {
          ...s,
          [field]: value
        };
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

  // Service tasks / checklists toggles
  const handleServiceTaskCheck = (clientId: string, serviceId: string, taskId: string, completed: boolean) => {
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const service = client.servicesList.find(s => s.id === serviceId);
    if (!service) return;

    const updatedTasks = service.tasks.map(t => t.id === taskId ? { ...t, completed } : t);
    
    // Auto calculate progress percentage from checklist
    const completedCount = updatedTasks.filter(item => item.completed).length;
    const totalCount = updatedTasks.length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const updatedServices = client.servicesList.map(s => {
      if (s.id === serviceId) {
        return {
          ...s,
          tasks: updatedTasks,
          progress: progressPercent
        };
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
    
    // Recalculate progress
    const completedCount = updatedTasks.filter(item => item.completed).length;
    const totalCount = updatedTasks.length;
    const progressPercent = Math.round((completedCount / totalCount) * 100);

    const updatedServices = client.servicesList.map(s => {
      if (s.id === serviceId) {
        return {
          ...s,
          tasks: updatedTasks,
          progress: progressPercent
        };
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
    
    // Recalculate progress
    const completedCount = updatedTasks.filter(item => item.completed).length;
    const totalCount = updatedTasks.length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const updatedServices = client.servicesList.map(s => {
      if (s.id === serviceId) {
        return {
          ...s,
          tasks: updatedTasks,
          progress: progressPercent
        };
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

  // Service related files list management
  const handleAddServiceFile = (clientId: string, serviceId: string, fileName: string, fileUrl: string) => {
    if (!fileName.trim()) return;
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const service = client.servicesList.find(s => s.id === serviceId);
    if (!service) return;

    const updatedFiles = [...(service.files || []), { id: 'file_' + Date.now(), name: fileName, url: fileUrl || '#' }];

    const updatedServices = client.servicesList.map(s => {
      if (s.id === serviceId) {
        return {
          ...s,
          files: updatedFiles
        };
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
        return {
          ...s,
          files: updatedFiles
        };
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


  // --- OPERACIONAL CHECKLIST & TASKS GENERAL ---
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


  // Filter clients by search query
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.niche?.toLowerCase().includes(search.toLowerCase()) ||
    c.responsible?.toLowerCase().includes(search.toLowerCase()) ||
    c.status.toLowerCase().includes(search.toLowerCase())
  );

  // Stats computation for Cone view
  const getStageStats = (stageId: number) => {
    const count = clients.filter(c => c.stageId === stageId).length;
    
    let conversionRate = 100;
    if (stageId > 1) {
      const prevCount = clients.filter(c => c.stageId === stageId - 1).length;
      if (prevCount > 0) {
        conversionRate = Math.round((count / prevCount) * 100);
      } else {
        conversionRate = count > 0 ? 100 : 0;
      }
    }

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

      {/* RENDER CONE/FUNNEL VISUALIZATION */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          <div className="xl:col-span-2 glass-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="text-brand-primary" />
                <h2 className="text-xl font-bold text-white">Visualização de Funil Estrutural (Cone)</h2>
              </div>
              <p className="text-xs text-brand-muted mb-8">
                As etapas comerciais e operacionais afunilam conforme os clientes progridem. As primeiras etapas representam maior volume de leads abordados, enquanto as últimas refletem o fechamento qualificado e operacionalizado.
              </p>
              
              <div className="space-y-2 select-none">
                {STAGES.map((stage, idx) => {
                  const stats = getStageStats(stage.id);
                  const baseWidth = 100 - (idx * 6.5);
                  const widthPercent = Math.max(baseWidth, 30);
                  
                  return (
                    <div 
                      key={stage.id} 
                      className="flex items-center justify-between group"
                    >
                      <span className="w-48 text-xs font-semibold text-brand-muted group-hover:text-brand-primary transition-colors truncate pr-2">
                        {stage.id}ª. {stage.name}
                      </span>
                      
                      <div className="flex-1 flex justify-center">
                        <div 
                          className="py-2.5 px-4 bg-brand-card hover:bg-brand-card-hover border border-brand-border rounded-xl transition-all duration-300 relative group-hover:border-brand-primary/30 flex justify-between items-center text-xs font-medium"
                          style={{ width: `${widthPercent}%` }}
                        >
                          <div className={`absolute top-0 left-0 bottom-0 w-1 ${stage.color.split(' ')[0]} rounded-l-xl`}></div>
                          
                          <span className="text-white font-semibold flex items-center gap-1.5">
                            {stage.optional && <span className="text-[9px] bg-brand-border text-brand-muted px-1.5 py-0.5 rounded uppercase font-bold">Opcional</span>}
                            <span>{stats.count} {stats.count === 1 ? 'cliente' : 'clientes'}</span>
                          </span>
                          
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

          <div className="space-y-6">
            
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

      {/* RENDER MODAL: EDIT LEAD DETAILS - REDESIGNED WITH 5 TABS! */}
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
                      <span className="text-xs text-brand-muted">• Atualizado em {selectedClient.lastUpdated.split('-').reverse().join('/')}</span>
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

              {/* 3 INTERNAL TABS NAVIGATION */}
              <div className="flex overflow-x-auto gap-2 p-1 bg-brand-bg border border-brand-border/80 rounded-xl custom-scrollbar">
                {[
                  { id: 'perfil', name: 'Geral', icon: User },
                  { id: 'servicos', name: 'Serviços Contratados', icon: FolderPlus },
                  { id: 'historico', name: 'Histórico & Linha do Tempo', icon: Activity }
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
              
              {/* TAB 1: GERAL */}
              {modalActiveTab === 'perfil' && (
                <div className="space-y-6 animate-in fade-in duration-300 text-xs">
                  <div className="bg-brand-bg/40 p-5 rounded-xl border border-brand-border space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-brand-muted uppercase mb-1.5">Nome do Cliente / Empresa</label>
                      <input 
                        type="text" 
                        value={selectedClient.name} 
                        onChange={(e) => updateClientField(selectedClient.id, 'name', e.target.value)}
                        className="w-full bg-brand-card border border-brand-border rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:border-brand-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-brand-muted uppercase mb-1.5">Observações Gerais</label>
                      <textarea 
                        value={selectedClient.observations || ''}
                        onChange={(e) => updateClientField(selectedClient.id, 'observations', e.target.value)}
                        placeholder="Escreva notas, lembretes ou informações gerais sobre o cliente..."
                        rows={10}
                        className="w-full bg-brand-card border border-brand-border rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SERVIÇOS */}
              {modalActiveTab === 'servicos' && (
                <div className="space-y-6 animate-in fade-in duration-300 text-xs">
                  
                  {/* Top Bar inside Services tab to add a Service */}
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
                      className="w-full sm:w-auto bg-brand-primary hover:bg-brand-primary-hover text-brand-bg font-bold py-2 px-5 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors shadow shadow-brand-primary/5"
                    >
                      <PlusCircle size={16} />
                      Contratar Serviço
                    </button>
                  </div>

                  {/* List of active contracted services */}
                  <div className="space-y-4">
                    {(!selectedClient.servicesList || selectedClient.servicesList.length === 0) ? (
                      <div className="text-center p-12 border border-dashed border-brand-border/40 rounded-xl">
                        <FolderPlus className="mx-auto text-brand-muted/40 mb-3" size={32} />
                        <p className="text-brand-muted italic">Nenhum serviço contratado no momento. Use o seletor acima para adicionar.</p>
                      </div>
                    ) : (
                      selectedClient.servicesList.map(service => {
                        const isExpanded = expandedServiceId === service.id;
                        
                        return (
                          <div 
                            key={service.id} 
                            className="bg-brand-card border border-brand-border rounded-xl transition-all duration-300"
                          >
                            {/* Service Header */}
                            <div 
                              onClick={() => setExpandedServiceId(isExpanded ? null : service.id)}
                              className="p-4 flex items-center justify-between cursor-pointer hover:bg-brand-card-hover transition-colors rounded-t-xl"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                                <span className={`w-3 h-3 rounded-full shrink-0 ${
                                  service.status === 'Concluído' ? 'bg-emerald-400' :
                                  service.status === 'Crítico' ? 'bg-red-400' :
                                  service.status === 'Planejado' ? 'bg-amber-400' :
                                  'bg-brand-primary'
                                }`}></span>
                                <h4 className="font-bold text-white text-sm truncate">{service.name}</h4>
                                <span className="text-[10px] text-brand-muted">• por {service.responsible}</span>
                              </div>

                              <div className="flex items-center gap-4">
                                {/* Compact Progress indicator */}
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-brand-primary font-bold">{service.progress}%</span>
                                  <div className="w-16 bg-brand-bg h-1.5 rounded-full overflow-hidden border border-brand-border hidden sm:block">
                                    <div className="bg-brand-primary h-full" style={{ width: `${service.progress}%` }}></div>
                                  </div>
                                </div>
                                {isExpanded ? <ChevronUp size={16} className="text-brand-muted" /> : <ChevronDown size={16} className="text-brand-muted" />}
                              </div>
                            </div>

                            {/* Service Body Details (Expanded View) */}
                            {isExpanded && (
                              <div className="p-4 border-t border-brand-border/60 bg-brand-card/30 space-y-6 animate-in slide-in-from-top-2 duration-300 rounded-b-xl">
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

                                {/* Custom checklist for this service */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                      <label className="text-[10px] text-brand-muted uppercase font-bold">Checklist Operacional</label>
                                      <span className="text-[10px] text-brand-primary font-bold">{service.progress}% feito</span>
                                    </div>
                                    
                                    <div className="space-y-1.5 bg-brand-bg/50 p-3 rounded-xl border border-brand-border max-h-[140px] overflow-y-auto custom-scrollbar">
                                      {service.tasks.length === 0 ? (
                                        <p className="text-[10px] text-brand-muted italic">Nenhuma atividade operacional pendente.</p>
                                      ) : (
                                        service.tasks.map(sTask => (
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
                                        ))
                                      )}
                                    </div>

                                    {/* Add Service Task Form */}
                                    <form onSubmit={(e) => {
                                      e.preventDefault();
                                      const input = (e.target as any).sTaskInput;
                                      handleAddServiceTask(selectedClient.id, service.id, input.value);
                                      input.value = '';
                                    }} className="flex gap-2">
                                      <input
                                        type="text"
                                        name="sTaskInput"
                                        placeholder="Nova tarefa operacional..."
                                        className="flex-1 bg-brand-bg border border-brand-border rounded-lg py-1.5 px-3 text-[11px]"
                                      />
                                      <button 
                                        type="submit"
                                        className="bg-brand-primary-dim hover:bg-brand-primary hover:text-brand-bg text-brand-primary text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                      >
                                        Criar
                                      </button>
                                    </form>
                                  </div>

                                  {/* Service Files checklist tab */}
                                  <div className="space-y-3">
                                    <label className="text-[10px] text-brand-muted uppercase font-bold block">Arquivos & Links Relacionados</label>
                                    
                                    <div className="space-y-1.5 bg-brand-bg/50 p-3 rounded-xl border border-brand-border max-h-[140px] overflow-y-auto custom-scrollbar">
                                      {(!service.files || service.files.length === 0) ? (
                                        <p className="text-[10px] text-brand-muted italic">Nenhum arquivo ou link de briefing associado.</p>
                                      ) : (
                                        service.files.map(sFile => (
                                          <div key={sFile.id} className="flex items-center justify-between py-1 border-b border-brand-border/20 last:border-0">
                                            <a
                                              href={sFile.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-brand-primary hover:text-brand-primary-hover flex items-center gap-1.5 text-[11px] truncate max-w-[180px]"
                                            >
                                              <LinkIcon size={10} />
                                              {sFile.name}
                                            </a>
                                            <button
                                              onClick={() => handleDeleteServiceFile(selectedClient.id, service.id, sFile.id)}
                                              className="text-brand-danger/60 hover:text-brand-danger p-0.5 animate-in fade-in"
                                            >
                                              <Trash2 size={10} />
                                            </button>
                                          </div>
                                        ))
                                      )}
                                    </div>

                                    {/* Add File/Link Form */}
                                    <form onSubmit={(e) => {
                                      e.preventDefault();
                                      const nameInput = (e.target as any).fileNameInput;
                                      const urlInput = (e.target as any).fileUrlInput;
                                      handleAddServiceFile(selectedClient.id, service.id, nameInput.value, urlInput.value);
                                      nameInput.value = '';
                                      urlInput.value = '';
                                    }} className="flex gap-2 flex-col sm:flex-row">
                                      <input
                                        type="text"
                                        name="fileNameInput"
                                        required
                                        placeholder="Nome do arquivo..."
                                        className="flex-1 bg-brand-bg border border-brand-border rounded-lg py-1.5 px-3 text-[11px]"
                                      />
                                      <input
                                        type="text"
                                        name="fileUrlInput"
                                        placeholder="https://drive.google.com/..."
                                        className="flex-1 bg-brand-bg border border-brand-border rounded-lg py-1.5 px-3 text-[11px]"
                                      />
                                      <button 
                                        type="submit"
                                        className="bg-brand-primary-dim hover:bg-brand-primary hover:text-brand-bg text-brand-primary text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                      >
                                        Adicionar
                                      </button>
                                    </form>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-[10px] font-semibold text-brand-muted uppercase mb-1">Entregas Realizadas / Ativos Gerados</label>
                                    <textarea
                                      value={service.deliveries || ''}
                                      onChange={(e) => handleUpdateServiceField(selectedClient.id, service.id, 'deliveries', e.target.value)}
                                      placeholder="Ex: Landing Page de Lançamento criada e integrada, 12 anúncios publicados..."
                                      rows={2}
                                      className="w-full bg-brand-bg border border-brand-border rounded-lg py-1.5 px-2 text-white"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-semibold text-brand-muted uppercase mb-1">Observações de Execução</label>
                                    <textarea
                                      value={service.observations || ''}
                                      onChange={(e) => handleUpdateServiceField(selectedClient.id, service.id, 'observations', e.target.value)}
                                      placeholder="Notas específicas sobre problemas na conta do tráfego ou alinhamento com design..."
                                      rows={2}
                                      className="w-full bg-brand-bg border border-brand-border rounded-lg py-1.5 px-2 text-white"
                                    />
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



              {/* TAB 5: HISTÓRICO & TIMELINE */}
              {modalActiveTab === 'historico' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  
                  {/* Manual Log Timeline Form */}
                  <div className="bg-brand-bg/50 p-4 rounded-xl border border-brand-border/60">
                    <label className="block text-xs font-bold text-brand-muted uppercase mb-2 flex items-center gap-1">
                      <PlusCircle size={14} className="text-brand-primary" /> Registrar Novo Evento na Linha do Tempo
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input 
                        type="text" 
                        value={manualLogText}
                        onChange={(e) => setManualLogText(e.target.value)}
                        placeholder="Ex: Reunião estratégica de Kickoff realizada com Neto. Proposta comercial aceita sem descontos."
                        className="flex-1 bg-brand-card border border-brand-border rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-brand-primary"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddManualLog(selectedClient.id);
                        }}
                      />
                      <button 
                        onClick={() => handleAddManualLog(selectedClient.id)}
                        className="bg-brand-primary hover:bg-brand-primary-hover text-brand-bg font-bold py-2 px-5 rounded-xl text-xs transition-colors cursor-pointer shrink-0"
                      >
                        Registrar Evento
                      </button>
                    </div>
                    <p className="text-[10px] text-brand-muted mt-1.5 italic">
                      💡 Use este campo para documentar reuniões feitas, conversas importantes, entregas enviadas ou alterações operacionais.
                    </p>
                  </div>

                  {/* Log Timeline list */}
                  <div className="glass-card p-6">
                    <h3 className="font-bold text-white text-sm mb-6 flex items-center gap-1.5 border-b border-brand-border/40 pb-3">
                      <Activity size={16} className="text-brand-primary" /> Linha do Tempo Operacional & Comercial
                    </h3>

                    <div className="space-y-6 border-l border-brand-border pl-4 max-h-[350px] overflow-y-auto custom-scrollbar">
                      {selectedClient.history.length === 0 ? (
                        <p className="text-xs text-brand-muted italic">Nenhuma interação registrada no histórico do cliente.</p>
                      ) : (
                        selectedClient.history.map((log, idx) => (
                          <div key={idx} className="relative py-1">
                            <span className="absolute -left-[21px] top-2.5 w-2 h-2 rounded-full bg-brand-primary glow-primary"></span>
                            
                            <div className="text-[10px] text-brand-muted">
                              {log.timestamp} • por <strong className="text-white">{log.user}</strong>
                            </div>
                            <div className="text-xs text-white font-medium mt-1 leading-relaxed bg-brand-bg/40 p-2.5 rounded-lg border border-brand-border/30 mt-1">
                              {log.action}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SPECIAL OPERATIONAL RENEWAL BUTTON IN HEADER COMPATIBILITY */}
              {selectedClient.stageId === 12 && modalActiveTab !== 'historico' && (
                <div className="p-4 bg-brand-bg/50 border border-brand-primary/20 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                  <div>
                    <h4 className="font-bold text-brand-primary flex items-center gap-1.5 uppercase tracking-wide">
                      <RefreshCw size={14} className="animate-spin" /> O Cliente está qualificado para Renovação
                    </h4>
                    <p className="text-brand-muted mt-1">Clique para confirmar a renovação e reiniciar o ciclo operacional de assinatura contratual.</p>
                  </div>
                  <button 
                    onClick={() => handleRenewContract(selectedClient)}
                    className="bg-brand-primary hover:bg-brand-primary-hover text-brand-bg font-bold py-2.5 px-6 rounded-xl transition-all duration-300 flex items-center gap-1.5 cursor-pointer transform active:scale-95 text-xs shadow-md shadow-brand-primary/10"
                  >
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
                <Trash2 size={14} />
                Excluir Lead
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
