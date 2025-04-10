import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NoteActionsGrid } from './NoteActionGrid/NoteActionGrid';
import { DateTimePicker } from './DateTimePicker/DateTimePicker';
import { TimeTrackingForm, TimeTrackingData } from './TimeTrackingForm/TimeTrackingForm';
import styles from './NoteItem.module.css';
import { useCreateTimeTrack } from '../../../hooks/useCreateTimeTrack/useCreateTimeTrack';

interface Note {
  id: number;
  name: string;
  userId: string;
  isMemo: boolean;
  scheduledFor?: string;
  createdAt?: string;
}

interface NoteItemProps {
  note: Note;
}

export const NoteItem: React.FC<NoteItemProps> = ({ note }) => {
  const navigate = useNavigate();
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTimeTrackingOpen, setIsTimeTrackingOpen] = useState(false);
  const { createTimeTrack, isCreating, error } = useCreateTimeTrack();

  const handleClick = () => {
    navigate(`/notes/${note.id}`);
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsActionsOpen(true);
  };

  const handleShare = () => {
    // Implement share functionality
    setIsActionsOpen(false);
  };

  const handleDuplicate = () => {
    // Implement duplicate functionality
    setIsActionsOpen(false);
  };

  const handleDelete = () => {
    // Implement delete functionality
    setIsActionsOpen(false);
  };

  const handleSchedule = () => {
    setIsActionsOpen(false);
    setIsDatePickerOpen(true);
  };

  const handleDateTimeSelected = async (dateTime: Date) => {
    try {
      // We'll implement this API call
      await updateNoteSchedule(note.id, dateTime);
      setIsDatePickerOpen(false);
      // Maybe show a success toast
    } catch (error) {
      console.error('Failed to schedule note:', error);
      // Show error toast
    }
  };

  const handleTimeTracking = () => {
    setIsActionsOpen(false); // Close the actions menu
    setIsTimeTrackingOpen(true); // Open the time tracking form
  };

  const handleTimeTrackingSubmit = async (data: TimeTrackingData) => {
    try {
      await createTimeTrack({
        date: data.date,
        startTime: data.startTime,
        durationMinutes: data.durationMinutes,
        noteId: note.id,
        note: data.note
      });

      setIsTimeTrackingOpen(false);
      // TODO: Add success toast
    } catch (error) {
      // Error handling is now done in the hook
      // TODO: Add error toast
    }
  };

  return (
    <>
      <div 
        className={`${styles.noteListItem} ${note.isMemo ? styles.memo : styles.note}`}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick();
          }
        }}
      >
        <div className={styles.noteInfo}>
          <span className={styles.noteName}>{note.name}</span>
          <span className={styles.noteType}>
            {note.isMemo ? 'Memo' : 'Note'}
          </span>
        </div>
        <button 
          className={styles.moreButton}
          onClick={handleMoreClick}
          aria-label="More options"
        >
          ⋮
        </button>
      </div>

      <NoteActionsGrid
        isOpen={isActionsOpen}
        onClose={() => setIsActionsOpen(false)}
        onShare={handleShare}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onTimeTracking={handleTimeTracking}
        //@TODO: Implement these later
        onPin={handleTimeTracking}
        onArchive={handleTimeTracking}
        onStar={handleTimeTracking}
        onExport={handleTimeTracking}
        onLock={handleTimeTracking}
        onEdit={handleTimeTracking}
        onLabel={handleTimeTracking}
      />

      <DateTimePicker
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onSelect={handleDateTimeSelected}
        initialDate={note.scheduledFor ? new Date(note.scheduledFor) : new Date()}
      />

      <TimeTrackingForm
        isOpen={isTimeTrackingOpen}
        onClose={() => setIsTimeTrackingOpen(false)}
        onSubmit={handleTimeTrackingSubmit}
        isSubmitting={isCreating}
      />
    </>
  );
}
function updateNoteSchedule(id: number, dateTime: Date) {
  console.log(id, dateTime);
  throw new Error('Function not implemented.');
}

