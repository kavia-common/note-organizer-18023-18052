export interface NoteFilter {
  /** Free text search across title/content */
  query: string;
  /** Filter by tags (AND match) */
  tags: string[];
  /** Show only pinned notes */
  pinnedOnly: boolean;
  /** Sort by 'updatedAt' or 'createdAt' or 'title' */
  sortBy: 'updatedAt' | 'createdAt' | 'title';
  /** Sort direction */
  sortDir: 'asc' | 'desc';
}

export const defaultFilter: NoteFilter = {
  query: '',
  tags: [],
  pinnedOnly: false,
  sortBy: 'updatedAt',
  sortDir: 'desc',
};
