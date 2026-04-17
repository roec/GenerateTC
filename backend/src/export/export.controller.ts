import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { WorkflowService } from '../workflow/workflow.service';

@Controller('export')
export class ExportController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Get(':workflowId/json')
  exportJson(@Param('workflowId') workflowId: string) {
    return this.workflowService.get(workflowId).testCases;
  }

  @Get(':workflowId/markdown')
  exportMarkdown(@Param('workflowId') workflowId: string, @Res() res: Response) {
    const cases = this.workflowService.get(workflowId).testCases;
    const markdown = cases
      .map(
        (tc) => `## ${tc.testCaseId}\n- Scenario: ${tc.scenario}\n- Preconditions: ${tc.preconditions.join('; ')}\n- Expected: ${tc.expectedResult.join('; ')}`,
      )
      .join('\n\n');
    res.setHeader('Content-Type', 'text/markdown');
    res.send(markdown);
  }

  @Get(':workflowId/excel')
  exportExcel(@Param('workflowId') workflowId: string, @Res() res: Response) {
    const rows = this.workflowService.get(workflowId).testCases;
    const header = 'Test Case ID,Scenario,Preconditions,Input Data,Test Steps,Expected Result,Coverage Tags';
    const body = rows
      .map((tc) =>
        [
          tc.testCaseId,
          tc.scenario,
          tc.preconditions.join(' | '),
          JSON.stringify(tc.inputData),
          tc.testSteps.join(' | '),
          tc.expectedResult.join(' | '),
          tc.coverageTags.join(' | '),
        ]
          .map((field) => `"${String(field).replaceAll('"', '""')}"`)
          .join(','),
      )
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="test-cases.csv"');
    res.send(`${header}\n${body}`);
  }

  @Get(':workflowId/postman')
  exportPostman(@Param('workflowId') workflowId: string) {
    return this.workflowService.get(workflowId).postmanCollection;
  }
}
