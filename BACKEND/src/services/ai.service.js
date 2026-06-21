import { ChatMistralAI } from "@langchain/mistralai"
import { HumanMessage, SystemMessage, AIMessage, tool, createAgent } from "langchain";
import * as z from "zod";
import { searchInternet } from "./internet.service.js";
import { getRepoHealth, listUserRepos } from "./tools/githubTool.js";
import { evaluateExpression } from "./tools/calculatorTool.js";
import { checkToolCallLimit } from "../middleware/rateLimit.middleware.js";
import userModel from "../models/user.model.js";
import { decrypt } from "../utils/crypto.util.js";

const mistralModel = new ChatMistralAI({
    model: "mistral-medium-latest",
    apiKey: process.env.MISTRAL_API_KEY
})

const titleModel = new ChatMistralAI({
    model: "mistral-medium-latest",
    apiKey: process.env.MISTRAL_API_KEY,
    maxTokens: 20,
})

const TOOL_KEY_BY_NAME = {
    searchInternet: "web_search",
    githubRepoHealth: "github",
    calculator: "calculator",
};

function buildTools({ userId, activeTools }) {
    const tools = [];

    if (activeTools.includes("web_search")) {
        tools.push(tool(
            async (input) => {
                const allowed = await checkToolCallLimit(userId);
                if (!allowed) return "Tool call limit reached for today. Try again tomorrow.";
                return searchInternet(input);
            },
            {
                name: "searchInternet",
                description: "Use this tool to get the latest information from the internet.",
                schema: z.object({
                    query: z.string().describe("The search query to look up on the internet.")
                })
            }
        ));
    }

    if (activeTools.includes("github")) {
        tools.push(tool(
            async ({ owner, repo }) => {
                const allowed = await checkToolCallLimit(userId);
                if (!allowed) return "Tool call limit reached for today. Try again tomorrow.";

                const user = await userModel.findById(userId).select("+githubAccessToken");
                if (!user?.githubAccessToken) {
                    return "GitHub is not connected for this user. Ask them to connect their GitHub account first.";
                }

                let token;
                try {
                    token = decrypt(user.githubAccessToken);
                } catch {
                    return "GitHub connection is invalid. Ask the user to reconnect GitHub.";
                }

                try {
                    if (!owner || !repo) {
                        return await listUserRepos({ token });
                    }
                    return await getRepoHealth({ owner, repo, token });
                } catch (err) {
                    if (err.status === 401) {
                        user.githubAccessToken = null;
                        user.githubId = null;
                        user.githubUsername = null;
                        user.githubConnectedAt = null;
                        await user.save();
                        return "GitHub access was revoked. Please reconnect GitHub.";
                    }
                    return `Failed to fetch GitHub repo info: ${err.message}`;
                }
            },
            {
                name: "githubRepoHealth",
                description: "Use this tool for GitHub. Call it with no owner/repo to list the user's own repositories (name, stars, language, last updated). Call it with owner+repo to get one specific repository's health: stars, forks, open/closed issue counts, issue close ratio, last commit date, days since last commit, and contributor count.",
                schema: z.object({
                    owner: z.string().optional().describe("The GitHub repository owner or organization name. Omit together with repo to list the user's own repositories instead."),
                    repo: z.string().optional().describe("The GitHub repository name. Omit together with owner to list the user's own repositories instead."),
                })
            }
        ));
    }

    if (activeTools.includes("calculator")) {
        tools.push(tool(
            async ({ expression }) => {
                const allowed = await checkToolCallLimit(userId);
                if (!allowed) return "Tool call limit reached for today. Try again tomorrow.";
                return evaluateExpression({ expression });
            },
            {
                name: "calculator",
                description: "Use this tool for any numeric computation — cost comparisons, sums, percentages, ratios, etc. Never compute math yourself; always call this tool. Pass a math expression as a string, e.g. '(100 * 1.2) / 30'.",
                schema: z.object({
                    expression: z.string().describe("A math expression to evaluate.")
                })
            }
        ));
    }

    return tools;
}

const BASE_INSTRUCTIONS = `
    You are a helpful and precise assistant for answering questions.
    If you don't know the answer, say you don't know.
    If the question requires up-to-date information, use the "searchInternet" tool.
    If the question is about the user's GitHub repositories (listing them) or a specific repository's health or activity, use the "githubRepoHealth" tool.
    If the question requires a numeric computation, use the "calculator" tool rather than computing it yourself.
`;

export async function generateResponse(messages, { userId, activeTools = ["web_search"], systemPrompt = "", attachments = [] } = {}) {

    const tools = buildTools({ userId, activeTools });
    const agent = createAgent({ model: mistralModel, tools });

    let systemMessageText = systemPrompt
        ? `${BASE_INSTRUCTIONS}\n\nAdditional instructions from the user for this conversation:\n${systemPrompt}`
        : BASE_INSTRUCTIONS;

    if (attachments.length > 0) {
        const attachmentsText = attachments
            .map((a) => `--- Document: ${a.filename} ---\n${a.textContent}`)
            .join("\n\n");
        systemMessageText += `\n\nThe user has attached the following document(s) to this conversation. Use their content to answer questions when relevant, and say so explicitly when you do:\n\n${attachmentsText}`;
    }

    const response = await agent.invoke({
        messages: [
            new SystemMessage(systemMessageText),
            ...(messages.map(msg => {
                if (msg.role == "user") {
                    return new HumanMessage(msg.content)
                } else if (msg.role == "ai") {
                    return new AIMessage(msg.content)
                }
            })) ]
    });

    const finalMessage = response.messages[response.messages.length - 1];

    const toolsUsed = response.messages
        .filter((m) => typeof m._getType === "function" && m._getType() === "tool" && m.status !== "error")
        .map((m) => ({
            tool: TOOL_KEY_BY_NAME[m.name] || m.name,
            summary: String(m.content).slice(0, 200),
        }))
        .filter((entry) => entry.tool);

    return { text: finalMessage.text, toolsUsed };

}

export async function generateChatTitle(message) {

    const response = await titleModel.invoke([
        new SystemMessage(`
            You are a helpful assistant that generates concise and descriptive titles for chat conversations.

            User will provide you with the first message of a chat conversation, and you will generate a title that captures the essence of the conversation in 2-4 words. The title should be clear, relevant, and engaging, giving users a quick understanding of the conversation's topic.
        `),
        new HumanMessage(`
            Generate a title for a chat conversation based on the following first message:
            "${message}"
            `)
    ])

    return response.text;

}
