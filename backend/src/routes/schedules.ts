import express, { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { scheduleService } from '../services/scheduleService';
import { CreateScheduleRequest, UpdateScheduleRequest, ScheduleQuery } from '../types/schedule';
import { dataService } from '../services/dataService';

const router = express.Router();

// バリデーションエラーを処理するミドルウェア
const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: 'バリデーションエラー', details: errors.array() });
    return;
  }
  next();
};

// GET /api/schedules/export - データのエクスポート
router.get('/export', (req: Request, res: Response): void => {
  try {
    const schedules = dataService.exportData();
    const stats = dataService.getDataStats();
    
    res.json({
      data: schedules,
      exportedAt: new Date().toISOString(),
      stats: stats,
      message: `${schedules.length}件の予定をエクスポートしました`
    });
  } catch (error) {
    console.error('データエクスポートエラー:', error);
    res.status(500).json({ error: 'データのエクスポートに失敗しました' });
  }
});

// GET /api/schedules/stats - データ統計情報
router.get('/stats', (req: Request, res: Response): void => {
  try {
    const stats = dataService.getDataStats();
    res.json({ data: stats });
  } catch (error) {
    console.error('統計情報取得エラー:', error);
    res.status(500).json({ error: '統計情報の取得に失敗しました' });
  }
});

// GET /api/schedules/analytics - 詳細分析データ
router.get('/analytics', (req: Request, res: Response): void => {
  try {
    const analytics = scheduleService.getStatistics();
    res.json({ 
      data: analytics,
      message: '分析データを取得しました' 
    });
  } catch (error) {
    console.error('分析データ取得エラー:', error);
    res.status(500).json({ error: '分析データの取得に失敗しました' });
  }
});

// GET /api/schedules - 全予定を取得
router.get('/', [
  query('category').optional().isIn(['work', 'personal', 'meeting', 'reminder', 'other']),
  query('priority').optional().isIn(['low', 'medium', 'high']),
  query('isCompleted').optional().isBoolean(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('search').optional().isString(),
], handleValidationErrors, (req: Request, res: Response): void => {
  try {
    const query: ScheduleQuery = {
      category: req.query.category as any,
      priority: req.query.priority as any,
      isCompleted: req.query.isCompleted === 'true' ? true : req.query.isCompleted === 'false' ? false : undefined,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      search: req.query.search as string,
    };

    const schedules = scheduleService.getAllSchedules(query);
    res.json({ data: schedules, total: schedules.length });
  } catch (error) {
    console.error('予定取得エラー:', error);
    res.status(500).json({ error: '予定の取得に失敗しました' });
  }
});

// GET /api/schedules/:id - 特定の予定を取得
router.get('/:id', [
  param('id').isUUID().withMessage('有効なUUIDを指定してください'),
], handleValidationErrors, (req: Request, res: Response): void => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).json({ error: 'IDが指定されていません' });
      return;
    }
    
    const schedule = scheduleService.getScheduleById(id);
    if (!schedule) {
      res.status(404).json({ error: '予定が見つかりません' });
      return;
    }
    res.json({ data: schedule });
  } catch (error) {
    console.error('予定取得エラー:', error);
    res.status(500).json({ error: '予定の取得に失敗しました' });
  }
});

// POST /api/schedules - 新しい予定を作成
router.post('/', [
  body('title').notEmpty().withMessage('タイトルは必須です').isLength({ max: 100 }).withMessage('タイトルは100文字以内で入力してください'),
  body('description').optional().isLength({ max: 500 }).withMessage('説明は500文字以内で入力してください'),
  body('startDate').isISO8601().withMessage('開始日時は正しい形式で入力してください'),
  body('endDate').isISO8601().withMessage('終了日時は正しい形式で入力してください'),
  body('category').isIn(['work', 'personal', 'meeting', 'reminder', 'other']).withMessage('有効なカテゴリを選択してください'),
  body('priority').isIn(['low', 'medium', 'high']).withMessage('有効な優先度を選択してください'),
], handleValidationErrors, (req: Request, res: Response): void => {
  try {
    // 終了日時が開始日時より後であることを確認
    if (new Date(req.body.endDate) <= new Date(req.body.startDate)) {
      res.status(400).json({ error: '終了日時は開始日時より後に設定してください' });
      return;
    }

    const scheduleData: CreateScheduleRequest = {
      title: req.body.title,
      description: req.body.description,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      category: req.body.category,
      priority: req.body.priority,
    };

    const newSchedule = scheduleService.createSchedule(scheduleData);
    res.status(201).json({ data: newSchedule, message: '予定が正常に作成されました' });
  } catch (error) {
    console.error('予定作成エラー:', error);
    res.status(500).json({ error: '予定の作成に失敗しました' });
  }
});

// PUT /api/schedules/:id - 予定を更新
router.put('/:id', [
  param('id').isUUID().withMessage('有効なUUIDを指定してください'),
  body('title').optional().notEmpty().withMessage('タイトルが空です').isLength({ max: 100 }).withMessage('タイトルは100文字以内で入力してください'),
  body('description').optional().isLength({ max: 500 }).withMessage('説明は500文字以内で入力してください'),
  body('startDate').optional().isISO8601().withMessage('開始日時は正しい形式で入力してください'),
  body('endDate').optional().isISO8601().withMessage('終了日時は正しい形式で入力してください'),
  body('category').optional().isIn(['work', 'personal', 'meeting', 'reminder', 'other']).withMessage('有効なカテゴリを選択してください'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('有効な優先度を選択してください'),
  body('isCompleted').optional().isBoolean().withMessage('完了状態はtrue/falseで指定してください'),
], handleValidationErrors, (req: Request, res: Response): void => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).json({ error: 'IDが指定されていません' });
      return;
    }

    // 開始日時と終了日時が両方指定されている場合のバリデーション
    if (req.body.startDate && req.body.endDate) {
      if (new Date(req.body.endDate) <= new Date(req.body.startDate)) {
        res.status(400).json({ error: '終了日時は開始日時より後に設定してください' });
        return;
      }
    }

    const updateData: UpdateScheduleRequest = {
      title: req.body.title,
      description: req.body.description,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      category: req.body.category,
      priority: req.body.priority,
      isCompleted: req.body.isCompleted,
    };

    const updatedSchedule = scheduleService.updateSchedule(id, updateData);
    if (!updatedSchedule) {
      res.status(404).json({ error: '予定が見つかりません' });
      return;
    }

    res.json({ data: updatedSchedule, message: '予定が正常に更新されました' });
  } catch (error) {
    console.error('予定更新エラー:', error);
    res.status(500).json({ error: '予定の更新に失敗しました' });
  }
});

// DELETE /api/schedules/:id - 予定を削除
router.delete('/:id', [
  param('id').isUUID().withMessage('有効なUUIDを指定してください'),
], handleValidationErrors, (req: Request, res: Response): void => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).json({ error: 'IDが指定されていません' });
      return;
    }

    const deleted = scheduleService.deleteSchedule(id);
    if (!deleted) {
      res.status(404).json({ error: '予定が見つかりません' });
      return;
    }

    res.json({ message: '予定が正常に削除されました' });
  } catch (error) {
    console.error('予定削除エラー:', error);
    res.status(500).json({ error: '予定の削除に失敗しました' });
  }
});

// POST /api/schedules/import - データのインポート
router.post('/import', [
  body('schedules').isArray().withMessage('予定データは配列形式で送信してください'),
  body('schedules.*.title').notEmpty().withMessage('タイトルは必須です'),
  body('schedules.*.startDate').isISO8601().withMessage('開始日時は正しい形式で入力してください'),
  body('schedules.*.endDate').isISO8601().withMessage('終了日時は正しい形式で入力してください'),
], handleValidationErrors, (req: Request, res: Response): void => {
  try {
    const schedules = req.body.schedules;
    
    // バックアップを作成してからインポート
    const backupSuccess = dataService.createBackup();
    if (!backupSuccess) {
      res.status(500).json({ error: 'バックアップの作成に失敗しました' });
      return;
    }
    
    // データをインポート
    const importSuccess = dataService.importData(schedules);
    if (!importSuccess) {
      res.status(500).json({ error: 'データのインポートに失敗しました' });
      return;
    }
    
    // scheduleServiceのデータを再読み込み
    scheduleService.reloadData();
    
    res.json({
      message: `${schedules.length}件の予定をインポートしました`,
      importedAt: new Date().toISOString(),
      count: schedules.length
    });
  } catch (error) {
    console.error('データインポートエラー:', error);
    res.status(500).json({ error: 'データのインポートに失敗しました' });
  }
});

export { router as scheduleRoutes }; 