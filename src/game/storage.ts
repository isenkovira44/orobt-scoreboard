/**
 * Local-only storage behind an interface so a disk backend drops in later without
 * touching a single caller. No network module exists anywhere in this project.
 */
export interface Storage {
  read<T>(key: string, fallback: T): T;
  write<T>(key: string, value: T): void;
  clear(): void;
}

export class MemoryStorage implements Storage {
  private map: Record<string, string> = {};

  read<T>(key: string, fallback: T): T {
    const raw = this.map[key];
    if (raw === undefined) {
      return fallback;
    }
    try {
      return JSON.parse(raw) as T;
    } catch (e) {
      return fallback;
    }
  }

  write<T>(key: string, value: T): void {
    try {
      this.map[key] = JSON.stringify(value);
    } catch (e) {
      // a non-serialisable value is simply not stored
    }
  }

  clear(): void {
    this.map = {};
  }
}

let active: Storage = new MemoryStorage();

export function getStorage(): Storage {
  return active;
}

export function setStorage(next: Storage): void {
  active = next;
}
