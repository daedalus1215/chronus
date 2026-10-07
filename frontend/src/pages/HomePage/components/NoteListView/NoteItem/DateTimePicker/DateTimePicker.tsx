import React, { useState } from 'react';
import { BottomSheet } from '../../../../../../components/BottomSheet/BottomSheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type DateTimePickerProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
  initialDate: Date;
};

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  initialDate,
}) => {
  const [selectedDate, setSelectedDate] = useState(initialDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSelect(selectedDate);
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <div className="p-4">
        <h3 className="mb-4 text-lg font-semibold">Schedule Note</h3>
        <form onSubmit={handleSubmit}>
          <Input
            type="datetime-local"
            value={selectedDate.toISOString().slice(0, 16)}
            onChange={e => setSelectedDate(new Date(e.target.value))}
            className="mb-6 w-full"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button type="submit">Set Schedule</Button>
          </div>
        </form>
      </div>
    </BottomSheet>
  );
};
