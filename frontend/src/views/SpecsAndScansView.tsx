import React, { useState } from 'react';
import {
  FileCode2,
  Play,
  AlertTriangle,
  Clock,
  ArrowRight,
  Plus,
  Layers,
  X
} from 'lucide-react';
import { ApiSpecification, Repository, ScanDetail } from '../types';
import { api } from '../services/api';

interface SpecsAndScansViewProps {
  specifications: ApiSpecification[];
  repositories: Repository[];
  scans: ScanDetail[];
  onScanCreated: (newScan: ScanDetail) => void;
  onRefresh: () => void;
  onInspectScan: (scanId: number) => void;
}

export const SpecsAndScansView: React.FC<SpecsAndScansViewProps> = ({
  specifications,
  repositories,
  scans,
  onScanCreated,
  onRefresh,
  onInspectScan,
}) => {
  const [prevSpecId, setPrevSpecId] = useState<number | ''>('');
  const [currSpecId, setCurrSpecId] = useState<number | ''>('');
  const [repoId, setRepoId] = useState<number | ''>('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // Upload/Fetch Spec Form
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [specName, setSpecName] = useState('');
  const [specVersion, setSpecVersion] = useState('');
  const [specContent, setSpecContent] = useState('');
  const [specUrl, setSpecUrl] = useState('');
  const [activeUploadTab, setActiveUploadTab] = useState<'paste' | 'url'>('paste');
  const [isSubmittingSpec, setIsSubmittingSpec] = useState(false);

  const handleRunScan = async () => {
    if (!prevSpecId || !currSpecId) {
      setScanError('Please select both a previous and a current OpenAPI specification.');
      return;
    }
    setScanError(null);
    setIsScanning(true);
    try {
      const res = await api.triggerScan({
        previous_spec_id: Number(prevSpecId),
        current_spec_id: Number(currSpecId),
        repository_id: repoId ? Number(repoId) : undefined,
      });
      onScanCreated(res);
      onInspectScan(res.id);
    } catch (err: any) {
      setScanError(err.message || 'Scan failed.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveSpec = async () => {
    setIsSubmittingSpec(true);
    try {
      if (activeUploadTab === 'paste') {
        await api.createSpecification({
          name: specName || 'Custom API',
          version: specVersion || '1.0.0',
          content: specContent,
          format: specContent.trim().startsWith('{') ? 'json' : 'yaml',
          source_type: 'upload',
        });
      } else {
        await api.fetchSpecFromUrl(specUrl, specName || undefined);
      }
      setShowUploadModal(false);
      setSpecName('');
      setSpecVersion('');
      setSpecContent('');
      setSpecUrl('');
      onRefresh();
    } catch (err: any) {
      alert(`Failed to save specification: ${err.message}`);
    } finally {
      setIsSubmittingSpec(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
            <FileCode2 className="h-4 w-4 text-violet-400" />
            <span>OpenAPI Specifications &amp; Diff Engine</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Compare OpenAPI 3.0 / 3.1 contracts with deterministic breaking-change classification
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center space-x-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-violet-600/30 transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add OpenAPI Spec</span>
        </button>
      </div>

      {/* Comparison Launcher Box */}
      <div className="apv-panel p-4 space-y-3.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center space-x-1.5">
          <Play className="h-3 w-3 text-violet-400 fill-current" />
          <span>Launch Contract Diff Comparison</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          <div>
            <label className="block text-[11px] font-medium text-gray-400 mb-1">Base Specification (Previous)</label>
            <select
              value={prevSpecId}
              onChange={e => setPrevSpecId(e.target.value ? Number(e.target.value) : '')}
              className="w-full rounded-lg bg-[#15151D] border border-[#272832] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
            >
              <option value="">-- Select Base Spec --</option>
              {specifications.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} (v{s.version})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-400 mb-1">Target Specification (Current)</label>
            <select
              value={currSpecId}
              onChange={e => setCurrSpecId(e.target.value ? Number(e.target.value) : '')}
              className="w-full rounded-lg bg-[#15151D] border border-[#272832] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
            >
              <option value="">-- Select Target Spec --</option>
              {specifications.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} (v{s.version})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-400 mb-1">Target Client Repository</label>
            <select
              value={repoId}
              onChange={e => setRepoId(e.target.value ? Number(e.target.value) : '')}
              className="w-full rounded-lg bg-[#15151D] border border-[#272832] px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500"
            >
              <option value="">-- Optional: Link Repo --</option>
              {repositories.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {scanError && (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs text-rose-400">
            {scanError}
          </div>
        )}

        <div className="pt-1 flex justify-end">
          <button
            onClick={handleRunScan}
            disabled={isScanning}
            className="flex items-center space-x-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm shadow-violet-600/30 transition-all disabled:opacity-50"
          >
            <Play className={`h-3 w-3 ${isScanning ? 'animate-spin' : 'fill-current'}`} />
            <span>{isScanning ? 'Comparing Specifications...' : 'Run Specification Diff'}</span>
          </button>
        </div>
      </div>

      {/* Scans History Table */}
      <div className="apv-panel p-4 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-300">
          Evaluation &amp; Scan History
        </h2>

        {scans.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-500">
            No scans performed yet. Select specifications and click &quot;Run Specification Diff&quot;.
          </div>
        ) : (
          <div className="space-y-2">
            {scans.map(scan => (
              <div
                key={scan.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg bg-[#15151D] border border-[#272832] p-3 hover:border-[#363847] transition-colors gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-violet-400">Scan #{scan.id}</span>
                    <span className="rounded bg-[#101117] px-1.5 py-0.2 text-[10px] text-gray-400 font-mono border border-[#272832]">
                      Spec #{scan.previous_spec_id} → #{scan.current_spec_id}
                    </span>
                    <span className="rounded bg-emerald-500/10 px-1.5 py-0.2 text-[9px] font-semibold text-emerald-400">
                      {scan.status}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-[11px] text-gray-400">
                    <span className="flex items-center space-x-1 text-rose-400 font-medium">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{scan.breaking_changes} Breaking</span>
                    </span>
                    <span className="text-amber-400">{scan.warnings} Warnings</span>
                    <span className="text-gray-500 flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(scan.created_at).toLocaleTimeString()}</span>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onInspectScan(scan.id)}
                  className="flex items-center space-x-1.5 rounded-lg bg-[#101117] hover:bg-[#15151D] px-3 py-1.5 text-xs text-gray-200 border border-[#272832] transition-colors self-start sm:self-auto"
                >
                  <span>Inspect Changes</span>
                  <ArrowRight className="h-3 w-3 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for adding spec */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="apv-panel w-full max-w-lg p-5 border border-[#363847] bg-[#101117] space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#272832] pb-3">
              <h3 className="text-sm font-bold text-white">Add OpenAPI Specification</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex border-b border-[#272832]">
              <button
                onClick={() => setActiveUploadTab('paste')}
                className={`py-1.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
                  activeUploadTab === 'paste'
                    ? 'border-violet-500 text-violet-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                Paste JSON / YAML
              </button>
              <button
                onClick={() => setActiveUploadTab('url')}
                className={`py-1.5 px-3 text-xs font-semibold border-b-2 transition-colors ${
                  activeUploadTab === 'url'
                    ? 'border-violet-500 text-violet-400'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                Fetch from URL
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1">API Name</label>
                <input
                  type="text"
                  placeholder="e.g. Store Checkout API"
                  value={specName}
                  onChange={e => setSpecName(e.target.value)}
                  className="w-full rounded-lg bg-[#15151D] border border-[#272832] px-3 py-1.5 text-xs text-white"
                />
              </div>

              {activeUploadTab === 'paste' ? (
                <>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-400 mb-1">Version</label>
                    <input
                      type="text"
                      placeholder="e.g. 2.0.0"
                      value={specVersion}
                      onChange={e => setSpecVersion(e.target.value)}
                      className="w-full rounded-lg bg-[#15151D] border border-[#272832] px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-gray-400 mb-1">OpenAPI Content</label>
                    <textarea
                      rows={6}
                      placeholder="Paste OpenAPI 3.0/3.1 JSON or YAML here..."
                      value={specContent}
                      onChange={e => setSpecContent(e.target.value)}
                      className="w-full rounded-lg bg-[#15151D] border border-[#272832] p-3 text-xs font-mono text-gray-200 leading-relaxed"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1">Remote OpenAPI Spec URL</label>
                  <input
                    type="url"
                    placeholder="https://api.example.com/openapi.json"
                    value={specUrl}
                    onChange={e => setSpecUrl(e.target.value)}
                    className="w-full rounded-lg bg-[#15151D] border border-[#272832] px-3 py-1.5 text-xs text-white"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-[#272832]">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-3 py-1.5 text-xs rounded-lg text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSpec}
                disabled={isSubmittingSpec}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-violet-600 hover:bg-violet-500 text-white shadow-sm disabled:opacity-50"
              >
                {isSubmittingSpec ? 'Saving...' : 'Save Specification'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
