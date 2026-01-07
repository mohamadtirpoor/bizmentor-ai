import React from 'react';
import ReactDOM from 'react-dom/client';
import Clarity from '@microsoft/clarity';
import App from './App';
import './index.css';

// Initialize Microsoft Clarity
Clarity.init('ux87vyobxr');

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