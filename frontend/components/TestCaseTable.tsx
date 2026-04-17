'use client';

import { useMemo, useState } from 'react';
import { TestCaseRecord } from '@/types';

function summarize(lines: string[] | string, max = 80) {
  const value = Array.isArray(lines) ? lines.join(' | ') : lines;
  return value.length > max ? `${value.slice(0, max)}...` : value;
}

export function TestCaseTable({ rows }: { rows: TestCaseRecord[] }) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(
    () => rows.filter((row) => `${row.testCaseId} ${row.scenario}`.toLowerCase().includes(query.toLowerCase())),
    [rows, query],
  );

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">Generated Test Cases</h3>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by Test Case ID or Scenario"
          className="w-80 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="max-h-[500px] overflow-auto">
        <table className="w-full min-w-[1200px] table-auto border-collapse text-sm">
          <thead className="sticky top-0 bg-slate-100 text-left">
            <tr>
              {['Test Case ID', 'Scenario', 'Preconditions', 'Input Data', 'Test Steps', 'Expected Result', 'Postman', 'SQL Validation', 'Traceability', 'Coverage', 'Status'].map((h) => (
                <th key={h} className="border-b border-slate-300 p-2 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.testCaseId}>
                <td className="border-b p-2 font-medium">{row.testCaseId}</td>
                <td className="border-b p-2">{summarize(row.scenario)}</td>
                <td className="border-b p-2">{summarize(row.preconditions)}</td>
                <td className="border-b p-2">{summarize(JSON.stringify(row.inputData))}</td>
                <td className="border-b p-2">{summarize(row.testSteps)}</td>
                <td className="border-b p-2">{summarize(row.expectedResult)}</td>
                <td className="border-b p-2">{row.postmanOperation.method} {row.postmanOperation.url}</td>
                <td className="border-b p-2">{row.sqlValidation.length} checks</td>
                <td className="border-b p-2">FD: {row.traceability.functionalDesign.length} / TD: {row.traceability.technicalDesign.length}</td>
                <td className="border-b p-2">{row.coverageTags.join(', ')}</td>
                <td className="border-b p-2">
                  <button className="rounded-md bg-indigo-50 px-2 py-1 text-xs text-indigo-700" onClick={() => setExpanded(expanded === row.testCaseId ? null : row.testCaseId)}>
                    {expanded === row.testCaseId ? 'Hide Details' : 'View Details'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {expanded && (() => {
        const tc = filtered.find((row) => row.testCaseId === expanded);
        if (!tc) return null;
        return (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <h4 className="mb-2 font-semibold">{tc.testCaseId} Detailed View</h4>
            <p><strong>Scenario:</strong> {tc.scenario}</p>
            <p><strong>Preconditions:</strong> {tc.preconditions.join('; ')}</p>
            <p><strong>Input Data:</strong> {JSON.stringify(tc.inputData)}</p>
            <p><strong>Test Steps:</strong> {tc.testSteps.join(' | ')}</p>
            <p><strong>Expected Result:</strong> {tc.expectedResult.join(' | ')}</p>
            <p><strong>Postman Operation:</strong> {tc.postmanOperation.method} {tc.postmanOperation.url}</p>
            <p><strong>SQL Validation:</strong> {tc.sqlValidation.map((s) => s.query).join(' | ')}</p>
            <p><strong>Traceability:</strong> FD {tc.traceability.functionalDesign.join(', ')}; TD {tc.traceability.technicalDesign.join(', ')}</p>
          </div>
        );
      })()}
    </div>
  );
}
