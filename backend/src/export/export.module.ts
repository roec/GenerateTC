import { Module } from '@nestjs/common';
import { WorkflowModule } from '../workflow/workflow.module';
import { ExportController } from './export.controller';

@Module({ imports: [WorkflowModule], controllers: [ExportController] })
export class ExportModule {}
