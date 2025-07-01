import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Download, X, Smartphone } from 'lucide-react';

interface PWAManagerProps {
  children?: React.ReactNode;
}

const PWAManager: React.FC<PWAManagerProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // オンライン状態の監視
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🌐 オンラインになりました');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('📴 オフラインになりました');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // PWAインストールプロンプトの処理
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('📱 PWAインストールプロンプトが利用可能です');
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Service Worker の登録
    registerServiceWorker();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        console.log('📦 Service Worker を登録中...');
        const registration = await navigator.serviceWorker.register('/sw.js');
        setSwRegistration(registration);

        // Service Worker の更新チェック
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🆕 アプリの新しいバージョンが利用可能です');
                setUpdateAvailable(true);
              }
            });
          }
        });

        console.log('✅ Service Worker 登録成功:', registration);
      } catch (error) {
        console.error('❌ Service Worker 登録失敗:', error);
      }
    } else {
      console.warn('⚠️ このブラウザはService Workerをサポートしていません');
    }
  };

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;

    try {
      console.log('📱 PWAインストールプロンプトを表示中...');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ ユーザーがPWAインストールを承諾しました');
      } else {
        console.log('❌ ユーザーがPWAインストールを拒否しました');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('❌ PWAインストールエラー:', error);
    }
  };

  const handleUpdateApp = () => {
    if (swRegistration && swRegistration.waiting) {
      console.log('🔄 アプリを更新中...');
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Service Worker の制御が変更されたらページをリロード
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  };

  const dismissInstallPrompt = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  const dismissUpdatePrompt = () => {
    setUpdateAvailable(false);
  };

  return (
    <>
      {children}
      
      {/* オフライン状態インジケーター */}
      {!isOnline && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">オフラインモード</span>
          </div>
        </div>
      )}

      {/* PWAインストールプロンプト */}
      {showInstallPrompt && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <Smartphone className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  アプリをインストール
                </h3>
              </div>
              <button
                onClick={dismissInstallPrompt}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              ホーム画面に追加して、アプリのようにご利用いただけます。
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleInstallApp}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>インストール</span>
              </button>
              <button
                onClick={dismissInstallPrompt}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors"
              >
                後で
              </button>
            </div>
          </div>
        </div>
      )}

      {/* アプリ更新プロンプト */}
      {updateAvailable && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
          <div className="bg-green-600 text-white rounded-lg shadow-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold">新しいバージョン</h3>
              <button
                onClick={dismissUpdatePrompt}
                className="text-green-200 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-green-100 mb-4">
              アプリの新しいバージョンが利用可能です。
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleUpdateApp}
                className="flex-1 px-4 py-2 bg-white text-green-600 rounded-md hover:bg-green-50 transition-colors font-medium"
              >
                更新
              </button>
              <button
                onClick={dismissUpdatePrompt}
                className="px-4 py-2 text-green-200 hover:text-white transition-colors"
              >
                後で
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAManager;