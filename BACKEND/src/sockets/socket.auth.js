import jwt from "jsonwebtoken";

function parseCookies(header = "") {
    return header.split(";").reduce((acc, pair) => {
        const index = pair.indexOf("=");
        if (index === -1) return acc;
        const key = pair.slice(0, index).trim();
        const value = pair.slice(index + 1).trim();
        if (key) acc[key] = decodeURIComponent(value);
        return acc;
    }, {});
}

export function authenticateSocket(socket, next) {
    const cookies = parseCookies(socket.handshake.headers.cookie);
    const token = cookies.token;

    if (!token) {
        return next(new Error("Unauthorized"));
    }

    try {
        socket.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) {
        next(new Error("Unauthorized"));
    }
}
