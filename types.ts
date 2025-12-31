export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface ResearchTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  query: string;
  findings?: string;
  sourceUrls?: string[];
  qualityScore?: number; // 0-100
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  relatedTaskId?: string;
}

export interface ReportConfig {
  format: 'academic' | 'business' | 'simple';
  includeCharts: boolean;
  includeSources: boolean;
}

export interface ResearchSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  tasks: ResearchTask[];
  synthesis?: string; // Markdown content
  isArchived: boolean;
  reportConfig?: ReportConfig;
}

export interface UserSettings {
  apiKey?: string; // Stored locally if user provides it (optional fallback)
  theme: 'dark' | 'light';
  language: string;
  expertiseLevel: 'beginner' | 'expert';
}

export interface AppState {
  currentSessionId: string | null;
  sessions: ResearchSession[];
  isLoading: boolean;
  activeTask: string | null;
  sidebarOpen: boolean;
  settingsOpen: boolean;
  showReportView: boolean;
  userSettings: UserSettings;
}