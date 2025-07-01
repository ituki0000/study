import { v4 as uuidv4 } from 'uuid';
import { ScheduleTemplate, CreateTemplateRequest, UpdateTemplateRequest } from '../types/template';
import fs from 'fs';
import path from 'path';

class TemplateService {
  private templates: ScheduleTemplate[] = [];
  private dataFilePath = path.join(__dirname, '../../data/templates.json');

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    try {
      // ディレクトリが存在しない場合は作成
      const dataDir = path.dirname(this.dataFilePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // ファイルが存在する場合は読み込み
      if (fs.existsSync(this.dataFilePath)) {
        const data = fs.readFileSync(this.dataFilePath, 'utf-8');
        this.templates = JSON.parse(data);
        console.log(`📄 ${this.templates.length}件のテンプレートを読み込みました`);
      } else {
        // ファイルが存在しない場合はデフォルトテンプレートを作成
        this.initializeDefaultTemplates();
      }
    } catch (error) {
      console.error('テンプレートデータ読み込みエラー:', error);
      this.initializeDefaultTemplates();
    }
  }

  private saveData(): void {
    try {
      fs.writeFileSync(this.dataFilePath, JSON.stringify(this.templates, null, 2), 'utf-8');
      console.log(`💾 ${this.templates.length}件のテンプレートを保存しました`);
    } catch (error) {
      console.error('テンプレートデータ保存エラー:', error);
    }
  }

  private initializeDefaultTemplates(): void {
    const defaultTemplates: ScheduleTemplate[] = [
      {
        id: uuidv4(),
        name: '定期会議',
        description: 'チームの定期会議テンプレート',
        category: 'meeting',
        priority: 'medium',
        duration: 60, // 1時間
        tags: ['会議', 'チーム'],
        repeatType: 'weekly',
        repeatInterval: 1,
        repeatDays: [1], // 月曜日
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: '1on1面談',
        description: '個別面談のテンプレート',
        category: 'meeting',
        priority: 'high',
        duration: 30, // 30分
        tags: ['面談', '1on1'],
        repeatType: 'weekly',
        repeatInterval: 2, // 2週間毎
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: '運動',
        description: '定期的な運動の予定',
        category: 'personal',
        priority: 'medium',
        duration: 45, // 45分
        tags: ['健康', '運動'],
        repeatType: 'daily',
        repeatInterval: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: '月次レポート作成',
        description: '月次レポートの作成作業',
        category: 'work',
        priority: 'high',
        duration: 120, // 2時間
        tags: ['レポート', '月次'],
        repeatType: 'monthly',
        repeatInterval: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: '歯医者予約',
        description: '定期健診の予約テンプレート',
        category: 'personal',
        priority: 'medium',
        duration: 30, // 30分
        tags: ['健康', '定期健診'],
        repeatType: 'none',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    this.templates = defaultTemplates;
    this.saveData();
    console.log('💡 デフォルトテンプレートを作成しました');
  }

  // 全テンプレートを取得
  getAllTemplates(): ScheduleTemplate[] {
    return [...this.templates].sort((a, b) => a.name.localeCompare(b.name));
  }

  // 特定のテンプレートを取得
  getTemplateById(id: string): ScheduleTemplate | null {
    return this.templates.find(t => t.id === id) || null;
  }

  // カテゴリ別テンプレートを取得
  getTemplatesByCategory(category: ScheduleTemplate['category']): ScheduleTemplate[] {
    return this.templates.filter(t => t.category === category);
  }

  // 新しいテンプレートを作成
  createTemplate(data: CreateTemplateRequest): ScheduleTemplate {
    const newTemplate: ScheduleTemplate = {
      id: uuidv4(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.templates.push(newTemplate);
    this.saveData();
    return newTemplate;
  }

  // テンプレートを更新
  updateTemplate(id: string, data: UpdateTemplateRequest): ScheduleTemplate | null {
    const index = this.templates.findIndex(t => t.id === id);
    if (index === -1) {
      return null;
    }

    const existingTemplate = this.templates[index];
    if (!existingTemplate) {
      return null;
    }

    const updatedTemplate: ScheduleTemplate = {
      ...existingTemplate,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.templates[index] = updatedTemplate;
    this.saveData();
    return updatedTemplate;
  }

  // テンプレートを削除
  deleteTemplate(id: string): boolean {
    const index = this.templates.findIndex(t => t.id === id);
    if (index === -1) {
      return false;
    }

    this.templates.splice(index, 1);
    this.saveData();
    return true;
  }

  // テンプレートを複製
  duplicateTemplate(id: string, newName?: string): ScheduleTemplate | null {
    const original = this.getTemplateById(id);
    if (!original) {
      return null;
    }

    const duplicated: ScheduleTemplate = {
      ...original,
      id: uuidv4(),
      name: newName || `${original.name} (コピー)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.templates.push(duplicated);
    this.saveData();
    return duplicated;
  }

  // 使用頻度を取得（将来の拡張用）
  getTemplateUsageStats(): { [templateId: string]: number } {
    // 実装は将来の拡張で追加
    // 現在は空のオブジェクトを返す
    return {};
  }
}

export const templateService = new TemplateService(); 