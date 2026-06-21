import { Router } from "express";
import { connect, callback, disconnect, status } from "../controllers/github.controller.js";
import { authUser } from "../middleware/auth.middleware.js";

const githubRouter = Router();

/**
 * @route GET /api/github/connect
 * @desc Redirect to GitHub OAuth consent screen
 * @access Private
 */
githubRouter.get("/connect", authUser, connect);

/**
 * @route GET /api/github/callback
 * @desc Handle GitHub OAuth callback, exchange code for token
 * @access Public (identifies user via signed state param, not session cookie)
 */
githubRouter.get("/callback", callback);

/**
 * @route POST /api/github/disconnect
 * @desc Disconnect GitHub account
 * @access Private
 */
githubRouter.post("/disconnect", authUser, disconnect);

/**
 * @route GET /api/github/status
 * @desc Get current GitHub connection status
 * @access Private
 */
githubRouter.get("/status", authUser, status);

export default githubRouter;
