// shared/hooks/useCopyToClipboard.ts
import { useState } from "react";

export const useCopyToClipboard = (resetInterval = 2000) => {
  const [isCopied, setIsCopied] = useState(false);

  const copy = async (text: string) => {
    if (!navigator?.clipboard) return false;
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), resetInterval);
      return true;
    } catch {
      setIsCopied(false);
      return false;
    }
  };

  return { isCopied, copy };
};