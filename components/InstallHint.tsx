"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

type Props = { androidLabel: string; iosLabel: string };
type InstallEvent = Event & { prompt: () => Promise<void> };

function isInstalled() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    !!(navigator as Navigator & { standalone?: boolean }).standalone
  );
}

const noop = () => () => {};
const showIosHint = () => /iphone|ipad|ipod/i.test(navigator.userAgent) && !isInstalled();

export default function InstallHint({ androidLabel, iosLabel }: Props) {
  const ios = useSyncExternalStore(noop, showIosHint, () => false);
  const [evt, setEvt] = useState<InstallEvent | null>(null);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      if (!isInstalled()) setEvt(e as InstallEvent);
    };
    const onInstalled = () => setEvt(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (evt) {
    return (
      <button
        type="button"
        onClick={async () => {
          await evt.prompt();
          setEvt(null);
        }}
        className="mt-3 flex min-h-12 w-full items-center justify-center rounded bg-black px-4 text-base font-semibold text-white"
      >
        {androidLabel}
      </button>
    );
  }

  if (ios) {
    return <p className="mt-3 rounded bg-gray-100 px-4 py-3 text-center text-sm">{iosLabel}</p>;
  }

  return null;
}
