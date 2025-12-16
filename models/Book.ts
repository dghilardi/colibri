import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBook extends Document {
  isbn: string;
  library: string;
  title: string;
  author: string;
  coverUrl?: string;
  description?: string;
  status: 'AVAILABLE' | 'BORROWED';
  currentLoan?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new Schema<IBook>(
  {
    isbn: { type: String, required: true, index: true },
    library: { type: String, required: true, index: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    coverUrl: { type: String },
    description: { type: String },
    status: { type: String, enum: ['AVAILABLE', 'BORROWED'], default: 'AVAILABLE' },
    currentLoan: { type: Schema.Types.ObjectId, ref: 'Loan' },
  },
  { timestamps: true }
);

const Book: Model<IBook> = mongoose.models.Book || mongoose.model<IBook>("Book", BookSchema);
export default Book;
