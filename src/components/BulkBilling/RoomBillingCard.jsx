import { useState, useEffect } from 'react';
import { billAPI, roomAPI } from '../../services/api';
import { calculateWaterBill, calculateElectricBill, calculateTotal, formatCurrency } from '../../utils/calculations';

export default function RoomBillingCard({ roomData, onPrint }) {
    const [waterMeter, setWaterMeter] = useState('');
    const [electricMeter, setElectricMeter] = useState('');
    const [extras, setExtras] = useState([]);
    
    // Results
    const [waterResult, setWaterResult] = useState({ units: 0, amount: 0 });
    const [electricResult, setElectricResult] = useState({ units: 0, amount: 0 });
    const [total, setTotal] = useState(roomData.roomRent);
    
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [savedBill, setSavedBill] = useState(null);

    // Calculate whenever inputs change
    useEffect(() => {
        let wMeter = parseFloat(waterMeter) || 0;
        let eMeter = parseFloat(electricMeter) || 0;
        let totalExtras = extras.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
        
        let wUnits = 0, wAmount = 0;
        if (wMeter >= roomData.lastWaterMeter) {
            const res = calculateWaterBill(wMeter, roomData.lastWaterMeter, roomData.waterRate);
            wUnits = res.units;
            wAmount = res.amount;
        }
        
        let eUnits = 0, eAmount = 0;
        if (eMeter >= roomData.lastElectricMeter) {
            const res = calculateElectricBill(eMeter, roomData.lastElectricMeter, roomData.electricRate);
            eUnits = res.units;
            eAmount = res.amount;
        }

        setWaterResult({ units: wUnits, amount: wAmount });
        setElectricResult({ units: eUnits, amount: eAmount });
        
        setTotal(calculateTotal(wAmount, eAmount, roomData.roomRent, totalExtras));
        
    }, [waterMeter, electricMeter, extras, roomData]);

    const handleAddExtra = () => {
        setExtras([...extras, { id: Date.now(), name: '', amount: '' }]);
    };

    const handleRemoveExtra = (id) => {
        setExtras(extras.filter(e => e.id !== id));
    };

    const updateExtra = (id, field, value) => {
        setExtras(extras.map(e => e.id === id ? { ...e, [field]: value } : e));
    };

    const handleSave = async () => {
        setError('');
        setSuccess(false);
        setSavedBill(null);
        
        const wMeter = parseFloat(waterMeter);
        const eMeter = parseFloat(electricMeter);
        
        if (!waterMeter || !electricMeter) {
            setError('กรุณากรอกเลขมิเตอร์ให้ครบถ้วน');
            return;
        }
        if (wMeter < roomData.lastWaterMeter) {
            setError('เลขมิเตอร์น้ำต้องไม่น้อยกว่าเดือนที่แล้ว');
            return;
        }
        if (eMeter < roomData.lastElectricMeter) {
            setError('เลขมิเตอร์ไฟต้องไม่น้อยกว่าเดือนที่แล้ว');
            return;
        }
        
        setIsSaving(true);
        try {
            // Processing extras
            const validExtras = extras.filter(e => e.name.trim() && parseFloat(e.amount) > 0);
            const fAmount = validExtras.reduce((sum, e) => sum + parseFloat(e.amount), 0);
            const fNote = validExtras.map(e => `${e.name.trim()}`).join(', ');

            const billingResult = {
                roomNumber: roomData.roomNumber,
                tenantName: roomData.tenantName,
                billingDate: new Date().toISOString(),
                water: {
                    lastMeter: roomData.lastWaterMeter,
                    currentMeter: wMeter,
                    units: waterResult.units,
                    rate: roomData.waterRate,
                    amount: waterResult.amount
                },
                electric: {
                    lastMeter: roomData.lastElectricMeter,
                    currentMeter: eMeter,
                    units: electricResult.units,
                    rate: roomData.electricRate,
                    amount: electricResult.amount
                },
                fineAmount: fAmount,
                fineNote: fNote,
                extras: validExtras.map(e => ({ name: e.name.trim(), amount: parseFloat(e.amount) })),
                roomRent: roomData.roomRent,
                total
            };

            await billAPI.create(billingResult);
            await roomAPI.updateMeters(roomData.roomNumber, wMeter, eMeter);
            
            setSavedBill(billingResult);
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกบิล');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={`room-billing-card glass-card ${success ? 'success-pulse' : ''}`}>
            <div className="card-header">
                <h3>ห้อง {roomData.roomNumber} : 💸</h3>
                {roomData.tenantName && <span className="tenant-name">{roomData.tenantName}</span>}
            </div>
            
            <div className="billing-grid-container">
                <div className="billing-grid">
                    {/* Headers */}
                    <div className="grid-header"></div>
                    <div className="grid-header center">เดือนก่อน</div>
                    <div className="grid-header center">เดือนนี้</div>
                    <div className="grid-header center">หน่วยที่ใช้</div>
                    <div className="grid-header center">บาท/หน่วย</div>
                    <div className="grid-header right">รวมเงิน</div>

                    {/* Water Row */}
                    <div className="grid-label">น้ำ</div>
                    <div className="grid-value ro center">{roomData.lastWaterMeter}</div>
                    <div>
                        <input 
                            type="number" 
                            className="grid-input" 
                            value={waterMeter} 
                            onChange={e => setWaterMeter(e.target.value)} 
                        />
                    </div>
                    <div className="grid-value ro center">{waterResult.units}</div>
                    <div className="grid-value ro center">{roomData.waterRate}</div>
                    <div className="grid-value ro right bg-total">{waterResult.amount.toLocaleString()}</div>

                    {/* Electric Row */}
                    <div className="grid-label">ไฟ</div>
                    <div className="grid-value ro center">{roomData.lastElectricMeter}</div>
                    <div>
                        <input 
                            type="number" 
                            className="grid-input" 
                            value={electricMeter} 
                            onChange={e => setElectricMeter(e.target.value)} 
                        />
                    </div>
                    <div className="grid-value ro center">{electricResult.units}</div>
                    <div className="grid-value ro center">{roomData.electricRate}</div>
                    <div className="grid-value ro right bg-total">{electricResult.amount.toLocaleString()}</div>
                </div>
            </div>

            <div className="totals-section">
                <div className="total-row">
                    <span className="total-label">ค่าเช่า</span>
                    <span className="total-value">{roomData.roomRent.toLocaleString()}</span>
                </div>
                
                {/* Dynamic Extra Fees */}
                {extras.map((extra) => (
                    <div className="fee-input-row" key={extra.id}>
                        <input 
                            type="text" 
                            className="fee-note-input input" 
                            placeholder="รายการเพิ่มเติม (เช่น ค่าขยะ)" 
                            value={extra.name}
                            onChange={e => updateExtra(extra.id, 'name', e.target.value)}
                        />
                        <input 
                            type="number" 
                            className="fee-amount-input input" 
                            placeholder="จำนวนเงิน" 
                            value={extra.amount}
                            onChange={e => updateExtra(extra.id, 'amount', e.target.value)}
                        />
                        <button className="remove-extra-btn" onClick={() => handleRemoveExtra(extra.id)} title="ลบรายการ">
                            ✕
                        </button>
                    </div>
                ))}

                <button className="add-extra-btn" onClick={handleAddExtra}>
                    + ค่าใช้จ่ายเพิ่มเติม
                </button>

                <div className="grand-total-row">
                    <span className="grand-total-label">รวมทั้งหมด</span>
                    <span className="grand-total-value highlight">{formatCurrency(total)}</span>
                </div>
            </div>

            {error && <div className="card-error">{error}</div>}
            
            <div className="card-actions" style={{gap: '10px'}}>
                {success ? (
                    <>
                        <button className="btn-success billing-btn" disabled>✓ บันทึกสำเร็จ</button>
                        <button className="btn-primary billing-btn" onClick={() => onPrint(savedBill)}>🖨️ พิมพ์/ออกบิล</button>
                    </>
                ) : (
                    <button className="btn-primary billing-btn" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'กำลังบันทึก...' : 'สร้างบิล'}
                    </button>
                )}
            </div>
        </div>
    );
}
