import { Module } from '@nestjs/common';
import { WorkflowModule } from '../workflow/workflow.module';
import { CoverageController } from './coverage.controller';

@Module({ imports: [WorkflowModule], controllers: [CoverageController] })
export class CoverageModule {}
