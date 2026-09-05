'use client';

import { Dialog, Button } from '@true-tech-team/react-components';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

// Mounted only while the confirmation itself needs to be shown — matches the
// rest of this codebase's `{condition && <Dialog isOpen .../>}` convention.
export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger,
}: ConfirmDialogProps) {
  return (
    <Dialog
      isOpen
      onClose={onCancel}
      onOpenChange={(open) => !open && onCancel()}
      title={title}
      size="sm"
      role="alertdialog"
      actions={
        <>
          <Button variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p>{message}</p>
    </Dialog>
  );
}
