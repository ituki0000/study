import React, { useState, useEffect } from 'react';
import { CalendarDays, Plus, Filter, Search, AlertCircle, List, Calendar, BarChart3, Bell } from 'lucide-react';
import { Schedule, ScheduleQuery, CATEGORY_OPTIONS, PRIORITY_OPTIONS } from './types/schedule';
import { ScheduleAPI } from './services/api';
import ScheduleList from './components/ScheduleList';
import ScheduleForm from './components/ScheduleForm';
import FilterBar from './components/FilterBar';
import ThemeToggle from './components/ThemeToggle';
import CalendarView from './components/CalendarView';
// @ts-ignore
import StatsDashboard from './components/StatsDashboard';
import NotificationSettings from './components/NotificationSettings';
import { notificationService } from './services/notificationService';

type ViewType = 'list' | 'calendar' | 'stats';

function App() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ScheduleQuery>({});
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

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
      
      // 通知をスケジュール
      notificationService.rescheduleAllNotifications(data);
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
    setSelectedDate(null);
  };

  // フォーム送信後の処理
  const handleFormSubmit = async () => {
    handleCloseForm();
    await loadSchedules();
  };

  // カレンダーの日付クリック処理
  const handleCalendarDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowForm(true);
  };

  // カレンダーの予定クリック処理
  const handleCalendarScheduleClick = (schedule: Schedule) => {
    handleEditSchedule(schedule);
  };

  // ビュー切り替え処理
  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* ヘッダー */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <CalendarDays className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">予定管理システム</h1>
            </div>
            <div className="flex items-center space-x-3">
              {/* ビュー切り替えボタン */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-md p-1">
                <button
                  onClick={() => handleViewChange('list')}
                  className={`p-2 rounded transition-colors ${
                    currentView === 'list'
                      ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                  title="リスト表示"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleViewChange('calendar')}
                  className={`p-2 rounded transition-colors ${
                    currentView === 'calendar'
                      ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                  title="カレンダー表示"
                >
                  <Calendar className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleViewChange('stats')}
                  className={`p-2 rounded transition-colors ${
                    currentView === 'stats'
                      ? 'bg-white dark:bg-gray-600 shadow-sm text-primary-600'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                  title="統計表示"
                >
                  <BarChart3 className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => setShowNotificationSettings(true)}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="通知設定"
              >
                <Bell className="h-5 w-5" />
              </button>
              <ThemeToggle />
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>新しい予定</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 検索・フィルターバー（リスト表示時のみ） */}
        {currentView === 'list' && (
          <div className="mb-6 space-y-4">
            {/* 検索バー */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="予定を検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              />
            </div>

            {/* フィルターバー */}
            <FilterBar
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-800 dark:text-red-200">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* ビューに応じた表示 */}
        {currentView === 'list' ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 transition-colors">
            <ScheduleList
              schedules={schedules}
              loading={loading}
              onEdit={handleEditSchedule}
              onDelete={handleDeleteSchedule}
              onToggleComplete={handleToggleComplete}
            />
          </div>
        ) : currentView === 'calendar' ? (
          <CalendarView
            schedules={schedules}
            onDateClick={handleCalendarDateClick}
            onScheduleClick={handleCalendarScheduleClick}
            onAddSchedule={() => setShowForm(true)}
          />
        ) : (
          <StatsDashboard />
        )}
      </main>

      {/* 予定作成・編集フォーム */}
      {showForm && (
        <ScheduleForm
          schedule={editingSchedule}
          selectedDate={selectedDate}
          onSubmit={handleFormSubmit}
          onCancel={handleCloseForm}
        />
      )}
      
      {/* 通知設定 */}
      <NotificationSettings
        isOpen={showNotificationSettings}
        onClose={() => setShowNotificationSettings(false)}
      />
    </div>
  );
}

export default App; 