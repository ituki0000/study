import React, { useState, useRef } from 'react';
import { Download, Upload, FileText, FileSpreadsheet, X, AlertCircle, CheckCircle, Info, Trash2 } from 'lucide-react';
import { ScheduleAPI } from '../services/api';

interface DataManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onDataImported: () => void;
}

const DataManager: React.FC<DataManagerProps> = ({ isOpen, onClose, onDataImported }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [scheduleCount, setScheduleCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // コンポーネントが開いたときに予定数を取得
  React.useEffect(() => {
    if (isOpen) {
      loadScheduleCount();
    }
  }, [isOpen]);

  // 予定数を取得
  const loadScheduleCount = async () => {
    try {
      const schedules = await ScheduleAPI.getAllSchedules();
      setScheduleCount(schedules.length);
    } catch (error) {
      console.error('予定数の取得に失敗:', error);
    }
  };

  // 全削除の確認を開始
  const handleDeleteAllConfirm = () => {
    if (scheduleCount === 0) {
      setMessage({ type: 'info', text: '削除する予定がありません' });
      return;
    }
    setShowDeleteConfirm(true);
  };

  // 全削除を実行
  const handleDeleteAll = async () => {
    try {
      setLoading(true);
      setMessage(null);
      setShowDeleteConfirm(false);
      
      const result = await ScheduleAPI.deleteAllSchedules();
      
      setMessage({ 
        type: 'success', 
        text: `✅ ${result.message}` 
      });
      
      setScheduleCount(0);
      onDataImported(); // データ変更を親コンポーネントに通知
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '全削除に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  // JSONエクスポート
  const handleExportJSON = async () => {
    try {
      setLoading(true);
      setMessage(null);
      
      const blob = await ScheduleAPI.exportJSON();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `schedules-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setMessage({ type: 'success', text: 'JSONファイルのダウンロードが開始されました' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'エクスポートに失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  // CSVエクスポート
  const handleExportCSV = async () => {
    try {
      setLoading(true);
      setMessage(null);
      
      const blob = await ScheduleAPI.exportCSV();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `schedules-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setMessage({ type: 'success', text: 'CSVファイルのダウンロードが開始されました' });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'エクスポートに失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  // ファイル選択
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  // ファイルインポート
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setMessage(null);

      // ファイルを読み込み
      const fileContent = await file.text();
      let importData;

      try {
        importData = JSON.parse(fileContent);
      } catch (parseError) {
        setMessage({ type: 'error', text: 'JSONファイルの形式が正しくありません' });
        return;
      }

      // データ形式の検証
      if (!importData.schedules || !Array.isArray(importData.schedules)) {
        setMessage({ type: 'error', text: 'インポートデータの形式が正しくありません' });
        return;
      }

      // インポート実行
      const result = await ScheduleAPI.importSchedules(importData.schedules);
      
      if (result.errorCount > 0) {
        setMessage({ 
          type: 'info', 
          text: `${result.importedCount}件のデータをインポートしました（エラー: ${result.errorCount}件）` 
        });
      } else {
        setMessage({ 
          type: 'success', 
          text: `${result.importedCount}件のデータをインポートしました` 
        });
      }

      onDataImported();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'インポートに失敗しました' });
    } finally {
      setLoading(false);
      // ファイル選択をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // メッセージアイコンを取得
  const getMessageIcon = (type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  // メッセージスタイルを取得
  const getMessageStyle = (type: 'success' | 'error' | 'info') => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            🔥 データ管理 - テスト更新済み 🔥
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-6">
          {/* メッセージ表示 */}
          {message && (
            <div className={`p-4 rounded-md border flex items-start space-x-3 ${getMessageStyle(message.type)}`}>
              {getMessageIcon(message.type)}
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          {/* 🔥 テスト用：全削除機能を一番上に移動 */}
          <div className="border-4 border-red-500 rounded-lg p-4">
            <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-3">
              🗑️ 全削除機能（テスト表示）
            </h3>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-3">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                    ⚠️ 重要な警告
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    この操作により<strong>すべての予定が完全に削除</strong>されます。
                    <br />現在の予定数: <strong className="text-red-900 dark:text-red-100">{scheduleCount}件</strong>
                    <br />📍 この操作は<strong>取り消すことができません</strong>
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleDeleteAllConfirm}
              disabled={loading || scheduleCount === 0}
              className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-bold"
            >
              <Trash2 className="h-6 w-6" />
              <span>🔥 すべての予定を削除（テスト）</span>
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              このボタンが見えていれば実装は正常です
            </p>
          </div>

          {/* エクスポート機能 */}
          <div>
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
              📤 データエクスポート
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleExportJSON}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="h-5 w-5" />
                <span>JSON形式でエクスポート</span>
                <Download className="h-4 w-4" />
              </button>
              
              <button
                onClick={handleExportCSV}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileSpreadsheet className="h-5 w-5" />
                <span>CSV形式でエクスポート</span>
                <Download className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              すべての予定データがダウンロードされます
            </p>
          </div>

          {/* インポート機能 */}
          <div>
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
              📥 データインポート
            </h3>
            <button
              onClick={handleFileSelect}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="h-5 w-5" />
              <span>JSONファイルを選択</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              エクスポートしたJSONファイルのみ対応しています
            </p>
          </div>

          {/* 全削除機能 */}
          <div>
            <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">
              🗑️ 全削除（危険）
            </h3>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-3">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                    ⚠️ 重要な警告
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    この操作により<strong>すべての予定が完全に削除</strong>されます。
                    <br />現在の予定数: <strong className="text-red-900 dark:text-red-100">{scheduleCount}件</strong>
                    <br />📍 この操作は<strong>取り消すことができません</strong>
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleDeleteAllConfirm}
              disabled={loading || scheduleCount === 0}
              className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-5 w-5" />
              <span>すべての予定を削除</span>
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              重要なデータは事前にエクスポートでバックアップを取得してください
            </p>
          </div>

          {/* 注意事項 */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  注意事項
                </h4>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>インポート時は新しいIDが割り当てられます</li>
                    <li>既存のデータは保持され、追加でインポートされます</li>
                    <li>重要なデータは事前にエクスポートでバックアップを取得してください</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>

      {/* 全削除確認ダイアログ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-60">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md">
            {/* ダイアログヘッダー */}
            <div className="p-6 border-b border-red-200 dark:border-red-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-red-900 dark:text-red-100">
                  ⚠️ 最終確認
                </h3>
              </div>
            </div>

            {/* ダイアログコンテンツ */}
            <div className="p-6">
              <div className="space-y-4">
                <p className="text-gray-900 dark:text-white font-medium">
                  本当に<span className="text-red-600 dark:text-red-400 font-bold">すべての予定を削除</span>しますか？
                </p>
                
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                  <ul className="text-sm text-red-800 dark:text-red-200 space-y-2">
                    <li className="flex items-center space-x-2">
                      <span className="font-bold text-red-600 dark:text-red-400">📊</span>
                      <span>削除される予定数: <strong>{scheduleCount}件</strong></span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="font-bold text-red-600 dark:text-red-400">🔄</span>
                      <span>この操作は<strong>取り消すことができません</strong></span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="font-bold text-red-600 dark:text-red-400">💾</span>
                      <span>重要なデータは事前にバックアップしてください</span>
                    </li>
                  </ul>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400">
                  削除を続行する場合は、下記のボタンをクリックしてください。
                </p>
              </div>
            </div>

            {/* ダイアログフッター */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteAll}
                disabled={loading}
                className="px-6 py-2 text-sm font-bold bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '削除中...' : '🗑️ すべて削除する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataManager; 