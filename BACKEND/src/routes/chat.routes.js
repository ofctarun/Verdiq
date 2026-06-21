import { Router } from 'express';
import {
    sendMessage,
    getChats,
    getMessages,
    deleteChat,
    updateChatConfig,
    uploadMiddleware,
    uploadAttachment,
    deleteAttachment,
} from "../controllers/chat.controller.js";
import { authUser } from "../middleware/auth.middleware.js";

const chatRouter = Router();


chatRouter.post("/message", authUser, sendMessage)

chatRouter.get("/", authUser, getChats)

chatRouter.get("/:chatId/messages", authUser, getMessages)

chatRouter.delete("/delete/:chatId", authUser, deleteChat)

chatRouter.patch("/:chatId/config", authUser, updateChatConfig)

chatRouter.post("/:chatId/attachments", authUser, uploadMiddleware, uploadAttachment)

chatRouter.delete("/:chatId/attachments/:attachmentId", authUser, deleteAttachment)

export default chatRouter;