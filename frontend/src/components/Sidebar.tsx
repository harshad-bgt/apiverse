import React from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  FileCode2,
  AlertTriangle,
  LocateFixed,
  Wrench,
  Terminal,
  GitPullRequest,
  Activity,
  Settings,
  Database,
  Layers,
  Search
} from 'lucide-react';
import { SystemHealth } from '../types';

export type TabKey =
  | 'dashboard'
  | 'repositories'
  | 'specs'
  | 'changes'
  | 'impact'
  | 'repairs'
  | 'verifications'
  | 'pull_requests'
  | 'monitoring'
  | 'settings';

interface SidebarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  breakingCount?: number;
  openPrCount?: number;
  systemHealth: SystemHealth | null;
}

interface NavItem {
  id: TabKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeColor?: 'coral' | 'violet' | 'amber' | 'emerald';
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  breakingCount = 0,
  openPrCount = 0,
  systemHealth,
}) => {
  const groups: NavGroup[] = [
    {
      title: 'Workspace',
      items: [
        { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
        { id: 'repositories', label: 'Repositories', icon: FolderGit2 },
        { id: 'specs', label: 'API Specifications', icon: FileCode2 },
        { id: 'changes', label: 'Breaking Changes', icon: AlertTriangle, badge: breakingCount, badgeColor: 'coral' },
        { id: 'impact', label: 'Code Impact', icon: LocateFixed },
      ],
    },
    {
      title: 'Automation',
      items: [
        { id: 'repairs', label: 'AI Repair Studio', icon: Wrench },
        { id: 'verifications', label: 'Test Verification', icon: Terminal },
        { id: 'pull_requests', label: 'Pull Requests', icon: GitPullRequest, badge: openPrCount, badgeColor: 'violet' },
        { id: 'monitoring', label: 'Monitoring', icon: Activity },
      ],
    },
    {
      title: 'System',
      items: [
        { id: 'settings', label: 'Settings & Integrations', icon: Settings },
      ],
    },
  ];

  const isDbConnected = systemHealth?.database === 'connected';

  return (
    <aside className="w-56 border-r border-[#272832] bg-[#101117] flex flex-col justify-between py-3.5 px-2.5 min-h-[calc(100vh-3.25rem)] shrink-0 select-none">
      <div className="space-y-4">
        {groups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1">
            <div className="px-2.5 py-1 text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
              {group.title}
            </div>
            {group.items.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#15151D] text-white border-l-2 border-violet-500 shadow-sm'
                      : 'text-gray-400 hover:bg-[#15151D]/60 hover:text-gray-200 border-l-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-violet-400' : 'text-gray-500'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`ml-1.5 rounded px-1.5 py-0.2 text-[9px] font-mono font-bold leading-none shrink-0 ${
                        item.badgeColor === 'coral'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* System Status Footnote at Bottom */}
      <div className="pt-3 border-t border-[#272832] space-y-2 px-1">
        <div className="rounded-lg bg-[#15151D] p-2.5 border border-[#272832] text-[11px]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-400 font-medium flex items-center space-x-1.5">
              <Database className="h-3 w-3 text-gray-500" />
              <span>SQLite Engine</span>
            </span>
            <span className={`text-[9px] font-mono px-1 py-0.2 rounded font-semibold ${
              isDbConnected ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
            }`}>
              {isDbConnected ? 'ACTIVE' : 'ERROR'}
            </span>
          </div>
          <div className="text-[10px] text-gray-500 font-mono truncate">
            {systemHealth?.version ? `v${systemHealth.version}` : 'v1.0.0'} • Local Data Dir
          </div>
        </div>
      </div>
    </aside>
  );
};
