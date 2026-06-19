import { useDispatch, useSelector } from "react-redux";
import { initializeSocketConnection } from "../service/chat.socket";
import { getChats, getMessages, sendMessage, deleteChat } from "../service/chat.api";
import {
    setChats,
    addChat,
    removeChat,
    setCurrentChatId,
    setMessages,
    addMessage,
    setLoading,
    setSending,
    setError,
} from "../chat.slice";

export const useChat = () => {

    const dispatch = useDispatch()
    const { chats, messagesByChat, currentChatId, loading, sending, error } = useSelector((state) => state.chat)

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
        if (!messagesByChat[chatId]) {
            await handleGetMessages(chatId)
        }
    }

    function handleStartNewChat() {
        dispatch(setCurrentChatId(null))
    }

    async function handleSendMessage(message) {
        const chatId = currentChatId

        if (chatId) {
            dispatch(addMessage({ chatId, message: { role: "user", content: message } }))
        }

        try {
            dispatch(setSending(true))
            dispatch(setError(null))

            const data = await sendMessage({ message, chatId })

            if (!chatId && data.chat) {
                dispatch(addChat(data.chat))
                dispatch(setCurrentChatId(data.chat._id))
                dispatch(setMessages({
                    chatId: data.chat._id,
                    messages: [
                        { role: "user", content: message },
                        data.aiMessage,
                    ],
                }))
            } else {
                dispatch(addMessage({ chatId, message: data.aiMessage }))
            }

            return true
        } catch (err) {
            dispatch(setError(err.response?.data?.message || "Failed to send message"))
            return false
        } finally {
            dispatch(setSending(false))
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
        loading,
        sending,
        error,
        handleGetChats,
        handleGetMessages,
        handleSelectChat,
        handleStartNewChat,
        handleSendMessage,
        handleDeleteChat,
        initializeSocketConnection,
    }

}
