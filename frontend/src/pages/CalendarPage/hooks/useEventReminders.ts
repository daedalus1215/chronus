import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchEventReminders,
  createEventReminder,
  updateEventReminder,
  deleteEventReminder,
} from '../../../api/requests/calendar-events.requests';
import {
  EventReminderResponseDto,
  CreateEventReminderRequest,
  UpdateEventReminderRequest,
} from '../../../api/dtos/calendar-events.dtos';
import { reminderDB } from '../../../services/indexedDB/reminderDB';
import { useOnlineStatus } from '../../../hooks/useOnlineStatus';
import { CalendarEventResponseDto } from '../../../api/dtos/calendar-events.dtos';

const REMINDERS_QUERY_KEY = (eventId: number) => ['event-reminders', eventId];

/**
 * Hook for managing event reminders.
 * Handles fetching, creating, updating, and deleting reminders.
 * Also manages reminder scheduling and offline sync.
 */
export const useEventReminders = (eventId: number | null, event?: CalendarEventResponseDto) => {
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  const [isLoadingReminders, setIsLoadingReminders] = useState(false);

  // Fetch reminders
  const {
    data: reminders = [],
    isLoading,
    error,
  } = useQuery<EventReminderResponseDto[]>({
    queryKey: REMINDERS_QUERY_KEY(eventId!),
    queryFn: () => fetchEventReminders(eventId!),
    enabled: !!eventId && isOnline,
  });

  // Create reminder mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateEventReminderRequest) =>
      createEventReminder(eventId!, data),
    onSuccess: async (newReminder) => {
      queryClient.setQueryData<EventReminderResponseDto[]>(
        REMINDERS_QUERY_KEY(eventId!),
        (old = []) => [...old, newReminder]
      );

      // Store in IndexedDB for offline access
      await reminderDB.storeReminder(eventId!, newReminder);
    },
  });

  // Update reminder mutation
  const updateMutation = useMutation({
    mutationFn: ({ reminderId, data }: { reminderId: number; data: UpdateEventReminderRequest }) =>
      updateEventReminder(eventId!, reminderId, data),
    onSuccess: async (updatedReminder) => {
      queryClient.setQueryData<EventReminderResponseDto[]>(
        REMINDERS_QUERY_KEY(eventId!),
        (old = []) =>
          old.map(r => (r.id === updatedReminder.id ? updatedReminder : r))
      );

      // Update in IndexedDB
      await reminderDB.removeRemindersForEvent(eventId!);
      await reminderDB.storeReminder(eventId!, updatedReminder);
    },
  });

  // Delete reminder mutation
  const deleteMutation = useMutation({
    mutationFn: (reminderId: number) =>
      deleteEventReminder(eventId!, reminderId),
    onSuccess: async (_, reminderId) => {
      queryClient.setQueryData<EventReminderResponseDto[]>(
        REMINDERS_QUERY_KEY(eventId!),
        (old = []) => old.filter(r => r.id !== reminderId)
      );

      // Remove from IndexedDB
      await reminderDB.removeRemindersForEvent(eventId!);
    },
  });

  // Load reminders from IndexedDB when offline
  useEffect(() => {
    if (!isOnline && eventId) {
      setIsLoadingReminders(true);
      reminderDB
        .getRemindersForEvent(eventId)
        .then(storedReminders => {
          queryClient.setQueryData<EventReminderResponseDto[]>(
            REMINDERS_QUERY_KEY(eventId),
            storedReminders
          );
        })
        .finally(() => setIsLoadingReminders(false));
    }
  }, [isOnline, eventId, queryClient]);


  const createReminder = useCallback(
    async (data: CreateEventReminderRequest) => {
      if (!isOnline) {
        // Store offline
        await reminderDB.addPendingReminder(eventId!, data);
        // Create a temporary reminder for UI
        const tempReminder: EventReminderResponseDto = {
          id: Date.now(), // Temporary ID
          calendarEventId: eventId!,
          reminderMinutes: data.reminderMinutes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        queryClient.setQueryData<EventReminderResponseDto[]>(
          REMINDERS_QUERY_KEY(eventId!),
          (old = []) => [...old, tempReminder]
        );
        return;
      }
      return createMutation.mutateAsync(data);
    },
    [isOnline, eventId, createMutation, queryClient]
  );

  const updateReminder = useCallback(
    async (reminderId: number, data: UpdateEventReminderRequest) => {
      if (!isOnline) {
        // For offline, we'd need to track updates differently
        // For now, just update the local state
        const currentReminders = queryClient.getQueryData<EventReminderResponseDto[]>(
          REMINDERS_QUERY_KEY(eventId!)
        ) || [];
        const updated = currentReminders.map(r =>
          r.id === reminderId
            ? { ...r, reminderMinutes: data.reminderMinutes, updatedAt: new Date().toISOString() }
            : r
        );
        queryClient.setQueryData(REMINDERS_QUERY_KEY(eventId!), updated);
        return;
      }
      return updateMutation.mutateAsync({ reminderId, data });
    },
    [isOnline, eventId, updateMutation, queryClient]
  );

  const removeReminder = useCallback(
    async (reminderId: number) => {
      if (!isOnline) {
        // Remove from local state
        queryClient.setQueryData<EventReminderResponseDto[]>(
          REMINDERS_QUERY_KEY(eventId!),
          (old = []) => old.filter(r => r.id !== reminderId)
        );
        return;
      }
      return deleteMutation.mutateAsync(reminderId);
    },
    [isOnline, eventId, deleteMutation, queryClient]
  );

  return {
    reminders: reminders || [],
    isLoading: isLoading || isLoadingReminders,
    error,
    createReminder,
    updateReminder,
    removeReminder,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
