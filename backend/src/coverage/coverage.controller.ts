import { Controller, Get, Param } from '@nestjs/common';
import { WorkflowService } from '../workflow/workflow.service';

@Controller('coverage')
export class CoverageController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Get(':workflowId')
  get(@Param('workflowId') workflowId: string) {
    return { summary: this.workflowService.get(workflowId).coverage };
  }
}
