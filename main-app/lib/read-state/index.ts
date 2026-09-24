"use client";

// lib/read-state — one localStorage key `etccc:read:v1` -> { lessonId: ISODate } (plan §4.8, A9).
// Every access in try/catch; when storage is blocked or cleared the app works the same, minus
// the check marks (no other state, no export/import).
import { useCallback, useSyncExternalStore } from "react";

const KEY = "etccc:read:v1";
type ReadMap = Record<string, string>;

/**
 * Shape-checks whatever `JSON.parse` produced from the stored value: a plain object (not an
 * array, not null) whose every own-enumerable value is a string that parses as a real date.
 * Anything else — an array, a number, `null`, non-string values — is treated as empty rather
 * than trusted, so a corrupted or hand-edited localStorage entry can't desync the read state or
 * (via `id in map`, fixed below to `Object.hasOwn`) leak prototype properties as "read" lessons.
 * Pure and DOM-free so it's directly unit-testable (design-review.md A1-8).
 */
export function parseReadMap(raw: string | null): ReadMap {
  if (!raw) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) return {};
  const out: ReadMap = {};
  for (const key of Object.keys(parsed as Record<string, unknown>)) {
    const value = (parsed as Record<string, unknown>)[key];
    if (typeof value === "string" && !Number.isNaN(Date.parse(value))) {
      out[key] = value;
    }
  }
  return out;
}

const listeners = new Set<() => void>();
let cache: ReadMap | null = null;
let memory: ReadMap = {};

function read(): ReadMap {
  if (cache) return cache;
  try {
    cache = parseReadMap(window.localStorage.getItem(KEY));
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
    isRead: (id) => Object.hasOwn(map, id),
    readAt: (id) => (Object.hasOwn(map, id) ? map[id] : null) ?? null,
    markRead,
    markUnread,
    all: () => map,
  };
}
