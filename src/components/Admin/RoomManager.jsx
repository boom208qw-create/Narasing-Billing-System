import { useState, useEffect } from 'react';
import { getAllRooms, addRoom, updateRoom, deleteRoom, getDefaultRates } from '../../data/mockData';
import './RoomManager.css';

export default function RoomManager() {
    const [rooms, setRooms] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingRoom, setEditingRoom] = useState(null);
    const [formData, setFormData] = useState({
        roomNumber: '', tenantName: '', lastWaterMeter: 0,
        lastElectricMeter: 0, waterRate: 18, electricRate: 8,
        roomRent: 0, isOccupied: true
    });
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    function loadData() {
        setRooms(getAllRooms());
    }

    function openAddModal() {
        const rates = getDefaultRates();
        setEditingRoom(null);
        setFormData({
            roomNumber: '', tenantName: '', lastWaterMeter: 0,
            lastElectricMeter: 0, waterRate: rates.waterRate, electricRate: rates.electricRate,
            roomRent: 0, isOccupied: true
        });
        setError('');
        setShowModal(true);
    }

    function openEditModal(room) {
        setEditingRoom(room.roomNumber);
        setFormData({ ...room });
        setError('');
        setShowModal(true);
    }

    function handleSubmit(e) {
        e.preventDefault();
        if (!formData.roomNumber.trim()) {
            setError('กรุณากรอกเลขห้อง');
            return;
        }

        let result;
        if (editingRoom) {
            result = updateRoom(editingRoom, formData);
        } else {
            result = addRoom(formData);
        }

        if (result.success) {
            setShowModal(false);
            loadData();
        } else {
            setError(result.error);
        }
    }

    function handleDelete(roomNumber) {
        if (window.confirm(`ยืนยันลบห้อง ${roomNumber}?`)) {
            const result = deleteRoom(roomNumber);
            if (result.success) loadData();
        }
    }

    function handleChange(field, value) {
        setFormData(prev => ({ ...prev, [field]: value }));
    }

    return (
        <div className="room-manager" id="roomManagerPage">
            <div className="page-header">
                <h2 className="admin-page-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                    จัดการห้อง
                </h2>
                <button className="add-btn" onClick={openAddModal}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    เพิ่มห้องใหม่
                </button>
            </div>

            <div className="glass-card room-table-card">
                <div className="table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>เลขห้อง</th>
                                <th>ผู้เช่า</th>
                                <th>สถานะ</th>
                                <th className="align-right">มิเตอร์น้ำ</th>
                                <th className="align-right">มิเตอร์ไฟ</th>
                                <th className="align-right">ค่าน้ำ/หน่วย</th>
                                <th className="align-right">ค่าไฟ/หน่วย</th>
                                <th className="align-right">ค่าเช่า</th>
                                <th className="actions-col">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map(room => (
                                <tr key={room.roomNumber}>
                                    <td className="room-cell">{room.roomNumber}</td>
                                    <td>{room.tenantName || '-'}</td>
                                    <td>
                                        <span className={`status-badge ${room.isOccupied ? 'occupied' : 'vacant'}`}>
                                            {room.isOccupied ? 'มีคนเช่า' : 'ว่าง'}
                                        </span>
                                    </td>
                                    <td className="align-right">{room.lastWaterMeter.toLocaleString()}</td>
                                    <td className="align-right">{room.lastElectricMeter.toLocaleString()}</td>
                                    <td className="align-right">{room.waterRate}</td>
                                    <td className="align-right">{room.electricRate}</td>
                                    <td className="align-right">{room.roomRent.toLocaleString()}</td>
                                    <td className="actions-col">
                                        <button className="icon-btn edit-icon" onClick={() => openEditModal(room)} title="แก้ไข">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                        </button>
                                        <button className="icon-btn delete-icon" onClick={() => handleDelete(room.roomNumber)} title="ลบ">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Room Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
                        <h3 className="modal-title">{editingRoom ? `แก้ไขห้อง ${editingRoom}` : 'เพิ่มห้องใหม่'}</h3>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>เลขห้อง</label>
                                    <input type="text" className="input" value={formData.roomNumber}
                                        onChange={e => handleChange('roomNumber', e.target.value)} disabled={!!editingRoom} />
                                </div>
                                <div className="form-group">
                                    <label>ชื่อผู้เช่า</label>
                                    <input type="text" className="input" value={formData.tenantName}
                                        onChange={e => handleChange('tenantName', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>เลขมิเตอร์น้ำ</label>
                                    <input type="number" className="input" value={formData.lastWaterMeter}
                                        onChange={e => handleChange('lastWaterMeter', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>เลขมิเตอร์ไฟ</label>
                                    <input type="number" className="input" value={formData.lastElectricMeter}
                                        onChange={e => handleChange('lastElectricMeter', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>ค่าน้ำ/หน่วย (บาท)</label>
                                    <input type="number" className="input" value={formData.waterRate}
                                        onChange={e => handleChange('waterRate', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>ค่าไฟ/หน่วย (บาท)</label>
                                    <input type="number" className="input" value={formData.electricRate}
                                        onChange={e => handleChange('electricRate', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>ค่าเช่าห้อง (บาท)</label>
                                    <input type="number" className="input" value={formData.roomRent}
                                        onChange={e => handleChange('roomRent', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>สถานะ</label>
                                    <select className="input" value={formData.isOccupied ? 'true' : 'false'}
                                        onChange={e => handleChange('isOccupied', e.target.value === 'true')}>
                                        <option value="true">มีคนเช่า</option>
                                        <option value="false">ว่าง</option>
                                    </select>
                                </div>
                            </div>

                            {error && <p className="form-error">{error}</p>}

                            <div className="modal-actions">
                                <button type="submit" className="submit-btn">
                                    {editingRoom ? 'บันทึกการแก้ไข' : 'เพิ่มห้อง'}
                                </button>
                                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                                    ยกเลิก
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
