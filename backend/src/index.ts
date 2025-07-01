import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { scheduleRoutes } from './routes/schedules';

const app = express();
const PORT = process.env.PORT || 3001;

// ミドルウェア
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ルート
app.use('/api/schedules', scheduleRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: '予定管理システム API サーバーが正常に動作しています' });
});

// エラーハンドリング
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'サーバーエラーが発生しました' });
});

// 404 ハンドラー
app.use('*', (req, res) => {
  res.status(404).json({ error: 'エンドポイントが見つかりません' });
});

app.listen(PORT, () => {
  console.log(`🚀 予定管理システム API サーバーがポート ${PORT} で起動しました`);
  console.log(`📱 フロントエンド: http://localhost:3000`);
  console.log(`🔧 API: http://localhost:${PORT}/api`);
}); 