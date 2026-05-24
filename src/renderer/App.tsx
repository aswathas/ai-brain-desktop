import React, { useState, useEffect } from 'react';
import Chat from './components/Chat';
import Sidebar from './components/Sidebar';
import Settings from './components/Settings';
import PersonaSelector from './components/PersonaSelector';

export interface Persona {
  id: string;
  name: string;
  description: string;
}

const personas: Persona[] = [
  { id: 'socrates', name: '@socrates', description: 'Socratic questioning and deep inquiry' },
  { id: 'first-principles', name: '@first-principles', description: 'Break down to fundamental truths' },
  { id: 'devil-advocate', name: '@devil-advocate', description: 'Challenge assumptions and find flaws' },
  { id: 'synthesizer', name: '@synthesizer', description: 'Connect ideas and find patterns' },
  { id: 'historian', name: '@historian', description: 'Context from past examples' },
  { id: 'architect', name: '@architect', description: 'System design and structure' },
];

interface Settings {
  anthropicApiKey: string;
  openAiApiKey: string;
  selectedProvider: string;
  wikiPath: string;
}

const App: React.FC = () => {
  const [selectedPersona, setSelectedPersona] = useState<Persona>(personas[0]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    anthropicApiKey: localStorage.getItem('anthropicApiKey') || '',
    openAiApiKey: localStorage.getItem('openAiApiKey') || '',
    selectedProvider: localStorage.getItem('selectedProvider') || 'anthropic',
    wikiPath: '',
  });

  useEffect(() => {
    const loadAppInfo = async () => {
      if (window.electronAPI) {
        const info = await window.electronAPI.getAppInfo();
        setSettings((prev) => ({ ...prev, wikiPath: info.wikiPath }));
      }
    };
    loadAppInfo();
  }, []);

  const handleSettingsChange = (newSettings: Settings) => {
    setSettings(newSettings);
    localStorage.setItem('anthropicApiKey', newSettings.anthropicApiKey);
    localStorage.setItem('openAiApiKey', newSettings.openAiApiKey);
    localStorage.setItem('selectedProvider', newSettings.selectedProvider);
  };

  return (
    <div className="app-container">
      <Sidebar
        wikiPath={settings.wikiPath}
        onOpenInObsidian={() => window.electronAPI?.openInObsidian()}
      />
      <div className="main-content">
        <div className="chat-header">
          <span className="chat-header-title">AI Brain Chat</span>
          <div className="persona-badge">
            <span>{selectedPersona.name}</span>
          </div>
        </div>
        <PersonaSelector
          personas={personas}
          selectedPersona={selectedPersona}
          onSelectPersona={setSelectedPersona}
        />
        {showSettings ? (
          <Settings
            settings={settings}
            onSettingsChange={handleSettingsChange}
            onClose={() => setShowSettings(false)}
          />
        ) : (
          <Chat
            persona={selectedPersona}
            settings={settings}
          />
        )}
        <div className="toolbar">
          <button
            className="toolbar-button"
            onClick={() => setShowSettings(!showSettings)}
          >
            Settings
          </button>
          <button
            className="toolbar-button"
            onClick={async () => {
              if (window.electronAPI) {
                const result = await window.electronAPI.spawnAiBrain('npx', ['ai-brain', 'init']);
                console.log('AI Brain init:', result);
              }
            }}
          >
            Init Wiki
          </button>
          <button
            className="toolbar-button"
            onClick={async () => {
              if (window.electronAPI) {
                const result = await window.electronAPI.spawnAiBrain('npx', ['ai-brain', 'lint']);
                console.log('AI Brain lint:', result);
              }
            }}
          >
            Lint
          </button>
        </div>
      </div>
    </div>
  );
};

declare global {
  interface Window {
    electronAPI?: {
      openInObsidian: () => Promise<{ success: boolean; path?: string; error?: string }>;
      getWikiStructure: () => Promise<{ success: boolean; tree?: any[]; error?: string }>;
      spawnAiBrain: (command: string, args: string[]) => Promise<{ code: number; stdout: string; stderr: string }>;
      getAppInfo: () => Promise<{ version: string; platform: string; wikiPath: string }>;
    };
  }
}

export default App;