import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        trim: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        default: ''
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Compound unique index: same key allowed across different users
settingsSchema.index({ key: 1, userId: 1 }, { unique: true });

// Default settings values
settingsSchema.statics.defaults = {
    businessName: 'นรสิงห์',
    invoiceTitle: 'บิลค่าเช่าห้องแถว นรสิงห์',
    headerSubtitle: 'Narasing Billing System',
    paymentNote: 'ชำระเงินทุกวันที่ 5 ของทุกเดือนหรือเกินกำหนดวันชำระนั้นๆ ปรับเพิ่มวันละ 100 บาท',
    contactInfo: 'ช่องทางการติดต่อ สอบถาม 092-5152-870 โก้ / 082-508-8909 พอล',
    footerText: '© 2026 Narasing Billing System',
    waterRate: 18,
    electricRate: 8,
    roomRent: 0
};

// Get all settings for a specific user as a flat object
settingsSchema.statics.getAll = async function (userId) {
    const docs = await this.find({ userId });
    const result = { ...this.defaults };
    docs.forEach(doc => {
        result[doc.key] = doc.value;
    });
    return result;
};

// Set multiple settings at once for a specific user
settingsSchema.statics.setMultiple = async function (settings, userId) {
    const ops = Object.entries(settings).map(([key, value]) => ({
        updateOne: {
            filter: { key, userId },
            update: { $set: { key, value, userId } },
            upsert: true
        }
    }));
    if (ops.length > 0) {
        await this.bulkWrite(ops);
    }
    return this.getAll(userId);
};

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
