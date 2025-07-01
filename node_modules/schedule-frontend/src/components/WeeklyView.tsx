import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin, Tag, CheckCircle, Circle } from 'lucide-react';
import { Schedule } from '../types/schedule';

interface WeeklyViewProps {
  schedules: Schedule[];
  onScheduleClick: (schedule: Schedule) => void;
  onDateClick: (date: Date) => void;
  onToggleComplete: (schedule: Schedule) => void;
}

const WeeklyView: React.FC<WeeklyViewProps> = ({
  schedules,
  onScheduleClick,
  onDateClick,
  onToggleComplete
}) => {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // 現在の週の日付を取得
  const weekDates = useMemo(() => {
    const dates = [];
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [currentWeek]);

  // 週の移動
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  // 今日に戻る
  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  // 特定の日付のスケジュールを取得
  const getSchedulesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.startDate).toISOString().split('T')[0];
      return scheduleDate === dateStr;
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  };

  // 時間をフォーマット
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // 日付をフォーマット
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // 曜日を取得
  const getWeekday = (date: Date) => {
    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
    return weekdays[date.getDay()];
  };

  // 今日かどうかを判定
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // 優先度の色を取得
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    }
  };

  // カテゴリの色を取得
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'work':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'personal':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'meeting':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'reminder':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {weekDates[0].toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
          </h2>
          <button
            onClick={() => navigateWeek('next')}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <button
          onClick={goToToday}
          className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50 rounded-md transition-colors"
        >
          今日
        </button>
      </div>

      {/* 週表示グリッド */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-600">
        {weekDates.map((date, index) => {
          const daySchedules = getSchedulesForDate(date);
          const isCurrentDay = isToday(date);

          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 min-h-32 flex flex-col"
            >
              {/* 日付ヘッダー */}
              <div
                className={`p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${isCurrentDay ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                onClick={() => onDateClick(date)}
              >
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {getWeekday(date)}
                  </div>
                  <div
                    className={`text-sm font-medium ${isCurrentDay
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-gray-900 dark:text-white'
                      }`}
                  >
                    {formatDate(date)}
                  </div>
                </div>
              </div>

              {/* スケジュール一覧 */}
              <div className="flex-1 p-2 space-y-1">
                {daySchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className={`p-2 rounded-md border cursor-pointer hover:shadow-sm transition-all ${getPriorityColor(schedule.priority)} ${schedule.isCompleted ? 'opacity-60' : ''
                      }`}
                    onClick={() => onScheduleClick(schedule)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1 mb-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleComplete(schedule);
                            }}
                            className="flex-shrink-0 hover:scale-110 transition-transform"
                          >
                            {schedule.isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : (
                              <Circle className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            )}
                          </button>
                          <div className="flex items-center space-x-1 text-xs">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(schedule.startDate)}</span>
                          </div>
                        </div>
                        <h3 className={`text-sm font-medium truncate ${schedule.isCompleted ? 'line-through' : ''
                          }`}>
                          {schedule.title}
                        </h3>
                        <div className="flex items-center space-x-1 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(schedule.category)}`}>
                            {schedule.category}
                          </span>
                          {schedule.tags && schedule.tags.length > 0 && (
                            <div className="flex items-center space-x-1">
                              <Tag className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {schedule.tags.slice(0, 2).join(', ')}
                                {schedule.tags.length > 2 && '...'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyView; 