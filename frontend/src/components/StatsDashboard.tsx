import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, Calendar, CheckCircle, AlertCircle, 
  PieChart as PieChartIcon, BarChart3, Clock, Target 
} from 'lucide-react';
import { ScheduleAPI, AnalyticsData } from '../services/api';
import { CATEGORY_OPTIONS } from '../types/schedule';

const StatsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // データを読み込み
  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ScheduleAPI.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '統計データの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  // ローディング表示
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">統計データを読み込み中...</p>
      </div>
    );
  }

  // エラー表示
  if (error || !analytics) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={loadAnalytics}
          className="mt-4 btn-primary"
        >
          再読み込み
        </button>
      </div>
    );
  }

  // グラフの色設定
  const COLORS = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    gray: '#6b7280',
  };

  // カテゴリ別データを準備
  const categoryData = Object.entries(analytics.categoryDistribution).map(([key, value]) => {
    const categoryInfo = CATEGORY_OPTIONS.find(opt => opt.value === key);
    return {
      name: categoryInfo?.label || key,
      value: value,
      color: getCategoryColor(key)
    };
  }).filter(item => item.value > 0);

  // 優先度別データを準備
  const priorityData = [
    { name: '高', value: analytics.priorityDistribution.high, color: COLORS.danger },
    { name: '中', value: analytics.priorityDistribution.medium, color: COLORS.warning },
    { name: '低', value: analytics.priorityDistribution.low, color: COLORS.success },
  ].filter(item => item.value > 0);

  // 完了率トレンドのデータ準備
  const completionTrendData = analytics.completionTrend.map(item => ({
    ...item,
    dateLabel: new Date(item.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })
  }));

  // 月別トレンドのデータ準備
  const monthlyTrendData = analytics.monthlyTrend.map(item => ({
    ...item,
    monthLabel: new Date(item.month + '-01').toLocaleDateString('ja-JP', { year: 'numeric', month: 'short' }),
    completionRate: item.count > 0 ? Math.round((item.completed / item.count) * 100) : 0
  }));

  // カテゴリの色を取得
  function getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
      work: '#3b82f6',
      personal: '#10b981',
      meeting: '#8b5cf6',
      reminder: '#f59e0b',
      other: '#6b7280',
    };
    return colors[category] || colors.other;
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">📊 統計ダッシュボード</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            最終更新: {new Date(analytics.generatedAt).toLocaleString('ja-JP')}
          </p>
        </div>
        <button
          onClick={loadAnalytics}
          className="btn-primary flex items-center space-x-2"
        >
          <TrendingUp className="h-4 w-4" />
          <span>更新</span>
        </button>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 全体統計 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">全予定数</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.summary.total}</p>
              <p className="text-sm text-green-600 dark:text-green-400">完了率 {analytics.summary.completionRate}%</p>
            </div>
            <Calendar className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        {/* 今日の予定 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">今日の予定</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.summary.today.total}</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">残り {analytics.summary.today.remaining}件</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        {/* 完了済み */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">完了済み</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.summary.completed}</p>
              <p className="text-sm text-green-600 dark:text-green-400">+{analytics.summary.thisWeek.completed} 今週</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        {/* 期限切れ */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">期限切れ</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.summary.overdue}</p>
              <p className="text-sm text-red-600 dark:text-red-400">要対応</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* グラフエリア */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 完了率トレンド */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">完了率推移（過去7日間）</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={completionTrendData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis 
                dataKey="dateLabel" 
                className="fill-gray-600 dark:fill-gray-400" 
              />
              <YAxis className="fill-gray-600 dark:fill-gray-400" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="completionRate" 
                stroke={COLORS.primary} 
                strokeWidth={3}
                dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
                name="完了率 (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 月別予定数 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">月別予定数（過去6ヶ月）</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyTrendData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis 
                dataKey="monthLabel" 
                className="fill-gray-600 dark:fill-gray-400" 
              />
              <YAxis className="fill-gray-600 dark:fill-gray-400" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="count" fill={COLORS.primary} name="総数" />
              <Bar dataKey="completed" fill={COLORS.success} name="完了" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 円グラフエリア */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* カテゴリ分布 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center space-x-2 mb-4">
            <PieChartIcon className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">カテゴリ別分布</h3>
          </div>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-300 text-gray-500 dark:text-gray-400">
              データがありません
            </div>
          )}
        </div>

        {/* 優先度分布 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex items-center space-x-2 mb-4">
            <Target className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">優先度別分布</h3>
          </div>
          {priorityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-300 text-gray-500 dark:text-gray-400">
              データがありません
            </div>
          )}
        </div>
      </div>

      {/* 詳細統計 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 transition-colors">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📈 詳細統計</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">今週の実績</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">総予定数:</span>
                <span className="font-medium text-gray-900 dark:text-white">{analytics.summary.thisWeek.total}件</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">完了済み:</span>
                <span className="font-medium text-green-600">{analytics.summary.thisWeek.completed}件</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">未完了:</span>
                <span className="font-medium text-orange-600">{analytics.summary.thisWeek.remaining}件</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">今月の実績</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">総予定数:</span>
                <span className="font-medium text-gray-900 dark:text-white">{analytics.summary.thisMonth.total}件</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">完了済み:</span>
                <span className="font-medium text-green-600">{analytics.summary.thisMonth.completed}件</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">未完了:</span>
                <span className="font-medium text-orange-600">{analytics.summary.thisMonth.remaining}件</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">生産性指標</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">全体完了率:</span>
                <span className="font-medium text-blue-600">{analytics.summary.completionRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">平均予定数/週:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {Math.round(analytics.summary.thisWeek.total)}件
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">要注意:</span>
                <span className="font-medium text-red-600">{analytics.summary.overdue}件期限切れ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;