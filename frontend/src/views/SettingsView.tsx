import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  Cpu,
  GitBranch,
  ShieldCheck,
  Sparkles,
  Server,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  Sliders,
  FolderGit2
} from 'lucide-react';
import { SystemConfigStatus, SystemHealth } from '../types';
import { api } from '../services/api';

interface SettingsViewProps {
  onSeedDemo: () => void;
  isSeeding: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onSeedDemo, isSeeding }) => {
  const [config, setConfig] = useState<SystemConfigStatus | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const [c, h] = await Promise.all([api.getConfigStatus(), api.getHealth()]);
      setConfig(c);
      setHealth(h);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2.5">
            <div className="h-7 w-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Settings className="h-4 w-4 text-violet-400" />
            </div>
            <span>Settings &amp; Integrations</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            System configuration status, AI provider setup, SQLite persistence, and safety rules
          </p>
        </div>

        <button
          onClick={loadStatus}
          disabled={loading}
          className="flex items-center space-x-1.5 rounded-lg bg-[#15151D] hover:bg-[#1C1D27] px-3.5 py-2 text-xs font-semibold text-gray-200 border border-[#272832] transition-colors disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Diagnostics</span>
        </button>
      </div>

      {/* System Health Status Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-[#101117] p-4 border border-[#272832]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Database Engine</span>
            <Database className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-base font-bold text-white">SQLite Relational</div>
          <div className="mt-1 flex items-center space-x-1.5 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="h-3 w-3" />
            <span>Connected &amp; Initialized</span>
          </div>
        </div>

        <div className="rounded-xl bg-[#101117] p-4 border border-[#272832]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Background Scheduler</span>
            <Server className="h-4 w-4 text-violet-400" />
          </div>
          <div className="mt-2 text-base font-bold text-white">APScheduler AsyncIO</div>
          <div className="mt-1 flex items-center space-x-1.5 text-xs text-violet-400 font-medium">
            <CheckCircle2 className="h-3 w-3" />
            <span>Running in Background</span>
          </div>
        </div>

        <div className="rounded-xl bg-[#101117] p-4 border border-[#272832]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">AI Provider</span>
            <Cpu className="h-4 w-4 text-violet-400" />
          </div>
          <div className="mt-2 text-base font-bold text-white uppercase">{config?.llm_provider || 'Mock Engine'}</div>
          <div className="mt-1 flex items-center space-x-1.5 text-xs text-violet-300 font-medium">
            <CheckCircle2 className="h-3 w-3" />
            <span>Ready for Code Synthesis</span>
          </div>
        </div>
      </div>

      {/* Integrations and Boundaries Panel */}
      <div className="rounded-xl bg-[#101117] p-6 border border-[#272832] space-y-4">
        <div className="flex items-center justify-between border-b border-[#272832] pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            APIVerse Security Boundaries &amp; Environment
          </h2>
          <span className="text-[10px] font-mono text-gray-500">Zero Cloud Leakage Mode Supported</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl bg-[#15151D] p-4 border border-[#272832] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-300">GitHub App Integration</span>
              <span className="rounded bg-violet-500/10 px-2 py-0.5 text-[9px] font-mono font-semibold text-violet-400 border border-violet-500/20">
                {config?.github_app_configured ? 'APP CONFIGURED' : 'LOCAL DEMO MODE'}
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              When GitHub App keys are unconfigured, APIVerse safely runs in Local Demo Mode with simulated branch management and local worktree isolation.
            </p>
          </div>

          <div className="rounded-xl bg-[#15151D] p-4 border border-[#272832] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-300">Developer Approval Policy</span>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[9px] font-mono font-semibold text-emerald-400 border border-emerald-500/20">
                STRICT ENFORCEMENT
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              Every AI-synthesized repair requires explicit manual developer authorization in the AI Repair Studio before a Pull Request can be published.
            </p>
          </div>

          <div className="rounded-xl bg-[#15151D] p-4 border border-[#272832] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-300">Database Storage Path</span>
              <span className="font-mono text-gray-500 text-[10px]">LOCAL DISK</span>
            </div>
            <div className="font-mono text-violet-300 select-all truncate bg-[#08090D] p-2.5 rounded-lg border border-[#272832] text-[11px]">
              {config?.database_path || 'backend/data/bump.db'}
            </div>
          </div>

          <div className="rounded-xl bg-[#15151D] p-4 border border-[#272832] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-300">Sandbox Isolation Root</span>
              <span className="font-mono text-gray-500 text-[10px]">TIME &amp; CPU LIMITED</span>
            </div>
            <div className="font-mono text-violet-300 select-all truncate bg-[#08090D] p-2.5 rounded-lg border border-[#272832] text-[11px]">
              {config?.sandbox_path || 'backend/data/sandbox'}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Demo Dataset Reset Banner */}
      <div className="rounded-xl bg-gradient-to-r from-violet-950/30 via-[#15151D] to-[#101117] border border-violet-500/20 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-violet-400" />
            <h3 className="text-sm font-bold text-white">Interactive Demonstration Scenario</h3>
            <span className="rounded bg-violet-500/10 px-1.5 py-0.2 text-[9px] font-mono text-violet-400 border border-violet-500/20">
              APIVerse
            </span>
          </div>
          <p className="text-xs text-gray-300 max-w-xl leading-relaxed">
            Populate sample OpenAPI specs (v1 vs v2 breaking changes), client repositories, code impact matches,
            an AI repair proposal, verified sandbox test runs, and open Pull Requests with a single click.
          </p>
        </div>

        <button
          onClick={onSeedDemo}
          disabled={isSeeding}
          className="flex items-center space-x-2 rounded-lg bg-violet-600 hover:bg-violet-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-600/25 transition-all shrink-0 disabled:opacity-50 self-start sm:self-auto"
        >
          <Sparkles className={`h-3.5 w-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
          <span>{isSeeding ? 'Populating Dataset...' : 'Re-Seed Demo Data'}</span>
        </button>
      </div>
    </div>
  );
};
