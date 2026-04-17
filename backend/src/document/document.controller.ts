import { Body, Controller, Get, Param, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { DocumentService } from './document.service';

type DocumentType = 'functional' | 'technical' | 'api' | 'legacy';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post(':projectId')
  create(
    @Param('projectId') projectId: string,
    @Body() body: { type: DocumentType; filename: string; content: string },
  ) {
    return this.documentService.add({ ...body, projectId, id: uuid(), uploadedAt: new Date().toISOString() });
  }

  @Post(':projectId/upload')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage: memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 },
    }),
  )
  upload(
    @Param('projectId') projectId: string,
    @Body() body: { type: DocumentType },
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const type: DocumentType = body.type ?? 'legacy';

    return files.map((file) => {
      const utf8Content = file.buffer.toString('utf8');
      const hasReplacementChars = utf8Content.includes('\uFFFD');
      const content = hasReplacementChars
        ? `BASE64:${file.buffer.toString('base64')}`
        : utf8Content;

      return this.documentService.add({
        id: uuid(),
        projectId,
        type,
        filename: file.originalname,
        content,
        uploadedAt: new Date().toISOString(),
      });
    });
  }

  @Get(':projectId')
  list(@Param('projectId') projectId: string) {
    return this.documentService.list(projectId);
  }
}
