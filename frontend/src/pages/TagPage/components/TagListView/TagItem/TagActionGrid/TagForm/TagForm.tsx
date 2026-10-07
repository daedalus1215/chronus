import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BottomSheet } from '@components/BottomSheet/BottomSheet';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormInitialData) => void;
  initialData?: FormInitialData;
  isSubmitting?: boolean;
  error?: string | null;
};

export type FormInitialData = {
  name: string;
  description: string;
};

export const TagForm: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
  error,
}) => {
  const [formData, setFormData] = useState<FormInitialData>({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      }
    } else {
      // Reset when form closes
      setFormData({
        name: '',
        description: '',
      });
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 p-4"
        onClick={e => {
          // Prevent clicks inside the form from propagating
          e.stopPropagation();
        }}
        onMouseDown={e => {
          // Prevent mouse down events from propagating
          e.stopPropagation();
        }}
      >
        <h3 className="text-lg font-semibold">Edit Tag</h3>
        <div className="space-y-1.5">
          <Label htmlFor="tag-form-title">Title</Label>
          <Input
            id="tag-form-title"
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tag-form-description">Description</Label>
          <Textarea
            id="tag-form-description"
            value={formData.description}
            onChange={e =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
            onClick={e => {
              // Prevent clicks on the text field from propagating
              e.stopPropagation();
            }}
            onMouseDown={e => {
              // Prevent mouse down on the text field from propagating
              e.stopPropagation();
            }}
          />
        </div>
        {error && (
          <Alert
            variant="destructive"
            onClick={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
          >
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onClose();
            }}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            onClick={e => {
              e.stopPropagation();
            }}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
};
