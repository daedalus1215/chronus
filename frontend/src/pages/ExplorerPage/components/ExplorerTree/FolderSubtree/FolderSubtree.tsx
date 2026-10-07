import React from 'react';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { FolderTreeNode } from '../../../../../api/dtos/folder.dtos';
import { DragMode } from '../ExplorerTree';
import { DropIntent } from '../useDragOperations';
import { FolderRow } from './FolderRow';
import { NoteRow } from '../NoteRow';
import { ExplorerNoteItem } from '@/api/dtos/note.dtos';

type FolderSubtreeProps = {
  node: FolderTreeNode;
  depth: number;
  notes: ExplorerNoteItem[];
  expanded: Set<number>;
  activeNoteId?: string;
  renaming: number | null;
  renameValue: string;
  renameRef: React.RefObject<HTMLInputElement>;
  onRenameChange: (v: string) => void;
  onRenameCommit: () => void;
  onRenameCancel: () => void;
  onRename: (id: number, currentName: string) => void;
  onFolderRowClick: (e: React.MouseEvent, folderId: number) => void;
  onChevronClick: (id: number) => void;
  onNoteOpen: (id: number) => void;
  onNoteOpenBoard: (id: number) => void;
  onNoteMoveToFolder: (id: number) => void;
  onNewSubfolder: (parentId: number) => void;
  onNewMemoInFolder: (id: number) => void;
  onFolderMoveToFolder: (id: number) => void;
  onDeleteFolder: (id: number) => void;
  selectedFolderIds: Set<number>;
  selectedNoteIds: Set<number>;
  onNoteRowClick: (
    e: React.MouseEvent,
    noteId: number,
    openNote: () => void
  ) => void;
  pickItemsMode: boolean;
  dragMode: DragMode;
  dropIntent: DropIntent;
  toggleFolderInSelection: (id: number) => void;
  toggleNoteInSelection: (id: number) => void;
  // Filter state
  folderMatches: Set<number>;
  noteMatches: Set<number>;
  filterActive: boolean;
};

export const FolderSubtree: React.FC<FolderSubtreeProps> = React.memo(
  ({
    node,
    depth,
    notes,
    expanded,
    activeNoteId,
    renaming,
    renameValue,
    renameRef,
    onRenameChange,
    onRenameCommit,
    onRenameCancel,
    onRename,
    onFolderRowClick,
    onChevronClick,
    onNoteOpen,
    onNoteOpenBoard,
    onNoteMoveToFolder,
    onNewSubfolder,
    onNewMemoInFolder,
    onFolderMoveToFolder,
    onDeleteFolder,
    selectedFolderIds,
    selectedNoteIds,
    onNoteRowClick,
    pickItemsMode,
    dragMode,
    dropIntent,
    toggleFolderInSelection,
    toggleNoteInSelection,
    // Filter
    folderMatches,
    noteMatches,
    filterActive,
  }) => {
    const isOpen = expanded.has(node.id);
    const folderNotes = notes
      .filter(n => n.folderId === node.id)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const sortableItems = [
      ...node.children.map(c => `folder-${c.id}`),
      ...folderNotes.map(n => `note-${n.id}`),
    ];

    // A folder is dimmed only if filter is active AND the folder itself is NOT a match
    // (not directly matching and not containing a matching descendant)
    const folderDimmed = filterActive && !folderMatches.has(node.id);

    const children = (
      <>
        {node.children.map(child => (
          <FolderSubtree
            key={child.id}
            node={child}
            depth={depth + 1}
            notes={notes}
            expanded={expanded}
            activeNoteId={activeNoteId}
            renaming={renaming}
            renameValue={renameValue}
            renameRef={renameRef}
            onRenameChange={onRenameChange}
            onRenameCommit={onRenameCommit}
            onRenameCancel={onRenameCancel}
            onRename={onRename}
            onFolderRowClick={onFolderRowClick}
            onChevronClick={onChevronClick}
            onNoteOpen={onNoteOpen}
            onNoteOpenBoard={onNoteOpenBoard}
            onNoteMoveToFolder={onNoteMoveToFolder}
            onNewSubfolder={onNewSubfolder}
            onNewMemoInFolder={onNewMemoInFolder}
            onFolderMoveToFolder={onFolderMoveToFolder}
            onDeleteFolder={onDeleteFolder}
            selectedFolderIds={selectedFolderIds}
            selectedNoteIds={selectedNoteIds}
            onNoteRowClick={onNoteRowClick}
            pickItemsMode={pickItemsMode}
            dragMode={dragMode}
            dropIntent={dropIntent}
            toggleFolderInSelection={toggleFolderInSelection}
            toggleNoteInSelection={toggleNoteInSelection}
            folderMatches={folderMatches}
            noteMatches={noteMatches}
            filterActive={filterActive}
          />
        ))}
        {folderNotes.map(note => (
          <NoteRow
            key={note.id}
            note={note}
            depth={depth + 1}
            active={activeNoteId === String(note.id)}
            selected={selectedNoteIds.has(note.id)}
            pickItemsMode={pickItemsMode}
            dragMode={dragMode}
            onOpen={onNoteOpen}
            onRowClick={onNoteRowClick}
            onOpenBoard={onNoteOpenBoard}
            onMoveToFolder={onNoteMoveToFolder}
            onTogglePick={() => toggleNoteInSelection(note.id)}
            isMatch={noteMatches.has(note.id)}
            filterActive={filterActive}
          />
        ))}
      </>
    );

    return (
      <>
        <FolderRow
          node={node}
          depth={depth}
          expanded={expanded}
          renaming={renaming}
          renameValue={renameValue}
          renameRef={renameRef}
          selected={selectedFolderIds.has(node.id)}
          pickItemsMode={pickItemsMode}
          dragMode={dragMode}
          dropIntent={dropIntent}
          onRenameChange={onRenameChange}
          onRenameCommit={onRenameCommit}
          onRenameCancel={onRenameCancel}
          onRename={onRename}
          onFolderRowClick={onFolderRowClick}
          onChevronClick={onChevronClick}
          onNewSubfolder={onNewSubfolder}
          onNewMemoInFolder={onNewMemoInFolder}
          onMoveToFolder={onFolderMoveToFolder}
          onDelete={onDeleteFolder}
          onTogglePick={toggleFolderInSelection}
          dimmed={folderDimmed}
        />

        {/* No expand/collapse animation (dropped MUI Collapse) — consistent
            with FolderTree.tsx and TagTreeNavigation, which plainly
            conditionally render their children too. */}
        {isOpen &&
          (dragMode === 'on' ? (
            <SortableContext
              items={sortableItems}
              strategy={verticalListSortingStrategy}
            >
              {children}
            </SortableContext>
          ) : (
            children
          ))}
      </>
    );
  }
);
