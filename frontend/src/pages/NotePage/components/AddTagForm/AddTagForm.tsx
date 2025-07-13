import React, { useState, useRef, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import api from "../../../../api/axios.interceptor";
import { Stack, Tooltip } from "@mui/material";

export type Tag = { id: string; name: string };

export type AddTagFormProps = {
  noteId: number;
  tags: Tag[];
  onTagAdded: () => void;
  onClose: () => void;
};

export const AddTagForm: React.FC<AddTagFormProps> = ({ noteId, tags, onTagAdded, onClose }) => {
  const [newTagName, setNewTagName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTagName(e.target.value);
    setError(null);
  };

  const handleAddTag = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newTagName.trim()) {
      setError("Tag name cannot be empty");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await api.patch(`/notes/${noteId}/add-tag`, { tagName: newTagName, noteId});
      setNewTagName("");
      onTagAdded();
    } catch (err: unknown) {
      let message = "Failed to add tag. Please try again.";
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data &&
        typeof (err.response.data as { message?: unknown }).message === "string"
      ) {
        message = (err.response.data as { message: string }).message;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExistingTag = async (tagId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.patch(`/notes/${noteId}/add-tag`, { tagId, noteId });
      onTagAdded();
    } catch (err: unknown) {
      let message = "Failed to add tag. Please try again.";
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data &&
        typeof (err.response.data as { message?: unknown }).message === "string"
      ) {
        message = (err.response.data as { message: string }).message;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className="flex flex-col h-[90vh] max-h-[90vh]"
      onSubmit={handleAddTag}
      aria-label="Add tag to note"
    >
      <div className="flex items-center gap-2 mb-4">
        <TextField
          inputRef={inputRef}
          value={newTagName}
          onChange={handleInputChange}
          label="New Tag"
          placeholder="Enter tag name"
          variant="outlined"
          size="small"
          className="flex-1"
          autoFocus
          aria-label="New tag name"
          disabled={isLoading}
          onKeyDown={e => {
            if (e.key === "Enter") handleAddTag();
          }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isLoading || !newTagName.trim()}
          aria-label="Add tag"
        >
          {isLoading ? <CircularProgress size={20} /> : "Add"}
        </Button>
        <Button
          onClick={onClose}
          variant="text"
          color="secondary"
          aria-label="Close add tag form"
        >
          Close
        </Button>
      </div>
      {error && <Alert severity="error" className="mb-2">{error}</Alert>}
      <Box className="overflow-y-auto flex-1" aria-label="Tag list">
        <Stack
          role="list"
          direction="row"
          flexWrap="wrap"
          spacing={1} // or spacing={2} for more space
          className="py-2"
          aria-label="Available tags"
        >
          {tags.map(tag => (
            <Tooltip title={tag.name} key={tag.id}>
              <Chip
                role="listitem"
                label={tag.name}
                color="primary"
                variant="outlined"
                tabIndex={0}
                aria-label={`Add tag: ${tag.name}`}
                onClick={() => handleAddExistingTag(tag.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') handleAddExistingTag(tag.id);
                }}
                disabled={isLoading}
                className="cursor-pointer"
              />
            </Tooltip>
          ))}
        </Stack>
      </Box>
    </form>
  );
}; 