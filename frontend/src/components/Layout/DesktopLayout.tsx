import React, { useState } from 'react';
import { DesktopSidebar } from '../Header/Sidebar/DesktopSidebar';
import { Toolbar } from '../Header/Toolbar/Toolbar';
import { ResizablePanel } from './ResizablePanel';

type DesktopLayoutProps = {
  noteList: React.ReactNode;
  noteContent?: React.ReactNode;
  onSearch?: (query: string) => void;
  onNewNote?: () => void;
};

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  noteList,
  noteContent,
  onSearch,
  onNewNote,
}) => {
  const [noteListWidth, setNoteListWidth] = useState(300);

  return (
    <div className="flex h-screen bg-card text-foreground">
      {/* Navigation Sidebar */}
      <div className="flex h-screen shrink-0 flex-col overflow-hidden border-r border-border bg-card">
        <DesktopSidebar isOpen={true} />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Toolbar */}
        <div className="z-[1200] shrink-0 bg-card">
          <Toolbar onSearch={onSearch} onNewNote={onNewNote} />
        </div>

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Note List Panel */}
          <ResizablePanel
            defaultWidth={noteListWidth}
            minWidth={250}
            maxWidth={500}
            onWidthChange={setNoteListWidth}
          >
            {noteList}
          </ResizablePanel>

          {/* Note Content Panel */}
          <div className="flex flex-1 flex-col overflow-hidden bg-card">
            {noteContent}
          </div>
        </div>
      </div>
    </div>
  );
};
