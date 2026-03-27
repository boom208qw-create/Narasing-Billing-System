import { formatCurrency } from '../../utils/calculations';
import './InvoiceSummary.css';

export default function InvoiceSummary({ billingResult, onSaveBill, onPrint, isBillSaved }) {
    if (!billingResult) return null;

    return (
        <section className="invoice-summary glass-card" id="invoiceSummarySection">
            <div className="section-header">
                <div className="section-icon summary-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                    </svg>
                </div>
                <h2 className="section-title">สรุปยอดค่าใช้จ่าย</h2>
            </div>

            <div className="summary-content">
                <div className="summary-table">
                    {/* ค่าน้ำ */}
                    <div className="summary-row">
                        <div className="summary-label">
                            <div className="label-dot water-dot"></div>
                            <span>ค่าน้ำ</span>
                            <span className="summary-detail">
                                ({billingResult.water.units} หน่วย × {formatCurrency(billingResult.water.rate)})
                            </span>
                        </div>
                        <span className="summary-value">{formatCurrency(billingResult.water.amount)}</span>
                    </div>

                    {/* ค่าไฟ */}
                    <div className="summary-row">
                        <div className="summary-label">
                            <div className="label-dot electric-dot"></div>
                            <span>ค่าไฟ</span>
                            <span className="summary-detail">
                                ({billingResult.electric.units} หน่วย × {formatCurrency(billingResult.electric.rate)})
                            </span>
                        </div>
                        <span className="summary-value">{formatCurrency(billingResult.electric.amount)}</span>
                    </div>

                    {/* ค่าใช้จ่ายเพิ่มเติม (แยกแต่ละรายการ) */}
                    {billingResult.extras && billingResult.extras.length > 0 ? (
                        billingResult.extras.map((item, idx) => (
                            <div className="summary-row" key={idx}>
                                <div className="summary-label">
                                    <div className="label-dot" style={{ background: 'var(--accent-danger)' }}></div>
                                    <span>{item.name || 'ค่าใช้จ่ายเพิ่มเติม'}</span>
                                </div>
                                <span className="summary-value">{formatCurrency(item.amount || 0)}</span>
                            </div>
                        ))
                    ) : billingResult.fineAmount > 0 ? (
                        <div className="summary-row">
                            <div className="summary-label">
                                <div className="label-dot" style={{ background: 'var(--accent-danger)' }}></div>
                                <span>{billingResult.fineNote ? billingResult.fineNote : 'ค่าปรับ'}</span>
                            </div>
                            <span className="summary-value">{formatCurrency(billingResult.fineAmount)}</span>
                        </div>
                    ) : null}

                    {/* ค่าเช่าห้อง */}
                    <div className="summary-row">
                        <div className="summary-label">
                            <div className="label-dot rent-dot"></div>
                            <span>ค่าเช่าห้อง</span>
                        </div>
                        <span className="summary-value">{formatCurrency(billingResult.roomRent)}</span>
                    </div>

                    {/* Divider */}
                    <div className="summary-divider"></div>

                    {/* ยอดรวม */}
                    <div className="summary-row total-row">
                        <span className="total-label">ยอดรวมทั้งหมด</span>
                        <span className="total-value">{formatCurrency(billingResult.total)}</span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="summary-actions">
                {!isBillSaved ? (
                    <button className="action-btn save-btn" onClick={onSaveBill} id="saveBillBtn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                            <polyline points="17 21 17 13 7 13 7 21" />
                            <polyline points="7 3 7 8 15 8" />
                        </svg>
                        บันทึกบิล
                    </button>
                ) : (
                    <button className="action-btn saved-btn" disabled>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        บันทึกแล้ว
                    </button>
                )}

                <button className="action-btn print-btn" onClick={onPrint} id="printBillBtn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 6 2 18 2 18 9" />
                        <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                        <rect x="6" y="14" width="12" height="8" />
                    </svg>
                    พิมพ์ใบแจ้งหนี้
                </button>
            </div>
        </section>
    );
}
