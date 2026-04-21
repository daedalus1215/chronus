import { Folder } from 'src/folders/domain/entities/folder.entity';

export class FolderResponseDto {
  id: number;
  name: string;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;

  constructor(folder: Folder) {
    this.id = folder.id;
    this.name = folder.name;
    this.parentId = folder.parentId;
    this.createdAt = folder.createdAt;
    this.updatedAt = folder.updatedAt;
  }
}
