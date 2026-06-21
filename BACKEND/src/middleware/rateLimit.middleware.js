import rateLimitModel from "../models/rateLimit.model.js";

function todayString() {
    return new Date().toISOString().slice(0, 10);
}

async function checkAndIncrement(userId, field, limit) {
    const doc = await rateLimitModel.findOneAndUpdate(
        { user: userId, date: todayString() },
        { $inc: { [field]: 1 } },
        { upsert: true, returnDocument: "after" }
    );

    return doc[field] <= limit;
}

export async function checkMessageLimit(userId) {
    const limit = Number(process.env.FREE_TIER_DAILY_MESSAGE_LIMIT) || 50;
    return checkAndIncrement(userId, "messageCount", limit);
}

export async function checkToolCallLimit(userId) {
    const limit = Number(process.env.FREE_TIER_DAILY_TOOL_CALL_LIMIT) || 30;
    return checkAndIncrement(userId, "toolCallCount", limit);
}
