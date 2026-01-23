import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('Build: Starting app mount...');
try {
    const root = document.getElementById("root");
    console.log('Build: Root element found:', !!root);
    if (!root) throw new Error("Root element missing");

    createRoot(root).render(<App />);
    console.log('Build: App mounted successfully');
    // createRoot(root).render(<h1>Sanity Check: Hello World</h1>);
    // console.log('Build: Sanity Check mounted');
} catch (e) {
    console.error('Build: Fatal Mount Error:', e);
}
