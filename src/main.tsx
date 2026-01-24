import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// GLOBAL ERROR TRAP
window.onerror = function (message, source, lineno, colno, error) {
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '0';
    errorDiv.style.left = '0';
    errorDiv.style.width = '100%';
    errorDiv.style.backgroundColor = '#fee2e2';
    errorDiv.style.color = '#991b1b';
    errorDiv.style.padding = '20px';
    errorDiv.style.zIndex = '9999';
    errorDiv.style.fontFamily = 'monospace';
    errorDiv.style.whiteSpace = 'pre-wrap';
    errorDiv.textContent = `CRITICIAL RUNTIME ERROR:\n${message}\nat ${source}:${lineno}:${colno}\n\n${error?.stack || ''}`;
    document.body.appendChild(errorDiv);
    console.error("Global Error Caught:", error);
};

console.log('Build: Starting app mount...');
try {
    const root = document.getElementById("root");
    console.log('Build: Root element found:', !!root);
    if (!root) throw new Error("Root element missing");

    createRoot(root).render(<App />);
    console.log('Build: App mounted successfully');
    // createRoot(root).render(<div style={{ padding: 20, fontSize: 24, color: 'blue' }}>Sanity Check: Main.tsx Running</div>);
    // console.log('Build: Sanity Check mounted');
} catch (e) {
    console.error('Build: Fatal Mount Error:', e);
}
