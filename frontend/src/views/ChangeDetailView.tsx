import React, { useState } from 'react';
import {
  AlertTriangle,
  Layers,
  FileCheck2,
  Filter,
  ChevronRight,
  Code2,
  FileText
} from 'lucide-react';
import { DetectedChange, ScanDetail } from '../types';

interface ChangeDetailViewProps {
  scans: ScanDetail[];
  selectedScanId: number | null;
  onSelectScan: (id: number) => void;
  onAnalyzeImpact: (change: DetectedChange) => void;
  onGoToRepair: (change: DetectedChange) => void;
}

export const ChangeDetailView: React.FC<ChangeDetailViewProps> = ({
  scans,
  selectedScanId,
  onSelectScan,
  onAnalyzeImpact,
  onGoToRepair,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'BREAKING' | 'WARNING' | 'INFO'>('ALL');
  const [selectedChangeId, setSelectedChangeId] = useState<number | null>(null);

  const activeScan = scans.find(s => s.id === selectedScanId) || scans[0];
  const changes = activeScan?.detected_changes || [];

  const filteredChanges = changes.filter(c => {
    if (filterSeverity === 'ALL') return true;
    return c.severity === filterSeverity;
  });

  const selectedChange = changes.find(c => c.id === selectedChangeId) || filteredChanges[0];

  const parseEvidence = (evidenceStr: string) => {
    try {
      return JSON.parse(evidenceStr);
    } catch (_) {
      return {};
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-rose-400" />
            <span>Breaking Changes &amp; Evidence Inspector</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Deterministic rule-based change classification with exact JSON-pointer evidence
          </p>
        </div>

        {/* Scan Picker */}
        {scans.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-gray-500 font-medium">Scan:</span>
            <select
              value={activeScan?.id}
              onChange={e => onSelectScan(Number(e.target.value))}
              className="rounded-lg bg-[#15151D] border border-[#272832] px-2.5 py-1 text-xs text-white focus:outline-none"
            >
              {scans.map(s => (
                <option key={s.id} value={s.id}>
                  Scan #{s.id} ({s.breaking_changes} breaking)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2">
        <span className="text-[11px] text-gray-500 flex items-center space-x-1 mr-1">
          <Filter className="h-3 w-3" />
          <span>Severity:</span>
        </span>
        {(['ALL', 'BREAKING', 'WARNING', 'INFO'] as const).map(sev => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(sev)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              filterSeverity === sev
                ? 'bg-violet-600 text-white font-semibold'
                : 'bg-[#15151D] text-gray-400 hover:text-white border border-[#272832]'
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      {filteredChanges.length === 0 ? (
        <div className="apv-panel p-12 text-center text-xs text-gray-500">
          No detected changes matching filter in this scan.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Change List Table / Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-2.5">
            {filteredChanges.map(c => {
              const isSelected = selectedChange?.id === c.id;
              const isBreaking = c.severity === 'BREAKING';
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedChangeId(c.id)}
                  className={`apv-panel p-3.5 cursor-pointer transition-colors border ${
                    isSelected
                      ? 'border-violet-500 bg-[#15151D] border-l-2'
                      : 'border-[#272832] hover:border-[#363847]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`rounded px-1.5 py-0.2 text-[9px] font-bold border ${
                        isBreaking
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          : c.severity === 'WARNING'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                      }`}
                    >
                      {c.severity}
                    </span>
                    <span className="font-mono text-[10px] text-gray-500">{c.rule_code}</span>
                  </div>

                  <div className="flex items-center space-x-1.5 font-mono text-xs text-gray-200 font-bold truncate">
                    {c.http_method && (
                      <span className="rounded bg-[#101117] px-1 py-0.2 text-[9px] text-violet-400 font-bold border border-[#272832]">
                        {c.http_method}
                      </span>
                    )}
                    <span className="truncate">{c.path}</span>
                  </div>

                  <p className="text-[11px] text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="mt-2.5 flex items-center justify-between pt-1.5 border-t border-[#272832] text-[10px] text-gray-500 font-mono">
                    <span>Status: {c.status}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Evidence Details Panel (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {selectedChange ? (
              <div className="apv-panel p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#272832] pb-3 gap-2">
                  <div>
                    <span className="text-[9px] font-mono text-violet-400 uppercase font-bold tracking-wider">
                      Rule Code: {selectedChange.rule_code}
                    </span>
                    <h2 className="text-sm font-bold text-white mt-0.5">
                      {selectedChange.change_type}
                    </h2>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onAnalyzeImpact(selectedChange)}
                      className="flex items-center space-x-1 rounded-lg bg-violet-600 hover:bg-violet-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all"
                    >
                      <Layers className="h-3 w-3" />
                      <span>Map Code Impact</span>
                    </button>
                    {selectedChange.status !== 'detected' && (
                      <button
                        onClick={() => onGoToRepair(selectedChange)}
                        className="flex items-center space-x-1 rounded-lg bg-[#15151D] hover:bg-[#1A1A24] px-3 py-1.5 text-xs font-medium text-gray-200 border border-[#272832] transition-colors"
                      >
                        <FileCheck2 className="h-3 w-3 text-violet-400" />
                        <span>AI Studio</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Description</h3>
                    <p className="text-gray-300 mt-1 bg-[#15151D] p-3 rounded-lg border border-[#272832] leading-relaxed">
                      {selectedChange.description}
                    </p>
                  </div>

                  {(() => {
                    const ev = parseEvidence(selectedChange.evidence_json);
                    return (
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">JSON-Pointer Target Path</h3>
                          <div className="mt-1 rounded-lg bg-[#08090D] p-2.5 font-mono text-xs text-violet-300 border border-[#272832] select-all">
                            {ev.json_pointer || `/paths${selectedChange.path}`}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Rule Rationale &amp; Evidence</h3>
                          <p className="mt-1 text-gray-300 bg-[#15151D] p-3 rounded-lg border border-[#272832] leading-relaxed">
                            {ev.explanation || 'Detected via standard OpenAPI backward compatibility rules.'}
                          </p>
                        </div>

                        {selectedChange.old_value && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Base Specification</h3>
                              <pre className="mt-1 rounded-lg bg-[#08090D] p-2 text-xs font-mono text-gray-300 border border-[#272832] overflow-x-auto">
                                {selectedChange.old_value}
                              </pre>
                            </div>
                            <div>
                              <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Target Specification</h3>
                              <pre className="mt-1 rounded-lg bg-[#08090D] p-2 text-xs font-mono text-gray-300 border border-[#272832] overflow-x-auto">
                                {selectedChange.new_value || '(Removed)'}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
