import { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './AccountManager.css';

export default function AccountManager() {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ show: false, message: '', intent: '', action: null });
    const [selectedUser, setSelectedUser] = useState(null);

    // Form states
    const [formData, setFormData] = useState({ username: '', password: '', role: 'user' });
    const [newPassword, setNewPassword] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await userAPI.getAll();
            setUsers(data);
            setError(null);
        } catch (err) {
            setError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้ (กรุณาตรวจสอบว่าคุณเป็น Admin)');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (msg) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitLoading(true);
            setError(null);
            await userAPI.create(formData);
            showMessage('สร้างผู้ใช้งานสำเร็จ');
            setShowCreateModal(false);
            setFormData({ username: '', password: '', role: 'user' });
            fetchUsers();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitLoading(true);
            setError(null);
            await userAPI.changePassword(selectedUser._id, newPassword);
            showMessage(`เปลี่ยนรหัสผ่านของ ${selectedUser.username} สำเร็จ`);
            setShowPasswordModal(false);
            setNewPassword('');
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitLoading(false);
        }
    };

    const toggleStatus = async (targetUser) => {
        try {
            const newStatus = targetUser.status === 'active' ? 'suspended' : 'active';
            await userAPI.updateRoleStatus(targetUser._id, { status: newStatus });
            showMessage(`เปลี่ยนสถานะของ ${targetUser.username} เป็น ${newStatus} สำเร็จ`);
            fetchUsers();
        } catch (err) {
            alert(err.message);
        }
    };

    const toggleRole = (targetUser) => {
        const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
        setConfirmModal({
            show: true,
            title: 'เปลี่ยนระดับสิทธิ์',
            message: `แน่ใจหรือไม่ที่จะเปลี่ยนสิทธิ์ของ ${targetUser.username} เป็น ${newRole}?`,
            intent: 'warning',
            action: async () => {
                await userAPI.updateRoleStatus(targetUser._id, { role: newRole });
                showMessage(`เปลี่ยนสิทธิ์หลักของ ${targetUser.username} สำเร็จ`);
                fetchUsers();
            }
        });
    };

    const handleDelete = (targetId, username) => {
        setConfirmModal({
            show: true,
            title: 'ลบบัญชีผู้ใช้งาน',
            message: `⚠️ คำเตือน: คุณต้องการลบบัญชี ${username} หรือไม่?\nการกระทำนี้ไม่สามารถย้อนกลับได้`,
            intent: 'danger',
            action: async () => {
                await userAPI.delete(targetId);
                showMessage(`ลบบัญชี ${username} สำเร็จ`);
                fetchUsers();
            }
        });
    };

    const handleConfirmAction = async () => {
        if (!confirmModal.action) return;
        try {
            setSubmitLoading(true);
            await confirmModal.action();
            setConfirmModal({ show: false, message: '', intent: '', action: null });
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitLoading(false);
        }
    };

    const openPasswordModal = (u) => {
        setSelectedUser(u);
        setNewPassword('');
        setShowPasswordModal(true);
    };

    if (loading) return <div className="admin-loading">กำลังโหลดข้อมูล...</div>;

    // Protection just in case (though AdminPanel should hide the tab)
    if (user?.role !== 'admin') {
        return <div className="admin-error">คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (Admin Only)</div>;
    }

    return (
        <div className="account-manager admin-card">
            <div className="account-header">
                <h2 className="admin-section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 00-3-3.87" />
                        <path d="M16 3.13a4 4 0 010 7.75" />
                    </svg>
                    จัดการบัญชีผู้ใช้งาน
                </h2>
                <button className="primary-btn" onClick={() => setShowCreateModal(true)}>
                    + เพิ่มผู้ใช้ใหม่
                </button>
            </div>

            {error && <div className="admin-error">{error}</div>}
            {successMessage && <div className="admin-success">{successMessage}</div>}

            <div className="account-table-wrapper">
                <table className="account-table">
                    <thead>
                        <tr>
                            <th>ชื่อผู้ใช้ (Username)</th>
                            <th>ระดับสิทธิ์ (Role)</th>
                            <th>สถานะ (Status)</th>
                            <th>วันที่สร้าง</th>
                            <th className="action-col">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => (
                            <tr key={u._id} className={u.status === 'suspended' ? 'suspended-row' : ''}>
                                <td className="username-cell">
                                    {u.username}
                                    {u._id === user.id && <span className="badge-you">คุณ</span>}
                                </td>
                                <td>
                                    <span className={`role-badge ${u.role}`}>
                                        {u.role === 'admin' ? 'แอดมิน' : 'ผู้เช่า/พนักงาน'}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-badge ${u.status}`}>
                                        {u.status === 'active' ? 'ปกติ' : u.status === 'pending' ? 'รออนุมัติ' : 'ถูกระงับ'}
                                    </span>
                                </td>
                                <td>{new Date(u.createdAt).toLocaleDateString('th-TH')}</td>
                                <td className="actions-cell">
                                    <div className="action-buttons">
                                        <button 
                                            className="am-action-btn key-btn" 
                                            title="เปลี่ยนรหัสผ่าน"
                                            onClick={() => openPasswordModal(u)}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
                                            <span>รหัสผ่าน</span>
                                        </button>
                                        
                                        {u._id !== user.id && (
                                            <>
                                                <button 
                                                    className="am-action-btn role-btn" 
                                                    title={u.role === 'admin' ? 'ลดสิทธิ์เป็น User' : 'ตั้งเป็น Admin'}
                                                    onClick={() => toggleRole(u)}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                                    <span>{u.role === 'admin' ? 'ลดสิทธิ์' : 'สิทธิ์ Admin'}</span>
                                                </button>
                                                <button 
                                                    className={`am-action-btn ${u.status === 'active' ? 'suspend-btn' : 'active-btn'}`} 
                                                    title={u.status === 'active' ? 'ระงับบัญชี' : 'เปิดใช้งานบัญชี'}
                                                    onClick={() => toggleStatus(u)}
                                                >
                                                    {u.status === 'active' ? 
                                                        <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg><span>ระงับ</span></> :
                                                        <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg><span>เปิดใช้</span></>
                                                    }
                                                </button>
                                                <button 
                                                    className="am-action-btn delete-btn" 
                                                    title="ลบบัญชี"
                                                    onClick={() => handleDelete(u._id, u.username)}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                                                    <span>ลบ</span>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && !loading && (
                            <tr><td colSpan="5" className="empty-state">ไม่พบผู้ใช้งาน</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="account-modal-overlay">
                    <div className="account-modal">
                        <h3>เพิ่มผู้ใช้งานใหม่</h3>
                        <form onSubmit={handleCreateSubmit}>
                            <div className="form-group">
                                <label>ชื่อผู้ใช้ (Username)</label>
                                <input 
                                    type="text" 
                                    required 
                                    className="admin-input" 
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>รหัสผ่าน</label>
                                <input 
                                    type="text" 
                                    required 
                                    minLength="6"
                                    className="admin-input" 
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>ระดับสิทธิ์ (Role)</label>
                                <select 
                                    className="admin-input"
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                >
                                    <option value="user">ผู้ใช้งานทั่วไป (User)</option>
                                    <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowCreateModal(false)}>ยกเลิก</button>
                                <button type="submit" className="save-btn" disabled={submitLoading}>
                                    {submitLoading ? 'กำลังบันทึก...' : 'สร้างบัญชี'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="account-modal-overlay">
                    <div className="account-modal">
                        <h3>เปลี่ยนรหัสผ่านให้ {selectedUser?.username}</h3>
                        <form onSubmit={handlePasswordSubmit}>
                            <div className="form-group">
                                <label>รหัสผ่านใหม่</label>
                                <input 
                                    type="text" 
                                    required 
                                    minLength="6"
                                    className="admin-input" 
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="รหัสผ่านอย่างน้อย 6 ตัวอักษร"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowPasswordModal(false)}>ยกเลิก</button>
                                <button type="submit" className="save-btn" disabled={submitLoading}>
                                    {submitLoading ? 'กำลังบันทึก...' : 'เปลี่ยนรหัสผ่าน'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmModal.show && (
                <div className="account-modal-overlay">
                    <div className="account-modal confirm-modal">
                        <h3>{confirmModal.title}</h3>
                        <p className="confirm-message">{confirmModal.message}</p>
                        <div className="modal-actions">
                            <button 
                                className="cancel-btn" 
                                onClick={() => setConfirmModal({ show: false, message: '', intent: '', action: null })}
                                disabled={submitLoading}
                            >
                                ยกเลิก
                            </button>
                            <button 
                                className={`save-btn ${confirmModal.intent === 'danger' ? 'danger-btn' : ''} ${confirmModal.intent === 'warning' ? 'warning-btn' : ''}`}
                                onClick={handleConfirmAction}
                                disabled={submitLoading}
                            >
                                {submitLoading ? 'กำลังดำเนินการ...' : 'ยืนยัน'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
