import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import MobileFeatures from '../components/MobileFeatures';
import { Smartphone, Download, Share2, Settings, Home, Users, CreditCard } from 'lucide-react';

interface MobileTestProps {}

const MobileTest: React.FC<MobileTestProps> = () => {
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [loadTime, setLoadTime] = useState(0);
  const [networkStatus, setNetworkStatus] = useState('Online');

  // Check if client-side
  useEffect(() => {
    setIsClient(true);
    setLoadTime(Math.round(performance.now()));
    setNetworkStatus(navigator.onLine ? 'Online' : 'Offline');
  }, []);

  // Check if PWA is installed
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkPWAInstallation = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsPWAInstalled(true);
        setIsStandalone(true);
      }
    };

    checkPWAInstallation();
    window.addEventListener('appinstalled', () => setIsPWAInstalled(true));
    
    return () => {
      window.removeEventListener('appinstalled', () => setIsPWAInstalled(true));
    };
  }, []);

  // Handle PWA install prompt
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsPWAInstalled(true);
      }
      setInstallPrompt(null);
    }
  };

  const handlePhotoCapture = (photoData: string) => {
    setCapturedPhoto(photoData);
  };

  const handleLocationUpdate = (location: { lat: number; lng: number }) => {
    setCurrentLocation(location);
  };

  const handleOfflineStatusChange = (offline: boolean) => {
    setIsOffline(offline);
  };

  const shareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'RachaAI - Divisor de Contas Inteligente',
          text: 'Experimente o melhor divisor de contas com IA para brasileiros!',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  return (
    <>
      <Head>
        <title>RachaAI - Teste Mobile</title>
        <meta name="description" content="Teste dos recursos mobile do RachaAI" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#8b5cf6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RachaAI" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-6 h-6 text-purple-600" />
              <h1 className="text-lg font-semibold text-gray-900">RachaAI Mobile</h1>
            </div>
            <div className="flex items-center space-x-2">
              {!isPWAInstalled && installPrompt && (
                <button
                  onClick={handleInstallPWA}
                  className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Download className="w-4 h-4 inline mr-1" />
                  Instalar
                </button>
              )}
              <button
                onClick={shareApp}
                className="p-2 text-gray-600 hover:text-purple-600 transition-colors"
                aria-label="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Navigation */}
        <nav className="bg-white border-b">
          <div className="flex justify-around py-2">
            <button className="flex flex-col items-center p-2 text-purple-600">
              <Home className="w-5 h-5" />
              <span className="text-xs">Início</span>
            </button>
            <button className="flex flex-col items-center p-2 text-gray-500 hover:text-purple-600">
              <Users className="w-5 h-5" />
              <span className="text-xs">Grupos</span>
            </button>
            <button className="flex flex-col items-center p-2 text-gray-500 hover:text-purple-600">
              <CreditCard className="w-5 h-5" />
              <span className="text-xs">Pagamentos</span>
            </button>
            <button className="flex flex-col items-center p-2 text-gray-500 hover:text-purple-600">
              <Settings className="w-5 h-5" />
              <span className="text-xs">Config</span>
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="p-4 space-y-4">
          {/* PWA Status */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              📱 Status do App Mobile
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">PWA Instalado:</span>
                <span className={`text-sm font-medium ${isPWAInstalled ? 'text-green-600' : 'text-orange-600'}`}>
                  {isPWAInstalled ? 'Sim' : 'Não'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Modo Offline:</span>
                <span className={`text-sm font-medium ${isOffline ? 'text-yellow-600' : 'text-green-600'}`}>
                  {isOffline ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tela Cheia:</span>
                <span className="text-sm font-medium text-green-600">
                  {isStandalone ? 'Sim' : 'Não'}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Features Component */}
          <MobileFeatures
            onPhotoCapture={handlePhotoCapture}
            onLocationUpdate={handleLocationUpdate}
            onOfflineStatusChange={handleOfflineStatusChange}
          />

          {/* Captured Photo Display */}
          {capturedPhoto && (
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                📸 Foto Capturada
              </h3>
              <div className="relative">
                <img
                  src={capturedPhoto}
                  alt="Receipt captured"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  onClick={() => setCapturedPhoto(null)}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                >
                  ×
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Foto capturada para processamento do recibo
              </p>
            </div>
          )}

          {/* Location Display */}
          {currentLocation && (
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                📍 Localização Capturada
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Latitude:</span>
                  <span className="text-sm font-medium">{currentLocation.lat.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Longitude:</span>
                  <span className="text-sm font-medium">{currentLocation.lng.toFixed(6)}</span>
                </div>
                <button
                  onClick={() => setCurrentLocation(null)}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Limpar localização
                </button>
              </div>
            </div>
          )}

          {/* Mobile Performance Metrics */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              ⚡ Performance Mobile
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {loadTime}ms
                </div>
                <div className="text-xs text-gray-500">Tempo de Carregamento</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {networkStatus}
                </div>
                <div className="text-xs text-gray-500">Status da Rede</div>
              </div>
            </div>
          </div>

          {/* Brazilian Market Features */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              🇧🇷 Recursos Brasileiros
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Otimização para redes 4G/5G brasileiras</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Integração com PIX para pagamentos</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Interface em português brasileiro</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Suporte offline para redes instáveis</span>
              </div>
            </div>
          </div>

          {/* Installation Instructions */}
          {!isPWAInstalled && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                📲 Instalar como App
              </h3>
              <p className="text-sm text-yellow-700 mb-3">
                Para melhor experiência, instale o RachaAI como app no seu dispositivo:
              </p>
              <div className="space-y-2 text-xs text-yellow-700">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">iOS:</span>
                  <span>Toque em Compartilhar → Adicionar à Tela Inicial</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Android:</span>
                  <span>Toque em Menu → Adicionar à Tela Inicial</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Chrome:</span>
                  <span>Toque no ícone de instalação na barra de endereços</span>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t">
          <div className="flex justify-around py-2">
            <button className="flex flex-col items-center p-2 text-purple-600">
              <Home className="w-5 h-5" />
              <span className="text-xs">Início</span>
            </button>
            <button className="flex flex-col items-center p-2 text-gray-500 hover:text-purple-600">
              <Users className="w-5 h-5" />
              <span className="text-xs">Grupos</span>
            </button>
            <button className="flex flex-col items-center p-2 text-gray-500 hover:text-purple-600">
              <CreditCard className="w-5 h-5" />
              <span className="text-xs">Pagamentos</span>
            </button>
            <button className="flex flex-col items-center p-2 text-gray-500 hover:text-purple-600">
              <Settings className="w-5 h-5" />
              <span className="text-xs">Config</span>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};

export default MobileTest; 