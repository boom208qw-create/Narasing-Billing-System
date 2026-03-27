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

// Default settings values (empty for new users — they fill in their own)
settingsSchema.statics.defaults = {
    businessName: '',
    invoiceTitle: '',
    headerSubtitle: '',
    paymentNote: '',
    contactInfo: '',
    footerText: '',
    waterRate: 0,
    electricRate: 0,
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
