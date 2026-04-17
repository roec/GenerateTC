import { Injectable } from '@nestjs/common';
import { LlmFactory } from '../llm/llm.factory';

@Injectable()
export class AgentService {
  constructor(private readonly llmFactory: LlmFactory) {}

  private async runAgent(agentName: string, objective: string, context: string, responseFormat: 'text' | 'json' = 'json') {
    const provider = this.llmFactory.getProvider();
    const systemPrompt = `You are the ${agentName} in an enterprise Test Case Agentic AI Platform. Output only English.`;

    return provider.generate({
      systemPrompt,
      userPrompt: objective,
      context,
      responseFormat,
      temperature: 0.2,
    });
  }

  runRagRetrievalAgent(userPrompt: string, context: string) {
    return this.runAgent(
      'RAG Retrieval Agent',
      `Refine the most relevant document chunks for: ${userPrompt}. Return JSON with rationale and selectedChunks.`,
      context,
    );
  }

  runRequirementAnalysisAgent(userPrompt: string, context: string) {
    return this.runAgent(
      'Requirement Analysis Agent',
      `Analyze functional requirements for test design. Request: ${userPrompt}. Return businessRules, functionalScenarios, requirementSummary.`,
      context,
    );
  }

  runTechnicalAnalysisAgent(userPrompt: string, context: string) {
    return this.runAgent(
      'Technical Analysis Agent',
      `Analyze technical design, API and legacy constraints for: ${userPrompt}. Return technicalLogic, apiEndpoints, dbValidationOpportunities, moduleMapping.`,
      context,
    );
  }

  runScenarioDesignAgent(context: string) {
    return this.runAgent(
      'Scenario Design Agent',
      'Create scenario matrix with positive, negative, edge, exception and risk scenarios in JSON.',
      context,
    );
  }

  runTestCaseGeneratorAgent(context: string) {
    return this.runAgent(
      'Test Case Generator Agent',
      'Generate structured enterprise test cases in JSON array with IDs and traceability.',
      context,
    );
  }

  runPostmanGeneratorAgent(context: string) {
    return this.runAgent(
      'Postman Generator Agent',
      'Generate Postman operation details per test case. Return JSON.',
      context,
    );
  }

  runSqlValidationAgent(context: string) {
    return this.runAgent(
      'SQL Validation Generator Agent',
      'Generate DB2 for i SQL validations per test case with purpose and expected result. Return JSON.',
      context,
    );
  }

  runReviewCoverageAgent(context: string) {
    return this.runAgent(
      'Review and Coverage Agent',
      'Review outputs for consistency and produce coverage summary with risk notes and gaps.',
      context,
      'text',
    );
  }
}
