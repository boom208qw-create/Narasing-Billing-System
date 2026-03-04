import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { formatShortDate } from '../../utils/calculations';
import { getSettings } from '../../data/mockData';
import './PrintInvoice.css';

export default function PrintInvoice({ billingResult, onClose }) {
    const [isSaving, setIsSaving] = useState(false);
    const paperRef = useRef(null);
    const settings = getSettings();

    // Dynamically scale the invoice paper to fit the viewport on mobile
    useEffect(() => {
        function updateScale() {
            if (paperRef.current) {
                const viewportWidth = window.innerWidth;
                const padding = 32; // 16px each side

                // Reset to measure true dimensions
                paperRef.current.style.transform = 'none';
                paperRef.current.style.marginBottom = '0px';

                const paperWidth = paperRef.current.offsetWidth || 700;
                const originalHeight = paperRef.current.offsetHeight;

                if (viewportWidth < paperWidth + padding) {
                    const scale = (viewportWidth - padding) / paperWidth;
                    paperRef.current.style.transform = `scale(${scale})`;
                    // Remove negative space caused by scaling
                    paperRef.current.style.marginBottom = `${(originalHeight * scale) - originalHeight}px`;
                    paperRef.current.parentElement.style.minHeight = 'auto'; // Reset parent minHeight
                } else {
                    paperRef.current.parentElement.style.minHeight = 'auto';
                }
            }
        }

        updateScale();
        // Give it a small delay for content layout to finish before scaling
        setTimeout(updateScale, 150);
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, [billingResult]);

    if (!billingResult) return null;

    function handlePrint() {
        window.print();
    }

    const handleSaveImage = async () => {
        const element = document.getElementById('invoicePaper');
        if (!element) return;

        try {
            setIsSaving(true);

            // Clone the element to avoid any viewport/scroll limitations on mobile
            const clone = element.cloneNode(true);

            // Apply strict off-screen styles to the clone
            Object.assign(clone.style, {
                position: 'absolute',
                top: '-9999px',
                left: '-9999px',
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

            // Convert to image and download
            const image = canvas.toDataURL('image/jpeg', 0.95);
            const link = document.createElement('a');
            link.href = image;
            link.download = `บิลค่าเช่า_ห้อง${billingResult.roomNumber}_${billingDate.getMonth() + 1}_${thaiYear}.jpg`;
            link.click();
        } catch (error) {
            console.error('Error saving image:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกรูปภาพ');
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
                                    ค่าปรับ {billingResult.fineNote ? `(${billingResult.fineNote})` : ''}
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
