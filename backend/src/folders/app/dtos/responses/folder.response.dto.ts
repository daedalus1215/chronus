import { Folder } from 'src/folders/domain/entities/folder.entity';

export class FolderResponseDto {
  id: number;
  name: string;
  parentId: number | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(folder: Folder) {
    this.id = folder.id;
    this.name = folder.name;
    this.parentId = folder.parentId;
    this.sortOrder = folder.sortOrder;
    this.createdAt = folder.createdAt;
    this.updatedAt = folder.updatedAt;
  }
}
