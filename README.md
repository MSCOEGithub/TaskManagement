# TaskFlow — Task Management App

A full-stack task management application with a modern light theme.

- **Backend**: ASP.NET Core Web API (.NET 9) + EF Core + SQLite
- **Frontend**: Angular 21 (standalone, zoneless, OnPush) + Tailwind CSS v3

## Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| .NET SDK | 9.0+ | https://dotnet.microsoft.com/download |
| Node.js | 20+ | https://nodejs.org |
| Git | any | https://git-scm.com |

## Quick Start (after cloning)

### 1 — Clone the repo
```bash
git clone https://github.com/MSCOEGithub/TaskManagement.git
cd TaskManagement
```

### 2 — Install frontend dependencies
```bash
cd task-management-ui
npm install
cd ..
```

### 3 — Run both servers (one command)

**Windows PowerShell:**
```powershell
.\start.ps1
```

This opens two terminal windows:
- **API** → `http://localhost:5242`
- **Frontend** → `http://localhost:4200`

Open `http://localhost:4200` in your browser.

### Manual start (alternative)

**Terminal 1 — API:**
```bash
cd TaskManagement.API
dotnet run --launch-profile http
```

**Terminal 2 — Frontend:**
```bash
cd task-management-ui
npm start
```

## Project Structure

```
TaskManagement/
├── TaskManagement.API/          # ASP.NET Core Web API
│   ├── Controllers/TasksController.cs
│   ├── Data/AppDbContext.cs
│   ├── Models/TaskItem.cs
│   └── Program.cs
├── task-management-ui/          # Angular SPA
│   └── src/app/
│       ├── components/
│       │   ├── task-list/       # List view with filters & export
│       │   └── task-form/       # Create / edit modal
│       ├── models/task.model.ts
│       └── services/task.service.ts
├── start.ps1                    # One-click launcher (Windows)
└── README.md
```

## Features

- List view with sortable columns
- Priority levels: Low / Medium / High
- Task tags / labels
- Filter by status, priority, assignee, tag
- Export to CSV
- Due date tracking (overdue / due-soon highlights)
- Light modern theme

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks | Get all tasks |
| GET | /api/tasks/{id} | Get task by ID |
| POST | /api/tasks | Create a task |
| PUT | /api/tasks/{id} | Update a task |
| PATCH | /api/tasks/{id}/toggle | Toggle completed |
| DELETE | /api/tasks/{id} | Delete a task |
- Filter by status (all / active / completed)
- Filter by priority
- Full-text search
- Task stats (active / completed / total)
- SQLite local database (auto-created on first run)
