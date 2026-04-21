export type FolderDto = {
  id: number;
  name: string;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type FolderTreeNode = FolderDto & {
  children: FolderTreeNode[];
};

export function buildFolderTree(folders: FolderDto[]): FolderTreeNode[] {
  const map = new Map<number, FolderTreeNode>();
  const roots: FolderTreeNode[] = [];

  folders.forEach(f => map.set(f.id, { ...f, children: [] }));

  folders.forEach(f => {
    const node = map.get(f.id)!;
    if (f.parentId === null) {
      roots.push(node);
    } else {
      const parent = map.get(f.parentId);
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }
  });

  return roots;
}
