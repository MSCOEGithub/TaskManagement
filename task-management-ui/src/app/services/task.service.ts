import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Task, CreateTaskDto, User } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private apiUrl = 'http://localhost:5242/api/tasks';
  private usersUrl = 'http://localhost:5242/api/users';

  constructor(private http: HttpClient) {}

  private mapTask(item: any): Task {
    return { ...item, tags: item.tags ? item.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [] };
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(map(items => items.map(i => this.mapTask(i))));
  }

  getTask(id: number): Observable<Task> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(map(i => this.mapTask(i)));
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.usersUrl);
  }

  createTask(task: CreateTaskDto): Observable<Task> {
    const payload = { ...task, tags: task.tags?.length ? task.tags.join(',') : null };
    return this.http.post<any>(this.apiUrl, payload).pipe(map(i => this.mapTask(i)));
  }

  updateTask(id: number, task: Partial<Task>): Observable<Task> {
    const payload = { ...task, tags: (task.tags as string[] | undefined)?.length ? (task.tags as string[]).join(',') : null };
    return this.http.put<any>(`${this.apiUrl}/${id}`, payload).pipe(map(i => this.mapTask(i)));
  }

  toggleTask(id: number): Observable<Task> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/toggle`, {}).pipe(map(i => this.mapTask(i)));
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
