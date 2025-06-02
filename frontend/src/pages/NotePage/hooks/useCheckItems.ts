import { useState } from 'react';
import api from '../../../api/axios.interceptor';
import { CheckItem, Note } from '../api/responses';

type NoteContent = {
    title: string;
    checkItems: CheckItem[];
}

type UseCheckListProps = {
    note: Note,
    onSave: (note: Partial<Note>) => void;
}

type UseCheckListReturn = {
    noteState: Note;
    setNoteState: (note: NoteContent) => void;
    error: string | null;
    addItem: (name: string) => Promise<Note>;
    toggleItem: (id: number, note:Note) => Promise<Note>;
    deleteItem: (id: number) => Promise<Note>;
    updateItem: (id: number, name: string) => Promise<Note>;
}

export const useCheckItems = (note: Note): UseCheckListReturn => {
    const [noteState, setNoteState] = useState<Note>(note);

  const [error, setError] = useState<string | null>(null);

  const addItem = async (name: string) => {
    try {
      const response = await api.post<Note>(`/notes/${note.id}/check-items`, { name });
      setNoteState(response.data);
      return response.data;
    } catch (err) {
      console.error('Error adding check item:', err);
      throw err;
    }
  };

  const toggleItem = async (id: number, note: Note) => {
    if (!note.checkItems) {
      throw new Error('No check items found');
    }

    try {
      const response = await api.patch(`/notes/check-items/${id}/toggle`);
      setNoteState({...note, checkItems: note.checkItems.map(item => item.id === id ? response.data : item)});
      return response.data;
    } catch (err) {
      console.error('Error toggling check item:', err);
      throw err;
    }
  };

  const deleteItem = async (id: number) => {
    try {
      await api.delete(`/notes/check-items/${id}`);
      setNoteState(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting check item:', err);
      throw err;
    }
  };

  const updateItem = async (id: number, name: string) => {
    try {
      const response = await api.patch(`/notes/check-items/${id}`, { name });
      setNoteState(prev => 
        prev.map(item => item.id === id ? response.data : item)
      );
      return response.data;
    } catch (err) {
      console.error('Error updating check item:', err);
      throw err;
    }
  };

  return {
    noteState,
    setNoteState,
    error,
    addItem,
    toggleItem,
    deleteItem,
    updateItem,
  };
}; 