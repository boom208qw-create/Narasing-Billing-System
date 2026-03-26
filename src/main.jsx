import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './contexts/ThemeContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { AuthProvider } from './contexts/AuthContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthProvider>
            <ThemeProvider>
                <NotificationProvider>
                    <App />
                </NotificationProvider>
            </ThemeProvider>
        </AuthProvider>
    </StrictMode>,
)

