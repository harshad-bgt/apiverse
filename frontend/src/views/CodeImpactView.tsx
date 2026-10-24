import React, { useState } from 'react';
import {
  LocateFixed,
  FileCode2,
  Wrench,
  ArrowRight,
  Layers,
  ChevronRight,
  GitBranch
} from 'lucide-react';
import { AffectedFile, DetectedChange } from '../types';

interface CodeImpactViewProps {
  selectedChange: DetectedChange | null;
  affectedFiles: AffectedFile[];
  onTriggerRepair: (change: DetectedChange) => void;
}

export const CodeImpactView: React.FC<CodeImpactViewProps> = ({
  selectedChange,
  affectedFiles,
  onTriggerRepair,
}) => {
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);

  if (!selectedChange) {
    return (
      <div className="apv-panel p-12 text-center text-xs text-gray-500">
        No active breaking change selected. Go to Breaking Changes tab and click &quot;Map Code Impact&quot;.
      </div>
    );
  }

  const activeFile = affectedFiles.find(f => f.id === selectedFileId) || affectedFiles[0];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
            <LocateFixed className="h-4 w-4 text-violet-400" />
            <span>Source Code Impact Analysis</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Deterministic AST and pattern matching connecting API breaking change to client repository code
          </p>
        </div>

        <button
          onClick={() => onTriggerRepair(selectedChange)}
          className="flex items-center space-x-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-violet-600/30 transition-all self-start sm:self-auto"
        >
          <Wrench className="h-3 w-3" />
          <span>Launch AI Repair Studio</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* Target Change Context Bar */}
      <div className="rounded-lg bg-[#15151D] border border-[#272832] p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5 text-xs truncate">
          <span className="rounded bg-rose-500/15 px-1.5 py-0.2 text-[9px] font-bold text-rose-400 border border-rose-500/30 shrink-0">
            {selectedChange.change_type}
          </span>
          <span className="font-mono text-gray-200 font-bold shrink-0">
            {selectedChange.http_method || 'ANY'} {selectedChange.path}
          </span>
          <span className="text-gray-400 truncate hidden md:inline">{selectedChange.description}</span>
        </div>
      </div>

      {affectedFiles.length === 0 ? (
        <div className="apv-panel p-12 text-center text-xs text-gray-500">
          No client source files impacted by this specific change in the repository.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Affected Locations List (5 cols) */}
          <div className="lg:col-span-5 space-y-2.5">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-1">
              Impacted Locations ({affectedFiles.length})
            </h2>

            {affectedFiles.map(file => {
              const isSelected = activeFile?.id === file.id;
              const isConfirmed = file.match_confidence === 'confirmed';
              return (
                <div
                  key={file.id}
                  onClick={() => setSelectedFileId(file.id)}
                  className={`apv-panel p-3.5 cursor-pointer transition-colors border ${
                    isSelected
                      ? 'border-violet-500 bg-[#15151D] border-l-2'
                      : 'border-[#272832] hover:border-[#363847]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-white flex items-center space-x-1.5 truncate">
                      <FileCode2 className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                      <span className="truncate">{file.file_path}</span>
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.2 text-[9px] font-bold border shrink-0 ${
                        isConfirmed
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {file.match_confidence.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-[10px] text-gray-400 font-mono">
                    <span>Function: <strong className="text-gray-200">{file.function_name}</strong></span>
                    <span>•</span>
                    <span>Lines {file.line_start}–{file.line_end}</span>
                  </div>

                  {file.context_reason && (
                    <p className="text-[11px] text-gray-400 mt-2 bg-[#101117] p-2 rounded border border-[#272832]">
                      {file.context_reason}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Source Code Evidence (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-1">
              Source Code Evidence
            </h2>

            {activeFile ? (
              <div className="apv-panel p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#272832] pb-2.5">
                  <div>
                    <span className="font-mono text-xs text-white font-bold">{activeFile.file_path}</span>
                    <span className="text-[10px] text-gray-500 block font-mono">
                      Scope: {activeFile.function_name} (lines {activeFile.line_start} to {activeFile.line_end})
                    </span>
                  </div>
                  <span className="rounded bg-[#15151D] px-2 py-0.5 text-[10px] text-violet-300 font-mono border border-[#272832]">
                    {activeFile.language}
                  </span>
                </div>

                <div className="rounded-lg bg-[#08090D] p-3.5 border border-[#272832] overflow-x-auto">
                  <pre className="font-mono text-xs text-gray-300 leading-relaxed">
                    {activeFile.snippet}
                  </pre>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => onTriggerRepair(selectedChange)}
                    className="flex items-center space-x-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-all"
                  >
                    <span>Generate AI Patch for this File</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
