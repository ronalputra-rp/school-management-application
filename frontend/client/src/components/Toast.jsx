import { useEffect } from "react";

export default function Toast({ toast, onClose }) {
    useEffect(() => {
        if (!toast) return undefined;
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [toast, onClose]);

    if (!toast) return null;

    const isError = toast.type === "error";

    return (
        <div
            role="status"
            className={`fixed bottom-5 right-5 z-[60] max-w-sm rounded-lg border px-4 py-3 text-sm shadow-lg ${isError
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
        >
            <div className="flex items-start gap-3">
                <span className="flex-1">{toast.message}</span>
                <button
                    type="button"
                    onClick={onClose}
                    className="text-xs opacity-60 hover:opacity-100"
                    aria-label="Tutup notifikasi"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
