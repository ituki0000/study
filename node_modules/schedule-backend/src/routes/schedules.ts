import express, { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { scheduleService } from '../services/scheduleService';
import { CreateScheduleRequest, UpdateScheduleRequest, ScheduleQuery, Schedule } from '../types/schedule';
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

// DELETE /api/schedules/bulk - 複数の予定を一括削除
router.delete('/bulk', [
  body('ids').isArray({ min: 1 }).withMessage('削除する予定のIDを配列で指定してください'),
  body('ids.*').isUUID().withMessage('有効なUUIDを指定してください'),
], handleValidationErrors, (req: Request, res: Response): void => {
  try {
    const ids: string[] = req.body.ids;
    console.log('🔥 Backend: 一括削除リクエスト受信:', { ids, count: ids.length });
    
    const result = scheduleService.deleteMultipleSchedules(ids);
    console.log('✅ Backend: 一括削除結果:', result);
    
    if (result.deletedCount === 0) {
      console.log('❌ Backend: 削除対象が見つからない');
      res.status(404).json({ 
        error: '削除対象の予定が見つかりませんでした',
        errors: result.errors 
      });
      return;
    }

    const message = result.errors.length > 0 
      ? `${result.deletedCount}件の予定を削除しました（エラー: ${result.errors.length}件）`
      : `${result.deletedCount}件の予定を正常に削除しました`;

    console.log('🎉 Backend: 一括削除成功:', { message, deletedCount: result.deletedCount });
    res.json({ 
      message,
      deletedCount: result.deletedCount,
      errors: result.errors
    });
  } catch (error) {
    console.error('❌ Backend: 一括削除エラー:', error);
    res.status(500).json({ error: '予定の一括削除に失敗しました' });
  }
});

// DELETE /api/schedules/all - 全ての予定を削除
router.delete('/all', (req: Request, res: Response): void => {
  try {
    const result = scheduleService.deleteAllSchedules();
    
    res.json({ 
      message: `全ての予定を削除しました（${result.deletedCount}件）`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('全削除エラー:', error);
    res.status(500).json({ error: '全ての予定の削除に失敗しました' });
  }
});

// POST /api/schedules/import - データのインポート（JSONデータを直接受信）
router.post('/import', [
  body('schedules').isArray().withMessage('予定データは配列形式で送信してください'),
  body('schedules.*.title').notEmpty().withMessage('タイトルは必須です'),
  body('schedules.*.startDate').isISO8601().withMessage('開始日時は正しい形式で入力してください'),
  body('schedules.*.endDate').isISO8601().withMessage('終了日時は正しい形式で入力してください'),
], handleValidationErrors, (req: Request, res: Response): void => {
  try {
    const schedules = req.body.schedules;
    const importedSchedules: Schedule[] = [];
    let successCount = 0;
    let errorCount = 0;
    
    for (const scheduleData of schedules) {
      try {
        // 新しいIDを生成してインポート
        const newSchedule = scheduleService.createSchedule({
          title: scheduleData.title,
          description: scheduleData.description,
          startDate: scheduleData.startDate,
          endDate: scheduleData.endDate,
          category: scheduleData.category || 'other',
          priority: scheduleData.priority || 'medium',
          tags: scheduleData.tags || []
        });
        
        importedSchedules.push(newSchedule);
        successCount++;
      } catch (error) {
        errorCount++;
        console.error('📥 インポートエラー（個別）:', error);
      }
    }
    
    console.log(`📥 ${successCount}件のデータをインポートしました（エラー: ${errorCount}件）`);
    
    res.json({
      message: `${successCount}件のデータをインポートしました`,
      importedCount: successCount,
      errorCount: errorCount,
      importedSchedules: importedSchedules
    });
  } catch (error) {
    console.error('📥 インポートエラー:', error);
    res.status(500).json({ error: 'インポートに失敗しました' });
  }
});

// データエクスポート（JSON形式）
router.get('/export/json', (req, res) => {
  try {
    const schedules = scheduleService.getAllSchedules();
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      schedules: schedules,
      totalCount: schedules.length
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="schedules-export.json"');
    res.json(exportData);
  } catch (error) {
    console.error('📤 エクスポートエラー:', error);
    res.status(500).json({ error: 'エクスポートに失敗しました' });
  }
});

// データエクスポート（CSV形式）
router.get('/export/csv', (req, res) => {
  try {
    const schedules = scheduleService.getAllSchedules();
    
    // CSVヘッダー
    const headers = [
      'ID', 'タイトル', '説明', '開始日時', '終了日時', 'カテゴリ', '優先度', 
      '完了状態', 'タグ', '作成日時', '更新日時'
    ];
    
    // CSVデータを作成
    const csvRows = [
      headers.join(','),
      ...schedules.map(schedule => [
        schedule.id,
        `"${schedule.title.replace(/"/g, '""')}"`,
        `"${(schedule.description || '').replace(/"/g, '""')}"`,
        schedule.startDate,
        schedule.endDate,
        schedule.category,
        schedule.priority,
        schedule.isCompleted ? '完了' : '未完了',
        `"${(schedule.tags || []).join(', ')}"`,
        schedule.createdAt,
        schedule.updatedAt
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="schedules-export.csv"');
    res.send('\uFEFF' + csvContent); // BOM付きでUTF-8エンコーディング
  } catch (error) {
    console.error('📤 CSVエクスポートエラー:', error);
    res.status(500).json({ error: 'CSVエクスポートに失敗しました' });
  }
});

export { router as scheduleRoutes }; 