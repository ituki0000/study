export interface Schedule {
  id: string;
  title: string;
  description?: string;
  startDate: string; // ISO 8601 format
  endDate: string;   // ISO 8601 format
  category: 'work' | 'personal' | 'meeting' | 'reminder' | 'other';
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleRequest {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  category: Schedule['category'];
  priority: Schedule['priority'];
}

export interface UpdateScheduleRequest {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  category?: Schedule['category'];
  priority?: Schedule['priority'];
  isCompleted?: boolean;
}

export interface ScheduleQuery {
  category?: Schedule['category'];
  priority?: Schedule['priority'];
  isCompleted?: boolean;
  startDate?: string;
  endDate?: string;
  search?: string;
} 