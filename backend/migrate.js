/**
 * Migration Script – assign all existing Room, Bill, Settings documents to a specific user.
 *
 * Usage:
 *   1. Make sure your backend .env is configured (MONGO_URI, JWT_SECRET)
 *   2. Run: node migrate.js <username>
 *      e.g.: node migrate.js admin
 *
 * The script will:
 *   - Find the user by username
 *   - Set userId on all Room, Bill, Settings documents that have no userId
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import Room from './models/Room.js';
import Bill from './models/Bill.js';
import Settings from './models/Settings.js';

dotenv.config();

const targetUsername = process.argv[2];

if (!targetUsername) {
    console.error('❌ กรุณาระบุ username: node migrate.js <username>');
    process.exit(1);
}

async function migrate() {
    await connectDB();
    console.log('✅ เชื่อมต่อ MongoDB สำเร็จ');

    const user = await User.findOne({ username: targetUsername });
    if (!user) {
        console.error(`❌ ไม่พบผู้ใช้: "${targetUsername}"`);
        console.error('   กรุณาสมัครสมาชิกผ่าน Frontend ก่อน แล้วรัน script นี้อีกครั้ง');
        process.exit(1);
    }

    console.log(`👤 พบผู้ใช้: ${user.username} (${user._id})`);

    // Migrate Rooms (no userId only)
    const roomResult = await Room.updateMany(
        { userId: { $exists: false } },
        { $set: { userId: user._id } }
    );
    console.log(`🏠 อัพเดตห้อง: ${roomResult.modifiedCount} รายการ`);

    // Migrate Bills (no userId only)
    const billResult = await Bill.updateMany(
        { userId: { $exists: false } },
        { $set: { userId: user._id } }
    );
    console.log(`🧾 อัพเดตบิล: ${billResult.modifiedCount} รายการ`);

    // Migrate Settings (no userId only)
    const settingsResult = await Settings.updateMany(
        { userId: { $exists: false } },
        { $set: { userId: user._id } }
    );
    console.log(`⚙️  อัพเดต Settings: ${settingsResult.modifiedCount} รายการ`);

    console.log('\n✅ Migration สำเร็จ! ข้อมูลทั้งหมดถูกโอนให้ผู้ใช้:', targetUsername);
    await mongoose.disconnect();
    process.exit(0);
}

migrate().catch(err => {
    console.error('❌ Migration ล้มเหลว:', err.message);
    process.exit(1);
});
