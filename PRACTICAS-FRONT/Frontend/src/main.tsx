import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'react-datepicker/dist/react-datepicker.css';

import { AuthProvider } from './context/AuthProvider';

// Config global de axios (evita URLs hardcodeadas)
import axios from 'axios';
axios.defaults.withCredentials = true;
axios.defaults.baseURL =
  (import.meta as any)?.env?.VITE_API_URL ?? 'http://localhost:3000';

// Si aún tienes GoogleOAuthProvider y no lo usas, puedes quitarlo sin problema.
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);