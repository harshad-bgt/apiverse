import React, { useState } from 'react';
import {
  FolderGit2,
  GitBranch,
  RefreshCw,
  FileCode,
  Folder,
  Layers,
  ShieldCheck,
  Code2,
  Clock
} from 'lucide-react';
import { Repository } from '../types';
import { api } from '../services/api';

interface RepositoriesViewProps {
  repositories: Repository[];
  onRefresh: () => void;
}

export const RepositoriesView: React.FC<RepositoriesViewProps> = ({ repositories, onRefresh }) => {
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [tree, setTree] = useState<any[]>([]);
  const [loadingTree, setLoadingTree] = useState(false);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [isDiscovering, setIsDiscovering] = useState(false);

  const handleSelectRepo = async (repo: Repository) => {
    setSelectedRepo(repo);
    setActiveFile(null);
    setFileContent(null);
    setLoadingTree(true);
    try {
      const res = await api.getRepoTree(repo.id);
      setTree(res.tree);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTree(false);
    }
  };

  const handleViewFile = async (filePath: string) => {
    if (!selectedRepo) return;
    setActiveFile(filePath);
    setLoadingFile(true);
    try {
      const res = await api.getFileContent(selectedRepo.id, filePath);
      setFileContent(res.content);
    } catch (err) {
      console.error(err);
      setFileContent('Failed to load file content.');
    } finally {
      setLoadingFile(false);
    }
  };

  const handleDiscover = async () => {
    setIsDiscovering(true);
    try {
      await api.discoverDemoRepos();
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDiscovering(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
            <FolderGit2 className="h-4 w-4 text-violet-400" />
            <span>Target Client Repositories</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Indexed client repositories analyzed for API change impacts, patches, and automated tests
          </p>
        </div>

        <button
          onClick={handleDiscover}
          disabled={isDiscovering}
          className="flex items-center space-x-1.5 rounded-lg bg-[#15151D] hover:bg-[#1A1A24] px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white border border-[#272832] transition-colors"
        >
          <RefreshCw className={`h-3 w-3 ${isDiscovering ? 'animate-spin' : ''}`} />
          <span>Sync Repositories</span>
        </button>
      </div>

      {/* Security Boundary Notice */}
      <div className="apv-panel p-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5 text-xs">
          <ShieldCheck className="h-4 w-4 text-violet-400 shrink-0" />
          <span className="text-gray-300">
            <strong className="text-white font-medium">Repository Boundary Guard: </strong>
            All patches and file edits are strictly restricted to authorized repository roots.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Repo List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-1">
            Registered Repositories ({repositories.length})
          </h2>

          {repositories.length === 0 ? (
            <div className="apv-panel p-6 text-center text-xs text-gray-500">
              No repositories found. Click &quot;Sync Repositories&quot; above.
            </div>
          ) : (
            repositories.map(repo => {
              const isSelected = selectedRepo?.id === repo.id;
              return (
                <div
                  key={repo.id}
                  onClick={() => handleSelectRepo(repo)}
                  className={`apv-panel p-3.5 cursor-pointer transition-colors border ${
                    isSelected
                      ? 'border-violet-500 bg-[#15151D] border-l-2'
                      : 'border-[#272832] hover:border-[#363847]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{repo.name}</span>
                    <span className="rounded bg-[#15151D] px-1.5 py-0.2 text-[9px] font-mono text-gray-400 border border-[#272832]">
                      {repo.is_demo ? 'LOCAL DEMO' : 'GITHUB'}
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-500 font-mono mt-1 truncate">{repo.full_name}</p>

                  <div className="mt-2.5 flex items-center space-x-3 text-[10px] text-gray-400 font-mono">
                    <span className="flex items-center space-x-1">
                      <GitBranch className="h-3 w-3 text-gray-500" />
                      <span>{repo.default_branch}</span>
                    </span>
                    <span>•</span>
                    <span className="text-emerald-400">Indexed</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Tree & File Inspector (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedRepo ? (
            <div className="apv-panel p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-[#272832] pb-3">
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <Layers className="h-3.5 w-3.5 text-violet-400" />
                    <span>{selectedRepo.name} Source Explorer</span>
                  </h3>
                  <span className="text-[10px] text-gray-500 font-mono">Branch: {selectedRepo.default_branch}</span>
                </div>
              </div>

              {loadingTree ? (
                <div className="py-6 text-center text-xs text-gray-500">Indexing file tree...</div>
              ) : (
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                    Source Files:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {tree.map(item => (
                      <button
                        key={item.path}
                        onClick={() => item.type === 'file' && handleViewFile(item.path)}
                        className={`flex items-center space-x-1.5 rounded-md px-2 py-1 text-xs font-mono transition-colors ${
                          activeFile === item.path
                            ? 'bg-violet-600 text-white font-medium shadow-sm'
                            : 'bg-[#15151D] text-gray-300 hover:bg-[#1A1A24] border border-[#272832]'
                        }`}
                      >
                        {item.type === 'dir' ? (
                          <Folder className="h-3 w-3 text-amber-400" />
                        ) : (
                          <FileCode className="h-3 w-3 text-gray-400" />
                        )}
                        <span>{item.path}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeFile && (
                <div className="mt-3 rounded-lg bg-[#08090D] border border-[#272832] overflow-hidden">
                  <div className="flex items-center justify-between bg-[#15151D] px-3 py-1.5 border-b border-[#272832]">
                    <span className="font-mono text-xs text-gray-300 font-semibold">{activeFile}</span>
                    <span className="text-[10px] text-gray-500 font-mono">Read-Only</span>
                  </div>
                  {loadingFile ? (
                    <div className="p-6 text-center text-xs text-gray-500">Loading file content...</div>
                  ) : (
                    <pre className="p-3.5 text-xs font-mono text-gray-300 overflow-x-auto leading-relaxed max-h-80">
                      {fileContent}
                    </pre>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="apv-panel p-12 text-center text-xs text-gray-500">
              Select a repository from the left to inspect its file hierarchy and source code.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
