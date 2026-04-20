# Task Management App

A full-stack single-page task management application.

- **Backend**: ASP.NET Core Web API (.NET 9) + EF Core + SQLite
- **Frontend**: Angular 19 (standalone components, signals)

## Project Structure

```
TaskManagement/
├── TaskManagement.API/        # .NET Web API
│   ├── Controllers/
│   │   └── TasksController.cs
│   ├── Data/
│   │   └── AppDbContext.cs
│   ├── Models/
│   │   └── TaskItem.cs
│   └── Program.cs
└── task-management-ui/        # Angular SPA
    └── src/app/
        ├── components/
        │   ├── task-list/
        │   └── task-form/
        ├── models/task.model.ts
        └── services/task.service.ts
```

## Running the App

### 1. Start the API (Terminal 1)
```bash
cd TaskManagement.API
dotnet run
```
API will be available at `http://localhost:5000`

### 2. Start the Angular app (Terminal 2)
```bash
cd task-management-ui
npm start
```
App will be available at `http://localhost:4200`

## API Endpoints

| Method | Endpoint                  | Description          |
|--------|---------------------------|----------------------|
| GET    | /api/tasks                | Get all tasks        |
| GET    | /api/tasks/{id}           | Get task by ID       |
| POST   | /api/tasks                | Create a task        |
| PUT    | /api/tasks/{id}           | Update a task        |
| PATCH  | /api/tasks/{id}/toggle    | Toggle completed     |
| DELETE | /api/tasks/{id}           | Delete a task        |

## Features
- Create, edit, delete tasks
- Toggle task completion
- Priority levels: Low / Medium / High
- Due date support
- Filter by status (all / active / completed)
- Filter by priority
- Full-text search
- Task stats (active / completed / total)
- SQLite local database (auto-created on first run)
