import React, { useCallback, useEffect, useRef, useState } from 'react';

type ResizablePanelProps = {
  children: React.ReactNode;
  defaultWidth: number;
  minWidth?: number;
  maxWidth?: number;
  onWidthChange?: (width: number) => void;
};

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  defaultWidth,
  minWidth = 200,
  maxWidth = 600,
  onWidthChange,
}) => {
  const [width, setWidth] = useState(defaultWidth);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isDragging.current = true;
      startX.current = e.pageX;
      startWidth.current = width;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [width]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current) return;

      const delta = e.pageX - startX.current;
      const newWidth = Math.max(
        minWidth,
        Math.min(maxWidth, startWidth.current + delta)
      );

      setWidth(newWidth);
      onWidthChange?.(newWidth);
    },
    [maxWidth, minWidth, onWidthChange]
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div className="relative shrink-0" style={{ width }}>
      <div className="h-full overflow-hidden border-r border-border bg-card">
        {children}
      </div>

      {/* Resize Handle */}
      <div
        className="absolute inset-y-0 right-[-4px] w-2 cursor-col-resize bg-transparent hover:bg-accent active:bg-accent"
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};
