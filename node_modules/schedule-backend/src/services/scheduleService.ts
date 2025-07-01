import { v4 as uuidv4 } from 'uuid';
import { Schedule, CreateScheduleRequest, UpdateScheduleRequest, ScheduleQuery } from '../types/schedule';
import { UseTemplateRequest } from '../types/template';
import { dataService } from './dataService';
import { templateService } from './templateService';

class ScheduleService {
  private schedules: Schedule[] = [];

  constructor() {
    // 保存されたデータを読み込み
    this.loadData();
  }

  private loadData(): void {
    this.schedules = dataService.loadSchedules();
    
    // データが空の場合はデモデータを作成
    if (this.schedules.length === 0) {
      console.log('💡 初回起動のため、デモデータを作成します');
      this.initializeDemoData();
    }
  }

  // 外部からデータを再読み込みする際に使用
  public reloadData(): void {
    this.loadData();
  }

  // 統計データを取得
  public getStatistics() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // 基本統計
    const totalSchedules = this.schedules.length;
    const completedSchedules = this.schedules.filter(s => s.isCompleted).length;
    const overdue = this.schedules.filter(s => 
      new Date(s.endDate) < now && !s.isCompleted
    ).length;

    // 今日の統計
    const todaySchedules = this.schedules.filter(s => {
      const scheduleDate = new Date(s.startDate);
      return scheduleDate >= today && scheduleDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
    });

    // 今週の統計
    const thisWeekEnd = new Date(thisWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    const thisWeekSchedules = this.schedules.filter(s => {
      const scheduleDate = new Date(s.startDate);
      return scheduleDate >= thisWeekStart && scheduleDate < thisWeekEnd;
    });

    // 今月の統計
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const thisMonthSchedules = this.schedules.filter(s => {
      const scheduleDate = new Date(s.startDate);
      return scheduleDate >= thisMonthStart && scheduleDate < thisMonthEnd;
    });

    // カテゴリ別統計
    const categoryStats = {
      work: this.schedules.filter(s => s.category === 'work').length,
      personal: this.schedules.filter(s => s.category === 'personal').length,
      meeting: this.schedules.filter(s => s.category === 'meeting').length,
      reminder: this.schedules.filter(s => s.category === 'reminder').length,
      other: this.schedules.filter(s => s.category === 'other').length,
    };

    // 優先度別統計
    const priorityStats = {
      high: this.schedules.filter(s => s.priority === 'high').length,
      medium: this.schedules.filter(s => s.priority === 'medium').length,
      low: this.schedules.filter(s => s.priority === 'low').length,
    };

    // 完了率データ（過去7日間）
    const completionTrend = [];
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(targetDate.getTime() + 24 * 60 * 60 * 1000);
      
      const daySchedules = this.schedules.filter(s => {
        const scheduleDate = new Date(s.startDate);
        return scheduleDate >= targetDate && scheduleDate < nextDate;
      });
      
      const completed = daySchedules.filter(s => s.isCompleted).length;
      const total = daySchedules.length;
      
      completionTrend.push({
        date: targetDate.toISOString().split('T')[0],
        total: total,
        completed: completed,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      });
    }

    // 月別予定作成数（過去6ヶ月）
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const targetMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthSchedules = this.schedules.filter(s => {
        const createdDate = new Date(s.createdAt);
        return createdDate >= targetMonth && createdDate < nextMonth;
      });
      
      monthlyTrend.push({
        month: targetMonth.toISOString().slice(0, 7),
        count: monthSchedules.length,
        completed: monthSchedules.filter(s => s.isCompleted).length
      });
    }

    return {
      summary: {
        total: totalSchedules,
        completed: completedSchedules,
        completionRate: totalSchedules > 0 ? Math.round((completedSchedules / totalSchedules) * 100) : 0,
        overdue: overdue,
        today: {
          total: todaySchedules.length,
          completed: todaySchedules.filter(s => s.isCompleted).length,
          remaining: todaySchedules.filter(s => !s.isCompleted).length
        },
        thisWeek: {
          total: thisWeekSchedules.length,
          completed: thisWeekSchedules.filter(s => s.isCompleted).length,
          remaining: thisWeekSchedules.filter(s => !s.isCompleted).length
        },
        thisMonth: {
          total: thisMonthSchedules.length,
          completed: thisMonthSchedules.filter(s => s.isCompleted).length,
          remaining: thisMonthSchedules.filter(s => !s.isCompleted).length
        }
      },
      categoryDistribution: categoryStats,
      priorityDistribution: priorityStats,
      completionTrend: completionTrend,
      monthlyTrend: monthlyTrend,
      generatedAt: new Date().toISOString()
    };
  }

  private initializeDemoData(): void {
    const demoSchedules: Schedule[] = [
      {
        id: uuidv4(),
        title: 'プロジェクト会議',
        description: '新機能について議論',
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
        category: 'meeting',
        priority: 'high',
        isCompleted: false,
        tags: ['重要', '開発', 'チーム'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        title: '歯医者の予約',
        description: '定期検診',
        startDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 48 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
        category: 'personal',
        priority: 'medium',
        isCompleted: false,
        tags: ['健康', '定期'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    this.schedules = demoSchedules;
    this.saveData(); // デモデータを保存
  }

  private saveData(): void {
    dataService.saveSchedules(this.schedules);
  }

  getAllSchedules(query?: ScheduleQuery): Schedule[] {
    let filteredSchedules = [...this.schedules];

    if (query) {
      if (query.category) {
        filteredSchedules = filteredSchedules.filter(s => s.category === query.category);
      }
      if (query.priority) {
        filteredSchedules = filteredSchedules.filter(s => s.priority === query.priority);
      }
      if (query.isCompleted !== undefined) {
        filteredSchedules = filteredSchedules.filter(s => s.isCompleted === query.isCompleted);
      }
      if (query.search) {
        const searchLower = query.search.toLowerCase();
        filteredSchedules = filteredSchedules.filter(s => 
          s.title.toLowerCase().includes(searchLower) ||
          (s.description && s.description.toLowerCase().includes(searchLower))
        );
      }
      if (query.tags && query.tags.length > 0) {
        filteredSchedules = filteredSchedules.filter(s => 
          s.tags && query.tags!.some(tag => s.tags!.includes(tag))
        );
      }
      if (query.startDate && query.endDate) {
        filteredSchedules = filteredSchedules.filter(s => {
          const scheduleStart = new Date(s.startDate);
          const queryStart = new Date(query.startDate!);
          const queryEnd = new Date(query.endDate!);
          return scheduleStart >= queryStart && scheduleStart <= queryEnd;
        });
      }
    }

    return filteredSchedules.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }

  getScheduleById(id: string): Schedule | null {
    return this.schedules.find(s => s.id === id) || null;
  }

  createSchedule(data: CreateScheduleRequest): Schedule {
    const newSchedule: Schedule = {
      id: uuidv4(),
      ...data,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.schedules.push(newSchedule);

    // 繰り返し予定の生成
    if (data.repeatType && data.repeatType !== 'none') {
      this.generateRecurringSchedules(newSchedule);
    }

    this.saveData(); // 自動保存
    return newSchedule;
  }

  private generateRecurringSchedules(parentSchedule: Schedule): void {
    if (!parentSchedule.repeatType || parentSchedule.repeatType === 'none') {
      return;
    }

    const startDate = new Date(parentSchedule.startDate);
    const endDate = new Date(parentSchedule.endDate);
    const duration = endDate.getTime() - startDate.getTime();
    const repeatEndDate = parentSchedule.repeatEndDate ? new Date(parentSchedule.repeatEndDate) : null;
    const interval = parentSchedule.repeatInterval || 1;
    
    // 最大100回の繰り返しに制限（無限ループ防止）
    const maxOccurrences = 100;
    let currentDate = new Date(startDate);
    let occurrenceCount = 0;

    while (occurrenceCount < maxOccurrences) {
      // 次の繰り返し日を計算
      currentDate = this.getNextOccurrence(currentDate, parentSchedule.repeatType, interval, parentSchedule.repeatDays);
      
      // 終了条件チェック
      if (repeatEndDate && currentDate > repeatEndDate) {
        break;
      }

      // 新しい繰り返し予定を作成
      const recurringSchedule: Schedule = {
        ...parentSchedule,
        id: uuidv4(),
        startDate: currentDate.toISOString(),
        endDate: new Date(currentDate.getTime() + duration).toISOString(),
        parentId: parentSchedule.id,
        isRecurring: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.schedules.push(recurringSchedule);
      occurrenceCount++;
    }
  }

  private getNextOccurrence(
    currentDate: Date, 
    repeatType: NonNullable<Schedule['repeatType']>, 
    interval: number,
    repeatDays?: number[]
  ): Date {
    const nextDate = new Date(currentDate);

    switch (repeatType) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + interval);
        break;
      
      case 'weekly':
        if (repeatDays && repeatDays.length > 0) {
          // 特定の曜日に繰り返す
          const currentDayOfWeek = nextDate.getDay();
          const sortedDays = repeatDays.sort((a, b) => a - b);
          
          // 今週の次の対象曜日を探す
          let nextDay = sortedDays.find(day => day > currentDayOfWeek);
          
          if (nextDay !== undefined) {
            // 今週内に次の曜日がある
            nextDate.setDate(nextDate.getDate() + (nextDay - currentDayOfWeek));
          } else if (sortedDays.length > 0) {
            // 来週の最初の対象曜日
            const firstDay = sortedDays[0]!; // 配列の長さを確認済みなので安全
            const daysUntilNextWeek = 7 - currentDayOfWeek + firstDay + (interval - 1) * 7;
            nextDate.setDate(nextDate.getDate() + daysUntilNextWeek);
          } else {
            // 曜日が指定されていない場合は週間隔で繰り返す
            nextDate.setDate(nextDate.getDate() + (7 * interval));
          }
        } else {
          // 単純に週間隔で繰り返す
          nextDate.setDate(nextDate.getDate() + (7 * interval));
        }
        break;
      
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + interval);
        break;
      
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + interval);
        break;
    }

    return nextDate;
  }

  updateSchedule(id: string, data: UpdateScheduleRequest): Schedule | null {
    const index = this.schedules.findIndex(s => s.id === id);
    if (index === -1) {
      return null;
    }

    const existingSchedule = this.schedules[index];
    if (!existingSchedule) {
      return null;
    }

    const updatedSchedule: Schedule = {
      id: existingSchedule.id,
      title: data.title ?? existingSchedule.title,
      description: data.description ?? existingSchedule.description,
      startDate: data.startDate ?? existingSchedule.startDate,
      endDate: data.endDate ?? existingSchedule.endDate,
      category: data.category ?? existingSchedule.category,
      priority: data.priority ?? existingSchedule.priority,
      isCompleted: data.isCompleted ?? existingSchedule.isCompleted,
      tags: data.tags ?? existingSchedule.tags,
      createdAt: existingSchedule.createdAt,
      updatedAt: new Date().toISOString(),
      // 繰り返し設定も保持
      repeatType: existingSchedule.repeatType,
      repeatInterval: existingSchedule.repeatInterval,
      repeatEndDate: existingSchedule.repeatEndDate,
      repeatDays: existingSchedule.repeatDays,
      parentId: existingSchedule.parentId,
      isRecurring: existingSchedule.isRecurring,
    };

    this.schedules[index] = updatedSchedule;
    this.saveData(); // 自動保存
    return updatedSchedule;
  }

  deleteSchedule(id: string): boolean {
    const index = this.schedules.findIndex(s => s.id === id);
    if (index === -1) {
      return false;
    }

    this.schedules.splice(index, 1);
    this.saveData(); // 自動保存
    return true;
  }

  // 複数の予定を一括削除
  deleteMultipleSchedules(ids: string[]): { deletedCount: number; errors: string[] } {
    let deletedCount = 0;
    const errors: string[] = [];

    for (const id of ids) {
      const index = this.schedules.findIndex(s => s.id === id);
      if (index !== -1) {
        this.schedules.splice(index, 1);
        deletedCount++;
      } else {
        errors.push(`予定ID "${id}" が見つかりません`);
      }
    }

    if (deletedCount > 0) {
      this.saveData(); // 一括で保存
    }

    return { deletedCount, errors };
  }

  // 全ての予定を削除
  deleteAllSchedules(): { deletedCount: number } {
    const deletedCount = this.schedules.length;
    this.schedules = [];
    this.saveData(); // 保存
    
    console.log(`🗑️ 全ての予定を削除しました（${deletedCount}件）`);
    return { deletedCount };
  }

  // テンプレートから予定を作成
  createScheduleFromTemplate(data: UseTemplateRequest): Schedule {
    const template = templateService.getTemplateById(data.templateId);
    if (!template) {
      throw new Error('テンプレートが見つかりません');
    }

    // 開始日時を解析
    const startDate = new Date(data.startDate);
    // 終了日時を計算（開始日時 + テンプレートの所要時間）
    const endDate = new Date(startDate.getTime() + template.duration * 60 * 1000);

    // 予定データを作成（繰り返し設定は無効にして単発の予定として作成）
    const scheduleData: CreateScheduleRequest = {
      title: data.title || template.name,
      description: data.description 
        ? `${template.description || ''}\n\n${data.description}`.trim()
        : template.description,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      category: template.category,
      priority: template.priority,
      tags: template.tags || [],
      // テンプレートから作成する際は単発の予定として作成（繰り返し設定は無効）
      repeatType: 'none',
      repeatInterval: undefined,
      repeatDays: undefined
    };

    // 単発の予定として作成
    return this.createSchedule(scheduleData);
  }

  // 予定からテンプレートを作成
  createTemplateFromSchedule(scheduleId: string, templateName: string): any {
    const schedule = this.getScheduleById(scheduleId);
    if (!schedule) {
      throw new Error('予定が見つかりません');
    }

    // 所要時間を計算
    const startTime = new Date(schedule.startDate).getTime();
    const endTime = new Date(schedule.endDate).getTime();
    const duration = Math.round((endTime - startTime) / (1000 * 60)); // 分単位

    // テンプレートデータを作成
    const templateData = {
      name: templateName,
      description: schedule.description,
      category: schedule.category,
      priority: schedule.priority,
      duration: duration,
      tags: schedule.tags,
      repeatType: schedule.repeatType,
      repeatInterval: schedule.repeatInterval,
      repeatDays: schedule.repeatDays
    };

    return templateService.createTemplate(templateData);
  }
}

export const scheduleService = new ScheduleService(); 