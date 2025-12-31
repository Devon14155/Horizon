import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/appStore';
import { startResearchProcess } from '../agents/orchestrator';
import { MessageRole, ToolMode } from '../types';
import { Send, Menu, Bot, User, FileText, Sparkles, Paperclip, Mic, ArrowRight, ArrowUp, Wand2, Scale, Map, Microscope, Globe, FlaskConical, Brain, Settings, CheckCircle2, Circle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { TaskBoard } from './TaskBoard';
import { ReportView } from './ReportView';

export const ChatArea: React.FC = () => {
  const { currentSessionId, sessions, addMessage, createSession, toggleSidebar, sidebarOpen, setShowReportView } = useStore();
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [selectedTool, setSelectedTool] = useState<ToolMode>('web');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages, currentSession?.tasks]);

  const processInput = async (text: string) => {
    if (!text.trim() || isProcessing) return;
    
    setIsProcessing(true);
    setInput('');

    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = await createSession(text.slice(0, 30) + "...");
    }

    if (sessionId) {
      await addMessage(sessionId, MessageRole.USER, text);
      // Connect selectedTool to the backend logic
      await startResearchProcess(sessionId, text, selectedTool);
    }
    
    setIsProcessing(false);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    if (isProcessing) return;
    await processInput(suggestion);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await processInput(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  // Empty State / Welcome Screen
  if (!currentSessionId && sessions.length === 0) {
     return (
       <div className="flex-1 flex flex-col bg-[#F8FAFC] dark:bg-horizon-900 relative font-sans">
          {!sidebarOpen && (
            <button onClick={toggleSidebar} className="absolute top-4 left-4 z-10 text-slate-500 p-2 rounded-lg hover:bg-white dark:hover:bg-horizon-800 transition-colors">
              <Menu size={24} />
            </button>
          )}

          <div className="flex-1 flex flex-col items-center justify-center p-8 pb-32 overflow-y-auto">
             {/* Logo */}
             <div className="w-16 h-16 bg-white dark:bg-horizon-800 rounded-2xl shadow-sm flex items-center justify-center mb-8">
                <div className="w-8 h-8 bg-blue-500 rounded-lg transform rotate-45"></div>
             </div>

             <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 text-center">Welcome to Horizon AI</h2>
             <p className="text-slate-500 dark:text-slate-400 mb-10 text-center">Start a conversation or try:</p>

             {/* Action Cards */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl px-4">
                
                <button onClick={() => processInput("Analyze key papers on...")} className="bg-white dark:bg-horizon-800 p-4 rounded-xl border border-slate-200 dark:border-horizon-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all text-left group shadow-sm hover:shadow-md">
                   <div className="flex justify-between items-start mb-2">
                      <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                        <FileText size={18} />
                      </div>
                      <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                   </div>
                   <span className="block font-semibold text-slate-800 dark:text-white text-sm mb-1">Analyze Papers</span>
                   <p className="text-slate-500 dark:text-slate-400 text-xs">Extract insights from literature.</p>
                </button>

                <button onClick={() => processInput("Summarize the concept of...")} className="bg-white dark:bg-horizon-800 p-4 rounded-xl border border-slate-200 dark:border-horizon-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all text-left group shadow-sm hover:shadow-md">
                   <div className="flex justify-between items-start mb-2">
                      <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400">
                        <Sparkles size={18} />
                      </div>
                      <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                   </div>
                   <span className="block font-semibold text-slate-800 dark:text-white text-sm mb-1">Summarize Topic</span>
                   <p className="text-slate-500 dark:text-slate-400 text-xs">Get a quick overview.</p>
                </button>

                <button onClick={() => processInput("Generate a hypothesis regarding...")} className="bg-white dark:bg-horizon-800 p-4 rounded-xl border border-slate-200 dark:border-horizon-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all text-left group shadow-sm hover:shadow-md">
                   <div className="flex justify-between items-start mb-2">
                      <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-lg text-green-600 dark:text-green-400">
                        <Wand2 size={18} />
                      </div>
                      <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                   </div>
                   <span className="block font-semibold text-slate-800 dark:text-white text-sm mb-1">Hypothesize</span>
                   <p className="text-slate-500 dark:text-slate-400 text-xs">Generate new research questions.</p>
                </button>

                <button onClick={() => processInput("Compare the theories of...")} className="bg-white dark:bg-horizon-800 p-4 rounded-xl border border-slate-200 dark:border-horizon-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all text-left group shadow-sm hover:shadow-md">
                   <div className="flex justify-between items-start mb-2">
                      <div className="p-2 bg-orange-50 dark:bg-orange-500/10 rounded-lg text-orange-600 dark:text-orange-400">
                        <Scale size={18} />
                      </div>
                      <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                   </div>
                   <span className="block font-semibold text-slate-800 dark:text-white text-sm mb-1">Compare</span>
                   <p className="text-slate-500 dark:text-slate-400 text-xs">Contrast multiple viewpoints.</p>
                </button>

                <button onClick={() => processInput("Create a research plan for...")} className="bg-white dark:bg-horizon-800 p-4 rounded-xl border border-slate-200 dark:border-horizon-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all text-left group shadow-sm hover:shadow-md">
                   <div className="flex justify-between items-start mb-2">
                      <div className="p-2 bg-teal-50 dark:bg-teal-500/10 rounded-lg text-teal-600 dark:text-teal-400">
                        <Map size={18} />
                      </div>
                      <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                   </div>
                   <span className="block font-semibold text-slate-800 dark:text-white text-sm mb-1">Plan Research</span>
                   <p className="text-slate-500 dark:text-slate-400 text-xs">Structure your methodology.</p>
                </button>

                <button onClick={() => processInput("Critique the methodology of...")} className="bg-white dark:bg-horizon-800 p-4 rounded-xl border border-slate-200 dark:border-horizon-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all text-left group shadow-sm hover:shadow-md">
                   <div className="flex justify-between items-start mb-2">
                      <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-lg text-red-600 dark:text-red-400">
                        <Microscope size={18} />
                      </div>
                      <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                   </div>
                   <span className="block font-semibold text-slate-800 dark:text-white text-sm mb-1">Critique</span>
                   <p className="text-slate-500 dark:text-slate-400 text-xs">Identify flaws and limitations.</p>
                </button>

             </div>
          </div>

          {/* Input Area */}
          <div className="w-full max-w-4xl mx-auto px-4 pb-8 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC] to-transparent pt-10 dark:from-horizon-900 dark:via-horizon-900">
             <div className="bg-white dark:bg-horizon-800 rounded-2xl shadow-xl border border-slate-200 dark:border-horizon-700 p-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about your research..."
                  className="w-full bg-transparent border-none focus:ring-0 text-slate-800 dark:text-white px-3 py-2 text-base resize-none min-h-[50px] max-h-[200px]"
                  rows={1}
                />
                
                <div className="flex justify-between items-center mt-2 px-1">
                   <div className="flex items-center gap-2">
                      <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-horizon-700 rounded-lg transition-colors">
                         <Paperclip size={20} />
                      </button>
                      
                      <div className="relative">
                        {showTools && (
                            <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-horizon-800 rounded-2xl shadow-xl border border-gray-200 dark:border-horizon-700 p-2 z-50 animate-in fade-in slide-in-from-bottom-2">
                                <div className="px-3 py-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Quick Actions</div>
                                
                                <button onClick={() => { setSelectedTool('web'); setShowTools(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-horizon-700 transition-colors group">
                                    {selectedTool === 'web' 
                                        ? <CheckCircle2 size={18} className="text-blue-500 fill-blue-500/10" /> 
                                        : <Circle size={18} className="text-slate-300 group-hover:text-slate-400" />}
                                    <Globe size={18} className="text-slate-500 dark:text-slate-400" />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Web Search</span>
                                </button>

                                <button onClick={() => { setSelectedTool('research'); setShowTools(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-horizon-700 transition-colors group">
                                    {selectedTool === 'research' 
                                        ? <CheckCircle2 size={18} className="text-blue-500 fill-blue-500/10" /> 
                                        : <Circle size={18} className="text-slate-300 group-hover:text-slate-400" />}
                                    <FlaskConical size={18} className="text-slate-500 dark:text-slate-400" />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Research Mode</span>
                                </button>

                                 <button onClick={() => { setSelectedTool('thinking'); setShowTools(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-horizon-700 transition-colors group">
                                    {selectedTool === 'thinking' 
                                        ? <CheckCircle2 size={18} className="text-blue-500 fill-blue-500/10" /> 
                                        : <Circle size={18} className="text-slate-300 group-hover:text-slate-400" />}
                                    <Brain size={18} className="text-slate-500 dark:text-slate-400" />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Extended Thinking</span>
                                </button>

                                <div className="my-2 border-t border-gray-100 dark:border-horizon-700"></div>

                                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-horizon-700 transition-colors text-slate-600 dark:text-slate-300 group">
                                    <Settings size={18} className="group-hover:text-slate-800 dark:group-hover:text-white transition-colors" />
                                    <span className="text-sm font-medium group-hover:text-slate-800 dark:group-hover:text-white transition-colors">Tool Settings</span>
                                </button>
                            </div>
                        )}
                        <button 
                             onClick={() => setShowTools(!showTools)}
                             className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${
                                showTools 
                                ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' 
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-horizon-700'
                             }`}
                        >
                             Tools
                        </button>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-2">
                      <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-horizon-700 rounded-lg transition-colors">
                         <Mic size={20} />
                      </button>
                      <button 
                        onClick={handleSubmit}
                        disabled={!input.trim() || isProcessing}
                        className={`p-2 rounded-lg transition-colors ${
                          input.trim() && !isProcessing
                           ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                           : 'bg-slate-100 dark:bg-horizon-700 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                         <ArrowUp size={20} strokeWidth={3} />
                      </button>
                   </div>
                </div>
             </div>
             <p className="text-center text-xs text-slate-400 mt-3">Horizon AI can make mistakes. Consider checking important information.</p>
          </div>
       </div>
     );
  }

  // Active Chat State
  return (
    <div className="flex-1 flex flex-col h-screen bg-[#F8FAFC] dark:bg-horizon-900 relative transition-colors duration-300 font-sans">
      <ReportView />
      
      {/* Header for mobile/when sidebar closed */}
      {!sidebarOpen && (
        <div className="absolute top-4 left-4 z-10">
           <button onClick={toggleSidebar} className="p-2 bg-white dark:bg-horizon-800 rounded-lg shadow-sm border border-slate-200 dark:border-horizon-700 text-slate-500 hover:text-slate-800 dark:text-slate-400">
             <Menu size={20} />
           </button>
        </div>
      )}

      {currentSession?.synthesis && (
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={() => setShowReportView(true)}
            className="flex items-center gap-2 bg-white dark:bg-horizon-800 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 px-4 py-2 rounded-xl shadow-sm hover:shadow-md transition-all font-medium text-sm"
          >
            <FileText size={18} /> View Report
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 pb-40">
        {currentSession?.messages.map((msg) => (
          <div key={msg.id} className="space-y-3 max-w-4xl mx-auto">
            <div className={`flex gap-4 ${msg.role === MessageRole.USER ? 'justify-end' : 'justify-start'}`}>
              
              {/* Bot Avatar */}
              {msg.role !== MessageRole.USER && (
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                   msg.role === MessageRole.SYSTEM 
                    ? 'bg-orange-100 text-orange-600' 
                    : 'bg-white border border-gray-200 shadow-sm text-blue-600'
                }`}>
                  <Bot size={18} />
                </div>
              )}
              
              <div className={`max-w-3xl rounded-2xl p-5 ${
                msg.role === MessageRole.USER 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : msg.role === MessageRole.SYSTEM 
                    ? 'bg-transparent text-slate-500 text-sm border border-dashed border-slate-300 font-mono w-full'
                    : 'bg-white dark:bg-horizon-800 text-slate-800 dark:text-gray-100 shadow-sm border border-slate-100 dark:border-horizon-700'
              }`}>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>

              {/* User Avatar */}
              {msg.role === MessageRole.USER && (
                <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-horizon-700 flex items-center justify-center shrink-0 text-slate-500">
                  <User size={18} />
                </div>
              )}
            </div>

            {/* Suggestions Chips */}
            {msg.suggestions && msg.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2 ml-12">
                {msg.suggestions.map((sugg, i) => (
                  <button 
                    key={i}
                    onClick={() => handleSuggestionClick(sugg)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-horizon-800 border border-slate-200 dark:border-horizon-700 hover:border-blue-300 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 text-sm text-slate-600 dark:text-slate-300 transition-all shadow-sm"
                  >
                    <Sparkles size={14} className="text-blue-500" />
                    {sugg}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {currentSession?.tasks && currentSession.tasks.length > 0 && (
          <div className="max-w-4xl mx-auto w-full mt-6">
            <TaskBoard tasks={currentSession.tasks} />
          </div>
        )}

        {isProcessing && (
           <div className="flex justify-center items-center py-4">
             <div className="flex space-x-2 bg-white dark:bg-horizon-800 px-4 py-2 rounded-full shadow-sm border border-slate-100 dark:border-horizon-700">
               <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
               <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
               <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"></div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area (Sticky Bottom) */}
      <div className="w-full max-w-4xl mx-auto px-4 pb-8 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC] to-transparent pt-10 dark:from-horizon-900 dark:via-horizon-900">
          <div className="bg-white dark:bg-horizon-800 rounded-2xl shadow-xl border border-slate-200 dark:border-horizon-700 p-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your research..."
              className="w-full bg-transparent border-none focus:ring-0 text-slate-800 dark:text-white px-3 py-2 text-base resize-none min-h-[50px] max-h-[200px]"
              rows={1}
            />
            
            <div className="flex justify-between items-center mt-2 px-1">
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-horizon-700 rounded-lg transition-colors">
                      <Paperclip size={20} />
                  </button>
                  
                  <div className="relative">
                    {showTools && (
                        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white dark:bg-horizon-800 rounded-2xl shadow-xl border border-gray-200 dark:border-horizon-700 p-2 z-50 animate-in fade-in slide-in-from-bottom-2">
                            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Quick Actions</div>
                            
                            <button onClick={() => { setSelectedTool('web'); setShowTools(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-horizon-700 transition-colors group">
                                {selectedTool === 'web' 
                                    ? <CheckCircle2 size={18} className="text-blue-500 fill-blue-500/10" /> 
                                    : <Circle size={18} className="text-slate-300 group-hover:text-slate-400" />}
                                <Globe size={18} className="text-slate-500 dark:text-slate-400" />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Web Search</span>
                            </button>

                            <button onClick={() => { setSelectedTool('research'); setShowTools(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-horizon-700 transition-colors group">
                                {selectedTool === 'research' 
                                    ? <CheckCircle2 size={18} className="text-blue-500 fill-blue-500/10" /> 
                                    : <Circle size={18} className="text-slate-300 group-hover:text-slate-400" />}
                                <FlaskConical size={18} className="text-slate-500 dark:text-slate-400" />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Research Mode</span>
                            </button>

                             <button onClick={() => { setSelectedTool('thinking'); setShowTools(false); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-horizon-700 transition-colors group">
                                {selectedTool === 'thinking' 
                                    ? <CheckCircle2 size={18} className="text-blue-500 fill-blue-500/10" /> 
                                    : <Circle size={18} className="text-slate-300 group-hover:text-slate-400" />}
                                <Brain size={18} className="text-slate-500 dark:text-slate-400" />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Extended Thinking</span>
                            </button>

                            <div className="my-2 border-t border-gray-100 dark:border-horizon-700"></div>

                            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-horizon-700 transition-colors text-slate-600 dark:text-slate-300 group">
                                <Settings size={18} className="group-hover:text-slate-800 dark:group-hover:text-white transition-colors" />
                                <span className="text-sm font-medium group-hover:text-slate-800 dark:group-hover:text-white transition-colors">Tool Settings</span>
                            </button>
                        </div>
                    )}
                    <button 
                         onClick={() => setShowTools(!showTools)}
                         className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${
                            showTools 
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' 
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-horizon-700'
                         }`}
                    >
                         Tools
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-horizon-700 rounded-lg transition-colors">
                      <Mic size={20} />
                  </button>
                  <button 
                    onClick={handleSubmit}
                    disabled={!input.trim() || isProcessing}
                    className={`p-2 rounded-lg transition-colors ${
                      input.trim() && !isProcessing
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                        : 'bg-slate-100 dark:bg-horizon-700 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                      <ArrowUp size={20} strokeWidth={3} />
                  </button>
                </div>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 mt-3">Horizon AI can make mistakes. Consider checking important information.</p>
      </div>
    </div>
  );
};