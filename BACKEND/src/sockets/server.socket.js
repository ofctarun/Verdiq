import { Server } from "socket.io";
import { authenticateSocket } from "./socket.auth.js";
import { registerChatHandlers } from "./chat.socket.js";


let io;

export function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true,
        }
    })

    io.use(authenticateSocket)

    console.log("Socket.io server is RUNNING")

    io.on("connection", (socket) => {
        console.log("A user connected: " + socket.id)
        registerChatHandlers(socket)
    })
}

export function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized")
    }

    return io
}