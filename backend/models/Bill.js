import mongoose from 'mongoose';

const meterSubSchema = new mongoose.Schema({
    lastMeter: { type: Number, default: 0 },
    currentMeter: { type: Number, default: 0 },
    units: { type: Number, default: 0 },
    rate: { type: Number, default: 0 },
    amount: { type: Number, default: 0 }
}, { _id: false });

const billSchema = new mongoose.Schema({
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
    billingDate: {
        type: Date,
        default: Date.now
    },
    water: {
        type: meterSubSchema,
        default: () => ({})
    },
    electric: {
        type: meterSubSchema,
        default: () => ({})
    },
    fineAmount: {
        type: Number,
        default: 0
    },
    fineNote: {
        type: String,
        default: '',
        trim: true
    },
    roomRent: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        default: 0
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index for fast queries
billSchema.index({ roomNumber: 1, createdAt: -1 });
billSchema.index({ createdAt: -1 });

const Bill = mongoose.model('Bill', billSchema);
export default Bill;
