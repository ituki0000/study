import fs from 'fs';
import path from 'path';
import { Schedule } from '../types/schedule';

export class DataService {
  private dataPath: string;

  constructor() {
    // データディレクトリとファイルパスを設定
    const dataDir = path.join(process.cwd(), 'data');
    this.dataPath = path.join(dataDir, 'schedules.json');
    
    // データディレクトリが存在しない場合は作成
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  // データを読み込み
  loadSchedules(): Schedule[] {
    try {
      if (fs.existsSync(this.dataPath)) {
        const data = fs.readFileSync(this.dataPath, 'utf8');
        const schedules = JSON.parse(data) as Schedule[];
        console.log(`📂 ${schedules.length}件の予定を読み込みました`);
        return schedules;
      } else {
        console.log('📂 データファイルが見つかりません。新規作成します');
        return [];
      }
    } catch (error) {
      console.error('📂 データの読み込みに失敗しました:', error);
      return [];
    }
  }

  // データを保存
  saveSchedules(schedules: Schedule[]): boolean {
    try {
      const data = JSON.stringify(schedules, null, 2);
      fs.writeFileSync(this.dataPath, data, 'utf8');
      console.log(`💾 ${schedules.length}件の予定を保存しました`);
      return true;
    } catch (error) {
      console.error('💾 データの保存に失敗しました:', error);
      return false;
    }
  }

  // バックアップの作成
  createBackup(): boolean {
    try {
      if (!fs.existsSync(this.dataPath)) {
        return true; // ファイルが存在しない場合はバックアップ不要
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = this.dataPath.replace('.json', `_backup_${timestamp}.json`);
      
      fs.copyFileSync(this.dataPath, backupPath);
      console.log(`🔄 バックアップを作成しました: ${backupPath}`);
      return true;
    } catch (error) {
      console.error('🔄 バックアップの作成に失敗しました:', error);
      return false;
    }
  }

  // データのエクスポート（フロントエンド用）
  exportData(): Schedule[] {
    return this.loadSchedules();
  }

  // データのインポート（フロントエンド用）
  importData(schedules: Schedule[]): boolean {
    // 現在のデータをバックアップ
    this.createBackup();
    
    // 新しいデータを保存
    return this.saveSchedules(schedules);
  }

  // データファイルの統計情報
  getDataStats() {
    try {
      if (fs.existsSync(this.dataPath)) {
        const stats = fs.statSync(this.dataPath);
        const schedules = this.loadSchedules();
        
        return {
          fileExists: true,
          fileSize: stats.size,
          lastModified: stats.mtime,
          scheduleCount: schedules.length,
          completedCount: schedules.filter(s => s.isCompleted).length,
        };
      } else {
        return {
          fileExists: false,
          fileSize: 0,
          lastModified: null,
          scheduleCount: 0,
          completedCount: 0,
        };
      }
    } catch (error) {
      console.error('📊 統計情報の取得に失敗しました:', error);
      return null;
    }
  }
}

export const dataService = new DataService(); 