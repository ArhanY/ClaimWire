import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/claimwire';

export const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('[🍃] MongoDB Connected Successfully');
    } catch (err) {
        console.error('[❌] MongoDB Connection Error:', err.message);
        process.exit(1);
    }
};

// No need for a separate query export with Mongoose, 
// we will use models instead.
