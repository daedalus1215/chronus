import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NoteActions } from './NoteActionGrid/NoteActionGrid';
import { DateTimePicker } from './DateTimePicker/DateTimePicker';
import { TimeTrackingForm, TimeTrackingData } from './TimeTrackingForm/TimeTrackingForm';
import styles from './NoteItem.module.css';

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
      // TODO: Implement API call to save time tracking data
      console.log('Time tracking data:', data);
      setIsTimeTrackingOpen(false);
      // Show success message
    } catch (error) {
      console.error('Failed to save time tracking:', error);
      // Show error message
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

      <NoteActions
        isOpen={isActionsOpen}
        onClose={() => setIsActionsOpen(false)}
        onShare={handleShare}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        onTimeTracking={handleTimeTracking}
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
      />
    </>
  );
}
