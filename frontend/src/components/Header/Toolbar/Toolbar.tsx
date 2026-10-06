import React from 'react';
import { Search, Plus, Bold, Italic, List, Code } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type ToolbarProps = {
  onSearch?: (query: string) => void;
  onNewNote?: () => void;
};

export const Toolbar: React.FC<ToolbarProps> = ({ onSearch, onNewNote }) => {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearch?.(event.target.value);
  };

  return (
    <div className="flex items-center gap-2 border-b border-border bg-card p-1">
      {/* Search Bar */}
      <div className="relative max-w-[300px] flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search notes..."
          onChange={handleSearchChange}
          className="h-8 pl-8"
        />
      </div>

      {/* New Note Button */}
      <Button onClick={onNewNote} size="icon">
        <Plus />
      </Button>

      {/* Formatting Tools */}
      <div className="flex gap-1">
        <Button variant="ghost" size="icon-sm">
          <Bold />
        </Button>
        <Button variant="ghost" size="icon-sm">
          <Italic />
        </Button>
        <Button variant="ghost" size="icon-sm">
          <List />
        </Button>
        <Button variant="ghost" size="icon-sm">
          <Code />
        </Button>
      </div>
    </div>
  );
};
