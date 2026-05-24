import { app, BrowserWindow, ipcMain, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';

let mainWindow: BrowserWindow | null = null;

const isDev = !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#0f0f0f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    frame: true,
    titleBarStyle: 'default',
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers

// Open wiki folder in Obsidian
ipcMain.handle('open-in-obsidian', async () => {
  const wikiPath = path.join(app.getPath('home'), 'Documents', 'AswathWiki');
  if (fs.existsSync(wikiPath)) {
    shell.openPath(wikiPath);
    return { success: true, path: wikiPath };
  }
  return { success: false, error: 'Wiki folder not found' };
});

// Get wiki folder structure
ipcMain.handle('get-wiki-structure', async () => {
  const wikiPath = path.join(app.getPath('home'), 'Documents', 'AswathWiki');
  if (!fs.existsSync(wikiPath)) {
    return { success: false, error: 'Wiki folder not found' };
  }

  function buildTree(dirPath: string): any[] {
    const items: any[] = [];
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        items.push({
          name: entry.name,
          type: 'folder',
          children: buildTree(fullPath),
        });
      } else {
        items.push({
          name: entry.name,
          type: 'file',
        });
      }
    }
    return items;
  }

  return { success: true, tree: buildTree(wikiPath) };
});

// Spawn ai-brain CLI command
ipcMain.handle('spawn-ai-brain', async (_event, command: string, args: string[]) => {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      shell: true,
      stdio: 'pipe',
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });

    child.on('error', (err) => {
      resolve({ code: -1, stdout: '', stderr: err.message });
    });
  });
});

// Get app info
ipcMain.handle('get-app-info', async () => {
  return {
    version: app.getVersion(),
    platform: process.platform,
    wikiPath: path.join(app.getPath('home'), 'Documents', 'AswathWiki'),
  };
});