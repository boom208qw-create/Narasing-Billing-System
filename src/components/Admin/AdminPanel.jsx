import { useState } from 'react';
import Dashboard from './Dashboard';
import RoomManager from './RoomManager';
import PricingSettings from './PricingSettings';
import BillingHistory from './BillingHistory';
import './AdminPanel.css';

const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg> },
    { id: 'rooms', label: 'จัดการห้อง', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
    { id: 'pricing', label: 'ตั้งราคา', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg> },
    { id: 'history', label: 'ประวัติบิล', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> },
];

export default function AdminPanel({ onBackToBilling }) {
    const [activeTab, setActiveTab] = useState('dashboard');

    function renderContent() {
        switch (activeTab) {
            case 'dashboard': return <Dashboard />;
            case 'rooms': return <RoomManager />;
            case 'pricing': return <PricingSettings />;
            case 'history': return <BillingHistory />;
            default: return <Dashboard />;
        }
    }

    return (
        <div className="admin-panel">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-brand">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                    <span>Admin Panel</span>
                </div>

                <nav className="sidebar-nav">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            className={`sidebar-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
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
                {renderContent()}
            </main>
        </div>
    );
}
