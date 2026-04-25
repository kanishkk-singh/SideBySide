import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1C1C28',
            color: '#F2F0FA',
            border: '0.5px solid rgba(255,255,255,0.1)',
            fontFamily: 'Outfit, sans-serif',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#22D96B', secondary: '#1C1C28' } },
          error:   { iconTheme: { primary: '#FF4040', secondary: '#1C1C28' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
