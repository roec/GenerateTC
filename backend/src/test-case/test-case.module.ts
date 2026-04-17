import { Module } from '@nestjs/common';
import { WorkflowModule } from '../workflow/workflow.module';
import { TestCaseController } from './test-case.controller';

@Module({ imports: [WorkflowModule], controllers: [TestCaseController] })
export class TestCaseModule {}
