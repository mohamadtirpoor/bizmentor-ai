import React from 'react';
import ReactDOM from 'react-dom/client';
import Clarity from '@microsoft/clarity';
import Tracker from '@openreplay/tracker';
import App from './App';
import './index.css';

// Initialize Microsoft Clarity
Clarity.init('ux87vyobxr');

// Initialize OpenReplay Tracker
const tracker = new Tracker({
  projectKey: "ABMWUNTeeNqb0iAELqAN",
  ingestPoint: "https://openreplay.doctordaraei.com/ingest",
  __DISABLE_SECURE_MODE: false,
});
tracker.start();  

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);