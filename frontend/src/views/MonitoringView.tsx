import React, { useState, useEffect } from 'react';
import {
  Activity,
  Play,
  Pause,
  Clock,
  Globe,
  Bell,
  RefreshCw,
  Plus,
  Key,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Shield,
  X
} from 'lucide-react';
import { MonitoringConfig, BackgroundJob, NotificationRecord, Repository } from '../types';
import { api } from '../services/api';

interface MonitoringViewProps {
  repositories: Repository[];
  notifications: NotificationRecord[];
  onRefreshNotifications: () => void;
}

export const MonitoringView: React.FC<MonitoringViewProps> = ({
  repositories,
  notifications,
  onRefreshNotifications,
}) => {
  const [configs, setConfigs] = useState<MonitoringConfig[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<number | null>(null);
  const [jobs, setJobs] = useState<BackgroundJob[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [specUrl, setSpecUrl] = useState('');
  const [repoId, setRepoId] = useState<number | ''>('');
  const [intervalMinutes, setIntervalMinutes] = useState(60);
  const [scheduleCron, setScheduleCron] = useState('');

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const res = await api.listMonitoringConfigs();
      setConfigs(res);
      if (res.length > 0 && !selectedConfigId) {
        setSelectedConfigId(res[0].id);
        loadJobs(res[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadJobs = async (configId: number) => {
    try {
      const res = await api.getMonitoringJobs(configId);
      setJobs(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectConfig = (configId: number) => {
    setSelectedConfigId(configId);
    loadJobs(configId);
  };

  const handleTogglePause = async (config: MonitoringConfig) => {
    try {
      if (config.is_active) {
        await api.pauseMonitoring(config.id);
      } else {
        await api.resumeMonitoring(config.id);
      }
      await loadConfigs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunNow = async (configId: number) => {
    try {
      await api.runMonitoringNow(configId);
      await loadJobs(configId);
      onRefreshNotifications();
    } catch (err: any) {
      alert(`Trigger failed: ${err.message}`);
    }
  };

  const handleCreateConfig = async () => {
    if (!name || !specUrl || !repoId) {
      alert('Please fill out all required fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.createMonitoringConfig({
        name,
        api_spec_url: specUrl,
        repository_id: Number(repoId),
        interval_minutes: Number(intervalMinutes),
        schedule_cron: scheduleCron || undefined,
        is_active: true,
        auto_repair: false,
        auto_pr: false
      });
      setShowAddModal(false);
      setName('');
      setSpecUrl('');
      setRepoId('');
      setScheduleCron('');
      await loadConfigs();
    } catch (err: any) {
      alert(`Error creating monitor: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeConfig = configs.find(c => c.id === selectedConfigId) || configs[0];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2.5">
            <div className="h-7 w-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Activity className="h-4 w-4 text-violet-400" />
            </div>
            <span>Monitoring</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Automated recurring API specification polling, webhook validation, and breaking change alerts
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Scheduled Monitor</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monitor Configurations List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              Active Monitoring Rules ({configs.length})
            </h2>
          </div>

          {configs.length === 0 ? (
            <div className="rounded-xl border border-[#272832] bg-[#101117] p-8 text-center text-xs text-gray-500">
              <Activity className="h-6 w-6 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-300 font-medium">No monitoring rules configured</p>
              <p className="text-gray-500 mt-0.5">Click &quot;New Scheduled Monitor&quot; to set up polling.</p>
            </div>
          ) : (
            configs.map(cfg => {
              const isSelected = activeConfig?.id === cfg.id;
              return (
                <div
                  key={cfg.id}
                  onClick={() => handleSelectConfig(cfg.id)}
                  className={`rounded-xl p-4 cursor-pointer transition-all border ${
                    isSelected
                      ? 'border-violet-500/60 bg-[#15151D] shadow-sm'
                      : 'border-[#272832] bg-[#101117] hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-white">{cfg.name}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-mono font-semibold border ${
                        cfg.is_active
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-[#15151D] text-gray-500 border-[#272832]'
                      }`}
                    >
                      {cfg.is_active ? 'ACTIVE' : 'PAUSED'}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400 truncate font-mono">{cfg.api_spec_url}</p>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500 font-mono border-t border-[#272832]/60 pt-2">
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 text-gray-500" />
                      <span>Every {cfg.interval_minutes}m</span>
                    </span>
                    <span>
                      {cfg.last_run_at ? `Last run: ${new Date(cfg.last_run_at).toLocaleTimeString()}` : 'Not run yet'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Monitor Details and Job History */}
        <div className="lg:col-span-7 space-y-4">
          {activeConfig ? (
            <div className="rounded-xl bg-[#101117] p-6 border border-[#272832] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#272832] pb-4 gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">{activeConfig.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5 font-mono truncate">{activeConfig.api_spec_url}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleTogglePause(activeConfig)}
                    className="flex items-center space-x-1.5 rounded-lg bg-[#15151D] hover:bg-[#1C1D27] px-3 py-1.5 text-xs text-gray-300 border border-[#272832] transition-colors"
                  >
                    {activeConfig.is_active ? (
                      <>
                        <Pause className="h-3.5 w-3.5 text-amber-400" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Resume</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleRunNow(activeConfig.id)}
                    className="flex items-center space-x-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Trigger Now</span>
                  </button>
                </div>
              </div>

              {/* Webhook Endpoint Info */}
              <div className="space-y-2 rounded-xl bg-[#15151D] p-3.5 border border-[#272832] text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-300 flex items-center space-x-1.5">
                    <Globe className="h-3.5 w-3.5 text-violet-400" />
                    <span>Inbound Webhook Endpoint:</span>
                  </span>
                  <span className="text-[9px] text-gray-500 font-mono">HMAC-SHA256 Protected</span>
                </div>
                <div className="rounded bg-[#08090D] p-2.5 font-mono text-[11px] text-violet-300 border border-[#272832] select-all">
                  /api/v1/monitoring/webhook/spec/{activeConfig.id}
                </div>
                {activeConfig.webhook_secret && (
                  <div className="flex items-center space-x-2 text-[11px] text-gray-400">
                    <Key className="h-3 w-3 text-amber-400" />
                    <span>Secret: <code className="text-gray-300 font-mono">{activeConfig.webhook_secret}</code></span>
                  </div>
                )}
              </div>

              {/* Execution Job Log */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                    Recent Background Job Executions
                  </h4>
                  <span className="text-[10px] font-mono text-gray-500">{jobs.length} run(s) recorded</span>
                </div>

                {jobs.length === 0 ? (
                  <div className="rounded-lg bg-[#15151D] p-6 text-center text-xs text-gray-500 border border-[#272832]">
                    No background jobs executed yet for this monitor.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {jobs.map(job => (
                      <div
                        key={job.id}
                        className="rounded-lg bg-[#08090D] p-3 border border-[#272832] text-xs font-mono space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 font-semibold">Job #{job.id} ({job.job_type})</span>
                          <span
                            className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                              job.status === 'succeeded'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {job.status.toUpperCase()}
                          </span>
                        </div>
                        {job.logs && <pre className="text-gray-300 text-[11px] whitespace-pre-wrap">{job.logs}</pre>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-[#272832] bg-[#101117] p-12 text-center text-xs text-gray-500">
              Select a monitoring rule from the left panel to inspect execution logs and webhook settings.
            </div>
          )}
        </div>
      </div>

      {/* Modal for adding monitor */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl p-6 border border-[#272832] bg-[#15151D] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#272832] pb-3">
              <h3 className="text-sm font-bold text-white">Create Scheduled API Monitor</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-md p-1 text-gray-400 hover:text-white hover:bg-[#1C1D27]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">Monitor Name</label>
                <input
                  type="text"
                  placeholder="e.g. Payment Gateway Poller"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-lg bg-[#101117] border border-[#272832] px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">Target Client Repository</label>
                <select
                  value={repoId}
                  onChange={e => setRepoId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full rounded-lg bg-[#101117] border border-[#272832] px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500/60"
                >
                  <option value="">-- Select Repository --</option>
                  {repositories.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">Remote OpenAPI URL</label>
                <input
                  type="url"
                  placeholder="https://api.store.com/openapi.json"
                  value={specUrl}
                  onChange={e => setSpecUrl(e.target.value)}
                  className="w-full rounded-lg bg-[#101117] border border-[#272832] px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/60 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">Interval (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={intervalMinutes}
                    onChange={e => setIntervalMinutes(Number(e.target.value))}
                    className="w-full rounded-lg bg-[#101117] border border-[#272832] px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500/60"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 mb-1">Cron Expression (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 0 */6 * * *"
                    value={scheduleCron}
                    onChange={e => setScheduleCron(e.target.value)}
                    className="w-full rounded-lg bg-[#101117] border border-[#272832] px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/60 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-[#272832]">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateConfig}
                disabled={isSubmitting}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-violet-600 hover:bg-violet-500 text-white shadow-md disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Creating...' : 'Create Monitor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
