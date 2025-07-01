import { v4 as uuidv4 } from 'uuid';
import { Schedule, CreateScheduleRequest, UpdateScheduleRequest, ScheduleQuery } from '../types/schedule';

class ScheduleService {
  private schedules: Schedule[] = [];

  constructor() {
    // デモデータを初期化
    this.initializeDemoData();
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    this.schedules = demoSchedules;
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
    return newSchedule;
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
      createdAt: existingSchedule.createdAt,
      updatedAt: new Date().toISOString(),
    };

    this.schedules[index] = updatedSchedule;
    return updatedSchedule;
  }

  deleteSchedule(id: string): boolean {
    const index = this.schedules.findIndex(s => s.id === id);
    if (index === -1) {
      return false;
    }

    this.schedules.splice(index, 1);
    return true;
  }
}

export const scheduleService = new ScheduleService(); 