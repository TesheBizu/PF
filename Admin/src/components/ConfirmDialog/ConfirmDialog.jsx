import { AlertTriangle } from 'lucide-react';
import './ConfirmDialog.css';

function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel} role="presentation">
      <div
        className="confirm-box"
        onClick={(e) => e.stopPropagation()}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
      >
        <div className={`confirm-box__icon${danger ? ' confirm-box__icon--danger' : ''}`}>
          <AlertTriangle size={22} />
        </div>
        <h3 id="confirm-title" className="confirm-box__title">{title}</h3>
        <p id="confirm-message" className="confirm-box__message">{message}</p>
        <div className="confirm-box__actions">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn${danger ? ' btn-danger' : ' btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
