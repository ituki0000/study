export interface NotificationSettings {
  enabled: boolean;
  reminderMinutes: number; // 何分前に通知するか
  overdueNotifications: boolean; // 期限切れ通知
}

class NotificationService {
  private settings: NotificationSettings = {
    enabled: false,
    reminderMinutes: 15,
    overdueNotifications: true,
  };

  private activeTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    // 設定をローカルストレージから読み込み
    this.loadSettings();
    
    // 通知権限の確認
    this.checkPermission();
  }

  // 通知権限の確認と要求
  async checkPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('このブラウザは通知をサポートしていません');
      return false;
    }

    let permission = Notification.permission;

    if (permission === 'default') {
      try {
        permission = await Notification.requestPermission();
      } catch (error) {
        console.error('通知権限の要求に失敗:', error);
        return false;
      }
    }

    if (permission === 'granted') {
      console.log('通知が許可されました');
      return true;
    } else if (permission === 'denied') {
      console.warn('通知が拒否されました - ブラウザ設定から許可してください');
      this.settings.enabled = false;
      this.saveSettings();
      return false;
    } else {
      console.warn('通知権限が不明な状態です');
      return false;
    }
  }

  // 通知権限の状態を取得
  getPermissionStatus(): 'granted' | 'denied' | 'default' | 'unsupported' {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  // 設定の取得
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  // 設定の更新
  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    
    // 通知が無効になった場合、すべてのタイマーをクリア
    if (!this.settings.enabled) {
      this.clearAllTimers();
    }
  }

  // 設定の保存
  private saveSettings(): void {
    localStorage.setItem('notificationSettings', JSON.stringify(this.settings));
  }

  // 設定の読み込み
  private loadSettings(): void {
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
      try {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      } catch (error) {
        console.error('通知設定の読み込みに失敗:', error);
      }
    }
  }

  // 予定に対する通知のスケジュール
  scheduleNotification(schedule: { id: string; title: string; startDate: string; endDate: string }): void {
    if (!this.settings.enabled) return;

    // 既存のタイマーをクリア
    this.clearNotification(schedule.id);

    const now = new Date();
    const startTime = new Date(schedule.startDate);
    const endTime = new Date(schedule.endDate);
    
    // リマインダー通知のスケジュール
    const reminderTime = new Date(startTime.getTime() - this.settings.reminderMinutes * 60 * 1000);
    
    if (reminderTime > now) {
      const reminderDelay = reminderTime.getTime() - now.getTime();
      const reminderTimer = setTimeout(() => {
        this.showNotification(
          '📅 予定のリマインダー',
          `${this.settings.reminderMinutes}分後: ${schedule.title}`,
          'reminder'
        );
      }, reminderDelay);
      
      this.activeTimers.set(`${schedule.id}-reminder`, reminderTimer);
    }

    // 開始通知のスケジュール
    if (startTime > now) {
      const startDelay = startTime.getTime() - now.getTime();
      const startTimer = setTimeout(() => {
        this.showNotification(
          '🚀 予定開始',
          `開始: ${schedule.title}`,
          'start'
        );
      }, startDelay);
      
      this.activeTimers.set(`${schedule.id}-start`, startTimer);
    }

    // 期限切れ通知のスケジュール（完了していない場合）
    if (this.settings.overdueNotifications && endTime > now) {
      const overdueDelay = endTime.getTime() - now.getTime() + 60000; // 1分後
      const overdueTimer = setTimeout(() => {
        this.showNotification(
          '⚠️ 期限切れ',
          `期限切れ: ${schedule.title}`,
          'overdue'
        );
      }, overdueDelay);
      
      this.activeTimers.set(`${schedule.id}-overdue`, overdueTimer);
    }
  }

  // 通知の表示
  private showNotification(title: string, body: string, type: 'reminder' | 'start' | 'overdue'): void {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const options: NotificationOptions = {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `schedule-${type}`,
      requireInteraction: type === 'overdue', // 期限切れは手動で閉じる必要がある
      silent: false,
    };

    try {
      const notification = new Notification(title, options);
      
      // 通知をクリックした時の処理
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // 自動で閉じる（期限切れ以外）
      if (type !== 'overdue') {
        setTimeout(() => {
          notification.close();
        }, 5000);
      }
    } catch (error) {
      console.error('通知の表示に失敗:', error);
    }
  }

  // 特定の予定の通知をクリア
  clearNotification(scheduleId: string): void {
    const timers = [
      `${scheduleId}-reminder`,
      `${scheduleId}-start`,
      `${scheduleId}-overdue`
    ];

    timers.forEach(timerKey => {
      const timer = this.activeTimers.get(timerKey);
      if (timer) {
        clearTimeout(timer);
        this.activeTimers.delete(timerKey);
      }
    });
  }

  // すべての通知タイマーをクリア
  clearAllTimers(): void {
    this.activeTimers.forEach(timer => clearTimeout(timer));
    this.activeTimers.clear();
  }

  // 予定リストに基づいて全通知を再スケジュール
  rescheduleAllNotifications(schedules: Array<{ id: string; title: string; startDate: string; endDate: string; isCompleted: boolean }>): void {
    // 既存のタイマーをクリア
    this.clearAllTimers();

    if (!this.settings.enabled) return;

    // 完了していない予定のみ通知をスケジュール
    schedules
      .filter(schedule => !schedule.isCompleted)
      .forEach(schedule => {
        this.scheduleNotification(schedule);
      });
  }

  // テスト通知の表示
  showTestNotification(): void {
    this.showNotification(
      '🔔 テスト通知',
      '通知が正常に動作しています！',
      'reminder'
    );
  }
}

export const notificationService = new NotificationService(); 