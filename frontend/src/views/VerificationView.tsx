import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  ArrowRight,
  GitPullRequest,
  Check,
  AlertCircle,
  Sparkles,
  Command
} from 'lucide-react';
import { RepairAttempt, TestRun } from '../types';
import { api } from '../services/api';

interface VerificationViewProps {
  selectedRepair: RepairAttempt | null;
  onGoToPR: (repair: RepairAttempt) => void;
}

export const VerificationView: React.FC<VerificationViewProps> = ({
  selectedRepair,
  onGoToPR,
}) => {
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [activeRun, setActiveRun] = useState<TestRun | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [customCommand, setCustomCommand] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (selectedRepair) {
      loadRuns(selectedRepair.id);
    }
  }, [selectedRepair]);

  const loadRuns = async (repairId: number) => {
    try {
      const runs = await api.getRunsByRepair(repairId);
      setTestRuns(runs);
      if (runs.length > 0) {
        setActiveRun(runs[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExecuteVerification = async () => {
    if (!selectedRepair) return;
    setIsRunning(true);
    setErrorMsg(null);
    try {
      const run = await api.runVerification(selectedRepair.id, customCommand || undefined);
      await loadRuns(selectedRepair.id);
      setActiveRun(run);
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification execution failed.');
    } finally {
      setIsRunning(false);
    }
  };

  if (!selectedRepair) {
    return (
      <div className="rounded-xl border border-[#272832] bg-[#101117] p-12 text-center text-xs text-gray-500">
        <Terminal className="h-8 w-8 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-300 font-medium">No repair attempt selected</p>
        <p className="text-gray-500 mt-1">Navigate to AI Repair Studio to generate a repair patch before running isolated verification.</p>
      </div>
    );
  }

  const isVerified = activeRun?.status === 'passed';
  const canPublishPR = isVerified && selectedRepair.developer_approved;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2.5">
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Terminal className="h-4 w-4 text-emerald-400" />
            </div>
            <span>Test Verification</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Validates proposed code repairs against repository tests in isolated sandbox worktrees
          </p>
        </div>

        {canPublishPR && (
          <button
            onClick={() => onGoToPR(selectedRepair)}
            className="flex items-center space-x-2 rounded-lg bg-violet-600 hover:bg-violet-500 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-600/20 transition-all self-start sm:self-auto"
          >
            <GitPullRequest className="h-3.5 w-3.5" />
            <span>Open Verified Pull Request</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Target Repair Header Bar */}
      <div className="rounded-xl bg-[#101117] border border-[#272832] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center flex-wrap gap-2 text-xs text-gray-300">
          <span className="font-mono font-bold text-violet-400">Repair #{selectedRepair.id}</span>
          <span className="text-gray-600">•</span>
          <span>Patches: <strong className="text-white">{selectedRepair.patches?.length || 0} file(s)</strong></span>
          <span className="text-gray-600">•</span>
          <span>
            Approval:{' '}
            <strong className={selectedRepair.developer_approved ? 'text-emerald-400' : 'text-amber-400'}>
              {selectedRepair.developer_approved ? 'Approved' : 'Pending Authorization'}
            </strong>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Command className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-500" />
            <input
              type="text"
              placeholder="Command (e.g. pytest)"
              value={customCommand}
              onChange={e => setCustomCommand(e.target.value)}
              className="rounded-lg bg-[#15151D] border border-[#272832] pl-7 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 w-48 sm:w-56 font-mono"
            />
          </div>
          <button
            onClick={handleExecuteVerification}
            disabled={isRunning}
            className="flex items-center space-x-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors disabled:opacity-50 shadow-sm"
          >
            <Play className={`h-3 w-3 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running in Sandbox...' : 'Run Tests'}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-400">
          {errorMsg}
        </div>
      )}

      {/* Safety Policy Notice */}
      {!selectedRepair.developer_approved && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3.5 flex items-center space-x-3 text-xs text-amber-300">
          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <strong className="font-semibold text-amber-200">Developer Approval Boundary Active: </strong>
            <span>
              Even if sandbox tests pass, automated Pull Request publication requires explicit developer authorization in the AI Repair Studio.
            </span>
          </div>
        </div>
      )}

      {/* Active Run Results */}
      {activeRun ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="rounded-xl bg-[#101117] p-3.5 border border-[#272832]">
              <span className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">Execution Status</span>
              <div className="mt-1.5 flex items-center space-x-2">
                {activeRun.status === 'passed' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-400" />
                )}
                <span className={`text-sm font-bold uppercase ${
                  activeRun.status === 'passed' ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {activeRun.status}
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-[#101117] p-3.5 border border-[#272832]">
              <span className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">Test Suite Command</span>
              <div className="mt-1.5 font-mono text-xs text-violet-300 font-semibold truncate">
                {activeRun.command || 'pytest tests/'}
              </div>
            </div>

            <div className="rounded-xl bg-[#101117] p-3.5 border border-[#272832]">
              <span className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">Test Results</span>
              <div className="mt-1.5 text-xs text-gray-200 font-mono">
                <span className="text-emerald-400 font-bold">{activeRun.passed_tests} passed</span>
                {activeRun.failed_tests > 0 && (
                  <span className="text-rose-400 font-bold ml-2">{activeRun.failed_tests} failed</span>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-[#101117] p-3.5 border border-[#272832]">
              <span className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">Execution Duration</span>
              <div className="mt-1.5 flex items-center space-x-1.5 text-xs text-gray-300 font-mono">
                <Clock className="h-3.5 w-3.5 text-gray-400" />
                <span>{activeRun.duration_seconds}s</span>
              </div>
            </div>
          </div>

          {/* Sandbox Terminal Console */}
          <div className="rounded-xl bg-[#08090D] border border-[#272832] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between bg-[#101117] px-4 py-2.5 border-b border-[#272832]">
              <div className="flex items-center space-x-2">
                <div className="h-2.5 w-2.5 rounded-full bg-rose-500/80"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80"></div>
                <span className="ml-2 font-mono text-[11px] text-gray-400">Isolated Sandbox Terminal Output</span>
              </div>
              <span className="text-[10px] text-gray-500 font-mono">Exit Code: {activeRun.exit_code}</span>
            </div>

            <div className="p-4 font-mono text-xs text-gray-300 leading-relaxed overflow-x-auto max-h-96">
              {activeRun.stdout ? (
                <pre className="whitespace-pre-wrap">{activeRun.stdout}</pre>
              ) : (
                <span className="text-gray-500">No standard output recorded.</span>
              )}

              {activeRun.stderr && (
                <pre className="mt-3 text-rose-400 whitespace-pre-wrap">{activeRun.stderr}</pre>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-[#272832] bg-[#101117] p-12 text-center text-xs text-gray-500">
          No test execution runs recorded yet. Click &quot;Run Tests&quot; above to execute sandbox verification.
        </div>
      )}
    </div>
  );
};
