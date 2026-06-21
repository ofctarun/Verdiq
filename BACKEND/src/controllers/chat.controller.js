import multer from "multer";
import { generateResponse, generateChatTitle } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js"
import messageModel from "../models/message.model.js";
import userModel from "../models/user.model.js";
import { checkMessageLimit } from "../middleware/rateLimit.middleware.js";
import { extractPdfText } from "../utils/pdf.util.js";

const MAX_ATTACHMENTS_PER_CHAT = 3;
const MAX_ATTACHMENT_TEXT_LENGTH = 15000;

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype !== "application/pdf") {
            return cb(new Error("Only PDF files are allowed"));
        }
        cb(null, true);
    },
});

export function uploadMiddleware(req, res, next) {
    upload.single("file")(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message || "Upload failed", success: false });
        }
        next();
    });
}

export async function sendMessage(req, res) {

    const { message, chat: chatId } = req.body;

    const allowed = await checkMessageLimit(req.user.id);
    if (!allowed) {
        return res.status(429).json({
            message: "Daily message limit reached. Try again tomorrow.",
            success: false,
        });
    }

    let title = null, chat = null;

    if (!chatId) {
        title = await generateChatTitle(message);
        const user = await userModel.findById(req.user.id);
        const activeTools = user?.githubUsername ? ["web_search", "github"] : ["web_search"];

        chat = await chatModel.create({
            user: req.user.id,
            title,
            activeTools,
        })
    } else {
        chat = await chatModel.findOne({ _id: chatId, user: req.user.id })
        if (!chat) {
            return res.status(404).json({
                message: "Chat not found",
                success: false,
            })
        }
    }

    const userMessage = await messageModel.create({
        chat: chatId || chat._id,
        content: message,
        role: "user"
    })

    const messages = await messageModel.find({ chat: chatId || chat._id }).sort({ createdAt: 1 })

    const { text, toolsUsed } = await generateResponse(messages, {
        userId: req.user.id,
        activeTools: chat.activeTools,
        systemPrompt: chat.systemPrompt,
        attachments: chat.attachments,
    });

    const aiMessage = await messageModel.create({
        chat: chatId || chat._id,
        content: text,
        role: "ai",
        toolsUsed,
    })


    res.status(201).json({
        title,
        chat,
        aiMessage
    })

}

export async function getChats(req, res) {
    const user = req.user

    const chats = await chatModel.find({ user: user.id })

    res.status(200).json({
        message: "Chats retrieved successfully",
        chats
    })
}

export async function getMessages(req, res) {
    const { chatId } = req.params;

    const chat = await chatModel.findOne({
        _id: chatId,
        user: req.user.id
    })

    if (!chat) {
        return res.status(404).json({
            message: "Chat not found"
        })
    }

    const messages = await messageModel.find({
        chat: chatId
    })

    res.status(200).json({
        message: "Messages retrieved successfully",
        messages
    })
}

export async function deleteChat(req, res) {

    const { chatId } = req.params;

    const chat = await chatModel.findOneAndDelete({
        _id: chatId,
        user: req.user.id
    })

    await messageModel.deleteMany({
        chat: chatId
    })

    if (!chat) {
        return res.status(404).json({
            message: "Chat not found"
        })
    }

    res.status(200).json({
        message: "Chat deleted successfully"
    })
}

export async function uploadAttachment(req, res) {
    const { chatId } = req.params;

    if (!req.file) {
        return res.status(400).json({
            message: "No file uploaded",
            success: false,
        });
    }

    const chat = await chatModel.findOne({ _id: chatId, user: req.user.id });
    if (!chat) {
        return res.status(404).json({
            message: "Chat not found",
            success: false,
        });
    }

    if (chat.attachments.length >= MAX_ATTACHMENTS_PER_CHAT) {
        return res.status(400).json({
            message: `Maximum of ${MAX_ATTACHMENTS_PER_CHAT} attachments per chat`,
            success: false,
        });
    }

    let text;
    try {
        text = await extractPdfText(req.file.buffer);
    } catch {
        return res.status(400).json({
            message: "Could not read this PDF. It may be corrupted or password-protected.",
            success: false,
        });
    }

    if (!text) {
        return res.status(400).json({
            message: "No extractable text found in this PDF",
            success: false,
        });
    }

    chat.attachments.push({
        filename: req.file.originalname,
        textContent: text.slice(0, MAX_ATTACHMENT_TEXT_LENGTH),
    });

    await chat.save();

    res.status(201).json({
        message: "Attachment added",
        success: true,
        chat,
    });
}

export async function deleteAttachment(req, res) {
    const { chatId, attachmentId } = req.params;

    const chat = await chatModel.findOneAndUpdate(
        { _id: chatId, user: req.user.id },
        { $pull: { attachments: { _id: attachmentId } } },
        { returnDocument: "after" }
    );

    if (!chat) {
        return res.status(404).json({
            message: "Chat not found",
            success: false,
        });
    }

    res.status(200).json({
        message: "Attachment removed",
        success: true,
        chat,
    });
}

export async function updateChatConfig(req, res) {
    const { chatId } = req.params;
    const { activeTools, systemPrompt } = req.body;

    const update = {};
    if (Array.isArray(activeTools)) {
        update.activeTools = activeTools.filter((tool) =>
            ["web_search", "github", "calculator"].includes(tool)
        );
    }
    if (typeof systemPrompt === "string") {
        update.systemPrompt = systemPrompt.slice(0, 500);
    }

    const chat = await chatModel.findOneAndUpdate(
        { _id: chatId, user: req.user.id },
        update,
        { returnDocument: "after" }
    );

    if (!chat) {
        return res.status(404).json({
            message: "Chat not found",
            success: false,
        })
    }

    res.status(200).json({
        message: "Chat config updated",
        success: true,
        chat,
    })
}
