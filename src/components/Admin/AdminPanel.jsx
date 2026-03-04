import { useState } from 'react';
import Dashboard from './Dashboard';
import RoomManager from './RoomManager';
import PricingSettings from './PricingSettings';
import BillingHistory from './BillingHistory';
import GeneralSettings from './GeneralSettings';
import './AdminPanel.css';

const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg> },
    { id: 'rooms', label: 'จัดการห้อง', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
    { id: 'pricing', label: 'ตั้งราคา', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg> },
    { id: 'history', label: 'ประวัติบิล', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> },
    { id: 'settings', label: 'ตั้งค่า', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></svg> },
];

export default function AdminPanel({ onBackToBilling }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    function renderContent() {
        switch (activeTab) {
            case 'dashboard': return <Dashboard />;
            case 'rooms': return <RoomManager />;
            case 'pricing': return <PricingSettings />;
            case 'history': return <BillingHistory />;
            case 'settings': return <GeneralSettings />;
            default: return <Dashboard />;
        }
    }

    function handleTabClick(tabId) {
        setActiveTab(tabId);
        setIsSidebarOpen(false); // Close sidebar on mobile after selection
    }

    return (
        <div className="admin-panel">
            {/* Mobile Overlay Backdrop */}
            {isSidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            {/* Sidebar */}
            <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-brand">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    <span>Admin Panel</span>
                </div>

                <nav className="sidebar-nav">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            className={`sidebar-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => handleTabClick(tab.id)}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="sidebar-btn back-btn" onClick={onBackToBilling}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                        <span>กลับหน้าคิดบิล</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-content">
                {/* Mobile Header with Hamburger Toggle */}
                <div className="admin-mobile-header">
                    <button className="mobile-toggle-btn" onClick={() => setIsSidebarOpen(true)}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                    </button>
                    <span className="mobile-header-title">
                        {TABS.find(t => t.id === activeTab)?.label || 'Admin Panel'}
                    </span>
                </div>

                {renderContent()}
            </main>
        </div>
    );
}
