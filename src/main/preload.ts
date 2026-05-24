import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  openInObsidian: () => ipcRenderer.invoke('open-in-obsidian'),
  getWikiStructure: () => ipcRenderer.invoke('get-wiki-structure'),
  spawnAiBrain: (command: string, args: string[]) =>
    ipcRenderer.invoke('spawn-ai-brain', command, args),
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
});