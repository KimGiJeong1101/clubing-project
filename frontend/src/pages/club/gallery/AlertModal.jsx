import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const AlertModal = ({ open, handleClose, handleConfirm, title, description, confirmText = "확인", cancelText = "취소" }) => {
  return (
    <AnimatePresence>
      {open && (
        /* 오버레이 */
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ x: "100vw", y: 100 }}
            animate={{
              x: ["100vw", "60vw", "20vw", "0vw", "-50%"],
              y: [1000, -1000, 500, -500, 300, -100, 0],
            }}
            transition={{
              duration: 1.3,
              ease: "easeOut",
              bounce: 0.5,
              stiffness: 500,
              damping: 50,
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] bg-white rounded-2xl shadow-2xl p-8 text-center"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-3">{title}</h2>
            <p className="text-sm text-gray-600 mb-6">{description}</p>

            <div className="flex justify-between gap-3">
              <button onClick={handleConfirm} className="flex-1 py-2 rounded-lg text-sm font-semibold text-white bg-primary-700 hover:bg-primary-600 transition-colors">
                {confirmText}
              </button>
              {cancelText && (
                <button onClick={handleClose} className="flex-1 py-2 rounded-lg text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
                  {cancelText}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AlertModal;
