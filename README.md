# FinGuard — Financial Crime Scenario Builder

> A full-stack monorepo application that enables financial institutions to define custom alert scenarios, process transactions through rule-based pipelines, and investigate flagged financial activity in real time.

Inspired by the architecture of fraud detection platforms, FinGuard is built as a portfolio project to demonstrate production-grade full-stack engineering across a React/TypeScript frontend, Node.js/Express backend, and Python data pipeline — all orchestrated with Docker.

---

## Live Demo

> Coming soon — deploying to AWS (Week 4)

---

## Portfolio & Author

Built by **Syed Aaqil Abbas**
MASc Software Engineering — Memorial University of Newfoundland

- Portfolio: [syedaaqilabbas.vercel.app](https://syedaaqilabbas.vercel.app)
- GitHub: [github.com/saabbas572](https://github.com/saabbas572)

---

## What This Project Does

FinGuard allows compliance teams at financial institutions to create and manage alert scenarios — rule sets that define what constitutes suspicious transaction behavior. When transactions are ingested by the system, the Python pipeline evaluates each one against all active scenarios and flags matches for investigation. Investigators can then review flagged transactions through a real-time dashboard, filter by scenario, severity, or date, and mark cases as resolved or escalated.

This mirrors the core workflow of real-world financial crime management software, where scenario authoring, transaction monitoring, and case investigation are the three pillars of the product.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend Framework | React 18 | Component-based UI rendering |
| Language (Frontend) | TypeScript | Static typing across the frontend |
| Build Tool | Vite + SWC | Fast dev server and production bundler |
| State Management | Redux Toolkit | Global state for scenarios, transactions, auth |
| Routing | React Router v6 | Client-side navigation and protected routes |
| HTTP Client | Axios | API calls from frontend to backend |
| Styling | CSS3 + CSS Variables | Custom design tokens, responsive layout |
| Backend Framework | Express.js | REST API server |
| Language (Backend) | TypeScript + ts-node | Typed Node.js backend |
| Database | MongoDB | NoSQL document store for scenarios and transactions |
| ODM | Mongoose | Schema definitions and database queries |
| Authentication | JSON Web Tokens (JWT) | Stateless auth tokens for protected routes |
| Password Hashing | bcrypt | Secure password storage |
| Pipeline Framework | FastAPI | Python REST API for the data pipeline service |
| Data Validation (Python) | Pydantic | Request/response schema validation in Python |
| Server (Python) | Uvicorn | ASGI server for FastAPI |
| Error Monitoring | Sentry.io | Real-time error tracking on frontend and backend |
| Containerization | Docker | Service isolation and reproducible environments |
| Orchestration | Docker Compose | Multi-service local development environment |
| Process Manager (dev) | Concurrently | Runs frontend and backend in parallel from root |
| CI/CD | GitHub Actions | Automated testing and deployment pipeline |
| Cloud | AWS EC2 / ECS | Production hosting |

---

## Libraries Reference

### Client (`/client`)

| Library | Version | Why It's Used |
|---|---|---|
| `react` | ^18 | Core UI library |
| `react-dom` | ^18 | React DOM renderer |
| `typescript` | ^5 | Static type checking |
| `vite` | ^5 | Build tool and dev server |
| `@vitejs/plugin-react-swc` | ^3 | SWC-powered React fast refresh |
| `@reduxjs/toolkit` | ^2 | Simplified Redux — slices, thunks, store config |
| `react-redux` | ^9 | React bindings for Redux store |
| `react-router-dom` | ^6 | Declarative routing and navigation |
| `axios` | ^1 | Promise-based HTTP client for API calls |
| `@sentry/react` | ^7 | Frontend error monitoring and reporting |

### Server (`/server`)

| Library | Version | Why It's Used |
|---|---|---|
| `express` | ^4 | Minimal web framework for Node.js |
| `mongoose` | ^8 | MongoDB ODM with schema and validation support |
| `jsonwebtoken` | ^9 | JWT creation and verification |
| `bcryptjs` | ^2 | Password hashing before storage |
| `dotenv` | ^16 | Loads environment variables from `.env` files |
| `cors` | ^2 | Cross-origin request handling between client and server |
| `typescript` | ^5 | Type safety across the backend |
| `ts-node` | ^10 | Run TypeScript directly without pre-compiling |
| `nodemon` | ^3 | Auto-restarts server on file changes during development |
| `@types/express` | ^4 | TypeScript type definitions for Express |
| `@types/node` | ^20 | TypeScript type definitions for Node.js built-ins |
| `@types/jsonwebtoken` | ^9 | TypeScript type definitions for JWT |
| `@types/bcryptjs` | ^2 | TypeScript type definitions for bcrypt |
| `@sentry/node` | ^7 | Backend error monitoring and reporting |

### Pipeline (`/pipeline`)

| Library | Version | Why It's Used |
|---|---|---|
| `fastapi` | ^0.110 | Modern Python web framework for the pipeline API |
| `uvicorn` | ^0.29 | ASGI server to run FastAPI in development and production |
| `pydantic` | ^2 | Data validation and serialization for request/response models |
| `pymongo` | ^4 | MongoDB driver for Python to read and write transaction data |
| `python-dotenv` | ^1 | Load environment variables in Python services |
| `sentry-sdk` | ^1 | Error monitoring for the Python pipeline service |

---

## Project Structure

```
finguard/
├── client/                        # React + TypeScript + Redux frontend
│   ├── public/
│   ├── src/
│   │   ├── components/            # Reusable UI components (buttons, cards, forms)
│   │   ├── pages/                 # Route-level page components
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Scenarios.tsx
│   │   │   └── Transactions.tsx
│   │   ├── store/                 # Redux store configuration
│   │   │   ├── index.ts           # Store setup
│   │   │   ├── authSlice.ts       # Auth state (user, token)
│   │   │   ├── scenarioSlice.ts   # Scenario CRUD state
│   │   │   └── transactionSlice.ts # Flagged transaction state
│   │   ├── services/              # Axios API service layer
│   │   │   ├── api.ts             # Axios instance with base URL and interceptors
│   │   │   ├── authService.ts     # Login, register API calls
│   │   │   └── scenarioService.ts # Scenario CRUD API calls
│   │   ├── types/                 # Shared TypeScript interfaces
│   │   │   ├── scenario.ts
│   │   │   └── transaction.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── server/                        # Node.js + Express + TypeScript backend
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts              # MongoDB connection setup
│   │   ├── controllers/           # Route handler logic
│   │   │   ├── authController.ts
│   │   │   └── scenarioController.ts
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts  # JWT verification middleware
│   │   │   └── errorMiddleware.ts # Global error handler
│   │   ├── models/                # Mongoose schema definitions
│   │   │   ├── User.ts
│   │   │   ├── Scenario.ts
│   │   │   └── Transaction.ts
│   │   ├── routes/                # Express route definitions
│   │   │   ├── authRoutes.ts
│   │   │   └── scenarioRoutes.ts
│   │   └── index.ts               # Express app entry point
│   ├── tsconfig.json
│   ├── .env.example
│   └── package.json
│
├── pipeline/                      # Python FastAPI data pipeline
│   ├── engine/
│   │   └── rule_evaluator.py      # Core rule matching logic
│   ├── models/
│   │   └── schemas.py             # Pydantic request/response models
│   ├── main.py                    # FastAPI entry point and route definitions
│   ├── .env.example
│   └── requirements.txt
│
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI/CD pipeline
├── docker-compose.yml             # Orchestrates all services locally
├── .gitignore
├── package.json                   # Root workspace config with concurrently
└── README.md
```

---

## Environment Variables

### Server (`/server/.env`)

```env
PORT=5000
MONGO_URI=mongodb://mongo:27017/finguard
JWT_SECRET=your_jwt_secret_here
SENTRY_DSN=your_sentry_dsn_here
NODE_ENV=development
```

### Pipeline (`/pipeline/.env`)

```env
MONGO_URI=mongodb://mongo:27017/finguard
SENTRY_DSN=your_sentry_dsn_here
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker Desktop
- npm 9+

### Run Locally with Docker

```bash
git clone https://github.com/saabbas572/finguard.git
cd finguard
cp server/.env.example server/.env
cp pipeline/.env.example pipeline/.env
docker-compose up --build
```

The app will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Python Pipeline: http://localhost:8000

### Run Without Docker

```bash
# 1. Install root and workspace dependencies
npm install

# 2. Start frontend and backend together
npm run dev

# 3. In a separate terminal — start the Python pipeline
cd pipeline
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

---

## API Endpoints

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT token |

### Scenarios

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/scenarios` | Get all scenarios for the logged-in user |
| POST | `/api/scenarios` | Create a new scenario |
| PUT | `/api/scenarios/:id` | Update an existing scenario |
| DELETE | `/api/scenarios/:id` | Delete a scenario |

### Transactions (Pipeline)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/evaluate` | Submit a transaction for rule evaluation |
| GET | `/flagged` | Get all flagged transactions |

---

## Core Features

- **Scenario Builder** — Create, edit, and manage custom alert rule sets with conditions based on transaction amount, frequency, account type, and geography
- **Transaction Pipeline** — Python-based engine that ingests mock transaction data and evaluates each record against all active scenarios
- **Flagged Transaction Dashboard** — Real-time view of matches with filtering by scenario, severity, date range, and status
- **Case Management** — Mark flagged transactions as under review, resolved, or escalated
- **Authentication** — JWT-based login and registration with protected routes
- **Error Monitoring** — Sentry integration for real-time error tracking across frontend and backend

---

## Development Log

All sessions documented below. Each entry reflects one day of development including what was built, decisions made, and what comes next.

---

### Day 1 — Monorepo Scaffold & Project Initialization
**Date:** June 10, 2026

Today's session established the foundation of the FinGuard project from scratch. The goal was to get a working monorepo structure in place with all three services defined and ready for development.

A root-level monorepo was initialized using npm workspaces, housing two JavaScript workspaces — `client` and `server` — alongside a `pipeline` directory reserved for the Python service. A `concurrently` dev script was added at the root so both the frontend and backend can be started with a single command.

The `client` workspace was scaffolded using Vite with the React TypeScript + SWC template. SWC is a Rust-based compiler that replaces Babel, providing significantly faster builds and hot reload. Core dependencies were installed including Redux Toolkit for state management, React Router for navigation, and Axios for HTTP requests.

The `server` workspace was initialized as a Node.js project with Express as the web framework, Mongoose for MongoDB integration, and JWT plus bcrypt for authentication. TypeScript was configured for the server with a `tsconfig.json` and `ts-node` for running TypeScript directly in development. `nodemon` was added to auto-restart the server on file changes.

A `docker-compose.yml` was created at the root to orchestrate the full local environment. It defines three services: a MongoDB 6 container with a persistent volume, the Node.js backend on port 5000, and the React frontend on port 3000.

**Libraries introduced today:**
- `react`, `react-dom` — UI rendering
- `typescript` — static typing across both workspaces
- `vite`, `@vitejs/plugin-react-swc` — build tooling with SWC compiler
- `@reduxjs/toolkit`, `react-redux` — state management
- `react-router-dom` — client-side routing
- `axios` — HTTP client
- `express` — backend web framework
- `mongoose` — MongoDB ODM
- `jsonwebtoken`, `bcryptjs` — authentication
- `dotenv` — environment variable loading
- `cors` — cross-origin request handling
- `ts-node`, `nodemon` — TypeScript dev tooling
- `concurrently` — run multiple npm scripts in parallel

**Next session:** Folder structure inside `client` and `server`, MongoDB connection, first Express route (`/api/auth/register`)

---

*More entries will appear here as development continues. Each day adds a new section above this line.*

---

## Roadmap

- [x] Monorepo scaffold with npm workspaces
- [x] Docker Compose for local orchestration
- [x] Vite + SWC client setup with Redux Toolkit
- [x] Express + TypeScript server scaffold
- [ ] MongoDB connection and User model
- [ ] JWT authentication — register and login routes
- [ ] Scenario Builder UI with Redux state
- [ ] REST API for scenario CRUD
- [ ] Python FastAPI pipeline scaffold
- [ ] Rule evaluation engine in Python
- [ ] Flagged transaction dashboard
- [ ] Sentry error monitoring on all three services
- [ ] GitHub Actions CI/CD pipeline
- [ ] AWS deployment

---

## Why This Project

FinGuard was built to demonstrate end-to-end full-stack engineering across a realistic, production-inspired problem domain. Most portfolio projects stop at a CRUD app — this one goes further by combining a TypeScript frontend, a RESTful Node.js API, and a separate Python data processing service, all wired together with Docker and deployed to the cloud. The goal was to build something that reflects the kind of cross-functional technical ownership that senior developer roles actually require: designing systems, making architectural decisions, handling real data pipelines, and shipping with monitoring and CI/CD in place.

---

## License

MIT