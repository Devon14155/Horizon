import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/appStore';
import { startResearchProcess } from '../agents/orchestrator';
import { MessageRole } from '../types';
import { Send, Menu, Bot, User, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { TaskBoard } from './TaskBoard';
import { ReportView } from './ReportView';

export const ChatArea: React.FC = () => {
  const { currentSessionId, sessions, addMessage, createSession, toggleSidebar, sidebarOpen, setShowReportView } = useStore();
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages, currentSession?.tasks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const text = input;
    setInput('');
    setIsProcessing(true);

    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = await createSession(text.slice(0, 30) + "...");
    }

    if (sessionId) {
      await addMessage(sessionId, MessageRole.USER, text);
      await startResearchProcess(sessionId, text);
    }
    
    setIsProcessing(false);
  };

  if (!currentSessionId && sessions.length === 0) {
     return (
       <div className="flex-1 flex flex-col items-center justify-center bg-horizon-900 text-gray-400 p-8">
         <div className="mb-6 relative">
            <div className="w-20 h-20 rounded-full bg-horizon-500/20 flex items-center justify-center animate-pulse">
               <Bot size={40} className="text-horizon-400" />
            </div>
         </div>
         <h2 className="text-4xl font-mono text-white mb-4 tracking-tighter">HORIZON</h2>
         <p className="text-center max-w-md mb-8">
           AI-powered research assistant grounded in real-time data.
           Plan. Execute. Synthesize.
         </p>
         <form onSubmit={handleSubmit} className="w-full max-w-lg relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter a research topic..."
              className="w-full bg-horizon-800 border border-horizon-700 rounded-xl px-4 py-4 pr-12 text-white focus:outline-none focus:border-horizon-500 shadow-xl"
            />
            <button type="submit" className="absolute right-3 top-3 p-1 bg-horizon-500 rounded-lg text-white hover:bg-horizon-400 transition-colors">
              <Send size={20} />
            </button>
         </form>
       </div>
     );
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-horizon-900 relative">
      <ReportView />
      
      {!sidebarOpen && (
        <button onClick={toggleSidebar} className="absolute top-4 left-4 z-10 text-horizon-400 hover:text-white bg-horizon-800 p-2 rounded-lg border border-horizon-700">
          <Menu size={20} />
        </button>
      )}

      {currentSession?.synthesis && (
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={() => setShowReportView(true)}
            className="flex items-center gap-2 bg-horizon-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-horizon-400 transition-transform hover:scale-105"
          >
            <FileText size={18} /> View Report
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        {currentSession?.messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === MessageRole.USER ? 'justify-end' : 'justify-start'}`}>
            {msg.role !== MessageRole.USER && (
               <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === MessageRole.SYSTEM ? 'bg-orange-500/20 text-orange-400' : 'bg-horizon-500/20 text-horizon-400'}`}>
                 <Bot size={16} />
               </div>
            )}
            
            <div className={`max-w-3xl rounded-2xl p-4 ${
              msg.role === MessageRole.USER 
                ? 'bg-horizon-500 text-white' 
                : msg.role === MessageRole.SYSTEM 
                  ? 'bg-transparent text-gray-500 text-sm border border-dashed border-gray-700 font-mono'
                  : 'bg-horizon-800 text-gray-100 border border-horizon-700 shadow-sm'
            }`}>
              <div className="prose prose-invert prose-sm max-w-none">
                 <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>

            {msg.role === MessageRole.USER && (
               <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
                 <User size={16} className="text-gray-300" />
               </div>
            )}
          </div>
        ))}
        
        {currentSession?.tasks && currentSession.tasks.length > 0 && (
          <div className="max-w-3xl mx-auto w-full mt-4">
            <TaskBoard tasks={currentSession.tasks} />
          </div>
        )}

        {isProcessing && (
           <div className="flex justify-center items-center py-4">
             <div className="animate-pulse flex space-x-2">
               <div className="h-2 w-2 bg-horizon-400 rounded-full"></div>
               <div className="h-2 w-2 bg-horizon-400 rounded-full"></div>
               <div className="h-2 w-2 bg-horizon-400 rounded-full"></div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-horizon-900 border-t border-horizon-800">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isProcessing}
            placeholder={isProcessing ? "Research in progress..." : "Ask follow-up or research..."}
            className="w-full bg-horizon-800 border border-horizon-700 rounded-xl px-4 py-4 pr-12 text-white focus:outline-none focus:border-horizon-500 shadow-xl disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={isProcessing || !input.trim()}
            className="absolute right-3 top-3 p-1 bg-horizon-500 rounded-lg text-white hover:bg-horizon-400 transition-colors disabled:bg-gray-700"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};