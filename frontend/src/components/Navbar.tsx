import React, { useState } from 'react';
import {
  Search,
  Bell,
  RefreshCw,
  Sparkles,
  ChevronDown,
  Database,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { APIVerseLogo } from './APIVerseLogo';
import { NotificationRecord, SystemHealth } from '../types';

interface NavbarProps {
  notifications: NotificationRecord[];
  onRefreshNotifications: () => void;
  onSeedDemo: () => void;
  isSeeding: boolean;
  systemHealth: SystemHealth | null;
  onSearchSelect?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  notifications,
  onRefreshNotifications,
  onSeedDemo,
  isSeeding,
  systemHealth,
  onSearchSelect
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSelect && searchQuery.trim()) {
      onSearchSelect(searchQuery.trim());
    }
  };

  const isHealthy = systemHealth?.database === 'connected';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#272832] bg-[#101117]/95 backdrop-blur-md">
      <div className="flex h-13 items-center justify-between px-5">
        {/* Left: Branding and Workspace Indicator */}
        <div className="flex items-center space-x-5">
          <div className="flex items-center space-x-2.5">
            <APIVerseLogo size={24} className="h-6 w-6 text-violet-500" />
            <div className="flex items-baseline space-x-1.5">
              <span className="text-[15px] font-bold tracking-tight text-white">APIVerse</span>
              <span className="rounded bg-violet-500/10 px-1.5 py-0.2 text-[9px] font-semibold text-violet-400 border border-violet-500/20 uppercase tracking-wide">
                Platform
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-2 border-l border-[#272832] pl-4">
            <span className="text-[11px] text-gray-500 font-medium">Workspace:</span>
            <div className="flex items-center space-x-1.5 rounded-md bg-[#15151D] px-2.5 py-1 text-xs text-gray-300 border border-[#272832] font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400"></span>
              <span className="font-medium text-gray-200">default-workspace</span>
            </div>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden lg:flex flex-1 max-w-md mx-8">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search repositories, specs, breaking changes, PRs..."
              className="w-full rounded-lg bg-[#15151D] border border-[#272832] pl-9 pr-12 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 transition-all font-sans"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded bg-[#101117] px-1.5 py-0.5 text-[10px] font-mono text-gray-500 border border-[#272832]">
              ⌘K
            </kbd>
          </form>
        </div>

        {/* Right: Actions, Notifications, Health & Profile */}
        <div className="flex items-center space-x-3">
          {/* Environment Mode Pill */}
          <div className="hidden sm:flex items-center space-x-1.5 rounded-md bg-[#15151D] px-2.5 py-1 text-[11px] text-gray-300 border border-[#272832]">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400"></span>
            <span className="text-gray-400">Mode:</span>
            <span className="font-semibold text-gray-200">Demo &amp; GitHub</span>
          </div>

          {/* Seed Demo Action Button */}
          <button
            onClick={onSeedDemo}
            disabled={isSeeding}
            className="flex items-center space-x-1.5 rounded-lg bg-[#15151D] hover:bg-[#1A1A24] px-2.5 py-1.5 text-xs font-medium text-gray-300 hover:text-white border border-[#272832] transition-colors disabled:opacity-50"
            title="Populate complete demonstration scenario with OpenAPI diff, impact analysis, and PR"
          >
            <Sparkles className={`h-3.5 w-3.5 text-violet-400 ${isSeeding ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSeeding ? 'Seeding...' : 'Seed Demo'}</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-lg p-1.5 text-gray-400 hover:bg-[#15151D] hover:text-gray-200 transition-colors border border-transparent hover:border-[#272832]"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-violet-500"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-[#15151D] border border-[#272832] p-3 shadow-2xl z-50">
                <div className="flex items-center justify-between pb-2 border-b border-[#272832]">
                  <span className="text-xs font-bold text-gray-200">Notifications</span>
                  <button onClick={onRefreshNotifications} className="text-gray-400 hover:text-white">
                    <RefreshCw className="h-3 w-3" />
                  </button>
                </div>
                <div className="mt-2 max-h-64 overflow-y-auto space-y-1.5">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-4">No notifications.</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="rounded-lg bg-[#101117] p-2.5 text-xs border border-[#272832]">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-200">{n.title}</span>
                          <span className={`text-[10px] font-medium ${n.severity === 'error' ? 'text-rose-400' : 'text-violet-400'}`}>
                            {n.severity}
                          </span>
                        </div>
                        <p className="text-gray-400 mt-1 text-[11px]">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Real Health Indicator */}
          <div className="flex items-center space-x-1.5 rounded-md bg-[#15151D] px-2.5 py-1 text-[11px] border border-[#272832]">
            <span className={`h-1.5 w-1.5 rounded-full ${isHealthy ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
            <span className="text-gray-400">DB:</span>
            <span className={`font-medium ${isHealthy ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isHealthy ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
