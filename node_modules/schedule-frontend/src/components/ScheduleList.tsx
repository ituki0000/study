import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Check, Clock, AlertCircle, Tag, Square, CheckSquare, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Schedule } from '../types/schedule';

interface ScheduleListProps {
  schedules: Schedule[];
  loading: boolean;
  onEdit: (schedule: Schedule) => void;
  onDelete: (id: string) => void;
  onDeleteMultiple: (ids: string[]) => void;
  onToggleComplete: (schedule: Schedule) => void;
}

const ScheduleList: React.FC<ScheduleListProps> = ({
  schedules,
  loading,
  onEdit,
  onDelete,
  onDeleteMultiple,
  onToggleComplete,
}) => {
  // 選択状態の管理
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 予定リストが変更されたら選択状態をリセット
  useEffect(() => {
    setSelectedIds(new Set());
  }, [schedules]);

  // 全選択/解除
  const handleSelectAll = () => {
    if (selectedIds.size === schedules.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(schedules.map(s => s.id)));
    }
  };

  // 個別選択の切り替え
  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    console.log('🔍 選択状態変更:', { id, selectedIds: Array.from(newSelected) });
    setSelectedIds(newSelected);
  };

  // 一括削除の実行
  const handleBulkDelete = () => {
    console.log('🗑️ 一括削除ボタンクリック:', { selectedIds: Array.from(selectedIds) });
    if (selectedIds.size > 0) {
      const confirmed = window.confirm(`${selectedIds.size}件の予定を削除しますか？`);
      console.log('🤔 削除確認:', confirmed);
      if (confirmed) {
        console.log('✅ 一括削除実行開始:', Array.from(selectedIds));
        onDeleteMultiple(Array.from(selectedIds));
        setSelectedIds(new Set());
      }
    } else {
      console.log('❌ 選択された予定がありません');
    }
  };

  // 全選択チェックボックスの状態を決定
  const getSelectAllState = () => {
    if (selectedIds.size === 0) return 'none';
    if (selectedIds.size === schedules.length) return 'all';
    return 'partial';
  };
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
      low: { label: '低', color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' },
      medium: { label: '中', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' },
      high: { label: '高', color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' },
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
        <p className="mt-4 text-gray-600 dark:text-gray-400">読み込み中...</p>
      </div>
    );
  }

  // 予定が空の場合
  if (schedules.length === 0) {
    return (
      <div className="p-8 text-center">
        <Clock className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 mb-2">予定がありません</p>
        <p className="text-sm text-gray-500 dark:text-gray-500">「新しい予定」ボタンから予定を追加してください</p>
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-blue-600 dark:text-blue-400">
            💡 予定を追加後、チェックボックスで複数選択して一括削除できます
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      {/* 複数選択コントロール */}
      {schedules.length > 0 && (
        <div className="border-b-2 border-primary-200 dark:border-primary-800 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* 全選択チェックボックス */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center justify-center w-6 h-6 border-2 border-primary-400 dark:border-primary-500 rounded hover:border-primary-600 dark:hover:border-primary-400 transition-colors bg-white dark:bg-gray-800"
                  title={
                    getSelectAllState() === 'all' ? '全選択解除' :
                    getSelectAllState() === 'partial' ? '全選択' : '全選択'
                  }
                >
                  {getSelectAllState() === 'all' && <CheckSquare className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
                  {getSelectAllState() === 'partial' && <Minus className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
                  {getSelectAllState() === 'none' && <Square className="w-5 h-5 text-primary-400 dark:text-primary-500" />}
                </button>
                
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  {getSelectAllState() === 'all' ? '全選択解除' :
                   getSelectAllState() === 'partial' ? '全選択' : '全選択'}
                </span>
              </div>
              
              <div className="h-4 w-px bg-primary-300 dark:bg-primary-600"></div>
              
              <span className="text-sm font-medium text-primary-800 dark:text-primary-200">
                {selectedIds.size > 0 ? (
                  <span className="flex items-center space-x-1">
                    <span className="bg-primary-600 text-white px-2 py-1 rounded-full text-xs">
                      {selectedIds.size}
                    </span>
                    <span>件選択中</span>
                  </span>
                ) : (
                  <span className="text-gray-600 dark:text-gray-400">
                    📋 複数選択して一括削除できます
                  </span>
                )}
              </span>
            </div>

            {/* 一括削除ボタン */}
            {selectedIds.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center space-x-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-md hover:shadow-lg font-medium"
              >
                <Trash2 className="w-5 h-5" />
                <span>🗑️ 選択した{selectedIds.size}件を削除</span>
              </button>
            )}
          </div>
        </div>
      )}

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {schedules.map((schedule) => {
          const priorityInfo = getPriorityInfo(schedule.priority);
          const isOverdue = new Date(schedule.endDate) < new Date() && !schedule.isCompleted;
          
          return (
            <div
              key={schedule.id}
              className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                schedule.isCompleted ? 'opacity-60' : ''
              } ${isOverdue ? 'bg-red-50 dark:bg-red-900/20' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* 選択チェックボックス、タイトル、完了チェックボックス */}
                  <div className="flex items-start space-x-3 mb-3">
                    {/* 選択チェックボックス */}
                    <button
                      onClick={() => handleSelectItem(schedule.id)}
                      className={`mt-1 w-6 h-6 border-2 rounded-md flex items-center justify-center transition-all duration-200 ${
                        selectedIds.has(schedule.id)
                          ? 'bg-primary-600 border-primary-600 text-white shadow-md scale-110'
                          : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                      }`}
                      title={selectedIds.has(schedule.id) ? '選択解除' : '選択する'}
                    >
                      {selectedIds.has(schedule.id) && <Check className="w-4 h-4" />}
                    </button>
                    
                    {/* 完了チェックボックス */}
                    <button
                      onClick={() => onToggleComplete(schedule)}
                      className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        schedule.isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500'
                      }`}
                      title="完了/未完了"
                    >
                      {schedule.isCompleted && <Check className="w-3 h-3" />}
                    </button>
                    <div className="flex-1">
                      <h3
                        className={`text-lg font-medium ${
                          schedule.isCompleted
                            ? 'line-through text-gray-500 dark:text-gray-400'
                            : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        {schedule.title}
                      </h3>
                      {schedule.description && (
                        <p className="text-gray-600 dark:text-gray-400 mt-1">{schedule.description}</p>
                      )}
                    </div>
                  </div>

                  {/* 詳細情報 */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {formatDate(schedule.startDate)} - {formatDate(schedule.endDate)}
                      </span>
                      {isOverdue && (
                        <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400 ml-2" />
                      )}
                    </div>
                    
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      {getCategoryLabel(schedule.category)}
                    </span>
                    
                    <span className={`px-2 py-1 rounded-full text-xs ${priorityInfo.color}`}>
                      優先度: {priorityInfo.label}
                    </span>
                  </div>

                  {/* タグ表示 */}
                  {schedule.tags && schedule.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Tag className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      {schedule.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 rounded-full text-xs bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 border border-primary-200 dark:border-primary-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* アクションボタン */}
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => onEdit(schedule)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-md transition-colors"
                    title="編集"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(schedule.id)}
                    className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
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