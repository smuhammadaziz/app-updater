// electron/preload.js
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // --- Actions (Renderer -> Main) ---
  checkForUpdate: () => ipcRenderer.invoke("check-for-update"),
  downloadUpdate: () => ipcRenderer.invoke("download-update"),
  installUpdate: () => ipcRenderer.invoke("install-update"),

  // --- Listeners (Main -> Renderer) ---
  onUpdateAvailable: (callback) =>
    ipcRenderer.on("update-available", (_event, value) => callback(value)),
  onUpdateNotAvailable: (callback) =>
    ipcRenderer.on("update-not-available", (_event, value) => callback(value)),
  onUpdateDownloading: (callback) =>
    ipcRenderer.on("update-download-progress", (_event, value) =>
      callback(value)
    ),
  onUpdateDownloaded: (callback) =>
    ipcRenderer.on("update-downloaded", (_event, value) => callback(value)),
  onUpdateError: (callback) =>
    ipcRenderer.on("update-error", (_event, value) => callback(value)),
  onUpdateStatus: (callback) =>
    ipcRenderer.on("update-status", (_event, value) => callback(value)), // Added for general status

  // --- Cleanup ---
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
});

console.log("Preload script loaded.");
