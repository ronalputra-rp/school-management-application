import Modal from "./Modal.jsx";

export default function ConfirmModal({
    title = "Konfirmasi hapus",
    message,
    submitting,
    onConfirm,
    onClose,
}) {
    return (
        <Modal
            title={title}
            onClose={onClose}
            footer={
                <>
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-600 hover:bg-slate-100"
                    >
                        Batal
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={submitting}
                        className="h-10 rounded-lg bg-red-600 px-4 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                        {submitting ? "Menghapus..." : "Hapus"}
                    </button>
                </>
            }
        >
            <p className="text-sm text-slate-600">{message}</p>
        </Modal>
    );
}
