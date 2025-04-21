// src/components/UpdateModals.jsx
import React, { useState, useEffect } from "react";
import "./UpdateModals.css"; // Create CSS for styling

// Helper to format bytes
function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export const UpdateAvailableModal = ({ versionInfo, onDownload }) => {
  if (!versionInfo) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Update Available!</h2>
        <p>Version {versionInfo.version} is available.</p>
        {/* Release notes can be complex, often HTML. Simple display: */}
        {versionInfo.releaseNotes && (
          <div className="release-notes">
            <strong>Release Notes:</strong>
            <pre>{versionInfo.releaseNotes}</pre>
          </div>
        )}
        <p>Download now?</p>
        <button onClick={onDownload}>Download Now</button>
        {/* Add a close/later button if needed */}
      </div>
    </div>
  );
};

export const UpdateDownloadingModal = ({ progress }) => {
  if (!progress) return null;
  const percent = progress.percent ? Math.round(progress.percent) : 0;
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Downloading Update...</h2>
        <progress value={percent} max="100"></progress>
        <p>{percent}%</p>
        {progress.bytesPerSecond && (
          <p>Speed: {formatBytes(progress.bytesPerSecond)}/s</p>
        )}
        {progress.transferred && progress.total && (
          <p>
            Downloaded: {formatBytes(progress.transferred)} /{" "}
            {formatBytes(progress.total)}
          </p>
        )}
      </div>
    </div>
  );
};

export const UpdateReadyModal = ({ onInstall }) => {
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Update Downloaded</h2>
        <p>Ready to install. Restart the application to apply changes.</p>
        <button onClick={onInstall}>Restart and Install</button>
      </div>
    </div>
  );
};

export const UpdateErrorModal = ({ error, onClose }) => {
  if (!error) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Update Error</h2>
        <p>An error occurred during the update process:</p>
        <p className="error-message">{error}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};
