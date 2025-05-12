import { useState } from 'react';
import styles from './CheckList.module.css';

type CheckListItem = {
  id: string;
  text: string;
  checked: boolean;
};

const initialItems: CheckListItem[] = [];

export const CheckList = () => {
  const [items, setItems] = useState<CheckListItem[]>(initialItems);
  const [newItem, setNewItem] = useState('');

  const handleAdd = () => {
    if (!newItem.trim()) return;
    setItems([
      ...items,
      { id: crypto.randomUUID(), text: newItem.trim(), checked: false },
    ]);
    setNewItem('');
  };

  const handleToggle = (id: string) => {
    setItems(items =>
      items.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleDelete = (id: string) => {
    setItems(items => items.filter(item => item.id !== id));
  };

  const handleEdit = (id: string, text: string) => {
    setItems(items =>
      items.map(item => (item.id === id ? { ...item, text } : item))
    );
  };

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
          {items.map(item => (
            <li
              key={item.id}
              className={`${styles.listItem} ${item.checked ? styles.listItemChecked : ''}`}
            >
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => handleToggle(item.id)}
                className={styles.checkbox}
              />
              <input
                type="text"
                value={item.text}
                onChange={e => handleEdit(item.id, e.target.value)}
                className={`${styles.itemInput} ${item.checked ? styles.itemInputChecked : ''}`}
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