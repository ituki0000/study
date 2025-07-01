import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, parseISO, getDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Schedule, CATEGORY_OPTIONS } from '../types/schedule';

interface CalendarViewProps {
  schedules: Schedule[];
  onDateClick: (date: Date) => void;
  onScheduleClick: (schedule: Schedule) => void;
  onAddSchedule: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  schedules,
  onDateClick,
  onScheduleClick,
  onAddSchedule,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // カレンダーの日付配列を生成
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // 日曜日開始
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days = [];
    let day = calendarStart;

    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  }, [currentDate]);

  // 特定の日の予定を取得
  const getSchedulesForDate = (date: Date): Schedule[] => {
    return schedules.filter(schedule => {
      const scheduleStart = parseISO(schedule.startDate);
      return isSameDay(scheduleStart, date);
    });
  };

  // カテゴリの色を取得
  const getCategoryColor = (category: Schedule['category']): string => {
    const colors = {
      work: 'bg-blue-500',
      personal: 'bg-green-500',
      meeting: 'bg-purple-500',
      reminder: 'bg-orange-500',
      other: 'bg-gray-500',
    };
    return colors[category];
  };

  // 優先度のボーダー色を取得
  const getPriorityBorder = (priority: Schedule['priority']): string => {
    const borders = {
      high: 'border-l-4 border-red-500',
      medium: 'border-l-4 border-yellow-500',
      low: 'border-l-4 border-green-500',
    };
    return borders[priority];
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
      {/* カレンダーヘッダー */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="前月"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white min-w-[180px] text-center">
              {format(currentDate, 'yyyy年 M月', { locale: ja })}
            </h2>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="次月"
            >
              <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
          >
            今日
          </button>
        </div>

        <button
          onClick={onAddSchedule}
          className="btn-primary flex items-center space-x-2 text-sm"
        >
          <Plus className="h-4 w-4" />
          <span>予定追加</span>
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 bg-gray-100 dark:bg-gray-600">
        {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
          <div
            key={day}
            className={`p-3 text-center text-sm font-medium ${
              index === 0 ? 'text-red-600 dark:text-red-400' : 
              index === 6 ? 'text-blue-600 dark:text-blue-400' : 
              'text-gray-700 dark:text-gray-300'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* カレンダー本体 */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());
          const daySchedules = getSchedulesForDate(day);
          const dayOfWeek = getDay(day);

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[120px] p-2 border-r border-b border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                !isCurrentMonth ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-800'
              }`}
              onClick={() => onDateClick(day)}
            >
              {/* 日付 */}
              <div className="flex justify-between items-start mb-1">
                <span
                  className={`text-sm font-medium ${
                    !isCurrentMonth 
                      ? 'text-gray-400 dark:text-gray-500' 
                      : isToday
                      ? 'bg-primary-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs'
                      : dayOfWeek === 0
                      ? 'text-red-600 dark:text-red-400'
                      : dayOfWeek === 6
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {format(day, 'd')}
                </span>
                
                {daySchedules.length > 0 && (
                  <span className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-1 rounded">
                    {daySchedules.length}
                  </span>
                )}
              </div>

              {/* 予定リスト */}
              <div className="space-y-1 max-h-[80px] overflow-y-auto">
                {daySchedules.slice(0, 3).map((schedule) => (
                  <div
                    key={schedule.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onScheduleClick(schedule);
                    }}
                    className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${
                      getCategoryColor(schedule.category)
                    } ${getPriorityBorder(schedule.priority)} text-white`}
                    title={`${schedule.title}\n${format(parseISO(schedule.startDate), 'HH:mm')} - ${format(parseISO(schedule.endDate), 'HH:mm')}\n${schedule.description || ''}`}
                  >
                    <div className="flex items-center space-x-1 truncate">
                      <Clock className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">
                        {format(parseISO(schedule.startDate), 'HH:mm')} {schedule.title}
                      </span>
                      {schedule.isCompleted && (
                        <span className="text-xs">✓</span>
                      )}
                    </div>
                  </div>
                ))}
                
                {daySchedules.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    +{daySchedules.length - 3} 件
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* カレンダー凡例 */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-700 dark:text-gray-300">カテゴリ:</span>
            {CATEGORY_OPTIONS.map(({ value, label }) => (
              <div key={value} className="flex items-center space-x-1">
                <div className={`w-3 h-3 rounded ${getCategoryColor(value)}`}></div>
                <span className="text-gray-600 dark:text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-4 mt-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-700 dark:text-gray-300">優先度:</span>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 border-l-2 border-red-500"></div>
              <span className="text-gray-600 dark:text-gray-400">高</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 border-l-2 border-yellow-500"></div>
              <span className="text-gray-600 dark:text-gray-400">中</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 border-l-2 border-green-500"></div>
              <span className="text-gray-600 dark:text-gray-400">低</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView; 