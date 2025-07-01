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

export interface ApiResponse<T> {
  data: T;
  total?: number;
  message?: string;
}

// カテゴリと優先度のオプション
export const CATEGORY_OPTIONS = [
  { value: 'work', label: '仕事' },
  { value: 'personal', label: '個人' },
  { value: 'meeting', label: '会議' },
  { value: 'reminder', label: 'リマインダー' },
  { value: 'other', label: 'その他' },
] as const;

export const PRIORITY_OPTIONS = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
] as const; 