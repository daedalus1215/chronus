import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

type EditCheckItemDialogProps = {
  isOpen: boolean;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
};

export const EditCheckItemDialog: React.FC<EditCheckItemDialogProps> = ({
  isOpen,
  value,
  onChange,
  onSave,
  onClose,
}) => (
  <Dialog
    open={isOpen}
    onClose={onClose}
    aria-labelledby="edit-checkitem-dialog-title"
    autoFocus
  >
    <DialogContent>
      <TextField
        label="Edit Check Item"
        value={value}
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSave();
          }
        }}
        fullWidth
        variant="standard"
        enterKeyHint="done"
        autoFocus
      />
      <Button
        onClick={onSave}
        variant="contained"
        color="primary"
        sx={{ mt: 2, float: "right" }}
      >
        Save
      </Button>
    </DialogContent>
  </Dialog>
);


