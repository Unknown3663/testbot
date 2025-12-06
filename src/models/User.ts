import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  userId: string;
  guildId: string;
  balance: number;
  LastDaily: Date | null;
}

const userSchema = new Schema<IUser>({
  userId: {
    type: String,
    required: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  LastDaily: {
    type: Date,
    default: null,
  },
});

// Create compound unique index to prevent duplicate user entries per guild
userSchema.index({ userId: 1, guildId: 1 }, { unique: true });

export default model<IUser>("User", userSchema);
