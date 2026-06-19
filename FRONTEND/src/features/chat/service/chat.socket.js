import { io } from "socket.io-client";
import { store } from "../../../app/app.store";
import { API_BASE_URL } from "../../../config/api.config";
import { resolveDraftChat, addMessage, setSending, setError } from "../chat.slice";

let socket = null;

function attachListeners(s) {
    s.on("connect", () => {
        console.log("Connected to Socket.IO server")
    })

    s.on("connect_error", (err) => {
        console.error("Socket.IO connection error:", err.message)
    })

    s.on("chat-created", (chat) => {
        store.dispatch(resolveDraftChat(chat))
    })

    s.on("message-received", ({ chatId, message }) => {
        store.dispatch(addMessage({ chatId, message }))
        store.dispatch(setSending(false))
    })

    s.on("chat-error", ({ message }) => {
        store.dispatch(setError(message || "Something went wrong"))
        store.dispatch(setSending(false))
    })
}

function getSocket() {
    if (!socket) {
        socket = io(API_BASE_URL, {
            withCredentials: true,
        })
        attachListeners(socket)
    }
    return socket
}

export const initializeSocketConnection = () => getSocket()

export function sendMessageSocket({ chatId, message }) {
    getSocket().emit("send-message", { chatId, message })
}
