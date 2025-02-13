// lib/models.ts
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true },
  },
  { timestamps: true },
);

const notebookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, default: "" },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collaborators: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        email: { type: String, required: true },
        permission: {
          type: String,
          enum: ["read", "write"],
          default: "write",
        },
        status: {
          type: String,
          enum: ["pending", "accepted"],
          default: "pending",
        },
      },
    ],
    sketches: [
      {
        data: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

export const User = mongoose.models.User || mongoose.model("User", userSchema);
export const Notebook =
  mongoose.models.Notebook || mongoose.model("Notebook", notebookSchema);
