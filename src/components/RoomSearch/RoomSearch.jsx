import { useState } from 'react';
import { getAllRooms } from '../../data/mockData';
import { formatCurrency } from '../../utils/calculations';
import './RoomSearch.css';

export default function RoomSearch({ roomNumber, setRoomNumber, onSearch, roomData, isSearching, error }) {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const allRooms = getAllRooms();

    const filteredRooms = allRooms.filter(r =>
        r.roomNumber.includes(roomNumber)
    );

    function handleInputChange(e) {
        setRoomNumber(e.target.value);
        setShowSuggestions(e.target.value.length > 0);
    }

    function handleSelectRoom(num) {
        setRoomNumber(num);
        setShowSuggestions(false);
        onSearch(num);
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter') {
            setShowSuggestions(false);
            onSearch();
        }
    }

    function handleBlur() {
        // ดีเลย์เล็กน้อยเพื่อให้คลิก suggestion ได้
        setTimeout(() => setShowSuggestions(false), 200);
    }

    return (
        <section className="room-search glass-card" id="roomSearchSection">
            <div className="section-header">
                <div className="section-icon water-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <h2 className="section-title">ค้นหาห้องพัก</h2>
            </div>

            <div className="search-input-wrapper">
                <div className="search-field">
                    <label htmlFor="roomNumberInput" className="input-label">เลขห้อง</label>
                    <div className="input-group">
                        <input
                            id="roomNumberInput"
                            type="text"
                            className="input"
                            placeholder="พิมพ์เลขห้อง เช่น 101, 202..."
                            value={roomNumber}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            onFocus={() => roomNumber && setShowSuggestions(true)}
                            onBlur={handleBlur}
                            autoComplete="off"
                        />
                        <button
                            className="search-btn"
                            onClick={() => { setShowSuggestions(false); onSearch(); }}
                            disabled={isSearching}
                            id="searchRoomBtn"
                        >
                            {isSearching ? (
                                <span className="spinner"></span>
                            ) : (
                                <>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    ค้นหา
                                </>
                            )}
                        </button>
                    </div>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && filteredRooms.length > 0 && (
                        <div className="suggestions-dropdown">
                            {filteredRooms.map((room) => (
                                <button
                                    key={room.roomNumber}
                                    className="suggestion-item"
                                    onMouseDown={() => handleSelectRoom(room.roomNumber)}
                                >
                                    <span className="suggestion-room">ห้อง {room.roomNumber}</span>
                                    <span className="suggestion-tenant">{room.tenantName}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && !roomData && (
                <div className="error-message" id="searchError">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    {error}
                </div>
            )}

            {/* Room Data Display */}
            {roomData && (
                <div className="room-info" id="roomInfoDisplay">
                    <div className="room-info-header">
                        <div className="room-badge">ห้อง {roomData.roomNumber}</div>
                        <div className="tenant-name">{roomData.tenantName}</div>
                    </div>

                    <div className="room-info-grid">
                        <div className="info-card">
                            <div className="info-card-icon water">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                                </svg>
                            </div>
                            <div className="info-card-content">
                                <span className="info-label">มิเตอร์น้ำ (เดือนที่แล้ว)</span>
                                <span className="info-value">{roomData.lastWaterMeter.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="info-card">
                            <div className="info-card-icon electric">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                                </svg>
                            </div>
                            <div className="info-card-content">
                                <span className="info-label">มิเตอร์ไฟ (เดือนที่แล้ว)</span>
                                <span className="info-value">{roomData.lastElectricMeter.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="info-card">
                            <div className="info-card-icon rate-water">
                                <span>฿</span>
                            </div>
                            <div className="info-card-content">
                                <span className="info-label">ราคาน้ำ / หน่วย</span>
                                <span className="info-value">{formatCurrency(roomData.waterRate)}</span>
                            </div>
                        </div>

                        <div className="info-card">
                            <div className="info-card-icon rate-electric">
                                <span>฿</span>
                            </div>
                            <div className="info-card-content">
                                <span className="info-label">ราคาไฟ / หน่วย</span>
                                <span className="info-value">{formatCurrency(roomData.electricRate)}</span>
                            </div>
                        </div>

                        <div className="info-card full-width">
                            <div className="info-card-icon rent">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                    <polyline points="9 22 9 12 15 12 15 22" />
                                </svg>
                            </div>
                            <div className="info-card-content">
                                <span className="info-label">ค่าเช่าห้อง</span>
                                <span className="info-value highlight">{formatCurrency(roomData.roomRent)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
