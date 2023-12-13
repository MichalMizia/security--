import { Schema, model, models } from "mongoose";
const bcrypt = require("bcrypt");

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
  { collection: "Users", timestamps: { createdAt: true, updatedAt: false } }
);

UserSchema.methods.comparePassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = models?.User || model("User", UserSchema);

export interface UserType {
  _id: string;
  emailVerified: boolean;
  username: string;
  email: string;
  password: string;
  image?: string;
}

export type IUser = UserType;

export default User;
