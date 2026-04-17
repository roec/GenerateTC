'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost, apiPostForm } from '@/lib/api';
import { ProjectDocument, WorkflowJob } from '@/types';
import { ProgressPanel } from '@/components/ProgressPanel';
import { TestCaseTable } from '@/components/TestCaseTable';

const tabs = ['Test Cases', 'Postman', 'SQL Validation', 'Coverage', 'Agent Logs', 'Documents'] as const;

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('Test Cases');
  const [job, setJob] = useState<WorkflowJob | null>(null);
  const [projectId] = useState('demo-project');
  const [prompt, setPrompt] = useState('Generate S89 test cases in strict mode with Postman and AS400 DB validation');
  const [mode, setMode] = useState<'standard' | 'strict' | 'risk-focused'>('strict');
  const [provider, setProvider] = useState({ activeProvider: 'deepseek', activeModel: 'deepseek-chat' });
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [uploadMessage, setUploadMessage] = useState('No files uploaded yet.');
  const [isUploading, setIsUploading] = useState(false);
  const [lastUploadedByType, setLastUploadedByType] = useState<Record<'functional' | 'technical' | 'api' | 'legacy', string>>({
    functional: 'No file uploaded yet.',
    technical: 'No file uploaded yet.',
    api: 'No file uploaded yet.',
    legacy: 'No file uploaded yet.',
  });

  const loadDocuments = async () => {
    try {
      const result = await apiGet<ProjectDocument[]>(`/documents/${projectId}`);
      setDocuments(result);
      if (result.length > 0) {
        setUploadMessage(`Uploaded files: ${result.map((doc) => doc.filename).join(', ')}`);
      }
    } catch {
      setUploadMessage('Unable to load documents from the server.');
    }
  };

  useEffect(() => {
    apiGet<{ activeProvider: string; activeModel: string }>('/settings').then(setProvider).catch(() => undefined);
    void loadDocuments();
  }, []);

  useEffect(() => {
    if (!job || job.status !== 'running') return;
    const timer = setInterval(async () => {
      const latest = await apiGet<WorkflowJob>(`/workflows/${job.id}`);
      setJob(latest);
      if (latest.status !== 'running') clearInterval(timer);
    }, 1500);
    return () => clearInterval(timer);
  }, [job]);

  const uploadFiles = async (
    type: 'functional' | 'technical' | 'api' | 'legacy',
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles?.length) return;

    setIsUploading(true);
    setUploadMessage(`Uploading ${selectedFiles.length} file(s)...`);

    const formData = new FormData();
    formData.append('type', type);
    for (const file of Array.from(selectedFiles)) {
      formData.append('files', file);
    }

    try {
      const uploaded = await apiPostForm<ProjectDocument[]>(`/documents/${projectId}/upload`, formData);
      await loadDocuments();
      const uploadedNames = uploaded.map((doc) => doc.filename).join(', ');
      setUploadMessage(`Uploaded files: ${uploadedNames}`);
      setLastUploadedByType((prev) => ({ ...prev, [type]: uploadedNames }));
      window.alert(`Upload successful. Uploaded ${uploaded.length} file(s).`);
    } catch {
      setUploadMessage('Upload failed. Please verify backend availability and file size limits.');
      window.alert('Upload failed. Please check backend logs and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const startGeneration = async () => {
    if (documents.length === 0) {
      setUploadMessage('Please upload at least one document before generating test cases.');
      return;
    }

    const created = await apiPost<WorkflowJob>(`/workflows/${projectId}`, { prompt, mode });
    setJob(created);
  };

  const overall = job?.progress ?? 0;
  const stages = job?.stages ?? [];

  const tabBody = useMemo(() => {
    if (!job && activeTab !== 'Documents') return <div className="rounded-2xl bg-white p-6 shadow-sm">No generation run yet.</div>;

    switch (activeTab) {
      case 'Test Cases':
        return <TestCaseTable rows={job?.testCases ?? []} />;
      case 'Postman':
        return <pre className="rounded-2xl bg-white p-4 text-xs shadow-sm">{JSON.stringify(job?.postmanCollection ?? {}, null, 2)}</pre>;
      case 'SQL Validation':
        return (
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            {(job?.testCases ?? []).flatMap((tc) => tc.sqlValidation.map((sql) => (
              <div key={`${tc.testCaseId}-${sql.query}`} className="mb-3 rounded-lg border p-3">
                <p className="font-semibold">{tc.testCaseId}</p>
                <p><strong>Query:</strong> {sql.query}</p>
                <p><strong>Purpose:</strong> {sql.purpose}</p>
                <p><strong>Expected:</strong> {sql.expectedDbResult}</p>
              </div>
            )))}
          </div>
        );
      case 'Coverage':
        return <div className="rounded-2xl bg-white p-4 shadow-sm whitespace-pre-wrap">{job?.coverage ?? 'Coverage summary pending.'}</div>;
      case 'Agent Logs':
        return <div className="rounded-2xl bg-white p-4 shadow-sm">{(job?.logs ?? []).map((log) => <p key={log}>• {log}</p>)}</div>;
      case 'Documents':
        return (
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-lg font-semibold">Uploaded Documents</h3>
            <div className="space-y-2 text-sm">
              {documents.length === 0 ? (
                <p className="text-slate-500">No files uploaded yet.</p>
              ) : (
                documents.map((doc) => (
                  <div key={doc.id} className="rounded-lg border p-3">
                    <p className="font-medium">{doc.filename}</p>
                    <p className="text-slate-600">Type: {doc.type}</p>
                    <p className="text-slate-600">Uploaded: {new Date(doc.uploadedAt).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  }, [activeTab, documents, job]);

  return (
    <main className="min-h-screen p-6">
      <header className="mb-5 flex items-center justify-between rounded-2xl bg-white px-6 py-4 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold">Test Case Agentic AI Platform</h1>
          <p className="text-sm text-slate-500">Project: Loyalty Card Modernization</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="rounded-full bg-slate-100 px-3 py-1">Provider: {provider.activeProvider}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">Model: {provider.activeModel}</span>
          <a className="rounded-full bg-indigo-600 px-3 py-1 text-white" href={job ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/export/${job.id}/json` : '#'}>Export</a>
        </div>
      </header>

      <section className="grid grid-cols-12 gap-5">
        <aside className="col-span-4 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Generation Controls</h2>
          <label className="mb-2 block text-sm font-medium">Project Selector</label>
          <input value={projectId} readOnly className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />

          <p className="mb-1 text-sm font-medium">Document Upload</p>
          <div className="mb-2 grid gap-2 text-xs text-slate-600">
            <label className="rounded-lg border p-2">
              Upload Functional Design
              <input className="mt-1 block w-full" type="file" multiple onChange={(event) => void uploadFiles('functional', event)} />
              <span className="mt-1 block text-[11px]">Last uploaded: {lastUploadedByType.functional}</span>
            </label>
            <label className="rounded-lg border p-2">
              Upload Technical Design
              <input className="mt-1 block w-full" type="file" multiple onChange={(event) => void uploadFiles('technical', event)} />
              <span className="mt-1 block text-[11px]">Last uploaded: {lastUploadedByType.technical}</span>
            </label>
            <label className="rounded-lg border p-2">
              Upload API Spec
              <input className="mt-1 block w-full" type="file" multiple onChange={(event) => void uploadFiles('api', event)} />
              <span className="mt-1 block text-[11px]">Last uploaded: {lastUploadedByType.api}</span>
            </label>
            <label className="rounded-lg border p-2">
              Upload Optional Legacy Files
              <input className="mt-1 block w-full" type="file" multiple onChange={(event) => void uploadFiles('legacy', event)} />
              <span className="mt-1 block text-[11px]">Last uploaded: {lastUploadedByType.legacy}</span>
            </label>
          </div>
          <p className="mb-4 text-xs text-slate-600">{isUploading ? 'Uploading documents...' : uploadMessage}</p>

          <label className="mb-2 block text-sm font-medium">Prompt</label>
          <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} className="mb-3 h-28 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />

          <label className="mb-2 block text-sm font-medium">Generation Mode</label>
          <select value={mode} onChange={(event) => setMode(event.target.value as 'standard' | 'strict' | 'risk-focused')} className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="standard">Standard</option>
            <option value="strict">Strict</option>
            <option value="risk-focused">Risk-focused</option>
          </select>

          <div className="mb-4 space-y-1 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Include Postman steps</label>
            <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Include AS400 SQL validation</label>
            <label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> Include coverage analysis</label>
          </div>

          <button onClick={startGeneration} className="w-full rounded-xl bg-indigo-600 px-4 py-2 font-medium text-white">Generate</button>
        </aside>

        <div className="col-span-8 space-y-4">
          <ProgressPanel progress={overall} stages={stages} />

          <div className="rounded-2xl bg-white p-2 shadow-sm">
            <div className="flex gap-2 border-b p-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-3 py-2 text-sm ${activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-slate-100'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="p-2">{tabBody}</div>
          </div>
        </div>
      </section>
    </main>
  );
}
