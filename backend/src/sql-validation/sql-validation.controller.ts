import { Controller, Get, Param } from '@nestjs/common';
import { WorkflowService } from '../workflow/workflow.service';

@Controller('sql-validation')
export class SqlValidationController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Get(':workflowId')
  get(@Param('workflowId') workflowId: string) {
    return this.workflowService
      .get(workflowId)
      .testCases.map((tc) => ({ testCaseId: tc.testCaseId, sqlValidation: tc.sqlValidation }));
  }
}
