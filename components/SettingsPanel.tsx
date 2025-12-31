import React from 'react';
import { useStore } from '../store/appStore';
import { X, Save, Moon, Sun } from 'lucide-react';

export const SettingsPanel: React.FC = () => {
  const { settingsOpen, toggleSettings, userSettings, updateSettings } = useStore();
  
  if (!settingsOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toggleSettings();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-horizon-800 w-full max-w-md rounded-xl border border-gray-200 dark:border-horizon-700 shadow-2xl p-6 transition-colors duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h2>
          <button onClick={toggleSettings} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updateSettings({ theme: 'light' })}
                className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg border text-sm font-medium transition-all ${
                  userSettings.theme === 'light'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-500/20 dark:border-blue-500 dark:text-blue-400'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-horizon-900 dark:border-horizon-700 dark:text-gray-400 dark:hover:bg-horizon-800'
                }`}
              >
                <Sun size={16} /> Light
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ theme: 'dark' })}
                className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg border text-sm font-medium transition-all ${
                  userSettings.theme === 'dark'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-500/20 dark:border-blue-500 dark:text-blue-400'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-horizon-900 dark:border-horizon-700 dark:text-gray-400 dark:hover:bg-horizon-800'
                }`}
              >
                <Moon size={16} /> Dark
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expertise Level</label>
            <select 
              value={userSettings.expertiseLevel}
              onChange={(e) => updateSettings({ expertiseLevel: e.target.value as any })}
              className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none dark:bg-horizon-900 dark:border-horizon-700 dark:text-white"
            >
              <option value="beginner">Beginner (Simple Explanations)</option>
              <option value="expert">Expert (Technical & Detailed)</option>
            </select>
          </div>

          <button 
            type="submit"
            className="w-full bg-horizon-500 hover:bg-horizon-400 text-white py-2 rounded-lg font-medium transition-colors mt-4 flex items-center justify-center gap-2"
          >
            <Save size={16} /> Save Settings
          </button>
        </form>
      </div>
    </div>
  );
};