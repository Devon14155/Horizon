import React from 'react';
import { useStore } from '../store/appStore';
import { X, Save } from 'lucide-react';

export const SettingsPanel: React.FC = () => {
  const { settingsOpen, toggleSettings, userSettings, updateSettings } = useStore();
  
  if (!settingsOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toggleSettings();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-horizon-800 w-full max-w-md rounded-xl border border-horizon-700 shadow-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button onClick={toggleSettings} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* API Key input removed. Key is managed via environment variable process.env.API_KEY */}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Expertise Level</label>
            <select 
              value={userSettings.expertiseLevel}
              onChange={(e) => updateSettings({ expertiseLevel: e.target.value as any })}
              className="w-full bg-horizon-900 border border-horizon-700 rounded-lg px-3 py-2 text-white text-sm focus:border-horizon-500 outline-none"
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