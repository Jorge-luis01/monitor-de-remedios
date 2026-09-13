const canUseStorage = (): boolean => typeof window !== 'undefined' && 'localStorage' in window;

const unreadableKeys = new Set<string>();
const failedWriteKeys = new Set<string>();

export function hasStorageErrors(...keys: string[]): boolean {
  const checkedKeys = keys.length > 0
    ? keys
    : [...unreadableKeys, ...failedWriteKeys];
  return checkedKeys.some((key) => unreadableKeys.has(key) || failedWriteKeys.has(key));
}

export function readStorage<T>(key: string, fallback: T, validate?: (value: unknown) => value is T): T {
  if (!canUseStorage()) {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(key);
    if (!value) return fallback;
    const parsed: unknown = JSON.parse(value);
    if (validate && !validate(parsed)) throw new Error('Dados locais inválidos.');
    return parsed as T;
  } catch {
    unreadableKeys.add(key);
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): boolean {
  if (unreadableKeys.has(key)) return false;
  if (!canUseStorage()) {
    failedWriteKeys.add(key);
    return false;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    failedWriteKeys.delete(key);
    return true;
  } catch {
    failedWriteKeys.add(key);
    return false;
  }
}
