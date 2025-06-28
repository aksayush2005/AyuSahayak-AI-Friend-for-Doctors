import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './output.css'; // This is your generated Tailwind CSS
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
