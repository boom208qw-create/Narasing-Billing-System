import { useState, useEffect } from 'react';
import Header from './components/Header/Header';
import BulkBilling from './components/BulkBilling/BulkBilling';
import AdminPanel from './components/Admin/AdminPanel';
import LoginScreen from './components/LoginScreen/LoginScreen';
import { useAuth } from './contexts/AuthContext';
import { settingsAPI } from './services/api';
import './App.css';

function App() {
    const { isAuthenticated, user, logout } = useAuth();
    const [currentPage, setCurrentPage] = useState('billing'); // 'billing' | 'admin'
    const [footerText, setFooterText] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            settingsAPI.get()
                .then(data => {
                    setFooterText(data.footerText || '');
                })
                .catch(err => console.error('Failed to load footer text', err));
        }
    }, [isAuthenticated]);

    // ===== Auth Gate =====
    if (!isAuthenticated) {
        return <LoginScreen />;
    }

    // ===== Admin Page =====
    if (currentPage === 'admin') {
        return <AdminPanel onBackToBilling={() => setCurrentPage('billing')} />;
    }

    // ===== Billing Page =====
    return (
        <div className="app" id="billingApp">
            <Header />

            {/* Admin Button + User Info */}
            <div className="admin-toggle-bar no-print">
                <button className="admin-toggle-btn" onClick={() => setCurrentPage('admin')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                    </svg>
                    ระบบหลังบ้าน
                </button>

                {/* User info + Logout */}
                <div className="user-info-bar">
                    <span className="user-info-name">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        {user?.username}
                    </span>
                    <button className="logout-btn" onClick={logout} title="ออกจากระบบ">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        ออกจากระบบ
                    </button>
                </div>
            </div>

            <main className="app-main">
                <BulkBilling />
            </main>

            {/* Footer */}
            <footer className="app-footer no-print">
                <p>{footerText}</p>
            </footer>
        </div>
    );
}

export default App;

