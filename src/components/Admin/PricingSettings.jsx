import { useState, useEffect } from 'react';
import { settingsAPI, roomAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import './PricingSettings.css';

export default function PricingSettings() {
    const [rates, setRates] = useState({ waterRate: 18, electricRate: 8, roomRent: 0 });
    const [rooms, setRooms] = useState([]);
    const { showToast, showConfirm } = useNotification();

    useEffect(() => {
        async function loadData() {
            try {
                const [ratesData, roomsData] = await Promise.all([
                    settingsAPI.getRates(),
                    roomAPI.getAll()
                ]);
                setRates(ratesData);
                setRooms(roomsData);
            } catch (error) {
                showToast('ไม่สามารถดึงข้อมูลตั้งราคาได้', 'error');
            }
        }
        loadData();
    }, []);

    async function handleSaveDefault() {
        try {
            await settingsAPI.updateRates(rates);
            showToast('บันทึกราคาเริ่มต้นแล้ว', 'success');
        } catch (error) {
            showToast(error.message || 'เกิดข้อผิดพลาดในการบันทึกราคาเริ่มต้น', 'error');
        }
    }

    function handleApplyAll() {
        showConfirm('ยืนยัน: ปรับราคาน้ำและไฟทุกห้องตามค่าเริ่มต้นนี้?', async () => {
            try {
                const currentRooms = await settingsAPI.applyRatesToAllRooms(rates);
                setRooms(currentRooms);
                showToast('ปรับราคาทุกห้องแล้ว', 'success');
            } catch (error) {
                showToast(error.message || 'เกิดข้อผิดพลาดในการปรับราคา', 'error');
            }
        });
    }

    async function handleRoomRateChange(roomNumber, field, value) {
        try {
            const updates = { [field]: value === '' ? '' : Number(value) };
            await roomAPI.update(roomNumber, updates);
            const data = await roomAPI.getAll();
            setRooms(data);
        } catch (error) {
            showToast(error.message || 'เกิดข้อผิดพลาดในการปรับราคาห้อง', 'error');
        }
    }

    return (
        <div className="pricing-settings" id="pricingSettingsPage">
            <h2 className="admin-page-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
                ตั้งราคาน้ำ / ไฟ / ค่าเช่า
            </h2>

            {/* Default Rates */}
            <div className="glass-card pricing-section">
                <h3 className="section-subtitle">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
                    ราคาเริ่มต้น (ใช้กับห้องใหม่)
                </h3>
                <div className="default-rates-row">
                    <div className="rate-input-group">
                        <label>ค่าน้ำ (บาท/หน่วย)</label>
                        <input type="number" className="input" value={rates.waterRate}
                            onChange={e => setRates(prev => ({ ...prev, waterRate: e.target.value === '' ? '' : Number(e.target.value) }))} />
                    </div>
                    <div className="rate-input-group">
                        <label>ค่าไฟ (บาท/หน่วย)</label>
                        <input type="number" className="input" value={rates.electricRate}
                            onChange={e => setRates(prev => ({ ...prev, electricRate: e.target.value === '' ? '' : Number(e.target.value) }))} />
                    </div>
                    <div className="rate-input-group">
                        <label>ค่าเช่า (บาท)</label>
                        <input type="number" className="input" value={rates.roomRent}
                            onChange={e => setRates(prev => ({ ...prev, roomRent: e.target.value === '' ? '' : Number(e.target.value) }))} />
                    </div>
                    <div className="rate-actions">
                        <button className="submit-btn" onClick={handleSaveDefault}>บันทึก</button>
                        <button className="apply-all-btn" onClick={handleApplyAll}>Apply All ทุกห้อง</button>
                    </div>
                </div>
            </div>

            {/* Per-Room Rates */}
            <div className="glass-card pricing-section">
                <h3 className="section-subtitle">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                    ราคาเฉพาะห้อง
                </h3>
                <div className="table-wrapper">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ห้อง</th>
                                <th>ผู้เช่า</th>
                                <th className="align-right">ค่าน้ำ/หน่วย</th>
                                <th className="align-right">ค่าไฟ/หน่วย</th>
                                <th className="align-right">ค่าเช่า</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map(room => (
                                <tr key={room.roomNumber}>
                                    <td className="room-cell">{room.roomNumber}</td>
                                    <td>{room.tenantName || '-'}</td>
                                    <td className="align-right">
                                        <input type="number" className="inline-input" value={room.waterRate}
                                            onChange={e => handleRoomRateChange(room.roomNumber, 'waterRate', e.target.value)} />
                                    </td>
                                    <td className="align-right">
                                        <input type="number" className="inline-input" value={room.electricRate}
                                            onChange={e => handleRoomRateChange(room.roomNumber, 'electricRate', e.target.value)} />
                                    </td>
                                    <td className="align-right">
                                        <input type="number" className="inline-input" value={room.roomRent}
                                            onChange={e => handleRoomRateChange(room.roomNumber, 'roomRent', e.target.value)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
