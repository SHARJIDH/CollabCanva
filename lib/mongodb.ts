import mongoose from 'mongoose';

// Check for MongoDB URI at startup
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

let isConnected: boolean = false;

export const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};