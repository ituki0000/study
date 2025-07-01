export interface ScheduleTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'work' | 'personal' | 'meeting' | 'reminder' | 'other';
  priority: 'low' | 'medium' | 'high';
  duration: number; // 分単位
  tags?: string[];
  // 繰り返し設定のテンプレート
  repeatType?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  repeatInterval?: number;
  repeatDays?: number[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateRequest {
  name: string;
  description?: string;
  category: ScheduleTemplate['category'];
  priority: ScheduleTemplate['priority'];
  duration: number;
  tags?: string[];
  repeatType?: ScheduleTemplate['repeatType'];
  repeatInterval?: number;
  repeatDays?: number[];
}

export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  category?: ScheduleTemplate['category'];
  priority?: ScheduleTemplate['priority'];
  duration?: number;
  tags?: string[];
  repeatType?: ScheduleTemplate['repeatType'];
  repeatInterval?: number;
  repeatDays?: number[];
}

export interface UseTemplateRequest {
  templateId: string;
  startDate: string; // ISO 8601 format
  title?: string; // カスタムタイトル（省略時はテンプレート名を使用）
  description?: string; // 追加の説明
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  total?: number;
} 