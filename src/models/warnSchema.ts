import { Schema, model, Document } from "mongoose";

export interface IWarning extends Document {
  GuildID: string;
  UserID: string;
  UserTag: string;
  Content: any[];
}

const warningSchema = new Schema<IWarning>({
  GuildID: {
    type: String,
    required: true,
  },
  UserID: {
    type: String,
    required: true,
  },
  UserTag: {
    type: String,
    required: true,
  },
  Content: {
    type: Schema.Types.Mixed,
    required: true,
  },
});

export default model<IWarning>("warnSchema", warningSchema);
