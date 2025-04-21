// electron/main.js
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");

// Configure logging
autoUpdater.logger = require("electron-log");
autoUpdater.logger.transports.file.level = "info";
autoUpdater.logger = console;

let mainWindow;
const isDev = process.env.NODE_ENV === "development"; // Check if in development mode

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900, // Adjusted size for potential dev tools
    height: 680,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // Correct path
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load React App URL
  if (isDev) {
    // Development: Load from Vite dev server
    mainWindow.loadURL("http://localhost:5173"); // Default Vite port, adjust if different
    mainWindow.webContents.openDevTools(); // Open DevTools automatically
  } else {
    // Production: Load the built React app's index.html
    mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html")); // Adjust 'dist' if your build output folder is different
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// --- Auto Updater Setup & Event Listeners (SAME AS PREVIOUS EXAMPLE) ---

autoUpdater.autoDownload = false; // Control via custom UI

autoUpdater.on("checking-for-update", () => {
  console.log("Checking for update...");
  mainWindow?.webContents.send("update-status", "Checking...");
});

autoUpdater.on("update-available", (info) => {
  console.log("Update available.", info);
  mainWindow?.webContents.send("update-available", info);
});

autoUpdater.on("update-not-available", (info) => {
  console.log("Update not available.", info);
  mainWindow?.webContents.send("update-status", "Up to date.");
  mainWindow?.webContents.send("update-not-available", info); // Also send specific event
});

autoUpdater.on("error", (err) => {
  console.error("Error in auto-updater.", err);
  mainWindow?.webContents.send("update-error", err.message);
});

autoUpdater.on("download-progress", (progressObj) => {
  console.log(
    `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}%`
  );
  mainWindow?.webContents.send("update-download-progress", progressObj);
});

autoUpdater.on("update-downloaded", (info) => {
  console.log("Update downloaded.", info);
  mainWindow?.webContents.send("update-downloaded", info);
});

// --- IPC Handlers (SAME AS PREVIOUS EXAMPLE) ---

ipcMain.handle("check-for-update", () => {
  console.log("Renderer requested update check.");
  if (!isDev) {
    // Generally, don't auto-update in dev mode
    autoUpdater.checkForUpdates();
  } else {
    console.log("Update check skipped in development mode.");
    // Optionally send a message back indicating dev mode
    mainWindow?.webContents.send(
      "update-status",
      "Update check skipped in dev mode."
    );
  }
});

ipcMain.handle("download-update", () => {
  console.log("Renderer requested update download.");
  if (!isDev) {
    autoUpdater.downloadUpdate();
  } else {
    console.log("Update download skipped in development mode.");
  }
});

ipcMain.handle("install-update", () => {
  console.log("Renderer requested update installation.");
  if (!isDev) {
    autoUpdater.quitAndInstall(true, true);
  } else {
    console.log("Update install skipped in development mode.");
  }
});

// --- App Lifecycle ---

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // Optional: Check for updates on startup in production
  // if (!isDev) {
  //   setTimeout(() => autoUpdater.checkForUpdates(), 5000); // Delay check
  // }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Data Preservation Reminder (Store data in app.getPath('userData'))
console.log("User data path:", app.getPath("userData"));
