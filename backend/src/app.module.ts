import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { ProjectModule } from './project/project.module';
import { DocumentModule } from './document/document.module';
import { ParsingModule } from './parsing/parsing.module';
import { RagModule } from './rag/rag.module';
import { EmbeddingModule } from './embedding/embedding.module';
import { LlmModule } from './llm/llm.module';
import { AgentModule } from './agent/agent.module';
import { WorkflowModule } from './workflow/workflow.module';
import { TestCaseModule } from './test-case/test-case.module';
import { PostmanModule } from './postman/postman.module';
import { SqlValidationModule } from './sql-validation/sql-validation.module';
import { CoverageModule } from './coverage/coverage.module';
import { ExportModule } from './export/export.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    AuthModule,
    ProjectModule,
    DocumentModule,
    ParsingModule,
    RagModule,
    EmbeddingModule,
    LlmModule,
    AgentModule,
    WorkflowModule,
    TestCaseModule,
    PostmanModule,
    SqlValidationModule,
    CoverageModule,
    ExportModule,
    SettingsModule,
  ],
})
export class AppModule {}
