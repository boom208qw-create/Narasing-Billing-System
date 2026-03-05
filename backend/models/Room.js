import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: [true, 'กรุณาระบุเลขห้อง'],
        unique: true,
        trim: true
    },
    tenantName: {
        type: String,
        default: '',
        trim: true
    },
    lastWaterMeter: {
        type: Number,
        default: 0
    },
    lastElectricMeter: {
        type: Number,
        default: 0
    },
    waterRate: {
        type: Number,
        default: 18
    },
    electricRate: {
        type: Number,
        default: 8
    },
    roomRent: {
        type: Number,
        default: 0
    },
    lastBillingDate: {
        type: Date,
        default: null
    },
    isOccupied: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index automatically created by unique: true on roomNumber

const Room = mongoose.model('Room', roomSchema);
export default Room;
