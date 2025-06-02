import api from "../../../api/axios.interceptor";
import { Note } from "./responses";

export const fetchNoteById = async (id: number): Promise<Note> => {
    const response = await api.get<Note>(`/notes/detail/${id}`);
    return response.data ?? {    
        id: 0,
        name: '',
        description: '',
        userId: '',
        isMemo: false,
        createdAt: '',
        updatedAt: '',
        archivedDate: null,
    };
};