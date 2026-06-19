import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    chats: [],
    messagesByChat: {},
    currentChatId: null,
    loading: false,
    sending: false,
    error: null,
}

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        resetChat: () => initialState,
        setChats: (state, action) => {
            state.chats = action.payload
        },
        addChat: (state, action) => {
            state.chats.unshift(action.payload)
        },
        removeChat: (state, action) => {
            const chatId = action.payload
            state.chats = state.chats.filter((chat) => chat._id !== chatId)
            delete state.messagesByChat[chatId]
        },
        setCurrentChatId: (state, action) => {
            state.currentChatId = action.payload
        },
        setMessages: (state, action) => {
            const { chatId, messages } = action.payload
            state.messagesByChat[chatId] = messages
        },
        addMessage: (state, action) => {
            const { chatId, message } = action.payload
            if (!state.messagesByChat[chatId]) {
                state.messagesByChat[chatId] = []
            }
            state.messagesByChat[chatId].push(message)
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        setSending: (state, action) => {
            state.sending = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
        },
    },
})

export const {
    resetChat,
    setChats,
    addChat,
    removeChat,
    setCurrentChatId,
    setMessages,
    addMessage,
    setLoading,
    setSending,
    setError,
} = chatSlice.actions

export default chatSlice.reducer
