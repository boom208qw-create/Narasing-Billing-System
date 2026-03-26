import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { formatShortDate } from '../../utils/calculations';
import { settingsAPI } from '../../services/api';
import './PrintInvoice.css';

export default function PrintInvoice({ billingResult, onClose }) {
    const [isSaving, setIsSaving] = useState(false);
    const paperRef = useRef(null);
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        async function loadSettings() {
            try {
                const data = await settingsAPI.get();
                setSettings(data);
            } catch (error) {
                console.error(error);
            }
        }
        loadSettings();
    }, []);

    // Use CSS for responsiveness instead of buggy JS transforms

    if (!billingResult || !settings) return null;

    function handlePrint() {
        try {
            window.print();
        } catch (error) {
            alert('เบราว์เซอร์หรือแอปพลิเคชันที่คุณใช้งานอยู่ไม่รองรับคำสั่งพิมพ์โดยตรง กรุณาเปิดผ่าน Chrome หรือ Safari');
        }
    }

    const handleSaveImage = async () => {
        const element = document.getElementById('invoicePaper');
        if (!element) return;

        try {
            setIsSaving(true);

            // Clone the element to avoid any viewport/scroll limitations on mobile
            const clone = element.cloneNode(true);

            // Apply off-screen styles to the clone but keep it fully opaque
            // We use zIndex: -1 so it stays behind the dark overlay
            Object.assign(clone.style, {
                position: 'fixed',
                top: '0',
                left: '0',
                zIndex: '-1',
                width: 'max-content',
                minWidth: '700px',
                transform: 'none',
                maxWidth: 'none',
                margin: '0',
                padding: '40px', // Match the original padding
                backgroundColor: '#ffffff'
            });

            // Append to body so it gets rendered by the browser
            document.body.appendChild(clone);

            // Small delay to ensure styles are computed
            await new Promise(resolve => setTimeout(resolve, 150));

            const canvas = await html2canvas(clone, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
                width: clone.offsetWidth,
                // Get the height from the clone
                height: clone.offsetHeight
            });

            // Clean up the clone
            document.body.removeChild(clone);

            const thaiYear = new Date(billingResult.billingDate).getFullYear() + 543;
            const month = new Date(billingResult.billingDate).getMonth() + 1;
            const fileName = `บิลค่าเช่า_ห้อง${billingResult.roomNumber}_${month}_${thaiYear}.jpg`;

            const image = canvas.toDataURL('image/jpeg', 0.95);

            // Try standard download first
            const link = document.createElement('a');
            link.href = image;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Fallback for strict mobile browsers (iOS Safari sometimes ignores .click() download)
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            if (isIOS) {
                setTimeout(() => {
                    const newTab = window.open();
                    if (newTab) {
                        newTab.document.body.innerHTML = `
                       <div style="text-align:center; padding: 20px; font-family: sans-serif; background: #fff;">
                          <h3 style="color: #059669;">✅ ค้างไว้ที่รูปภาพเพื่อเลือก 'บันทึกรูปภาพ'</h3>
                          <img src="${image}" style="max-width: 100%; border: 1px solid #ccc; box-shadow: 0 4px 10px rgba(0,0,0,0.1);" />
                       </div>`;
                    }
                }, 500);
            }

        } catch (error) {
            console.error('Error saving image:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกรูปภาพ: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const billingDate = new Date(billingResult.billingDate);
    const thaiYear = billingDate.getFullYear() + 543;
    const formattedDate = `${String(billingDate.getDate()).padStart(2, '0')} - ${String(billingDate.getMonth() + 1).padStart(2, '0')} - ${thaiYear}`;

    return (
        <div className="print-overlay" id="printInvoiceOverlay">
            <div className="print-container">
                {/* Close Button (no-print) */}
                <button className="close-btn no-print" onClick={onClose} id="closePrintBtn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                {/* Invoice Content */}
                <div className="invoice-paper" id="invoicePaper" ref={paperRef}>
                    <div className="invoice-header">
                        <h1 className="invoice-title">{settings.invoiceTitle}</h1>
                    </div>

                    <div className="invoice-room">
                        <h2>ห้อง {billingResult.roomNumber}</h2>
                    </div>

                    <div className="invoice-date">
                        <p>{formattedDate}</p>
                    </div>

                    {/* Detail Table */}
                    <table className="invoice-table-v2">
                        <thead>
                            <tr>
                                <th>รายการ</th>
                                <th className="align-right">เลขครั้งก่อน</th>
                                <th className="align-right">เลขครั้งนี้</th>
                                <th className="align-right">จำนวนหน่วยที่ใช้</th>
                                <th className="align-right">หน่วยละ</th>
                                <th className="align-right">ราคาสุทธิ ต่อรายการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="center-text">ค่าน้ำ</td>
                                <td className="align-right">{billingResult.water.lastMeter}</td>
                                <td className="align-right">{billingResult.water.currentMeter}</td>
                                <td className="align-right">{billingResult.water.units.toFixed(2)}</td>
                                <td className="align-right">{billingResult.water.rate}</td>
                                <td className="align-right">{billingResult.water.amount.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td className="center-text">ค่าไฟ</td>
                                <td className="align-right">{billingResult.electric.lastMeter}</td>
                                <td className="align-right">{billingResult.electric.currentMeter}</td>
                                <td className="align-right">{billingResult.electric.units.toFixed(2)}</td>
                                <td className="align-right">{billingResult.electric.rate}</td>
                                <td className="align-right">{billingResult.electric.amount.toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td className="center-text" colSpan={5}>
                                    {billingResult.fineNote ? billingResult.fineNote : 'ค่าปรับ'}
                                </td>
                                <td className="align-right">{billingResult.fineAmount > 0 ? billingResult.fineAmount.toFixed(2) : '0'}</td>
                            </tr>
                            <tr>
                                <td className="center-text" colSpan={5}>ค่าเช่า</td>
                                <td className="align-right">{billingResult.roomRent}</td>
                            </tr>
                            <tr className="total-row-v2">
                                <td className="td-strong" colSpan={5}>รวม</td>
                                <td className="align-right td-strong">{billingResult.total.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Footer Notes */}
                    <div className="invoice-notes-box">
                        <p>{settings.paymentNote}</p>
                    </div>

                    <div className="invoice-footer-contact">
                        <p>{settings.contactInfo}</p>
                    </div>
                </div>

                {/* Action Buttons (no-print) */}
                <div className="print-actions no-print">
                    <button className="save-action-btn" onClick={handleSaveImage} disabled={isSaving}>
                        {isSaving ? (
                            <span className="saving-spinner"></span>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                                <polyline points="17 21 17 13 7 13 7 21" />
                                <polyline points="7 3 7 8 15 8" />
                            </svg>
                        )}
                        บันทึกรูปภาพ
                    </button>
                    <button className="print-action-btn" onClick={handlePrint} id="printActionBtn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 6 2 18 2 18 9" />
                            <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                            <rect x="6" y="14" width="12" height="8" />
                        </svg>
                        พิมพ์
                    </button>
                    <button className="close-action-btn" onClick={onClose}>
                        ปิด
                    </button>
                </div>
            </div>
        </div>
    );
}
