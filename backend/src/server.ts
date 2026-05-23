import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

import app from './app';

const PORT = process.env.PORT || 5000;

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);

    console.log('MongoDB connected successfully');

    app.listen(PORT, () => {
      console.log(`Server running on: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);

    process.exit(1);
  }
};

connect();
