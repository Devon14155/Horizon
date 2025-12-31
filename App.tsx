import React, { useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { SettingsPanel } from './components/SettingsPanel';
import { useStore } from './store/appStore';

function App() {
  const init = useStore(state => state.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="flex w-full h-screen overflow-hidden bg-horizon-900 text-slate-50">
      <Sidebar />
      <ChatArea />
      <SettingsPanel />
    </div>
  );
}

export default App;