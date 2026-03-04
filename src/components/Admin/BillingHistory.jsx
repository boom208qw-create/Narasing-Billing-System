import { useState, useEffect } from 'react';
import { getBillHistory, deleteBillRecord, updateBillRecord } from '../../data/mockData';
import { formatCurrency, calculateWaterBill, calculateElectricBill, calculateTotal } from '../../utils/calculations';
import './BillingHistory.css';

export default function BillingHistory() {
    const [bills, setBills] = useState([]);
    const [searchRoom, setSearchRoom] = useState('');
    const [editingBill, setEditingBill] = useState(null);
    const [editForm, setEditForm] = useState({});

    useEffect(() => {
        loadBills();
    }, []);

    function loadBills() {
        const all = getBillHistory();
        setBills([...all].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }

    const filteredBills = searchRoom.trim()
        ? bills.filter(b => b.roomNumber.includes(searchRoom.trim()))
        : bills;

    function handleDelete(billId) {
        if (window.confirm('ยืนยันลบบิลนี้?')) {
            deleteBillRecord(billId);
            loadBills();
        }
    }

    function openEdit(bill) {
        setEditingBill(bill.id);
        setEditForm({
            waterCurrent: bill.water?.currentMeter || 0,
            waterLast: bill.water?.lastMeter || 0,
            waterRate: bill.water?.rate || 18,
            electricCurrent: bill.electric?.currentMeter || 0,
            electricLast: bill.electric?.lastMeter || 0,
            electricRate: bill.electric?.rate || 8,
            fineAmount: bill.fineAmount || 0,
            fineNote: bill.fineNote || '',
            roomRent: bill.roomRent || 0
        });
    }

    function handleSaveEdit() {
        const water = calculateWaterBill(
            Number(editForm.waterCurrent), Number(editForm.waterLast), Number(editForm.waterRate)
        );
        const electric = calculateElectricBill(
            Number(editForm.electricCurrent), Number(editForm.electricLast), Number(editForm.electricRate)
        );
        const fineAmt = Number(editForm.fineAmount) || 0;
        const total = calculateTotal(water.amount, electric.amount, Number(editForm.roomRent), fineAmt);

        updateBillRecord(editingBill, {
            water: {
                lastMeter: Number(editForm.waterLast),
                currentMeter: Number(editForm.waterCurrent),
                units: water.units,
                rate: Number(editForm.waterRate),
                amount: water.amount
            },
            electric: {
                lastMeter: Number(editForm.electricLast),
                currentMeter: Number(editForm.electricCurrent),
                units: electric.units,
                rate: Number(editForm.electricRate),
                amount: electric.amount
            },
            fineAmount: fineAmt,
            fineNote: editForm.fineNote,
            roomRent: Number(editForm.roomRent),
            total
        });

        setEditingBill(null);
        loadBills();
    }

    return (
        <div className="billing-history" id="billingHistoryPage">
            <h2 className="admin-page-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                ประวัติบิลย้อนหลัง
            </h2>

            {/* Search */}
            <div className="history-search glass-card">
                <div className="search-row">
                    <input type="text" className="input search-input" placeholder="ค้นหาเลขห้อง..."
                        value={searchRoom} onChange={e => setSearchRoom(e.target.value)} />
                    <span className="result-count">{filteredBills.length} รายการ</span>
                </div>
            </div>

            {/* Bills List */}
            {filteredBills.length === 0 ? (
                <div className="glass-card empty-state">
                    <p className="empty-text">ไม่พบบิล</p>
                </div>
            ) : (
                <div className="bills-list">
                    {filteredBills.map(bill => (
                        <div className="bill-card glass-card" key={bill.id}>
                            <div className="bill-card-header">
                                <div className="bill-card-info">
                                    <span className="bill-room">ห้อง {bill.roomNumber}</span>
                                    <span className="bill-tenant">{bill.tenantName}</span>
                                    <span className="bill-date">
                                        {new Date(bill.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                                <div className="bill-card-total">
                                    <span className="bill-total-label">ยอดรวม</span>
                                    <span className="bill-total-value">{formatCurrency(bill.total)}</span>
                                </div>
                            </div>

                            <div className="bill-card-details">
                                <div className="detail-item">
                                    <span className="detail-label">ค่าน้ำ</span>
                                    <span>{bill.water?.units || 0} หน่วย = {formatCurrency(bill.water?.amount || 0)}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">ค่าไฟ</span>
                                    <span>{bill.electric?.units || 0} หน่วย = {formatCurrency(bill.electric?.amount || 0)}</span>
                                </div>
                                {bill.fineAmount > 0 && (
                                    <div className="detail-item">
                                        <span className="detail-label">ค่าปรับ {bill.fineNote ? `(${bill.fineNote})` : ''}</span>
                                        <span>{formatCurrency(bill.fineAmount)}</span>
                                    </div>
                                )}
                                <div className="detail-item">
                                    <span className="detail-label">ค่าเช่า</span>
                                    <span>{formatCurrency(bill.roomRent)}</span>
                                </div>
                            </div>

                            <div className="bill-card-actions">
                                <button className="icon-btn edit-icon" onClick={() => openEdit(bill)} title="แก้ไข">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                    แก้ไข
                                </button>
                                <button className="icon-btn delete-icon" onClick={() => handleDelete(bill.id)} title="ลบ">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                                    ลบ
                                </button>
                            </div>

                            {/* Inline Edit */}
                            {editingBill === bill.id && (
                                <div className="edit-section">
                                    <h4 className="edit-title">แก้ไขบิล</h4>
                                    <div className="edit-grid">
                                        <div className="form-group">
                                            <label>มิเตอร์น้ำ (เดิม)</label>
                                            <input type="number" className="input" value={editForm.waterLast}
                                                onChange={e => setEditForm(p => ({ ...p, waterLast: e.target.value }))} />
                                        </div>
                                        <div className="form-group">
                                            <label>มิเตอร์น้ำ (ปัจจุบัน)</label>
                                            <input type="number" className="input" value={editForm.waterCurrent}
                                                onChange={e => setEditForm(p => ({ ...p, waterCurrent: e.target.value }))} />
                                        </div>
                                        <div className="form-group">
                                            <label>มิเตอร์ไฟ (เดิม)</label>
                                            <input type="number" className="input" value={editForm.electricLast}
                                                onChange={e => setEditForm(p => ({ ...p, electricLast: e.target.value }))} />
                                        </div>
                                        <div className="form-group">
                                            <label>มิเตอร์ไฟ (ปัจจุบัน)</label>
                                            <input type="number" className="input" value={editForm.electricCurrent}
                                                onChange={e => setEditForm(p => ({ ...p, electricCurrent: e.target.value }))} />
                                        </div>
                                        <div className="form-group">
                                            <label>ค่าปรับ (บาท)</label>
                                            <input type="number" className="input" value={editForm.fineAmount}
                                                onChange={e => setEditForm(p => ({ ...p, fineAmount: e.target.value }))} />
                                        </div>
                                        <div className="form-group">
                                            <label>หมายเหตุค่าปรับ</label>
                                            <input type="text" className="input" value={editForm.fineNote}
                                                onChange={e => setEditForm(p => ({ ...p, fineNote: e.target.value }))} />
                                        </div>
                                        <div className="form-group">
                                            <label>ค่าเช่า (บาท)</label>
                                            <input type="number" className="input" value={editForm.roomRent}
                                                onChange={e => setEditForm(p => ({ ...p, roomRent: e.target.value }))} />
                                        </div>
                                    </div>
                                    <div className="edit-actions">
                                        <button className="submit-btn" onClick={handleSaveEdit}>บันทึก (คำนวณใหม่)</button>
                                        <button className="cancel-btn" onClick={() => setEditingBill(null)}>ยกเลิก</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
