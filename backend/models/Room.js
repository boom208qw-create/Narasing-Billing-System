import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: [true, 'กรุณาระบุเลขห้อง'],
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
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Compound unique index: same roomNumber allowed across different users
roomSchema.index({ roomNumber: 1, userId: 1 }, { unique: true });

const Room = mongoose.model('Room', roomSchema);
export default Room;
