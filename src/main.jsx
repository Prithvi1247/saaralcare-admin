import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import AdminDashboard from './AdminDashboard.jsx'
import AdminPage from './AdminPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/admin-page" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
