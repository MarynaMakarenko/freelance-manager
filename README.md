# Freelance Manager

A full-featured web application for managing your freelance business — clients, projects, time tracking, invoices, and analytics, all in one place.

---

## Features

### User Features

**Client Management**
- Add, edit, and delete clients with contact details (name, email, phone, company)
- View per-client project history and statistics
- Search clients by name, email, or company

**Project Management**
- Create and manage projects linked to clients
- Track project budget, deadline, and status (Active, Completed, On Hold, Cancelled)
- Archive projects to keep your workspace clean
- Filter by status, client, or search by name

**Task Tracking**
- Add tasks to projects with status columns (To Do, In Progress, Done)
- Toggle task status with a single click
- Start a timer directly from a task

**Time Tracking**
- Start/stop a timer for any task across your projects
- Live elapsed time counter
- Complete session history with project and task context
- Delete individual sessions

**Invoice Management**
- Create invoices with line items (description, quantity, rate — amount calculated automatically)
- Link invoices to clients and projects
- Track invoice status: Draft, Sent, Paid, Overdue
- Send invoices via email (requires SMTP configuration)
- Export invoices as PDF
- Mark invoices as paid with one click

**Analytics Dashboard**
- Income over time: line chart with 7-day, 30-day, and 90-day periods
- Income by client: horizontal bar chart
- Project status distribution: pie chart
- Summary cards: active projects, total clients, expected income, hours this month

**Settings**
- Update profile name and preferred currency
- Change password with current password verification
- Supports 12+ currencies

### Admin Panel

- View all registered users with activity statistics (projects, clients, invoices)
- Block or unblock any user account
- Platform-wide stats: total users, projects, clients, invoices, time sessions
- Accessible only to users with the `ADMIN` role

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database ORM | Prisma |
| Database | PostgreSQL |
| Authentication | JWT (access token 15min + refresh token 7d in httpOnly cookie) |
| Data Fetching | TanStack React Query |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Email | Nodemailer |
| PDF Export | jsPDF |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (local or hosted, e.g., Supabase, Neon, Railway)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/MarynaMakarenko/freelance-manager.git
cd freelance-manager
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

```env
DATABASE_URL="postgresql://user:password@localhost:5432/freelance_manager"
JWT_ACCESS_SECRET="your-strong-random-secret"
JWT_REFRESH_SECRET="your-strong-random-secret-2"

# Optional — for sending invoices via email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your@email.com"
SMTP_PASS="your-app-password"
```

4. **Run database migrations**

```bash
npx prisma migrate dev --name init
npx prisma generate
```

5. **Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/              # Login and registration pages
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # Protected dashboard pages
│   │   ├── dashboard/       # Main overview
│   │   ├── clients/         # Client management
│   │   ├── projects/        # Project list and detail
│   │   ├── timer/           # Time tracking
│   │   ├── invoices/        # Invoice management
│   │   ├── analytics/       # Charts and reports
│   │   └── settings/        # Profile settings
│   ├── admin/               # Admin panel (ADMIN role only)
│   └── api/                 # API route handlers
│       ├── auth/
│       ├── clients/
│       ├── projects/
│       ├── tasks/
│       ├── timer/
│       ├── invoices/
│       ├── analytics/
│       ├── profile/
│       └── admin/
├── components/
│   ├── ui/                  # Reusable UI primitives
│   └── ...                  # Domain components
├── lib/
│   ├── auth.ts              # JWT utilities
│   ├── prisma.ts            # Prisma singleton client
│   ├── getUser.ts           # Request authentication helper
│   └── api.ts               # Client-side API wrapper with auto-refresh
├── middleware.ts             # Route protection
prisma/
└── schema.prisma            # Database schema
```

---

## Screenshots

> Screenshots will be added here after the first deployment.

---

## License

MIT
