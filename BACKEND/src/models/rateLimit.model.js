import mongoose from "mongoose";

const rateLimitSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    date: {
        type: String, // YYYY-MM-DD
        required: true,
    },
    messageCount: {
        type: Number,
        default: 0,
    },
    toolCallCount: {
        type: Number,
        default: 0,
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
});

rateLimitSchema.index({ user: 1, date: 1 }, { unique: true });
rateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const rateLimitModel = mongoose.model("RateLimit", rateLimitSchema);

export default rateLimitModel;
