// src/App.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  UpdateAvailableModal,
  UpdateDownloadingModal,
  UpdateReadyModal,
  UpdateErrorModal,
} from "./components/UpdateModals"; // Adjust path
import "./App.css"; // Your main app styles

function App() {
  const [updateStatus, setUpdateStatus] = useState("Idle.");
  const [updateAvailableInfo, setUpdateAvailableInfo] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  // --- Event Handlers from Electron Main ---

  const handleUpdateAvailable = useCallback((info) => {
    console.log("REACT: Update Available", info);
    setUpdateAvailableInfo(info);
    setDownloadProgress(null); // Reset progress
    setUpdateDownloaded(false);
    setUpdateError(null);
  }, []);

  const handleUpdateDownloading = useCallback((progress) => {
    console.log("REACT: Update Downloading", progress);
    setUpdateAvailableInfo(null); // Hide available modal
    setDownloadProgress(progress);
    setUpdateDownloaded(false);
    setUpdateError(null);
  }, []);

  const handleUpdateDownloaded = useCallback(() => {
    console.log("REACT: Update Downloaded");
    setUpdateAvailableInfo(null);
    setDownloadProgress(null);
    setUpdateDownloaded(true);
    setUpdateError(null);
  }, []);

  const handleUpdateError = useCallback((errMessage) => {
    console.error("REACT: Update Error", errMessage);
    setUpdateAvailableInfo(null);
    setDownloadProgress(null);
    setUpdateDownloaded(false);
    setUpdateError(errMessage || "Unknown error occurred.");
  }, []);

  const handleUpdateNotAvailable = useCallback(() => {
    console.log("REACT: Update Not Available");
    setUpdateStatus("App is up to date.");
    // Optional: Close any open modals if desired
    setUpdateAvailableInfo(null);
    setDownloadProgress(null);
    setUpdateDownloaded(false);
    setUpdateError(null);
  }, []);

  const handleGeneralStatus = useCallback((message) => {
    console.log("REACT: Status Update", message);
    setUpdateStatus(message);
  }, []);

  // --- Setup Listeners on Mount ---
  useEffect(() => {
    console.log("Setting up listeners");
    const api = window.electronAPI; // Access API exposed by preload

    api.onUpdateAvailable(handleUpdateAvailable);
    api.onUpdateDownloading(handleUpdateDownloading);
    api.onUpdateDownloaded(handleUpdateDownloaded);
    api.onUpdateError(handleUpdateError);
    api.onUpdateNotAvailable(handleUpdateNotAvailable);
    api.onUpdateStatus(handleGeneralStatus);

    // --- Cleanup Listeners on Unmount ---
    return () => {
      console.log("Cleaning up listeners");
      api.removeAllListeners("update-available");
      api.removeAllListeners("update-download-progress");
      api.removeAllListeners("update-downloaded");
      api.removeAllListeners("update-error");
      api.removeAllListeners("update-not-available");
      api.removeAllListeners("update-status");
    };
  }, [
    handleUpdateAvailable,
    handleUpdateDownloading,
    handleUpdateDownloaded,
    handleUpdateError,
    handleUpdateNotAvailable,
    handleGeneralStatus,
  ]); // Add handlers to dependency array

  // --- Actions to Trigger Electron Main ---

  const checkForUpdates = () => {
    setUpdateStatus("Checking for updates...");
    setUpdateError(null); // Clear previous error
    window.electronAPI.checkForUpdate();
  };

  const downloadUpdate = () => {
    setUpdateAvailableInfo(null); // Close "available" modal
    setUpdateStatus("Download requested...");
    window.electronAPI.downloadUpdate();
  };

  const installUpdate = () => {
    setUpdateDownloaded(false); // Close "ready" modal
    setUpdateStatus("Install requested...");
    window.electronAPI.installUpdate();
  };

  const closeErrorModal = () => {
    setUpdateError(null);
  };

  return (
    <div className="App">
      <h1>My Electron React App</h1>
      <p>Welcome!</p>
      <button onClick={checkForUpdates}>Check for Updates</button>
      <p>Status: {updateStatus}</p>

      {/* Render Modals based on state */}
      {updateAvailableInfo && (
        <UpdateAvailableModal
          versionInfo={updateAvailableInfo}
          onDownload={downloadUpdate}
        />
      )}
      {downloadProgress && (
        <UpdateDownloadingModal progress={downloadProgress} />
      )}
      {updateDownloaded && <UpdateReadyModal onInstall={installUpdate} />}
      {updateError && (
        <UpdateErrorModal error={updateError} onClose={closeErrorModal} />
      )}

      {/* Your regular React app content goes here */}
      {/* ... */}
    </div>
  );
}

export default App;
