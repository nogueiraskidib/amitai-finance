-- Tabela para Clientes (Funil e Clientes Ativos)
CREATE TABLE public.clientes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    "stageId" INTEGER NOT NULL,
    "timeInStage" INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Normal',
    tasks JSONB DEFAULT '[]'::jsonb,
    history JSONB DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    "lastUpdated" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    responsible TEXT,
    "contractValue" TEXT,
    "assetsChecklist" JSONB DEFAULT '[]'::jsonb,
    "operationalChecklist" JSONB DEFAULT '[]'::jsonb,
    progress INTEGER DEFAULT 0
);

-- Tabela para Metas Globais
CREATE TABLE public.metas_globais (
    id INTEGER PRIMARY KEY DEFAULT 1,
    "weeklyProgress" INTEGER DEFAULT 0,
    "weeklyTarget" INTEGER DEFAULT 25
);

-- Tabela para Metas dos Sócios
CREATE TABLE public.metas_socios (
    name TEXT PRIMARY KEY,
    "dailyProgress" INTEGER DEFAULT 0,
    "dailyTarget" INTEGER DEFAULT 5
);

-- Tabela para Processos
CREATE TABLE public.processos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    author TEXT NOT NULL,
    "assignedTo" TEXT,
    status TEXT DEFAULT 'Em andamento',
    priority TEXT DEFAULT 'Baixa',
    category TEXT DEFAULT 'Geral',
    "dueDate" TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    comments JSONB DEFAULT '[]'::jsonb,
    history JSONB DEFAULT '[]'::jsonb
);

-- Tabela para Integrantes
CREATE TABLE public.integrantes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    "activeTasks" INTEGER DEFAULT 0,
    "completedTasks" INTEGER DEFAULT 0,
    avatar TEXT,
    performance INTEGER DEFAULT 100
);

-- Inserir dados padrão
INSERT INTO public.metas_globais (id, "weeklyProgress", "weeklyTarget") VALUES (1, 0, 25);
INSERT INTO public.metas_socios (name, "dailyProgress", "dailyTarget") VALUES 
('Gabriel', 0, 5),
('Neto', 0, 5),
('Manu', 0, 5);
