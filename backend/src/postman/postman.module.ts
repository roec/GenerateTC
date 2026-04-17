import { Module } from '@nestjs/common';
import { WorkflowModule } from '../workflow/workflow.module';
import { PostmanController } from './postman.controller';

@Module({ imports: [WorkflowModule], controllers: [PostmanController] })
export class PostmanModule {}
