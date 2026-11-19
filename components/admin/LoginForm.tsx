"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";
import { initialState } from "@/app/admin/state";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, initialState);
  return (
    <form action={action} className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-xl font-bold">অ্যাডমিন লগইন</h1>
      <label htmlFor="code" className="mt-4 block text-sm text-gray-600">
        সিকিউরিটি কোড
      </label>
      <input
        id="code"
        name="code"
        type="password"
        autoComplete="off"
        required
        className="mt-1 h-12 w-full rounded border border-gray-400 px-3 text-base"
      />
      <button
        type="submit"
        disabled={pending}
        className="mt-3 min-h-12 w-full rounded bg-green-700 px-4 font-semibold text-white disabled:opacity-60"
      >
        {pending ? "…" : "লগইন"}
      </button>
      <p aria-live="polite" className="mt-2 min-h-5 text-sm text-red-700">
        {state.ok ? "" : state.message}
      </p>
    </form>
  );
}
