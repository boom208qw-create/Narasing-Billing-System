import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'กรุณาระบุชื่อผู้ใช้'],
        unique: true,
        trim: true,
        minlength: [3, 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร']
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'suspended'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('passwordHash')) return;
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
});

// Compare plain password with hash
userSchema.methods.comparePassword = async function (plainPassword) {
    return bcrypt.compare(plainPassword, this.passwordHash);
};

const User = mongoose.model('User', userSchema);
export default User;
