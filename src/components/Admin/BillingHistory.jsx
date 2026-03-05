import { useState, useEffect } from 'react';
import { getBillHistory, deleteBillRecord, updateBillRecord, deleteMultipleBillRecords } from '../../data/mockData';
import { formatCurrency, calculateWaterBill, calculateElectricBill, calculateTotal } from '../../utils/calculations';
import { exportToCSV, exportToExcel } from '../../utils/exportBills';
import { useNotification } from '../../contexts/NotificationContext';
import './BillingHistory.css';

export default function BillingHistory() {
    const [bills, setBills] = useState([]);
    const [searchRoom, setSearchRoom] = useState('');
    const [editingBill, setEditingBill] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [selectedBills, setSelectedBills] = useState([]);
    const { showToast, showConfirm } = useNotification();

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
        showConfirm('ยืนยันลบบิลนี้?', () => {
            deleteBillRecord(billId);
            loadBills();
            setSelectedBills(prev => prev.filter(id => id !== billId));
            showToast('ลบบิลสำเร็จ', 'success');
        });
    }

    function handleToggleSelect(billId) {
        setSelectedBills(prev =>
            prev.includes(billId) ? prev.filter(id => id !== billId) : [...prev, billId]
        );
    }

    function handleSelectAll() {
        if (selectedBills.length === filteredBills.length && filteredBills.length > 0) {
            setSelectedBills([]);
        } else {
            setSelectedBills(filteredBills.map(b => b.id));
        }
    }

    function handleBulkDelete() {
        if (selectedBills.length === 0) return;
        showConfirm(`ยืนยันลบบิลที่เลือกทั้งหมด ${selectedBills.length} รายการ?`, () => {
            deleteMultipleBillRecords(selectedBills);
            loadBills();
            setSelectedBills([]);
            showToast('ลบบิลสำเร็จ', 'success');
        });
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
                currentMeter: Number(editForm.currentMeter),
                units: water.units,
                rate: Number(editForm.waterRate),
                amount: water.amount
            },
            electric: {
                lastMeter: Number(editForm.electricLast),
                currentMeter: Number(editForm.currentMeter),
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
        showToast('แก้ไขข้อมูลบิลสำเร็จ', 'success');
    }

    return (
        <div className="billing-history" id="billingHistoryPage">
            <h2 className="admin-page-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                ประวัติบิลย้อนหลัง
            </h2>

            {/* Search & Export & Bulk Actions */}
            <div className="history-search glass-card">
                <div className="search-row">
                    <input type="text" className="input search-input" placeholder="ค้นหาเลขห้อง..."
                        value={searchRoom} onChange={e => setSearchRoom(e.target.value)} />
                    <span className="result-count">{filteredBills.length} รายการ</span>
                </div>
                <div className="export-row">
                    <div className="bulk-actions">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={filteredBills.length > 0 && selectedBills.length === filteredBills.length}
                                onChange={handleSelectAll}
                            />
                            <span className="checkbox-text">เลือกทั้งหมด</span>
                        </label>
                        {selectedBills.length > 0 && (
                            <button className="delete-selected-btn" onClick={handleBulkDelete}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                                ลบที่เลือก ({selectedBills.length})
                            </button>
                        )}
                    </div>
                    <div className="export-actions">
                        <button className="export-btn export-csv" onClick={() => { exportToCSV(filteredBills); showToast('ส่งออก CSV สำเร็จ', 'success'); }} id="exportCsvBtn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                            Export CSV
                        </button>
                        <button className="export-btn export-excel" onClick={() => { exportToExcel(filteredBills); showToast('ส่งออก Excel สำเร็จ', 'success'); }} id="exportExcelBtn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                            Export Excel
                        </button>
                    </div>
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
                        <div
                            className={`bill-card glass-card ${selectedBills.includes(bill.id) ? 'selected' : ''}`}
                            key={bill.id}
                            onClick={() => handleToggleSelect(bill.id)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="bill-card-header">
                                <div className="bill-card-info-group">
                                    <div className="bill-card-info">
                                        <span className="bill-room">ห้อง {bill.roomNumber}</span>
                                        <span className="bill-tenant">{bill.tenantName}</span>
                                        <span className="bill-date">
                                            {new Date(bill.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </span>
                                    </div>
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
                                <button className="icon-btn edit-icon" onClick={(e) => { e.stopPropagation(); openEdit(bill); }} title="แก้ไข">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                                    แก้ไข
                                </button>
                                <button className="icon-btn delete-icon" onClick={(e) => { e.stopPropagation(); handleDelete(bill.id); }} title="ลบ">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                                    ลบ
                                </button>
                            </div>

                            {/* Inline Edit */}
                            {editingBill === bill.id && (
                                <div className="edit-section" onClick={(e) => e.stopPropagation()}>
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
