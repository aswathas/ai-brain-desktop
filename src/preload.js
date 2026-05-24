"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    openInObsidian: () => electron_1.ipcRenderer.invoke('open-in-obsidian'),
    getWikiStructure: () => electron_1.ipcRenderer.invoke('get-wiki-structure'),
    spawnAiBrain: (command, args) => electron_1.ipcRenderer.invoke('spawn-ai-brain', command, args),
    getAppInfo: () => electron_1.ipcRenderer.invoke('get-app-info'),
});
