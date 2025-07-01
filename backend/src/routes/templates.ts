import express, { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { templateService } from '../services/templateService';
import { scheduleService } from '../services/scheduleService';
import { CreateTemplateRequest, UpdateTemplateRequest, UseTemplateRequest } from '../types/template';

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

// GET /api/templates - 全テンプレートを取得
router.get('/', (req: Request, res: Response): void => {
  try {
    const templates = templateService.getAllTemplates();
    res.json({ data: templates, total: templates.length });
  } catch (error) {
    console.error('テンプレート取得エラー:', error);
    res.status(500).json({ error: 'テンプレートの取得に失敗しました' });
  }
});

// GET /api/templates/category/:category - カテゴリ別テンプレートを取得
router.get('/category/:category', [
  param('category').isIn(['work', 'personal', 'meeting', 'reminder', 'other']).withMessage('有効なカテゴリを指定してください'),
], handleValidationErrors, (req: Request, res: Response): void => {
  try {
    const category = req.params.category as any;
    const templates = templateService.getTemplatesByCategory(category);
    res.json({ data: templates, total: templates.length });
  } catch (error) {
    console.error('カテゴリ別テンプレート取得エラー:', error);
    res.status(500).json({ error: 'テンプレートの取得に失敗しました' });
  }
});

// GET /api/templates/:id - 特定のテンプレートを取得
router.get('/:id', [
  param('id').isUUID().withMessage('有効なUUIDを指定してください'),
], handleValidationErrors, (req: Request, res: Response): void => {
  try {
    const id = req.params.id as string;
    const template = templateService.getTemplateById(id);
    if (!template) {
      res.status(404).json({ error: 'テンプレートが見つかりません' });
      return;
    }
    res.json({ data: template });
  } catch (error) {
    console.error('テンプレート取得エラー:', error);
    res.status(500).json({ error: 'テンプレートの取得に失敗しました' });
  }
});

// POST /api/templates - 新しいテンプレートを作成
router.post('/', [
  body('name').notEmpty().withMessage('テンプレート名は必須です').isLength({ max: 100 }).withMessage('テンプレート名は100文字以内で入力してください'),
  body('description').optional().isLength({ max: 500 }).withMessage('説明は500文字以内で入力してください'),
  body('category').isIn(['work', 'personal', 'meeting', 'reminder', 'other']).withMessage('有効なカテゴリを選択してください'),
  body('priority').isIn(['low', 'medium', 'high']).withMessage('有効な優先度を選択してください'),
  body('duration').isInt({ min: 1, max: 1440 }).withMessage('所要時間は1-1440分の範囲で入力してください'),
  body('tags').optional().isArray().withMessage('タグは配列形式で入力してください'),
  body('repeatType').optional().isIn(['none', 'daily', 'weekly', 'monthly', 'yearly']).withMessage('有効な繰り返しタイプを選択してください'),
  body('repeatInterval').optional().isInt({ min: 1, max: 365 }).withMessage('繰り返し間隔は1-365の範囲で入力してください'),
  body('repeatDays').optional().isArray().withMessage('繰り返し曜日は配列形式で入力してください'),
], handleValidationErrors, (req: Request, res: Response): void => {
  try {
    const templateData: CreateTemplateRequest = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      priority: req.body.priority,
      duration: req.body.duration,
      tags: req.body.tags,
      repeatType: req.body.repeatType,
      repeatInterval: req.body.repeatInterval,
      repeatDays: req.body.repeatDays,
    };

    const newTemplate = templateService.createTemplate(templateData);
    res.status(201).json({ data: newTemplate, message: 'テンプレートが正常に作成されました' });
  } catch (error) {
    console.error('テンプレート作成エラー:', error);
    res.status(500).json({ error: 'テンプレートの作成に失敗しました' });
  }
});

// PUT /api/templates/:id - テンプレートを更新
router.put('/:id', [
  param('id').isUUID().withMessage('有効なUUIDを指定してください'),
  body('name').optional().notEmpty().withMessage('テンプレート名が空です').isLength({ max: 100 }).withMessage('テンプレート名は100文字以内で入力してください'),
  body('description').optional().isLength({ max: 500 }).withMessage('説明は500文字以内で入力してください'),
  body('category').optional().isIn(['work', 'personal', 'meeting', 'reminder', 'other']).withMessage('有効なカテゴリを選択してください'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('有効な優先度を選択してください'),
  body('duration').optional().isInt({ min: 1, max: 1440 }).withMessage('所要時間は1-1440分の範囲で入力してください'),
  body('tags').optional().isArray().withMessage('タグは配列形式で入力してください'),
  body('repeatType').optional().isIn(['none', 'daily', 'weekly', 'monthly', 'yearly']).withMessage('有効な繰り返しタイプを選択してください'),
  body('repeatInterval').optional().isInt({ min: 1, max: 365 }).withMessage('繰り返し間隔は1-365の範囲で入力してください'),
  body('repeatDays').optional().isArray().withMessage('繰り返し曜日は配列形式で入力してください'),
], handleValidationErrors, (req: Request, res: Response): void => {
  try {
    const id = req.params.id as string;
    const updateData: UpdateTemplateRequest = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      priority: req.body.priority,
      duration: req.body.duration,
      tags: req.body.tags,
      repeatType: req.body.repeatType,
      repeatInterval: req.body.repeatInterval,
      repeatDays: req.body.repeatDays,
    };

    const updatedTemplate = templateService.updateTemplate(id, updateData);
    if (!updatedTemplate) {
      res.status(404).json({ error: 'テンプレートが見つかりません' });
      return;
    }

    res.json({ data: updatedTemplate, message: 'テンプレートが正常に更新されました' });
  } catch (error) {
    console.error('テンプレート更新エラー:', error);
    res.status(500).json({ error: 'テンプレートの更新に失敗しました' });
  }
});

// DELETE /api/templates/:id - テンプレートを削除
router.delete('/:id', [
  param('id').isUUID().withMessage('有効なUUIDを指定してください'),
], handleValidationErrors, (req: Request, res: Response): void => {
  try {
    const id = req.params.id as string;
    const deleted = templateService.deleteTemplate(id);
    if (!deleted) {
      res.status(404).json({ error: 'テンプレートが見つかりません' });
      return;
    }

    res.json({ message: 'テンプレートが正常に削除されました' });
  } catch (error) {
    console.error('テンプレート削除エラー:', error);
    res.status(500).json({ error: 'テンプレートの削除に失敗しました' });
  }
});

// POST /api/templates/:id/duplicate - テンプレートを複製
router.post('/:id/duplicate', [
  param('id').isUUID().withMessage('有効なUUIDを指定してください'),
  body('name').optional().isLength({ max: 100 }).withMessage('テンプレート名は100文字以内で入力してください'),
], handleValidationErrors, (req: Request, res: Response): void => {
  try {
    const id = req.params.id as string;
    const newName = req.body.name;
    
    const duplicated = templateService.duplicateTemplate(id, newName);
    if (!duplicated) {
      res.status(404).json({ error: 'テンプレートが見つかりません' });
      return;
    }

    res.status(201).json({ data: duplicated, message: 'テンプレートが正常に複製されました' });
  } catch (error) {
    console.error('テンプレート複製エラー:', error);
    res.status(500).json({ error: 'テンプレートの複製に失敗しました' });
  }
});

// POST /api/templates/:id/use - テンプレートから予定を作成
router.post('/:id/use', [
  param('id').isUUID().withMessage('有効なUUIDを指定してください'),
  body('startDate').isISO8601().withMessage('開始日時は正しい形式で入力してください'),
  body('title').optional().isLength({ max: 100 }).withMessage('タイトルは100文字以内で入力してください'),
  body('description').optional().isLength({ max: 500 }).withMessage('説明は500文字以内で入力してください'),
], handleValidationErrors, (req: Request, res: Response): void => {
  try {
    const useData: UseTemplateRequest = {
      templateId: req.params.id as string,
      startDate: req.body.startDate,
      title: req.body.title,
      description: req.body.description,
    };

    const newSchedule = scheduleService.createScheduleFromTemplate(useData);
    res.status(201).json({ data: newSchedule, message: 'テンプレートから予定が正常に作成されました' });
  } catch (error) {
    console.error('テンプレート使用エラー:', error);
    if (error instanceof Error && error.message === 'テンプレートが見つかりません') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'テンプレートからの予定作成に失敗しました' });
    }
  }
});

// POST /api/templates/from-schedule/:scheduleId - 予定からテンプレートを作成
router.post('/from-schedule/:scheduleId', [
  param('scheduleId').isUUID().withMessage('有効なUUIDを指定してください'),
  body('name').notEmpty().withMessage('テンプレート名は必須です').isLength({ max: 100 }).withMessage('テンプレート名は100文字以内で入力してください'),
], handleValidationErrors, (req: Request, res: Response): void => {
  try {
    const scheduleId = req.params.scheduleId as string;
    const templateName = req.body.name;

    const newTemplate = scheduleService.createTemplateFromSchedule(scheduleId, templateName);
    res.status(201).json({ data: newTemplate, message: '予定からテンプレートが正常に作成されました' });
  } catch (error) {
    console.error('予定からテンプレート作成エラー:', error);
    if (error instanceof Error && error.message === '予定が見つかりません') {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: '予定からのテンプレート作成に失敗しました' });
    }
  }
});

export { router as templateRoutes }; 