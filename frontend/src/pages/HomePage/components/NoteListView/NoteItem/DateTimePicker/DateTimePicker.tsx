import React, { useState } from 'react';
import { BottomSheet } from '../../../../../../components/BottomSheet/BottomSheet';
import styles from './DateTimePicker.module.css';

type DateTimePickerProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
  initialDate: Date;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialDate
}) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSelect(selectedDate);
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <h3 className={styles.title}>Schedule Note</h3>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="datetime-local"
            value={selectedDate.toISOString().slice(0, 16)}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className={styles.input}
          />
          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.button}
              data-variant="secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.button}
              data-variant="primary"
            >
              Set Schedule
            </button>
          </div>
        </form>
      </div>
    </BottomSheet>
  );
}; 