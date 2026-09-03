import React from 'react';
import { BookOpen, Search, Trophy, Sparkles, Plus, Settings, Flame, Loader2, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';

export default function Navbar({ activeTab, onSelectTab, onOpenAdd, onOpenSettings, onSync, dueCount = 0, syncStatus = 'idle' }) {
  const navItems = [
    { id: 'study', label: '沉浸自習', icon: BookOpen, badge: dueCount > 0 ? dueCount : null },
    { id: 'quiz', label: '實戰測驗', icon: Sparkles },
    { id: 'list', label: '單字庫', icon: Search },
    { id: 'garden', label: '成長花園', icon: Trophy },
  ];

  return (
    <header className="sticky top-0 z-40 bg-cream-100/95 backdrop-blur-md border-b border-cream-300">
      <div className="max-w-5xl lg:max-w-6xl mx-auto px-4 sm:px-8 h-18 sm:h-20 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onSelectTab('study')}>
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-latte-600 text-white flex items-center justify-center text-2xl shadow-sm group-hover:scale-105 transition">
            ☕
          </div>
          <div>
            <div className="text-lg sm:text-xl font-black text-latte-800 tracking-tight flex items-center gap-2">
              Cozy TOEIC
              <span className="text-[11px] sm:text-xs px-2 py-0.5 rounded-full bg-amberGold-200 text-latte-900 font-black uppercase shadow-xs">
                350→775
              </span>
            </div>
            <div className="text-xs sm:text-sm font-semibold text-latte-600">
              暖心英英單字自習室
            </div>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="hidden sm:flex items-center gap-1.5 bg-cream-200/90 p-1.5 rounded-2xl border border-cream-300">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all relative ${
                  isActive
                    ? 'bg-white text-latte-800 shadow-sm'
                    : 'text-cozyDark-200 hover:text-latte-700'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-1 px-2 py-0.5 bg-amberGold-500 text-white rounded-full text-xs font-black shadow-xs">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Buttons: Sync Indicator, Add Word & Settings */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Cloud Sync Status Indicator */}
          {syncStatus === 'syncing' && (
            <div
              className="hidden md:flex items-center gap-1.5 text-xs text-amberGold-800 bg-amberGold-100/90 border border-amberGold-300 px-3 py-1.5 rounded-2xl font-bold animate-pulse shadow-2xs"
              title="正在與 Google Sheets 自動同步最新進度..."
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amberGold-600" />
              <span>雲端同步中...</span>
            </div>
          )}
          {syncStatus === 'synced' && (
            <button
              onClick={onSync || onOpenSettings}
              className="hidden md:flex items-center gap-1.5 text-xs text-sage-800 bg-sage-50 hover:bg-sage-100 border border-sage-200 px-3 py-1.5 rounded-2xl font-bold transition shadow-2xs active:scale-95"
              title="已連線 Google Sheets，點擊立即重新同步試算表最新修改"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-sage-600" />
              <span>雲端已同步</span>
              <RotateCcw className="w-3 h-3 text-sage-500 ml-0.5" />
            </button>
          )}
          {syncStatus === 'error' && (
            <button
              onClick={onOpenSettings}
              className="hidden md:flex items-center gap-1.5 text-xs text-terracotta-800 bg-terracotta-50 hover:bg-terracotta-100 border border-terracotta-200 px-3 py-1.5 rounded-2xl font-bold transition shadow-2xs"
              title="雲端連線失敗，點擊檢查 GAS 網址設定"
            >
              <AlertCircle className="w-3.5 h-3.5 text-terracotta-500" />
              <span>同步未連線</span>
            </button>
          )}

          <button
            onClick={onOpenAdd}
            className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-2xl bg-latte-600 hover:bg-latte-700 text-white text-xs sm:text-sm font-bold shadow-sm transition active:scale-95"
            title="新增單字"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">新增單字</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-2xl text-latte-700 hover:bg-cream-200 border border-transparent hover:border-cream-300 transition active:scale-95"
            title="系統設定與 Google Sheets 雙向同步"
          >
            <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-cream-300 px-4 py-2.5 flex justify-around items-center shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-xs font-bold transition relative ${
                isActive ? 'text-latte-800 font-black' : 'text-cozyDark-100 hover:text-latte-600'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="absolute top-0 right-2 w-4.5 h-4.5 bg-amberGold-500 text-white rounded-full text-[10px] flex items-center justify-center font-black">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
}
