import { Schema, model, Document } from "mongoose";

export interface IAutoRole extends Document {
  guildId: string;
  roleId: string;
}

const autoRoleSchema = new Schema<IAutoRole>({
  guildId: {
    type: String,
    required: true,
    unique: true,
  },
  roleId: {
    type: String,
    required: true,
  },
});

export default model<IAutoRole>("AutoRole", autoRoleSchema);
