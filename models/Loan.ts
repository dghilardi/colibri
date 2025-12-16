import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILoan extends Document {
  bookId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate?: Date; // If returned
  dueDate?: Date; // Optional, if we want to enforce return dates
  status: 'ACTIVE' | 'RETURNED';
  createdAt: Date;
  updatedAt: Date;
}

const LoanSchema = new Schema<ILoan>(
  {
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    dueDate: { type: Date },
    status: { type: String, enum: ['ACTIVE', 'RETURNED'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

const Loan: Model<ILoan> = mongoose.models.Loan || mongoose.model<ILoan>("Loan", LoanSchema);
export default Loan;
