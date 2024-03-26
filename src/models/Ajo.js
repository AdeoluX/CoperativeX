const mongoose = require("mongoose");

const { Schema } = mongoose;

const AjoSchema = new Schema(
  {
    monthlyContribution: {
      type: Number,
      required: true,
    },
    name: String,
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      default: "monthly",
    },
    numberOfMonths: {
      type: Number,
      required: true,
    },
    roundsGone: {
      type: Number,
    },
    memberPositions: [
      {
        member: {
          type: Schema.Types.ObjectId,
          ref: "Member",
          required: true,
        },
        creator: {
          type: Boolean,
          default: false,
        },
        position: {
          type: Number,
        },
      },
    ],
    nextBillingData: {
      collector: {
        type: Schema.Types.ObjectId,
        ref: "Member",
      },
      date: {
        type: Date,
      },
    },
    status: {
      type: String,
      enum: ["lobby", "ongoing", "ended"],
      default: "lobby",
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

function generateNumberArray(n) {
  // Check if n is a positive integer
  if (typeof n !== "number" || !Number.isInteger(n) || n < 1) {
    throw new Error(
      "Input must be a positive integer greater than or equal to 1"
    );
  }

  // Generate the array of numbers from 1 to n
  const result = [];
  for (let i = 1; i <= n; i++) {
    result.push(i);
  }
  return result;
}

AjoSchema.virtual("slotsLeft").get(function () {
  const value =
    Number(this.numberOfMonths) - Number(this.memberPositions.length);
  return value;
});

AjoSchema.virtual("availablePositions").get(function () {
  const possiblePositions = generateNumberArray(Number(this.numberOfMonths));
  const takenPositions = this.memberPositions.map((val) => val.position);
  const vacantPositions = [];
  for (let item of possiblePositions) {
    if (!takenPositions.includes(item)) {
      vacantPositions.push(item);
    }
  }
  return vacantPositions;
});

AjoSchema.virtual("completed").get(function () {
  if (this.roundsGone === this.numberOfMonths) {
    return true;
  } else {
    return false;
  }
});

const Ajo = mongoose.model("Ajo", AjoSchema);

module.exports = Ajo;
