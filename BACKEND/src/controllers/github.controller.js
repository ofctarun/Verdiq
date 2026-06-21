import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";
import { encrypt } from "../utils/crypto.util.js";

const GITHUB_OAUTH_SCOPE = "read:user";

export function connect(req, res) {
    const state = jwt.sign(
        { purpose: "github-oauth", userId: req.user.id },
        process.env.JWT_SECRET,
        { expiresIn: "10m" }
    );

    const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID,
        redirect_uri: process.env.GITHUB_OAUTH_CALLBACK_URL,
        scope: GITHUB_OAUTH_SCOPE,
        state,
    });

    res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
}

export async function callback(req, res) {
    const { code, state } = req.query;
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    let userId;
    try {
        const decoded = jwt.verify(state, process.env.JWT_SECRET);
        if (decoded.purpose !== "github-oauth") {
            throw new Error("Invalid state purpose");
        }
        userId = decoded.userId;
    } catch (err) {
        return res.redirect(`${clientUrl}/dashboard?github=error`);
    }

    try {
        const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code,
                redirect_uri: process.env.GITHUB_OAUTH_CALLBACK_URL,
            }),
        });

        const tokenData = await tokenRes.json();

        if (!tokenData.access_token) {
            return res.redirect(`${clientUrl}/dashboard?github=error`);
        }

        const profileRes = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
                Accept: "application/vnd.github+json",
                "User-Agent": "devlens-app",
            },
        });

        const profile = await profileRes.json();

        await userModel.findByIdAndUpdate(userId, {
            githubId: String(profile.id),
            githubUsername: profile.login,
            githubAccessToken: encrypt(tokenData.access_token),
            githubConnectedAt: new Date(),
        });

        return res.redirect(`${clientUrl}/dashboard?github=connected`);
    } catch (err) {
        console.error("GitHub OAuth callback failed:", err);
        return res.redirect(`${clientUrl}/dashboard?github=error`);
    }
}

export async function disconnect(req, res) {
    await userModel.findByIdAndUpdate(req.user.id, {
        githubId: null,
        githubUsername: null,
        githubAccessToken: null,
        githubConnectedAt: null,
    });

    res.status(200).json({
        message: "GitHub disconnected",
        success: true,
    });
}

export async function status(req, res) {
    const user = await userModel.findById(req.user.id);

    res.status(200).json({
        connected: Boolean(user?.githubUsername),
        username: user?.githubUsername || null,
    });
}
