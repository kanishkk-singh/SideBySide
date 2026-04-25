# SideBySide

> **See both sides. Think better.**

A structured debate platform where every topic is split into Side A and Side B — displayed visually side by side. Arguments are scored on logic, evidence, and fact-checks — never popularity.

---

## Project Structure

```
sidebyside/
├── backend/          # Node.js + Express + MongoDB API
└── frontend/         # React + Vite SPA
```

---

## Quick Start

### 1. Backend

```bash
cd backend
npm install

# Copy env file and fill in your values
cp .env.example .env
# → Set MONGO_URI, JWT_SECRET, CLIENT_URL

npm run dev        # starts on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev        # starts on http://localhost:5173
```

The Vite dev server proxies `/api/*` → `localhost:5000` automatically.

---

## Environment Variables (backend/.env)

| Variable           | Description                                         |
|--------------------|-----------------------------------------------------|
| `PORT`             | Server port (default 5000)                         |
| `MONGO_URI`        | MongoDB connection string (Atlas or local)          |
| `JWT_SECRET`       | Long random string for signing tokens               |
| `JWT_EXPIRE`       | Token expiry e.g. `7d`                              |
| `CLIENT_URL`       | Frontend origin for CORS e.g. `http://localhost:5173` |
| `NODE_ENV`         | `development` or `production`                       |

---

## Seed Topics (run once after setup)

Open MongoDB shell or Compass and insert into the `topics` collection:

```js
db.topics.insertMany([
  { name: "Technology & AI", slug: "technology-ai", description: "Debates about artificial intelligence, software, and digital society.", icon: "⬡", color: "#1A5EFF", debateCount: 0, isActive: true },
  { name: "Politics & Policy", slug: "politics-policy", description: "Government, law, elections, and public policy debates.", icon: "◎", color: "#FF6B1A", debateCount: 0, isActive: true },
  { name: "Science & Health", slug: "science-health", description: "Medicine, research, environment, and health policy.", icon: "◈", color: "#22D96B", debateCount: 0, isActive: true },
  { name: "Society & Culture", slug: "society-culture", description: "Social issues, ethics, education, and cultural topics.", icon: "◑", color: "#FFB020", debateCount: 0, isActive: true },
  { name: "Economics", slug: "economics", description: "Markets, trade, labour, and economic policy.", icon: "◇", color: "#1A5EFF", debateCount: 0, isActive: true },
  { name: "Philosophy & Ethics", slug: "philosophy-ethics", description: "Moral dilemmas, philosophical questions, and ethical frameworks.", icon: "⚖", color: "#FF6B1A", debateCount: 0, isActive: true }
])
```

---

## API Reference

### Auth
| Method | Endpoint            | Auth | Description        |
|--------|---------------------|------|--------------------|
| POST   | /api/auth/register  | —    | Create account     |
| POST   | /api/auth/login     | —    | Login              |
| GET    | /api/auth/me        | ✓    | Get current user   |

### Debates
| Method | Endpoint                 | Auth    | Description              |
|--------|--------------------------|---------|--------------------------|
| GET    | /api/debates             | optional| List / search debates    |
| GET    | /api/debates/:id         | optional| Get single debate        |
| POST   | /api/debates             | ✓       | Create debate            |
| POST   | /api/debates/:id/vote    | ✓       | Cast vote (Side A or B)  |

### Arguments
| Method | Endpoint                        | Auth | Description              |
|--------|---------------------------------|------|--------------------------|
| GET    | /api/arguments?debateId=        | —    | Get arguments for debate |
| POST   | /api/arguments                  | ✓    | Post argument            |
| POST   | /api/arguments/:id/factcheck    | ✓    | Fact-check an argument   |
| POST   | /api/arguments/:id/report       | ✓    | Report an argument       |
| DELETE | /api/arguments/:id              | ✓    | Delete (own or admin)    |

### Topics
| Method | Endpoint      | Auth  | Description       |
|--------|---------------|-------|-------------------|
| GET    | /api/topics   | —     | List all topics   |
| POST   | /api/topics   | admin | Create topic      |

### Users
| Method | Endpoint            | Auth | Description        |
|--------|---------------------|------|--------------------|
| GET    | /api/users/:username| —    | Get public profile |
| PATCH  | /api/users/me       | ✓    | Update own profile |

---

## Design System

| Color   | Meaning                          |
|---------|----------------------------------|
| 🔵 Blue  | Side A — always                 |
| 🟠 Orange| Side B — always                 |
| 🟢 Green | Argument quality: Strong        |
| 🟡 Amber | Argument quality: Moderate      |
| 🔴 Red   | Argument quality: Weak          |

Green and red are **never** used for Side A or Side B — only for quality scoring.

---

## Argument Strength Score

Each side's score (0–100) is computed from all its arguments:

| Factor           | Max Points | How                                            |
|------------------|------------|------------------------------------------------|
| Logic clarity    | 30         | Content length in sweet spot (50–500 chars)    |
| Evidence         | 30         | At least one source URL provided               |
| Fact-check score | 40         | Net correct fact-checks (correct − false) × 10 |

Score is recalculated automatically whenever an argument is posted, deleted, or fact-checked.

---

## Deployment

### Backend → Railway / Render / Fly.io
```bash
cd backend && npm start
```
Set all env vars in platform dashboard.

### Frontend → Vercel / Netlify
```bash
cd frontend && npm run build
# deploy dist/ folder
# set VITE_API_URL if not using proxy
```

---

## Philosophy

SideBySide is a **decision-support system**, not a truth machine.

- No algorithm-driven feeds
- No popularity votes
- No winners declared — only argument quality scored
- Votes hidden until user picks a side (anti-anchoring-bias)
- Color carries strict semantic meaning — never decorative
