import { Types } from "mongoose";
import { ObjectId, Schema, model, models } from "mongoose";

export interface IDocument {
  _id: ObjectId;
  userId: Types.ObjectId;
  title: string;
  description: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      required: true,
      type: String,
    },
    description: {
      required: true,
      type: String,
    },
    category: {
      required: true,
      type: String,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true }, collection: "Documents" }
);

export const DocumentModel =
  models?.DocumentModel || model("DocumentModel", documentSchema);
