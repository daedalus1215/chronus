export type FolderDto = {
  id: number;
  name: string;
  parentId: number | null;
  sortOrder: number;
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
      (parent ?? { children: roots }).children.push(node);
    }
  });

  const sortByOrder = (nodes: FolderTreeNode[]) => {
    nodes.sort((a, b) => a.sortOrder - b.sortOrder);
    nodes.forEach(n => sortByOrder(n.children));
  };
  sortByOrder(roots);
  return roots;
}
