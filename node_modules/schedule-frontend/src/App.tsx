import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, Filter, Search, AlertCircle } from 'lucide-react';
import { Schedule, ScheduleQuery, CATEGORY_OPTIONS, PRIORITY_OPTIONS } from './types/schedule';
import { ScheduleAPI } from './services/api';
import ScheduleList from './components/ScheduleList';
import ScheduleForm from './components/ScheduleForm';
import FilterBar from './components/FilterBar';

function App() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ScheduleQuery>({});

  // 予定を読み込む
  const loadSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      const query: ScheduleQuery = {
        ...filters,
        search: searchQuery || undefined,
      };
      const data = await ScheduleAPI.getAllSchedules(query);
      setSchedules(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予定の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 初回読み込み
  useEffect(() => {
    loadSchedules();
  }, []);

  // 検索・フィルター変更時に再読み込み
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadSchedules();
    }, 500); // デバウンス処理

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters]);

  // 予定を削除
  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('この予定を削除しますか？')) return;

    try {
      await ScheduleAPI.deleteSchedule(id);
      await loadSchedules();
    } catch (err) {
      setError(err instanceof Error ? err.message : '予定の削除に失敗しました');
    }
  };

  // 予定の完了状態を切り替え
  const handleToggleComplete = async (schedule: Schedule) => {
    try {
      await ScheduleAPI.updateSchedule(schedule.id, {
        isCompleted: !schedule.isCompleted,
      });
      await loadSchedules();
    } catch (err) {
      setError(err instanceof Error ? err.message : '予定の更新に失敗しました');
    }
  };

  // 編集モードを開始
  const handleEditSchedule = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setShowForm(true);
  };

  // フォームを閉じる
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSchedule(null);
  };

  // フォーム送信後の処理
  const handleFormSubmit = async () => {
    handleCloseForm();
    await loadSchedules();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <CalendarDays className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">予定管理システム</h1>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>新しい予定</span>
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 検索・フィルターバー */}
        <div className="mb-6 space-y-4">
          {/* 検索バー */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="予定を検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* フィルターバー */}
          <FilterBar
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-800">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* 予定リスト */}
        <div className="bg-white rounded-lg shadow">
          <ScheduleList
            schedules={schedules}
            loading={loading}
            onEdit={handleEditSchedule}
            onDelete={handleDeleteSchedule}
            onToggleComplete={handleToggleComplete}
          />
        </div>
      </main>

      {/* 予定作成・編集フォーム */}
      {showForm && (
        <ScheduleForm
          schedule={editingSchedule}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseForm}
        />
      )}
    </div>
  );
}

export default App; 