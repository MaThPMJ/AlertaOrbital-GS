import { useState, useEffect } from 'react';

type Status = 'live' | 'mock';

let current: Status = 'live';
const listeners = new Set<(s: Status) => void>();

export function setApiStatus(status: Status) {
  if (current !== status) {
    current = status;
    listeners.forEach((l) => l(status));
  }
}

export function useApiStatus(): Status {
  const [status, setStatus] = useState<Status>(current);
  useEffect(() => {
    listeners.add(setStatus);
    return () => { listeners.delete(setStatus); };
  }, []);
  return status;
}
