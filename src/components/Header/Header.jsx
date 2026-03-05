import { formatThaiDate } from '../../utils/calculations';
import { getSettings } from '../../data/mockData';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import './Header.css';

export default function Header() {
    const settings = getSettings();

    return (
        <header className="header" id="mainHeader">
            <div className="header-inner">
                <div className="header-brand">
                    <div className="header-icon">
                        <div className="header-icon-anim" />
                    </div>
                    <div className="header-text">
                        <h1 className="header-title">ระบบคิดบิลค่าน้ำค่าไฟ</h1>
                        <p className="header-subtitle">{settings.headerSubtitle}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <ThemeToggle />
                    <div className="header-date">
                        <div className="header-date-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                        </div>
                        <span>{formatThaiDate()}</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
