import { Schema, model, Document } from "mongoose";

export interface ILevel extends Document {
  userId: string;
  guildId: string;
  xp: number;
  level: number;
}

const levelSchema = new Schema<ILevel>({
  userId: {
    type: String,
    required: true,
  },
  guildId: {
    type: String,
    required: true,
  },
  xp: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 0,
  },
});

export default model<ILevel>("Level", levelSchema);
