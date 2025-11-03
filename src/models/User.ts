import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  walletAddress: string;
  points: number;
  totalWins: number;
  totalLosses: number;
  totalFlips: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    points: {
      type: Number,
      default: 1000, // Starting points for new users
      min: 0,
    },
    totalWins: {
      type: Number,
      default: 0,
    },
    totalLosses: {
      type: Number,
      default: 0,
    },
    totalFlips: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure index on walletAddress for fast lookups
UserSchema.index({ walletAddress: 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

