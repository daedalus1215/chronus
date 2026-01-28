/**
 * Utility functions for inserting text into textareas at cursor position.
 * 
 * These functions ensure that speech-to-text transcriptions are inserted
 * at the user's cursor position rather than always appending to the end,
 * providing a more natural editing experience.
 */

type TextInsertionResult = {
  newText: string;
  newCursorPosition: number;
};

/**
 * Inserts text at the current cursor position in a textarea.
 * 
 * This is used for speech-to-text to insert transcribed text where the user
 * is currently editing, not just at the end of the content.
 * 
 * @param currentText - The current text content
 * @param textToInsert - The text to insert (will be trimmed)
 * @param cursorPosition - The current cursor position (selectionStart)
 * @returns Object with the new text and the new cursor position after insertion
 */
export const insertTextAtCursor = (
  currentText: string,
  textToInsert: string,
  cursorPosition: number
): TextInsertionResult => {
  const textBeforeCursor = currentText.substring(0, cursorPosition);
  const textAfterCursor = currentText.substring(cursorPosition);
  
  // Add a space before the new text if there's text before the cursor and it doesn't end with a space
  const separator = textBeforeCursor && !textBeforeCursor.endsWith(' ') ? ' ' : '';
  const trimmedText = textToInsert.trim();
  const newText = `${textBeforeCursor}${separator}${trimmedText}${textAfterCursor}`;
  
  // Calculate new cursor position (after the inserted text)
  const newCursorPosition = cursorPosition + separator.length + trimmedText.length;
  
  return {
    newText,
    newCursorPosition,
  };
};

/**
 * Appends text to the end of the content (legacy behavior).
 * 
 * This is used as a fallback when the textarea cannot be found
 * or cursor position is unavailable.
 * 
 * @param currentText - The current text content
 * @param textToAppend - The text to append (will be trimmed)
 * @returns The new text with appended content
 */
export const appendTextToEnd = (
  currentText: string,
  textToAppend: string
): string => {
  const separator = currentText ? ' ' : '';
  const trimmedText = textToAppend.trim();
  return `${currentText}${separator}${trimmedText}`;
};

/**
 * Validates that text is valid for insertion.
 * 
 * @param text - The text to validate
 * @returns true if the text is valid for insertion
 */
export const isValidTextForInsertion = (text: unknown): text is string => {
  return (
    typeof text === 'string' &&
    text.trim() !== '' &&
    text !== 'undefined' &&
    text !== 'null'
  );
};

/**
 * Inserts text at cursor position in a textarea element and updates the cursor.
 * 
 * This is the main function used for speech-to-text insertion. It handles
 * finding the textarea, getting cursor position, inserting text, and
 * restoring the cursor position after React updates the DOM.
 * 
 * @param textareaId - The ID of the textarea element
 * @param currentText - The current text content
 * @param textToInsert - The text to insert
 * @param onTextChange - Callback to update the text (for React state updates)
 * @returns true if insertion was successful, false otherwise
 */
export const insertTextAtCursorInTextarea = (
  textareaId: string,
  currentText: string,
  textToInsert: string,
  onTextChange: (newText: string) => void
): boolean => {
  const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
  
  if (!textarea) {
    return false;
  }

  const cursorPosition = textarea.selectionStart;
  const { newText, newCursorPosition } = insertTextAtCursor(
    currentText,
    textToInsert,
    cursorPosition
  );

  // Update the text
  onTextChange(newText);

  // Restore cursor position after React updates the DOM
  // Use setTimeout to ensure DOM has updated
  setTimeout(() => {
    const updatedTextarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (updatedTextarea) {
      updatedTextarea.setSelectionRange(newCursorPosition, newCursorPosition);
      updatedTextarea.focus();
    }
  }, 0);

  return true;
};
