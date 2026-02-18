type StoragePayload<T> = {
  version: number;
  data: T;
};

/**
 * Lädt DataTable State versioniert aus dem LocalStorage
 */
export function loadTableState<T>(key: string, version: number, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;

    const parsed: StoragePayload<T> = JSON.parse(raw);

    console.log("loadTableState", parsed);

    // ❌ Version mismatch → reset
    if (parsed.version !== version) {
      localStorage.removeItem(key);
      return fallback;
    }

    return parsed.data;
  } catch (err) {
    console.warn("[DataTable] Invalid localStorage state, reset", err);
    localStorage.removeItem(key);
    return fallback;
  }
}

/**
 * Speichert DataTable State versioniert
 */
export function saveTableState<T>(key: string, version: number, data: T) {
  const payload: StoragePayload<T> = {
    version,
    data,
  };

  localStorage.setItem(key, JSON.stringify(payload));
}
