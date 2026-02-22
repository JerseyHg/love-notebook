"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, AlertCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <Check size={16} className="text-green-500" />,
  error: <X size={16} className="text-red-500" />,
  info: <Info size={16} className="text-blue-500" />,
};

const bgColors: Record<ToastType, string> = {
  success: "border-green-200",
  error: "border-red-200",
  info: "border-blue-200",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);

    // 3 秒后自动消失
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}

      {/* Toast 容器 */}
      <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.4 }}
              onClick={() => removeToast(t.id)}
              className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3
                bg-[var(--color-bg-card)] border ${bgColors[t.type]}
                rounded-[var(--radius-lg)] shadow-[var(--shadow-md)]
                cursor-pointer hover:shadow-[var(--shadow-lg)] transition-shadow
                min-w-[200px] max-w-[320px]`}
            >
              <span className="flex-shrink-0">{icons[t.type]}</span>
              <span className="text-sm text-[var(--color-text)]">
                {t.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
