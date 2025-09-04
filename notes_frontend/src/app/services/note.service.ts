import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Note, createEmptyNote, NoteId } from '../models/note.model';
import { NoteFilter, defaultFilter } from '../models/note-filter.model';

/**
 * PUBLIC_INTERFACE
 * NoteService manages CRUD operations and local state for notes.
 * It is ready to connect to a backend via HTTP by setting BASE_API.
 */
@Injectable({ providedIn: 'root' })
export class NoteService {
  // Configure backend API base via environment variable if present.
  // Do not hardcode URL: expected to be provided using an .env mapped environment.
  private readonly BASE_API = (globalThis as any)?.env?.NOTES_API_URL || '/api';

  private http = inject(HttpClient);

  private notes$ = new BehaviorSubject<Note[]>([]);
  private selectedId$ = new BehaviorSubject<NoteId | null>(null);
  private filter$ = new BehaviorSubject<NoteFilter>({ ...defaultFilter });

  /**
   * PUBLIC_INTERFACE
   * Observable emitting the full notes array.
   */
  get all$(): Observable<Note[]> {
    return this.notes$.asObservable();
  }

  /**
   * PUBLIC_INTERFACE
   * Stream of current filter.
   */
  get filterState$(): Observable<NoteFilter> {
    return this.filter$.asObservable();
  }

  /**
   * PUBLIC_INTERFACE
   * Derived observable for filtered/sorted notes based on current filter.
   */
  get filtered$(): Observable<Note[]> {
    return this.notes$.pipe(
      map((notes) => this.applyFilter(notes, this.filter$.value))
    );
  }

  /**
   * PUBLIC_INTERFACE
   * Selected note as observable.
   */
  get selected$(): Observable<Note | null> {
    return this.notes$.pipe(
      map((notes) => notes.find((n) => n.id === this.selectedId$.value) || null)
    );
  }

  /**
   * PUBLIC_INTERFACE
   * Initialize with optional seed notes.
   */
  init(seed?: Note[]): void {
    if (seed?.length) {
      this.notes$.next(this.sortNotes(seed, this.filter$.value));
      return;
    }
    // Placeholder: fetch from backend when available.
    // this.http.get<Note[]>(`${this.BASE_API}/notes`).subscribe(list => this.notes$.next(list));
    const now = new Date().toISOString();
    const demo: Note[] = [
      createEmptyNote({
        id: this.uuidv4(),
        title: 'Welcome to Notes',
        content:
          'This is your notes app. Use the + New button to create a note, select one from the list to edit.',
        createdAt: now,
        updatedAt: now,
        tags: ['welcome'],
        pinned: true,
      }),
      createEmptyNote({
        id: this.uuidv4(),
        title: 'Search and filter',
        content: 'Try the search box to quickly find notes by title or content.',
        createdAt: now,
        updatedAt: now,
        tags: ['tips'],
      }),
    ];
    this.notes$.next(demo);
  }

  /**
   * PUBLIC_INTERFACE
   * Create a new note and select it.
   */
  create(): Note {
    const newNote = createEmptyNote({ title: 'Untitled note' });
    const updated = [newNote, ...this.notes$.value];
    this.notes$.next(updated);
    this.select(newNote.id);
    // Placeholder for backend:
    // this.http.post<Note>(`${this.BASE_API}/notes`, newNote).subscribe(...)
    return newNote;
  }

  /**
   * PUBLIC_INTERFACE
   * Update an existing note by id.
   */
  update(id: NoteId, patch: Partial<Note>): void {
    const arr = this.notes$.value.slice();
    const idx = arr.findIndex((n) => n.id === id);
    if (idx === -1) return;
    const now = new Date().toISOString();
    const updated = { ...arr[idx], ...patch, updatedAt: now };
    arr[idx] = updated;
    this.notes$.next(this.sortNotes(arr, this.filter$.value));
    // Placeholder for backend:
    // this.http.put<Note>(`${this.BASE_API}/notes/${id}`, updated).subscribe()
  }

  /**
   * PUBLIC_INTERFACE
   * Delete a note by id.
   */
  remove(id: NoteId): void {
    const arr = this.notes$.value.filter((n) => n.id !== id);
    this.notes$.next(arr);
    if (this.selectedId$.value === id) {
      this.selectedId$.next(null);
    }
    // Placeholder for backend:
    // this.http.delete(`${this.BASE_API}/notes/${id}`).subscribe()
  }

  /**
   * PUBLIC_INTERFACE
   * Select a note to edit/view.
   */
  select(id: NoteId | null): void {
    this.selectedId$.next(id);
  }

  /**
   * PUBLIC_INTERFACE
   * Update filter and re-sort list.
   */
  setFilter(partial: Partial<NoteFilter>): void {
    const next = { ...this.filter$.value, ...partial };
    this.filter$.next(next);
    this.notes$.next(this.sortNotes(this.applyFilter(this.notes$.value, next), next));
  }

  private applyFilter(notes: Note[], f: NoteFilter): Note[] {
    let res = notes;
    const q = f.query.trim().toLowerCase();
    if (q) {
      res = res.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q)
      );
    }
    if (f.tags?.length) {
      res = res.filter((n) => (f.tags.every((t) => n.tags?.includes(t))));
    }
    if (f.pinnedOnly) {
      res = res.filter((n) => !!n.pinned);
    }
    return this.sortNotes(res, f);
  }

  private sortNotes(notes: Note[], f: NoteFilter): Note[] {
    const arr = notes.slice().sort((a, b) => {
      let av: string = '';
      let bv: string = '';
      if (f.sortBy === 'title') {
        av = a.title.toLowerCase();
        bv = b.title.toLowerCase();
      } else if (f.sortBy === 'createdAt') {
        av = a.createdAt;
        bv = b.createdAt;
      } else {
        av = a.updatedAt;
        bv = b.updatedAt;
      }
      if (av < bv) return f.sortDir === 'asc' ? -1 : 1;
      if (av > bv) return f.sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    // Ensure pinned appear on top regardless of sort, while maintaining relative order
    const pinned = arr.filter((n) => n.pinned);
    const rest = arr.filter((n) => !n.pinned);
    return [...pinned, ...rest];
  }

  /** Local UUID v4 helper */
  private uuidv4(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.floor(Math.random() * 16);
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
