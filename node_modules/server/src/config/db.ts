import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGO_URI ?? process.env.MONGODB_URI;
    console.log('MongoDB URI present:', !!uri);

    if (!uri) {
      throw new Error('MongoDB connection URI missing. Set MONGO_URI or MONGODB_URI in .env');
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;