# Task Timer App

A Kanban-style task management dashboard built with Next.js and TypeScript. Tasks move through four lifecycle stages — Inbox, Pending, In Progress, and Done — while the app automatically tracks how long each task spends in every stage.

## Features

- Kanban board with four columns: Inbox, Pending, In Progress, and Done
- Automatic time tracking per status with human-readable duration display (seconds, minutes, hours)
- Subtask checklist per task with individual completion toggling
- Inline title editing directly on the board
- Real-time clock display in the sidebar
- Optimistic UI updates: changes appear instantly while syncing to the backend in the background
- Dual persistence: tasks are saved to browser localStorage and synced to MongoDB on mount, so the board works offline and recovers data when connectivity is restored
- Conflict resolution on sync: the app reconciles local and remote state based on creation timestamp and time log count

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Animation:** Framer Motion
- **3D Background:** Spline (`@splinetool/react-spline`)
- **Icons:** Heroicons
- **Database:** MongoDB (via the native driver)
- **State management:** React hooks (`useState`, `useEffect`, `useCallback`, `useRef`)
- **Local persistence:** `localStorage` via a custom `useLocalStorage` hook

## Project Structure

```
src/
  app/
    api/tasks/route.ts   # REST API: GET, POST, PATCH, DELETE
    page.tsx             # Entry point
    layout.tsx
  components/
    TodoDashboard.tsx    # Main board layout
    TaskColumn.tsx       # Single status column
    TaskCard.tsx         # Individual task card with timer and subtasks
    TaskInput.tsx        # New task creation field
    HeroBanner.tsx       # Top header
    SplineBackground.tsx # Animated 3D background
    SplineCard.tsx       # Spline scene wrapper
  hooks/
    useTasks.ts          # Core state + sync logic
    useTaskApi.ts        # HTTP calls to /api/tasks
    useLocalStorage.ts   # Typed localStorage hook
  types/
    task.ts              # Task, TimeLog, SubItem, TaskStatus types
  utils/
    timeTracker.ts       # getTimeLogs, formatDuration, formatDate
  lib/
    mongodb.ts           # Shared MongoDB client promise
```

## Getting Started

### Prerequisites

- Node.js 18 or later
- A MongoDB Atlas cluster (or any MongoDB instance)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/SarahiCruzAguirre/task-timer-app-user-story.git
cd task-timer-app-user-story
```

2. Copy the environment file and add your connection string:

```bash
cp .env.local.example .env.local
```

```env
MONGODB_URI="mongodb+srv://user:password@cluster.mongodb.net/myDatabase?retryWrites=true&w=majority"
```

3. Install dependencies and start the development server:

```bash
npm install
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

If you prefer not to configure MongoDB, the board works entirely from browser localStorage — no environment variable is required for basic use.

## API Endpoints

All endpoints are under `/api/tasks`.

| Method   | Description                                |
|----------|--------------------------------------------|
| `GET`    | Retrieve all tasks sorted by creation date |
| `POST`   | Create a new task                          |
| `PATCH`  | Update a task by `id`                      |
| `DELETE` | Delete a task by `id` (query param or body)|

## Data Model

```typescript
type TaskStatus = "inbox" | "pending" | "in_progress" | "done";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: string;       // ISO timestamp
  timeLogs: TimeLog[];     // one entry per status transition
  subItems: SubItem[];
  color?: string;
}

interface TimeLog {
  status: TaskStatus;
  startedAt: string;       // ISO timestamp
  endedAt: string | null;  // null while task is in this status
}

interface SubItem {
  id: string;
  text: string;
  done: boolean;
}
```

## Available Scripts

| Command         | Description                  |
|-----------------|------------------------------|
| `npm run dev`   | Start development server     |
| `npm run build` | Build for production         |
| `npm run start` | Start production server      |
| `npm run lint`  | Run ESLint                   |

## Deployment

- https://task-timer-app-user.vercel.app/