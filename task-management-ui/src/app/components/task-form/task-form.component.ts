import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, CreateTaskDto, User } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

const BASE = 'w-full py-2 rounded-xl border text-sm font-medium transition-all duration-150 ';

@Component({
  selector: 'app-task-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css'],
})
export class TaskFormComponent implements OnInit {
  @Input() task: Task | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  form: CreateTaskDto = {
    title: '',
    description: '',
    priority: 'Medium',
    isCompleted: false,
    dueDate: undefined,
    assignedTo: undefined,
  };

  users: User[] = [];
  saving = false;
  error = '';

  priorities = [
    {
      value: 'High' as const,
      label: 'High',
      activeClass: BASE + 'border-rose-500 bg-rose-500/10 text-rose-400',
      idleClass:   BASE + 'border-gray-700 bg-transparent text-gray-500 hover:border-rose-500/50 hover:text-rose-400',
    },
    {
      value: 'Medium' as const,
      label: 'Medium',
      activeClass: BASE + 'border-amber-500 bg-amber-500/10 text-amber-400',
      idleClass:   BASE + 'border-gray-700 bg-transparent text-gray-500 hover:border-amber-500/50 hover:text-amber-400',
    },
    {
      value: 'Low' as const,
      label: 'Low',
      activeClass: BASE + 'border-sky-500 bg-sky-500/10 text-sky-400',
      idleClass:   BASE + 'border-gray-700 bg-transparent text-gray-500 hover:border-sky-500/50 hover:text-sky-400',
    },
  ];

  /** Map user color name → Tailwind bg class */
  readonly avatarBg: Record<string, string> = {
    cyan:    'bg-cyan-500',
    emerald: 'bg-emerald-500',
    amber:   'bg-amber-500',
    rose:    'bg-rose-500',
    sky:     'bg-sky-500',
  };

  constructor(private taskService: TaskService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.task) {
      this.form = {
        title: this.task.title,
        description: this.task.description ?? '',
        priority: this.task.priority,
        isCompleted: this.task.isCompleted,
        dueDate: this.task.dueDate ?? undefined,
        assignedTo: this.task.assignedTo ?? undefined,
      };
    }
    this.taskService.getUsers().subscribe({
      next: (users) => { this.users = users; this.cdr.markForCheck(); },
      error: () => { /* users list is non-critical */ },
    });
  }

  get isEdit(): boolean { return !!this.task; }

  getUser(id: string | undefined): User | undefined {
    return id ? this.users.find(u => u.id === id) : undefined;
  }

  submit(): void {
    if (!this.form.title.trim()) { this.error = 'Title is required.'; return; }
    this.saving = true;
    this.error = '';

    const payload = { ...this.form };
    if (!payload.dueDate) delete payload.dueDate;
    if (!payload.assignedTo) delete payload.assignedTo;

    const op = this.isEdit
      ? this.taskService.updateTask(this.task!.id, payload)
      : this.taskService.createTask(payload);

    op.subscribe({
      next: () => { this.saving = false; this.saved.emit(); this.cdr.markForCheck(); },
      error: (err) => { this.saving = false; this.error = 'Failed to save task. Please try again.'; this.cdr.markForCheck(); console.error(err); },
    });
  }

  cancel(): void { this.cancelled.emit(); }
}

