# EventSphere — Event Publishing and Discovery Platform

> A production-minded full-stack web application where authorized organizers can create, publish, and manage tech events, and the public can discover, view, share, and register for events.

---

## 🌟 Overview & Core Modules

1. **Public Event Discovery & Listing**
   - Live full-text search across titles, summaries, descriptions, and technology tags.
   - Category filtering (Artificial Intelligence, Cloud & DevOps, Web Development, Cybersecurity, Mobile, Data Science, etc.).
   - Format filtering (`ONLINE` live streaming vs `IN_PERSON` physical venues).
   - Date range sorting (`Upcoming First`, `Newest Added`, `Alphabetical`).
   - Strict public privacy: Public visitors can view **only** `PUBLISHED` events; draft events are never visible.

2. **Event Details Page (`/events/:slug`)**
   - Clean, SEO-friendly slugged URLs (e.g. `/events/global-ai-llm-systems-summit-2026`).
   - High-resolution cover images with fallback handling.
   - Comprehensive event breakdown: agenda, key takeaways, target audience, venue or online stream indicator.
   - Date and time formatting with explicit timezone awareness.
   - Verified organizer profile card.

3. **Shareable Event URLs & 1-Click Copy**
   - Instant 1-click clipboard copy with visual animated checkmark and toast confirmation.
   - Integrated sharing dialog with shortcuts for X (Twitter), LinkedIn, and WhatsApp.
   - Native Web Share API trigger (`navigator.share`) for mobile devices.

4. **External Registration Integration**
   - Dedicated "Register Now" call-to-action.
   - Transparent security modal informing attendees of redirection to the verified external ticketing/registration URL (`rel="noopener noreferrer"`).

5. **Organizer & Admin Authentication**
   - Secure cookie-based JWT sessions (`httpOnly`, `sameSite: 'lax'`, `secure` in production) with fallback Authorization Bearer header support.
   - Robust password hashing using `bcryptjs` with 10 salt rounds.
   - No sensitive data exposure: Password hashes, JWT secrets, and internal tokens are stripped from all API responses.
   - 1-click quick-fill demo credentials on the login page for rapid technical interview evaluation.

6. **Event Creation, Editing & Draft Management**
   - Comprehensive creation and editing forms with live URL slug preview generator.
   - Format-conditional validation: In-person events require a physical venue address; Online events require a streaming/meeting URL.
   - Interactive technology & topics tag chip adder.
   - Draft vs Published lifecycle: Organizers can save events in `DRAFT` mode and publish live when ready.
   - Authorization rules:
     - Organizers can edit and delete **only their own** events.
     - Admins have elevated platform privileges to manage and edit **all** events.
     - Unauthenticated access to creation or modification routes is blocked with HTTP 401/403.

7. **Backend Validation & Robust Error Handling**
   - Strict schema validation using **Zod** across request bodies, query params, and URL params.
   - Frontend validation mirrors backend Zod schemas; never trusts client-side input alone.
   - Chronological validation: End date & time must strictly occur after start date & time.
   - Centralized error-handling middleware returning standardized JSON responses.

8. **Automated Testing Suite**
   - Built with **Vitest** and **Supertest** covering 26 automated unit & integration tests.
   - 100% test pass rate across auth flows, event discovery, draft isolation, permissions, and input validation.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, React Router 6 |
| **Styling** | Tailwind CSS 3, Lucide React, Glassmorphic Design System |
| **Backend** | Node.js (v22+), Express, TypeScript |
| **Database & ORM** | PostgreSQL, Prisma ORM (with in-memory persistence fallback for zero-friction local testing) |
| **Validation** | Zod |
| **Authentication** | JSON Web Tokens (JWT), `httpOnly` secure cookies, `bcryptjs` |
| **Automated Testing** | Vitest, Supertest |

---

## 📂 Repository File Structure

```
g:/Event_Promotion/
├── package.json                   # Root package runner with concurrently scripts
├── .gitignore                     # Excludes node_modules, build dist, env secrets, logs
├── .env.example                   # Clean placeholder environment variables
├── README.md                      # Comprehensive project documentation
│
├── server/                        # Express API Backend
│   ├── prisma/
│   │   ├── schema.prisma          # PostgreSQL Prisma schema (Event, User, Enums, Indexes)
│   │   └── seed.ts                # Database seed script for initial users & events
│   ├── src/
│   │   ├── config/                # Environment variables & constants
│   │   │   └── index.ts
│   │   ├── controllers/           # HTTP Request & Response handlers
│   │   │   ├── authController.ts
│   │   │   └── eventController.ts
│   │   ├── middleware/            # Auth, Zod Validation, Error handlers
│   │   │   ├── authMiddleware.ts
│   │   │   ├── validationMiddleware.ts
│   │   │   └── errorHandler.ts
│   │   ├── routes/                # Express API Route definitions
│   │   │   ├── authRoutes.ts
│   │   │   ├── eventRoutes.ts
│   │   │   └── index.ts
│   │   ├── schemas/               # Zod validation schemas
│   │   │   ├── authSchema.ts
│   │   │   └── eventSchema.ts
│   │   ├── services/              # Core business logic & authorization rules
│   │   │   ├── authService.ts
│   │   │   └── eventService.ts
│   │   ├── utils/                 # DB abstraction, JWT, slugify
│   │   │   ├── db.ts              # Resilient DB access layer (Prisma + fallback)
│   │   │   ├── jwt.ts
│   │   │   ├── prisma.ts
│   │   │   └── slugify.ts
│   │   ├── app.ts                 # Express application configuration
│   │   └── server.ts              # HTTP listener
│   ├── tests/                     # Automated Vitest & Supertest suites
│   │   ├── auth.test.ts           # 8 Auth integration tests
│   │   └── events.test.ts         # 18 Event CRUD & authorization tests
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   └── package.json
│
└── client/                        # React Frontend
    ├── public/
    ├── src/
    │   ├── api/                   # API client & endpoint bindings
    │   │   ├── client.ts
    │   │   ├── authApi.ts
    │   │   └── eventApi.ts
    │   ├── components/
    │   │   ├── common/            # Navbar, Footer, Button, Badge, Modal, Toast
    │   │   │   ├── Navbar.tsx
    │   │   │   ├── Footer.tsx
    │   │   │   ├── Button.tsx
    │   │   │   ├── Badge.tsx
    │   │   │   ├── Modal.tsx
    │   │   │   ├── LoadingSpinner.tsx
    │   │   │   └── EmptyState.tsx
    │   │   ├── events/            # EventCard, EventFilter, ShareModal, RegistrationModal, EventForm
    │   │   │   ├── EventCard.tsx
    │   │   │   ├── EventFilter.tsx
    │   │   │   ├── EventForm.tsx
    │   │   │   ├── ShareModal.tsx
    │   │   │   └── RegistrationModal.tsx
    │   │   └── layout/
    │   │       ├── AppLayout.tsx
    │   │       └── ProtectedRoute.tsx
    │   ├── context/
    │   │   ├── AuthContext.tsx    # User session, login, logout, refresh
    │   │   └── ToastContext.tsx   # Global toast notifications
    │   ├── pages/                 # Route pages
    │   │   ├── HomePage.tsx       # Event discovery, filters, search
    │   │   ├── EventDetailPage.tsx# Slugged event details, share, register
    │   │   ├── LoginPage.tsx      # Sign in with 1-click test credentials
    │   │   ├── RegisterPage.tsx   # Organizer registration
    │   │   ├── DashboardPage.tsx  # Organizer event management & metrics
    │   │   ├── CreateEventPage.tsx# Event creation form
    │   │   ├── EditEventPage.tsx  # Event editing form
    │   │   └── NotFoundPage.tsx   # 404 handler
    │   ├── types/
    │   │   └── index.ts
    │   ├── utils/
    │   │   └── date.ts
    │   ├── App.tsx
    │   ├── index.css
    │   └── main.tsx
    ├── index.html
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── tsconfig.json
    ├── vite.config.ts
    └── package.json
```

---

## 🗄️ Data Model

### `User` Model
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id @default(uuid())` | Primary key |
| `name` | `String` | | Full name |
| `email` | `String` | `@unique @index` | Lowercase unique email |
| `passwordHash` | `String` | | Bcrypt hash (never returned via API) |
| `role` | `Enum (Role)` | `@default(ORGANIZER)` | `ADMIN` or `ORGANIZER` |
| `createdAt` | `DateTime` | `@default(now())` | Creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Last update timestamp |

### `Event` Model
| Field | Type | Attributes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `String` | `@id @default(uuid())` | Primary key |
| `title` | `String` | | Event headline |
| `slug` | `String` | `@unique @index` | URL-safe slug |
| `summary` | `String` | | Short summary for cards and previews |
| `description` | `String` | `@db.Text` | Comprehensive markdown/text description |
| `imageUrl` | `String` | | Cover photo URL |
| `category` | `String` | `@index` | Event domain (e.g. AI, Cloud, Web) |
| `technologies` | `String[]` | | List of technology and topic tags |
| `startDateTime` | `DateTime` | `@index` | Chronological start date & time |
| `endDateTime` | `DateTime` | | Chronological end date & time (strictly > start) |
| `timezone` | `String` | `@default("UTC")` | Timezone (e.g. `America/New_York`, `UTC`) |
| `venue` | `String?` | | Required when format is `IN_PERSON` |
| `onlineUrl` | `String?` | | Required when format is `ONLINE` |
| `format` | `Enum (Format)` | `@default(ONLINE) @index` | `ONLINE` or `IN_PERSON` |
| `targetAudience` | `String` | | Target personas (e.g. Senior Backend Engineers) |
| `registrationUrl`| `String` | | External ticket/registration portal |
| `status` | `Enum (Status)` | `@default(DRAFT) @index` | `DRAFT` or `PUBLISHED` |
| `organizerId` | `String` | `@index` | Foreign key referencing `User.id` |
| `createdAt` | `DateTime` | `@default(now())` | Creation timestamp |
| `updatedAt` | `DateTime` | `@updatedAt` | Last update timestamp |

---

## 🔑 Pre-Seeded Interview Test Accounts

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Organizer** | `alex@devconf.org` | `OrganizerPass123!` | Create, edit, publish/unpublish, and delete own events |
| **Organizer** | `elena@cloudsummit.tech` | `OrganizerPass123!` | Manages own cloud events |
| **Admin** | `admin@eventsphere.io` | `AdminPass123!` | Full moderation access across all events |

*(You can also use the 1-click quick-fill buttons located directly on the `/login` screen).*

---

## ⚙️ Environment Variables

### `server/.env` (or root `.env.example`)
```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/eventsphere?schema=public"
JWT_SECRET="super-secret-production-grade-key-eventsphere-auth-token-2026"
JWT_EXPIRES_IN="7d"
COOKIE_SECRET="cookie-secret-signature-eventsphere-2026"
```

---

## 🚀 Running the Application

### 1. Install Dependencies
Run from the repository root:
```bash
# In server directory
cd server
npm install

# In client directory
cd ../client
npm install
```

### 2. Run Automated Tests
Execute the Vitest & Supertest automated test suite:
```bash
cd server
npm run test
```
All 26 tests will run and pass:
```
✓ tests/events.test.ts (18 tests)
✓ tests/auth.test.ts (8 tests)
Test Files  2 passed (2)
     Tests  26 passed (26)
```

### 3. Database Setup (PostgreSQL)
When running with a local PostgreSQL server or Docker container:
```bash
cd server
npm run db:push
npm run db:seed
```
*Note: If PostgreSQL is not active, EventSphere automatically switches to its built-in in-memory persistent database layer seeded with identical real events, so you can test the application immediately with zero configuration.*

### 4. Start the Application
Start the backend API and frontend dev server:

**Option A — Run Both Concurrently from Root:**
```bash
npm run dev
```

**Option B — Run in Separate Terminals:**
- **Terminal 1 (Backend API):**
  ```bash
  cd server
  npm run dev
  # Server starts on http://localhost:5000
  ```
- **Terminal 2 (Frontend Client):**
  ```bash
  cd client
  npm run dev
  # Vite frontend starts on http://localhost:5173
  ```

Open your browser at **`http://localhost:5173`** to use the application.

---

## 🛡️ Common Security and Quality Standards

### 1. Backend Input Validation & Error Messaging
- **Zero Frontend Trust**: All incoming requests are strictly validated on the server using **Zod** schemas before reaching controllers or database services.
- **Cross-Field Chronological Checks**:
  - The backend validates that `endDateTime` is strictly after `startDateTime`.
  - Format-specific dependencies: `IN_PERSON` requires a non-empty `venue`; `ONLINE` requires a valid URL in `onlineUrl`.
- **Standardized Error Responses**:
  Validation failures return HTTP 400 with a structured field-by-field breakdown:
  ```json
  {
    "success": false,
    "message": "Validation failed for incoming request data.",
    "errors": [
      {
        "field": "endDateTime",
        "message": "End date & time must be strictly after start date & time"
      },
      {
        "field": "venue",
        "message": "Venue is required for in-person events"
      }
    ]
  }
  ```
- **Prisma & Resource Error Handling**:
  - Unique constraint violations (e.g. duplicate email or slug collision) return HTTP 409 Conflict.
  - Missing entities return HTTP 404 Not Found.
  - Stack traces and sensitive internal database details are suppressed in API responses.

### 2. Secrets Management & Environment Hygiene
- **Placeholder Values Only**: Both root `.env.example` and `server/.env.example` contain strictly sanitized placeholder strings. No real API keys, database credentials, or secret hashes are committed to version control.
- **Git Exclusion**: Root `.gitignore` explicitly excludes all `.env`, `.env.local`, `.env.*.local`, `*.pem`, `node_modules`, and build artifacts.
- **Environment Isolation**: Runtime configuration is centralized through a single configuration module (`server/src/config/index.ts`).

### 3. Modular, Readable & Testable Architecture
- **Single Responsibility Principle**:
  - `routes/`: Routing and route-level middleware binding.
  - `controllers/`: HTTP protocol translation, status codes, and cookie management.
  - `services/`: Business rules, authorization policies, and database operations.
  - `schemas/`: Pure validation schemas and inferred TypeScript types.
  - `middleware/`: Cross-cutting concerns (authentication, RBAC role guard, request validation, error formatting).
  - `client/src/components/`: Atomic, reusable UI components (`Badge`, `Button`, `Modal`, `EventCard`, `EventFilter`, `EventForm`).
- **Testability**: The Express app instance (`server/src/app.ts`) is decoupled from the HTTP server listener (`server/src/server.ts`), allowing Supertest to execute tests fast in-memory without binding live ports.

---

## ⚠️ Known Limitations & What Would Need to Change for Production

While EventSphere meets all assignment and technical interview specifications, deploying to an enterprise, high-scale production environment requires the following enhancements:

### 1. Cloud Database & Connection Pooling
- **Current**: Direct connection to PostgreSQL via Prisma with an in-memory fallback for local zero-dependency review.
- **Production Requirement**:
  - Deploy a managed PostgreSQL cluster (e.g., AWS RDS Aurora, Neon, or Supabase) with Multi-AZ redundancy and automated point-in-time recovery (PITR).
  - Implement a connection pooler like **PgBouncer** or **Prisma Accelerate** to handle tens of thousands of concurrent client connections without exhausting database socket limits.

### 2. Media & Asset Storage (S3 / CDN)
- **Current**: Event cover images use direct external URLs (e.g. Unsplash).
- **Production Requirement**:
  - Implement an authenticated media upload service with presigned S3 / Cloudflare R2 upload URLs.
  - Integrate an image processing pipeline (e.g. `sharp` on AWS Lambda) to generate responsive WebP thumbnails and strip EXIF metadata.
  - Serve assets via a Global CDN (Cloudflare or AWS CloudFront) with aggressive edge caching headers.

### 3. Session Management & Refresh Token Rotation
- **Current**: Single JWT token stored in an `httpOnly` secure cookie expiring after 7 days.
- **Production Requirement**:
  - Migrate to a dual-token architecture: Short-lived access tokens (15 minutes) paired with rotating refresh tokens stored in **Redis**.
  - Provides instant session revocation upon password reset, account suspension, or logout.

### 4. Rate Limiting & DDoS Protection
- **Current**: Standard Express middleware without request throttling.
- **Production Requirement**:
  - Integrate `express-rate-limit` backed by Redis to protect `/api/auth/login`, `/api/auth/register`, and `/api/events` creation endpoints from brute-force and scraping.
  - Place the platform behind Cloudflare WAF for volumetric DDoS mitigation, bot management, and TLS termination.

### 5. Email Verification & Password Recovery
- **Current**: Direct registration without email verification; no forgot-password flow.
- **Production Requirement**:
  - Integrate transactional email services (Resend, SendGrid, or AWS SES) for email address verification.
  - Implement cryptographically signed, single-use password reset tokens with a 15-minute expiration window.

### 6. Full-Text Search Scaling
- **Current**: Case-insensitive substring matching and PostgreSQL `contains` / `has` queries.
- **Production Requirement**:
  - At millions of events, transition to PostgreSQL `tsvector` with GIN indexing or a dedicated search cluster (e.g. Meilisearch, Algolia, or Elasticsearch) to support fuzzy typo-tolerance, geo-distance searching, and relevance ranking.

### 7. Observability & APM
- **Current**: Standard console logging.
- **Production Requirement**:
  - Structured JSON logging using **Pino** or **Winston**.
  - Application Performance Monitoring (APM) via **OpenTelemetry** and **Sentry** for real-time error tracking and alerting.
