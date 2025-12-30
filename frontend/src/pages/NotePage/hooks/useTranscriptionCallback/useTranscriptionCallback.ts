import { useState, useCallback, useEffect } from 'react';

type UseTranscriptionCallbackReturn = {
  appendToDescriptionFn: ((text: string) => void) | null;
  setAppendToDescriptionFn: (fn: ((text: string) => void) | null) => void;
  onTranscription: (text: string) => void;
};

/**
 * Custom hook that manages the transcription callback chain.
 * 
 * Handles:
 * - Storing the appendToDescription callback from the editor
 * - Providing a wrapper callback that either uses the stored callback
 *   or directly updates the textarea as a fallback
 * - Logging for debugging
 */
export const useTranscriptionCallback = (): UseTranscriptionCallbackReturn => {
  const [appendToDescriptionFn, setAppendToDescriptionFn] = useState<
    ((text: string) => void) | null
  >(null);

  // Wrap setAppendToDescriptionFn to add logging
  const setAppendToDescriptionFnWithLogging = useCallback(
    (fn: ((text: string) => void) | null) => {
      console.log('📝📝📝 NotePage: setAppendToDescriptionFn called!', {
        isFunction: typeof fn === 'function',
        isNull: fn === null,
        isUndefined: fn === undefined,
        fnPreview: fn?.toString().substring(0, 200),
      });
      setAppendToDescriptionFn(fn);
    },
    []
  );

  // Create a wrapper callback that directly updates the textarea if appendToDescriptionFn isn't set
  // This is a fallback to ensure transcriptions don't get lost
  const onTranscription = useCallback(
    (text: string) => {
      console.log('🔵 onTranscriptionCallback called with:', text);
      
      if (appendToDescriptionFn && typeof appendToDescriptionFn === 'function') {
        console.log('✅ Calling appendToDescriptionFn with:', text);
        try {
          appendToDescriptionFn(text);
          console.log('✅ appendToDescriptionFn executed successfully');
          return;
        } catch (err) {
          console.error('❌ Error calling appendToDescriptionFn:', err);
        }
      }
      
      // Fallback: directly update the textarea if callback isn't set
      console.warn('⚠️ appendToDescriptionFn not set, trying direct textarea update');
      const textarea = document.getElementById('note-description') as HTMLTextAreaElement;
      if (textarea) {
        const currentValue = textarea.value || '';
        const separator = currentValue ? ' ' : '';
        const newValue = `${currentValue}${separator}${text.trim()}`;
        console.log('📝 Directly updating textarea:', { currentLength: currentValue.length, newLength: newValue.length });
        
        // Update the textarea value
        textarea.value = newValue;
        
        // Trigger input event to notify React
        const event = new Event('input', { bubbles: true });
        textarea.dispatchEvent(event);
        
        // Also trigger change event
        const changeEvent = new Event('change', { bubbles: true });
        textarea.dispatchEvent(changeEvent);
        
        console.log('✅ Textarea updated directly');
      } else {
        console.error('❌ Textarea not found!');
      }
    },
    [appendToDescriptionFn]
  );

  // Log when appendToDescriptionFn is set
  useEffect(() => {
    console.log('📝 NotePage: appendToDescriptionFn updated', {
      isFunction: typeof appendToDescriptionFn === 'function',
      isNull: appendToDescriptionFn === null,
    });
  }, [appendToDescriptionFn]);

  return {
    appendToDescriptionFn,
    setAppendToDescriptionFn: setAppendToDescriptionFnWithLogging,
    onTranscription,
  };
};

