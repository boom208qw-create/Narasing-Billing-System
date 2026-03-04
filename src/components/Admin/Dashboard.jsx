import { useState, useEffect } from 'react';
import { getDashboardStats } from '../../data/mockData';
import { formatCurrency } from '../../utils/calculations';
import './Dashboard.css';

export default function Dashboard() {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        setStats(getDashboardStats());
    }, []);

    if (!stats) return null;

    return (
        <div className="dashboard" id="dashboardPage">
            <h2 className="admin-page-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
                Dashboard
            </h2>

            {/* Stat Cards */}
            <div className="stat-grid">
                <div className="stat-card stat-rooms">
                    <div className="stat-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                    </div>
                    <div className="stat-info">
                        <span className="stat-number">{stats.totalRooms}</span>
                        <span className="stat-label">ห้องทั้งหมด</span>
                    </div>
                </div>

                <div className="stat-card stat-occupied">
                    <div className="stat-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" /></svg>
                    </div>
                    <div className="stat-info">
                        <span className="stat-number">{stats.occupiedRooms}</span>
                        <span className="stat-label">ห้องมีคนเช่า</span>
                    </div>
                </div>

                <div className="stat-card stat-vacant">
                    <div className="stat-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="3" x2="9" y2="21" /></svg>
                    </div>
                    <div className="stat-info">
                        <span className="stat-number">{stats.vacantRooms}</span>
                        <span className="stat-label">ห้องว่าง</span>
                    </div>
                </div>

                <div className="stat-card stat-bills">
                    <div className="stat-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                    </div>
                    <div className="stat-info">
                        <span className="stat-number">{stats.billsThisMonth}</span>
                        <span className="stat-label">บิลเดือนนี้</span>
                    </div>
                </div>

                <div className="stat-card stat-revenue-month">
                    <div className="stat-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>
                    </div>
                    <div className="stat-info">
                        <span className="stat-number">{formatCurrency(stats.monthRevenue)}</span>
                        <span className="stat-label">รายได้เดือนนี้</span>
                    </div>
                </div>

                <div className="stat-card stat-revenue-total">
                    <div className="stat-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
                    </div>
                    <div className="stat-info">
                        <span className="stat-number">{formatCurrency(stats.totalRevenue)}</span>
                        <span className="stat-label">รายได้สะสมทั้งหมด</span>
                    </div>
                </div>
            </div>

            {/* Recent Bills Table */}
            <div className="recent-bills glass-card">
                <h3 className="section-subtitle">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    บิลล่าสุด
                </h3>
                {stats.recentBills.length === 0 ? (
                    <p className="empty-text">ยังไม่มีบิล</p>
                ) : (
                    <div className="table-wrapper">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ห้อง</th>
                                    <th>ผู้เช่า</th>
                                    <th className="align-right">ค่าน้ำ</th>
                                    <th className="align-right">ค่าไฟ</th>
                                    <th className="align-right">ค่าปรับ</th>
                                    <th className="align-right">ค่าเช่า</th>
                                    <th className="align-right">รวม</th>
                                    <th>วันที่</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentBills.map(bill => (
                                    <tr key={bill.id}>
                                        <td className="room-cell">{bill.roomNumber}</td>
                                        <td>{bill.tenantName}</td>
                                        <td className="align-right">{formatCurrency(bill.water?.amount || 0)}</td>
                                        <td className="align-right">{formatCurrency(bill.electric?.amount || 0)}</td>
                                        <td className="align-right">{formatCurrency(bill.fineAmount || 0)}</td>
                                        <td className="align-right">{formatCurrency(bill.roomRent || 0)}</td>
                                        <td className="align-right total-cell">{formatCurrency(bill.total || 0)}</td>
                                        <td className="date-cell">{new Date(bill.createdAt).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
