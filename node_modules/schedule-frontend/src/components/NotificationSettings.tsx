import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Clock, AlertTriangle, TestTube, RefreshCw, Settings } from 'lucide-react';
import { notificationService, NotificationSettings } from '../services/notificationService';
import { ScheduleAPI } from '../services/api';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationSettingsComponent: React.FC<NotificationSettingsProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    reminderMinutes: 15,
    overdueNotifications: true,
  });
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'default' | 'unsupported'>('default');

  useEffect(() => {
    if (isOpen) {
      // 現在の設定を読み込み
      const currentSettings = notificationService.getSettings();
      setSettings(currentSettings);
      
      // 通知権限の状態を確認
      checkNotificationPermission();
    }
  }, [isOpen]);

  const checkNotificationPermission = () => {
    const status = notificationService.getPermissionStatus();
    setPermissionStatus(status);
  };

  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) {
      alert('このブラウザは通知をサポートしていません。');
      return;
    }

    const permission = await notificationService.checkPermission();
    if (permission) {
      const newSettings = { ...settings, enabled: true };
      setSettings(newSettings);
      notificationService.updateSettings(newSettings);
      setPermissionStatus('granted');
    } else {
      const status = notificationService.getPermissionStatus();
      setPermissionStatus(status);
      if (status === 'denied') {
        alert('通知が拒否されています。ブラウザのアドレスバー左側の錠前アイコンから通知を許可してください。');
      } else {
        alert('通知を使用するには、ブラウザで通知を許可する必要があります。');
      }
    }
  };

  const handleSettingsChange = (key: keyof NotificationSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    notificationService.updateSettings(newSettings);
  };

  const handleTestNotification = () => {
    if (settings.enabled) {
      notificationService.showTestNotification();
    } else {
      alert('通知を有効にしてからテストしてください。');
    }
  };

  const handleCreateTestSchedule = async () => {
    if (!settings.enabled) {
      alert('通知を有効にしてからテストしてください。');
      return;
    }

    try {
      const now = new Date();
      const startTime = new Date(now.getTime() + 2 * 60 * 1000); // 2分後
      const endTime = new Date(startTime.getTime() + 15 * 60 * 1000); // 15分間

      await ScheduleAPI.createSchedule({
        title: '🔔 通知テスト',
        description: 'この予定は通知機能のテスト用に作成されました',
        startDate: startTime.toISOString(),
        endDate: endTime.toISOString(),
        category: 'reminder',
        priority: 'medium',
      });

      alert(`✅ テスト予定を作成しました！\n開始時刻: ${startTime.toLocaleTimeString()}\n${settings.reminderMinutes}分前（${new Date(startTime.getTime() - settings.reminderMinutes * 60 * 1000).toLocaleTimeString()}）に通知が表示されます。`);
      onClose();
    } catch (error) {
      console.error('テスト予定の作成に失敗:', error);
      alert('テスト予定の作成に失敗しました。');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto transition-colors">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              通知設定
            </h2>
            <button
              onClick={checkNotificationPermission}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="権限状態を更新"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            ×
          </button>
        </div>

        {/* 設定内容 */}
        <div className="p-6 space-y-6">
          {/* 通知許可状況 */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              {permissionStatus === 'granted' ? (
                <Bell className="h-5 w-5 text-green-500" />
              ) : permissionStatus === 'denied' ? (
                <BellOff className="h-5 w-5 text-red-500" />
              ) : (
                <BellOff className="h-5 w-5 text-gray-400" />
              )}
              <span className="font-medium text-gray-900 dark:text-white">
                通知権限: {
                  permissionStatus === 'granted' ? '許可済み' :
                  permissionStatus === 'denied' ? '拒否済み' :
                  permissionStatus === 'unsupported' ? 'サポートなし' : '未設定'
                }
              </span>
            </div>
            {permissionStatus === 'denied' && (
              <div className="text-sm text-red-600 dark:text-red-400 mb-3">
                <p className="mb-2">通知が拒否されています。以下の手順で許可してください：</p>
                <ul className="list-disc list-inside space-y-1 text-xs mb-3">
                  <li>アドレスバー左側の🔒マークをクリック</li>
                  <li>「通知」を「許可」に変更</li>
                  <li>ページを再読み込み（F5キー）</li>
                </ul>
                <div className="flex space-x-2">
                  <button
                    onClick={() => window.open('edge://settings/content/notifications', '_blank')}
                    className="text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 px-2 py-1 rounded"
                  >
                    Edge設定を開く
                  </button>
                  <button
                    onClick={() => window.open('chrome://settings/content/notifications', '_blank')}
                    className="text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 px-2 py-1 rounded"
                  >
                    Chrome設定を開く
                  </button>
                </div>
              </div>
            )}
            {permissionStatus === 'default' && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                通知を使用するには、ブラウザで通知を許可する必要があります。
              </p>
            )}
            {permissionStatus === 'unsupported' && (
              <p className="text-sm text-orange-600 dark:text-orange-400 mb-3">
                このブラウザは通知機能をサポートしていません。
              </p>
            )}
          </div>

          {/* 通知の有効/無効 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-gray-400" />
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  通知を有効にする
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  予定のリマインダーと期限切れ通知を受け取る
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!settings.enabled && permissionStatus === 'granted' && (
                <button
                  onClick={handleEnableNotifications}
                  className="btn-primary text-xs px-3 py-1"
                >
                  有効にする
                </button>
              )}
              {permissionStatus !== 'granted' && permissionStatus !== 'unsupported' && (
                <button
                  onClick={handleEnableNotifications}
                  className="btn-primary text-xs px-3 py-1"
                >
                  {permissionStatus === 'denied' ? '再許可' : '許可する'}
                </button>
              )}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => handleSettingsChange('enabled', e.target.checked)}
                  disabled={permissionStatus !== 'granted'}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600 peer-disabled:opacity-50"></div>
              </label>
            </div>
          </div>

          {settings.enabled && (
            <>
              {/* リマインダー時間 */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    リマインダー時間
                  </label>
                </div>
                <div className="ml-8">
                  <select
                    value={settings.reminderMinutes}
                    onChange={(e) => handleSettingsChange('reminderMinutes', parseInt(e.target.value))}
                    className="select-field w-full"
                  >
                    <option value={5}>5分前</option>
                    <option value={10}>10分前</option>
                    <option value={15}>15分前</option>
                    <option value={30}>30分前</option>
                    <option value={60}>1時間前</option>
                    <option value={120}>2時間前</option>
                    <option value={1440}>1日前</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    予定開始の何分前に通知するかを設定
                  </p>
                </div>
              </div>

              {/* 期限切れ通知 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-gray-400" />
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      期限切れ通知
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      予定の期限が過ぎた時に通知を表示
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.overdueNotifications}
                    onChange={(e) => handleSettingsChange('overdueNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>

              {/* テスト通知 */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <button
                  onClick={handleTestNotification}
                  className="btn-secondary w-full flex items-center justify-center space-x-2"
                >
                  <TestTube className="h-4 w-4" />
                  <span>テスト通知を送信</span>
                </button>
                
                <button
                  onClick={handleCreateTestSchedule}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  <Bell className="h-4 w-4" />
                  <span>2分後の予定を作成（通知テスト）</span>
                </button>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  即座にテスト通知を送信するか、実際の予定を作成して通知をテストできます
                </p>
              </div>
            </>
          )}

          {/* Windowsシステム設定案内 */}
          {permissionStatus === 'denied' && (
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2 flex items-center">
                <Settings className="h-4 w-4 mr-1" />
                Windows システム設定の確認
              </h3>
              <p className="text-xs text-orange-700 dark:text-orange-300 mb-2">
                ブラウザで許可しても通知が表示されない場合：
              </p>
              <ul className="text-xs text-orange-700 dark:text-orange-300 space-y-1">
                <li>• Windows設定 → システム → 通知とアクション</li>
                <li>• 「アプリやその他の送信者からの通知を取得する」をオン</li>
                <li>• Microsoft Edge（またはChrome）の通知をオン</li>
                <li>• 集中モード/おやすみモードをオフ</li>
              </ul>
            </div>
          )}

          {/* 使用方法の説明 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              💡 通知機能について
            </h3>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <li>• 予定の開始前にリマインダー通知を表示</li>
              <li>• 予定開始時に開始通知を表示</li>
              <li>• 期限切れの予定に対してアラート通知を表示</li>
              <li>• 完了済みの予定には通知されません</li>
              <li>• ブラウザを閉じると通知は停止されます</li>
            </ul>
          </div>
        </div>

        {/* フッター */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="btn-primary"
          >
            完了
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsComponent; 