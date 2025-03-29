import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

type Note = {
  id: number;
  name: string;
  userId: string;
  isMemo: boolean;
}

export const useCreateNote = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createNote = async (type: 'memo' | 'checklist') => {
    try {
      setIsCreating(true);
      setError(null);
      
      const token = localStorage.getItem('jwt_token');
      console.log('Token from localStorage:', token);
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post<Note>(
        'http://localhost:3000/notes',
        {
          name: 'Untitled Note',
          isMemo: type === 'memo'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ).catch(error => {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Response error:', {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers
          });
        } else if (error.request) {
          // The request was made but no response was received
          console.error('Request error:', error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error:', error.message);
        }
        throw error;
      });

      // Navigate to the new note
      navigate(`/notes/${response.data.id}`);
    } catch (err) {
      console.error('Error creating note:', err);
      setError('Failed to create note');
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  return { createNote, isCreating, error };
}; 