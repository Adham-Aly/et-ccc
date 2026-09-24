"use client";

// lib/read-state — one localStorage key `etccc:read:v1` -> { lessonId: ISODate } (plan §4.8, A9).
// Every access in try/catch; when storage is blocked or cleared the app works the same, minus
// the check marks (no other state, no export/import).
import { useCallback, useSyncExternalStore } from "react";

const KEY = "etccc:read:v1";
type ReadMap = Record<string, string>;

const listeners = new Set<() => void>();
let cache: ReadMap | null = null;
let memory: ReadMap = {};

function read(): ReadMap {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    cache = parsed && typeof parsed === "object" ? (parsed as ReadMap) : {};
  } catch {
    cache = { ...memory };
  }
  return cache;
}

function write(next: ReadMap) {
  cache = next;
  memory = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage blocked: keep the in-memory state for this page view
  }
  for (const l of listeners) l();
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

const EMPTY: ReadMap = {};

export interface ReadState {
  ready: boolean;
  isRead(id: string): boolean;
  readAt(id: string): string | null;
  markRead(id: string): void;
  markUnread(id: string): void;
  all(): ReadMap;
}

export function useReadState(): ReadState {
  const map = useSyncExternalStore(subscribe, read, () => EMPTY);
  const ready = map !== EMPTY;
  const markRead = useCallback(
    (id: string) => write({ ...read(), [id]: new Date().toISOString() }),
    [],
  );
  const markUnread = useCallback((id: string) => {
    const { [id]: _drop, ...rest } = read();
    write(rest);
  }, []);
  return {
    ready,
    isRead: (id) => id in map,
    readAt: (id) => map[id] ?? null,
    markRead,
    markUnread,
    all: () => map,
  };
}
