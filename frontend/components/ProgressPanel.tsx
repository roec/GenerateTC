import { WorkflowStage } from '@/types';

export function ProgressPanel({ progress, stages }: { progress: number; stages: WorkflowStage[] }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-2 flex justify-between text-sm font-medium">
        <span>Overall Progress</span>
        <span>{progress}%</span>
      </div>
      <div className="mb-4 h-3 w-full rounded-full bg-slate-200">
        <div className="h-3 rounded-full bg-indigo-600" style={{ width: `${progress}%` }} />
      </div>
      <div className="grid gap-2">
        {stages.map((stage) => (
          <div key={stage.name} className="rounded-xl border border-slate-200 p-2 text-sm">
            <div className="flex justify-between">
              <span>{stage.name}</span>
              <span className="font-semibold capitalize">{stage.status}</span>
            </div>
            <p className="text-slate-500">{stage.message}</p>
            <div className="mt-1 h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${stage.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
