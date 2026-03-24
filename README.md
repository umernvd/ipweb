# InterviewPro — AI-Powered Interview Management Platform

A full-stack SaaS web app that lets companies manage their entire interview pipeline — from setting up interviewers and question banks to reviewing AI-scored recordings uploaded from a companion Flutter mobile app.

---

## What it actually does

Companies sign up, get approved by a super admin, then use the dashboard to:

- Manage **interviewers** (create profiles, generate auth codes for mobile login)
- Build a **question bank** per role and experience level
- Let interviewers run interviews on the **mobile app**, which streams audio directly to the company's Google Drive
- Track **candidates** and their interview history

The mobile app talks to this Next.js backend via a set of REST API endpoints that handle JWT verification, Google Drive folder creation, and resumable audio uploads.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Backend/DB | Appwrite (Auth, Database, Teams) |
| State Management | Zustand |
| Cloud Storage | Google Drive API (OAuth2) |
| Forms | React Hook Form + Zod |
| Styling | Tailwind CSS v4 |
| PDF Generation | @react-pdf/renderer |
| CSV Import | PapaParse |

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages + API routes
│   ├── api/
│   │   ├── auth/           # Registration, Google OAuth
│   │   ├── mobile/         # init-upload + finalize-upload (Flutter endpoints)
│   │   ├── interviews/     # Upload handling
│   │   ├── interviewers/   # Create/delete interviewer profiles
│   │   └── questions/      # Random question fetch, bulk import
│   ├── company/            # Company dashboard pages
│   └── super-admin/        # Super admin panel (approvals, companies)
├── core/
│   ├── entities/           # Domain types (Interview, Role, Candidate, etc.)
│   ├── repositories/       # Interfaces + Appwrite implementations
│   ├── services/           # Business logic layer
│   └── di/                 # Dependency injection container
├── modules/                # Feature modules (auth, interviews, interviewers, etc.)
├── stores/                 # Zustand stores
└── shared/                 # Reusable UI components, layout
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- An [Appwrite](https://appwrite.io) project set up with the required collections
- A Google Cloud project with Drive API enabled and OAuth2 credentials

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/interview-pro.git
cd interview-pro
npm install
```

### Environment Variables

Create a `.env.local` file in the root:

```env
APPWRITE_API_KEY=your_appwrite_api_key
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000

ENCRYPTION_KEY=your_32_char_encryption_key
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for production

```bash
npm run build
npm run start
```

---

## Mobile API Endpoints

The Flutter app communicates with two main endpoints:

**`POST /api/mobile/init-upload`**
- Verifies the interviewer's JWT
- Creates candidate/interviewer folders in Google Drive
- Returns a resumable upload URL for the audio file

**`POST /api/mobile/finalize-upload`**
- Called after the audio upload completes
- Logs the interview record into Appwrite with metadata (candidate name, role, level, Drive URL)

Both endpoints require a `Bearer <jwt>` Authorization header from the mobile app's Appwrite session.

---

## Multi-tenant Architecture

Each company gets its own Appwrite **Team** on registration. All database documents are scoped with team-level permissions, so company A can never read company B's data. The super admin account bypasses this for platform-level management.

---

## License

MIT
