# Tauri Migration Feasibility — KOMPLEX-01

## Summary

**Overall feasibility: HIGH**

The React + Vite stack used by this project is essentially Tauri's reference frontend setup. The entire UI layer (React 19, TypeScript, Tailwind CSS v4, Framer Motion, Three.js/react-three-fiber, React Router) works unchanged inside Tauri's WebView with zero code modifications. The main effort is adding the Rust scaffold and optionally migrating storage mechanisms to take advantage of native capabilities.

---

## What Tauri Gives You (vs. the Current PWA)

### 1. Proper OS-Native App Configuration

The primary benefit for this project. Currently, all user settings (equipment, difficulty, themes, Groq API key) live in IndexedDB inside a browser profile — invisible to the OS, not easily backed up, and wiped if the user clears browser data.

With Tauri:

| Config aspect | Current (PWA/IndexedDB) | With Tauri |
|---|---|---|
| Config location | Browser profile (opaque) | `~/.config/komplex01/` (Linux), `%APPDATA%\komplex01\` (Windows), `~/Library/Application Support/komplex01/` (macOS) |
| Backup | Not portable | Plain JSON files, trivially copyable |
| API key storage | IndexedDB (cleartext in browser storage) | OS keychain via `tauri-plugin-keyring` — secure, encrypted at rest |
| Config editing | Only in-app | Can be edited with any text editor if desired |
| Cross-profile access | Locked to browser profile | OS user-level, consistent across app restarts |

### 2. Better API Key Security

The Groq API key is currently stored as cleartext in IndexedDB (`groqApiKey` field in `userSettings` store in `califorge-db`). Any process that can access the browser profile folder can read it. `tauri-plugin-keyring` stores it in the OS secure enclave (macOS Keychain, Windows Credential Manager, Linux Secret Service), making it inaccessible to other processes.

### 3. Native File Dialogs for Data Import/Export

The app has a "Purge All Records" option but no data export. Tauri's `tauri-plugin-dialog` and `tauri-plugin-fs` enable native Save/Open dialogs, making a proper JSON backup/restore feature trivial to add.

### 4. True Offline — No Service Worker Complexity

Tauri bundles the entire app into a binary. The Workbox service worker setup in `vite.config.ts` (150+ lines of cache configuration) becomes unnecessary — the app is already offline by definition. The `vite-plugin-pwa` dependency can be removed entirely, simplifying the build.

### 5. Native Notifications

Currently, there is no way to notify the user that a rest period is over when the app is backgrounded. Tauri's `tauri-plugin-notification` enables real OS notifications even when the window is minimised.

### 6. System Tray

A system tray icon with quick actions (start a 15-min workout, view today's plan) is straightforward with `tauri-plugin-shell` and the Tauri tray API.

### 7. Binary size vs. Electron

Tauri apps are ~3–10 MB installers (using the OS WebView) vs. ~100–150 MB for Electron (bundles Chromium). If desktop distribution is a goal, this matters significantly.

---

## Compatibility Analysis — Existing Dependencies

| Dependency | Tauri compatible? | Notes |
|---|---|---|
| React 19 | Yes | No changes needed |
| TypeScript 5.9 | Yes | No changes needed |
| Vite 7 | Yes | Tauri's official Vite plugin (`@tauri-apps/plugin-vite`) integrates directly |
| Tailwind CSS v4 | Yes | No changes needed |
| Framer Motion v12 | Yes | CSS animations, fully supported in WebView |
| React Router v7 | Yes | Hash routing recommended for desktop; current path-based routing also works with Tauri config |
| Three.js / react-three-fiber | Yes | WebGL is fully supported in WebView2 (Windows) and WebKit (macOS/Linux) |
| `shadergradient` | Yes | Uses Three.js internally, no issues |
| `groq-sdk` | Yes | Uses `fetch` API — works in WebView. Tauri CSP must whitelist `https://api.groq.com` (one-line config) |
| `idb` / IndexedDB | Yes | IndexedDB is fully supported inside Tauri's WebView — zero data migration needed to get things running |
| Web Audio API | Yes | Fully supported in all target WebViews |
| `nanoid` | Yes | Pure JS, no issues |
| `framer-motion` | Yes | No issues |

No existing dependency has a compatibility problem.

---

## What Changes Are Required

### Phase 1 — Scaffold Tauri (minimal viable desktop app)

1. Install Rust toolchain: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
2. Add Tauri CLI: `npm install --save-dev @tauri-apps/cli@next`
3. Add Tauri API: `npm install @tauri-apps/api@next`
4. Initialise: `npx tauri init` — this creates `src-tauri/` with `Cargo.toml`, `tauri.conf.json`, `lib.rs`, `main.rs`
5. Update `vite.config.ts`:
   - Remove `VitePWA(...)` plugin and `vite-plugin-pwa` import
   - The Tauri Vite plugin handles dev server coordination automatically
6. In `src-tauri/tauri.conf.json`, set:
   - `devUrl` to `http://localhost:5173`
   - `frontendDist` to `../dist`
   - CSP to allow `https://api.groq.com` for Groq API calls
7. Run: `npx tauri dev` — the app opens in a native window

At this point the entire existing React app works unchanged as a desktop app.

### Phase 2 — Native Config Storage (the "better configuration" goal)

Replace or supplement IndexedDB settings with `tauri-plugin-store`:

```
npm install @tauri-apps/plugin-store
cargo add tauri-plugin-store  # in src-tauri/
```

The plugin stores typed JSON config files in the OS app data directory. The existing `useSettings` hook in `src/hooks/useSettings.ts` can be updated to call the store plugin instead of (or in addition to) IndexedDB. Workout history can stay in IndexedDB — it's large and relational, a good fit for IndexedDB or a future SQLite migration.

The `UserSettings` interface in `src/store/db.ts` maps directly to what the store plugin accepts.

### Phase 3 — Secure API Key Storage

```
npm install @tauri-apps/plugin-keyring  # or plugin-stronghold for encryption-at-rest
```

Replace the `groqApiKey` field in IndexedDB with a keychain call:

```ts
// Instead of writing groqApiKey to IndexedDB:
import { setPassword, getPassword } from '@tauri-apps/plugin-keyring'
await setPassword('komplex01', 'groq-api-key', apiKey)

// Instead of reading from IndexedDB:
const apiKey = await getPassword('komplex01', 'groq-api-key')
```

The `SettingsPage.tsx` and `groqService.ts` are the only two places that touch the API key.

---

## Mobile: Tauri vs. Current PWABuilder/TWA Approach

The current plan (`PWA_SETUP.md`) uses PWABuilder/Bubblewrap to wrap the PWA as an Android APK. Tauri 2.x has mobile support (`tauri-mobile`) that can target Android and iOS from the same codebase. This is now stable as of Tauri 2.0 (released October 2024).

**Trade-offs:**

| | Current (TWA/PWABuilder) | Tauri Mobile |
|---|---|---|
| Android APK | Yes, straightforward | Yes, requires Android SDK + NDK |
| iOS | No (PWA only, via Safari install) | Yes, requires macOS + Xcode |
| Native plugins | Very limited (Capacitor APIs only if using Capacitor) | Full plugin ecosystem (`keyring`, `notifications`, `fs`, etc.) |
| Maintenance overhead | Low (TWA is mostly a shell) | Higher (Rust, Android NDK, Xcode toolchain) |
| Portrait lock | Via manifest | Via `tauri-plugin-orientation` |
| Maturity | Stable | Stable as of Tauri 2.0, but mobile tooling is younger |

**Recommendation**: If the goal is a desktop app, use Tauri. If mobile is the primary target and desktop is secondary, Capacitor remains the more mature mobile-first option. Tauri can serve both, but the Android/iOS toolchain is heavier to maintain.

---

## Risks and Mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| WebView2 (Windows) vs. WebKit (macOS) rendering differences | Low | The app uses standard CSS and well-supported Web APIs. Three.js/WebGL works in both. Test on both platforms. |
| Tauri CSP blocks Groq API calls | Low | Add `connect-src https://api.groq.com` to `tauri.conf.json` CSP config. One line. |
| Rust toolchain complexity | Medium | Only needed for Tauri-side features (native plugins). Frontend developers don't need to touch Rust beyond initial setup. |
| React Router v7 path routing in file:// context | Low | Tauri serves from localhost by default (`tauri://localhost`), not `file://`, so path-based routing works without changes. |
| Existing IndexedDB data lost on migration | None | IndexedDB persists inside the Tauri WebView's data directory. Existing data is retained with zero migration effort. |
| Portrait-lock for mobile Tauri | Low | Use `tauri-plugin-orientation` or set orientation in `tauri.conf.json` mobile section. |

---

## Effort Estimate

| Phase | Scope | Complexity |
|---|---|---|
| Phase 1: Desktop shell running | Scaffold Tauri, remove PWA plugin, get app running in native window | Low — well-documented, mostly config |
| Phase 2: Native config storage | Swap `useSettings` hook to use `tauri-plugin-store` | Low — the hook is already well-isolated |
| Phase 3: Secure keychain for API key | Replace IndexedDB API key with `tauri-plugin-keyring` | Low — only two files touch the key |
| Phase 4: Native extras (notifications, tray, file export) | Each is an independent plugin | Low per feature, optional |
| Mobile target (Android) | Android SDK + NDK + `tauri-mobile` setup | Medium — toolchain setup is the main friction |

---

## Verdict

Tauri migration is **very feasible**. The React + Vite frontend requires minimal-to-no modification. The main work is:

1. Adding the Rust scaffold (`npx tauri init`)
2. Removing the now-redundant PWA/Workbox configuration
3. Optionally migrating settings to `tauri-plugin-store` and the API key to the OS keychain

The result is a proper OS-native desktop app with config in the right OS locations, a secure API key store, a smaller binary than Electron, and a path to native notifications and file dialogs — all of which directly address the "better app configuration" goal.
