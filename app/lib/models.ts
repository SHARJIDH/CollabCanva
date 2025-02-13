import mongoose from 'mongoose';

// Notebook Schema
const notebookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, default: '' },
  sketches: [{
    data: String,
    history: [String], // For undo functionality
    updatedAt: { type: Date, default: Date.now }
  }],
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Export models if they haven't been compiled yet
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Notebook = mongoose.models.Notebook || mongoose.model('Notebook', notebookSchema);