import React from 'react';
import { BookOpen, Search, Trophy, Sparkles, Plus, Settings, Flame } from 'lucide-react';

export default function Navbar({ activeTab, onSelectTab, onOpenAdd, onOpenSettings, dueCount = 0 }) {
  const navItems = [
    { id: 'study', label: '沉浸自習', icon: BookOpen, badge: dueCount > 0 ? dueCount : null },
    { id: 'quiz', label: '實戰測驗', icon: Sparkles },
    { id: 'list', label: '單字庫', icon: Search },
    { id: 'garden', label: '成長花園', icon: Trophy },
  ];

  return (
    <header className="sticky top-0 z-40 bg-cream-100/90 backdrop-blur-md border-b border-cream-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onSelectTab('study')}>
          <div className="w-10 h-10 rounded-2xl bg-latte-500 text-white flex items-center justify-center text-xl shadow-sm">
            ☕
          </div>
          <div>
            <div className="text-base font-bold text-latte-800 tracking-tight flex items-center gap-1.5">
              Cozy TOEIC
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amberGold-200 text-latte-800 font-extrabold uppercase">
                350→775
              </span>
            </div>
            <div className="text-[11px] font-medium text-latte-600">
              暖心英英單字自習室
            </div>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="hidden sm:flex items-center gap-1 bg-cream-200/80 p-1 rounded-2xl border border-cream-300/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all relative ${
                  isActive
                    ? 'bg-white text-latte-800 shadow-sm'
                    : 'text-cozyDark-200 hover:text-latte-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-1 px-1.5 py-0.2 bg-amberGold-400 text-white rounded-full text-[10px] font-extrabold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Buttons: Add Word & Settings */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-latte-600 hover:bg-latte-700 text-white text-xs font-bold shadow-sm transition active:scale-95"
            title="新增單字"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">新增單字</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-latte-700 hover:bg-cream-200 transition active:scale-95"
            title="系統設定與 Google Sheets 雙向同步"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Bottom Tab Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-cream-300 px-4 py-2 flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-[11px] font-bold transition relative ${
                isActive ? 'text-latte-700' : 'text-cozyDark-100 hover:text-latte-600'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="absolute top-0 right-2 w-4 h-4 bg-amberGold-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
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
