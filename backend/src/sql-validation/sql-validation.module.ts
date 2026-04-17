import { Module } from '@nestjs/common';
import { WorkflowModule } from '../workflow/workflow.module';
import { SqlValidationController } from './sql-validation.controller';

@Module({ imports: [WorkflowModule], controllers: [SqlValidationController] })
export class SqlValidationModule {}
