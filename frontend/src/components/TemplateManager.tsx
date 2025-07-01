import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  X, 
  Edit3, 
  Trash2, 
  Copy, 
  Play, 
  Clock, 
  Tag, 
  AlertCircle, 
  CheckCircle, 
  Info 
} from 'lucide-react';
import { ScheduleTemplate, CreateTemplateRequest, UpdateTemplateRequest } from '../types/template';
import { TemplateAPI } from '../services/templateAPI';
import { CATEGORY_OPTIONS, PRIORITY_OPTIONS } from '../types/schedule';

interface TemplateManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateUsed: (templateId: string, startDate: string) => void;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({ isOpen, onClose, onTemplateUsed }) => {
  const [templates, setTemplates] = useState<ScheduleTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ScheduleTemplate | null>(null);
  const [showUseDialog, setShowUseDialog] = useState<{ template: ScheduleTemplate; date: string } | null>(null);

  // フォーム状態
  const [formData, setFormData] = useState<CreateTemplateRequest>({
    name: '',
    description: '',
    category: 'work',
    priority: 'medium',
    duration: 60,
    tags: [],
    repeatType: 'none',
    repeatInterval: 1,
    repeatDays: []
  });

  const [newTag, setNewTag] = useState('');
  const [useDate, setUseDate] = useState('');
  const [useTitle, setUseTitle] = useState('');
  const [useDescription, setUseDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await TemplateAPI.getAllTemplates();
      setTemplates(data);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'テンプレートの読み込みに失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage(null);

      if (editingTemplate) {
        await TemplateAPI.updateTemplate(editingTemplate.id, formData);
        setMessage({ type: 'success', text: 'テンプレートを更新しました' });
      } else {
        await TemplateAPI.createTemplate(formData);
        setMessage({ type: 'success', text: 'テンプレートを作成しました' });
      }

      resetForm();
      loadTemplates();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '操作に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template: ScheduleTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      category: template.category,
      priority: template.priority,
      duration: template.duration,
      tags: template.tags || [],
      repeatType: template.repeatType || 'none',
      repeatInterval: template.repeatInterval || 1,
      repeatDays: template.repeatDays || []
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('このテンプレートを削除しますか？')) return;

    try {
      setLoading(true);
      await TemplateAPI.deleteTemplate(id);
      setMessage({ type: 'success', text: 'テンプレートを削除しました' });
      loadTemplates();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '削除に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (id: string, name: string) => {
    try {
      setLoading(true);
      await TemplateAPI.duplicateTemplate(id, `${name} (コピー)`);
      setMessage({ type: 'success', text: 'テンプレートを複製しました' });
      loadTemplates();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '複製に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  const handleUse = async () => {
    if (!showUseDialog) return;

    try {
      setLoading(true);
      await TemplateAPI.useTemplate({
        templateId: showUseDialog.template.id,
        startDate: new Date(useDate).toISOString(),
        title: useTitle || undefined,
        description: useDescription || undefined
      });
      
      setMessage({ type: 'success', text: 'テンプレートから予定を作成しました' });
      onTemplateUsed(showUseDialog.template.id, useDate);
      setShowUseDialog(null);
      resetUseForm();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : '予定の作成に失敗しました' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingTemplate(null);
    setFormData({
      name: '',
      description: '',
      category: 'work',
      priority: 'medium',
      duration: 60,
      tags: [],
      repeatType: 'none',
      repeatInterval: 1,
      repeatDays: []
    });
  };

  const resetUseForm = () => {
    setUseDate('');
    setUseTitle('');
    setUseDescription('');
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
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

  const getCategoryLabel = (category: string) => {
    return CATEGORY_OPTIONS.find(opt => opt.value === category)?.label || category;
  };

  const getPriorityLabel = (priority: string) => {
    return PRIORITY_OPTIONS.find(opt => opt.value === priority)?.label || priority;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}時間${mins}分` : `${hours}時間`;
    }
    return `${mins}分`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            テンプレート管理
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>新規作成</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* メッセージ表示 */}
          {message && (
            <div className={`p-4 rounded-md border flex items-start space-x-3 mb-6 ${getMessageStyle(message.type)}`}>
              {getMessageIcon(message.type)}
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          {/* テンプレート一覧 */}
          {!showForm && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>テンプレートがありません</p>
                </div>
              ) : (
                templates.map(template => (
                  <div key={template.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {template.name}
                        </h3>
                        {template.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                            {template.description}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDuration(template.duration)}
                          </span>
                          <span>{getCategoryLabel(template.category)}</span>
                          <span>{getPriorityLabel(template.priority)}</span>
                          {template.tags && template.tags.length > 0 && (
                            <div className="flex items-center">
                              <Tag className="h-3 w-3 mr-1" />
                              <span>{template.tags.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => {
                            setShowUseDialog({ template, date: new Date().toISOString().split('T')[0] });
                            setUseDate(new Date().toISOString().split('T')[0]);
                          }}
                          className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20 rounded transition-colors"
                          title="使用"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(template)}
                          className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition-colors"
                          title="編集"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(template.id, template.name)}
                          className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded transition-colors"
                          title="複製"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="削除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* テンプレート作成・編集フォーム */}
          {showForm && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {editingTemplate ? 'テンプレート編集' : 'テンプレート作成'}
                </h3>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* テンプレート名 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    テンプレート名 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                {/* 所要時間 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    所要時間（分） *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                {/* カテゴリ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    カテゴリ *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    {CATEGORY_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 優先度 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    優先度 *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    {PRIORITY_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 説明 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  説明
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                />
              </div>

              {/* タグ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  タグ
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags?.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-2 hover:text-blue-600 dark:hover:text-blue-300"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="タグを入力してEnter"
                    className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-3 bg-gray-100 dark:bg-gray-600 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* フォームボタン */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '処理中...' : editingTemplate ? '更新' : '作成'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* テンプレート使用ダイアログ */}
        {showUseDialog && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  テンプレートを使用
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  「{showUseDialog.template.name}」から予定を作成します
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      開始日時 *
                    </label>
                    <input
                      type="datetime-local"
                      value={useDate}
                      onChange={(e) => setUseDate(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      カスタムタイトル（省略可）
                    </label>
                    <input
                      type="text"
                      value={useTitle}
                      onChange={(e) => setUseTitle(e.target.value)}
                      placeholder={showUseDialog.template.name}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      追加の説明（省略可）
                    </label>
                    <textarea
                      value={useDescription}
                      onChange={(e) => setUseDescription(e.target.value)}
                      rows={3}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowUseDialog(null);
                      resetUseForm();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={handleUse}
                    disabled={loading || !useDate}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '作成中...' : '予定を作成'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateManager; 