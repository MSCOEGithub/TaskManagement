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
    tags: [],
  };

  users: User[] = [];
  saving = false;
  error = '';

  tagInput = '';
  readonly presetTags = ['Bug', 'Feature', 'Design', 'Backend', 'Frontend', 'Review', 'Urgent', 'Research'];

  priorities = [
    {
      value: 'High' as const,
      label: 'High',
      activeClass: BASE + 'border-red-500 bg-red-50 text-red-600',
      idleClass:   BASE + 'border-slate-200 bg-white text-slate-400 hover:border-red-400 hover:text-red-500',
    },
    {
      value: 'Medium' as const,
      label: 'Medium',
      activeClass: BASE + 'border-amber-500 bg-amber-50 text-amber-600',
      idleClass:   BASE + 'border-slate-200 bg-white text-slate-400 hover:border-amber-400 hover:text-amber-500',
    },
    {
      value: 'Low' as const,
      label: 'Low',
      activeClass: BASE + 'border-emerald-500 bg-emerald-50 text-emerald-600',
      idleClass:   BASE + 'border-slate-200 bg-white text-slate-400 hover:border-emerald-400 hover:text-emerald-500',
    },
  ];

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
        tags: [...(this.task.tags ?? [])],
      };
    }
    this.taskService.getUsers().subscribe({
      next: (users) => { this.users = users; this.cdr.markForCheck(); },
      error: () => {},
    });
  }

  get isEdit(): boolean { return !!this.task; }

  getUser(id: string | undefined): User | undefined {
    return id ? this.users.find(u => u.id === id) : undefined;
  }

  isTagSelected(tag: string): boolean {
    return (this.form.tags ?? []).includes(tag);
  }

  togglePresetTag(tag: string): void {
    if (this.isTagSelected(tag)) {
      this.form.tags = (this.form.tags ?? []).filter(t => t !== tag);
    } else {
      this.form.tags = [...(this.form.tags ?? []), tag];
    }
    this.cdr.markForCheck();
  }

  addTag(tag: string): void {
    const t = tag.trim();
    if (t && !(this.form.tags ?? []).includes(t)) {
      this.form.tags = [...(this.form.tags ?? []), t];
      this.cdr.markForCheck();
    }
    this.tagInput = '';
  }

  removeTag(tag: string): void {
    this.form.tags = (this.form.tags ?? []).filter(t => t !== tag);
    this.cdr.markForCheck();
  }

  onTagKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') { event.preventDefault(); this.addTag(this.tagInput); }
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

