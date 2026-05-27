// Author: Senior Frontend Engineer
// OS support: Cross-platform
// Description: Point d'entrée de l'application avec rendu React 19

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { LanguageProvider } from './useTranslation';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Impossible de trouver l'élément root");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>
);

// --- End of index.tsx ---