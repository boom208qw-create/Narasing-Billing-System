import { useState, useEffect } from 'react';
import { roomAPI } from '../../services/api';
import RoomBillingCard from './RoomBillingCard';
import PrintInvoice from '../PrintInvoice/PrintInvoice';
import './BulkBilling.css';

export default function BulkBilling() {
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [printBill, setPrintBill] = useState(null);

    useEffect(() => {
        async function fetchRooms() {
            try {
                const data = await roomAPI.getAll();
                setRooms(data);
            } catch (err) {
                setError('ไม่สามารถโหลดข้อมูลห้องพักได้');
            } finally {
                setIsLoading(false);
            }
        }
        fetchRooms();
    }, []);

    if (isLoading) {
        return <div className="bulk-loading"><span className="spinner"></span> กำลังโหลดข้อมูลห้องพัก...</div>;
    }

    if (error) {
        return <div className="bulk-error">{error}</div>;
    }

    return (
        <div className="bulk-billing-container">
            <h2 className="bulk-title">ระบบคิดบิลประจำเดือน</h2>
            <div className="rooms-grid">
                {rooms.map(room => (
                    <RoomBillingCard 
                        key={room.roomNumber} 
                        roomData={room} 
                        onPrint={(bill) => setPrintBill(bill)}
                    />
                ))}
            </div>

            {/* Print Invoice Overlay */}
            {printBill && (
                <PrintInvoice
                    billingResult={printBill}
                    onClose={() => setPrintBill(null)}
                />
            )}
        </div>
    );
}
