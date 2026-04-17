import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { AgentService } from '../agent/agent.service';
import { DocumentService } from '../document/document.service';
import { ParsingService } from '../parsing/parsing.service';
import { RagService } from '../rag/rag.service';
import { GeneratedTestCase, WorkflowJob, WorkflowStage } from './workflow.types';

const STAGE_NAMES = [
  'Document Upload',
  'Document Parsing',
  'Knowledge Indexing',
  'Requirement Analysis',
  'Technical Analysis',
  'Scenario Design',
  'Test Case Generation',
  'Postman Generation',
  'SQL Validation Generation',
  'Review and Coverage Analysis',
  'Final Assembly',
];

@Injectable()
export class WorkflowService {
  private readonly jobs = new Map<string, WorkflowJob>();

  constructor(
    private readonly agentService: AgentService,
    private readonly documentService: DocumentService,
    private readonly parsingService: ParsingService,
    private readonly ragService: RagService,
  ) {}

  start(projectId: string, payload: { prompt: string; mode: 'standard' | 'strict' | 'risk-focused' }) {
    const now = new Date().toISOString();
    const stages: WorkflowStage[] = STAGE_NAMES.map((name) => ({
      name,
      status: 'pending',
      progress: 0,
      message: 'Pending',
    }));

    const job: WorkflowJob = {
      id: uuid(),
      projectId,
      prompt: payload.prompt,
      mode: payload.mode,
      status: 'running',
      progress: 0,
      stages,
      logs: ['Workflow initialized.'],
      testCases: [],
      postmanCollection: null,
      coverage: null,
      createdAt: now,
      updatedAt: now,
    };

    this.jobs.set(job.id, job);
    void this.execute(job.id);
    return job;
  }

  list() {
    return [...this.jobs.values()];
  }

  get(id: string) {
    const job = this.jobs.get(id);
    if (!job) throw new NotFoundException('Workflow job not found.');
    return job;
  }

  private updateStage(job: WorkflowJob, index: number, patch: Partial<WorkflowStage>) {
    job.stages[index] = { ...job.stages[index], ...patch };
    const completed = job.stages.filter((stage) => stage.status === 'completed').length;
    const inProgressShare = job.stages.reduce((acc, s) => acc + s.progress, 0) / (job.stages.length * 100);
    job.progress = Math.min(100, Math.round((completed / job.stages.length) * 80 + inProgressShare * 20));
    job.updatedAt = new Date().toISOString();
  }

  private async execute(jobId: string) {
    const job = this.get(jobId);
    const documents = this.documentService.list(job.projectId);

    try {
      this.updateStage(job, 0, { status: 'completed', progress: 100, message: `${documents.length} documents available.`, startedAt: new Date().toISOString(), endedAt: new Date().toISOString() });

      this.updateStage(job, 1, { status: 'running', progress: 20, message: 'Parsing uploaded documents...', startedAt: new Date().toISOString() });
      const parsed = documents.flatMap((doc) =>
        this.parsingService.parseToChunks(doc.content).map((chunk) => ({ ...chunk, type: doc.type, filename: doc.filename })),
      );
      this.updateStage(job, 1, { status: 'completed', progress: 100, message: `Parsed ${parsed.length} chunks.`, endedAt: new Date().toISOString() });

      this.updateStage(job, 2, { status: 'running', progress: 60, message: 'Indexing knowledge and preparing retrieval context...', startedAt: new Date().toISOString() });
      const retrieved = this.ragService.retrieveTopChunks(parsed, job.prompt, 8);
      const retrievalContext = JSON.stringify(retrieved, null, 2);
      await this.agentService.runRagRetrievalAgent(job.prompt, retrievalContext);
      this.updateStage(job, 2, { status: 'completed', progress: 100, message: 'Knowledge indexing complete.', endedAt: new Date().toISOString() });

      this.updateStage(job, 3, { status: 'running', progress: 50, message: 'Analyzing functional requirements...', startedAt: new Date().toISOString() });
      const requirementRaw = await this.agentService.runRequirementAnalysisAgent(job.prompt, retrievalContext);
      this.updateStage(job, 3, { status: 'completed', progress: 100, message: 'Requirement analysis completed.', endedAt: new Date().toISOString() });

      this.updateStage(job, 4, { status: 'running', progress: 50, message: 'Analyzing technical logic...', startedAt: new Date().toISOString() });
      const technicalRaw = await this.agentService.runTechnicalAnalysisAgent(job.prompt, retrievalContext);
      this.updateStage(job, 4, { status: 'completed', progress: 100, message: 'Technical analysis completed.', endedAt: new Date().toISOString() });

      this.updateStage(job, 5, { status: 'running', progress: 60, message: 'Designing scenario matrix...', startedAt: new Date().toISOString() });
      const scenarioRaw = await this.agentService.runScenarioDesignAgent(`${requirementRaw}\n${technicalRaw}`);
      this.updateStage(job, 5, { status: 'completed', progress: 100, message: 'Scenario design completed.', endedAt: new Date().toISOString() });

      this.updateStage(job, 6, { status: 'running', progress: 60, message: 'Generating test cases...', startedAt: new Date().toISOString() });
      const testCaseRaw = await this.agentService.runTestCaseGeneratorAgent(`${scenarioRaw}\n${requirementRaw}\n${technicalRaw}`);
      this.updateStage(job, 6, { status: 'completed', progress: 100, message: 'Test case generation completed.', endedAt: new Date().toISOString() });

      this.updateStage(job, 7, { status: 'running', progress: 70, message: 'Generating Postman operations...', startedAt: new Date().toISOString() });
      const postmanRaw = await this.agentService.runPostmanGeneratorAgent(testCaseRaw);
      this.updateStage(job, 7, { status: 'completed', progress: 100, message: 'Postman generation completed.', endedAt: new Date().toISOString() });

      this.updateStage(job, 8, { status: 'running', progress: 70, message: 'Generating AS400 DB2 SQL validations...', startedAt: new Date().toISOString() });
      const sqlRaw = await this.agentService.runSqlValidationAgent(`${testCaseRaw}\n${technicalRaw}`);
      this.updateStage(job, 8, { status: 'completed', progress: 100, message: 'SQL validation generation completed.', endedAt: new Date().toISOString() });

      this.updateStage(job, 9, { status: 'running', progress: 65, message: 'Reviewing coverage and consistency...', startedAt: new Date().toISOString() });
      const coverageRaw = await this.agentService.runReviewCoverageAgent(`${testCaseRaw}\n${postmanRaw}\n${sqlRaw}`);
      this.updateStage(job, 9, { status: 'completed', progress: 100, message: 'Coverage review completed.', endedAt: new Date().toISOString() });

      this.updateStage(job, 10, { status: 'running', progress: 80, message: 'Assembling final artifacts...', startedAt: new Date().toISOString() });
      job.testCases = this.safeTestCaseParse(testCaseRaw);
      job.postmanCollection = this.safeJson(postmanRaw, { info: { name: 'Generated Postman Collection' }, item: [] });
      job.coverage = coverageRaw;
      this.updateStage(job, 10, { status: 'completed', progress: 100, message: 'Final output assembled.', endedAt: new Date().toISOString() });

      job.status = 'completed';
      job.progress = 100;
      job.logs.push('Workflow completed successfully.');
    } catch (error) {
      job.status = 'failed';
      job.logs.push(`Workflow failed: ${(error as Error).message}`);
      const active = job.stages.find((stage) => stage.status === 'running');
      if (active) {
        active.status = 'failed';
        active.message = (error as Error).message;
        active.endedAt = new Date().toISOString();
      }
    }
  }

  private safeJson(raw: string, fallback: Record<string, unknown>) {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return fallback;
    }
  }

  private safeTestCaseParse(raw: string): GeneratedTestCase[] {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as GeneratedTestCase[];
      if (Array.isArray((parsed as { testCases?: unknown[] }).testCases)) return (parsed as { testCases: GeneratedTestCase[] }).testCases;
    } catch {
      return [
        {
          testCaseId: 'TC-SAMPLE-001',
          scenario: 'Fallback scenario created because LLM output was not valid JSON.',
          preconditions: ['Sample precondition'],
          inputData: { customerId: 'C12345' },
          testSteps: ['Execute API request'],
          expectedResult: ['Request should succeed'],
          postmanOperation: { method: 'POST', url: '/api/sample', headers: { 'Content-Type': 'application/json' }, body: { customerId: 'C12345' }, expectedResponse: { status: 'S' }, executionSteps: ['Run request'] },
          sqlValidation: [{ query: "SELECT * FROM SAMPLE WHERE CUSTOMER_ID='C12345'", purpose: 'Validate sample data', expectedDbResult: 'One record is present' }],
          traceability: { functionalDesign: ['FD Section Sample'], technicalDesign: ['TD Section Sample'], apiModules: ['Sample API'] },
          coverageTags: ['positive'],
          status: 'generated',
        },
      ];
    }
    return [];
  }
}
