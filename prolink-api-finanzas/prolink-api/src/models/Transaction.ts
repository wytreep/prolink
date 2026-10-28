import { Schema, model, Types } from 'mongoose';

export type TxType = 'income' | 'expense';
export type Bucket = 'needs' | 'wants' | 'savings';

export interface ITransaction {
  userId: Types.ObjectId;
  type: TxType;
  /** Solo aplica a gastos: clasificacion 50/30/20. */
  bucket?: Bucket;
  /** COP en enteros (el peso no se usa con centavos): evita errores de punto flotante. */
  amountCop: number;
  description: string;
  date: Date;
  /** UUID generado en el dispositivo; permite sincronizacion offline idempotente. */
  clientId: string;
}

const txSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    bucket: { type: String, enum: ['needs', 'wants', 'savings'] },
    amountCop: { type: Number, required: true, min: 1, validate: Number.isInteger },
    description: { type: String, required: true, trim: true, maxlength: 120 },
    date: { type: Date, required: true },
    clientId: { type: String, required: true },
  },
  { timestamps: true },
);

txSchema.index({ userId: 1, clientId: 1 }, { unique: true });
txSchema.index({ userId: 1, date: -1 });

export const Transaction = model<ITransaction>('Transaction', txSchema);
