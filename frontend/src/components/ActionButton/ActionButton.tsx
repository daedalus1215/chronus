import styles from './ActionButton.module.css';

export const ActionButton = ({
  onClick,
  children,
  label,
  danger,
  disabled,
}: {
  onClick: () => void;
  children: React.ReactNode;
  label: string;
  danger?: boolean;
  disabled?: boolean;
}) => {
  return (
    <button
      onClick={e => {
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      className={styles.actionButton}
      data-variant={danger ? 'danger' : undefined}
    >
      {children}
      <span className={styles.label}>{label}</span>
    </button>
  );
};
