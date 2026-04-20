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
  filterTag = 'all';
  sortBy: 'created' | 'dueDate' | 'priority' | 'title' = 'created';
  sortDir: 'asc' | 'desc' = 'desc';

  showForm = false;
  editingTask: Task | null = null;

  readonly PRIORITY_RANK: Record<string, number> = { High: 3, Medium: 2, Low: 1 };

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
      error: () => {},
    });
  }

  loadTasks(): void {
    this.loading = true;
    this.taskService.getTasks().subscribe({
      next: (tasks) => { this.tasks = tasks; this.applyFilters(); this.loading = false; this.cdr.markForCheck(); },
      error: (err) => { this.error = 'Failed to load tasks. Is the API running?'; this.loading = false; this.cdr.markForCheck(); console.error(err); },
    });
  }

  /** All unique tags across all tasks */
  get allTags(): string[] {
    const set = new Set<string>();
    this.tasks.forEach(t => (t.tags ?? []).forEach(tag => set.add(tag)));
    return Array.from(set).sort();
  }

  applyFilters(): void {
    let list = this.tasks.filter(t => {
      const matchSearch = !this.searchQuery ||
        t.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (t.description?.toLowerCase().includes(this.searchQuery.toLowerCase()) ?? false) ||
        (t.tags ?? []).some(tag => tag.toLowerCase().includes(this.searchQuery.toLowerCase()));
      const matchStatus =
        this.filterStatus === 'all' ||
        (this.filterStatus === 'active' && !t.isCompleted) ||
        (this.filterStatus === 'done' && t.isCompleted);
      const matchPriority = this.filterPriority === 'all' || t.priority === this.filterPriority;
      const matchAssignee = this.filterAssignee === 'all' ||
        (this.filterAssignee === 'unassigned' ? !t.assignedTo : t.assignedTo === this.filterAssignee);
      const matchTag = this.filterTag === 'all' || (t.tags ?? []).includes(this.filterTag);
      return matchSearch && matchStatus && matchPriority && matchAssignee && matchTag;
    });

    // Sort
    list = [...list].sort((a, b) => {
      let cmp = 0;
      if (this.sortBy === 'title')    cmp = a.title.localeCompare(b.title);
      if (this.sortBy === 'priority') cmp = (this.PRIORITY_RANK[a.priority] ?? 0) - (this.PRIORITY_RANK[b.priority] ?? 0);
      if (this.sortBy === 'dueDate')  cmp = (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999');
      if (this.sortBy === 'created')  cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return this.sortDir === 'asc' ? cmp : -cmp;
    });

    this.filteredTasks = list;
  }

  toggleSort(col: typeof this.sortBy): void {
    if (this.sortBy === col) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = col;
      this.sortDir = col === 'created' ? 'desc' : 'asc';
    }
    this.applyFilters();
    this.cdr.markForCheck();
  }

  get completedCount(): number { return this.tasks.filter(t => t.isCompleted).length; }
  get activeCount():    number { return this.tasks.filter(t => !t.isCompleted).length; }
  get overdueCount():   number { return this.tasks.filter(t => this.isOverdue(t)).length; }

  trackById(_: number, task: Task): number { return task.id; }

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.isCompleted) return false;
    return new Date(task.dueDate) < new Date(new Date().toDateString());
  }

  isDueSoon(task: Task): boolean {
    if (!task.dueDate || task.isCompleted) return false;
    const days = (new Date(task.dueDate).getTime() - Date.now()) / 86400000;
    return days >= 0 && days <= 2;
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

  readonly avatarBgLight: Record<string, string> = {
    cyan:    'bg-cyan-100 text-cyan-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    amber:   'bg-amber-100 text-amber-700',
    rose:    'bg-rose-100 text-rose-700',
    sky:     'bg-sky-100 text-sky-700',
  };

  priorityConfig(priority: string): { badge: string; dot: string } {
    const map: Record<string, { badge: string; dot: string }> = {
      High:   { badge: 'bg-red-50 text-red-600 border border-red-200',      dot: 'bg-red-500' },
      Medium: { badge: 'bg-amber-50 text-amber-600 border border-amber-200', dot: 'bg-amber-500' },
      Low:    { badge: 'bg-emerald-50 text-emerald-600 border border-emerald-200', dot: 'bg-emerald-500' },
    };
    return map[priority] ?? { badge: 'bg-slate-100 text-slate-500 border border-slate-200', dot: 'bg-slate-400' };
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

  exportToCSV(): void {
    const headers = ['Title', 'Description', 'Priority', 'Status', 'Assignee', 'Tags', 'Due Date', 'Created'];
    const rows = this.filteredTasks.map(t => [
      t.title,
      t.description ?? '',
      t.priority,
      t.isCompleted ? 'Done' : 'Active',
      this.getUser(t.assignedTo)?.name ?? 'Unassigned',
      (t.tags ?? []).join('; '),
      t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '',
      new Date(t.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
