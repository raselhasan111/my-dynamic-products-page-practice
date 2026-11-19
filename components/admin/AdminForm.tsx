"use client";

import { useActionState, useEffect, useRef, useState, startTransition } from "react";
import { initialState, type ActionState } from "@/app/admin/state";

type Action = (prev: ActionState, fd: FormData) => Promise<ActionState>;

type Props = {
  id?: string; // present = editing an existing row
  saveAction: Action;
  deleteAction?: Action;
  confirmText?: string;
  saveLabel?: string;
  // Compact row mode (used for products): `fields` sit on one line with the save button,
  // `more` (and the delete button) open under a "⋯" toggle but stay mounted so they are submitted.
  fields?: React.ReactNode;
  more?: React.ReactNode;
  children?: React.ReactNode;
};

// One form per row. Submits through startTransition (not the form's action prop) so that a
// failed save keeps what the admin typed instead of clearing the fields.
export default function AdminForm({ id, saveAction, deleteAction, confirmText, saveLabel = "সেভ", fields, more, children }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLFormElement>(null);
  const [saved, save, saving] = useActionState(saveAction, initialState);
  const [deleted, del, deleting] = useActionState(deleteAction ?? saveAction, initialState);
  const busy = saving || deleting;
  const state = deleted.message ? deleted : saved;

  useEffect(() => {
    if (saved.ok && saved.reset) ref.current?.reset();
  }, [saved]);

  const deleteButton =
    id && deleteAction ? (
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          if (!confirm(confirmText ?? "মুছে ফেলবেন?")) return;
          const fd = new FormData();
          fd.set("id", id);
          startTransition(() => del(fd));
        }}
        className="min-h-11 rounded border border-red-700 px-4 font-semibold text-red-700 disabled:opacity-60"
      >
        {deleting ? "…" : "মুছুন"}
      </button>
    ) : null;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => save(fd));
  };

  if (fields) {
    return (
      <form ref={ref} onSubmit={onSubmit} className="py-2">
        {id && <input type="hidden" name="id" value={id} />}
        {children}
        <div className="flex items-center gap-2">
          {fields}
          <button
            type="submit"
            disabled={busy}
            className="min-h-11 rounded bg-green-700 px-3 font-semibold text-white disabled:opacity-60"
          >
            {saving ? "…" : saveLabel}
          </button>
          {more && (
            <button
              type="button"
              aria-expanded={open}
              aria-label="আরও"
              onClick={() => setOpen((v) => !v)}
              className="min-h-11 min-w-11 rounded border border-gray-400 text-lg leading-none"
            >
              ⋯
            </button>
          )}
        </div>
        <div hidden={!open} className="mt-2 rounded bg-gray-50 p-3">
          {more}
          <div className="mt-3 flex">{deleteButton}</div>
        </div>
        {state.message && (
          <p aria-live="polite" className={`mt-1 text-sm ${state.ok ? "text-green-700" : "text-red-700"}`}>
            {state.message}
          </p>
        )}
      </form>
    );
  }

  return (
    <form ref={ref} onSubmit={onSubmit} className="py-3">
      {id && <input type="hidden" name="id" value={id} />}
      {children}
      <div className="mt-2 flex items-center gap-2">
        <button
          type="submit"
          disabled={busy}
          className="min-h-11 flex-1 rounded bg-green-700 px-4 font-semibold text-white disabled:opacity-60"
        >
          {saving ? "…" : saveLabel}
        </button>
        {deleteButton}
      </div>
      <p aria-live="polite" className={`mt-1 min-h-5 text-sm ${state.ok ? "text-green-700" : "text-red-700"}`}>
        {state.message}
      </p>
    </form>
  );
}
