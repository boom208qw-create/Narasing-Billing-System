import { useState } from 'react';
import { useBilling } from './hooks/useBilling';
import Header from './components/Header/Header';
import RoomSearch from './components/RoomSearch/RoomSearch';
import BillingForm from './components/BillingForm/BillingForm';
import InvoiceSummary from './components/InvoiceSummary/InvoiceSummary';
import PrintInvoice from './components/PrintInvoice/PrintInvoice';
import AdminPanel from './components/Admin/AdminPanel';
import './App.css';

function App() {
    const {
        roomNumber,
        roomData,
        currentWaterMeter,
        currentElectricMeter,
        currentFine,
        currentFineNote,
        billingResult,
        error,
        isSearching,
        isBillSaved,
        setRoomNumber,
        setCurrentWaterMeter,
        setCurrentElectricMeter,
        setCurrentFine,
        setCurrentFineNote,
        searchRoom,
        calculateBill,
        saveBill,
        resetAll
    } = useBilling();

    const [showPrint, setShowPrint] = useState(false);
    const [currentPage, setCurrentPage] = useState('billing'); // 'billing' | 'admin'

    function handlePrint() {
        if (!isBillSaved) {
            saveBill();
        }
        setShowPrint(true);
    }

    function handleNewBill() {
        resetAll();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ===== Admin Page =====
    if (currentPage === 'admin') {
        return <AdminPanel onBackToBilling={() => setCurrentPage('billing')} />;
    }

    // ===== Billing Page (เดิม) =====
    return (
        <div className="app" id="billingApp">
            <Header />

            {/* Admin Button */}
            <div className="admin-toggle-bar no-print">
                <button className="admin-toggle-btn" onClick={() => setCurrentPage('admin')}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                    </svg>
                    ระบบหลังบ้าน
                </button>
            </div>

            <main className="app-main">
                <div className="app-container">
                    {/* Room Search Section */}
                    <RoomSearch
                        roomNumber={roomNumber}
                        setRoomNumber={setRoomNumber}
                        onSearch={searchRoom}
                        roomData={roomData}
                        isSearching={isSearching}
                        error={!roomData ? error : ''}
                    />

                    {/* Billing Form Section */}
                    {roomData && (
                        <BillingForm
                            roomData={roomData}
                            currentWaterMeter={currentWaterMeter}
                            setCurrentWaterMeter={setCurrentWaterMeter}
                            currentElectricMeter={currentElectricMeter}
                            setCurrentElectricMeter={setCurrentElectricMeter}
                            currentFine={currentFine}
                            setCurrentFine={setCurrentFine}
                            currentFineNote={currentFineNote}
                            setCurrentFineNote={setCurrentFineNote}
                            onCalculate={calculateBill}
                            billingResult={billingResult}
                            error={roomData ? error : ''}
                        />
                    )}

                    {/* Invoice Summary Section */}
                    {billingResult && (
                        <InvoiceSummary
                            billingResult={billingResult}
                            onSaveBill={saveBill}
                            onPrint={handlePrint}
                            isBillSaved={isBillSaved}
                        />
                    )}

                    {/* New Bill Button */}
                    {billingResult && (
                        <div className="new-bill-wrapper">
                            <button className="new-bill-btn" onClick={handleNewBill} id="newBillBtn">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                คิดบิลห้องใหม่
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="app-footer no-print">
                <p>© 2026 Narasing Billing System</p>
            </footer>

            {/* Print Invoice Overlay */}
            {showPrint && (
                <PrintInvoice
                    billingResult={billingResult}
                    onClose={() => setShowPrint(false)}
                />
            )}
        </div>
    );
}

export default App;
