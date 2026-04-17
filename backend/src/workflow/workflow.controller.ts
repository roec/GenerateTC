import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { IsIn, IsString, MinLength } from 'class-validator';
import { WorkflowService } from './workflow.service';

class CreateWorkflowDto {
  @IsString()
  @MinLength(5)
  prompt!: string;

  @IsIn(['standard', 'strict', 'risk-focused'])
  mode!: 'standard' | 'strict' | 'risk-focused';
}

@Controller('workflows')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Post(':projectId')
  create(@Param('projectId') projectId: string, @Body() body: CreateWorkflowDto) {
    return this.workflowService.start(projectId, body);
  }

  @Get()
  list() {
    return this.workflowService.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.workflowService.get(id);
  }
}
