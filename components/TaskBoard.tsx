import React from 'react';
import { ResearchTask, TaskStatus } from '../types';
import { Loader2, CheckCircle, Circle, AlertCircle, ExternalLink } from 'lucide-react';

interface TaskBoardProps {
  tasks: ResearchTask[];
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ tasks }) => {
  if (tasks.length === 0) return null;

  return (
    <div className="bg-horizon-800/50 rounded-xl border border-horizon-700 overflow-hidden mb-6">
      <div className="p-4 bg-horizon-800 border-b border-horizon-700 flex justify-between items-center">
        <h3 className="text-sm font-semibold text-horizon-400 uppercase tracking-wider">Research Plan</h3>
        <span className="text-xs text-gray-500">{tasks.filter(t => t.status === TaskStatus.COMPLETED).length}/{tasks.length} Completed</span>
      </div>
      <div className="p-4 space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="glass p-3 rounded-lg border border-horizon-700/50 hover:border-horizon-500/30 transition-all">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {task.status === TaskStatus.PENDING && <Circle size={18} className="text-gray-600" />}
                {task.status === TaskStatus.IN_PROGRESS && <Loader2 size={18} className="text-horizon-400 animate-spin" />}
                {task.status === TaskStatus.COMPLETED && <CheckCircle size={18} className="text-green-500" />}
                {task.status === TaskStatus.FAILED && <AlertCircle size={18} className="text-red-500" />}
              </div>
              <div className="flex-1">
                <h4 className={`text-sm font-medium ${task.status === TaskStatus.COMPLETED ? 'text-gray-300' : 'text-white'}`}>{task.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                
                {task.sourceUrls && task.sourceUrls.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {task.sourceUrls.slice(0, 3).map((url, i) => (
                      <a 
                        key={i} 
                        href={url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center gap-1 text-[10px] bg-horizon-900 px-2 py-1 rounded text-horizon-400 hover:text-white transition-colors"
                      >
                        <ExternalLink size={10} />
                        {new URL(url).hostname.replace('www.', '')}
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