import { FolderDto, FolderTreeNode } from '../../../../../api/dtos/folder.dtos';

export const collectSubtreeIds = (rootId: number, folders: FolderDto[]): Set<number> => {
  const byParent = new Map<number | null, number[]>();
  folders.forEach(f => {
    const p = f.parentId ?? null;
    if (!byParent.has(p)) byParent.set(p, []);
    byParent.get(p)!.push(f.id);
  });
  const out = new Set<number>();
  const q = [rootId];
  while (q.length) {
    const id = q.pop()!;
    out.add(id);
    (byParent.get(id) ?? []).forEach(c => q.push(c));
  }
  return out;
};

export const visibleFolderIdsInOrder = (
  nodes: FolderTreeNode[],
  expanded: Set<number>
): number[] => {
  const out: number[] = [];
  const walk = (list: FolderTreeNode[]) => {
    for (const n of list) {
      out.push(n.id);
      if (expanded.has(n.id)) walk(n.children);
    }
  };
  walk(nodes);
  return out;
};

