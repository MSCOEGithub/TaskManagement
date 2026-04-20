export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: 'High' | 'Medium' | 'Low';
  isCompleted: boolean;
  dueDate?: string;
  createdAt: string;
  assignedTo?: string;
  tags?: string[];  // deserialized from comma-separated
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority: 'High' | 'Medium' | 'Low';
  isCompleted: boolean;
  dueDate?: string;
  assignedTo?: string;
  tags?: string[];
}

export interface User {
  id: string;
  name: string;
  initials: string;
  color: string;
}
