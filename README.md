# CodeSync – Real-Time Coding Interview Practice Platform

CodeSync is a production-ready real-time collaborative coding platform designed for interview preparation, mock interviews, programming contests, and shared workspace problem-solving. It integrates a live shared Monaco Editor, socket-based real-time state synchronization, live chat, participant tracking, and sandboxed online code execution via the Judge0 API.

## Core Features

- **Real-Time Monaco Editor Collaboration**: Multiple users can edit the same editor simultaneously, complete with synchronized typing, selections, and remote cursors showing other users' actions.
- **Judge0 Code Execution**: Compile and execute solutions across C++, Java, Python, and JavaScript. Falls back to a mock local runner if API keys are not provided.
- **Interactive Problem Panel**: View problem statements, constraints, difficulty labels, tags, and custom examples in a dedicated pane.
- **Synchronized Chat & Typing Statuses**: Group discussion area inside rooms with live typing indicators.
- **Interview & Observation Mode**: Securely interview candidates. The interviewer has access to candidate observers, activity tracking timestamps, and observer logs.
- **Coding Contests**: Compete under countdown-timed limits. Registered candidates submit solutions and climb live leaderboards.
- **Profile & Socials**: Displays overall solved ratios, rating progressions, friend invitations, and synced GitHub profile credentials.

---

## Directory Structure

```
codesync/
├── backend/                  # Node.js + Express.js + Socket.IO server
│   ├── src/
│   │   ├── config/           # Database config & seed scripts
│   │   ├── controllers/      # Route controllers (Auth, Room, Problems, Code, Contests, Interviews)
│   │   ├── middleware/       # Protect verification & error catch middlewares
│   │   ├── models/           # Mongoose Database schemas
│   │   ├── routes/           # REST API endpoints mapping
│   │   ├── sockets/          # Socket.IO handlers for code-sync, cursors, chat
│   │   └── utils/            # Judge0 API compiler client
│   └── server.js             # Main server setup file
└── frontend/                 # React + Vite + Tailwind CSS client
    ├── src/
    │   ├── components/       # UI Components (Navbar, Footer, ProtectedRoute, Alert, ThemeToggle)
    │   ├── context/          # Context Providers (Auth, Socket, Theme)
    │   ├── pages/            # View Pages (Landing, Login, Register, Dashboard, Workspace, Contests, Profile, Interview Logs)
    │   ├── utils/            # Axios API config & language template mappings
    │   └── App.jsx           # Routes glue
```

---

## Database Schemas

### 1. User
- `name` (String): Full display name.
- `email` (String): Verified unique email.
- `password` (String): Hashed password.
- `avatar` (String): Dicebear avatar seed.
- `rating` (Number): ELO ranking points (default: 1500).
- `solvedProblems` (Array): References to solved Problem IDs.
- `friends` / `friendRequests` (Arrays): Social list references.

### 2. Room
- `roomId` (String): Short 8-character unique room invite code.
- `name` (String): Room title.
- `owner` (ObjectId): Room host.
- `participants` (Array): Connected members.
- `currentCode` (Map): Codes stored per language.
- `selectedLanguage` (String): Code editor language.

### 3. Problem
- `title` (String): Problem title.
- `description` (String): Problem details.
- `difficulty` (String): Easy, Medium, or Hard.
- `examples` / `testCases` (Arrays): Structured public examples and hidden execution inputs.

---

## Installation & Setup

### Requirements
- Node.js (v18+)
- MongoDB (running locally or a MongoDB Atlas URI)

### Backend Setup
1. Open a terminal inside the `backend/` folder.
2. Create your `.env` configuration file (copying `.env.example`):
   ```bash
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/codesync
   JWT_SECRET=codesync_secret_key_123
   CLIENT_URL=http://localhost:5173
   ```
3. Install node packages:
   ```bash
   npm install
   ```
4. Run the database seeders to populate initial problem sets and contests:
   ```bash
   node src/config/seed.js
   node src/config/seedContests.js
   ```
5. Boot the Express server:
   ```bash
   # Development Mode (uses nodemon)
   npm run dev
   
   # Production Mode
   npm start
   ```

### Frontend Setup
1. Open a terminal inside the `frontend/` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the client application:
   ```bash
   npm run dev
   ```
4. Navigate to `http://localhost:5173` in your browser.

---

## Socket Events Reference

| Event Name | Type | Payload | Description |
|---|---|---|---|
| `join-room` | Client -> Server | `{ roomId, user }` | Joins a room, registers socket connection, returns room state. |
| `leave-room` | Client -> Server | `{ roomId, user }` | Leaves a room, broadcasts disconnect. |
| `code-change` | Client -> Server | `{ roomId, code, language, user }` | Syncs editor changes across room members. |
| `cursor-move` | Client -> Server | `{ roomId, position, user }` | Synchronizes typing cursor coordinates. |
| `chat-message`| Client -> Server | `{ roomId, message, user }` | Persists message to DB, broadcasts to room. |
| `typing` | Client -> Server | `{ roomId, isTyping, user }` | Triggers typing overlay bubble. |

---

## Production Deployment Guide

### Deploying the Backend (e.g. Render, Heroku)
1. Commit the repository to GitHub.
2. Create a Node.js web service on your provider.
3. Configure Environment Variables in the provider dashboard:
   - Set `NODE_ENV=production`
   - Set `MONGO_URI` to your MongoDB Atlas connection string.
   - Set `JWT_SECRET` to a strong unique string.
   - Set `CLIENT_URL` to your deployed frontend domain.
4. Set the Build Command to `npm install` and Start Command to `npm start`.

### Deploying the Frontend (e.g. Vercel, Netlify)
1. Link your frontend directory to Vercel/Netlify.
2. Configure Environment Variables:
   - Set `VITE_API_URL` to your deployed backend URL (e.g. `https://codesync-api.onrender.com/api`).
   - Set `VITE_SOCKET_URL` to your deployed backend domain (e.g. `https://codesync-api.onrender.com`).
3. Set Build Command to `npm run build` and Output Directory to `dist`.
