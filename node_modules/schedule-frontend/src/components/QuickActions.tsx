import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  Plus, 
  Calendar, 
  Search, 
  Command, 
  Clock,
  X,
  ArrowRight,
  Filter,
  BarChart3
} from 'lucide-react';
import { Schedule } from '../types/schedule';

interface QuickActionsProps {
  onQuickAddSchedule: (title: string, date?: Date) => void;
  onShowToday: () => void;
  onShowSearch: () => void;
  onShowStats: () => void;
  onShowFilter: () => void;
  todaySchedules: Schedule[];
}

interface ShortcutCommand {
  key: string;
  description: string;
  action: () => void;
  icon: React.ReactNode;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onQuickAddSchedule,
  onShowToday,
  onShowSearch,
  onShowStats,
  onShowFilter,
  todaySchedules
}) => {
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickDate, setQuickDate] = useState('');
  const [showTodayPreview, setShowTodayPreview] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [filteredCommands, setFilteredCommands] = useState<ShortcutCommand[]>([]);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  
  const quickMenuRef = useRef<HTMLDivElement>(null);
  const quickAddRef = useRef<HTMLInputElement>(null);

  // ショートカットコマンド定義
  const commands: ShortcutCommand[] = [
    {
      key: 'Ctrl/Cmd + N',
      description: '新しい予定を作成',
      action: () => {
        setShowQuickAdd(true);
        setShowQuickMenu(false);
      },
      icon: <Plus className="h-4 w-4" />
    },
    {
      key: 'Ctrl/Cmd + T',
      description: '今日の予定を表示',
      action: () => {
        onShowToday();
        setShowQuickMenu(false);
      },
      icon: <Calendar className="h-4 w-4" />
    },
    {
      key: 'Ctrl/Cmd + F',
      description: '検索を開く',
      action: () => {
        onShowSearch();
        setShowQuickMenu(false);
      },
      icon: <Search className="h-4 w-4" />
    },
    {
      key: 'Ctrl/Cmd + S',
      description: '統計を表示',
      action: () => {
        onShowStats();
        setShowQuickMenu(false);
      },
      icon: <BarChart3 className="h-4 w-4" />
    },
    {
      key: 'Ctrl/Cmd + L',
      description: 'フィルターを開く',
      action: () => {
        onShowFilter();
        setShowQuickMenu(false);
      },
      icon: <Filter className="h-4 w-4" />
    }
  ];

  useEffect(() => {
    // ショートカットキーの設定
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      
      if (isCtrlOrCmd) {
        switch (e.key.toLowerCase()) {
          case 'k':
            e.preventDefault();
            setShowQuickMenu(true);
            break;
          case 'n':
            e.preventDefault();
            setShowQuickAdd(true);
            break;
          case 't':
            e.preventDefault();
            onShowToday();
            break;
          case 'f':
            e.preventDefault();
            onShowSearch();
            break;
          case 's':
            e.preventDefault();
            onShowStats();
            break;
          case 'l':
            e.preventDefault();
            onShowFilter();
            break;
        }
      }

      // Escapeキーでメニューを閉じる
      if (e.key === 'Escape') {
        setShowQuickMenu(false);
        setShowQuickAdd(false);
        setShowTodayPreview(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onShowToday, onShowSearch, onShowStats, onShowFilter]);

  useEffect(() => {
    // コマンド検索のフィルタリング
    if (commandQuery) {
      const filtered = commands.filter(cmd =>
        cmd.description.toLowerCase().includes(commandQuery.toLowerCase()) ||
        cmd.key.toLowerCase().includes(commandQuery.toLowerCase())
      );
      setFilteredCommands(filtered);
      setSelectedCommandIndex(0);
    } else {
      setFilteredCommands(commands);
      setSelectedCommandIndex(0);
    }
  }, [commandQuery]);

  useEffect(() => {
    // クイックメニューが開いたときにフォーカス
    if (showQuickMenu && quickMenuRef.current) {
      const input = quickMenuRef.current.querySelector('input');
      input?.focus();
    }
  }, [showQuickMenu]);

  useEffect(() => {
    // クイック追加が開いたときにフォーカス
    if (showQuickAdd && quickAddRef.current) {
      quickAddRef.current.focus();
    }
  }, [showQuickAdd]);

  const handleQuickMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedCommandIndex(prev => 
        prev < filteredCommands.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedCommandIndex(prev => 
        prev > 0 ? prev - 1 : filteredCommands.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedCommandIndex]) {
        filteredCommands[selectedCommandIndex].action();
      }
    }
  };

  const handleQuickAdd = () => {
    if (quickTitle.trim()) {
      const date = quickDate ? new Date(quickDate) : new Date();
      onQuickAddSchedule(quickTitle.trim(), date);
      setQuickTitle('');
      setQuickDate('');
      setShowQuickAdd(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ja-JP', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTodayUpcoming = () => {
    const now = new Date();
    return todaySchedules
      .filter(schedule => new Date(schedule.startDate) > now)
      .slice(0, 3);
  };

  return (
    <>
      {/* フローティングクイックアクションボタン */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-40">
        {/* 今日の予定プレビュー */}
        <button
          onClick={() => setShowTodayPreview(!showTodayPreview)}
          className="relative p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
          title="今日の予定"
        >
          <Clock className="h-5 w-5" />
          {todaySchedules.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {todaySchedules.length}
            </span>
          )}
        </button>

        {/* クイックメニューボタン */}
        <button
          onClick={() => setShowQuickMenu(true)}
          className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          title="クイックアクション (Ctrl/Cmd + K)"
        >
          <Zap className="h-5 w-5" />
        </button>
      </div>

      {/* 今日の予定プレビュー */}
      {showTodayPreview && (
        <div className="fixed bottom-24 right-6 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-40">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                今日の予定
              </h3>
              <button
                onClick={() => setShowTodayPreview(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {todaySchedules.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                今日の予定はありません
              </p>
            ) : (
              <div className="space-y-2">
                {getTodayUpcoming().map(schedule => (
                  <div key={schedule.id} className="flex items-center space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="text-xs text-gray-500 dark:text-gray-400 min-w-[3rem]">
                      {formatTime(schedule.startDate)}
                    </div>
                    <div className="flex-1 truncate">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {schedule.title}
                      </div>
                    </div>
                  </div>
                ))}
                {todaySchedules.length > 3 && (
                  <button
                    onClick={() => {
                      onShowToday();
                      setShowTodayPreview(false);
                    }}
                    className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center justify-center space-x-1"
                  >
                    <span>他 {todaySchedules.length - 3} 件を表示</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* クイックアクションメニュー */}
      {showQuickMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-24 z-50">
          <div 
            ref={quickMenuRef}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mx-4"
          >
            <div className="p-4">
              <div className="flex items-center space-x-3 mb-4">
                <Command className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="コマンドを検索..."
                  value={commandQuery}
                  onChange={(e) => setCommandQuery(e.target.value)}
                  onKeyDown={handleQuickMenuKeyDown}
                  className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <button
                  onClick={() => setShowQuickMenu(false)}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {filteredCommands.map((command, index) => (
                  <button
                    key={index}
                    onClick={command.action}
                    className={`w-full flex items-center justify-between p-3 rounded-md transition-colors ${
                      index === selectedCommandIndex
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-gray-500 dark:text-gray-400">
                        {command.icon}
                      </div>
                      <span className="text-gray-900 dark:text-white">
                        {command.description}
                      </span>
                    </div>
                    <kbd className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {command.key}
                    </kbd>
                  </button>
                ))}
              </div>
              
              {filteredCommands.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>コマンドが見つかりません</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* クイック予定追加 */}
      {showQuickAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  クイック予定追加
                </h3>
                <button
                  onClick={() => setShowQuickAdd(false)}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    予定タイトル *
                  </label>
                  <input
                    ref={quickAddRef}
                    type="text"
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleQuickAdd()}
                    placeholder="会議、ランチ、など..."
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    開始日時（省略時は今日）
                  </label>
                  <input
                    type="datetime-local"
                    value={quickDate}
                    onChange={(e) => setQuickDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowQuickAdd(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleQuickAdd}
                  disabled={!quickTitle.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  追加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickActions; 