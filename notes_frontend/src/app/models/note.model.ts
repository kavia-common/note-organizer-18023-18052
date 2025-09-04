export type NoteId = string;

/**
 * PUBLIC_INTERFACE
 * Represents a note entity used throughout the app.
 */
export interface Note {
  /** Unique id for the note */
  id: NoteId;
  /** Note title used in lists and search */
  title: string;
  /** Main content of the note (markdown/plain text) */
  content: string;
  /** ISO timestamp string for creation date */
  createdAt: string;
  /** ISO timestamp string for last update */
  updatedAt: string;
  /** Optional tags for future organization */
  tags?: string[];
  /** Pinned note appears top of lists */
  pinned?: boolean;
}

/** Simple UUID v4 generator avoiding dependency on global crypto for lint/build environments. */
function uuidv4(): string {
  // RFC4122 version 4 compliant UUID using random numbers.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Utility to create a new Note object with sensible defaults.
 */
export function createEmptyNote(partial?: Partial<Note>): Note {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    title: '',
    content: '',
    createdAt: now,
    updatedAt: now,
    tags: [],
    pinned: false,
    ...partial,
  };
}
