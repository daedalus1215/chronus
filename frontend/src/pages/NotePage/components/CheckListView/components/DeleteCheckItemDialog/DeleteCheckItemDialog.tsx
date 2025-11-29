import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";

type DeleteCheckItemDialogProps = {
  isOpen: boolean;
  isDeleting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export const DeleteCheckItemDialog: React.FC<DeleteCheckItemDialogProps> = ({
  isOpen,
  isDeleting,
  error,
  onCancel,
  onConfirm,
}) => (
  <Dialog
    open={isOpen}
    onClose={onCancel}
    aria-labelledby="delete-checkitem-dialog-title"
  >
    <DialogTitle id="delete-checkitem-dialog-title">
      Delete Check Item?
    </DialogTitle>
    <DialogContent>
      Are you sure you want to delete this check item? This action cannot be undone.
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel} disabled={isDeleting}>
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        color="error"
        variant="contained"
        disabled={isDeleting}
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </Button>
    </DialogActions>
  </Dialog>
);


