import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import userModel from "../models/user.model.js";
import { generateResponse, generateChatTitle } from "../services/ai.service.js";
import { checkMessageLimit } from "../middleware/rateLimit.middleware.js";

export function registerChatHandlers(socket) {
    socket.on("send-message", async ({ chatId, message }) => {
        try {
            const allowed = await checkMessageLimit(socket.user.id);
            if (!allowed) {
                socket.emit("chat-error", { message: "Daily message limit reached. Try again tomorrow." });
                return;
            }

            let actualChatId = chatId;
            let chat;

            if (!chatId) {
                const title = await generateChatTitle(message);
                const user = await userModel.findById(socket.user.id);
                const activeTools = user?.githubUsername
                    ? ["web_search", "github"]
                    : ["web_search"];

                chat = await chatModel.create({
                    user: socket.user.id,
                    title,
                    activeTools,
                });
                actualChatId = chat._id.toString();
                socket.emit("chat-created", chat);
            } else {
                chat = await chatModel.findOne({ _id: chatId, user: socket.user.id });
                if (!chat) {
                    socket.emit("chat-error", { message: "Chat not found" });
                    return;
                }
            }

            await messageModel.create({
                chat: actualChatId,
                content: message,
                role: "user",
            });

            const messages = await messageModel.find({ chat: actualChatId }).sort({ createdAt: 1 });

            const { text, toolsUsed } = await generateResponse(messages, {
                userId: socket.user.id,
                activeTools: chat.activeTools,
                systemPrompt: chat.systemPrompt,
                attachments: chat.attachments,
            });

            const aiMessage = await messageModel.create({
                chat: actualChatId,
                content: text,
                role: "ai",
                toolsUsed,
            });

            socket.emit("message-received", { chatId: actualChatId, message: aiMessage });
        } catch (err) {
            console.error(err);
            socket.emit("chat-error", { message: "Failed to process message" });
        }
    });
}
