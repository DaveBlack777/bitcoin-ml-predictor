import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { startBackgroundWorker, cleanup } from './services/backgroundWorker'

// Inicjalizacja aplikacji w bloku async
async function initApp() {
  try {
    // Uruchom background worker
    await startBackgroundWorker();
    
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
  } catch (error) {
    console.error('Błąd podczas inicjalizacji aplikacji:', error);
  }
}

// Dodaj obsługę zamykania
window.addEventListener('beforeunload', () => {
  cleanup();
});

initApp();