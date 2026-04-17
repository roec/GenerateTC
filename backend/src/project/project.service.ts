import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

export interface Project {
  id: string;
  name: string;
  createdAt: string;
}

@Injectable()
export class ProjectService {
  private readonly projects: Project[] = [
    { id: 'demo-project', name: 'Loyalty Card Modernization', createdAt: new Date().toISOString() },
  ];

  list() {
    return this.projects;
  }

  create(name: string) {
    const project: Project = { id: uuid(), name, createdAt: new Date().toISOString() };
    this.projects.push(project);
    return project;
  }
}
