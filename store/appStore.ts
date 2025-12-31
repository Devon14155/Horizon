import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { AppState, ResearchSession, Message, MessageRole, TaskStatus, ResearchTask, UserSettings, VerificationResult, Source, QualityMetrics } from '../types';
import { db } from '../database/db';

interface StoreActions {
  init: () => Promise<void>;
  createSession: (title: string) => Promise<string>;
  loadSession: (id: string) => Promise<void>;
  addMessage: (sessionId: string, role: MessageRole, content: string, suggestions?: string[]) => Promise<void>;
  updateSessionTasks: (sessionId: string, tasks: ResearchTask[]) => Promise<void>;
  updateTaskStatus: (sessionId: string, taskId: string, status: TaskStatus, findings?: string, sources?: Source[], verification?: VerificationResult, quality?: QualityMetrics) => Promise<void>;
  setSynthesis: (sessionId: string, report: string) => Promise<void>;
  toggleSidebar: () => void;
  toggleSettings: () => void;
  setShowReportView: (show: boolean) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  deleteSession: (id: string) => Promise<void>;
  setLoadingStatus: (status: string | null) => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  language: 'en',
  expertiseLevel: 'expert'
};

export const useStore = create<AppState & StoreActions>((set, get) => ({
  currentSessionId: null,
  sessions: [],
  isLoading: false,
  loadingStatus: null,
  activeTask: null,
  sidebarOpen: true,
  settingsOpen: false,
  showReportView: false,
  userSettings: DEFAULT_SETTINGS,

  init: async () => {
    const sessions = await db.sessions.orderBy('updatedAt').reverse().toArray();
    const savedSettings = localStorage.getItem('horizon_settings');
    const parsed = savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS;
    
    // Ensure we don't carry over old fields like apiKey if they exist in localStorage
    const userSettings: UserSettings = {
        theme: parsed.theme || DEFAULT_SETTINGS.theme,
        language: parsed.language || DEFAULT_SETTINGS.language,
        expertiseLevel: parsed.expertiseLevel || DEFAULT_SETTINGS.expertiseLevel
    };

    set({ 
      sessions, 
      userSettings
    });
  },

  createSession: async (title: string) => {
    const newSession: ResearchSession = {
      id: uuidv4(),
      title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      tasks: [],
      isArchived: false
    };
    await db.sessions.add(newSession);
    const sessions = await db.sessions.orderBy('updatedAt').reverse().toArray();
    set({ sessions, currentSessionId: newSession.id, showReportView: false });
    return newSession.id;
  },

  loadSession: async (id: string) => {
    set({ currentSessionId: id, showReportView: false });
  },

  addMessage: async (sessionId, role, content, suggestions) => {
    const session = await db.sessions.get(sessionId);
    if (!session) return;

    const newMessage: Message = {
      id: uuidv4(),
      role,
      content,
      timestamp: Date.now(),
      suggestions
    };

    const updatedSession = {
      ...session,
      messages: [...session.messages, newMessage],
      updatedAt: Date.now()
    };

    await db.sessions.put(updatedSession);
    
    const { sessions } = get();
    const updatedSessions = sessions.map(s => s.id === sessionId ? updatedSession : s);
    set({ sessions: updatedSessions });
  },

  updateSessionTasks: async (sessionId, tasks) => {
    const session = await db.sessions.get(sessionId);
    if (!session) return;

    const updatedSession = { ...session, tasks, updatedAt: Date.now() };
    await db.sessions.put(updatedSession);
    
    const { sessions } = get();
    set({ sessions: sessions.map(s => s.id === sessionId ? updatedSession : s) });
  },

  updateTaskStatus: async (sessionId, taskId, status, findings, sources, verification, quality) => {
    const session = await db.sessions.get(sessionId);
    if (!session) return;

    const updatedTasks = session.tasks.map(t => {
      if (t.id === taskId) {
        return { 
          ...t, 
          status, 
          findings: findings || t.findings,
          sources: sources ? [...(t.sources || []), ...sources] : t.sources,
          sourceUrls: sources ? [...(t.sourceUrls || []), ...sources.map(s => s.url)] : t.sourceUrls,
          verification: verification || t.verification,
          quality: quality || t.quality
        };
      }
      return t;
    });

    const updatedSession = { ...session, tasks: updatedTasks, updatedAt: Date.now() };
    await db.sessions.put(updatedSession);
    
    const { sessions } = get();
    set({ sessions: sessions.map(s => s.id === sessionId ? updatedSession : s) });
  },

  setSynthesis: async (sessionId, report) => {
    const session = await db.sessions.get(sessionId);
    if (!session) return;

    const updatedSession = { ...session, synthesis: report, updatedAt: Date.now() };
    await db.sessions.put(updatedSession);

    const { sessions } = get();
    set({ sessions: sessions.map(s => s.id === sessionId ? updatedSession : s) });
  },

  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  
  toggleSettings: () => set(state => ({ settingsOpen: !state.settingsOpen })),
  
  setShowReportView: (show) => set({ showReportView: show }),

  updateSettings: (newSettings) => {
    set(state => {
      const updated = { ...state.userSettings, ...newSettings };
      localStorage.setItem('horizon_settings', JSON.stringify(updated));
      return { userSettings: updated };
    });
  },

  deleteSession: async (id) => {
    await db.sessions.delete(id);
    const sessions = await db.sessions.orderBy('updatedAt').reverse().toArray();
    set({ sessions, currentSessionId: null });
  },
  
  setLoadingStatus: (status) => set({ loadingStatus: status })
}));