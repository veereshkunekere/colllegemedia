
# Project: Unified Social App

This repository contains three related apps for a social/chat/tweet-style project:

- `backend/` — Express API and sockets server
- `frontend/` — Web React (Vite) client
- `mobfrontend/` — Mobile (Expo / React Native) client

## Quick start

Prerequisites: Node.js (16+), npm or yarn, and optionally Expo CLI for the mobile app.

1. Backend

```bash
cd backend
npm install
# review package.json scripts, then run:
# npm run dev   or   npm start
# or start directly:
# node main.js
```

Environment: create a `.env` file in `backend/` with values required by the server (database URI, JWT secret, Cloudinary keys, email creds). See `backend/main.js` and `backend/util` for used variables.

2. Frontend (Web)

```bash
cd frontend
npm install
npm run dev
```

This is a Vite React app. Open the URL shown by the dev server (typically `http://localhost:5173`).

3. Mobile client (`mobfrontend`)

```bash
cd mobfrontend
npm install
# If using Expo:
npm run start
# or: expo start
```

## Project structure (top-level)

- `backend/` — API, routers, controllers, models, middleware
- `frontend/` — web client (Vite + React)
- `mobfrontend/` — mobile client (Expo / React Native)

Each subproject contains its own `package.json` and README-like files. Look inside each folder for more details.

## Notes
- When moving files or renaming folders, update imports accordingly. I updated several imports in `frontend/src` during a recent pass.
- To run the full stack locally, start the backend first, then the web/mobile clients and point their API base URL to the backend server.

## Contributing

1. Fork the repo or create a new branch.
2. Make changes and add tests where applicable.
3. Open a pull request with a clear description.

## Contact
If you want me to also generate READMEs for each subproject (`backend/`, `frontend/`, `mobfrontend/`), tell me which one to start with.
