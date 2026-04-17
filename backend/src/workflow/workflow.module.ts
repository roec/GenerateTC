import { Module } from '@nestjs/common';
import { AgentModule } from '../agent/agent.module';
import { DocumentModule } from '../document/document.module';
import { ParsingModule } from '../parsing/parsing.module';
import { RagModule } from '../rag/rag.module';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';

@Module({
  imports: [AgentModule, DocumentModule, ParsingModule, RagModule],
  providers: [WorkflowService],
  controllers: [WorkflowController],
  exports: [WorkflowService],
})
export class WorkflowModule {}
