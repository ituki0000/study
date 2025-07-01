import React, { useState, useEffect } from 'react';
import { X, Save, Calendar } from 'lucide-react';
import { Schedule, CreateScheduleRequest, UpdateScheduleRequest, CATEGORY_OPTIONS, PRIORITY_OPTIONS } from '../types/schedule';
import { ScheduleAPI } from '../services/api';

interface ScheduleFormProps {
  schedule?: Schedule | null;
  selectedDate?: Date | null;
  onSubmit: () => void;
  onCancel: () => void;
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({
  schedule,
  selectedDate,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    category: 'work' as Schedule['category'],
    priority: 'medium' as Schedule['priority'],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 編集モードの場合、初期値を設定
  useEffect(() => {
    if (schedule) {
      setFormData({
        title: schedule.title,
        description: schedule.description || '',
        startDate: schedule.startDate.slice(0, 16), // datetime-local形式に変換
        endDate: schedule.endDate.slice(0, 16),
        category: schedule.category,
        priority: schedule.priority,
      });
    } else {
      // 新規作成の場合
      let startTime: Date;
      
      if (selectedDate) {
        // カレンダーから日付が選択されている場合
        startTime = new Date(selectedDate);
        startTime.setHours(9, 0, 0, 0); // 午前9時に設定
      } else {
        // 通常の新規作成の場合、現在時刻を使用
        startTime = new Date();
      }
      
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1時間後
      
      setFormData({
        title: '',
        description: '',
        startDate: startTime.toISOString().slice(0, 16),
        endDate: endTime.toISOString().slice(0, 16),
        category: 'work',
        priority: 'medium',
      });
    }
  }, [schedule, selectedDate]);

  // フォームデータの更新
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // エラーをクリア
    if (error) setError(null);
  };

  // バリデーション
  const validateForm = (): string | null => {
    if (!formData.title.trim()) {
      return 'タイトルを入力してください';
    }
    if (formData.title.length > 100) {
      return 'タイトルは100文字以内で入力してください';
    }
    if (formData.description.length > 500) {
      return '説明は500文字以内で入力してください';
    }
    if (!formData.startDate) {
      return '開始日時を選択してください';
    }
    if (!formData.endDate) {
      return '終了日時を選択してください';
    }
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      return '終了日時は開始日時より後に設定してください';
    }
    return null;
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const requestData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        category: formData.category,
        priority: formData.priority,
      };

      if (schedule) {
        // 編集
        await ScheduleAPI.updateSchedule(schedule.id, requestData as UpdateScheduleRequest);
      } else {
        // 新規作成
        await ScheduleAPI.createSchedule(requestData as CreateScheduleRequest);
      }

      onSubmit();
    } catch (err) {
      setError(err instanceof Error ? err.message : '予定の保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto transition-colors">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {schedule ? '予定を編集' : '新しい予定'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* エラー表示 */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* タイトル */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field"
              placeholder="予定のタイトルを入力"
              maxLength={100}
              required
            />
          </div>

          {/* 説明 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              説明
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field resize-none"
              rows={3}
              placeholder="詳細説明（任意）"
              maxLength={500}
            />
          </div>

          {/* 開始日時 */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              開始日時 <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          {/* 終了日時 */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              終了日時 <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          {/* カテゴリと優先度 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                カテゴリ
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="select-field"
              >
                {CATEGORY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                優先度
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="select-field"
              >
                {PRIORITY_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
              disabled={loading}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{loading ? '保存中...' : '保存'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleForm; 