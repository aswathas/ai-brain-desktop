# AI Brain Desktop

An Electron desktop shell for the [ai-brain](https://www.npmjs.com/package/ai-brain) wiki workflow: browse a Markdown wiki folder, pick a thinking persona, and chat over it.

**Status: early scaffold (v1.0.0).** The wiki explorer, persona selection, settings, and CLI buttons work against the real filesystem. The chat pane currently returns a simulated response — see [Not implemented yet](#not-implemented-yet).

## What problem it solves

A Markdown wiki lives in a folder. Reading it means either opening an editor (Obsidian) or grepping files by hand, and neither lets you ask a question *in the persona you want answered in* — skeptical, first-principles, historical. This app puts both in one window: a file tree on the left, a persona-shaped chat on the right, with buttons to run the `ai-brain` CLI over the same folder.

It is deliberately narrow. It is not a wiki editor — the "Open in Obsidian" button hands off to Obsidian rather than editing markdown itself.

## Requirements

- Node.js with npm (build uses Vite 5 and TypeScript 5.3)
- A wiki folder at `~/Documents/AswathWiki`

The wiki path is **hardcoded** in `src/main/main.ts` as `~/Documents/AswathWiki`. The Settings panel displays the path read-only; there is no way to change it without editing that source file. If the folder does not exist, the sidebar shows `No wiki found` and the path it looked in.

## Install

```bash
npm install
```

## Build

```bash
npm run build
```

Runs `build:main` (`tsc`, `src/main/` → `dist/main.js` + `dist/preload.js`) then `build:renderer` (`vite build`, `src/renderer/` → `dist/renderer/`). Both must run — Electron's `main` entry is `dist/main.js`, which does not exist until `build:main` finishes.

## Run

```bash
npm start
```

Equivalent to `electron .`. Requires a prior `npm run build`.

> **Known issue: `npm start` shows a blank window on its own.**
> `src/main/main.ts` decides what to load with `const isDev = !app.isPackaged`. Any `electron .` run is unpackaged, so `isDev` is `true` and the app loads `http://localhost:5173` instead of the built `dist/renderer/index.html` — and no script in `package.json` starts a Vite dev server there. To see the UI right now you need one in another terminal:
>
> ```bash
> npx vite            # root is src/renderer, server port 5173 per vite.config.ts
> ```
>
> then `npm start` in a second terminal. DevTools also auto-open in this mode.
>
> To load the production bundle instead, set `isDev` to false in `src/main/main.ts` and rebuild.

`npm run dev` is `npm run build && npm run start` and hits the same issue.

## Configuration

There is no config file, `.env`, or CLI flags. Everything is one of:

| What | Where it comes from |
|---|---|
| Wiki path | hardcoded `~/Documents/AswathWiki` in `src/main/main.ts` |
| Vite dev server port | `5173` in `vite.config.ts` (only used in the `isDev` path above) |
| Window geometry | 1200×800, min 800×600, `#0f0f0f` background — `src/main/main.ts` |
| Anthropic / OpenAI keys | entered in the Settings panel, stored in renderer `localStorage` |
| Selected provider | `anthropic` (default) or `openai`, stored in `localStorage` |

## Personas

Six are defined in `src/renderer/App.tsx`, chosen from chips above the chat:

| Persona | Role |
|---|---|
| `@socrates` | Socratic questioning and deep inquiry |
| `@first-principles` | Break down to fundamental truths |
| `@devil-advocate` | Challenge assumptions and find flaws |
| `@synthesizer` | Connect ideas and find patterns |
| `@historian` | Context from past examples |
| `@architect` | System design and structure |

The persona's `id` and the API keys are the two inputs the real chat call would send. Adding one means appending to the `personas` array.

## Architecture

```
src/main/main.ts      Electron main process; window creation + ipcMain handlers
src/main/preload.ts   contextBridge -> window.electronAPI
src/renderer/         React 18 + Vite UI (App, Chat, Sidebar, Settings, PersonaSelector)
```

The window runs with `contextIsolation: true` and `nodeIntegration: false`, so the renderer reaches the filesystem and the child-process API only through four exposed calls (`src/main/preload.ts`):

| Bridge call | IPC channel | Does |
|---|---|---|
| `openInObsidian()` | `open-in-obsidian` | `shell.openPath` on the wiki folder |
| `getWikiStructure()` | `get-wiki-structure` | recursive directory walk → folder/file tree |
| `spawnAiBrain(cmd, args)` | `spawn-ai-brain` | `child_process.spawn` with piped stdio, resolves `{code, stdout, stderr}` |
| `getAppInfo()` | `get-app-info` | app version, platform, resolved wiki path |

The renderer HTML sets a CSP of `default-src 'self'` with `connect-src 'self' http://localhost:*`.

Two buttons in the toolbar call the CLI through that bridge, and both log their result to the DevTools console rather than showing it in the UI:

- **Init Wiki** → `npx ai-brain init`
- **Lint** → `npx ai-brain lint`

Both assume an `ai-brain` package resolvable by `npx`. Note `spawn-ai-brain` runs with `shell: true`, so the command string is passed to a shell.

## Not implemented yet

Stated plainly so nothing here is mistaken for working:

- **Chat returns a simulated response.** `sendMessage` in `src/renderer/components/Chat.tsx` waits one second and posts a placeholder string. The real `fetch('/api/chat', …)` call is present but commented out, and there is no `/api/chat` server in this repo. The API keys you enter in Settings are stored and displayed but not used by any code path.
- **No packaging.** `electron-builder` / `electron-forge` are not dependencies, so there is no installer to produce — `npm run build` produces `dist/`, not an app. `.gitattributes` carries Git LFS filters for `.exe`/`.dll`/`.so`, but no binary is tracked and no LFS object exists.
- **No tests, linter, or CI config** in the repo.
- **`src/preload.js` and `src/preload.d.ts` are committed build output.** `tsc` regenerates them into `dist/`; the checked-in copies at `src/` are not used by the Electron entry point.
- **macOS behavior is untested here.** The only macOS-specific branch is `window-all-closed` not quitting on `darwin`.

## License

No license file in the repo.