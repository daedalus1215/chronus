import React, { useState } from 'react';
import { BottomSheet } from '../../../../../../components/BottomSheet/BottomSheet';
import styles from './TimeTrackingForm.module.css';

type TimeTrackingFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TimeTrackingData) => void;
  initialData?: TimeTrackingData;
  isSubmitting?: boolean;
  hasPendingTracks: boolean;
}

export type TimeTrackingData = {
  date: string;
  startTime: string;
  durationMinutes: number;
  note?: string;
}

export const TimeTrackingForm: React.FC<TimeTrackingFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
  hasPendingTracks
}) => {
  const [formData, setFormData] = useState<TimeTrackingData>(initialData || {
    date: new Date().toISOString().split('T')[0],
    startTime: new Date().toTimeString().slice(0, 5),
    durationMinutes: 30,
    note: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <h3 className={styles.title}>Track Time</h3>
        {hasPendingTracks && (
          <div className={styles.offlineNotice}>
            You have time tracks pending sync. They will be uploaded when you're back online.
          </div>
        )}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="date" className={styles.label}>Date</label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="startTime" className={styles.label}>Start Time</label>
            <input
              type="time"
              id="startTime"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="duration" className={styles.label}>
              Duration (minutes)
            </label>
            <div className={styles.durationInputGroup}>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, durationMinutes: formData.durationMinutes - 15 })}
                className={styles.durationButton}
                disabled={formData.durationMinutes <= 0}
              >
                -
              </button>
              <input
                type="number"
                id="duration"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                step="15"
                className={styles.durationInput}
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, durationMinutes: formData.durationMinutes + 15 })}
                className={styles.durationButton}
              >
                +
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="note" className={styles.label}>Note (optional)</label>
            <textarea
              id="note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className={styles.textarea}
              rows={3}
              placeholder="What did you work on?"
            />
          </div>

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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Time Entry'}
            </button>
          </div>
        </form>
      </div>
    </BottomSheet>
  );
};
