import { FiX, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import '../styles/modal.css';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
  onConfirm,
  onCancel,
}: ConfirmationModalProps) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <FiAlertTriangle />;
      case 'warning':
        return <FiAlertTriangle />;
      default:
        return <FiCheck />;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'danger':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      default:
        return '#1a9c6e';
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-confirmation" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onCancel}>
          <FiX />
        </button>
        <div className="modal-confirmation-icon" style={{ background: `${getIconColor()}15`, color: getIconColor() }}>
          {getIcon()}
        </div>
        <h3 className="modal-confirmation-title">{title}</h3>
        <p className="modal-confirmation-message">{message}</p>
        <div className="modal-confirmation-buttons">
          <button className="modal-btn-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`modal-btn-confirm modal-btn-${type}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};