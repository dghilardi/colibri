import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWishlistRequest extends Document {
  isbn: string;
  libraryTarget: string;
  requestedBy: mongoose.Types.ObjectId;
  meta: {
    title?: string;
    author?: string;
    cover?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const WishlistRequestSchema = new Schema<IWishlistRequest>(
  {
    isbn: { type: String, required: true },
    libraryTarget: { type: String, required: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    meta: {
      title: String,
      author: String,
      cover: String,
    },
  },
  { timestamps: true }
);

const WishlistRequest: Model<IWishlistRequest> = mongoose.models.WishlistRequest || mongoose.model<IWishlistRequest>("WishlistRequest", WishlistRequestSchema);
export default WishlistRequest;
