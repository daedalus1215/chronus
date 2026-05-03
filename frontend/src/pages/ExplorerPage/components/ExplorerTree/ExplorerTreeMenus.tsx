import React from 'react';
import { Menu, MenuItem } from '@mui/material';
import { FolderDto } from '../../../../api/dtos/folder.dtos';
import { useNavigate } from 'react-router-dom';

type ExplorerTreeMenusProps = {
  // Folder menu
  folderMenu: { anchor: HTMLElement; id: number } | null;
  setFolderMenu: (v: { anchor: HTMLElement; id: number } | null) => void;
  folders: FolderDto[];
  startRename: (id: number, currentName: string) => void;
  setReparentTarget: (v: { folderIds: number[]; noteIds: number[] } | null) => void;
  setNewFolderParentId: (v: number | null | undefined) => void;
  setDeleteConfirmId: (v: number | null) => void;
  onCreateMemoInFolder: (id: number) => void;

  // Note menu
  noteMenu: { anchor: HTMLElement; id: number } | null;
  setNoteMenu: (v: { anchor: HTMLElement; id: number } | null) => void;
}

export const ExplorerTreeMenus: React.FC<ExplorerTreeMenusProps> = ({
  folderMenu,
  setFolderMenu,
  folders,
  startRename,
  setReparentTarget,
  setNewFolderParentId,
  setDeleteConfirmId,
  onCreateMemoInFolder,
  noteMenu,
  setNoteMenu,
}) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Folder context menu */}
      <Menu
        anchorEl={folderMenu?.anchor}
        open={Boolean(folderMenu)}
        onClose={() => setFolderMenu(null)}
        slotProps={{ paper: { sx: { minWidth: 160 } } }}
      >
        <MenuItem
          dense
          onClick={() => {
            if (folderMenu) {
              setReparentTarget({ folderIds: [folderMenu.id], noteIds: [] });
            }
            setFolderMenu(null);
          }}
        >
          Move to folder…
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            const f = folders.find(x => x.id === folderMenu?.id);
            if (f) startRename(f.id, f.name);
          }}
        >
          Rename
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            if (folderMenu) {
              setNewFolderParentId(folderMenu.id);
            }
            setFolderMenu(null);
          }}
        >
          New subfolder
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            if (folderMenu) onCreateMemoInFolder(folderMenu.id);
            setFolderMenu(null);
          }}
        >
          New memo
        </MenuItem>
        <MenuItem
          dense
          sx={{ color: 'error.main' }}
          onClick={() => {
            if (folderMenu) setDeleteConfirmId(folderMenu.id);
            setFolderMenu(null);
          }}
        >
          Delete
        </MenuItem>
      </Menu>

      {/* Note context menu */}
      <Menu
        anchorEl={noteMenu?.anchor}
        open={Boolean(noteMenu)}
        onClose={() => setNoteMenu(null)}
        slotProps={{ paper: { sx: { minWidth: 140 } } }}
      >
        <MenuItem
          dense
          onClick={() => {
            if (noteMenu) navigate(`notes/${noteMenu.id}`);
            setNoteMenu(null);
          }}
        >
          Open
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            if (noteMenu) setReparentTarget({ folderIds: [], noteIds: [noteMenu.id] });
            setNoteMenu(null);
          }}
        >
          Move to folder…
        </MenuItem>
      </Menu>
    </>
  );
};
