import React from 'react';
import { ResearchTask, TaskStatus } from '../types';
import { Loader2, CheckCircle, Circle, AlertCircle, ExternalLink, ShieldCheck, ShieldAlert } from 'lucide-react';

interface TaskBoardProps {
  tasks: ResearchTask[];
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks }) => {
  if (tasks.length === 0) return null;

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch (e) {
      return url;
    }
  };

  return (
    <div className="bg-white dark:bg-horizon-800/50 rounded-xl border border-gray-200 dark:border-horizon-700 overflow-hidden mb-6 shadow-sm">
      <div className="p-4 bg-gray-50 dark:bg-horizon-800 border-b border-gray-200 dark:border-horizon-700 flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-horizon-400 uppercase tracking-wider">Research Plan</h3>
        <span className="text-xs text-gray-500 dark:text-gray-500">{tasks.filter(t => t.status === TaskStatus.COMPLETED).length}/{tasks.length} Completed</span>
      </div>
      <div className="p-4 space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white dark:glass p-3 rounded-lg border border-gray-200 dark:border-horizon-700/50 hover:border-horizon-500/30 transition-all">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {task.status === TaskStatus.PENDING && <Circle size={18} className="text-gray-400 dark:text-gray-600" />}
                {task.status === TaskStatus.IN_PROGRESS && <Loader2 size={18} className="text-horizon-500 dark:text-horizon-400 animate-spin" />}
                {task.status === TaskStatus.COMPLETED && <CheckCircle size={18} className="text-green-500" />}
                {task.status === TaskStatus.FAILED && <AlertCircle size={18} className="text-red-500" />}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className={`text-sm font-medium ${task.status === TaskStatus.COMPLETED ? 'text-gray-600 dark:text-gray-300' : 'text-slate-800 dark:text-white'}`}>{task.title}</h4>
                  
                  {/* Verification Badge */}
                  {task.verification && (
                    <div className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${
                      task.verification.isAccurate 
                        ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/30' 
                        : 'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/30'
                    }`}>
                      {task.verification.isAccurate ? <ShieldCheck size={10} /> : <ShieldAlert size={10} />}
                      {Math.round(task.verification.confidence)}% Trusted
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                
                {task.sourceUrls && task.sourceUrls.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {task.sourceUrls.slice(0, 3).map((url, i) => (
                      <a 
                        key={i} 
                        href={url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center gap-1 text-[10px] bg-gray-100 dark:bg-horizon-900 px-2 py-1 rounded text-gray-600 dark:text-horizon-400 hover:text-horizon-600 dark:hover:text-white transition-colors"
                      >
                        <ExternalLink size={10} />
                        {getHostname(url)}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};