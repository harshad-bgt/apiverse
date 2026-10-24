import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Play,
  FileCode2,
  AlertTriangle,
  Edit3,
  Check,
  X
} from 'lucide-react';
import { DetectedChange, RepairAttempt, ProposedPatch } from '../types';
import { api } from '../services/api';

interface RepairStudioViewProps {
  selectedChange: DetectedChange | null;
  onGoToVerification: (repair: RepairAttempt) => void;
}

export const RepairStudioView: React.FC<RepairStudioViewProps> = ({
  selectedChange,
  onGoToVerification,
}) => {
  const [repairs, setRepairs] = useState<RepairAttempt[]>([]);
  const [activeRepair, setActiveRepair] = useState<RepairAttempt | null>(null);
  const [activePatch, setActivePatch] = useState<ProposedPatch | null>(null);
  const [provider, setProvider] = useState('mock');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCode, setEditedCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (selectedChange) {
      loadRepairs(selectedChange.id);
    }
  }, [selectedChange]);

  const loadRepairs = async (changeId: number) => {
    try {
      const res = await api.getRepairsByChange(changeId);
      setRepairs(res);
      if (res.length > 0) {
        setActiveRepair(res[0]);
        if (res[0].patches && res[0].patches.length > 0) {
          setActivePatch(res[0].patches[0]);
          setEditedCode(res[0].patches[0].patched_content);
        }
      } else {
        setActiveRepair(null);
        setActivePatch(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerate = async () => {
    if (!selectedChange) return;
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const newRepair = await api.generateRepair(selectedChange.id, provider);
      await loadRepairs(selectedChange.id);
      setActiveRepair(newRepair);
      if (newRepair.patches && newRepair.patches.length > 0) {
        setActivePatch(newRepair.patches[0]);
        setEditedCode(newRepair.patches[0].patched_content);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate repair.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApproval = async (approved: boolean) => {
    if (!activeRepair) return;
    setIsApproving(true);
    try {
      const updated = await api.approveRepair(activeRepair.id, approved);
      setActiveRepair(updated);
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    } finally {
      setIsApproving(false);
    }
  };

  const handleSavePatchEdit = async () => {
    if (!activePatch) return;
    try {
      const updatedPatch = await api.updatePatch(activePatch.id, editedCode);
      setActivePatch(updatedPatch);
      setIsEditing(false);
      if (activeRepair) {
        await loadRepairs(activeRepair.detected_change_id);
      }
    } catch (err: any) {
      alert(`Failed to save patch: ${err.message}`);
    }
  };

  if (!selectedChange) {
    return (
      <div className="apv-panel p-12 text-center text-xs text-gray-500">
        No active breaking change selected. Go to Breaking Changes tab to pick a change.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
            <Wrench className="h-4 w-4 text-violet-400" />
            <span>AI Repair Studio</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Automated code repair generation, unified diff inspection, and developer approval controls
          </p>
        </div>

        {activeRepair && (
          <button
            onClick={() => onGoToVerification(activeRepair)}
            className="flex items-center space-x-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all self-start sm:self-auto"
          >
            <Play className="h-3 w-3 fill-current" />
            <span>Execute Test Verification</span>
          </button>
        )}
      </div>

      {/* Target Change Context */}
      <div className="rounded-lg bg-[#15151D] border border-[#272832] p-3 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2.5 truncate">
          <span className="rounded bg-rose-500/15 px-1.5 py-0.2 text-[9px] font-bold text-rose-400 border border-rose-500/30 shrink-0">
            {selectedChange.change_type}
          </span>
          <span className="font-mono text-gray-200 font-bold shrink-0">
            {selectedChange.http_method || 'ANY'} {selectedChange.path}
          </span>
          <span className="text-gray-400 truncate hidden md:inline">{selectedChange.description}</span>
        </div>
      </div>

      {/* Synthesis Toolbar */}
      <div className="apv-panel p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5 text-xs">
          <span className="text-gray-400 font-medium">Model Engine:</span>
          <select
            value={provider}
            onChange={e => setProvider(e.target.value)}
            className="rounded-lg bg-[#15151D] border border-[#272832] px-2.5 py-1 text-xs text-white focus:outline-none"
          >
            <option value="mock">Deterministic Rule Engine (Local / Offline)</option>
            <option value="openai">OpenAI GPT-4o (Server Key)</option>
            <option value="anthropic">Anthropic Claude 3.5 Sonnet</option>
            <option value="gemini">Google Gemini 1.5 Pro</option>
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center space-x-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-violet-600/30 transition-all disabled:opacity-50"
        >
          <Sparkles className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Synthesizing Patch...' : 'Synthesize AI Repair'}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400">
          {errorMsg}
        </div>
      )}

      {/* Repair Content Details */}
      {activeRepair ? (
        <div className="space-y-5">
          {/* Explanation & Approval Control */}
          <div className="apv-panel p-4 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#272832] pb-3 gap-2">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-violet-400">Repair #{activeRepair.id}</span>
                  <span className="rounded bg-[#15151D] px-1.5 py-0.2 text-[9px] text-gray-400 font-mono border border-[#272832]">
                    {activeRepair.model_name}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-1">Proposed Code Resolution</h3>
              </div>

              {/* Developer Approval Guard */}
              <div className="flex items-center space-x-2.5">
                {activeRepair.developer_approved ? (
                  <span className="flex items-center space-x-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Approved by Developer</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400 border border-amber-500/30">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Awaiting Developer Approval</span>
                  </span>
                )}

                <button
                  onClick={() => handleApproval(!activeRepair.developer_approved)}
                  disabled={isApproving}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                    activeRepair.developer_approved
                      ? 'bg-[#15151D] text-gray-300 hover:bg-[#1A1A24] border border-[#272832]'
                      : 'bg-emerald-600 text-white hover:bg-emerald-500 font-semibold'
                  }`}
                >
                  {activeRepair.developer_approved ? 'Revoke Approval' : 'Authorize Fix'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              <div>
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Failure Explanation</span>
                <p className="mt-1 text-gray-300 bg-[#15151D] p-3 rounded-lg border border-[#272832] leading-relaxed">
                  {activeRepair.explanation}
                </p>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Repair Reasoning</span>
                <p className="mt-1 text-gray-300 bg-[#15151D] p-3 rounded-lg border border-[#272832] leading-relaxed">
                  {activeRepair.reasoning}
                </p>
              </div>
            </div>

            {activeRepair.known_risks && (
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs text-amber-300 flex items-start space-x-2">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Risk Assessment: </span>
                  <span>{activeRepair.known_risks}</span>
                </div>
              </div>
            )}
          </div>

          {/* Unified Diff & Patch Editor */}
          {activePatch && (
            <div className="apv-panel p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#272832] pb-2.5">
                <div className="flex items-center space-x-2 font-mono text-xs">
                  <FileCode2 className="h-3.5 w-3.5 text-violet-400" />
                  <span className="font-bold text-white">{activePatch.file_path}</span>
                  <span className="rounded bg-emerald-500/10 px-1.5 py-0.2 text-[9px] text-emerald-400 font-medium">
                    Syntax Valid
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-1 rounded-md bg-[#15151D] px-2 py-1 text-xs text-gray-300 hover:bg-[#1A1A24] border border-[#272832]"
                  >
                    <Edit3 className="h-3 w-3" />
                    <span>{isEditing ? 'View Diff' : 'Edit Patch'}</span>
                  </button>
                  {isEditing && (
                    <button
                      onClick={handleSavePatchEdit}
                      className="rounded-md bg-violet-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-violet-500"
                    >
                      Save
                    </button>
                  )}
                </div>
              </div>

              {isEditing ? (
                <textarea
                  rows={10}
                  value={editedCode}
                  onChange={e => setEditedCode(e.target.value)}
                  className="w-full rounded-lg bg-[#08090D] p-3.5 font-mono text-xs text-gray-200 border border-[#272832] leading-relaxed focus:outline-none"
                />
              ) : (
                <div className="rounded-lg bg-[#08090D] p-3.5 border border-[#272832] overflow-x-auto">
                  <pre className="font-mono text-xs leading-relaxed">
                    {activePatch.unified_diff.split('\n').map((line, idx) => {
                      let color = 'text-gray-300';
                      let bg = 'transparent';
                      if (line.startsWith('+') && !line.startsWith('+++')) {
                        color = 'text-emerald-400';
                        bg = 'bg-emerald-950/25';
                      } else if (line.startsWith('-') && !line.startsWith('---')) {
                        color = 'text-rose-400';
                        bg = 'bg-rose-950/25';
                      } else if (line.startsWith('@@')) {
                        color = 'text-violet-400 font-bold';
                      }
                      return (
                        <div key={idx} className={`${bg} px-1.5 py-0.5 rounded-sm ${color}`}>
                          {line}
                        </div>
                      );
                    })}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="apv-panel p-12 text-center text-xs text-gray-500">
          No repair proposals generated yet. Click &quot;Synthesize AI Repair&quot; above.
        </div>
      )}
    </div>
  );
};
