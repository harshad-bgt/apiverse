import React from 'react';
import {
  FolderGit2,
  FileCode2,
  AlertTriangle,
  GitPullRequest,
  Play,
  ArrowRight,
  Clock,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  GitBranch,
  Terminal,
  Activity
} from 'lucide-react';
import { DashboardMetrics, ScanDetail, PullRequestRecord, NotificationRecord } from '../types';
import { TabKey } from '../components/Sidebar';

interface DashboardViewProps {
  metrics: DashboardMetrics | null;
  scans: ScanDetail[];
  pullRequests: PullRequestRecord[];
  notifications: NotificationRecord[];
  onNavigate: (tab: TabKey) => void;
  onInspectScan: (scanId: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  scans,
  pullRequests,
  notifications,
  onNavigate,
  onInspectScan,
}) => {
  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500 text-xs">
        <div className="flex items-center space-x-2">
          <span className="h-2 w-2 rounded-full bg-violet-400 animate-ping"></span>
          <span>Loading APIVerse telemetry...</span>
        </div>
      </div>
    );
  }

  const latestScan = scans.length > 0 ? scans[0] : null;
  const recentChanges = latestScan?.detected_changes?.slice(0, 4) || [];
  const latestPrs = pullRequests.slice(0, 3);
  const recentAlerts = notifications.slice(0, 3);

  // Compute actual severity counts for chart
  const breakingTotal = metrics.counts.breaking_changes || 0;
  const warningsTotal = metrics.counts.warnings || 0;
  const totalReported = breakingTotal + warningsTotal || 1;
  const breakingPct = Math.round((breakingTotal / totalReported) * 100);
  const warningPct = Math.round((warningsTotal / totalReported) * 100);

  return (
    <div className="space-y-5 apv-ambient-violet">
      {/* A. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight">Overview</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Monitor API compatibility, investigate breaking changes, and manage repairs.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => onNavigate('repositories')}
            className="flex items-center space-x-1.5 rounded-lg bg-[#15151D] hover:bg-[#1A1A24] px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white border border-[#272832] transition-colors"
          >
            <FolderGit2 className="h-3.5 w-3.5 text-gray-400" />
            <span>Connect Repository</span>
          </button>

          <button
            onClick={() => onNavigate('specs')}
            className="flex items-center space-x-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-violet-600/30 transition-all"
          >
            <Play className="h-3 w-3 fill-current" />
            <span>New Scan</span>
          </button>
        </div>
      </div>

      {/* B. Account-style Overview Panel (Developer Telemetry) */}
      <div className="apv-panel-elevated p-4 apv-panel-glow">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#272832] gap-4 md:gap-0">
          {/* Group 1: Workspace & Target */}
          <div className="md:pr-5 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
              Target Client Repository
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white">payment-service-py</span>
              <span className="rounded bg-violet-500/10 px-1.5 py-0.2 text-[9px] font-mono font-semibold text-violet-400 border border-violet-500/20">
                demo/local
              </span>
            </div>
            <div className="text-[11px] text-gray-400 font-mono flex items-center space-x-1">
              <GitBranch className="h-3 w-3 text-gray-500" />
              <span>default branch: main</span>
            </div>
          </div>

          {/* Group 2: Latest Scan Status */}
          <div className="md:px-5 space-y-1 pt-3 md:pt-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
              Latest Contract Diff
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white">
                {latestScan ? `Scan #${latestScan.id}` : 'No scans executed'}
              </span>
              {latestScan && (
                <span className="rounded bg-emerald-500/10 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-400 border border-emerald-500/20 uppercase">
                  {latestScan.status}
                </span>
              )}
            </div>
            <div className="text-[11px] text-gray-400 flex items-center space-x-1">
              <Clock className="h-3 w-3 text-gray-500" />
              <span>
                {latestScan?.created_at ? new Date(latestScan.created_at).toLocaleTimeString() : 'Awaiting trigger'}
              </span>
            </div>
          </div>

          {/* Group 3: Compatibility & Outstanding Changes */}
          <div className="md:pl-5 space-y-1 pt-3 md:pt-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500">
              API Compatibility Status
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-rose-400">
                {metrics.counts.breaking_changes} Breaking Changes
              </span>
            </div>
            <div className="text-[11px] text-gray-400">
              {metrics.counts.approved_repairs} repairs approved • {metrics.counts.open_prs} reviewable PRs
            </div>
          </div>
        </div>
      </div>

      {/* C. 4 Summary Metric Panels */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div
          onClick={() => onNavigate('repositories')}
          className="apv-panel p-3.5 hover:border-[#363847] cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-medium text-gray-400">Connected Repositories</span>
            <FolderGit2 className="h-4 w-4 text-gray-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{metrics.counts.repositories}</div>
          <div className="mt-1 text-[10px] text-gray-500 font-mono">100% indexed &amp; ready</div>
        </div>

        <div
          onClick={() => onNavigate('specs')}
          className="apv-panel p-3.5 hover:border-[#363847] cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-medium text-gray-400">Total Scans Executed</span>
            <FileCode2 className="h-4 w-4 text-violet-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{metrics.counts.scans}</div>
          <div className="mt-1 text-[10px] text-gray-500 font-mono">OpenAPI 3.0 &amp; 3.1</div>
        </div>

        <div
          onClick={() => onNavigate('changes')}
          className="apv-panel p-3.5 hover:border-[#363847] cursor-pointer transition-colors border-l-2 border-l-rose-500/80"
        >
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-medium text-gray-400">Open Breaking Changes</span>
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-400">{metrics.counts.breaking_changes}</div>
          <div className="mt-1 text-[10px] text-gray-500 font-mono">Requires client adaptation</div>
        </div>

        <div
          onClick={() => onNavigate('pull_requests')}
          className="apv-panel p-3.5 hover:border-[#363847] cursor-pointer transition-colors border-l-2 border-l-violet-500/80"
        >
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-medium text-gray-400">PRs Awaiting Review</span>
            <GitPullRequest className="h-4 w-4 text-violet-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{metrics.counts.open_prs}</div>
          <div className="mt-1 text-[10px] text-gray-500 font-mono">Verified in isolated sandbox</div>
        </div>
      </div>

      {/* D. Main Workspace: Primary Area (8 cols) + Secondary Area (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Primary Area (8 Cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Severity Breakdown Bar */}
          <div className="apv-panel p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white tracking-wide">
                Detected Change Classification Distribution
              </span>
              <span className="text-[11px] text-gray-400 font-mono">
                {breakingTotal} Breaking • {warningsTotal} Warnings
              </span>
            </div>

            <div className="h-2 w-full rounded-full bg-[#15151D] overflow-hidden flex">
              <div
                style={{ width: `${breakingPct}%` }}
                className="bg-rose-500 h-full transition-all duration-500"
                title={`${breakingTotal} Breaking Changes`}
              ></div>
              <div
                style={{ width: `${warningPct}%` }}
                className="bg-amber-500 h-full transition-all duration-500"
                title={`${warningsTotal} Warnings`}
              ></div>
            </div>

            <div className="mt-3 flex items-center space-x-4 text-[11px] text-gray-400">
              <span className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                <span>Breaking (Incompatible contract changes)</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                <span>Warnings (Deprecations / modifications)</span>
              </span>
            </div>
          </div>

          {/* Recent Scans Table */}
          <div className="apv-panel p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  Recent API Specification Scans
                </h2>
                <p className="text-[11px] text-gray-500">OpenAPI version comparison records</p>
              </div>
              <button
                onClick={() => onNavigate('specs')}
                className="text-xs text-violet-400 hover:text-violet-300 font-medium"
              >
                View all specs →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#272832] text-gray-400 text-[11px] font-semibold">
                  <tr>
                    <th className="py-2 px-2.5">ID</th>
                    <th className="py-2 px-2.5">Repository</th>
                    <th className="py-2 px-2.5">Contract Diff</th>
                    <th className="py-2 px-2.5">Breaking</th>
                    <th className="py-2 px-2.5">Status</th>
                    <th className="py-2 px-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#272832]/60 text-gray-300">
                  {scans.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-gray-500">
                        No scans recorded yet.
                      </td>
                    </tr>
                  ) : (
                    scans.slice(0, 5).map(scan => (
                      <tr key={scan.id} className="hover:bg-[#15151D] transition-colors">
                        <td className="py-2.5 px-2.5 font-mono text-gray-500">#{scan.id}</td>
                        <td className="py-2.5 px-2.5 font-medium text-white">payment-service-py</td>
                        <td className="py-2.5 px-2.5 font-mono text-gray-400 text-[11px]">
                          v1.0.0 → v2.0.0
                        </td>
                        <td className="py-2.5 px-2.5">
                          {scan.breaking_changes > 0 ? (
                            <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/20">
                              {scan.breaking_changes} breaking
                            </span>
                          ) : (
                            <span className="text-emerald-400 text-[11px]">0 breaking</span>
                          )}
                        </td>
                        <td className="py-2.5 px-2.5">
                          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
                            {scan.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-2.5 text-right">
                          <button
                            onClick={() => onInspectScan(scan.id)}
                            className="rounded px-2 py-1 text-[11px] text-gray-300 hover:text-white bg-[#15151D] hover:bg-[#1A1A24] border border-[#272832] transition-colors"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Breaking Changes Quick View */}
          <div className="apv-panel p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-300">
                  Critical Breaking Changes
                </h2>
                <p className="text-[11px] text-gray-500">Changes requiring source code adaptation</p>
              </div>
              <button
                onClick={() => onNavigate('changes')}
                className="text-xs text-violet-400 hover:text-violet-300 font-medium"
              >
                Inspect all changes →
              </button>
            </div>

            <div className="space-y-2">
              {recentChanges.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-500">
                  No critical changes detected in current scan.
                </div>
              ) : (
                recentChanges.map(c => (
                  <div
                    key={c.id}
                    onClick={() => onNavigate('changes')}
                    className="flex items-center justify-between rounded-lg bg-[#15151D] p-3 border border-[#272832] hover:border-[#363847] cursor-pointer transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="rounded bg-rose-500/15 px-1.5 py-0.2 text-[9px] font-bold text-rose-400 border border-rose-500/30">
                          {c.change_type}
                        </span>
                        <span className="font-mono text-xs font-bold text-gray-200">
                          {c.http_method || 'ANY'} {c.path}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 line-clamp-1">{c.description}</p>
                    </div>

                    <ChevronRight className="h-4 w-4 text-gray-500 shrink-0 ml-3" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Secondary Area (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Workflow State Machine Card */}
          <div className="apv-panel p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                Autonomous Lifecycle
              </span>
              <span className="text-[10px] text-violet-400 font-mono">Stage 5/5</span>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { label: 'Detect Contract Diff', desc: 'OpenAPI 3.0/3.1 comparison', done: true },
                { label: 'Analyze Code Impact', desc: 'AST mapping to client files', done: true },
                { label: 'Synthesize AI Repair', desc: 'Unified diff generation', done: true },
                { label: 'Verify in Sandbox', desc: 'Subprocess test runner (45s timeout)', done: true },
                { label: 'Reviewable Pull Request', desc: 'Never auto-merged to default', done: true },
              ].map((step, i) => (
                <div
                  key={i}
                  className="flex items-start space-x-2.5 rounded-lg bg-[#15151D] p-2.5 border border-[#272832]"
                >
                  <CheckCircle2 className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-gray-200 block text-xs">{step.label}</span>
                    <span className="text-[10px] text-gray-500">{step.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Pull Requests */}
          <div className="apv-panel p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                Recent Pull Requests
              </span>
              <button
                onClick={() => onNavigate('pull_requests')}
                className="text-xs text-violet-400 hover:text-violet-300"
              >
                View all →
              </button>
            </div>

            <div className="space-y-2">
              {latestPrs.length === 0 ? (
                <p className="text-xs text-gray-500 py-3 text-center">No PRs created yet.</p>
              ) : (
                latestPrs.map(pr => (
                  <div
                    key={pr.id}
                    onClick={() => onNavigate('pull_requests')}
                    className="rounded-lg bg-[#15151D] p-3 border border-[#272832] hover:border-[#363847] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-violet-400">
                        PR #{pr.pr_number || pr.id}
                      </span>
                      <span className="rounded bg-emerald-500/10 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-400 uppercase">
                        {pr.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-200 line-clamp-1 font-medium">{pr.title}</p>
                    <div className="mt-2 text-[10px] text-gray-500 font-mono">
                      {pr.branch_name} → {pr.base_branch}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity / Notification Feed */}
          <div className="apv-panel p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-300 block">
              Recent System Activity
            </span>
            <div className="space-y-2">
              {recentAlerts.length === 0 ? (
                <p className="text-xs text-gray-500 py-2 text-center">No recent alerts.</p>
              ) : (
                recentAlerts.map(alert => (
                  <div key={alert.id} className="rounded-lg bg-[#15151D] p-2.5 border border-[#272832] text-xs">
                    <div className="flex items-center justify-between text-gray-300 font-semibold">
                      <span>{alert.title}</span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">{alert.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
