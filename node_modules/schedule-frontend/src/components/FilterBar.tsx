import React from 'react';
import { Filter, X } from 'lucide-react';
import { ScheduleQuery, CATEGORY_OPTIONS, PRIORITY_OPTIONS } from '../types/schedule';

interface FilterBarProps {
  filters: ScheduleQuery;
  onFiltersChange: (filters: ScheduleQuery) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onFiltersChange }) => {
  // フィルターを更新
  const handleFilterChange = (key: keyof ScheduleQuery, value: any) => {
    const newFilters = { ...filters };
    if (value === '' || value === undefined) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    onFiltersChange(newFilters);
  };

  // 全フィルターをクリア
  const clearAllFilters = () => {
    onFiltersChange({});
  };

  // アクティブなフィルター数を計算
  const activeFiltersCount = Object.keys(filters).filter(key => 
    filters[key as keyof ScheduleQuery] !== undefined && 
    filters[key as keyof ScheduleQuery] !== ''
  ).length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-sm font-medium text-gray-900">フィルター</h3>
          {activeFiltersCount > 0 && (
            <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}個適用中
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1"
          >
            <X className="h-4 w-4" />
            <span>すべてクリア</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* カテゴリフィルター */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            カテゴリ
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="select-field text-sm"
          >
            <option value="">すべて</option>
            {CATEGORY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 優先度フィルター */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            優先度
          </label>
          <select
            value={filters.priority || ''}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="select-field text-sm"
          >
            <option value="">すべて</option>
            {PRIORITY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 完了状態フィルター */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            完了状態
          </label>
          <select
            value={filters.isCompleted === undefined ? '' : filters.isCompleted.toString()}
            onChange={(e) => {
              const value = e.target.value === '' ? undefined : e.target.value === 'true';
              handleFilterChange('isCompleted', value);
            }}
            className="select-field text-sm"
          >
            <option value="">すべて</option>
            <option value="false">未完了</option>
            <option value="true">完了済み</option>
          </select>
        </div>

        {/* 日付範囲フィルター */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            期間
          </label>
          <select
            value=""
            onChange={(e) => {
              const value = e.target.value;
              const now = new Date();
              let startDate: string | undefined;
              let endDate: string | undefined;

              switch (value) {
                case 'today':
                  startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
                  endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
                  break;
                case 'thisWeek':
                  const weekStart = new Date(now);
                  weekStart.setDate(now.getDate() - now.getDay());
                  weekStart.setHours(0, 0, 0, 0);
                  const weekEnd = new Date(weekStart);
                  weekEnd.setDate(weekStart.getDate() + 7);
                  startDate = weekStart.toISOString();
                  endDate = weekEnd.toISOString();
                  break;
                case 'thisMonth':
                  startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
                  endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
                  break;
                case 'clear':
                  startDate = undefined;
                  endDate = undefined;
                  break;
                default:
                  return;
              }

              handleFilterChange('startDate', startDate);
              handleFilterChange('endDate', endDate);
            }}
            className="select-field text-sm"
          >
            <option value="">期間を選択</option>
            <option value="today">今日</option>
            <option value="thisWeek">今週</option>
            <option value="thisMonth">今月</option>
            {(filters.startDate || filters.endDate) && (
              <option value="clear">期間をクリア</option>
            )}
          </select>
        </div>
      </div>

      {/* アクティブなフィルターを表示 */}
      {activeFiltersCount > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.category && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                カテゴリ: {CATEGORY_OPTIONS.find(opt => opt.value === filters.category)?.label}
                <button
                  onClick={() => handleFilterChange('category', undefined)}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.priority && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                優先度: {PRIORITY_OPTIONS.find(opt => opt.value === filters.priority)?.label}
                <button
                  onClick={() => handleFilterChange('priority', undefined)}
                  className="ml-1 hover:text-green-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.isCompleted !== undefined && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                {filters.isCompleted ? '完了済み' : '未完了'}
                <button
                  onClick={() => handleFilterChange('isCompleted', undefined)}
                  className="ml-1 hover:text-purple-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {(filters.startDate || filters.endDate) && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                期間指定
                <button
                  onClick={() => {
                    handleFilterChange('startDate', undefined);
                    handleFilterChange('endDate', undefined);
                  }}
                  className="ml-1 hover:text-orange-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar; 