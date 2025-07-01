export interface Schedule {
  id: string;
  title: string;
  description?: string;
  startDate: string; // ISO 8601 format
  endDate: string;   // ISO 8601 format
  category: 'work' | 'personal' | 'meeting' | 'reminder' | 'other';
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  // 繰り返し設定
  repeatType?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  repeatInterval?: number;
  repeatEndDate?: string;
  repeatDays?: number[];
  parentId?: string;
  isRecurring?: boolean;
}

export interface CreateScheduleRequest {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  category: Schedule['category'];
  priority: Schedule['priority'];
  tags?: string[];
  // 繰り返し設定
  repeatType?: Schedule['repeatType'];
  repeatInterval?: number;
  repeatEndDate?: string;
  repeatDays?: number[];
}

export interface UpdateScheduleRequest {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  category?: Schedule['category'];
  priority?: Schedule['priority'];
  isCompleted?: boolean;
  tags?: string[];
}

export interface ScheduleQuery {
  category?: Schedule['category'];
  priority?: Schedule['priority'];
  isCompleted?: boolean;
  startDate?: string;
  endDate?: string;
  search?: string;
  tags?: string[];
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

export const REPEAT_OPTIONS = [
  { value: 'none', label: '繰り返しなし' },
  { value: 'daily', label: '毎日' },
  { value: 'weekly', label: '毎週' },
  { value: 'monthly', label: '毎月' },
  { value: 'yearly', label: '毎年' },
] as const;

export const WEEKDAY_OPTIONS = [
  { value: 0, label: '日' },
  { value: 1, label: '月' },
  { value: 2, label: '火' },
  { value: 3, label: '水' },
  { value: 4, label: '木' },
  { value: 5, label: '金' },
  { value: 6, label: '土' },
] as const; 