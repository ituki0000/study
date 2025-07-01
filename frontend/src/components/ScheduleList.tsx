import React from 'react';
import { Edit, Trash2, Check, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Schedule } from '../types/schedule';

interface ScheduleListProps {
  schedules: Schedule[];
  loading: boolean;
  onEdit: (schedule: Schedule) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (schedule: Schedule) => void;
}

const ScheduleList: React.FC<ScheduleListProps> = ({
  schedules,
  loading,
  onEdit,
  onDelete,
  onToggleComplete,
}) => {
  // カテゴリの日本語ラベルを取得
  const getCategoryLabel = (category: Schedule['category']): string => {
    const labels = {
      work: '仕事',
      personal: '個人',
      meeting: '会議',
      reminder: 'リマインダー',
      other: 'その他',
    };
    return labels[category];
  };

  // 優先度の日本語ラベルと色を取得
  const getPriorityInfo = (priority: Schedule['priority']) => {
    const info = {
      low: { label: '低', color: 'bg-green-100 text-green-800' },
      medium: { label: '中', color: 'bg-yellow-100 text-yellow-800' },
      high: { label: '高', color: 'bg-red-100 text-red-800' },
    };
    return info[priority];
  };

  // 日付をフォーマット
  const formatDate = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'M/d(E) HH:mm', { locale: ja });
    } catch {
      return dateString;
    }
  };

  // ローディング表示
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">読み込み中...</p>
      </div>
    );
  }

  // 予定が空の場合
  if (schedules.length === 0) {
    return (
      <div className="p-8 text-center">
        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">予定がありません</p>
        <p className="text-sm text-gray-500 mt-2">「新しい予定」ボタンから予定を追加してください</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="divide-y divide-gray-200">
        {schedules.map((schedule) => {
          const priorityInfo = getPriorityInfo(schedule.priority);
          const isOverdue = new Date(schedule.endDate) < new Date() && !schedule.isCompleted;
          
          return (
            <div
              key={schedule.id}
              className={`p-6 hover:bg-gray-50 transition-colors ${
                schedule.isCompleted ? 'opacity-60' : ''
              } ${isOverdue ? 'bg-red-50' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* タイトルと完了チェックボックス */}
                  <div className="flex items-start space-x-3 mb-3">
                    <button
                      onClick={() => onToggleComplete(schedule)}
                      className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        schedule.isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-green-400'
                      }`}
                    >
                      {schedule.isCompleted && <Check className="w-3 h-3" />}
                    </button>
                    <div className="flex-1">
                      <h3
                        className={`text-lg font-medium ${
                          schedule.isCompleted
                            ? 'line-through text-gray-500'
                            : 'text-gray-900'
                        }`}
                      >
                        {schedule.title}
                      </h3>
                      {schedule.description && (
                        <p className="text-gray-600 mt-1">{schedule.description}</p>
                      )}
                    </div>
                  </div>

                  {/* 詳細情報 */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {formatDate(schedule.startDate)} - {formatDate(schedule.endDate)}
                      </span>
                      {isOverdue && (
                        <AlertCircle className="w-4 h-4 text-red-500 ml-2" />
                      )}
                    </div>
                    
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                      {getCategoryLabel(schedule.category)}
                    </span>
                    
                    <span className={`px-2 py-1 rounded-full text-xs ${priorityInfo.color}`}>
                      優先度: {priorityInfo.label}
                    </span>
                  </div>
                </div>

                {/* アクションボタン */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => onEdit(schedule)}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                    title="編集"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(schedule.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScheduleList; 