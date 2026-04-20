import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, User } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { TaskFormComponent } from '../task-form/task-form.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, DatePipe, DecimalPipe, TaskFormComponent],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  users: User[] = [];
  loading = true;
  error = '';

  searchQuery = '';
  filterStatus: 'all' | 'active' | 'done' = 'all';
  filterPriority: 'all' | 'High' | 'Medium' | 'Low' = 'all';
  filterAssignee = 'all';

  showForm = false;
  editingTask: Task | null = null;

  statusOptions = [
    { label: 'All',    value: 'all'    as const },
    { label: 'Active', value: 'active' as const },
    { label: 'Done',   value: 'done'   as const },
  ];

  constructor(private taskService: TaskService, public cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadTasks();
    this.taskService.getUsers().subscribe({
      next: (users) => { this.users = users; this.cdr.markForCheck(); },
      error: () => { /* non-critical */ },
    });
  }

  loadTasks(): void {
    this.loading = true;
    this.taskService.getTasks().subscribe({
      next: (tasks) => { this.tasks = tasks; this.applyFilters(); this.loading = false; this.cdr.markForCheck(); },
      error: (err) => { this.error = 'Failed to load tasks. Is the API running?'; this.loading = false; this.cdr.markForCheck(); console.error(err); },
    });
  }

  applyFilters(): void {
    this.filteredTasks = this.tasks.filter(t => {
      const matchSearch = !this.searchQuery ||
        t.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (t.description?.toLowerCase().includes(this.searchQuery.toLowerCase()) ?? false);
      const matchStatus =
        this.filterStatus === 'all' ||
        (this.filterStatus === 'active' && !t.isCompleted) ||
        (this.filterStatus === 'done' && t.isCompleted);
      const matchPriority = this.filterPriority === 'all' || t.priority === this.filterPriority;
      const matchAssignee = this.filterAssignee === 'all' ||
        (this.filterAssignee === 'unassigned' ? !t.assignedTo : t.assignedTo === this.filterAssignee);
      return matchSearch && matchStatus && matchPriority && matchAssignee;
    });
  }

  get completedCount(): number { return this.tasks.filter(t => t.isCompleted).length; }
  get activeCount(): number { return this.tasks.filter(t => !t.isCompleted).length; }

  trackById(_: number, task: Task): number { return task.id; }

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.isCompleted) return false;
    return new Date(task.dueDate) < new Date();
  }

  getUser(id: string | undefined): User | undefined {
    return id ? this.users.find(u => u.id === id) : undefined;
  }

  dismissError(): void { this.error = ''; this.cdr.markForCheck(); }

  readonly avatarBg: Record<string, string> = {
    cyan:    'bg-cyan-500',
    emerald: 'bg-emerald-500',
    amber:   'bg-amber-500',
    rose:    'bg-rose-500',
    sky:     'bg-sky-500',
  };

  priorityBadgeClass(priority: string): string {
    const base = 'text-xs font-medium px-2 py-0.5 rounded-full border ';
    const map: Record<string, string> = {
      High:   'bg-rose-500/10 text-rose-400 border-rose-500/20',
      Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      Low:    'bg-sky-500/10 text-sky-400 border-sky-500/20',
    };
    return base + (map[priority] ?? 'bg-gray-500/10 text-gray-400 border-gray-500/20');
  }

  priorityLeftBorderClass(priority: string): string {
    const map: Record<string, string> = {
      High:   'border-l-rose-500',
      Medium: 'border-l-amber-500',
      Low:    'border-l-sky-500',
    };
    return map[priority] ?? 'border-l-gray-700';
  }

  openCreate(): void { this.editingTask = null; this.showForm = true; }
  openEdit(task: Task): void { this.editingTask = { ...task }; this.showForm = true; }

  onFormSaved(): void { this.showForm = false; this.editingTask = null; this.loadTasks(); }
  onFormCancelled(): void { this.showForm = false; this.editingTask = null; }

  toggleTask(task: Task): void {
    this.taskService.toggleTask(task.id).subscribe({
      next: (updated) => {
        const idx = this.tasks.findIndex(t => t.id === task.id);
        if (idx !== -1) this.tasks[idx] = updated;
        this.applyFilters();
        this.cdr.markForCheck();
      },
      error: () => { this.error = 'Failed to update task.'; this.cdr.markForCheck(); },
    });
  }

  deleteTask(id: number): void {
    this.taskService.deleteTask(id).subscribe({
      next: () => { this.tasks = this.tasks.filter(t => t.id !== id); this.applyFilters(); this.cdr.markForCheck(); },
      error: () => { this.error = 'Failed to delete task.'; this.cdr.markForCheck(); },
    });
  }
}
