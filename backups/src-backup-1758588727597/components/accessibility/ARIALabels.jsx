// ARIA 標籤組件
import React from 'react';

export const ARIALabel = ({ children, label, describedBy, ...props }) => (
  <div
    role="region"
    aria-label={label}
    aria-describedby={describedBy}
    {...props}
  >
    {children}
  </div>
);

export const ARIALiveRegion = ({ children, level = 'polite', ...props }) => (
  <div
    aria-live={level}
    aria-atomic="true"
    className="sr-only"
    {...props}
  >
    {children}
  </div>
);

export const ARIADescription = ({ id, children, ...props }) => (
  <div
    id={id}
    className="sr-only"
    {...props}
  >
    {children}
  </div>
);

export const ARIAModal = ({ isOpen, onClose, children, title, ...props }) => (
  <div
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    aria-hidden={!isOpen}
    className={`modal ${isOpen ? 'modal-open' : ''}`}
    {...props}
  >
    <div className="modal-content">
      <h2 id="modal-title" className="modal-title">
        {title}
      </h2>
      <button
        className="modal-close"
        aria-label="關閉對話框"
        onClick={onClose}
      >
        ×
      </button>
      {children}
    </div>
  </div>
);
