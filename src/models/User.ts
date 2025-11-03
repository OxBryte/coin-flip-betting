import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGameHistory {
  result: 'heads' | 'tails';
  selectedSide: 'heads' | 'tails';
  betAmount: number;
  pointsChange: number;
  isWinner: boolean;
  timestamp: Date;
}

export interface IUser extends Document {
  walletAddress: string;
  points: number;
  totalWins: number;
  totalLosses: number;
  totalFlips: number;
  gameHistory: IGameHistory[];
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
    gameHistory: [
      {
        result: {
          type: String,
          enum: ['heads', 'tails'],
          required: true,
        },
        selectedSide: {
          type: String,
          enum: ['heads', 'tails'],
          required: true,
        },
        betAmount: {
          type: Number,
          required: true,
        },
        pointsChange: {
          type: Number,
          required: true,
        },
        isWinner: {
          type: Boolean,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Ensure index on walletAddress for fast lookups
UserSchema.index({ walletAddress: 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;

