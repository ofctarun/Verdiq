import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import { generateResponse, generateChatTitle } from "../services/ai.service.js";

export function registerChatHandlers(socket) {
    socket.on("send-message", async ({ chatId, message }) => {
        try {
            let actualChatId = chatId;

            if (!chatId) {
                const title = await generateChatTitle(message);
                const chat = await chatModel.create({
                    user: socket.user.id,
                    title,
                });
                actualChatId = chat._id.toString();
                socket.emit("chat-created", chat);
            }

            await messageModel.create({
                chat: actualChatId,
                content: message,
                role: "user",
            });

            const messages = await messageModel.find({ chat: actualChatId }).sort({ createdAt: 1 });

            const result = await generateResponse(messages);

            const aiMessage = await messageModel.create({
                chat: actualChatId,
                content: result,
                role: "ai",
            });

            socket.emit("message-received", { chatId: actualChatId, message: aiMessage });
        } catch (err) {
            console.error(err);
            socket.emit("chat-error", { message: "Failed to process message" });
        }
    });
}
