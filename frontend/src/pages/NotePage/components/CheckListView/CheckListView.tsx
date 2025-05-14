import React, { useState } from 'react';
import { useCheckItems } from '../../hooks/useCheckItems';
import styles from './CheckListView.module.css';
import { Note } from '../../api/responses';

type CheckListViewProps = {
  note: Note;
}

export const CheckListView:React.FC<CheckListViewProps> = ({note}) => {
  const [newItem, setNewItem] = useState('');
  const { 
    noteState, 
    error, 
    addItem, 
    toggleItem, 
    deleteItem, 
    updateItem 
  } = useCheckItems(note);

  //@TODO: Let's clean up all these chatty handlers
  
  const handleAdd = async () => {
    if (!newItem.trim()) return;
    try {
      await addItem(newItem.trim());
      // setNewItem('');
    } catch (err) {
      // You might want to show an error toast here
      console.error('Failed to add item:', err);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await toggleItem(id, noteState);
    } catch (err) {
      console.error('Failed to toggle item:', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteItem(id);
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const handleEdit = async (id: number, name: string) => {
    try {
      await updateItem(id, name);
    } catch (err) {
      console.error('Failed to update item:', err);
    }
  };

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <input
          className={styles.addInput}
          type="text"
          placeholder="+ Add Task"
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleAdd();
          }}
        />
        <ul className={styles.list}>
          {noteState.checkItems?.map(item => (
            <li
              key={item.id}
              className={`${styles.listItem} ${item.doneDate ? styles.listItemChecked : ''}`}
            >
              <input
                type="checkbox"
                checked={!!item.doneDate}
                onChange={() => handleToggle(item.id)}
                className={styles.checkbox}
              />
              <input
                type="text"
                value={item.name}
                onChange={e => handleEdit(item.id, e.target.value)}
                className={`${styles.itemInput} ${item.doneDate ? styles.itemInputChecked : ''}`}
              />
              <button
                onClick={() => handleDelete(item.id)}
                aria-label="Delete item"
                className={styles.deleteButton}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};  