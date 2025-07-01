import axios from 'axios';
import { ScheduleTemplate, CreateTemplateRequest, UpdateTemplateRequest, UseTemplateRequest, ApiResponse } from '../types/template';
import { Schedule } from '../types/schedule';

const API_BASE_URL = '/api';

// Axios インスタンスを作成
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// レスポンスインターセプター（エラーハンドリング）
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Template API Error:', error);
    if (error.response?.status === 404) {
      throw new Error('テンプレートが見つかりません');
    } else if (error.response?.status >= 500) {
      throw new Error('サーバーエラーが発生しました');
    } else if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else {
      throw new Error('通信エラーが発生しました');
    }
  }
);

export class TemplateAPI {
  // 全テンプレートを取得
  static async getAllTemplates(): Promise<ScheduleTemplate[]> {
    try {
      const response = await api.get<ApiResponse<ScheduleTemplate[]>>('/templates');
      return response.data.data;
    } catch (error) {
      console.error('テンプレート取得エラー:', error);
      throw error;
    }
  }

  // カテゴリ別テンプレートを取得
  static async getTemplatesByCategory(category: ScheduleTemplate['category']): Promise<ScheduleTemplate[]> {
    try {
      const response = await api.get<ApiResponse<ScheduleTemplate[]>>(`/templates/category/${category}`);
      return response.data.data;
    } catch (error) {
      console.error('カテゴリ別テンプレート取得エラー:', error);
      throw error;
    }
  }

  // 特定のテンプレートを取得
  static async getTemplateById(id: string): Promise<ScheduleTemplate> {
    try {
      const response = await api.get<ApiResponse<ScheduleTemplate>>(`/templates/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('テンプレート取得エラー:', error);
      throw error;
    }
  }

  // 新しいテンプレートを作成
  static async createTemplate(data: CreateTemplateRequest): Promise<ScheduleTemplate> {
    try {
      const response = await api.post<ApiResponse<ScheduleTemplate>>('/templates', data);
      return response.data.data;
    } catch (error) {
      console.error('テンプレート作成エラー:', error);
      throw error;
    }
  }

  // テンプレートを更新
  static async updateTemplate(id: string, data: UpdateTemplateRequest): Promise<ScheduleTemplate> {
    try {
      const response = await api.put<ApiResponse<ScheduleTemplate>>(`/templates/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('テンプレート更新エラー:', error);
      throw error;
    }
  }

  // テンプレートを削除
  static async deleteTemplate(id: string): Promise<void> {
    try {
      await api.delete(`/templates/${id}`);
    } catch (error) {
      console.error('テンプレート削除エラー:', error);
      throw error;
    }
  }

  // テンプレートを複製
  static async duplicateTemplate(id: string, newName?: string): Promise<ScheduleTemplate> {
    try {
      const response = await api.post<ApiResponse<ScheduleTemplate>>(`/templates/${id}/duplicate`, {
        name: newName
      });
      return response.data.data;
    } catch (error) {
      console.error('テンプレート複製エラー:', error);
      throw error;
    }
  }

  // テンプレートから予定を作成
  static async useTemplate(data: UseTemplateRequest): Promise<Schedule> {
    try {
      const response = await api.post<ApiResponse<Schedule>>(`/templates/${data.templateId}/use`, {
        startDate: data.startDate,
        title: data.title,
        description: data.description
      });
      return response.data.data;
    } catch (error) {
      console.error('テンプレート使用エラー:', error);
      throw error;
    }
  }

  // 予定からテンプレートを作成
  static async createTemplateFromSchedule(scheduleId: string, templateName: string): Promise<ScheduleTemplate> {
    try {
      const response = await api.post<ApiResponse<ScheduleTemplate>>(`/templates/from-schedule/${scheduleId}`, {
        name: templateName
      });
      return response.data.data;
    } catch (error) {
      console.error('予定からテンプレート作成エラー:', error);
      throw error;
    }
  }
} 