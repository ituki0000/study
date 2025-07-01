import axios from 'axios';
import { Schedule, CreateScheduleRequest, UpdateScheduleRequest, ScheduleQuery, ApiResponse } from '../types/schedule';

// 統計データの型定義
export interface AnalyticsData {
  summary: {
    total: number;
    completed: number;
    completionRate: number;
    overdue: number;
    today: {
      total: number;
      completed: number;
      remaining: number;
    };
    thisWeek: {
      total: number;
      completed: number;
      remaining: number;
    };
    thisMonth: {
      total: number;
      completed: number;
      remaining: number;
    };
  };
  categoryDistribution: {
    work: number;
    personal: number;
    meeting: number;
    reminder: number;
    other: number;
  };
  priorityDistribution: {
    high: number;
    medium: number;
    low: number;
  };
  completionTrend: Array<{
    date: string;
    total: number;
    completed: number;
    completionRate: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    count: number;
    completed: number;
  }>;
  generatedAt: string;
}

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
    console.error('API Error:', error);
    if (error.response?.status === 404) {
      throw new Error('リソースが見つかりません');
    } else if (error.response?.status >= 500) {
      throw new Error('サーバーエラーが発生しました');
    } else if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else {
      throw new Error('通信エラーが発生しました');
    }
  }
);

export class ScheduleAPI {
  // 全予定を取得
  static async getAllSchedules(query?: ScheduleQuery): Promise<Schedule[]> {
    try {
      const params = new URLSearchParams();
      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
      }

      const response = await api.get<ApiResponse<Schedule[]>>(`/schedules?${params}`);
      return response.data.data;
    } catch (error) {
      console.error('予定取得エラー:', error);
      throw error;
    }
  }

  // 特定の予定を取得
  static async getScheduleById(id: string): Promise<Schedule> {
    try {
      const response = await api.get<ApiResponse<Schedule>>(`/schedules/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('予定取得エラー:', error);
      throw error;
    }
  }

  // 新しい予定を作成
  static async createSchedule(data: CreateScheduleRequest): Promise<Schedule> {
    try {
      const response = await api.post<ApiResponse<Schedule>>('/schedules', data);
      return response.data.data;
    } catch (error) {
      console.error('予定作成エラー:', error);
      throw error;
    }
  }

  // 予定を更新
  static async updateSchedule(id: string, data: UpdateScheduleRequest): Promise<Schedule> {
    try {
      const response = await api.put<ApiResponse<Schedule>>(`/schedules/${id}`, data);
      return response.data.data;
    } catch (error) {
      console.error('予定更新エラー:', error);
      throw error;
    }
  }

  // 予定を削除
  static async deleteSchedule(id: string): Promise<void> {
    try {
      await api.delete(`/schedules/${id}`);
    } catch (error) {
      console.error('予定削除エラー:', error);
      throw error;
    }
  }

  // 複数の予定を一括削除
  static async deleteMultipleSchedules(ids: string[]): Promise<{
    message: string;
    deletedCount: number;
    errors?: string[];
  }> {
    console.log('🌐 API: 一括削除リクエスト送信:', { endpoint: '/schedules/bulk', ids });
    try {
      const response = await api.delete('/schedules/bulk', {
        data: { ids }
      });
      console.log('✅ API: 一括削除レスポンス:', response.data);
      return response.data;
          } catch (error) {
        console.error('❌ API: 一括削除エラー:', error);
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as any;
          console.error('❌ API: エラーレスポンス:', axiosError.response?.data);
          console.error('❌ API: エラーステータス:', axiosError.response?.status);
        }
        throw error;
      }
  }

  // 全ての予定を削除
  static async deleteAllSchedules(): Promise<{
    message: string;
    deletedCount: number;
  }> {
    try {
      const response = await api.delete('/schedules/all');
      return response.data;
    } catch (error) {
      console.error('全削除エラー:', error);
      throw error;
    }
  }

  // サーバーの健康状態をチェック
  static async healthCheck(): Promise<boolean> {
    try {
      await api.get('/health');
      return true;
    } catch (error) {
      console.error('サーバー接続エラー:', error);
      return false;
    }
  }

  // 統計データを取得
  static async getAnalytics(): Promise<AnalyticsData> {
    try {
      const response = await api.get<ApiResponse<AnalyticsData>>('/schedules/analytics');
      return response.data.data;
    } catch (error) {
      console.error('統計データ取得エラー:', error);
      throw error;
    }
  }

  // データをJSONでエクスポート
  static async exportJSON(): Promise<Blob> {
    try {
      const response = await api.get('/schedules/export/json', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('JSONエクスポートエラー:', error);
      throw error;
    }
  }

  // データをCSVでエクスポート
  static async exportCSV(): Promise<Blob> {
    try {
      const response = await api.get('/schedules/export/csv', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('CSVエクスポートエラー:', error);
      throw error;
    }
  }

  // データをインポート
  static async importSchedules(schedules: any[]): Promise<{
    message: string;
    importedCount: number;
    errorCount: number;
    importedSchedules: Schedule[];
  }> {
    try {
      const response = await api.post('/schedules/import', { schedules });
      return response.data;
    } catch (error) {
      console.error('データインポートエラー:', error);
      throw error;
    }
  }
} 