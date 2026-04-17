import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// It is highly recommended to wrap your App in StrictMode 
// during development to highlight potential problems.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);