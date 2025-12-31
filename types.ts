export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  VERIFIED = 'VERIFIED'
}

export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export type ToolMode = 'web' | 'research' | 'thinking';

export interface VerificationResult {
  isAccurate: boolean;
  confidence: number;
  correction?: string;
}

export interface QualityMetrics {
  score: number;
  issues: string[];
  isAcceptable: boolean;
}

export interface Source {
  url: string;
  title: string;
}

export interface ResearchTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  query: string;
  findings?: string;
  sourceUrls?: string[];
  sources?: Source[];
  quality?: QualityMetrics;
  verification?: VerificationResult;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  relatedTaskId?: string;
  suggestions?: string[]; // New: Next step suggestions
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
  // apiKey removed per guidelines
  theme: 'dark' | 'light';
  language: string;
  expertiseLevel: 'beginner' | 'expert';
}

export interface AppState {
  currentSessionId: string | null;
  sessions: ResearchSession[];
  isLoading: boolean;
  loadingStatus: string | null;
  activeTask: string | null;
  sidebarOpen: boolean;
  settingsOpen: boolean;
  showReportView: boolean;
  userSettings: UserSettings;
}