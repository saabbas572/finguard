# FinGuard — Financial Crime Scenario Builder

A full-stack monorepo application for defining custom alert scenarios, 
processing transactions through a rule-based pipeline, and investigating 
flagged activity in real time.

> Currently in development — Day 1 of build log below.

---

## Author

Built by **Syed Aaqil Abbas**  
MASc Software Engineering — Memorial University of Newfoundland

- Portfolio: [syedaaqilabbas.vercel.app](https://syedaaqilabbas.vercel.app)  
- GitHub: [github.com/saabbas572](https://github.com/saabbas572)

---

## Planned Stack

React · TypeScript · Redux Toolkit · Vite · Node.js · Express · 
MongoDB · Python · FastAPI · Docker · Sentry · AWS · GitHub Actions

---

## Architecture Diagram

![FinGuard Architecture](docs/Architecture.png)

The diagram illustrates the FinGuard monorepo architecture. The React frontend in `client/vite-project` communicates with the Express backend under `server`, while the `pipeline` directory is reserved for the future Python transaction-processing service. MongoDB stores user and alert data, and Docker is used to compose the frontend, backend, and database services. The diagram also highlights external integrations for monitoring, auth, and data pipelines at a high level.

---

## Development Log

### Day 1 — Monorepo Scaffold & Project Initialization
**Date:** June 10, 2026

Initialized the monorepo using npm workspaces with `client` and `server` 
workspaces and a `pipeline` directory reserved for the Python service. 
Added `concurrently` at the root to run both services in parallel with 
a single command.

Scaffolded the client using Vite with the React TypeScript + SWC template. 
Installed Redux Toolkit, React Router, and Axios.

Scaffolded the server with Express, Mongoose, JWT, bcrypt, dotenv, and cors. 
Configured TypeScript with `ts-node` and `nodemon` for development.

Created `docker-compose.yml` to orchestrate MongoDB, the Node.js backend 
on port 5000, and the React frontend on port 3000.

**Libraries added today:** `react`, `react-dom`, `typescript`, `vite`, 
`@vitejs/plugin-react-swc`, `@reduxjs/toolkit`, `react-redux`, 
`react-router-dom`, `axios`, `express`, `mongoose`, `jsonwebtoken`, 
`bcryptjs`, `dotenv`, `cors`, `ts-node`, `nodemon`, `concurrently`

**Next:** MongoDB connection, User model, first auth route (`/api/auth/register`)

### Day 2 — Auth API + MongoDB Integration
**Date:** June 11, 2026

Connected the Express backend to MongoDB using `mongoose` and environment-based URI configuration. Added a `User` model with `name`, `email`, hashed `password`, `role`, and timestamps.

Implemented `/api/auth/register` and `/api/auth/login` routes with password hashing via `bcryptjs`, JWT issuance with `jsonwebtoken`, and controller logic for registration and login.

Added `/health` for service readiness, plus server startup configuration with `dotenv`, `cors`, and JSON body parsing.

**Completed today:** Backend auth flow, database integration, user schema, register/login controllers, and API routing.

**Next:** Frontend auth flows, protected routes, Redux auth slice, and scenario builder UI.