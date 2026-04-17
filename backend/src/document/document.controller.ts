import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { DocumentService } from './document.service';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post(':projectId')
  create(
    @Param('projectId') projectId: string,
    @Body() body: { type: 'functional' | 'technical' | 'api' | 'legacy'; filename: string; content: string },
  ) {
    return this.documentService.add({ ...body, projectId, id: uuid(), uploadedAt: new Date().toISOString() });
  }

  @Get(':projectId')
  list(@Param('projectId') projectId: string) {
    return this.documentService.list(projectId);
  }
}
