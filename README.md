# Verdiq

Verdiq is a full-stack AI chat assistant that gives real, computed answers instead of guesses — backed by tool use for live web search, GitHub repository health, and precise math, with PDF context and per-conversation custom personas.

## Features

- **Real-time chat** over Socket.IO, with chat history persisted in MongoDB
- **Tool-using AI agent** (LangChain + Mistral) that can:
  - Search the web for up-to-date information (Tavily)
  - Inspect a connected GitHub account's repositories or a specific repo's health (stars, issues, contributors, last commit)
  - Evaluate math expressions with a calculator tool instead of guessing
- **PDF attachments** — upload a document and ask questions about its contents
- **Custom system prompts** per conversation to steer the assistant's tone/behavior
- **Authentication** via email/password (with email verification through Resend) and GitHub OAuth, secured with JWT
- **Per-user rate limiting** on daily messages and tool calls

## Tech stack

**Frontend** — React 19, Vite, Redux Toolkit, React Router, Tailwind CSS, Socket.IO client, Motion (animations), Lenis (smooth scroll)

**Backend** — Node.js, Express 5, MongoDB/Mongoose, Socket.IO, LangChain (`@langchain/mistralai`, `@langchain/google-genai`), Tavily, JWT auth, Resend (email), Multer + pdf-parse (PDF uploads)

## Project structure

```
.
├── FRONTEND/   # React + Vite single-page app
└── BACKEND/    # Express API + Socket.IO server
```

## Getting started

### Prerequisites

- Node.js 18+
- A MongoDB instance (local or Atlas)
- API keys for Mistral, Tavily, Resend, and GitHub OAuth credentials (see below)

### Backend

```bash
cd BACKEND
npm install
npm run dev
```

Create a `.env` file in `BACKEND/` with:

```
PORT=
BACKEND_URL=
MONGO_URI=
JWT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
GOOGLE_USER=
GEMINI_API_KEY=
MISTRAL_API_KEY=
TAVILY_API_KEY=
CLIENT_URL=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_OAUTH_CALLBACK_URL=
TOKEN_ENCRYPTION_KEY=
FREE_TIER_DAILY_MESSAGE_LIMIT=
FREE_TIER_DAILY_TOOL_CALL_LIMIT=
RESEND_API_KEY=
```

### Frontend

```bash
cd FRONTEND
npm install
npm run dev
```

Configure the API base URL for the backend in `FRONTEND/src/config/api.config.js` (or via environment variables, depending on your deployment).

## Deployment

- The frontend is set up for Vercel (`FRONTEND/vercel.json`), serving the Vite build output as a single-page app.
- The backend is designed to run on a service like Render; a GitHub Actions workflow (`.github/workflows/keep-alive.yml`) pings it periodically to prevent cold starts on free-tier hosting.

## License

ISC
