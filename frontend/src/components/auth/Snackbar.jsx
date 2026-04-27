import { useState, useEffect } from "react";

const severityStyles = {
  success: "bg-green-500 text-white",
  error: "bg-red-500 text-white",
  warning: "bg-yellow-400 text-gray-900",
  info: "bg-blue-500 text-white",
};

const CustomSnackbarWithTimer = ({ open, message, severity = "success", onClose, duration = 5000 }) => {
  const [remaining, setRemaining] = useState(Math.round(duration / 1000));

  useEffect(() => {
    if (!open) {
      setRemaining(Math.round(duration / 1000));
      return;
    }
    const interval = setInterval(() => {
      setRemaining((p) => {
        if (p <= 1) {
          clearInterval(interval);
          onClose?.();
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [open, duration]);

  if (!open) return null;

  return (
    <div className="fixed bottom-6 left-6 z-[500] animate-[fadeIn_0.3s_ease]">
      <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-sm font-nanum ${severityStyles[severity] || severityStyles.success}`}>
        <span>{message}</span>
        <span className="opacity-70 text-xs">({remaining}초)</span>
        <button onClick={onClose} className="ml-1 opacity-70 hover:opacity-100 transition-opacity text-lg leading-none">
          ×
        </button>
      </div>
    </div>
  );
};

export default CustomSnackbarWithTimer;
