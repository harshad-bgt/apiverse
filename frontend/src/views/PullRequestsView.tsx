import React, { useState } from 'react';
import {
  GitPullRequest,
  GitBranch,
  ExternalLink,
  CheckCircle2,
  Clock,
  Shield,
  Layers,
  FileCode2,
  Check,
  ArrowRight,
  GitCommit,
  Sparkles
} from 'lucide-react';
import { PullRequestRecord } from '../types';

interface PullRequestsViewProps {
  pullRequests: PullRequestRecord[];
  onRefresh: () => void;
}

export const PullRequestsView: React.FC<PullRequestsViewProps> = ({ pullRequests, onRefresh }) => {
  const [selectedPrId, setSelectedPrId] = useState<number | null>(null);

  const activePr = pullRequests.find(p => p.id === selectedPrId) || pullRequests[0];

  const workflowSteps = [
    { label: 'Detect', desc: 'OpenAPI Diff', done: true },
    { label: 'Analyze', desc: 'AST Impact', done: true },
    { label: 'Repair', desc: 'AI Synthesis', done: true },
    { label: 'Verify', desc: 'Sandbox Tests', done: true },
    { label: 'Review', desc: 'PR Published', done: true },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2.5">
            <div className="h-7 w-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <GitPullRequest className="h-4 w-4 text-violet-400" />
            </div>
            <span>Pull Requests</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Reviewable Pull Requests generated with verification evidence and contract change justification
          </p>
        </div>

        <div className="flex items-center space-x-2 rounded-lg bg-[#15151D] px-3 py-1.5 text-xs text-emerald-400 border border-[#272832] self-start sm:self-auto">
          <Shield className="h-3.5 w-3.5" />
          <span className="font-medium">Strict Boundary: Never Auto-Merged</span>
        </div>
      </div>

      {/* Workflow State Machine Progression */}
      <div className="rounded-xl bg-[#101117] p-4 border border-[#272832]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
            APIVerse Autonomous Lifecycle Pipeline
          </span>
          <span className="text-[10px] font-mono text-gray-500">State Machine: Complete</span>
        </div>
        <div className="flex items-center justify-between overflow-x-auto py-1 gap-2">
          {workflowSteps.map((step, idx) => (
            <React.Fragment key={idx}>
              <div className="flex items-center space-x-2 shrink-0">
                <div className="flex items-center space-x-2 rounded-lg bg-[#15151D] px-3 py-1.5 text-xs border border-[#272832]">
                  <div className="h-4 w-4 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                    <Check className="h-2.5 w-2.5 text-emerald-400" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-200">{step.label}</span>
                    <span className="text-[10px] text-gray-500 ml-1.5 font-mono hidden sm:inline">({step.desc})</span>
                  </div>
                </div>
              </div>
              {idx < workflowSteps.length - 1 && (
                <div className="h-0.5 w-6 sm:w-10 bg-[#272832] shrink-0"></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {pullRequests.length === 0 ? (
        <div className="rounded-xl border border-[#272832] bg-[#101117] p-12 text-center text-xs text-gray-500">
          <GitPullRequest className="h-8 w-8 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-300 font-medium">No Pull Requests published yet</p>
          <p className="text-gray-500 mt-1">Complete an AI repair synthesis and sandbox test verification run to generate a Pull Request.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* PR Records List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Pull Request Records ({pullRequests.length})
              </h2>
            </div>

            {pullRequests.map(pr => {
              const isSelected = activePr?.id === pr.id;
              return (
                <div
                  key={pr.id}
                  onClick={() => setSelectedPrId(pr.id)}
                  className={`rounded-xl p-4 cursor-pointer transition-all border ${
                    isSelected
                      ? 'border-violet-500/60 bg-[#15151D] shadow-sm'
                      : 'border-[#272832] bg-[#101117] hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <GitPullRequest className={`h-3.5 w-3.5 ${isSelected ? 'text-violet-400' : 'text-gray-500'}`} />
                      <span className="font-mono text-xs font-bold text-violet-300">
                        PR #{pr.pr_number || pr.id}
                      </span>
                    </div>
                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-400 border border-emerald-500/20 uppercase">
                      {pr.status}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-white line-clamp-1">{pr.title}</h3>

                  <div className="mt-2.5 flex items-center space-x-2 text-[11px] text-gray-400 font-mono">
                    <GitBranch className="h-3 w-3 text-violet-400" />
                    <span className="text-violet-300">{pr.branch_name}</span>
                    <span className="text-gray-600">→</span>
                    <span className="text-gray-300">{pr.base_branch}</span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[10px] text-gray-500 font-mono border-t border-[#272832]/60 pt-2">
                    <span>Created: {new Date(pr.created_at).toLocaleDateString()}</span>
                    <span>Repository ID: {pr.repository_id}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PR Details and Markdown Body Inspector */}
          <div className="lg:col-span-7 space-y-4">
            {activePr ? (
              <div className="rounded-xl bg-[#101117] p-6 border border-[#272832] space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between border-b border-[#272832] pb-4 gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs text-violet-400 font-bold">
                        Pull Request #{activePr.pr_number || activePr.id}
                      </span>
                      <span className="rounded bg-violet-500/10 px-2 py-0.5 text-[9px] font-mono text-violet-300 border border-violet-500/20">
                        {activePr.status.toUpperCase()}
                      </span>
                    </div>
                    <h2 className="text-sm font-bold text-white mt-1.5">{activePr.title}</h2>
                  </div>

                  {activePr.pr_url && (
                    <a
                      href={activePr.pr_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-1.5 rounded-lg bg-[#15151D] px-3.5 py-1.5 text-xs font-semibold text-gray-200 hover:bg-[#1C1D27] border border-[#272832] transition-colors shrink-0"
                    >
                      <span>View on GitHub</span>
                      <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                    </a>
                  )}
                </div>

                {/* Branch Merge Route */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Branch Target</span>
                  <div className="flex items-center space-x-2 text-xs font-mono bg-[#15151D] p-3 rounded-lg border border-[#272832]">
                    <GitBranch className="h-3.5 w-3.5 text-violet-400" />
                    <span className="text-violet-300 font-semibold">{activePr.branch_name}</span>
                    <span className="text-gray-500">merges into</span>
                    <span className="text-white font-semibold">{activePr.base_branch}</span>
                  </div>
                </div>

                {/* Generated PR Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      Pull Request Description &amp; Verification Evidence
                    </span>
                    <span className="text-[10px] font-mono text-gray-500">Markdown Format</span>
                  </div>
                  <div className="rounded-xl bg-[#08090D] p-4 border border-[#272832] font-mono text-xs text-gray-300 leading-relaxed overflow-x-auto max-h-96 whitespace-pre-wrap">
                    {activePr.body}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
