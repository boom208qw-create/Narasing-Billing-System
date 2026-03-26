import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './LoginScreen.css';

// Use localhost for dev (backend running locally), production URL for deploy
// const API_BASE = 'https://narasing-billing-backend.onrender.com/api';
const API_BASE = 'http://localhost:5000/api'; // for local dev

export default function LoginScreen() {
    const { login } = useAuth();
    const [tab, setTab] = useState('login'); // 'login' | 'register'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);
        try {
            const endpoint = tab === 'login' ? '/auth/login' : '/auth/register';
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาด');

            if (data.token) {
                login(data.token, data.user);
            } else {
                setSuccessMsg(data.message || 'ลงทะเบียนสำเร็จ กรุณารอผู้ดูแลระบบอนุมัติบัญชี');
                setTab('login');
                setUsername('');
                setPassword('');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-overlay">
            <div className="login-card">
                {/* Logo / Brand */}
                <div className="login-brand">
                    <div className="login-logo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                    </div>
                    <h1 className="login-title">นรสิงห์</h1>
                    <p className="login-subtitle">Narasing Billing System</p>
                </div>

                {/* Tab Switcher */}
                <div className="login-tabs">
                    <button
                        className={`login-tab ${tab === 'login' ? 'active' : ''}`}
                        onClick={() => { setTab('login'); setError(''); setSuccessMsg(''); }}
                        type="button"
                    >
                        เข้าสู่ระบบ
                    </button>
                    <button
                        className={`login-tab ${tab === 'register' ? 'active' : ''}`}
                        onClick={() => { setTab('register'); setError(''); setSuccessMsg(''); }}
                        type="button"
                    >
                        สมัครสมาชิก
                    </button>
                </div>

                {/* Form */}
                <form className="login-form" onSubmit={handleSubmit}>
                    {successMsg && <div className="login-success" style={{color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem', textAlign: 'center'}}>{successMsg}</div>}
                    {error && <div className="login-error">{error}</div>}

                    <div className="login-field">
                        <label htmlFor="login-username">ชื่อผู้ใช้</label>
                        <input
                            id="login-username"
                            type="text"
                            placeholder="กรอกชื่อผู้ใช้"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                            autoFocus
                            autoComplete="username"
                        />
                    </div>

                    <div className="login-field">
                        <label htmlFor="login-password">รหัสผ่าน</label>
                        <input
                            id="login-password"
                            type="password"
                            placeholder={tab === 'register' ? 'อย่างน้อย 6 ตัวอักษร' : 'กรอกรหัสผ่าน'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                        />
                    </div>

                    <button className="login-submit" type="submit" disabled={loading}>
                        {loading ? (
                            <span className="login-spinner" />
                        ) : (
                            tab === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'
                        )}
                    </button>
                </form>

                <p className="login-footer">© 2026 Narasing Billing System</p>
            </div>
        </div>
    );
}
