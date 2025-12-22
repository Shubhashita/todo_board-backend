const mongoose = require("mongoose");

const labelSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["bin"],
        },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Prevent duplicate label names per user
labelSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Label", labelSchema);
