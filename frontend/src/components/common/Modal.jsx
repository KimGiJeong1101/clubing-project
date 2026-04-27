import React, { useEffect } from "react";
import { FiX } from "react-icons/fi";

function Modal({ open, onClose, title, children, maxWidth = "max-w-md" }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else       document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto z-10`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-nanum-bold text-gray-900">{title}</h2>
            <button onClick={onClose} className="btn-ghost p-1 rounded-full">
              <FiX className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
