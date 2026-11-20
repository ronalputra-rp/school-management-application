import { useEffect } from "react";

export default function Modal({ title, description, onClose, children, footer }) {
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
            onMouseDown={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                onMouseDown={(event) => event.stopPropagation()}
                className="w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
            >
                <div className="border-b border-slate-200 px-5 py-4">
                    <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
                    {description && (
                        <p className="mt-1 text-sm text-slate-500">{description}</p>
                    )}
                </div>

                <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>

                {footer && (
                    <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
