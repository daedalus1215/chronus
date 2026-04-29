import React from 'react';
import { Collapse } from '@mui/material';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { FolderTreeNode, ExplorerNoteItem } from '../../../../../api/dtos/folder.dtos';
import { DragMode } from '../ExplorerTree';
import { DropIntent } from '../useDragOperations';
import { FolderRow } from './FolderRow';
import { NoteRow } from '../NoteRow';

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
  onFolderMenu: (anchor: HTMLElement, id: number) => void;
  onFolderRowClick: (e: React.MouseEvent, folderId: number) => void;
  onChevronClick: (id: number) => void;
  onNoteOpen: (id: number) => void;
  onNoteMenu: (anchor: HTMLElement, id: number) => void;
  onNewSubfolder: (parentId: number) => void;
  selectedFolderIds: Set<number>;
  selectedNoteIds: Set<number>;
  onNoteRowClick: (e: React.MouseEvent, noteId: number, openNote: () => void) => void;
  pickItemsMode: boolean;
  dragMode: DragMode;
  dropIntent: DropIntent;
  toggleFolderInSelection: (id: number) => void;
  toggleNoteInSelection: (id: number) => void;
};

export const FolderSubtree: React.FC<FolderSubtreeProps> = React.memo(({
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
  onFolderMenu,
  onFolderRowClick,
  onChevronClick,
  onNoteOpen,
  onNoteMenu,
  onNewSubfolder,
  selectedFolderIds,
  selectedNoteIds,
  onNoteRowClick,
  pickItemsMode,
  dragMode,
  dropIntent,
  toggleFolderInSelection,
  toggleNoteInSelection,
}) => {
  const isOpen = expanded.has(node.id);
  const folderNotes = notes
    .filter(n => n.folderId === node.id)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const sortableItems = [
    ...node.children.map(c => `folder-${c.id}`),
    ...folderNotes.map(n => `note-${n.id}`),
  ];

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
          onFolderMenu={onFolderMenu}
          onFolderRowClick={onFolderRowClick}
          onChevronClick={onChevronClick}
          onNoteOpen={onNoteOpen}
          onNoteMenu={onNoteMenu}
          onNewSubfolder={onNewSubfolder}
          selectedFolderIds={selectedFolderIds}
          selectedNoteIds={selectedNoteIds}
          onNoteRowClick={onNoteRowClick}
          pickItemsMode={pickItemsMode}
          dragMode={dragMode}
          dropIntent={dropIntent}
          toggleFolderInSelection={toggleFolderInSelection}
          toggleNoteInSelection={toggleNoteInSelection}
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
          onMenuOpen={onNoteMenu}
          onTogglePick={() => toggleNoteInSelection(note.id)}
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
        onFolderMenu={onFolderMenu}
        onFolderRowClick={onFolderRowClick}
        onChevronClick={onChevronClick}
        onNewSubfolder={onNewSubfolder}
        onTogglePick={toggleFolderInSelection}
      />

      <Collapse in={isOpen} timeout={150} unmountOnExit>
        {dragMode === 'on' ? (
          <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
            {children}
          </SortableContext>
        ) : (
          children
        )}
      </Collapse>
    </>
  );
});
