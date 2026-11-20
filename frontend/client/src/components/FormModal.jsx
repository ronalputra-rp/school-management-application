import Modal from "./Modal.jsx";

const inputClass =
    "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

function Field({ field, value, onChange }) {
    const common = {
        id: `field-${field.name}`,
        name: field.name,
        value: value ?? "",
        onChange: (event) => onChange(field.name, event.target.value),
        className: inputClass,
        required: field.required,
        placeholder: field.placeholder,
    };

    return (
        <label
            className={`block ${field.type === "textarea" ? "sm:col-span-2" : ""}`}
            htmlFor={common.id}
        >
            <span className="mb-1 block text-xs font-medium text-slate-600">
                {field.label}
                {field.required && <span className="text-red-500"> *</span>}
            </span>

            {field.type === "select" ? (
                <select {...common}>
                    <option value="">{field.placeholder || "Pilih..."}</option>
                    {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            ) : field.type === "textarea" ? (
                <textarea
                    {...common}
                    rows={3}
                    className={`${inputClass} h-auto resize-y py-2`}
                />
            ) : (
                <input {...common} type={field.type || "text"} min={field.min} maxLength={field.maxLength} />
            )}

            {field.hint && (
                <span className="mt-1 block text-xs text-slate-400">{field.hint}</span>
            )}
        </label>
    );
}

export default function FormModal({
    title,
    description,
    fields,
    values,
    error,
    submitting,
    onChange,
    onSubmit,
    onClose,
}) {
    return (
        <Modal
            title={title}
            description={description}
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
                        type="submit"
                        form="entity-form"
                        disabled={submitting}
                        className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {submitting ? "Menyimpan..." : "Simpan"}
                    </button>
                </>
            }
        >
            <form id="entity-form" onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
                {fields.map((field) => (
                    <Field
                        key={field.name}
                        field={field}
                        value={values[field.name]}
                        onChange={onChange}
                    />
                ))}
            </form>

            {error && (
                <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                    {error}
                </p>
            )}
        </Modal>
    );
}
