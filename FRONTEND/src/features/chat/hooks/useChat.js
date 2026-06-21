import { useDispatch, useSelector } from "react-redux";
import { initializeSocketConnection, sendMessageSocket } from "../service/chat.socket";
import { getChats, getMessages, deleteChat, updateChatConfig, uploadAttachment, deleteAttachment } from "../service/chat.api";
import {
    setChats,
    removeChat,
    setCurrentChatId,
    addDraftMessage,
    clearDraftMessages,
    setChatConfig,
    setChatAttachments,
    setMessages,
    addMessage,
    setLoading,
    setSending,
    setError,
} from "../chat.slice";

export const useChat = () => {

    const dispatch = useDispatch()
    const { chats, messagesByChat, currentChatId, draftMessages, loading, sending, error } = useSelector((state) => state.chat)

    async function handleGetChats() {
        try {
            dispatch(setLoading(true))
            const data = await getChats()
            dispatch(setChats(data.chats))
        } catch (err) {
            dispatch(setError(err.response?.data?.message || "Failed to load chats"))
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleGetMessages(chatId) {
        try {
            dispatch(setLoading(true))
            const data = await getMessages(chatId)
            dispatch(setMessages({ chatId, messages: data.messages }))
        } catch (err) {
            dispatch(setError(err.response?.data?.message || "Failed to load messages"))
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleSelectChat(chatId) {
        dispatch(setCurrentChatId(chatId))
        dispatch(clearDraftMessages())
        if (!messagesByChat[chatId]) {
            await handleGetMessages(chatId)
        }
    }

    function handleStartNewChat() {
        dispatch(setCurrentChatId(null))
        dispatch(clearDraftMessages())
    }

    function handleSendMessage(message) {
        const chatId = currentChatId
        const optimisticMessage = { role: "user", content: message }

        if (chatId) {
            dispatch(addMessage({ chatId, message: optimisticMessage }))
        } else {
            dispatch(addDraftMessage(optimisticMessage))
        }

        dispatch(setSending(true))
        dispatch(setError(null))

        sendMessageSocket({ chatId, message })
    }

    async function handleUpdateChatConfig(chatId, config) {
        try {
            const data = await updateChatConfig(chatId, config)
            dispatch(setChatConfig({
                chatId,
                activeTools: data.chat.activeTools,
                systemPrompt: data.chat.systemPrompt,
            }))
            return true
        } catch (err) {
            dispatch(setError(err.response?.data?.message || "Failed to update chat settings"))
            return false
        }
    }

    async function handleUploadAttachment(chatId, file) {
        try {
            const data = await uploadAttachment(chatId, file)
            dispatch(setChatAttachments({ chatId, attachments: data.chat.attachments }))
            return true
        } catch (err) {
            dispatch(setError(err.response?.data?.message || "Failed to upload attachment"))
            return false
        }
    }

    async function handleDeleteAttachment(chatId, attachmentId) {
        try {
            const data = await deleteAttachment(chatId, attachmentId)
            dispatch(setChatAttachments({ chatId, attachments: data.chat.attachments }))
            return true
        } catch (err) {
            dispatch(setError(err.response?.data?.message || "Failed to remove attachment"))
            return false
        }
    }

    async function handleDeleteChat(chatId) {
        try {
            await deleteChat(chatId)
            dispatch(removeChat(chatId))
            if (currentChatId === chatId) {
                dispatch(setCurrentChatId(null))
            }
        } catch (err) {
            dispatch(setError(err.response?.data?.message || "Failed to delete chat"))
        }
    }

    return {
        chats,
        messagesByChat,
        currentChatId,
        draftMessages,
        loading,
        sending,
        error,
        handleGetChats,
        handleGetMessages,
        handleSelectChat,
        handleStartNewChat,
        handleSendMessage,
        handleDeleteChat,
        handleUpdateChatConfig,
        handleUploadAttachment,
        handleDeleteAttachment,
        initializeSocketConnection,
    }

}
