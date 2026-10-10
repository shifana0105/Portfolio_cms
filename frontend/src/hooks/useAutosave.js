import { useCallback, useRef, useState } from 'react';

/**
 * Debounced autosave hook. Calls saveFn after `delay` ms of inactivity.
 * Does NOT autosave sensitive/auth data.
 */
export function useAutosave(saveFn, delay = 2000) {
  const [saveStatus, setSaveStatus] = useState(null); // null | 'saving' | 'saved' | 'error'
  const timerRef = useRef(null);

  const triggerSave = useCallback((data) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await saveFn(data);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(null), 2000);
      } catch {
        setSaveStatus('error');
      }
    }, delay);
  }, [saveFn, delay]);

  const cancelSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return { triggerSave, cancelSave, saveStatus };
}
