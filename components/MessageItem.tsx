import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, Copy, Check, Sparkles } from 'lucide-react';
import { MessageRole, Message } from '../types';
import { motion } from 'framer-motion';

interface MessageItemProps {
  message: Message;
  isOnline: boolean;
  onSuggestionClick: (sugg: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, isOnline, onSuggestionClick }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = message.role === MessageRole.USER;
  const isSystem = message.role === MessageRole.SYSTEM;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-4 max-w-4xl mx-auto ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* Bot Avatar */}
      {!isUser && (
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1 ${
           isSystem 
            ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/20' 
            : 'bg-white border border-gray-200 shadow-sm text-blue-600 dark:bg-horizon-800 dark:border-horizon-700'
        }`}>
          <Bot size={18} />
        </div>
      )}
      
      <div className={`relative group max-w-3xl rounded-2xl p-5 ${
        isUser 
          ? 'bg-blue-600 text-white shadow-md' 
          : isSystem 
            ? 'bg-transparent text-slate-500 text-sm border border-dashed border-slate-300 font-mono w-full dark:border-horizon-600'
            : 'bg-white dark:bg-horizon-800 text-slate-800 dark:text-gray-100 shadow-sm border border-slate-100 dark:border-horizon-700'
      }`}>
        
        {/* Copy Button (Model Only) */}
        {!isUser && !isSystem && (
          <button 
            onClick={handleCopy}
            className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-transparent hover:bg-slate-100 dark:hover:bg-horizon-700 rounded transition-colors opacity-0 group-hover:opacity-100"
            title="Copy message"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          </button>
        )}

        <div className="prose prose-sm max-w-none dark:prose-invert break-words">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              // Custom link rendering to open in new tab
              a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all" />,
              // Custom code block rendering
              code: ({node, className, children, ...props}) => {
                const match = /language-(\w+)/.exec(className || '')
                // If it's a block code
                if (match) {
                    return (
                        <code className={`${className} block bg-slate-900 text-slate-50 p-3 rounded-lg text-xs overflow-x-auto`} {...props}>
                            {children}
                        </code>
                    )
                }
                // Inline code
                return <code className="bg-slate-100 dark:bg-horizon-900 text-red-500 dark:text-red-400 px-1 py-0.5 rounded font-mono text-xs" {...props}>{children}</code>
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Suggestions */}
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-horizon-700 flex flex-wrap gap-2">
            {message.suggestions.map((sugg, i) => (
              <button 
                key={i}
                onClick={() => onSuggestionClick(sugg)}
                disabled={!isOnline}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-horizon-900 border border-slate-200 dark:border-horizon-700 hover:border-blue-300 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-medium text-slate-600 dark:text-slate-300 transition-all shadow-sm disabled:opacity-50 text-left"
              >
                <Sparkles size={12} className="text-blue-500 shrink-0" />
                {sugg}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-horizon-700 flex items-center justify-center shrink-0 mt-1 text-slate-500">
          <User size={18} />
        </div>
      )}
    </motion.div>
  );
};