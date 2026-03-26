import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config();

async function fixIndexes() {
    try {
        await connectDB();
        console.log('✅ เชื่อมต่อฐานข้อมูลสำเร็จ');

        const db = mongoose.connection.db;

        // Drop index from settings
        try {
            await db.collection('settings').dropIndex('key_1');
            console.log('✅ ลบ Index เก่า (key_1) ใน Settings สำเร็จ');
        } catch (err) {
            console.log('⚠️ ไม่พบ Index key_1 หรือถูกลบไปแล้ว');
        }

        // Drop index from rooms
        try {
            await db.collection('rooms').dropIndex('roomNumber_1');
            console.log('✅ ลบ Index เก่า (roomNumber_1) ใน Rooms สำเร็จ');
        } catch (err) {
            console.log('⚠️ ไม่พบ Index roomNumber_1 หรือถูกลบไปแล้ว');
        }

        console.log('🎉 ลบ Index เก่าเรียบร้อยแล้ว');
        mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาด:', error.message);
        process.exit(1);
    }
}

fixIndexes();
