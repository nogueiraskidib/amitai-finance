'use client';

// Vercel trigger deploy
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Workflow, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Copy, 
  Archive, 
  CheckSquare, 
  Square, 
  User, 
  Clock, 
  ArrowRight, 
  Tag, 
  ChevronRight, 
  X, 
  Cpu, 
  BookOpen, 
  Info, 
  FileText, 
  Sparkles,
  ClipboardList,
  Camera,
  MessageSquare,
  Mail,
  UserCheck,
  Video,
  ListTodo,
  TrendingUp,
  Activity,
  Layers,
  Download
} from 'lucide-react';

// Type definitions
interface ChecklistItem {
  id: string;
  texto: string;
  concluida: boolean;
}

interface Processo {
  id: string;
  tipo: 'interno' | 'externo';
  nome: string;
  responsavel: string;
  objetivo?: string; // Exclusivo Interno
  descricao: string;
  checklist: ChecklistItem[];
  passoAPasso?: string[]; // Exclusivo Interno
  etapas?: string[]; // Exclusivo Externo
  prazo: string;
  status: 'Ativo' | 'Rascunho' | 'Arquivado';
  automacoes?: string[];
  materiais?: string[]; // Exclusivo Externo
  sop?: string; // Exclusivo Externo
  observacoes?: string;
}

interface TarefaIntegrante {
  id: string;
  texto: string;
  concluida: boolean;
}

interface Integrante {
  id: string;
  nome: string;
  cargo: string;
  fotoGradient: string;
  borderColor: string;
  responsabilidades: string[];
  tarefas: TarefaIntegrante[];
  observacoes: string;
}

// 15 Default seeded processes mapping to team members exactly
const DEFAULT_PROCESSOS: Processo[] = [
  // --- NETO (Tecnologia & Infraestrutura) ---
  {
    id: 'neto-proc-1',
    tipo: 'interno',
    nome: 'Prospecção pelo WhatsApp (Neto)',
    responsavel: 'Neto',
    objetivo: 'Abordar ativamente leads qualificados ofertando soluções em infraestrutura de software e automações.',
    descricao: 'Fluxo operacional de disparo de contatos focados em decisores técnicos no WhatsApp utilizando estratégias de validação rápida de interesse.',
    status: 'Ativo',
    prazo: 'Diário',
    checklist: [
      { id: 'ni1_1', texto: 'Selecionar 10 leads com gargalos de infraestrutura técnica', concluida: false },
      { id: 'ni1_2', texto: 'Disparar mensagens de primeiro contato com caso de sucesso técnico', concluida: false },
      { id: 'ni1_3', texto: 'Contornar objeções iniciais sobre custo de servidores/nuvem', concluida: false },
      { id: 'ni1_4', texto: 'Direcionar leads interessados para chamada de 15 minutos no Meets', concluida: false }
    ],
    passoAPasso: [
      'Mapear empresas que utilizam plataformas legadas ou lentas.',
      'Construir proposta de valor focada em segurança de dados e velocidade.',
      'Enviar pitch direto destacando eficiência técnica e otimização financeira.',
      'Agendar bate-papo de alinhamento com Neto no Google Calendar.'
    ],
    automacoes: [
      'Zapier: Marcação de interesse no CRM -> Disparo de alerta no Slack',
      'Integração Whats Web para atalhos de digitação rápida'
    ],
    observacoes: 'Seja extremamente preciso nos termos técnicos e evite falar de termos extremamente abstratos de vendas.'
  },
  {
    id: 'neto-proc-2',
    tipo: 'interno',
    nome: 'Criação de Ativos',
    responsavel: 'Neto',
    objetivo: 'Gerar componentes visuais e templates estruturais de código reutilizáveis pela equipe de desenvolvimento.',
    descricao: 'Desenho estrutural no Figma e codificação técnica em repositórios privados de templates para acelerar a entrega de novos projetos.',
    status: 'Ativo',
    prazo: 'Semanal',
    checklist: [
      { id: 'ni2_1', texto: 'Pesquisar tendências globais de UI/UX em portais de design', concluida: false },
      { id: 'ni2_2', texto: 'Construir wireframes e guias de estilos de novos componentes', concluida: false },
      { id: 'ni2_3', texto: 'Codificar componentes em React com Tailwind CSS v4 limpo', concluida: false },
      { id: 'ni2_4', texto: 'Realizar testes de acessibilidade e compatibilidade em telas móveis', concluida: false }
    ],
    passoAPasso: [
      'Identificar padrões repetitivos no código dos projetos recentes.',
      'Abstrair esses padrões em componentes totalmente configuráveis (botões, cards, menus).',
      'Organizar os arquivos no repositório NPM/GitHub privado da agência.',
      'Notificar o restante da equipe sobre as novas atualizações.'
    ],
    automacoes: [
      'GitHub Actions: Build automático e testes ao commitar código'
    ],
    observacoes: 'Foco absoluto em clean code, comentários úteis e propriedades semânticas intuitivas.'
  },
  {
    id: 'neto-proc-3',
    tipo: 'externo',
    nome: 'Criação de Sites',
    responsavel: 'Neto',
    descricao: 'Construção de aplicações web robustas, rápidas e com SEO técnico avançado, visando gerar a melhor usabilidade ao usuário final.',
    status: 'Ativo',
    prazo: '15 dias úteis',
    checklist: [
      { id: 'ni3_1', texto: 'Instalar domínio, certificados SSL e configurar hospedagem VPS', concluida: false },
      { id: 'ni3_2', texto: 'Modelar banco de dados se necessário e criar rotas de páginas', concluida: false },
      { id: 'ni3_3', texto: 'Executar codificação e testes locais de formulários', concluida: false },
      { id: 'ni3_4', texto: 'Configurar painel administrativo de controle de conteúdo para o cliente', concluida: false },
      { id: 'ni3_5', texto: 'Otimizar imagens e scripts para garantir carregamento instantâneo', concluida: false }
    ],
    etapas: [
      'Reunir briefing aprovado e layouts do Figma.',
      'Estruturar o boilerplate Next.js com as configurações de SEO adequadas.',
      'Desenvolver o layout pixel-perfect para resoluções desktop e mobile.',
      'Testar integração das LPs com os CRMs e ferramentas de e-mail dos clientes.',
      'Publicar oficialmente e homologar domínio.'
    ],
    automacoes: [
      'Vercel Integration: Deploy automatizado no branch principal',
      'Webhooks de notificações de formulário encaminhados ao e-mail'
    ],
    materiais: [
      'Domínio e Hospedagem',
      'Logotipos e identidade visual do cliente',
      'Textos e imagens institucionais'
    ],
    sop: 'Garantir a instalação correta do certificado SSL. Validar formulários de contato antes de publicar. Verificar responsividade em celulares.',
    observacoes: 'Nenhum site deve ser entregue sem tags OG configuradas e pontuação acima de 85 no PageSpeed.'
  },
  {
    id: 'neto-proc-4',
    tipo: 'externo',
    nome: 'Criação de Automações',
    responsavel: 'Neto',
    descricao: 'Desenvolvimento de integrações via webhooks, APIs nativas ou ferramentas sem código para fluxo fluído de dados corporativos.',
    status: 'Ativo',
    prazo: '3 dias úteis',
    checklist: [
      { id: 'ni4_1', texto: 'Auditar as rotinas manuais da equipe para propor fluxos automáticos', concluida: false },
      { id: 'ni4_2', texto: 'Criar conexões API seguras (OAuth) entre as plataformas especificadas', concluida: false },
      { id: 'ni4_3', texto: 'Definir caminhos de tratamento de dados e tratativas para dados nulos', concluida: false },
      { id: 'ni4_4', texto: 'Ativar monitoramento automático e tratamento de erros do fluxo', concluida: false }
    ],
    etapas: [
      'Esboçar a jornada dos dados no papel (Miro) antes de implementar.',
      'Construir e testar os gatilhos (triggers) nas plataformas integradoras (Make/Zapier).',
      'Criar condicionais para evitar execuções redundantes e custos extras de chamadas.',
      'Habilitar alertas de falhas em tempo real para tomada de ação rápida.'
    ],
    automacoes: [
      'Zapier / Make para controle interno',
      'Robôs de contingência que validam o status dos servidores'
    ],
    materiais: [
      'Acessos das ferramentas a serem integradas (API Keys / Contas)',
      'Mapeamento de fluxo / Diagrama de processos'
    ],
    sop: 'Testar todas as rotas e condicionais no ambiente de sandbox antes de ativar em produção. Monitorar execuções de erro.',
    observacoes: 'Garantir que as senhas e chaves de API fiquem totalmente seguras em variáveis de ambiente (.env).'
  },

  // --- MANU (Comunicação & Customer Success) ---
  {
    id: 'manu-proc-1',
    tipo: 'interno',
    nome: 'Prospecção pelo WhatsApp (Manu)',
    responsavel: 'Manu',
    objetivo: 'Estabelecer conexões comerciais personalizadas via WhatsApp com base em conexões de networking e indicações recebidas.',
    descricao: 'Processo focado em criar conexões empáticas, colher dores iniciais e oferecer suporte estratégico aos potenciais clientes da agência.',
    status: 'Ativo',
    prazo: 'Diário',
    checklist: [
      { id: 'mi1_1', texto: 'Extrair 10 contatos de leads obtidos em eventos/indicações', concluida: false },
      { id: 'mi1_2', texto: 'Disparar mensagens calorosas e cordiais de aproximação comercial', concluida: false },
      { id: 'mi1_3', texto: 'Identificar a maturidade operacional e as dores de marketing do lead', concluida: false },
      { id: 'mi1_4', texto: 'Ofertar agendamento de uma reunião de diagnóstico de vendas', concluida: false }
    ],
    passoAPasso: [
      'Pesquisar sobre o negócio do prospect antes de enviar a mensagem inicial.',
      'Enviar mensagem personalizada citando indicações ou interesses mútuos.',
      'Conduzir o lead respondendo dúvidas de forma simples e rápida.',
      'Sugerir chamada de apresentação e enviar o Calendly corporativo.'
    ],
    automacoes: [
      'Integração Planilhas de Networking -> CRM da Agência',
      'Templates rápidos salvos no teclado para agilidade'
    ],
    observacoes: 'Priorizar sempre a criação de valor e relacionamento sobre a insistência imediata na venda.'
  },
  {
    id: 'manu-proc-2',
    tipo: 'externo',
    nome: 'Comunicação com Clientes',
    responsavel: 'Manu',
    descricao: 'Gestão de contatos ativos diários, alinhamento de entregáveis semanais e manutenção do canal do cliente totalmente atualizado.',
    status: 'Ativo',
    prazo: 'Contínuo',
    checklist: [
      { id: 'mi2_1', texto: 'Revisar e responder todos os canais de clientes no Slack/WhatsApp até as 11h', concluida: false },
      { id: 'mi2_2', texto: 'Enviar relatórios rápidos de tarefas concluídas na semana (Sexta-feira)', concluida: false },
      { id: 'mi2_3', texto: 'Coletar feedbacks de aprovação das peças operacionais (design/vídeo)', concluida: false },
      { id: 'mi2_4', texto: 'Disparar pesquisa rápida de NPS a cada 45 dias de contrato', concluida: false }
    ],
    etapas: [
      'Iniciar a rotina do dia checando notificações acumuladas e marcando urgências.',
      'Fazer a ponte entre as solicitações de clientes e os respectivos técnicos da agência.',
      'Manter o tom de comunicação calmo, acolhedor e sempre prestativo.',
      'Documentar feedbacks de insatisfação para debater nas reuniões semanais de sócios.'
    ],
    automacoes: [
      'Zapier: Alerta automático no canal interno se o cliente ficar 72h sem receber mensagens'
    ],
    materiais: [
      'Acessos aos canais do cliente (Slack/WhatsApp)',
      'Scripts de atendimento padrão',
      'Links para relatórios de progresso'
    ],
    sop: 'Manter tom empático e cordial. Responder em menos de 2 horas em horário comercial. Encaminhar urgências técnicas para Neto/Gabriel.',
    observacoes: 'Garantir tempo de resposta (SLA) inferior a 2 horas para mensagens recebidas no horário comercial.'
  },
  {
    id: 'manu-proc-3',
    tipo: 'externo',
    nome: 'Agendamento de Reuniões',
    responsavel: 'Manu',
    descricao: 'Agendamento comercial de propostas e reuniões operacionais de novos clientes garantindo preparação prévia de salas e links.',
    status: 'Ativo',
    prazo: 'Diário',
    checklist: [
      { id: 'mi3_1', texto: 'Organizar janelas de disponibilidade comercial de Gabriel e Neto', concluida: false },
      { id: 'mi3_2', texto: 'Enviar link do Calendly customizado para o lead/cliente escolher', concluida: false },
      { id: 'mi3_3', texto: 'Confirmar participação de todos com mensagem gentil 2 horas antes', concluida: false },
      { id: 'mi3_4', texto: 'Cadastrar convite com pauta resumida e link da sala de vídeo Meet', concluida: false }
    ],
    etapas: [
      'Confirmar se os sócios necessários estão realmente sem conflitos de agenda.',
      'Gerar link e convite adicionando pauta clara (Ex: Reunião de Proposta Comercial).',
      'Certificar-se de que o link do Google Meet está criado e anexado.',
      'Verificar se o cliente aceitou o convite formal no Google Calendar.'
    ],
    automacoes: [
      'Calendly integrado com Google Meet e Calendars individuais',
      'Mensagem automática de lembrete enviada via WhatsApp'
    ],
    materiais: [
      'Calendário integrado dos sócios',
      'Link do Calendly',
      'Conta de e-mail institucional'
    ],
    sop: 'Verificar disponibilidade de todos os participantes. Confirmar 2h antes. Certificar link do Meet.',
    observacoes: 'Nunca marque reuniões com menos de 24h de antecedência sem a concordância prévia do time técnico.'
  },
  {
    id: 'manu-proc-4',
    tipo: 'externo',
    nome: 'Criação de Grupos',
    responsavel: 'Manu',
    descricao: 'Criação, moderação técnica e padronização visual dos grupos de projetos no Slack e WhatsApp com os materiais iniciais de boas-vindas.',
    status: 'Ativo',
    prazo: '24 horas após venda',
    checklist: [
      { id: 'mi4_1', texto: 'Criar canal exclusivo de comunicação (Slack/WhatsApp)', concluida: false },
      { id: 'mi4_2', texto: 'Convidar integrantes essenciais da agência e decisores do cliente', concluida: false },
      { id: 'mi4_3', texto: 'Fixar links do Dashboard, pasta de Drive e formulário de briefings', concluida: false },
      { id: 'mi4_4', texto: 'Disparar mensagem institucional padronizada de boas-vindas', concluida: false }
    ],
    etapas: [
      'Definir com o comercial qual o canal de comunicação eleito pelo cliente no fechamento.',
      'Criar canal no Slack com a nomenclatura padrão: #cli-[nome-do-cliente].',
      'Configurar o cabeçalho do canal fixando links vitais do projeto.',
      'Escrever mensagem de introdução explicando o fluxo de suporte e horários da agência.'
    ],
    automacoes: [
      'Zapier: Assinatura de contrato -> Abertura de canal no Slack automaticamente'
    ],
    materiais: [
      'Dados do contrato assinado',
      'Lista de contatos do cliente',
      'Links úteis do projeto'
    ],
    sop: 'Seguir nomenclatura padrão #cli-[nome-do-cliente]. Adicionar links vitais e mensagem de onboarding.',
    observacoes: 'Garantir que a identidade visual e o tom premium de boas-vindas sejam mantidos em toda a iniciação do grupo.'
  },

  // --- GABRIEL (Comercial, Vídeo & Tráfego) ---
  {
    id: 'gabriel-proc-1',
    tipo: 'interno',
    nome: 'Prospecção pelo LinkedIn',
    responsavel: 'Gabriel',
    objetivo: 'Gerar conexões comerciais de alto valor com CEOs, Diretores de Marketing e CMOs no LinkedIn.',
    descricao: 'Rotina diária de busca, interação orgânica com posts de decisores e abordagens comerciais personalizadas.',
    status: 'Ativo',
    prazo: 'Diário',
    checklist: [
      { id: 'gi1_1', texto: 'Selecionar 15 novos perfis tomadores de decisão (LinkedIn Sales Navigator)', concluida: false },
      { id: 'gi1_2', texto: 'Comentar com valor em 5 publicações dos prospects mapeados', concluida: false },
      { id: 'gi1_3', texto: 'Enviar convite de conexão com nota explicativa e personalizada', concluida: false },
      { id: 'gi1_4', texto: 'Iniciar conversa no chat abordando dores comuns de marketing/escala', concluida: false }
    ],
    passoAPasso: [
      'Configurar filtros de pesquisa do Sales Navigator baseado no ICP da agência.',
      'Criar presença de valor comentando de forma genuína nas postagens dos alvos.',
      'Solicitar conexão enviando nota corta, focada em networking profissional.',
      'Apresentar soluções da agência sem tom intrusivo de venda rápida.'
    ],
    automacoes: [
      'Apollo.io para enriquecimento de contatos direto do LinkedIn'
    ],
    observacoes: 'Nunca use scripts de cópia e cola prontos. Personalize citando dados específicos da empresa da pessoa.'
  },
  {
    id: 'gabriel-proc-2',
    tipo: 'externo',
    nome: 'Criação de Dossiês',
    responsavel: 'Gabriel',
    descricao: 'Levantamento de dados públicos dos concorrentes do lead, campanhas ativas de anúncios e velocidade do site do cliente potencial.',
    status: 'Ativo',
    prazo: '24h antes da reunião',
    checklist: [
      { id: 'gi2_1', texto: 'Investigar criativos de anúncios ativos da concorrência na Ad Library', concluida: false },
      { id: 'gi2_2', texto: 'Auditar velocidade de carregamento da página de vendas atual do lead', concluida: false },
      { id: 'gi2_3', texto: 'Mapear falhas de rastreamento (Pixel, Tags) no site do prospect', concluida: false },
      { id: 'gi2_4', texto: 'Sintetizar as oportunidades em uma apresentação visual premium (Canva)', concluida: false }
    ],
    etapas: [
      'Receber dados do lead qualificado do funil comercial.',
      'Acessar ferramentas de espionagem de tráfego (Semrush/SpyFu) e Ad Library.',
      'Esboçar os 3 principais erros encontrados na estrutura do lead.',
      'Gerar apresentação objetiva mostrando soluções de curto e longo prazo que a agência fará.'
    ],
    automacoes: [
      'Geração automática de relatórios básicos de velocidade via APIs do PageSpeed'
    ],
    materiais: [
      'Briefing comercial',
      'Ferramentas de análise (Semrush/SpyFu)',
      'Template de apresentação no Canva'
    ],
    sop: 'Auditar erros críticos estruturais e campanhas de anúncios dos concorrentes. Apresentar de forma visual e premium.',
    observacoes: 'O dossiê deve focar nas soluções práticas e em como a agência resolverá os gargalos.'
  },
  {
    id: 'gabriel-proc-3',
    tipo: 'interno',
    nome: 'Estrutura da Amitai',
    responsavel: 'Gabriel',
    objetivo: 'Gerenciar os fluxos corporativos internos, documentações operacionais e rumos estratégicos da agência.',
    descricao: 'Revisão periódica de metas comerciais globais, performance de lucratividade e cultura de inovação interna.',
    status: 'Ativo',
    prazo: 'Semanal',
    checklist: [
      { id: 'gi3_1', texto: 'Revisar faturamento mensal e margem líquida da agência', concluida: false },
      { id: 'gi3_2', texto: 'Atualizar e validar o status dos OKRs trimestrais da equipe', concluida: false },
      { id: 'gi3_3', texto: 'Liderar reunião de alinhamento estratégico de sócios às segundas', concluida: false },
      { id: 'gi3_4', texto: 'Propor ajustes operacionais de processos baseados em gargalos atuais', concluida: false }
    ],
    passoAPasso: [
      'Compilar dados das planilhas de finanças e progresso de projetos.',
      'Organizar a pauta de reuniões de conselho com Neto e Manu.',
      'Debater a necessidade de novos investimentos e contratações.',
      'Definir prioridades operacionais da agência para os próximos 7 dias.'
    ],
    automacoes: [
      'Notificações semanais de status financeiro direto no Slack'
    ],
    observacoes: 'Garantir que la agência cresça com bases sólidas, sem perder a qualidade de atendimento premium.'
  },
  {
    id: 'gabriel-proc-4',
    tipo: 'externo',
    nome: 'Gestão de Tráfego Pago',
    responsavel: 'Gabriel',
    descricao: 'Configuração, análise analítica avançada e otimização diária de contas em Meta Ads, Google Ads e LinkedIn Ads.',
    status: 'Ativo',
    prazo: 'Diário',
    checklist: [
      { id: 'gi4_1', texto: 'Verificar orçamentos e gastos diários das contas sob responsabilidade', concluida: false },
      { id: 'gi4_2', texto: 'Analisar custo por lead (CPL) e ROI de conversões do dia anterior', concluida: false },
      { id: 'gi4_3', texto: 'Ajustar lances de leilão e segmentações de público ativo', concluida: false },
      { id: 'gi4_4', texto: 'Desenvolver testes A/B estruturados para criativos de anúncios', concluida: false }
    ],
    etapas: [
      'Abrir os painéis dos gerenciadores de anúncios logo pela manhã.',
      'Realizar otimizações de orçamento entre campanhas vencedoras e perdedoras.',
      'Mapear necessidade de produção de novos criativos gráficos e vídeos.',
      'Atualizar o dashboard do Google Looker Studio para o cliente.'
    ],
    automacoes: [
      'Integração direta Looker Studio com contas de anúncios',
      'Regras automáticas de orçamento para pausar anúncios ineficientes'
    ],
    materiais: [
      'Acessos aos gerenciadores de anúncios',
      'Links de rastreamento (Pixel, tags)',
      'Criativos de imagem e vídeo'
    ],
    sop: 'Análise diária de métricas (CPL, ROI, CPA). Realizar otimizações de verba e testes A/B de criativos.',
    observacoes: 'Foco irredutível na diminuição constante do CPA mantendo a alta qualificação do lead.'
  },
  {
    id: 'gabriel-proc-5',
    tipo: 'interno',
    nome: 'Captação de Vídeo da Amitai',
    responsavel: 'Gabriel',
    objetivo: 'Dirigir e captar vídeos em alta definição para criação de criativos publicitários ou materiais institucionais.',
    descricao: 'Preparação técnica de iluminação, microfones, enquadramentos de câmera e direção de cena de clientes e equipe.',
    status: 'Ativo',
    prazo: 'Sob Demanda',
    checklist: [
      { id: 'gi5_1', texto: 'Desenhar ou validar o roteiro do vídeo e roteiros de falas', concluida: false },
      { id: 'gi5_2', texto: 'Testar e configurar câmera, lentes, microfones e iluminação', concluida: false },
      { id: 'gi5_3', texto: 'Dirigir a gravação cobrando energia, clareza e ritmo ideal', concluida: false },
      { id: 'gi5_4', texto: 'Subir e organizar todo material bruto no Drive da equipe de edição', concluida: false }
    ],
    passoAPasso: [
      'Planejar cenários e luzes adequados para transmitir o tom do vídeo.',
      'Fazer testes rápidos de áudio (lapela) antes da gravação oficial.',
      'Executar as tomadas gravando em múltiplos enquadramentos (aberto/fechado).',
      'Descarregar arquivos e renomear organizando por takes aprovados.'
    ],
    automacoes: [
      'Geração automática de notas de backup no Drive'
    ],
    observacoes: 'Vídeo excelente requer iluminação correta e áudio 100% livre de ruídos.'
  },
  {
    id: 'gabriel-proc-6',
    tipo: 'externo',
    nome: 'Captação de Foto',
    responsavel: 'Gabriel',
    descricao: 'Ensaios fotográficos conduzidos presencialmente focados em autoridade, branding pessoal e design de posts da agência.',
    status: 'Ativo',
    prazo: 'Sob Demanda',
    checklist: [
      { id: 'gi6_1', texto: 'Criar moodboard conceitual de poses no Canva/Pinterest', concluida: false },
      { id: 'gi6_2', texto: 'Configurar câmera (ISO, velocidade, foco) e luzes de flash', concluida: false },
      { id: 'gi6_3', texto: 'Conduzir a sessão fotográfica deixando o retratado confiante', concluida: false },
      { id: 'gi6_4', texto: 'Selecionar as fotos brutas chave e encaminhar ao designer para tratamento', concluida: false }
    ],
    etapas: [
      'Preparar cenários adequados alinhados às cores de marca do cliente.',
      'Orientar o posicionamento e expressões faciais corporativas do retratado.',
      'Fotografar em formato RAW para maior flexibilidade na pós-produção.',
      'Exportar a galeria bruta de seleção rápida para o cliente aprovar.'
    ],
    automacoes: [],
    materiais: [
      'Câmera e lentes limpas',
      'Equipamento de iluminação e flash',
      'Moodboard conceitual de poses'
    ],
    sop: 'Garantir enquadramento profissional e iluminação adequada. Exportar fotos em formato RAW para edição.',
    observacoes: 'Garantir que as fotos retratem dinamismo, confiança e elegância premium.'
  },
  {
    id: 'gabriel-proc-7',
    tipo: 'externo',
    nome: 'Treinamentos',
    responsavel: 'Gabriel',
    descricao: 'Aulas didáticas rápidas, produção de FAQ interno e coaching prático individual de capacitação de colaboradores.',
    status: 'Ativo',
    prazo: 'Quinzenal',
    checklist: [
      { id: 'gi7_1', texto: 'Identificar as principais falhas operacionais e de conversão da equipe', concluida: false },
      { id: 'gi7_2', texto: 'Esboçar pauta do treinamento e slides explicativos práticos', concluida: false },
      { id: 'gi7_3', texto: 'Ministrar o workshop de forma síncrona e tirar dúvidas do time', concluida: false },
      { id: 'gi7_4', texto: 'Disponibilizar a gravação na base interna de documentação', concluida: false }
    ],
    etapas: [
      'Avaliar ligações de vendas e mensagens comerciais enviadas pelos novatos.',
      'Pontuar os erros de abordagem e treinar técnicas de contorno de objeção.',
      'Gravar a aula prática compartilhando tela com exemplos reais.',
      'Oferecer feedback de acompanhamento individual na semana seguinte.'
    ],
    automacoes: [
      'Disparo automático de gravações para a pasta de arquivos de treinamento'
    ],
    materiais: [
      'Pauta e slides do treinamento',
      'Base interna de documentação',
      'Software de gravação (Zoom/Loom)'
    ],
    sop: 'Identificar oportunidades de melhoria comercial. Ministrar workshop prático e disponibilizar gravação.',
    observacoes: 'Incentivar que os colaboradores sugiram dúvidas reais encontradas na semana.'
  },

  // --- 3 PRE-SEEDED EXTERNAL SERVICES FOR COMPLETE VIEW ---
  {
    id: 'ext-serv-1',
    tipo: 'externo',
    nome: 'Gestão de Redes Sociais (Social Media)',
    responsavel: 'Manu',
    descricao: 'Planejamento editorial de marca, redação de legendas estratégicas, design gráfico de posts de carrossel e monitoramento orgânico diário.',
    status: 'Ativo',
    prazo: 'Mensal Recorrente',
    checklist: [
      { id: 'ext1_1', texto: 'Mapear o calendário mensal de publicações do cliente', concluida: false },
      { id: 'ext1_2', texto: 'Redigir legendas otimizadas com hashtags chaves', concluida: false },
      { id: 'ext1_3', texto: 'Criar criativos dos posts no padrão de marca e cores do cliente', concluida: false },
      { id: 'ext1_4', texto: 'Agendar postagens e acompanhar alcance/visualizações', concluida: false }
    ],
    etapas: [
      'Estudo de concorrência e mapeamento de personas.',
      'Estruturação e aprovação de cronograma editorial de publicações.',
      'Design gráfico profissional e edição de vídeos Reels/Stories.',
      'Revisão gramatical e aprovação final do cliente.',
      'Agendamento e monitoramento ativo diário nas redes.'
    ],
    materiais: [
      'Kit de marca com fontes e cores em arquivo aberto',
      'Banco de imagens reais e logotipos oficiais',
      'Acessos das redes sociais corporativas'
    ],
    sop: 'Os posts de carrossel devem conter no máximo 7 slides para reter retenção alta de leitura. Vídeos verticais devem possuir legendas coloridas e ganchos em até 3 segundos. Responder direct messages (DMs) críticas em menos de 2 horas.',
    automacoes: [
      'mLabs para postagens automáticas',
      'ManyChat para automações de direct'
    ],
    observacoes: 'Relatórios de métricas (engajamento, alcance) entregues até dia 5 de cada mês.'
  },
  {
    id: 'ext-serv-2',
    tipo: 'externo',
    nome: 'Identidade Visual & Branding',
    responsavel: 'Manu',
    descricao: 'Construção conceitual e desenho de marcas exclusivas, contemplando logotipos, manual de marca, paleta de cores e tipografia.',
    status: 'Ativo',
    prazo: '15 dias úteis',
    checklist: [
      { id: 'ext2_1', texto: 'Coletar briefing conceitual e moodboard de referências do cliente', concluida: false },
      { id: 'ext2_2', texto: 'Construir 3 variações de conceitos de logotipo vetorizados', concluida: false },
      { id: 'ext2_3', texto: 'Criar manual de marca contendo tipografias e regras de contraste', concluida: false },
      { id: 'ext2_4', texto: 'Gerar mockups realistas de papelaria e ambientes de marca', concluida: false }
    ],
    etapas: [
      'Alinhamento conceitual sobre os valores institucionais do negócio.',
      'Esboços manuais e vetorização digital no Adobe Illustrator.',
      'Definição da harmonia cromática de cores corporativas.',
      'Construção do manual de regras e aplicação da marca.',
      'Reunião de apresentação e homologação final com o cliente.'
    ],
    materiais: [
      'Moodboard aprovado pelo cliente',
      'Apresentações dos concorrentes diretos'
    ],
    sop: 'Garantir que a marca funcione perfeitamente em escala monocromática (preto/branco) e em favicon (16x16px). Fornecer todos os arquivos finais exportados em curvas (.AI, .EPS, .PDF) e imagens em alta definição.',
    observacoes: 'Sempre testar legibilidade do logotipo em fundos claros e extremamente escuros.'
  },
  {
    id: 'ext-serv-3',
    tipo: 'externo',
    nome: 'Consultoria Estratégica de Vendas',
    responsavel: 'Neto',
    descricao: 'Diagnóstico aprofundado do funil comercial do cliente, mapeamento de dores comerciais e estruturação de novos processos internos de vendas.',
    status: 'Ativo',
    prazo: '30 dias de acompanhamento',
    checklist: [
      { id: 'ext3_1', texto: 'Auditar ligações de vendas anteriores do time do cliente', concluida: false },
      { id: 'ext3_2', texto: 'Mapear e documentar a jornada de compra e gaps de conversão', concluida: false },
      { id: 'ext3_3', texto: 'Desenvolver novos scripts comerciais e contornos de objeção', concluida: false },
      { id: 'ext3_4', texto: 'Realizar reuniões semanais de acompanhamento e auditoria de métricas', concluida: false }
    ],
    etapas: [
      'Imersão profunda no modelo de negócio e funil atual.',
      'Estruturação da nova metodologia de vendas corporativas (ex: SPIN Selling).',
      'Construção de manuais operacionais e roteiros comerciais customizados.',
      'Treinamento presencial/digital da equipe de SDRs e Closeers do cliente.',
      'Acompanhamento e reuniões de análise de resultados.'
    ],
    materiais: [
      'Acesso ao CRM de vendas ativo do cliente',
      'Gravações de reuniões comerciais de fechamento'
    ],
    sop: 'Auditoria semanal de taxas de conversão entre etapas. Script comercial deve ser revisado caso a taxa de agendamento de reuniões caia abaixo de 10%.',
    observacoes: 'Garantir relatórios de progresso transparentes a cada 7 dias de consultoria.'
  }
];


// Default team members definitions
const DEFAULT_INTEGRANTES: Integrante[] = [
  {
    id: 'int-1',
    nome: 'Neto',
    cargo: 'Co-Fundador & CTO (Tecnologia & Infraestrutura)',
    fotoGradient: 'from-blue-600 via-indigo-600 to-cyan-500',
    borderColor: 'border-blue-500/40',
    responsabilidades: [
      'Desenvolvimento e codificação de websites de alta fidelidade e landing pages rápidas',
      'Configuração de servidores VPS seguros, apontamento de domínios corporativos e SSL',
      'Criação de automações de integração de sistemas utilizando ferramentas no-code e scripts Python/JS',
      'Gestão de infraestrutura interna de TI da agência e desenvolvimento front-end modular'
    ],
    tarefas: [
      { id: 't1', texto: 'Configurar servidor Cloud VPS do cliente com SSL ativo', concluida: true },
      { id: 't2', texto: 'Revisar logs de webhooks de automações integradas que falharam ontem', concluida: false },
      { id: 't3', texto: 'Subir correção de bug no formulário de contato do site institucional', concluida: false }
    ],
    observacoes: 'Garantir sempre a segurança de dados de chaves de APIs corporativas dos clientes e rapidez extrema no carregamento de códigos.'
  },
  {
    id: 'int-2',
    nome: 'Manu',
    cargo: 'Co-Fundadora & COO (Atendimento & Customer Success)',
    fotoGradient: 'from-purple-600 via-fuchsia-600 to-pink-500',
    borderColor: 'border-purple-500/40',
    responsabilidades: [
      'Comunicação diária ativa com clientes ativos tirando dúvidas e repassando relatórios',
      'Organização de canais de suporte no Slack e WhatsApp garantindo agilidade nas respostas',
      'Agendamento comercial de propostas e reuniões internas estratégicas dos sócios',
      'Estruturação de novos grupos operacionais para iniciação de projetos (Onboarding)'
    ],
    tarefas: [
      { id: 't4', texto: 'Fazer ronda diária de canais de suporte respondendo clientes', concluida: true },
      { id: 't5', texto: 'Agendar a reunião de Kick-off da nova conta integrada', concluida: false },
      { id: 't6', texto: 'Disparar pesquisa periódica de satisfação operacional (NPS)', concluida: false }
    ],
    observacoes: 'Manter sempre empatia nas respostas e prazos sob controle irredutível da equipe operacional.'
  },
  {
    id: 'int-3',
    nome: 'Gabriel',
    cargo: 'Co-Fundador & CMO (Marketing, Comercial & Audiovisual)',
    fotoGradient: 'from-emerald-600 via-teal-600 to-green-500',
    borderColor: 'border-emerald-500/40',
    responsabilidades: [
      'Prospecção ativa outbound outbound corporativo em contas Enterprise no LinkedIn',
      'Gestão e otimização semanal de verbas de campanhas patrocinadas Meta/Google Ads',
      'Direção, iluminação, captação e enquadramento de foto e vídeo institucional',
      'Elaboração de dossiês de auditoria estratégica para apresentação comercial e pitchs',
      'Ministrar workshops internos e treinamentos de capacitação comercial da equipe'
    ],
    tarefas: [
      { id: 't7', texto: 'Gravar 3 variações de criativos de vídeo para a agência', concluida: true },
      { id: 't8', texto: 'Auditar as campanhas ativas otimizando orçamentos de CPA alto', concluida: false },
      { id: 't9', texto: 'Elaborar o dossiê da clínica médica para o pitch de sexta-feira', concluida: false }
    ],
    observacoes: 'Foco em captação de leads qualificados de alto ticket médio e captação estética de vídeo.'
  }
];

export default function ProcessosPage() {
  const [processos, setProcessos] = useState<Processo[]>([]);
  const [integrantes, setIntegrantes] = useState<Integrante[]>([]);
  const [activeTab, setActiveTab] = useState<'interno' | 'externo' | 'equipe'>('interno');
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterResponsavel, setFilterResponsavel] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  
  // Selected targets for drawers
  const [selectedProcesso, setSelectedProcesso] = useState<Processo | null>(null);
  const [selectedIntegrante, setSelectedIntegrante] = useState<Integrante | null>(null);
  
  // Form Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProcesso, setEditingProcesso] = useState<Processo | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editingIntegrante, setEditingIntegrante] = useState<Integrante | null>(null);

  // Temporary Form States for Processes
  const [formTipo, setFormTipo] = useState<'interno' | 'externo'>('interno');
  const [formNome, setFormNome] = useState('');
  const [formResponsavel, setFormResponsavel] = useState('');
  const [formObjetivo, setFormObjetivo] = useState('');
  const [formDescricao, setFormDescricao] = useState('');
  const [formPrazo, setFormPrazo] = useState('');
  const [formStatus, setFormStatus] = useState<'Ativo' | 'Rascunho' | 'Arquivado'>('Ativo');
  const [formSop, setFormSop] = useState('');
  const [formObservacoes, setFormObservacoes] = useState('');
  
  const [formChecklist, setFormChecklist] = useState<string[]>(['']);
  const [formEtapasPassos, setFormEtapasPassos] = useState<string[]>(['']);
  const [formAutomacoes, setFormAutomacoes] = useState<string[]>(['']);
  const [formMateriais, setFormMateriais] = useState<string[]>(['']);

  // Temporary Form States for Integrantes (Edit Profile)
  const [profileCargo, setProfileCargo] = useState('');
  const [profileResponsabilidades, setProfileResponsabilidades] = useState('');
  const [profileObservacoes, setProfileObservacoes] = useState('');

  // New general task state inside integrante drawer
  const [newGeneralTask, setNewGeneralTask] = useState('');

  // Load from Supabase or set default ones
  useEffect(() => {
    async function loadData() {
      // 1. Processos
      const { data: processosData } = await supabase.from('processos').select('*');
      if (processosData && processosData.length > 0) {
        setProcessos(processosData as Processo[]);
      } else {
        setProcessos(DEFAULT_PROCESSOS);
      }

      // 2. Integrantes
      const { data: integrantesData } = await supabase.from('integrantes').select('*');
      if (integrantesData && integrantesData.length > 0) {
        setIntegrantes(integrantesData as Integrante[]);
      } else {
        setIntegrantes(DEFAULT_INTEGRANTES);
      }
    }
    loadData();
  }, []);

  // Handle URL query parameters for active tab and selected member details
  useEffect(() => {
    if (typeof window !== 'undefined' && integrantes.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      const member = params.get('member');
      if (tab) {
        if (tab === 'interno' || tab === 'externo' || tab === 'equipe') {
          setActiveTab(tab);
        }
      }
      if (member) {
        const found = integrantes.find(i => i.nome.toLowerCase() === member.toLowerCase());
        if (found) {
          setSelectedIntegrante(found);
        }
      }
    }
  }, [integrantes]);

  // Save changes to processes
  const saveProcessos = async (updated: Processo[]) => {
    setProcessos(updated);
    for (const p of updated) {
      const { error } = await supabase.from('processos').upsert({
        id: p.id,
        tipo: p.tipo,
        nome: p.nome,
        responsavel: p.responsavel,
        objetivo: p.objetivo ?? null,
        descricao: p.descricao,
        checklist: p.checklist ?? [],
        passoAPasso: p.passoAPasso ?? [],
        etapas: p.etapas ?? [],
        prazo: p.prazo,
        status: p.status,
        automacoes: p.automacoes ?? [],
        materiais: p.materiais ?? [],
        sop: p.sop ?? null,
        observacoes: p.observacoes ?? null
      });
      if (error) console.error('Error saving processes:', error);
    }
    
    // Update active drawer target if open
    if (selectedProcesso) {
      const current = updated.find(p => p.id === selectedProcesso.id);
      setSelectedProcesso(current || null);
    }
  };

  // Save changes to integrantes
  const saveIntegrantes = async (updated: Integrante[]) => {
    setIntegrantes(updated);
    for (const i of updated) {
      const { error } = await supabase.from('integrantes').upsert({
        id: i.id,
        nome: i.nome,
        cargo: i.cargo,
        fotoGradient: i.fotoGradient ?? null,
        borderColor: i.borderColor ?? null,
        responsabilidades: i.responsabilidades ?? [],
        tarefas: i.tarefas ?? [],
        observacoes: i.observacoes ?? null
      });
      if (error) console.error('Error saving members:', error);
    }

    // Update active drawer target if open
    if (selectedIntegrante) {
      const current = updated.find(i => i.id === selectedIntegrante.id);
      setSelectedIntegrante(current || null);
    }
  };

  // Toggle checklist item within a process
  const toggleChecklistItem = (processoId: string, itemId: string) => {
    const updated = processos.map(p => {
      if (p.id === processoId) {
        return {
          ...p,
          checklist: p.checklist.map(item => {
            if (item.id === itemId) {
              return { ...item, concluida: !item.concluida };
            }
            return item;
          })
        };
      }
      return p;
    });
    saveProcessos(updated);
  };

  // Duplicate a process
  const handleDuplicateProcesso = (proc: Processo, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newProc: Processo = {
      ...proc,
      id: `proc-dup-${Date.now()}`,
      nome: `${proc.nome} (Cópia)`,
      checklist: proc.checklist.map((item, idx) => ({
        id: `item-dup-${idx}-${Date.now()}`,
        texto: item.texto,
        concluida: false
      }))
    };
    saveProcessos([...processos, newProc]);
  };

  // Toggle Archive status of a process
  const handleToggleArchiveProcesso = (proc: Processo, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = processos.map(p => {
      if (p.id === proc.id) {
        return { ...p, status: (p.status === 'Arquivado' ? 'Ativo' : 'Arquivado') as any };
      }
      return p;
    });
    saveProcessos(updated);
  };

  // Delete a process
  const handleDeleteProcesso = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm('Deseja excluir este processo permanentemente?')) return;
    const { error } = await supabase.from('processos').delete().eq('id', id);
    if (error) {
      console.error('Erro ao excluir processo:', error);
      alert('Erro ao excluir processo.');
      return;
    }
    saveProcessos(processos.filter(p => p.id !== id));
    if (selectedProcesso?.id === id) {
      setSelectedProcesso(null);
    }
  };

  // Open creation/edition form for processes
  const openFormProcesso = (proc?: Processo) => {
    if (proc) {
      setEditingProcesso(proc);
      setFormTipo(proc.tipo);
      setFormNome(proc.nome);
      setFormResponsavel(proc.responsavel);
      setFormObjetivo(proc.objetivo || '');
      setFormDescricao(proc.descricao);
      setFormPrazo(proc.prazo);
      setFormStatus(proc.status);
      setFormSop(proc.sop || '');
      setFormObservacoes(proc.observacoes || '');
      
      setFormChecklist(proc.checklist.map(i => i.texto));
      setFormEtapasPassos(proc.tipo === 'interno' ? (proc.passoAPasso || []) : (proc.etapas || []));
      setFormAutomacoes(proc.automacoes || []);
      setFormMateriais(proc.materiais || []);
    } else {
      setEditingProcesso(null);
      setFormTipo(activeTab === 'externo' ? 'externo' : 'interno');
      setFormNome('');
      setFormResponsavel('');
      setFormObjetivo('');
      setFormDescricao('');
      setFormPrazo('');
      setFormStatus('Ativo');
      setFormSop('');
      setFormObservacoes('');
      
      setFormChecklist(['']);
      setFormEtapasPassos(['']);
      setFormAutomacoes(['']);
      setFormMateriais(['']);
    }
    setIsFormOpen(true);
  };

  // Save new or edited process
  const handleSaveProcesso = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNome || !formResponsavel || !formDescricao) {
      alert('Nome, Responsável e Descrição são campos obrigatórios.');
      return;
    }

    const cleanChecklist: ChecklistItem[] = formChecklist
      .filter(t => t.trim() !== '')
      .map((texto, index) => {
        const originalIndex = editingProcesso?.checklist.findIndex(item => item.texto === texto);
        const originalState = originalIndex !== undefined && originalIndex !== -1 
          ? editingProcesso?.checklist[originalIndex].concluida 
          : false;

        return {
          id: `item-${index}-${Date.now()}`,
          texto,
          concluida: originalState || false
        };
      });

    const cleanEtapasPassos = formEtapasPassos.filter(t => t.trim() !== '');
    const cleanAutomacoes = formAutomacoes.filter(t => t.trim() !== '');
    const cleanMateriais = formMateriais.filter(t => t.trim() !== '');

    const novoProc: Processo = {
      id: editingProcesso ? editingProcesso.id : `proc-${Date.now()}`,
      tipo: formTipo,
      nome: formNome,
      responsavel: formResponsavel,
      descricao: formDescricao,
      prazo: formPrazo || (formTipo === 'interno' ? 'Diário' : 'Mensal'),
      status: formStatus,
      checklist: cleanChecklist,
      observacoes: formObservacoes,
      automacoes: cleanAutomacoes.length > 0 ? cleanAutomacoes : undefined,
      ...(formTipo === 'interno' ? {
        objetivo: formObjetivo,
        passoAPasso: cleanEtapasPassos
      } : {
        etapas: cleanEtapasPassos,
        materiais: cleanMateriais,
        sop: formSop
      })
    };

    const updated = editingProcesso
      ? processos.map(p => p.id === editingProcesso.id ? novoProc : p)
      : [...processos, novoProc];

    saveProcessos(updated);
    setIsFormOpen(false);
  };

  // Save edited profile details for team member
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIntegrante) return;

    const respsArray = profileResponsabilidades
      .split('\n')
      .map(r => r.trim())
      .filter(r => r !== '');

    const updated = integrantes.map(i => {
      if (i.id === editingIntegrante.id) {
        return {
          ...i,
          cargo: profileCargo,
          responsabilidades: respsArray,
          observacoes: profileObservacoes
        };
      }
      return i;
    });

    saveIntegrantes(updated);
    setIsEditProfileOpen(false);
  };

  // Open edit profile modal
  const openEditProfile = (member: Integrante) => {
    setEditingIntegrante(member);
    setProfileCargo(member.cargo);
    setProfileResponsabilidades(member.responsabilidades.join('\n'));
    setProfileObservacoes(member.observacoes || '');
    setIsEditProfileOpen(true);
  };

  // General tasks actions within integrante details
  const handleAddGeneralTask = (e: React.FormEvent, memberId: string) => {
    e.preventDefault();
    if (!newGeneralTask.trim()) return;

    const updated = integrantes.map(i => {
      if (i.id === memberId) {
        return {
          ...i,
          tarefas: [...i.tarefas, { id: `task-${Date.now()}`, texto: newGeneralTask.trim(), concluida: false }]
        };
      }
      return i;
    });

    saveIntegrantes(updated);
    setNewGeneralTask('');
  };

  const toggleGeneralTask = (memberId: string, taskId: string) => {
    const updated = integrantes.map(i => {
      if (i.id === memberId) {
        return {
          ...i,
          tarefas: i.tarefas.map(t => t.id === taskId ? { ...t, concluida: !t.concluida } : t)
        };
      }
      return i;
    });
    saveIntegrantes(updated);
  };

  const deleteGeneralTask = (memberId: string, taskId: string) => {
    const updated = integrantes.map(i => {
      if (i.id === memberId) {
        return {
          ...i,
          tarefas: i.tarefas.filter(t => t.id !== taskId)
        };
      }
      return i;
    });
    saveIntegrantes(updated);
  };

  // Calculate live productivity metrics for a member
  const getProductivityMetrics = (member: Integrante) => {
    // 1. Assigned processes checklists
    const assignedProcs = processos.filter(p => p.responsavel === member.nome && p.status !== 'Arquivado');
    const totalProcItems = assignedProcs.reduce((sum, p) => sum + p.checklist.length, 0);
    const completedProcItems = assignedProcs.reduce((sum, p) => sum + p.checklist.filter(item => item.concluida).length, 0);

    // 2. Member's general tasks list
    const totalGenTasks = member.tarefas.length;
    const completedGenTasks = member.tarefas.filter(t => t.concluida).length;

    const total = totalProcItems + totalGenTasks;
    const completed = completedProcItems + completedGenTasks;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 100;

    return {
      total,
      completed,
      pct,
      procCount: assignedProcs.length,
      tasksTotal: totalGenTasks,
      tasksDone: completedGenTasks
    };
  };

  // Export process as PDF using a styled print window
  const exportarProcessoPDF = (proc: Processo) => {
    const getTipoLabel = (tipo: string) => tipo === 'interno' ? 'Processo Interno' : 'Serviço Prestado';
    const getStatusLabel = (status: string) => status;

    const checklistHTML = proc.checklist.map((item, idx) => `
      <div class="checklist-item ${item.concluida ? 'done' : ''}">
        <span class="check-box">${item.concluida ? '✓' : '○'}</span>
        <span>${item.texto}</span>
      </div>
    `).join('');

    const stepsArray = proc.tipo === 'interno' ? (proc.passoAPasso || []) : (proc.etapas || []);
    const stepsHTML = stepsArray.length > 0 ? `
      <div class="section">
        <h3 class="section-title">📋 Etapas de Entrega</h3>
        ${stepsArray.map((step, idx) => `
          <div class="step-item">
            <span class="step-num">Passo ${idx + 1}</span>
            <p>${step}</p>
          </div>
        `).join('')}
      </div>
    ` : '';

    const automacoesHTML = proc.automacoes && proc.automacoes.length > 0 ? `
      <div class="section">
        <h3 class="section-title">⚡ Automações</h3>
        <ul class="list">${proc.automacoes.map(a => `<li>${a}</li>`).join('')}</ul>
      </div>
    ` : '';

    const materiaisHTML = proc.materiais && proc.materiais.length > 0 ? `
      <div class="section">
        <h3 class="section-title">📦 Materiais Necessários</h3>
        <ul class="list">${proc.materiais.map(m => `<li>${m}</li>`).join('')}</ul>
      </div>
    ` : '';

    const sopHTML = proc.sop ? `
      <div class="section">
        <h3 class="section-title">📖 Instruções SOP</h3>
        <div class="sop-box">${proc.sop}</div>
      </div>
    ` : '';

    const objetivoHTML = proc.objetivo ? `
      <div class="section objective-box">
        <h3 class="section-title">🎯 Objetivo</h3>
        <p>${proc.objetivo}</p>
      </div>
    ` : '';

    const observacoesHTML = proc.observacoes ? `
      <div class="section">
        <h3 class="section-title">💡 Observações Adicionais</h3>
        <p class="obs-text">${proc.observacoes}</p>
      </div>
    ` : '';

    const now = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Dossiê — ${proc.nome}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', sans-serif; background: #fff; color: #1a1a2e; font-size: 13px; line-height: 1.6; }
          .page { padding: 36px 44px; max-width: 900px; margin: 0 auto; }
          .header { display: flex; align-items: flex-start; justify-content: space-between; padding-bottom: 20px; border-bottom: 3px solid #00ff9d; margin-bottom: 28px; }
          .header-left h1 { font-size: 22px; font-weight: 800; color: #0a0f1e; margin-bottom: 4px; }
          .header-left .subtitle { font-size: 11px; color: #6b7280; font-weight: 500; }
          .header-right { text-align: right; }
          .badge { display: inline-block; font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 999px; border: 1.5px solid; margin-left: 6px; }
          .badge-tipo { background: #f0fdf4; color: #16a34a; border-color: #86efac; }
          .badge-status-Ativo { background: #f0fdf4; color: #15803d; border-color: #4ade80; }
          .badge-status-Rascunho { background: #fefce8; color: #a16207; border-color: #fde047; }
          .badge-status-Arquivado { background: #fef2f2; color: #b91c1c; border-color: #fca5a5; }
          .meta-row { display: flex; gap: 24px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px; flex-wrap: wrap; }
          .meta-item { display: flex; flex-direction: column; gap: 2px; }
          .meta-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #9ca3af; }
          .meta-value { font-size: 13px; font-weight: 600; color: #1f2937; }
          .section { margin-bottom: 22px; }
          .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #4b5563; border-bottom: 1.5px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 12px; }
          .objective-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 14px 16px; }
          .objective-box p { color: #166534; font-weight: 500; }
          p { color: #374151; }
          .list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 6px; }
          .list li { padding: 7px 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 7px; color: #374151; display: flex; align-items: flex-start; gap: 8px; }
          .list li::before { content: '▸'; color: #00cc7d; font-size: 12px; flex-shrink: 0; margin-top: 1px; }
          .checklist-item { display: flex; align-items: flex-start; gap: 10px; padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 6px; background: #fff; }
          .checklist-item.done { background: #f0fdf4; border-color: #bbf7d0; }
          .checklist-item.done span:last-child { text-decoration: line-through; color: #9ca3af; }
          .check-box { font-size: 14px; color: #00cc7d; font-weight: 700; flex-shrink: 0; width: 18px; text-align: center; }
          .step-item { display: flex; gap: 14px; padding: 10px 14px; background: #f8fafc; border-left: 3px solid #00cc7d; border-radius: 0 8px 8px 0; margin-bottom: 8px; }
          .step-num { font-size: 10px; font-weight: 800; color: #00cc7d; text-transform: uppercase; letter-spacing: 0.06em; white-space: nowrap; padding-top: 2px; }
          .step-item p { color: #374151; }
          .sop-box { background: #1e293b; color: #e2e8f0; border-radius: 10px; padding: 14px 16px; font-family: monospace; font-size: 12px; line-height: 1.8; white-space: pre-wrap; }
          .obs-text { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 14px; color: #92400e; font-style: italic; }
          .footer { margin-top: 32px; padding-top: 14px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 10px; color: #9ca3af; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .page { padding: 20px 28px; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <div class="header-left">
              <h1>${proc.nome}</h1>
              <div class="subtitle">Agência Amitai &nbsp;•&nbsp; Dossiê Operacional</div>
            </div>
            <div class="header-right">
              <span class="badge badge-tipo">${getTipoLabel(proc.tipo)}</span>
              <span class="badge badge-status-${proc.status}">${getStatusLabel(proc.status)}</span>
            </div>
          </div>

          <div class="meta-row">
            <div class="meta-item"><span class="meta-label">Responsável</span><span class="meta-value">${proc.responsavel}</span></div>
            <div class="meta-item"><span class="meta-label">Prazo</span><span class="meta-value">${proc.prazo}</span></div>
            <div class="meta-item"><span class="meta-label">Status</span><span class="meta-value">${proc.status}</span></div>
            <div class="meta-item"><span class="meta-label">Tipo</span><span class="meta-value">${getTipoLabel(proc.tipo)}</span></div>
            <div class="meta-item"><span class="meta-label">Gerado em</span><span class="meta-value">${now}</span></div>
          </div>

          ${objetivoHTML}

          <div class="section">
            <h3 class="section-title">📝 Descrição</h3>
            <p>${proc.descricao}</p>
          </div>

          <div class="section">
            <h3 class="section-title">✅ Checklist (${proc.checklist.filter(i => i.concluida).length}/${proc.checklist.length} concluídos)</h3>
            ${checklistHTML}
          </div>

          ${stepsHTML}
          ${automacoesHTML}
          ${materiaisHTML}
          ${sopHTML}
          ${observacoesHTML}

          <div class="footer">
            <span>Agência Amitai — ERP Interno</span>
            <span>Exportado em ${now}</span>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 800);
  };

  // Filter processes list
  const filteredProcessos = processos.filter(p => {
    // Tab filtering (Interno/Externo)
    if (activeTab === 'interno' && p.tipo !== 'interno') return false;
    if (activeTab === 'externo' && p.tipo !== 'externo') return false;

    // Text search
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchNome = p.nome.toLowerCase().includes(q);
      const matchDesc = p.descricao.toLowerCase().includes(q);
      const matchObj = p.objetivo?.toLowerCase().includes(q) || false;
      const matchResp = p.responsavel.toLowerCase().includes(q);
      if (!matchNome && !matchDesc && !matchObj && !matchResp) return false;
    }

    // Owner filter
    if (filterResponsavel !== '' && p.responsavel !== filterResponsavel) return false;

    // Status filter
    if (filterStatus !== 'Todos') {
      if (filterStatus === 'Arquivado' && p.status !== 'Arquivado') return false;
      if (filterStatus !== 'Arquivado' && p.status === 'Arquivado') return false;
      if (filterStatus !== 'Arquivado' && p.status !== filterStatus) return false;
    } else {
      if (p.status === 'Arquivado') return false;
    }

    return true;
  });

  const getPartnerColor = (name: string) => {
    switch (name?.toLowerCase()) {
      case 'neto':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'gabriel':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'manu':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      default:
        return 'text-brand-muted bg-brand-border/30 border-brand-border/50';
    }
  };

  const getPartnerBarColor = (name: string) => {
    switch (name?.toLowerCase()) {
      case 'neto': return 'bg-blue-500';
      case 'gabriel': return 'bg-emerald-500';
      case 'manu': return 'bg-purple-500';
      default: return 'bg-brand-primary';
    }
  };

  return (
    <div className="space-y-8 animate-page">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-brand-border pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Workflow className="text-brand-primary h-8 w-8" />
            Tarefas e Processos
          </h1>
          <p className="text-brand-muted mt-1">Acompanhe o que cada um deve fazer e como os serviços são entregues.</p>
        </div>
        <button
          onClick={() => openFormProcesso()}
          className="bg-brand-primary hover:bg-brand-primary-hover text-brand-bg font-bold py-3 px-5 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,157,0.15)] hover:scale-102"
        >
          <Plus size={20} />
          Novo Processo
        </button>
      </header>

      {/* Navigation Tabs (Internos, Serviços, Equipe) */}
      <div className="flex border-b border-brand-border/60">
        <button
          onClick={() => { setActiveTab('interno'); setSelectedProcesso(null); setSelectedIntegrante(null); }}
          className={`px-6 py-3 font-semibold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'interno'
              ? 'border-brand-primary text-brand-primary font-bold'
              : 'border-transparent text-brand-muted hover:text-white'
          }`}
        >
          <ClipboardList size={18} />
          Como a Agência Funciona (Interno)
        </button>
        <button
          onClick={() => { setActiveTab('externo'); setSelectedProcesso(null); setSelectedIntegrante(null); }}
          className={`px-6 py-3 font-semibold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'externo'
              ? 'border-brand-primary text-brand-primary font-bold'
              : 'border-transparent text-brand-muted hover:text-white'
          }`}
        >
          <Sparkles size={18} />
          Como Entregamos os Serviços (Clientes)
        </button>
        <button
          onClick={() => { setActiveTab('equipe'); setSelectedProcesso(null); setSelectedIntegrante(null); }}
          className={`px-6 py-3 font-semibold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'equipe'
              ? 'border-brand-primary text-brand-primary font-bold'
              : 'border-transparent text-brand-muted hover:text-white'
          }`}
        >
          <UserCheck size={18} />
          Nossa Equipe
        </button>
      </div>

      {/* FILTER PANEL (Only shown for process lists, not team view) */}
      {activeTab !== 'equipe' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-brand-card p-4 rounded-xl border border-brand-border shadow-md">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
            <input
              type="text"
              placeholder="Pesquisar por nome, descrição ou responsável..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-brand-bg border border-brand-border text-white rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all text-sm animate-in fade-in"
            />
          </div>

          {/* Partner Filter */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={16} />
            <select
              value={filterResponsavel}
              onChange={(e) => setFilterResponsavel(e.target.value)}
              className="w-full bg-brand-bg border border-brand-border text-white rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all text-sm appearance-none"
            >
              <option value="">Quem faz</option>
              <option value="Neto">Neto</option>
              <option value="Gabriel">Gabriel</option>
              <option value="Manu">Manu</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={16} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-brand-bg border border-brand-border text-white rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all text-sm appearance-none"
            >
              <option value="Todos">Status</option>
              <option value="Ativo">Apenas Ativos</option>
              <option value="Rascunho">Apenas Rascunhos</option>
              <option value="Arquivado">Arquivados</option>
            </select>
          </div>
        </div>
      )}

      {/* RENDER ACTIVE TAB */}

      {/* 1. PROCESS LISTING TABS */}
      {activeTab !== 'equipe' && (
        <>
          {filteredProcessos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProcessos.map((proc) => {
                const checklistDoneCount = proc.checklist.filter(item => item.concluida).length;
                const checklistTotal = proc.checklist.length;
                const pctDone = checklistTotal > 0 ? Math.round((checklistDoneCount / checklistTotal) * 100) : 0;

                return (
                  <div
                    key={proc.id}
                    onClick={() => setSelectedProcesso(proc)}
                    className="glass-card p-6 flex flex-col justify-between cursor-pointer border border-brand-border/60 relative overflow-hidden group hover:scale-101 animate-in fade-in"
                  >
                    <div>
                      {/* Tags & Owner */}
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${getPartnerColor(proc.responsavel)}`}>
                          {proc.responsavel}
                        </span>
                        <div className="flex gap-2">
                          {proc.status === 'Rascunho' && (
                            <span className="text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded">
                              Rascunho
                            </span>
                          )}
                          {proc.status === 'Arquivado' && (
                            <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded">
                              Arquivado
                            </span>
                          )}
                          <span className="text-[11px] text-brand-muted flex items-center gap-1 font-medium bg-brand-bg px-2.5 py-1 rounded-full border border-brand-border">
                            <Clock size={12} />
                            {proc.prazo}
                          </span>
                        </div>
                      </div>

                      {/* Header and description */}
                      <h3 className="text-lg font-bold text-white group-hover:text-brand-primary transition-colors flex items-center justify-between gap-2">
                        {proc.nome}
                        <ChevronRight size={16} className="text-brand-muted group-hover:text-brand-primary group-hover:translate-x-1 transition-all" />
                      </h3>
                      <p className="text-brand-muted text-xs line-clamp-2 mt-2 leading-relaxed">
                        {proc.descricao}
                      </p>
                    </div>

                    {/* Card Actions */}
                    <div className="mt-6 pt-4 border-t border-brand-border/50 space-y-4">
                      <div className="flex items-center justify-between text-xs text-brand-muted">
                        <span className="text-[10px] font-medium opacity-65">
                          {proc.tipo === 'interno' ? 'Processo Operacional' : 'Serviço Prestado'}
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); openFormProcesso(proc); }}
                            className="hover:text-white p-1 rounded hover:bg-brand-card-hover transition-colors"
                            title="Editar"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={(e) => handleDuplicateProcesso(proc, e)}
                            className="hover:text-white p-1 rounded hover:bg-brand-card-hover transition-colors"
                            title="Duplicar"
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            onClick={(e) => handleToggleArchiveProcesso(proc, e)}
                            className={`p-1 rounded hover:bg-brand-card-hover transition-colors ${proc.status === 'Arquivado' ? 'text-brand-primary' : 'hover:text-white'}`}
                            title={proc.status === 'Arquivado' ? 'Reativar' : 'Arquivar'}
                          >
                            <Archive size={14} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteProcesso(proc.id, e)}
                            className="hover:text-brand-danger p-1 rounded hover:bg-red-500/10 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-card p-12 text-center border border-brand-border">
              <Info className="mx-auto text-brand-muted h-10 w-10 mb-4" />
              <h3 className="text-lg font-bold text-white">Nenhum processo localizado</h3>
              <p className="text-brand-muted text-sm mt-1 max-w-md mx-auto">
                Não encontramos processos ativos correspondentes à sua pesquisa no momento.
              </p>
              <button
                onClick={() => openFormProcesso()}
                className="mt-6 bg-brand-primary-dim hover:bg-brand-primary/20 text-brand-primary border border-brand-primary/30 font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Adicionar Novo
              </button>
            </div>
          )}
        </>
      )}

      {/* 2. TEAM MEMBERS LISTING TAB */}
      {activeTab === 'equipe' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in">
          {integrantes.map((member) => {
            const metrics = getProductivityMetrics(member);
            const initials = member.nome.slice(0, 2).toUpperCase();

            return (
              <div
                key={member.id}
                onClick={() => setSelectedIntegrante(member)}
                className="glass-card p-6 flex flex-col justify-between border border-brand-border/60 hover:border-brand-primary/20 relative overflow-hidden group cursor-pointer transition-all hover:scale-101"
              >
                {/* Visual Glow Layer */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${member.fotoGradient} opacity-5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110`} />

                <div className="space-y-6">
                  {/* Top info Profile Pic & Name */}
                  <div className="flex items-center gap-4">
                    {/* CSS Avatar representing Foto */}
                    <div className={`h-16 w-16 rounded-full flex items-center justify-center font-bold text-xl bg-gradient-to-br ${member.fotoGradient} border-2 border-brand-border shadow-lg text-white`}>
                      {initials}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-brand-primary transition-colors">
                        {member.nome}
                      </h3>
                      <p className="text-xs text-brand-muted font-medium mt-0.5 line-clamp-1">{member.cargo}</p>
                    </div>
                  </div>

                  {/* Responsibilities list snippet */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">O que faz na agência</span>
                    <ul className="space-y-1.5">
                      {member.responsabilidades.slice(0, 3).map((resp, idx) => (
                        <li key={idx} className="text-xs text-brand-text/90 flex items-start gap-2 leading-relaxed line-clamp-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-brand-primary mt-1.5 flex-shrink-0" />
                          {resp}
                        </li>
                      ))}
                      {member.responsabilidades.length > 3 && (
                        <li className="text-[10px] text-brand-muted italic pl-3">
                          + {member.responsabilidades.length - 3} responsabilidades
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Footer Info button */}
                <div className="mt-8 pt-4 border-t border-brand-border/40 flex items-center justify-between text-xs text-brand-primary font-semibold">
                  <span className="text-brand-muted text-[10px] font-mono group-hover:text-brand-text">
                    Ver Detalhes
                  </span>
                  <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* INTEGRANTE DETAIL DRAWER PANEL */}
      {selectedIntegrante && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            onClick={() => setSelectedIntegrante(null)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300" 
          />

          {/* Drawer container */}
          <div className="relative w-full max-w-4xl bg-brand-card border-l border-brand-border h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 z-10">
            
            {/* Header */}
            <div className="p-6 border-b border-brand-border flex items-center justify-between bg-brand-bg/50">
              <div className="flex items-center gap-4">
                <div className={`h-16 w-16 rounded-full flex items-center justify-center font-bold text-xl bg-gradient-to-br ${selectedIntegrante.fotoGradient} text-white border border-brand-border shadow-md`}>
                  {selectedIntegrante.nome.slice(0,2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-white">{selectedIntegrante.nome}</h2>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-brand-border/60 text-brand-muted">
                      Colaborador da Agência
                    </span>
                  </div>
                  <p className="text-sm text-brand-muted mt-0.5">{selectedIntegrante.cargo}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditProfile(selectedIntegrante)}
                  className="px-4 py-2 bg-brand-bg hover:bg-brand-card-hover rounded-xl border border-brand-border text-xs text-brand-primary hover:text-white transition-all flex items-center gap-2 font-bold"
                >
                  <Edit3 size={14} />
                  Editar Perfil
                </button>
                <button
                  onClick={() => setSelectedIntegrante(null)}
                  className="p-2 bg-brand-bg hover:bg-brand-card-hover rounded-lg border border-brand-border text-brand-muted hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Split layout inside Drawer body */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              
              {/* LEFT COLUMN: Profile info, responsibilities and observations */}
              <div className="w-full md:w-80 border-r border-brand-border/60 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-brand-bg/20">
                
                {/* Responsibilities */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Activity size={14} className="text-brand-primary" />
                    O que faz na agência
                  </h4>
                  <ul className="space-y-2.5">
                    {selectedIntegrante.responsabilidades.map((resp, idx) => (
                      <li key={idx} className="text-xs text-brand-text leading-relaxed flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-primary mt-1.5 flex-shrink-0" />
                        {resp}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Observations */}
                {selectedIntegrante.observacoes && (
                  <div className="pt-4 border-t border-brand-border/40 space-y-2">
                    <h4 className="text-xs font-bold text-brand-muted uppercase tracking-wider">Anotações</h4>
                    <p className="text-brand-muted text-xs leading-relaxed whitespace-pre-wrap bg-brand-bg p-3 rounded-lg border border-brand-border/40">
                      {selectedIntegrante.observacoes}
                    </p>
                  </div>
                )}

              </div>

              {/* RIGHT COLUMN: Interactive tasks list and attributed processes list */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                
                {/* 2. ATTRIBUTED PROCESSES LIST */}
                <div className="space-y-4 pt-4 border-t border-brand-border/40">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Layers className="text-brand-primary" size={16} />
                    Processos que gerencia ({getProductivityMetrics(selectedIntegrante).procCount})
                  </h3>

                  {processos.filter(p => p.responsavel === selectedIntegrante.nome && p.status !== 'Arquivado').length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {processos
                        .filter(p => p.responsavel === selectedIntegrante.nome && p.status !== 'Arquivado')
                        .map((proc) => {
                          const done = proc.checklist.filter(item => item.concluida).length;
                          const total = proc.checklist.length;
                          const pct = total > 0 ? Math.round((done / total) * 100) : 0;

                          return (
                            <div
                              key={proc.id}
                              onClick={() => {
                                // Open this process's drawer
                                setSelectedProcesso(proc);
                              }}
                              className="bg-brand-bg/60 p-4 rounded-xl border border-brand-border hover:border-brand-primary/20 cursor-pointer transition-all hover:scale-101 space-y-3"
                            >
                              <div className="flex justify-between items-start">
                                <h4 className="text-xs font-bold text-white truncate pr-2">{proc.nome}</h4>
                                <span className="text-[9px] bg-brand-border text-brand-muted px-2 py-0.5 rounded whitespace-nowrap">
                                  {proc.prazo}
                                </span>
                              </div>
                              <p className="text-[10px] text-brand-muted line-clamp-2 leading-relaxed">
                                {proc.descricao}
                              </p>
                              

                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <p className="text-xs text-brand-muted italic py-4 text-center">Nenhum processo comercial/operacional sob gestão direta.</p>
                  )}
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* PROCESS DETAILS SLIDING DRAWER PANEL */}
      {selectedProcesso && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          {/* Backdrop */}
          <div 
            onClick={() => setSelectedProcesso(null)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300" 
          />

          {/* Drawer container */}
          <div className="relative w-full max-w-3xl bg-brand-card border-l border-brand-border h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 z-10">
            
            {/* Header */}
            <div className="p-6 border-b border-brand-border flex items-center justify-between bg-brand-bg/50">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${getPartnerColor(selectedProcesso.responsavel)}`}>
                    {selectedProcesso.responsavel}
                  </span>
                  <span className="text-xs bg-brand-border/40 text-brand-muted px-2 py-0.5 rounded">
                    {selectedProcesso.tipo === 'interno' ? 'Processo Interno' : 'Serviço Prestado'}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                    selectedProcesso.status === 'Ativo' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                    selectedProcesso.status === 'Rascunho' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 
                    'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {selectedProcesso.status}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white">{selectedProcesso.nome}</h2>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportarProcessoPDF(selectedProcesso)}
                  className="px-3 py-2 bg-brand-primary/10 hover:bg-brand-primary/20 border border-brand-primary/30 text-brand-primary hover:text-white rounded-lg transition-all flex items-center gap-1.5 text-xs font-bold"
                  title="Exportar como PDF"
                >
                  <Download size={14} />
                  Exportar PDF
                </button>
                <button
                  onClick={() => openFormProcesso(selectedProcesso)}
                  className="p-2 bg-brand-bg hover:bg-brand-card-hover rounded-lg border border-brand-border text-brand-muted hover:text-white transition-colors"
                  title="Editar"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => {
                    handleDuplicateProcesso(selectedProcesso);
                    setSelectedProcesso(null);
                  }}
                  className="p-2 bg-brand-bg hover:bg-brand-card-hover rounded-lg border border-brand-border text-brand-muted hover:text-white transition-colors"
                  title="Duplicar"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={() => setSelectedProcesso(null)}
                  className="p-2 bg-brand-bg hover:bg-brand-card-hover rounded-lg border border-brand-border text-brand-muted hover:text-white transition-colors ml-2"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              
              {/* Goal & Description */}
              <div className="space-y-4">

                <div>
                  <h4 className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2">Descrição</h4>
                  <p className="text-brand-text text-sm leading-relaxed whitespace-pre-wrap">{selectedProcesso.descricao}</p>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-brand-border/40">
                <div>
                  <h4 className="text-xs font-semibold text-brand-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Clock size={14} />
                    Prazo
                  </h4>
                  <span className="inline-block bg-brand-bg px-3 py-1.5 rounded-lg border border-brand-border text-white text-sm font-semibold">
                    {selectedProcesso.prazo}
                  </span>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROCESS CREATE/EDIT MODAL DIALOG */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
          
          <div className="relative bg-brand-card border border-brand-border w-full max-w-3xl rounded-2xl flex flex-col max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 z-10">
            
            <header className="p-6 border-b border-brand-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-gradient">
                {editingProcesso ? `Editar: ${editingProcesso.nome}` : 'Criar Novo Processo / Serviço'}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="text-brand-muted hover:text-white transition-colors">
                <X size={20} />
              </button>
            </header>

            <form onSubmit={handleSaveProcesso} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {/* Type toggle */}
              <div className="grid grid-cols-2 gap-4 bg-brand-bg p-1 rounded-lg border border-brand-border">
                <button
                  type="button"
                  onClick={() => setFormTipo('interno')}
                  className={`py-2 text-sm font-semibold rounded-md transition-all ${
                    formTipo === 'interno'
                      ? 'bg-brand-card text-brand-primary border border-brand-border'
                      : 'text-brand-muted hover:text-white'
                  }`}
                >
                  Processo Interno
                </button>
                <button
                  type="button"
                  onClick={() => setFormTipo('externo')}
                  className={`py-2 text-sm font-semibold rounded-md transition-all ${
                    formTipo === 'externo'
                      ? 'bg-brand-card text-brand-primary border border-brand-border'
                      : 'text-brand-muted hover:text-white'
                  }`}
                >
                  Serviço prestado (Externo)
                </button>
              </div>

              {/* Name & Owner fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-muted">Nome do Processo *</label>
                  <input
                    type="text"
                    required
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    placeholder="Ex: Prospecção de Vendas"
                    className="w-full bg-brand-bg border border-brand-border text-white rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-primary text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-muted">Responsável Principal *</label>
                  <select
                    value={formResponsavel}
                    onChange={(e) => setFormResponsavel(e.target.value)}
                    required
                    className="w-full bg-brand-bg border border-brand-border text-white rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-primary text-sm appearance-none"
                  >
                    <option value="">Selecione o Integrante</option>
                    <option value="Neto">Neto</option>
                    <option value="Gabriel">Gabriel</option>
                    <option value="Manu">Manu</option>
                  </select>
                </div>
              </div>

              {/* Status and Deadline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-muted">Prazo (Ideal/Médio)</label>
                  <input
                    type="text"
                    value={formPrazo}
                    onChange={(e) => setFormPrazo(e.target.value)}
                    placeholder="Ex: 5 dias, Diário, Mensal"
                    className="w-full bg-brand-bg border border-brand-border text-white rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-primary text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-brand-muted">Status do Processo</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-brand-bg border border-brand-border text-white rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-primary text-sm appearance-none"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Rascunho">Rascunho</option>
                    <option value="Arquivado">Arquivado</option>
                  </select>
                </div>
              </div>



              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-muted">Descrição Geral *</label>
                <textarea
                  rows={3}
                  required
                  value={formDescricao}
                  onChange={(e) => setFormDescricao(e.target.value)}
                  placeholder="Detalhamento geral das diretrizes do processo..."
                  className="w-full bg-brand-bg border border-brand-border text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-primary text-sm"
                />
              </div>



              {/* General observations */}
              <div className="space-y-1 pt-2 border-t border-brand-border/40">
                <label className="text-xs font-bold text-white uppercase tracking-wide">Observações Gerais</label>
                <textarea
                  rows={2}
                  value={formObservacoes}
                  onChange={(e) => setFormObservacoes(e.target.value)}
                  placeholder="Considerações adicionais ou notas de rodapé..."
                  className="w-full bg-brand-bg border border-brand-border text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-primary text-sm"
                />
              </div>

            </form>

            <footer className="p-6 border-t border-brand-border bg-brand-bg/50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="bg-brand-bg hover:bg-brand-card-hover border border-brand-border text-white font-semibold py-2 px-4 rounded-xl transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveProcesso}
                className="bg-brand-primary hover:bg-brand-primary-hover text-brand-bg font-bold py-2.5 px-6 rounded-xl transition-colors text-sm"
              >
                {editingProcesso ? 'Salvar Alterações' : 'Criar Processo'}
              </button>
            </footer>

          </div>
        </div>
      )}

      {/* INTEGRANTE EDIT PROFILE MODAL DIALOG */}
      {isEditProfileOpen && editingIntegrante && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsEditProfileOpen(false)} />

          <div className="relative bg-brand-card border border-brand-border w-full max-w-xl rounded-2xl flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 z-10">
            <header className="p-6 border-b border-brand-border flex items-center justify-between">
              <h2 className="text-lg font-bold text-gradient">
                Editar Perfil de {editingIntegrante.nome}
              </h2>
              <button onClick={() => setIsEditProfileOpen(false)} className="text-brand-muted hover:text-white transition-colors">
                <X size={20} />
              </button>
            </header>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-muted">Cargo / Título Profissional *</label>
                <input
                  type="text"
                  required
                  value={profileCargo}
                  onChange={(e) => setProfileCargo(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-primary text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-muted">Responsabilidades (Uma por linha) *</label>
                <textarea
                  rows={6}
                  required
                  value={profileResponsabilidades}
                  onChange={(e) => setProfileResponsabilidades(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border text-white rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-brand-primary text-xs leading-relaxed"
                  placeholder="Desenvolvimento de sites&#10;Configuração de servidores&#10;Integração de APIs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-muted">Observações do Sócio</label>
                <textarea
                  rows={3}
                  value={profileObservacoes}
                  onChange={(e) => setProfileObservacoes(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border text-white rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-brand-primary text-xs"
                  placeholder="Instruções particulares ou notas sobre a atuação do integrante..."
                />
              </div>

              <div className="pt-4 border-t border-brand-border flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="bg-brand-bg hover:bg-brand-card-hover border border-brand-border text-white font-semibold py-2 px-4 rounded-xl text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-brand-primary hover:bg-brand-primary-hover text-brand-bg font-bold py-2 px-5 rounded-xl text-xs transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
