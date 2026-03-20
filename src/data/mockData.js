/**
 * Mock Data - ข้อมูลจำลองห้องพัก
 * ใช้ localStorage เป็น persistent storage
 */

const STORAGE_KEY = 'narasing_rooms_data';
const BILLS_KEY = 'narasing_bills_data';
const RATES_KEY = 'narasing_default_rates';
const SETTINGS_KEY = 'narasing_settings';

// ข้อมูลเริ่มต้น (ถ้ายังไม่มีใน localStorage)
const initialRooms = [
    {
        roomNumber: '101',
        tenantName: 'คุณสมชาย',
        lastWaterMeter: 1520,
        lastElectricMeter: 4830,
        waterRate: 18,
        electricRate: 8,
        roomRent: 3500,
        lastBillingDate: '2026-02-01',
        isOccupied: true
    },
    {
        roomNumber: '102',
        tenantName: 'คุณสมหญิง',
        lastWaterMeter: 980,
        lastElectricMeter: 3200,
        waterRate: 18,
        electricRate: 8,
        roomRent: 3500,
        lastBillingDate: '2026-02-01',
        isOccupied: true
    },
    {
        roomNumber: '103',
        tenantName: 'คุณวิชัย',
        lastWaterMeter: 2100,
        lastElectricMeter: 5640,
        waterRate: 18,
        electricRate: 8,
        roomRent: 4000,
        lastBillingDate: '2026-02-01',
        isOccupied: true
    },
    {
        roomNumber: '201',
        tenantName: 'คุณนภา',
        lastWaterMeter: 750,
        lastElectricMeter: 2890,
        waterRate: 18,
        electricRate: 8,
        roomRent: 3800,
        lastBillingDate: '2026-02-01',
        isOccupied: true
    },
    {
        roomNumber: '202',
        tenantName: 'คุณอนันต์',
        lastWaterMeter: 1890,
        lastElectricMeter: 6100,
        waterRate: 18,
        electricRate: 8,
        roomRent: 3800,
        lastBillingDate: '2026-02-01',
        isOccupied: true
    },
    {
        roomNumber: '203',
        tenantName: 'คุณพิมพ์',
        lastWaterMeter: 430,
        lastElectricMeter: 1560,
        waterRate: 18,
        electricRate: 8,
        roomRent: 4000,
        lastBillingDate: '2026-02-01',
        isOccupied: true
    },
    {
        roomNumber: '301',
        tenantName: 'คุณธนา',
        lastWaterMeter: 1200,
        lastElectricMeter: 3980,
        waterRate: 18,
        electricRate: 8,
        roomRent: 4200,
        lastBillingDate: '2026-02-01',
        isOccupied: true
    },
    {
        roomNumber: '302',
        tenantName: 'คุณรัตนา',
        lastWaterMeter: 560,
        lastElectricMeter: 2350,
        waterRate: 18,
        electricRate: 8,
        roomRent: 4200,
        lastBillingDate: '2026-02-01',
        isOccupied: true
    }
];

const defaultRates = {
    waterRate: 18,
    electricRate: 8,
    roomRent: 0
};

// ========== LOAD / SAVE ==========

function loadRooms() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const rooms = JSON.parse(stored);
            // Migrate: add isOccupied if missing
            return rooms.map(r => ({ isOccupied: true, ...r }));
        }
    } catch (e) {
        console.error('Error loading rooms:', e);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialRooms));
    return [...initialRooms];
}

function saveRooms(rooms) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
}

function loadBills() {
    try {
        const stored = localStorage.getItem(BILLS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Error loading bills:', e);
        return [];
    }
}

function saveBills(bills) {
    localStorage.setItem(BILLS_KEY, JSON.stringify(bills));
}

// ========== ROOM QUERIES ==========

export function getRoomByNumber(roomNumber) {
    const rooms = loadRooms();
    return rooms.find(r => r.roomNumber === roomNumber.trim()) || null;
}

export function getAllRooms() {
    return loadRooms();
}

// ========== ROOM MANAGEMENT (ADMIN) ==========

export function addRoom(roomData) {
    const rooms = loadRooms();
    if (rooms.find(r => r.roomNumber === roomData.roomNumber)) {
        return { success: false, error: 'เลขห้องนี้มีอยู่แล้ว' };
    }
    rooms.unshift({
        roomNumber: roomData.roomNumber,
        tenantName: roomData.tenantName || '',
        lastWaterMeter: Number(roomData.lastWaterMeter) || 0,
        lastElectricMeter: Number(roomData.lastElectricMeter) || 0,
        waterRate: Number(roomData.waterRate) || getDefaultRates().waterRate,
        electricRate: Number(roomData.electricRate) || getDefaultRates().electricRate,
        roomRent: Number(roomData.roomRent) || 0,
        lastBillingDate: '',
        isOccupied: roomData.isOccupied !== undefined ? roomData.isOccupied : true
    });
    saveRooms(rooms);
    return { success: true };
}

export function updateRoom(roomNumber, updates) {
    const rooms = loadRooms();
    const idx = rooms.findIndex(r => r.roomNumber === roomNumber);
    if (idx < 0) return { success: false, error: 'ไม่พบห้องนี้' };

    // Allow updating specific fields
    const allowed = ['tenantName', 'lastWaterMeter', 'lastElectricMeter', 'waterRate', 'electricRate', 'roomRent', 'isOccupied', 'roomNumber'];
    allowed.forEach(key => {
        if (updates[key] !== undefined) {
            if (['lastWaterMeter', 'lastElectricMeter', 'waterRate', 'electricRate', 'roomRent'].includes(key)) {
                rooms[idx][key] = updates[key] === '' ? '' : Number(updates[key]);
            } else {
                rooms[idx][key] = updates[key];
            }
        }
    });
    saveRooms(rooms);
    return { success: true, room: rooms[idx] };
}

export function deleteRoom(roomNumber) {
    let rooms = loadRooms();
    const before = rooms.length;
    rooms = rooms.filter(r => r.roomNumber !== roomNumber);
    if (rooms.length === before) return { success: false, error: 'ไม่พบห้องนี้' };
    saveRooms(rooms);
    return { success: true };
}

// ========== METER UPDATE ==========

export function updateRoomMeters(roomNumber, newWaterMeter, newElectricMeter) {
    const rooms = loadRooms();
    const idx = rooms.findIndex(r => r.roomNumber === roomNumber);
    if (idx >= 0) {
        rooms[idx].lastWaterMeter = newWaterMeter;
        rooms[idx].lastElectricMeter = newElectricMeter;
        rooms[idx].lastBillingDate = new Date().toISOString().split('T')[0];
        saveRooms(rooms);
        return rooms[idx];
    }
    return null;
}

// ========== BILL RECORDS ==========

export function saveBillRecord(bill) {
    try {
        const bills = loadBills();
        bills.push({
            ...bill,
            id: Date.now().toString(),
            createdAt: new Date().toISOString()
        });
        saveBills(bills);
        return true;
    } catch (e) {
        console.error('Error saving bill:', e);
        return false;
    }
}

export function getBillHistory(roomNumber) {
    const bills = loadBills();
    if (roomNumber) {
        return bills.filter(b => b.roomNumber === roomNumber);
    }
    return bills;
}

export function getBillById(billId) {
    const bills = loadBills();
    return bills.find(b => b.id === billId) || null;
}

export function updateBillRecord(billId, updates) {
    const bills = loadBills();
    const idx = bills.findIndex(b => b.id === billId);
    if (idx < 0) return { success: false, error: 'ไม่พบบิลนี้' };

    Object.keys(updates).forEach(key => {
        bills[idx][key] = updates[key];
    });
    bills[idx].updatedAt = new Date().toISOString();
    saveBills(bills);
    return { success: true, bill: bills[idx] };
}

export function deleteBillRecord(billId) {
    let bills = loadBills();
    const before = bills.length;
    bills = bills.filter(b => b.id !== billId);
    if (bills.length === before) return { success: false, error: 'ไม่พบบิลนี้' };
    saveBills(bills);
    return { success: true };
}

export function deleteMultipleBillRecords(billIds) {
    let bills = loadBills();
    const before = bills.length;
    bills = bills.filter(b => !billIds.includes(b.id));
    if (bills.length === before) return { success: false, error: 'ไม่พบบิลเหล่านี้' };
    saveBills(bills);
    return { success: true };
}

// ========== DEFAULT RATES ==========

export function getDefaultRates() {
    try {
        const stored = localStorage.getItem(RATES_KEY);
        if (stored) return JSON.parse(stored);
    } catch (e) { /* ignore */ }
    return { ...defaultRates };
}

export function setDefaultRates(rates) {
    const current = getDefaultRates();
    const updated = { ...current, ...rates };
    localStorage.setItem(RATES_KEY, JSON.stringify(updated));
    return updated;
}

export function applyRatesToAllRooms(rates) {
    const rooms = loadRooms();
    rooms.forEach(room => {
        if (rates.waterRate !== undefined) room.waterRate = rates.waterRate === '' ? '' : Number(rates.waterRate);
        if (rates.electricRate !== undefined) room.electricRate = rates.electricRate === '' ? '' : Number(rates.electricRate);
        if (rates.roomRent !== undefined) room.roomRent = rates.roomRent === '' ? '' : Number(rates.roomRent);
    });
    saveRooms(rooms);
    return rooms;
}

// ========== STATISTICS (DASHBOARD) ==========

export function getDashboardStats() {
    const rooms = loadRooms();
    const bills = loadBills();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const billsThisMonth = bills.filter(b => {
        const d = new Date(b.createdAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalRevenue = bills.reduce((sum, b) => sum + (b.total || 0), 0);
    const monthRevenue = billsThisMonth.reduce((sum, b) => sum + (b.total || 0), 0);

    const occupiedRooms = rooms.filter(r => r.isOccupied).length;
    const vacantRooms = rooms.filter(r => !r.isOccupied).length;

    return {
        totalRooms: rooms.length,
        occupiedRooms,
        vacantRooms,
        totalBills: bills.length,
        billsThisMonth: billsThisMonth.length,
        totalRevenue,
        monthRevenue,
        recentBills: [...bills].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10),
        roomsList: rooms.map(r => ({ roomNumber: r.roomNumber, isOccupied: r.isOccupied, tenantName: r.tenantName }))
    };
}

// ========== GENERAL SETTINGS ==========

const defaultSettings = {
    businessName: 'นรสิงห์',
    invoiceTitle: 'บิลค่าเช่าห้องแถว นรสิงห์',
    headerSubtitle: 'Narasing Billing System',
    paymentNote: 'ชำระเงินทุกวันที่ 5 ของทุกเดือนหรือเกินกำหนดวันชำระนั้นๆ ปรับเพิ่มวันละ 100 บาท',
    contactInfo: 'ช่องทางการติดต่อ สอบถาม 092-5152-870 โก้ / 082-508-8909 พอล'
};

export function getSettings() {
    try {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
    } catch (e) { /* ignore */ }
    return { ...defaultSettings };
}

export function saveSettingsData(settings) {
    const updated = { ...getSettings(), ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
}
