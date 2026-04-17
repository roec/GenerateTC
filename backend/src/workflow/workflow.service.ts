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
      job.testCases = this.normalizeTestCases(testCaseRaw, retrieved, job.prompt);
      job.postmanCollection = this.safeJson(postmanRaw, { info: { name: 'Generated Postman Collection' }, item: [] });
      job.coverage = coverageRaw;
      this.updateStage(job, 10, { status: 'completed', progress: 100, message: `Final output assembled with ${job.testCases.length} test case(s).`, endedAt: new Date().toISOString() });

      job.status = 'completed';
      job.progress = 100;
      job.logs.push(`Workflow completed successfully with ${job.testCases.length} test case(s).`);
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

  private normalizeTestCases(raw: string, retrieved: Array<{ title: string; text: string }>, prompt: string): GeneratedTestCase[] {
    try {
      const parsed = JSON.parse(raw) as unknown;
      const fromLlm = Array.isArray(parsed)
        ? (parsed as GeneratedTestCase[])
        : (parsed as { testCases?: GeneratedTestCase[] }).testCases ?? [];

      if (fromLlm.length > 0) {
        return fromLlm;
      }
    } catch {
      // Fall back to deterministic generation below.
    }

    return this.generateFallbackCases(retrieved, prompt);
  }

  private generateFallbackCases(retrieved: Array<{ title: string; text: string }>, prompt: string): GeneratedTestCase[] {
    const promptLower = prompt.toLowerCase();
    const baseCount = Math.max(1, Math.min(5, Math.ceil(retrieved.length / 2)));
    const multiplier = promptLower.includes('strict') || promptLower.includes('risk') ? 2 : 1;
    const desiredCount = Math.max(1, Math.min(8, baseCount * multiplier));

    const cases: GeneratedTestCase[] = [];
    for (let i = 0; i < desiredCount; i += 1) {
      const source = retrieved[i % Math.max(1, retrieved.length)] ?? { title: 'General Requirement', text: 'No source chunk available' };
      const id = `TC-AUTO-${String(i + 1).padStart(3, '0')}`;

      cases.push({
        testCaseId: id,
        scenario: `Generated scenario ${i + 1} based on ${source.title}`,
        preconditions: ['Relevant source documents are uploaded and parsed.', `Reference section: ${source.title}`],
        inputData: { prompt, sourceTitle: source.title, variation: i + 1 },
        testSteps: [
          `Review business rule from ${source.title}.`,
          'Execute API or workflow action with prepared input data.',
          'Validate response and downstream data persistence.',
        ],
        expectedResult: [
          'System processes the request according to business and technical rules.',
          'Output data and status align with the expected behavior.',
        ],
        postmanOperation: {
          method: 'POST',
          url: `/api/generated/${i + 1}`,
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer <token>' },
          body: { scenarioId: id, source: source.title },
          expectedResponse: { status: 'success' },
          executionSteps: ['Open Postman collection.', 'Execute request.', 'Verify HTTP status and payload fields.'],
        },
        sqlValidation: [
          {
            query: `SELECT * FROM GENERATED_AUDIT WHERE TEST_CASE_ID = '${id}';`,
            purpose: 'Validate audit or persistence record creation for the generated case.',
            expectedDbResult: 'At least one matching record exists and status is successful.',
          },
        ],
        traceability: {
          functionalDesign: [`${source.title} - Functional Trace`],
          technicalDesign: [`${source.title} - Technical Trace`],
          apiModules: ['Generated API Module'],
        },
        coverageTags: i % 2 === 0 ? ['positive', 'normal'] : ['negative', 'edge', 'risk'],
        status: 'generated',
      });
    }

    return cases;
  }
}
