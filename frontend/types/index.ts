export type StageStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface WorkflowStage {
  name: string;
  status: StageStatus;
  progress: number;
  message: string;
}

export interface TestCaseRecord {
  testCaseId: string;
  scenario: string;
  preconditions: string[];
  inputData: Record<string, unknown>;
  testSteps: string[];
  expectedResult: string[];
  postmanOperation: { method: string; url: string };
  sqlValidation: Array<{ query: string; purpose: string; expectedDbResult: string }>;
  traceability: { functionalDesign: string[]; technicalDesign: string[]; apiModules: string[] };
  coverageTags: string[];
  status: string;
}

export interface WorkflowJob {
  id: string;
  projectId: string;
  prompt: string;
  mode: 'standard' | 'strict' | 'risk-focused';
  status: StageStatus;
  progress: number;
  stages: WorkflowStage[];
  logs: string[];
  testCases: TestCaseRecord[];
  postmanCollection: Record<string, unknown> | null;
  coverage: string | null;
}
