export interface NoteFolderPort {
  nullifyFolderIds(folderIds: number[]): Promise<void>;
}

export const NOTE_FOLDER_PORT = Symbol('NOTE_FOLDER_PORT');
