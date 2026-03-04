import { useEffect } from 'react';
import { formatCurrency } from '../../utils/calculations';
import './BillingForm.css';

export default function BillingForm({
    roomData,
    currentWaterMeter,
    setCurrentWaterMeter,
    currentElectricMeter,
    setCurrentElectricMeter,
    currentFine,
    setCurrentFine,
    currentFineNote,
    setCurrentFineNote,
    onCalculate,
    billingResult,
    error
}) {
    // คำนวณอัตโนมัติเมื่อค่ามิเตอร์เปลี่ยน
    useEffect(() => {
        if (roomData) {
            onCalculate();
        }
    }, [currentWaterMeter, currentElectricMeter, currentFine, currentFineNote]);

    if (!roomData) return null;

    return (
        <section className="billing-form glass-card" id="billingFormSection">
            <div className="section-header">
                <div className="section-icon calc-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4" y="2" width="16" height="20" rx="2" />
                        <line x1="8" y1="6" x2="16" y2="6" />
                        <line x1="8" y1="10" x2="10" y2="10" />
                        <line x1="14" y1="10" x2="16" y2="10" />
                        <line x1="8" y1="14" x2="10" y2="14" />
                        <line x1="14" y1="14" x2="16" y2="14" />
                        <line x1="8" y1="18" x2="16" y2="18" />
                    </svg>
                </div>
                <h2 className="section-title">กรอกเลขมิเตอร์ปัจจุบัน</h2>
            </div>

            <div className="meter-inputs">
                {/* Water Meter Input */}
                <div className="meter-input-card water-card">
                    <div className="meter-header">
                        <div className="meter-icon water">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="meter-title">มิเตอร์น้ำ</h3>
                            <p className="meter-subtitle">เดือนที่แล้ว: <strong>{roomData.lastWaterMeter.toLocaleString()}</strong></p>
                        </div>
                    </div>
                    <div className="meter-input-wrapper">
                        <label htmlFor="currentWaterMeter" className="input-label">เลขมิเตอร์น้ำปัจจุบัน</label>
                        <input
                            id="currentWaterMeter"
                            type="number"
                            className="input meter-input"
                            placeholder={`มากกว่า ${roomData.lastWaterMeter}`}
                            value={currentWaterMeter}
                            onChange={(e) => setCurrentWaterMeter(e.target.value)}
                            min={roomData.lastWaterMeter}
                        />
                    </div>
                    {billingResult && (
                        <div className="meter-result">
                            <div className="result-row">
                                <span>จำนวนหน่วย</span>
                                <span className="result-units">{billingResult.water.units.toLocaleString()} หน่วย</span>
                            </div>
                            <div className="result-row total">
                                <span>ค่าน้ำ</span>
                                <span className="result-amount">{formatCurrency(billingResult.water.amount)}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Electric Meter Input */}
                <div className="meter-input-card electric-card">
                    <div className="meter-header">
                        <div className="meter-icon electric">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="meter-title">มิเตอร์ไฟ</h3>
                            <p className="meter-subtitle">เดือนที่แล้ว: <strong>{roomData.lastElectricMeter.toLocaleString()}</strong></p>
                        </div>
                    </div>
                    <div className="meter-input-wrapper">
                        <label htmlFor="currentElectricMeter" className="input-label">เลขมิเตอร์ไฟปัจจุบัน</label>
                        <input
                            id="currentElectricMeter"
                            type="number"
                            className="input meter-input"
                            placeholder={`มากกว่า ${roomData.lastElectricMeter}`}
                            value={currentElectricMeter}
                            onChange={(e) => setCurrentElectricMeter(e.target.value)}
                            min={roomData.lastElectricMeter}
                        />
                    </div>
                    {billingResult && (
                        <div className="meter-result">
                            <div className="result-row">
                                <span>จำนวนหน่วย</span>
                                <span className="result-units">{billingResult.electric.units.toLocaleString()} หน่วย</span>
                            </div>
                            <div className="result-row total">
                                <span>ค่าไฟ</span>
                                <span className="result-amount">{formatCurrency(billingResult.electric.amount)}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Fine (Penalty) Input */}
                <div className="meter-input-card fine-card" style={{ gridColumn: '1 / -1' }}>
                    <div className="meter-header">
                        <div className="meter-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-danger)' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                        </div>
                        <div>
                            <h3 className="meter-title">ค่าปรับ</h3>
                            <p className="meter-subtitle">กรณีจ่ายล่าช้า หรืออื่นๆ (ระบุเป็นจำนวนเงิน)</p>
                        </div>
                    </div>
                    <div className="meter-input-wrapper">
                        <label htmlFor="currentFine" className="input-label">จำนวนเงินค่าปรับ (บาท)</label>
                        <input
                            id="currentFine"
                            type="number"
                            className="input meter-input"
                            placeholder="ถ้าไม่มีให้เว้นว่าง หรือใส่ 0"
                            value={currentFine}
                            onChange={(e) => setCurrentFine(e.target.value)}
                            min="0"
                        />
                    </div>
                    <div className="meter-input-wrapper" style={{ marginTop: '16px' }}>
                        <label htmlFor="currentFineNote" className="input-label">หมายเหตุการปรับ (ถ้ามี)</label>
                        <input
                            id="currentFineNote"
                            type="text"
                            className="input"
                            placeholder="เช่น จ่ายล่าช้า 2 วัน, ค่าขยะ ฯลฯ"
                            value={currentFineNote}
                            onChange={(e) => setCurrentFineNote(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="error-message" id="billingError">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                </div>
            )}
        </section>
    );
}
