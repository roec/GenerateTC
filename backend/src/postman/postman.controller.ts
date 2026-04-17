import { Controller, Get, Param } from '@nestjs/common';
import { WorkflowService } from '../workflow/workflow.service';

@Controller('postman')
export class PostmanController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Get(':workflowId')
  get(@Param('workflowId') workflowId: string) {
    return this.workflowService.get(workflowId).postmanCollection;
  }
}
