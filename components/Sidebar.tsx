import React from 'react';
import { useStore } from '../store/appStore';
import { Plus, Clock, Settings, HelpCircle } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { sessions, currentSessionId, createSession, loadSession, sidebarOpen, toggleSettings } = useStore();

  const handleNewChat = async () => {
    await createSession("New Research");
  };

  if (!sidebarOpen) return null;

  return (
    <div className="w-64 h-screen bg-white dark:bg-horizon-900 border-r border-gray-100 dark:border-horizon-800 flex flex-col transition-all duration-300 font-sans">
      {/* Header */}
      <div className="p-6 pb-2">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Horizon</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Research Assistant</p>
      </div>

      {/* New Chat Button */}
      <div className="px-4 py-4">
        <button 
          onClick={handleNewChat}
          className="w-full flex items-center gap-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-4 py-3 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors font-medium text-sm"
        >
          <Plus size={18} />
          New Chat
        </button>
      </div>

      {/* Navigation & Recent Research - Flex 1 to fill space */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        
        <div className="mb-6">
           <div className="flex items-center gap-3 px-3 py-2 text-slate-700 dark:text-slate-200 rounded-lg">
              <Clock size={18} className="text-slate-400" />
              <span className="text-sm font-medium">Recent Research</span>
           </div>
           
           <div className="ml-9 mt-1 space-y-1">
             {sessions.length === 0 && (
                <div className="text-xs text-slate-400 italic py-1">No recent chats</div>
             )}
             {sessions.map(session => (
               <div 
                 key={session.id}
                 onClick={() => loadSession(session.id)}
                 className={`text-xs truncate py-2 cursor-pointer transition-colors ${
                   currentSessionId === session.id 
                     ? 'text-blue-600 font-medium dark:text-blue-400' 
                     : 'text-slate-500 hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-300'
                 }`}
               >
                 {session.title}
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* Bottom Footer Section: Help & Settings */}
      <div className="p-4 border-t border-gray-100 dark:border-horizon-800 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-gray-50 dark:hover:bg-horizon-800 transition-colors">
          <HelpCircle size={18} className="text-slate-400" />
          <span className="text-sm font-medium">Help & FAQ</span>
        </button>

        <button 
          onClick={toggleSettings}
          className="w-full flex items-center gap-3 px-3 py-2 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-gray-50 dark:hover:bg-horizon-800 transition-colors"
        >
          <Settings size={18} className="text-slate-400" />
          <span className="text-sm font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
};