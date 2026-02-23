
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("Aethelgard Codex: Initiating Ritual of Mounting...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Critical Failure: Could not find root element. The scroll has no surface.");
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("Aethelgard Codex: Ritual of Mounting Successful.");
} catch (error) {
  console.error("Critical Failure: The Architect's vision was obscured during mount.", error);
}
