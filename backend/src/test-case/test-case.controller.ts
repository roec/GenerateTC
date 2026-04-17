import { Controller, Get, Param } from '@nestjs/common';
import { WorkflowService } from '../workflow/workflow.service';

@Controller('test-cases')
export class TestCaseController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Get(':workflowId')
  list(@Param('workflowId') workflowId: string) {
    return this.workflowService.get(workflowId).testCases;
  }
}
