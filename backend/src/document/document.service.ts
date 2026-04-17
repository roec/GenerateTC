import { Injectable } from '@nestjs/common';

export interface UploadedDocument {
  id: string;
  projectId: string;
  type: 'functional' | 'technical' | 'api' | 'legacy';
  filename: string;
  content: string;
  uploadedAt: string;
}

@Injectable()
export class DocumentService {
  private readonly docs: UploadedDocument[] = [];

  add(doc: UploadedDocument) {
    this.docs.push(doc);
    return doc;
  }

  list(projectId: string) {
    return this.docs.filter((doc) => doc.projectId === projectId);
  }
}
