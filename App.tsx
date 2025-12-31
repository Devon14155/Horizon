import React, { useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { SettingsPanel } from './components/SettingsPanel';
import { useStore } from './store/appStore';

function App() {
  const { init, userSettings } = useStore();

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (userSettings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [userSettings.theme]);

  return (
    <div className="flex w-full h-screen overflow-hidden bg-[#F8FAFC] text-slate-900 dark:bg-horizon-900 dark:text-slate-50 transition-colors duration-300 font-sans">
      <Sidebar />
      <ChatArea />
      <SettingsPanel />
    </div>
  );
}

export default App;