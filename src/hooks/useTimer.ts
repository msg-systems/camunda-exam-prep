import { useEffect, useState } from 'react';

export function useTimer(deadline: number | null) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (deadline === null) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [deadline]);

  if (deadline === null) {
    return { remainingMs: 0, expired: false, formatted: '--:--' };
  }

  const remainingMs = Math.max(0, deadline - now);
  const totalSeconds = Math.floor(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return { remainingMs, expired: remainingMs === 0, formatted };
}
