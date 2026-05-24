import React from 'react';

interface Settings {
  anthropicApiKey: string;
  openAiApiKey: string;
  selectedProvider: string;
  wikiPath: string;
}

interface SettingsProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSettingsChange, onClose }) => {
  const handleChange = (field: keyof Settings, value: string) => {
    onSettingsChange({ ...settings, [field]: value });
  };

  return (
    <div className="settings-panel scrollable">
      <div className="settings-title">Settings</div>

      <div className="settings-section">
        <label className="settings-label">AI Provider</label>
        <select
          className="settings-input"
          value={settings.selectedProvider}
          onChange={(e) => handleChange('selectedProvider', e.target.value)}
        >
          <option value="anthropic">Anthropic (Claude)</option>
          <option value="openai">OpenAI (GPT)</option>
        </select>
      </div>

      {settings.selectedProvider === 'anthropic' ? (
        <div className="settings-section">
          <label className="settings-label">Anthropic API Key</label>
          <input
            type="password"
            className="settings-input"
            value={settings.anthropicApiKey}
            onChange={(e) => handleChange('anthropicApiKey', e.target.value)}
            placeholder="sk-ant-api03-..."
          />
        </div>
      ) : (
        <div className="settings-section">
          <label className="settings-label">OpenAI API Key</label>
          <input
            type="password"
            className="settings-input"
            value={settings.openAiApiKey}
            onChange={(e) => handleChange('openAiApiKey', e.target.value)}
            placeholder="sk-..."
          />
        </div>
      )}

      <div className="settings-section">
        <label className="settings-label">Wiki Path</label>
        <input
          type="text"
          className="settings-input"
          value={settings.wikiPath}
          readOnly
          placeholder="Auto-detected"
        />
      </div>

      <div style={{ marginTop: '24px' }}>
        <button className="button button-primary" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
};

export default Settings;