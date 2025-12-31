import React from 'react';
import { useStore } from '../store/appStore';
import { Plus, MessageSquare, Trash2, Menu, Settings } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { sessions, currentSessionId, createSession, loadSession, deleteSession, sidebarOpen, toggleSidebar, toggleSettings } = useStore();

  const handleNewChat = async () => {
    await createSession("New Research");
  };

  if (!sidebarOpen) return null;

  return (
    <div className="w-72 h-screen bg-horizon-900 border-r border-horizon-700 flex flex-col transition-all duration-300">
      <div className="p-4 border-b border-horizon-700 flex items-center justify-between">
        <h1 className="text-xl font-bold font-mono text-white tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-horizon-500"></span>
          HORIZON
        </h1>
        <button onClick={toggleSidebar} className="text-horizon-400 hover:text-white">
          <Menu size={20} />
        </button>
      </div>

      <div className="p-4">
        <button 
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 bg-horizon-500 hover:bg-horizon-400 text-white py-3 rounded-lg transition-colors font-medium shadow-lg shadow-horizon-500/20"
        >
          <Plus size={18} /> New Research
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="text-xs font-semibold text-horizon-400 uppercase tracking-wider mb-2">History</div>
        {sessions.map(session => (
          <div 
            key={session.id}
            onClick={() => loadSession(session.id)}
            className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
              currentSessionId === session.id 
                ? 'bg-horizon-800 border border-horizon-500/50 text-white' 
                : 'text-gray-400 hover:bg-horizon-800/50 hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <MessageSquare size={16} className={currentSessionId === session.id ? 'text-horizon-400' : 'text-gray-600'} />
              <span className="truncate text-sm">{session.title}</span>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
              className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-horizon-700">
        <button 
          onClick={toggleSettings}
          className="w-full flex items-center gap-3 p-3 rounded-lg text-gray-400 hover:bg-horizon-800 hover:text-white transition-colors"
        >
          <Settings size={18} />
          <span className="text-sm font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
};