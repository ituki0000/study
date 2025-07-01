export interface Schedule {
  id: string;
  title: string;
  description?: string;
  startDate: string; // ISO 8601 format
  endDate: string;   // ISO 8601 format
  category: 'work' | 'personal' | 'meeting' | 'reminder' | 'other';
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  tags?: string[]; // タグ機能を追加
  createdAt: string;
  updatedAt: string;
  // 繰り返し設定
  repeatType?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  repeatInterval?: number; // 繰り返し間隔（例: 2週間毎なら2）
  repeatEndDate?: string; // 繰り返し終了日
  repeatDays?: number[]; // 週間繰り返しの曜日（0=日曜, 1=月曜...）
  parentId?: string; // 繰り返し予定の親ID
  isRecurring?: boolean; // 繰り返し予定かどうか
}

export interface CreateScheduleRequest {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  category: Schedule['category'];
  priority: Schedule['priority'];
  tags?: string[]; // タグ機能を追加
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
  tags?: string[]; // タグ機能を追加
}

export interface ScheduleQuery {
  category?: Schedule['category'];
  priority?: Schedule['priority'];
  isCompleted?: boolean;
  startDate?: string;
  endDate?: string;
  search?: string;
  tags?: string[]; // タグでのフィルタリング機能を追加
} 